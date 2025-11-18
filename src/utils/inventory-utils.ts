import { InventoryItem } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { NewInventoryItemInput } from "@/types/pos";

// Utility to update inventory data
export const updateInventoryItem = async (updatedItem: Partial<InventoryItem> & { id: string }): Promise<InventoryItem | null> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(updatedItem)
    .eq('id', updatedItem.id)
    .select()
    .single();

  if (error) {
    console.error("Supabase updateInventoryItem error:", error);
    throw new Error("Failed to update inventory item.");
  }
  return data;
};

// Utility to simulate adding stock
export const restockInventoryItem = async (itemId: string, quantity: number, currentStock: number): Promise<InventoryItem | null> => {
  const now = format(new Date(), 'yyyy-MM-dd');
  
  const { data, error } = await supabase
    .from('inventory_items')
    .update({
      stock: currentStock + quantity,
      last_restock: now,
      created_at: new Date().toISOString(), // Using created_at as a generic timestamp update field
    })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error("Supabase restockInventoryItem error:", error);
    throw new Error("Failed to restock inventory item.");
  }
  return data;
};

// Utility to simulate adding a new inventory item
export const addInventoryItem = async (newItemData: NewInventoryItemInput & { image_url?: string }): Promise<InventoryItem | null> => {
  const now = format(new Date(), 'yyyy-MM-dd');

  const newItem = {
    name: newItemData.name,
    category: newItemData.category,
    stock: newItemData.initial_stock,
    price: newItemData.price,
    last_restock: now,
    image_url: newItemData.image_url || null,
  };

  const { data, error } = await supabase
    .from('inventory_items')
    .insert(newItem)
    .select()
    .single();

  if (error) {
    console.error("Supabase addInventoryItem error:", error);
    throw new Error("Failed to add new inventory item.");
  }
  return data;
};

// Utility to reduce stock after a POS sale
export const reduceInventoryStock = async (itemId: string, quantity: number): Promise<void> => {
    const { error } = await supabase.rpc('decrement_inventory_stock', {
        item_id: itemId,
        quantity_to_decrement: quantity,
    });

    if (error) {
        console.error("Supabase reduceInventoryStock error:", error);
        throw new Error("Failed to reduce inventory stock.");
    }
};

// Utility to delete an inventory item
export const deleteInventoryItem = async (itemId: string): Promise<void> => {
    const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error("Supabase deleteInventoryItem error:", error);
        throw new Error("Failed to delete inventory item.");
    }
};