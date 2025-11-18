import { InventoryItem, MembershipPlan } from "./supabase";

export interface CartItem {
  sourceId: string; // ID of the source item/plan (UUID)
  name: string;
  price: number;
  quantity: number;
  type: 'inventory' | 'membership';
  stock?: number; 
  imageUrl?: string;
  isGiveaway?: boolean; // NEW: Flag to mark free items
}

export type PaymentMethod = 'Card' | 'Cash' | 'Transfer';

// Utility types for forms
export type NewInventoryItemInput = Omit<InventoryItem, 'id' | 'last_restock' | 'created_at' | 'image_url' | 'stock'> & { 
    initial_stock: number;
    image_url?: string;
};

export type NewPlanInput = Omit<MembershipPlan, 'id' | 'created_at'>;