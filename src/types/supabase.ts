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
  role: 'owner' | 'co owner' | 'manager' | 'cashier' | 'member' | null; // UPDATED: Granular staff roles
};

export type MembershipPlan = {
  id: string; // UUID
  name: string;
  duration_days: number;
  price: number;
  description: string | null;
  created_at: string | null;
  giveaway_item_id: string | null; // NEW: Optional ID of a free inventory item
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

// NEW: Structured data for items in a transaction
export type TransactionItemData = {
    sourceId: string; // Inventory ID or Plan ID
    name: string;
    quantity: number;
    price: number; // Price paid per unit
    type: 'inventory' | 'membership';
    isGiveaway?: boolean;
};

export type Transaction = {
  id: string; // UUID
  member_id: string; // 'GUEST' or member_code
  member_name: string;
  type: 'Membership' | 'POS Sale' | 'Mixed Sale';
  item_description: string | null; // Legacy/Display field
  items_data: TransactionItemData[] | null; // NEW: Structured data for reversal
  amount: number;
  payment_method: 'Card' | 'Cash' | 'Transfer';
  transaction_date: string | null; // Date string
  created_at: string | null;
};