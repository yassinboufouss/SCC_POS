import { supabase } from '@/integrations/supabase/supabase-client';
import { InventoryItem, TransactionItemData } from '@/types/supabase';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { recordTransaction as addTransaction } from '@/integrations/supabase/data/use-transactions';

// Helper to get translation function outside of components
const t = (key: string, options?: any) => {
    // This is a simplified placeholder. In a real app, you'd use a global i18n instance or context.
    const { t: i18n_t } = useTranslation();
    return i18n_t(key, options);
};

// --- Core Inventory Management Functions ---

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'last_restock'> & { initial_stock: number }) {
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
    const { data, error } = await supabase.rpc('increment_inventory_stock', {
        item_id: itemId,
        quantity_to_increment: quantity,
    }).select().single();

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
        }] as TransactionItemData[],
        discount_percent: 0,
    });

    toast.success(t("giveaway_issued_success", { item: item.name, member: memberName }));
  } catch (error) {
    console.error("Issue giveaway failed:", error);
    toast.error(t("giveaway_issued_failed"));
    throw error;
  }
}