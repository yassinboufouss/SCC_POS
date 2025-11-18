export type Transaction = {
  id: string;
  memberId: string; // 'GUEST' if not a member
  memberName: string;
  type: 'Membership' | 'POS Sale' | 'Mixed Sale';
  item: string; // Description of items sold
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Card' | 'Cash' | 'Transfer';
};

export const mockTransactions: Transaction[] = [
  {
    id: "T001",
    memberId: "M001",
    memberName: "Alice Johnson",
    type: "POS Sale",
    item: "Protein Powder (Vanilla) x1",
    amount: 39.99,
    date: "2024-10-21",
    paymentMethod: "Card",
  },
  {
    id: "T002",
    memberId: "M002",
    memberName: "Bob Smith",
    type: "Membership",
    item: "Annual Membership x1",
    amount: 999.99,
    date: "2024-01-01",
    paymentMethod: "Transfer",
  },
  {
    id: "T003",
    memberId: "GUEST",
    memberName: "Guest Customer",
    type: "POS Sale",
    item: "Water Bottle (Insulated) x1, Gym Towel (Logo) x2",
    amount: 38.99,
    date: "2024-10-22",
    paymentMethod: "Cash",
  },
];