import { Member, mockMembers } from "@/data/members";
import { membershipPlans } from "@/data/membership-plans";
import { addDays, format, isBefore, parseISO } from "date-fns";

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

// Utility to get members whose plans expire soon (e.g., within the next 30 days)
export const getExpiringMembers = (daysThreshold: number = 30): Member[] => {
    const today = new Date();
    const thresholdDate = addDays(today, daysThreshold);
    
    return mockMembers
        .filter(member => member.status === 'Active')
        .filter(member => {
            const expiration = parseISO(member.expirationDate);
            // Check if expiration is in the future AND before the threshold date
            return isBefore(expiration, thresholdDate) && isBefore(today, expiration);
        })
        .sort((a, b) => parseISO(a.expirationDate).getTime() - parseISO(b.expirationDate).getTime());
};

// Utility to simulate freezing a member's plan
export const freezeMemberPlan = (memberId: string) => {
  const member = mockMembers.find(m => m.id === memberId);

  if (!member) {
    console.error("Member not found for freezing.");
    return null;
  }

  const updatedMember: Member = {
    ...member,
    status: 'Pending', // Using 'Pending' to represent a frozen state
    // In a real system, we would calculate the freeze duration and adjust expiration date
  };

  updateMember(updatedMember);
  return updatedMember;
};

// Utility to simulate canceling a member's plan
export const cancelMemberPlan = (memberId: string) => {
  const member = mockMembers.find(m => m.id === memberId);

  if (!member) {
    console.error("Member not found for cancellation.");
    return null;
  }

  const updatedMember: Member = {
    ...member,
    status: 'Expired', // Using 'Expired' immediately upon cancellation
    expirationDate: format(new Date(), 'yyyy-MM-dd'), // Set expiration to today
  };

  updateMember(updatedMember);
  return updatedMember;
};