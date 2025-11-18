export type Profile = {
  id: string; // UUID REFERENCES auth.users(id)
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  member_code: string | null; // M001
  phone: string | null;
  dob: string | null; // YYYY-MM-DD
  plan_name: string | null;
  status: 'Active' | 'Expired' | 'Pending' | null;
  start_date: string | null; // YYYY-MM-DD
  expiration_date: string | null; // YYYY-MM-DD
  last_check_in: string | null; // TIMESTAMP WITH TIME ZONE
  total_check_ins: number | null;
  email: string | null; // Added email field
};

export type MembershipPlan = {
  id: string; // UUID
  name: string;
  duration_days: number;
  price: number;
  description: string | null;
  created_at: string | null;
};

export type InventoryItem = {
  id: string; // UUID
  name: string;
  category: 'Apparel' | 'Supplements' | 'Equipment';
  stock: number;
  price: number;
  last_restock: string | null; // Date string
  image_url: string | null;
  created_at: string | null;
};

export type Transaction = {
  id: string; // UUID
  member_id: string; // 'GUEST' or member_code
  member_name: string;
  type: 'Membership' | 'POS Sale' | 'Mixed Sale';
  item_description: string | null;
  amount: number;
  payment_method: 'Card' | 'Cash' | 'Transfer';
  transaction_date: string | null; // Date string
  created_at: string | null;
};