/// <reference types="https://deno.land/types/v1.38.0/deno.ns.d.ts" />
/// <reference types="https://esm.sh/@supabase/supabase-js@2.45.0" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Define types for the request body
interface RegistrationPayload {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
    planId: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client using the Service Role Key for elevated permissions
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper to fetch plan details
async function fetchPlanDetails(planId: string) {
    const { data: planData, error: planError } = await supabaseAdmin
        .from('membership_plans')
        .select('id, name, duration_days, price, giveaway_item_id')
        .eq('id', planId)
        .single();

    if (planError || !planData) {
        throw new Error("Plan not found.");
    }
    return planData;
}

// Helper to calculate expiration date
function calculateExpirationDate(durationDays: number, currentExpirationDate?: string | null) {
    const today = new Date();
    let newStartDate = today;
    
    // If membership is still active (expiration date is in the future), start the new plan immediately after the current one ends.
    if (currentExpirationDate) {
        const currentExpiration = new Date(currentExpirationDate);
        if (currentExpiration.getTime() > today.getTime()) {
            // Add 1 day to the current expiration date to get the new start date
            newStartDate = new Date(currentExpiration.getTime() + 24 * 60 * 60 * 1000);
        }
    }
    
    const newExpirationDate = new Date(newStartDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    return {
        start_date: newStartDate.toISOString().substring(0, 10), // YYYY-MM-DD
        expiration_date: newExpirationDate.toISOString().substring(0, 10), // YYYY-MM-DD
    };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // 1. Authentication Check (Ensure user is staff/owner)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), { status: 401, headers: corsHeaders });
  }
  
  // Use the standard Supabase client (not admin) to verify the JWT and get user info
  const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
  );
  
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  
  if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { status: 401, headers: corsHeaders });
  }
  
  // Fetch user profile to check role (Staff/Owner required to register new members)
  const { data: staffProfile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
  const userRole = staffProfile?.role;
  if (!userRole || (userRole !== 'owner' && userRole !== 'manager' && userRole !== 'cashier')) {
      return new Response(JSON.stringify({ error: 'Forbidden: User is not authorized staff to register members' }), { status: 403, headers: corsHeaders });
  }

  // 2. Parse Payload
  let payload: RegistrationPayload;
  try {
    payload = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400, headers: corsHeaders });
  }
  
  const { first_name, last_name, email, phone, dob, planId } = payload;
  
  try {
    // 3. Fetch Plan Details
    const plan = await fetchPlanDetails(planId);
    const { start_date, expiration_date } = calculateExpirationDate(plan.duration_days);
    
    // 4. Sign up the user via Auth (using Service Role Key)
    // We use a secure random password and immediately trigger a reset email.
    const secureRandomPassword = crypto.randomUUID();
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
        email: email,
        password: secureRandomPassword,
        options: {
            data: {
                first_name: first_name,
                last_name: last_name,
            }
        }
    });
    
    if (authError || !authData.user) {
        throw new Error(authError?.message || "Failed to create user account.");
    }
    
    const userId = authData.user.id;
    
    // 5. Update the profile created by the trigger (handle_new_user) with membership details.
    // The trigger handles initial profile creation, we update it here with specific details.
    const newProfileData = {
        id: userId,
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        dob: dob,
        plan_name: plan.name,
        status: "Active" as const,
        start_date: start_date,
        expiration_date: expiration_date,
        updated_at: new Date().toISOString(),
        email: email, // Ensure email is explicitly set on profile
    };

    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(newProfileData)
        .eq('id', userId)
        .select()
        .single();

    if (profileError || !profile) {
        throw new Error(profileError?.message || "Failed to finalize member registration: Profile update failed.");
    }
    
    // 6. Trigger a password reset email for the new user
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`, // Use a generic callback URL
    });
    
    if (resetError) {
        console.warn("Failed to send initial password reset email:", resetError);
        // This is a warning, not a critical failure for the sale
    }

    // 7. Success Response
    return new Response(JSON.stringify({ 
        profile: profile,
        plan: { 
            id: plan.id, 
            name: plan.name, 
            duration_days: plan.duration_days, 
            price: plan.price,
            giveaway_item_id: plan.giveaway_item_id,
        },
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });

  } catch (error) {
    console.error("Registration Edge Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});