export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string; // YYYY-MM-DD
  plan: string;
  status: 'Active' | 'Expired' | 'Pending';
  startDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD
  lastCheckIn: string | null; // YYYY-MM-DD HH:MM AM/PM
  totalCheckIns: number;
};

export const mockMembers: Member[] = [
  {
    id: "M001",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    phone: "555-123-4567",
    dob: "1990-05-20",
    plan: "Monthly Subscription",
    status: "Active",
    startDate: "2024-10-01",
    expirationDate: "2024-10-31",
    lastCheckIn: "2024-10-22 07:15 AM",
    totalCheckIns: 15,
  },
  {
    id: "M002",
    name: "Bob Smith",
    email: "bob.s@example.com",
    phone: "555-987-6543",
    dob: "1985-11-10",
    plan: "Annual Membership",
    status: "Active",
    startDate: "2024-01-01",
    expirationDate: "2025-01-01",
    lastCheckIn: "2024-10-22 06:00 PM",
    totalCheckIns: 120,
  },
  {
    id: "M003",
    name: "Charlie Brown",
    email: "charlie.b@example.com",
    phone: "555-555-1212",
    dob: "2000-01-01",
    plan: "Daily Pass",
    status: "Expired",
    startDate: "2024-09-20",
    expirationDate: "2024-09-21",
    lastCheckIn: "2024-09-20 09:00 AM",
    totalCheckIns: 1,
  },
];