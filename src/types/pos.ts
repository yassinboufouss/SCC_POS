export interface CartItem {
  sourceId: string; // ID of the source item/plan
  name: string;
  price: number;
  quantity: number;
  type: 'inventory' | 'membership';
  stock?: number; 
  imageUrl?: string;
}

export type PaymentMethod = 'Card' | 'Cash' | 'Transfer';