import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './query-keys.ts';
import { addInventoryItem, updateInventoryItem, restockInventoryItem, deleteInventoryItem, issueManualGiveaway } from '@/utils/inventory-utils';
import { NewInventoryItemInput } from '@/types/pos';
import { InventoryItem } from '@/types/supabase';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

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
    mutationFn: (newItemData: NewInventoryItemInput) => addInventoryItem(newItemData),
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
    mutationFn: ({ itemId, quantity }: { itemId: string, quantity: number }) => restockInventoryItem(itemId, quantity),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
      // Invalidate the specific item detail if needed
      if (data?.id) {
          queryClient.invalidateQueries({ queryKey: queryKeys.inventory.detail(data.id) });
      }
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteInventoryItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    },
  });
};

// Define the expected return type from issueManualGiveaway
type GiveawayResult = { success: boolean, item: InventoryItem, memberName: string };

export function useIssueManualGiveaway() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: ({ memberId, memberName, item }: { memberId: string, memberName: string, item: InventoryItem }) => 
            issueManualGiveaway(memberId, memberName, item) as Promise<GiveawayResult>,
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
            
            if (result.success) {
                toast.success(t("giveaway_issued_success", { item: result.item.name, member: result.memberName }));
            }
        },
        onError: (error) => {
            toast.error(t("giveaway_issued_failed") + `: ${error.message}`);
        }
    });
}