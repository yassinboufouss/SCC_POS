import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, TransactionItemData } from '@/types/supabase';
import { recordTransaction as addTransaction } from '@/integrations/supabase/data/use-transactions';

// --- Core Inventory Management Functions ---

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'last_restock' | 'stock'> & { initial_stock: number, image_url?: string | null }) {
    const { initial_stock, ...rest } = item;
    const { data, error } = await supabase
        .from('inventory_items')
        .insert({
            ...rest,
            stock: initial_stock,
            last_restock: new Date().toISOString().substring(0, 10),
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as InventoryItem;
}

export async function updateInventoryItem(item: Partial<InventoryItem> & { id: string }) {
    const { data, error } = await supabase
        .from('inventory_items')
        .update(item)
        .eq('id', item.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as InventoryItem;
}

export async function restockInventoryItem(itemId: string, quantity: number) {
    // 1. Call RPC to increment stock
    const { error: rpcError } = await supabase.rpc('increment_inventory_stock', {
        item_id: itemId,
        quantity_to_increment: quantity,
    });

    if (rpcError) throw new Error(rpcError.message);
    
    // 2. Fetch the updated item manually
    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single();
        
    if (error) throw new Error(error.message);
    return data as InventoryItem;
}

export async function deleteInventoryItem(itemId: string) {
    const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId);

    if (error) throw new Error(error.message);
    return true;
}

// --- Stock Reduction RPC (Used by Giveaway/Checkout) ---

export async function reduceInventoryStock(itemId: string, quantity: number) {
    const { error } = await supabase.rpc('decrement_inventory_stock', {
        item_id: itemId,
        quantity_to_decrement: quantity,
    });

    if (error) throw new Error(error.message);
    return true;
}

// --- Giveaway Logic ---

export async function issueManualGiveaway(memberId: string, memberName: string, item: InventoryItem) {
  try {
    // 1. Reduce stock via RPC
    await reduceInventoryStock(item.id, 1);

    // 2. Record a zero-amount transaction
    await addTransaction({
        member_id: memberId,
        member_name: memberName,
        type: 'POS Sale',
        item_description: `Manual Giveaway: ${item.name}`,
        amount: 0,
        payment_method: 'Cash', // Default to cash for zero-value transaction
        items_data: [{
            sourceId: item.id,
            name: item.name,
            quantity: 1,
            price: 0, // Price paid is 0
            originalPrice: item.price, // Original price for auditing
            type: 'inventory',
            isGiveaway: true,
        }],
        discount_percent: 0,
    });

    // Return success status and item/member details for the calling component to display toast
    return { success: true, item, memberName };
  } catch (error) {
    console.error("Issue giveaway failed:", error);
    throw error;
  }
}