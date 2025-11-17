export type MembershipPlan = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  description: string;
};

export const membershipPlans: MembershipPlan[] = [
  {
    id: "daily",
    name: "Daily Pass",
    durationDays: 1,
    price: 10.00,
    description: "Access for one day.",
  },
  {
    id: "weekly",
    name: "Weekly Access",
    durationDays: 7,
    price: 35.00,
    description: "Full access for one week.",
  },
  {
    id: "monthly",
    name: "Monthly Subscription",
    durationDays: 30,
    price: 99.99,
    description: "Standard monthly gym access.",
  },
  {
    id: "yearly",
    name: "Annual Membership",
    durationDays: 365,
    price: 999.99,
    description: "Best value! Full access for one year.",
  },
];