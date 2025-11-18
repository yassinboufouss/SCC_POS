import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types/supabase';
import { queryKeys } from './query-keys.ts';
import { addInventoryItem, updateInventoryItem, restockInventoryItem } from '@/utils/inventory-utils';
import { NewInventoryItemInput } from '@/types/pos';

// --- Fetch Hooks ---

export const useInventory = (searchTerm: string = '') => {
  const search = searchTerm.toLowerCase();
  
  return useQuery({
    queryKey: queryKeys.inventory.list(search),
    queryFn: async () => {
      let query = supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (search) {
        query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase fetch inventory error:", error);
        throw new Error("Failed to fetch inventory items.");
      }
      return data as InventoryItem[];
    },
  });
};

// --- Mutation Hooks ---

export const useAddInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newItemData: NewInventoryItemInput & { image_url?: string }) => addInventoryItem(newItemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedItem: Partial<InventoryItem> & { id: string }) => updateInventoryItem(updatedItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    },
  });
};

export const useRestockInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity, currentStock }: { itemId: string, quantity: number, currentStock: number }) => restockInventoryItem(itemId, quantity, currentStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    },
  });
};