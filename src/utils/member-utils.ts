import { Member, mockMembers } from "@/data/members";

// Utility to simulate updating member data
export const updateMember = (updatedMember: Member) => {
  const index = mockMembers.findIndex(member => member.id === updatedMember.id);
  if (index !== -1) {
    // Simulate updating the item in the mock array
    mockMembers[index] = updatedMember;
    console.log(`Mock Member Updated: ${updatedMember.name}`);
  }
};