import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/supabase';
import { queryKeys } from './query-keys.ts';
import { addTransaction } from '@/utils/transaction-utils';

// --- Fetch Hooks ---

export const useTransactions = (searchTerm: string = '') => {
  const search = searchTerm.toLowerCase();
  
  return useQuery({
    queryKey: queryKeys.transactions.list(search),
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`member_name.ilike.%${search}%,item_description.ilike.%${search}%`);
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
    mutationFn: (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => addTransaction(newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    },
  });
};