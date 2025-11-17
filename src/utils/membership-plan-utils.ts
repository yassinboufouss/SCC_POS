import { MembershipPlan, membershipPlans } from "@/data/membership-plans";

// Utility to simulate updating membership plan data
export const updateMembershipPlan = (updatedPlan: MembershipPlan) => {
  const index = membershipPlans.findIndex(plan => plan.id === updatedPlan.id);
  if (index !== -1) {
    // Simulate updating the item in the mock array
    membershipPlans[index] = updatedPlan;
    console.log(`Mock Membership Plan Updated: ${updatedPlan.name}`);
  }
};