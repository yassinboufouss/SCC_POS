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

// ... (rest of the file omitted)