import { Member, mockMembers } from "@/data/members";
import { membershipPlans } from "@/data/membership-plans";
import { addDays, format } from "date-fns";
import { simulateApiCall } from "./api-simulation";

// Define the expected input structure from the registration form
export type NewMemberInput = {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  planId: string;
};

// Utility to simulate updating member data
export const updateMember = async (updatedMember: Member): Promise<void> => {
  const index = mockMembers.findIndex(member => member.id === updatedMember.id);
  if (index !== -1) {
    // Simulate updating the item in the mock array
    mockMembers[index] = updatedMember;
    console.log(`Mock Member Updated: ${updatedMember.name}`);
  }
  await simulateApiCall(undefined);
};

// Utility to simulate updating member status
export const updateMemberStatus = async (memberId: string, newStatus: Member['status']): Promise<Member | null> => {
  const member = mockMembers.find(m => m.id === memberId);
  if (!member) {
    console.error("Member not found for status update.");
    return simulateApiCall(null);
  }
  
  const updatedMember: Member = {
    ...member,
    status: newStatus,
  };

  await updateMember(updatedMember);
  return simulateApiCall(updatedMember);
};

// Utility to simulate adding a new member
export const addMember = async (newMemberData: NewMemberInput): Promise<Member | null> => {
  const plan = membershipPlans.find(p => p.id === newMemberData.planId);
  if (!plan) {
    console.error("Plan not found for new member registration.");
    return simulateApiCall(null);
  }
  
  const id = `M${(mockMembers.length + 1).toString().padStart(3, '0')}`; // Mock ID generation
  const startDate = new Date();
  const expirationDate = addDays(startDate, plan.durationDays);

  const newMember: Member = {
    id,
    name: newMemberData.fullName, // Use fullName from input, map to name in Member type
    email: newMemberData.email,
    phone: newMemberData.phone,
    dob: newMemberData.dob,
    plan: plan.name,
    status: "Active",
    startDate: format(startDate, 'yyyy-MM-dd'),
    expirationDate: format(expirationDate, 'yyyy-MM-dd'),
    lastCheckIn: null,
    totalCheckIns: 0,
  };

  mockMembers.push(newMember);
  console.log("Registered Member:", newMember);
  return simulateApiCall(newMember);
};


// Utility to simulate renewing a member's plan
export const renewMemberPlan = async (memberId: string, planId: string): Promise<Member | null> => {
  const member = mockMembers.find(m => m.id === memberId);
  const plan = membershipPlans.find(p => p.id === planId);

  if (!member || !plan) {
    console.error("Member or Plan not found for renewal.");
    return simulateApiCall(null);
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

  await updateMember(updatedMember);
  return simulateApiCall(updatedMember);
};

// Utility to simulate a member check-in
export const processCheckIn = async (memberId: string): Promise<Member | null> => {
  const member = mockMembers.find(m => m.id === memberId);

  if (!member || member.status !== 'Active') {
    return simulateApiCall(null);
  }
  
  const now = new Date();
  const updatedMember: Member = {
    ...member,
    lastCheckIn: format(now, 'yyyy-MM-dd hh:mm a'), // Update check-in time
    totalCheckIns: member.totalCheckIns + 1, // Increment count
  };

  await updateMember(updatedMember);
  return simulateApiCall(updatedMember);
};