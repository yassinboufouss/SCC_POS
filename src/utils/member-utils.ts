import { Profile, MembershipPlan } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from "date-fns";
import { PaymentMethod } from "@/types/pos"; 
import { v4 as uuidv4 } from 'uuid'; // Import uuid for secure password generation

// Define the expected input structure from the registration form
export type NewMemberInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  planId: string;
  paymentMethod: PaymentMethod;
};

// Define the response structure from the Edge Function
interface RegistrationResponse {
    profile: Profile;
    plan: Pick<MembershipPlan, 'id' | 'name' | 'duration_days' | 'price' | 'giveaway_item_id'>;
}

// Utility to update member data (used internally by other utils)
export const updateProfile = async (updatedProfile: Partial<Profile> & { id: string }): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updatedProfile)
    .eq('id', updatedProfile.id)
    .select()
    .single();

  if (error) {
    console.error("Supabase updateProfile error:", error);
    throw new Error("Failed to update member profile.");
  }
  return data;
};

// Utility to update member status
export const updateMemberStatus = async (profileId: string, newStatus: Profile['status']): Promise<Profile | null> => {
  return updateProfile({ id: profileId, status: newStatus, updated_at: new Date().toISOString() });
};

// Utility to update member role
export const updateMemberRole = async (profileId: string, newRole: Profile['role']): Promise<Profile | null> => {
    // Allow setting any role except 'owner' (which should be reserved for initial setup or SQL)
    if (!newRole || newRole === 'owner') {
        throw new Error("Invalid role assignment attempt.");
    }
    return updateProfile({ id: profileId, role: newRole, updated_at: new Date().toISOString() });
};

// NEW: Utility to register a new user and profile via Edge Function
export const registerNewUserAndProfile = async (newMemberData: Omit<NewMemberInput, 'paymentMethod'>): Promise<RegistrationResponse | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        throw new Error("User must be authenticated to register a new member.");
    }
    
    const REGISTER_FUNCTION_URL = "https://izbuyhpftsehzwnhhjrc.supabase.co/functions/v1/register_member";

    const response = await fetch(REGISTER_FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(newMemberData),
    });
    
    const result = await response.json();

    if (!response.ok || result.error) {
        console.error("Edge Function Registration Error:", result.error);
        throw new Error(result.error || "Failed to register new member via server.");
    }
    
    return result as RegistrationResponse;
};


// Utility to simulate renewing a member's plan (Used by Member Profile Renewal Form)
export const renewMemberPlan = async (profileId: string, planId: string): Promise<{ profile: Profile, plan: Pick<MembershipPlan, 'id' | 'name' | 'duration_days' | 'price'> } | null> => {
  // 1. Call the secure RPC function to handle renewal logic and date calculation
  const { data: renewalResult, error: rpcError } = await supabase.rpc('renew_member_plan_rpc', {
    p_profile_id: profileId,
    p_plan_id: planId,
  });

  if (rpcError) {
    console.error("Supabase renewMemberPlan RPC error:", rpcError);
    throw new Error(rpcError.message || "Failed to renew membership plan via RPC.");
  }
  
  if (!renewalResult || renewalResult.length === 0) {
      throw new Error("Renewal RPC returned no data.");
  }
  
  // 2. Fetch the updated profile and plan details for the client response
  const [{ data: updatedProfile, error: profileError }, { data: planData, error: planError }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', profileId).single(),
    supabase.from('membership_plans').select('id, name, duration_days, price').eq('id', planId).single(),
  ]);

  if (profileError || !updatedProfile) {
    console.error("Member not found after renewal:", profileError);
    throw new Error("Member profile missing after renewal.");
  }
  if (planError || !planData) {
    console.error("Plan not found after renewal:", planError);
    throw new Error("Plan details missing after renewal.");
  }
  
  return { profile: updatedProfile, plan: planData };
};

// Utility to simulate a member check-in
export const processCheckIn = async (profileId: string, currentCheckIns: number): Promise<Profile | null> => {
  const now = new Date();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      last_check_in: now.toISOString(),
      total_check_ins: currentCheckIns + 1,
      updated_at: now.toISOString(),
    })
    .eq('id', profileId)
    .eq('status', 'Active') // Only allow check-in if status is Active
    .select()
    .single();

  if (error) {
    console.error("Supabase CheckIn error:", error);
    throw new Error("Failed to process check-in.");
  }
  
  return data;
};

// Utility to fetch a profile by member code
export const getProfileByMemberCode = async (memberCode: string): Promise<Profile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('member_code', memberCode)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'No rows found'
        console.error("Supabase getProfileByMemberCode error:", error);
        throw new Error("Failed to fetch member by code.");
    }
    
    if (!data) return null;

    const profile = data as Profile;
    
    // Client-side check for expiration status
    if (profile.status === 'Active' && profile.expiration_date) {
        const expirationDate = new Date(profile.expiration_date);
        if (expirationDate.getTime() < new Date().getTime()) {
            return { ...profile, status: 'Expired' as const };
        }
    }
    
    return profile;
};

// NEW: Utility to fetch the full profile for the currently logged-in user
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            // Log error if it's not just 'No rows found'
            if (error.code !== 'PGRST116') {
                console.error("Supabase fetchUserProfile error:", error);
            }
            return null;
        }
        
        return data as Profile | null;
    } catch (e) {
        // Catch network errors or unexpected Supabase client errors (like the 406)
        console.error("Supabase fetchUserProfile critical error:", e);
        return null;
    }
};