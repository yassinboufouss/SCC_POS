import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionItemData } from '@/types/supabase';
import { queryKeys } from './query-keys.ts';
import { addTransaction } from '@/utils/transaction-utils';
import { PaymentMethod } from '@/types/pos';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { showSuccess, showError, showWarning } from '@/utils/toast';
import { useSession } from '@/components/auth/SessionContextProvider';

// Define the Edge Function URL (Hardcoded Project ID is required for Edge Functions)
const VOID_FUNCTION_URL = "https://izbuyhpftsehzwnhhjrc.supabase.co/functions/v1/void_transaction";

// --- Fetch Hooks ---

interface TransactionFilters {
  searchTerm?: string;
  typeFilter?: Transaction['type'] | 'All';
  paymentMethodFilter?: PaymentMethod | 'All';
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export const useTransactions = (filters: TransactionFilters = {}) => {
  const { searchTerm = '', typeFilter = 'All', paymentMethodFilter = 'All', dateRange } = filters;
  const search = searchTerm.toLowerCase();
  
  return useQuery({
    queryKey: queryKeys.transactions.list(search, typeFilter, paymentMethodFilter, dateRange),
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`member_name.ilike.%${search}%,item_description.ilike.%${search}%`);
      }
      
      if (typeFilter && typeFilter !== 'All') {
        query = query.eq('type', typeFilter);
      }
      
      if (paymentMethodFilter && paymentMethodFilter !== 'All') {
        query = query.eq('payment_method', paymentMethodFilter);
      }
      
      if (dateRange?.from) {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        query = query.gte('transaction_date', fromDate);
      }
      
      if (dateRange?.to) {
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        query = query.lte('transaction_date', toDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase fetch transactions error:", error);
        throw new Error("Failed to fetch transactions.");
      }
      return data as Transaction[];
    },
  });
};

export const useMemberTransactions = (memberId: string) => {
  return useQuery({
    queryKey: queryKeys.transactions.byMember(memberId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase fetch member transactions error:", error);
        throw new Error("Failed to fetch member transactions.");
      }
      return data as Transaction[];
    },
    enabled: !!memberId,
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTransaction: Omit<Transaction, 'id' | 'created_at' | 'transaction_date' | 'items_data'> & { items_data: TransactionItemData[] }) => addTransaction(newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    },
  });
};

// NEW: Hook for voiding a transaction using Edge Function
export const useVoidTransaction = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const { session } = useSession();
    
    const voidTransactionEdge = async (transactionId: string): Promise<boolean> => {
        if (!session) throw new Error("Authentication required to void transaction.");
        
        const response = await fetch(VOID_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ transactionId }),
        });
        
        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.error || t("transaction_void_failed"));
        }
        
        return result.requiresManualMembershipReversal;
    };
    
    return useMutation({
        mutationFn: (transactionId: string) => voidTransactionEdge(transactionId),
        onSuccess: (requiresManualMembershipReversal, transactionId) => {
            // Invalidate all relevant data sources
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all }); // In case membership status was affected
            
            if (requiresManualMembershipReversal) {
                showWarning(t("transaction_void_success_with_warning", { id: transactionId.substring(0, 8) }));
            } else {
                showSuccess(t("transaction_void_success", { id: transactionId.substring(0, 8) }));
            }
        },
        onError: (error) => {
            showError(error.message || t("transaction_void_failed"));
        }
    });
};