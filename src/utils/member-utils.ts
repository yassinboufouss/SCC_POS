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
  
  // The RPC returns: [{ profile_id: UUID, plan_name: TEXT, expiration_date: DATE }]
  const rpcData = renewalResult[0];

  // 2. Fetch the updated profile and plan details for the client response
  const [profileResult, planResult] = await Promise.all([
    // Fetch the full profile to ensure the client has the latest data (including status, check-ins, etc.)
    supabase.from('profiles').select('*').eq('id', profileId).single(),
    // Fetch minimal plan data
    supabase.from('membership_plans').select('id, name, duration_days, price').eq('id', planId).single(),
  ]);
  
  let updatedProfile = profileResult.data as Profile | null;
  const profileError = profileResult.error;
  const planData = planResult.data;
  const planError = planResult.error;


  if (profileError || !updatedProfile) {
    console.error("Member not found after renewal:", profileError);
    // If profile fetch fails, construct a minimal profile using RPC data to avoid throwing
    const minimalProfile: Profile = {
        id: profileId,
        first_name: null, last_name: null, avatar_url: null, updated_at: null, member_code: null, phone: null, dob: null,
        plan_name: rpcData.plan_name,
        status: 'Active',
        start_date: null, // Cannot determine start date easily here
        expiration_date: rpcData.expiration_date,
        last_check_in: null, total_check_ins: 0, email: null, role: 'member',
    };
    updatedProfile = minimalProfile;
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

/**
 * Uploads an avatar file to Supabase Storage and returns the public URL.
 * Also updates the user's profile with the new URL.
 * @param userId The ID of the user (profile).
 * @param file The file object to upload.
 * @param currentAvatarUrl Optional: The current avatar URL to delete the old file.
 * @returns The new public URL of the avatar.
 */
export const uploadAvatar = async (userId: string, file: File, currentAvatarUrl: string | null): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // 1. Upload the new file
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error("Failed to upload avatar.");
    }
    
    // 2. Get the public URL
    const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
    const newAvatarUrl = publicUrlData.publicUrl;

    // 3. Update the profile table
    await updateProfile({ id: userId, avatar_url: newAvatarUrl });
    
    // 4. (Optional) Delete the old file if it exists and is different
    if (currentAvatarUrl && currentAvatarUrl !== newAvatarUrl) {
        // Extract the path from the URL (e.g., 'avatars/user_id/filename.ext')
        const oldPathMatch = currentAvatarUrl.match(/avatars\/(.*)/);
        if (oldPathMatch && oldPathMatch[1]) {
            const oldFilePath = oldPathMatch[1];
            // Note: Supabase delete requires the path relative to the bucket root (e.g., 'user_id/filename.ext')
            const { error: deleteError } = await supabase.storage
                .from('avatars')
                .remove([oldFilePath]);
            
            if (deleteError) {
                console.warn("Failed to delete old avatar:", deleteError);
            }
        }
    }

    return newAvatarUrl;
};

/**
 * Removes the avatar URL from the profile and deletes the file from storage.
 * @param userId The ID of the user (profile).
 * @param currentAvatarUrl The current avatar URL.
 */
export const deleteAvatar = async (userId: string, currentAvatarUrl: string | null): Promise<void> => {
    if (!currentAvatarUrl) return;

    // 1. Remove the URL from the profile table
    await updateProfile({ id: userId, avatar_url: null });

    // 2. Delete the file from storage
    const oldPathMatch = currentAvatarUrl.match(/avatars\/(.*)/);
    if (oldPathMatch && oldPathMatch[1]) {
        const oldFilePath = oldPathMatch[1];
        const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([oldFilePath]);
        
        if (deleteError) {
            console.error("Failed to delete avatar file:", deleteError);
            throw new Error("Failed to delete avatar file.");
        }
    }
};