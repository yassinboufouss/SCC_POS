import { MembershipPlan, membershipPlans } from "@/data/membership-plans";
import { simulateApiCall } from "./api-simulation";

export type NewPlanInput = Omit<MembershipPlan, 'id'>;

/**
 * Utility to simulate adding a new plan
 */
export const addMembershipPlan = async (newPlanData: NewPlanInput): Promise<MembershipPlan> => {
    const id = `PLAN${(membershipPlans.length + 1).toString().padStart(3, '0')}`; // Mock ID generation
    
    const newPlan: MembershipPlan = {
        ...newPlanData,
        id,
    };

    membershipPlans.push(newPlan);
    console.log("Added Membership Plan:", newPlan);
    return simulateApiCall(newPlan);
};

/**
 * Utility to simulate updating a plan
 */
export const updateMembershipPlan = async (updatedPlan: MembershipPlan): Promise<void> => {
    const index = membershipPlans.findIndex(plan => plan.id === updatedPlan.id);
    if (index !== -1) {
        // Simulate updating the item in the mock array
        membershipPlans[index] = updatedPlan;
        console.log(`Mock Plan Updated: ${updatedPlan.name}`);
    }
    await simulateApiCall(undefined);
};