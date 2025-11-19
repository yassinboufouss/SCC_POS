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
  // 1. Fetch current profile and plan details
  const [{ data: profile, error: profileError }, { data: planData, error: planError }] = await Promise.all([
    supabase.from('profiles').select('expiration_date, first_name, last_name, member_code').eq('id', profileId).single(),
    supabase.from('membership_plans').select('id, name, duration_days, price').eq('id', planId).single(),
  ]);

  if (profileError || !profile) {
    console.error("Member not found for renewal:", profileError);
    throw new Error("Member not found.");
  }
  if (planError || !planData) {
    console.error("Plan not found for renewal:", planError);
    throw new Error("Plan not found.");
  }

  // 2. Calculate new dates
  const today = new Date();
  const currentExpiration = profile.expiration_date ? new Date(profile.expiration_date) : today;
  
  let newStartDate = today;
  
  // If membership is still active (expiration date is in the future), start the new plan immediately after the current one ends.
  if (currentExpiration.getTime() > today.getTime()) {
      // Add 1 day to the current expiration date to get the new start date
      newStartDate = addDays(currentExpiration, 1);
  }
  
  const newExpirationDate = addDays(newStartDate, planData.duration_days);

  // 3. Update profile
  const updatedProfileData = {
    plan_name: planData.name,
    status: 'Active' as const,
    start_date: format(newStartDate, 'yyyy-MM-dd'),
    expiration_date: format(newExpirationDate, 'yyyy-MM-dd'),
    updated_at: new Date().toISOString(),
  };

  const updatedProfile = await updateProfile({ id: profileId, ...updatedProfileData });
  
  if (!updatedProfile) {
      throw new Error("Failed to update profile during renewal.");
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