import { Profile } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from "date-fns";
import { addTransaction } from "./transaction-utils"; // Import transaction utility
import { PaymentMethod } from "@/types/pos"; // Import PaymentMethod type

// Define the expected input structure from the registration form
export type NewMemberInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  planId: string;
  paymentMethod: PaymentMethod; // Added payment method
};

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

// Utility to simulate updating member status
export const updateMemberStatus = async (profileId: string, newStatus: Profile['status']): Promise<Profile | null> => {
  return updateProfile({ id: profileId, status: newStatus, updated_at: new Date().toISOString() });
};

// Utility to simulate adding a new member (Used by standalone registration and POS registration tab)
export const addMember = async (newMemberData: NewMemberInput): Promise<Profile | null> => {
  const { planId, paymentMethod, ...memberDetails } = newMemberData;
  
  // 1. Fetch plan details
  const { data: planData, error: planError } = await supabase
    .from('membership_plans')
    .select('id, name, duration_days, price')
    .eq('id', planId)
    .single();

  if (planError || !planData) {
    console.error("Plan not found for new member registration:", planError);
    throw new Error("Plan not found.");
  }
  
  // 2. Sign up the user via Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
      email: memberDetails.email,
      password: 'password123', // Mock password for registration flow
      options: {
          data: {
              first_name: memberDetails.first_name,
              last_name: memberDetails.last_name,
          }
      }
  });
  
  if (authError || !authData.user) {
      console.error("Supabase Auth Signup Error:", authError?.message || "Unknown Auth Error");
      throw new Error(authError?.message || "Failed to create user account.");
  }
  
  const userId = authData.user.id;
  
  const startDate = new Date();
  const expirationDate = addDays(startDate, planData.duration_days);
  
  // 3. Update the profile created by the trigger (handle_new_user) with membership details.
  const newProfileData = {
    id: userId,
    first_name: memberDetails.first_name,
    last_name: memberDetails.last_name,
    phone: memberDetails.phone,
    dob: memberDetails.dob,
    plan_name: planData.name,
    status: "Active" as const,
    start_date: format(startDate, 'yyyy-MM-dd'),
    expiration_date: format(expirationDate, 'yyyy-MM-dd'),
    updated_at: new Date().toISOString(),
    email: memberDetails.email,
  };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update(newProfileData)
    .eq('id', userId)
    .select()
    .single();

  if (profileError || !profile) {
    console.error("Supabase Profile Update Error:", profileError);
    throw new Error("Failed to finalize member registration: Profile update failed.");
  }
  
  // 4. Record the initial transaction
  try {
      await addTransaction({
          member_id: profile.member_code || profile.id,
          member_name: `${profile.first_name} ${profile.last_name}`,
          type: 'Membership',
          item_description: `${planData.name} (${planData.duration_days} days)`,
          amount: planData.price,
          payment_method: paymentMethod,
      });
  } catch (txError) {
      console.error("Failed to record initial registration transaction:", txError);
      // Proceed anyway
  }

  return profile;
};


// Utility to simulate renewing a member's plan (Used by POS checkout and Member Profile Renewal Form)
// NOTE: This utility only updates the profile (plan, dates, status). Transaction recording must be handled by the caller.
export const renewMemberPlan = async (profileId: string, planId: string): Promise<Profile | null> => {
  // 1. Fetch current profile and plan details
  const [{ data: profile, error: profileError }, { data: planData, error: planError }] = await Promise.all([
    supabase.from('profiles').select('expiration_date, first_name, last_name, member_code').eq('id', profileId).single(),
    supabase.from('membership_plans').select('name, duration_days, price').eq('id', planId).single(),
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
  
  // NOTE: Transaction recording is handled by the caller (MemberRenewalForm or POSPage)
  
  return updatedProfile;
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