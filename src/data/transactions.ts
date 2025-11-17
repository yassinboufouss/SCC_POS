export type Transaction = {
  id: string;
  memberId: string;
  memberName: string;
  type: 'Membership' | 'POS Sale';
  item: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Card' | 'Cash' | 'Transfer';
};

export const mockTransactions: Transaction[] = [
  {
    id: "T001",
    memberId: "M001",
    memberName: "Alice Johnson",
    type: "Membership",
    item: "Monthly Subscription",
    amount: 99.99,
    date: "2024-10-22",
    paymentMethod: "Card",
  },
  {
    id: "T002",
    memberId: "M005",
    memberName: "David Lee",
    type: "POS Sale",
    item: "Protein Powder (Vanilla), Water Bottle",
    amount: 59.98,
    date: "2024-10-22",
    paymentMethod: "Cash",
  },
  {
    id: "T003",
    memberId: "M002",
    memberName: "Bob Smith",
    type: "Membership",
    item: "Annual Membership",
    amount: 999.99,
    date: "2024-10-21",
    paymentMethod: "Transfer",
  },
  {
    id: "T004",
    memberId: "M010",
    memberName: "Eve Martinez",
    type: "POS Sale",
    item: "Gym Towel (Logo)",
    amount: 9.50,
    date: "2024-10-21",
    paymentMethod: "Card",
  },
  {
    id: "T005",
    memberId: "M015",
    memberName: "Frank Green",
    type: "Membership",
    item: "Daily Pass",
    amount: 10.00,
    date: "2024-10-20",
    paymentMethod: "Cash",
  },
  {
    id: "T006",
    memberId: "M016",
    memberName: "Grace Hall",
    type: "Membership",
    item: "Weekly Access",
    amount: 35.00,
    date: "2024-10-20",
    paymentMethod: "Card",
  },
  {
    id: "T007",
    memberId: "M001",
    memberName: "Alice Johnson",
    type: "POS Sale",
    item: "Pre-Workout Mix",
    amount: 29.99,
    date: "2024-10-19",
    paymentMethod: "Card",
  },
  {
    id: "T008",
    memberId: "M020",
    memberName: "Henry King",
    type: "Membership",
    item: "Monthly Subscription",
    amount: 99.99,
    date: "2024-10-18",
    paymentMethod: "Transfer",
  },
  {
    id: "T009",
    memberId: "M021",
    memberName: "Ivy Lopez",
    type: "POS Sale",
    item: "Protein Powder (Vanilla)",
    amount: 39.99,
    date: "2024-10-18",
    paymentMethod: "Cash",
  },
  {
    id: "T010",
    memberId: "M022",
    memberName: "Jack Miller",
    type: "Membership",
    item: "Annual Membership",
    amount: 999.99,
    date: "2024-10-17",
    paymentMethod: "Card",
  },
];