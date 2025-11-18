import { MembershipPlan } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { NewPlanInput } from "@/types/pos";

/**
 * Utility to simulate adding a new plan
 */
export const addMembershipPlan = async (newPlanData: NewPlanInput): Promise<MembershipPlan | null> => {
    const { data, error } = await supabase
        .from('membership_plans')
        .insert(newPlanData)
        .select()
        .single();

    if (error) {
        console.error("Supabase addMembershipPlan error:", error);
        throw new Error("Failed to add new membership plan.");
    }
    return data;
};

/**
 * Utility to simulate updating a plan
 */
export const updateMembershipPlan = async (updatedPlan: Partial<MembershipPlan> & { id: string }): Promise<MembershipPlan | null> => {
    const { data, error } = await supabase
        .from('membership_plans')
        .update(updatedPlan)
        .eq('id', updatedPlan.id)
        .select()
        .single();

    if (error) {
        console.error("Supabase updateMembershipPlan error:", error);
        throw new Error("Failed to update membership plan.");
    }
    return data;
};