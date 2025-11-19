import { InventoryItem, MembershipPlan } from "./supabase";

export interface CartItem {
  sourceId: string; // ID of the source item/plan (UUID)
  name: string;
  price: number; // This is the current price (can be overridden)
  originalPrice: number; // NEW: Store the original price for reference
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

// NEW: Secure payload sent to the Edge Function
export interface CheckoutPayload {
    cart: {
        sourceId: string;
        quantity: number;
        type: 'inventory' | 'membership';
        price: number; // Price paid (for discount tracking)
        originalPrice: number; // Original price (for validation)
        isGiveaway?: boolean;
    }[];
    memberId: string | null; // Profile ID or null for guest
    paymentMethod: PaymentMethod;
    discountPercent: number;
    isInitialRegistration: boolean; // Flag if this is the first sale for a newly registered member
}

// NEW: Response from the Edge Function
export interface CheckoutResponse {
    transactionId: string;
    total: number;
    memberId: string;
    memberName: string;
}