import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase-client';
import { queryKeys } from './query-keys.ts';
import { addInventoryItem, updateInventoryItem, restockInventoryItem, deleteInventoryItem, issueManualGiveaway } from '@/utils/inventory-utils';
import { NewInventoryItemInput } from '@/types/pos';
import { InventoryItem } from '@/types/supabase';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// ... (omitted code)

export function useIssueManualGiveaway() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: ({ memberId, memberName, item }: { memberId: string, memberName: string, item: InventoryItem }) => 
            issueManualGiveaway(memberId, memberName, item),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
        },
        onError: (error) => {
            toast.error(t("giveaway_issued_failed") + `: ${error.message}`);
        }
    });
}

// ... (omitted code)