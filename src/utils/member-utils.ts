import { Member, mockMembers } from "@/data/members";
import { membershipPlans } from "@/data/membership-plans";
import { addDays, format } from "date-fns";

// Utility to simulate updating member data
export const updateMember = (updatedMember: Member) => {
  const index = mockMembers.findIndex(member => member.id === updatedMember.id);
  if (index !== -1) {
    // Simulate updating the item in the mock array
    mockMembers[index] = updatedMember;
    console.log(`Mock Member Updated: ${updatedMember.name}`);
  }
};

// Utility to simulate renewing a member's plan
export const renewMemberPlan = (memberId: string, planId: string) => {
  const member = mockMembers.find(m => m.id === memberId);
  const plan = membershipPlans.find(p => p.id === planId);

  if (!member || !plan) {
    console.error("Member or Plan not found for renewal.");
    return null;
  }

  // Determine the new start date: either today, or the day after the old expiration date if it's in the future (stacking plans).
  const today = new Date();
  const currentExpiration = new Date(member.expirationDate);
  
  let newStartDate = today;
  
  // If membership is still active (expiration date is in the future), start the new plan immediately after the current one ends.
  if (currentExpiration.getTime() > today.getTime()) {
      newStartDate = addDays(currentExpiration, 1);
  }
  
  const newExpirationDate = addDays(newStartDate, plan.durationDays);

  const updatedMember: Member = {
    ...member,
    plan: plan.name,
    status: 'Active',
    startDate: format(newStartDate, 'yyyy-MM-dd'),
    expirationDate: format(newExpirationDate, 'yyyy-MM-dd'),
  };

  updateMember(updatedMember);
  return updatedMember;
};

// Utility to simulate a member check-in
export const processCheckIn = (memberId: string) => {
  const member = mockMembers.find(m => m.id === memberId);

  if (!member || member.status !== 'Active') {
    return null;
  }
  
  const now = new Date();
  const updatedMember: Member = {
    ...member,
    lastCheckIn: format(now, 'yyyy-MM-dd hh:mm a'), // Update check-in time
    totalCheckIns: member.totalCheckIns + 1, // Increment count
  };

  updateMember(updatedMember);
  return updatedMember;
};