import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/supabase';
import { queryKeys } from './query-keys';
import { getTransactionsByMemberId } from '@/utils/transaction-utils';
import { showError, showSuccess, showWarning } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { DateRange } from 'react-day-picker';
import { PaymentMethod } from '@/types/pos';
import { format } from 'date-fns';

// Define the Edge Function URL (Hardcoded Project ID is required for Edge Functions)
const VOID_FUNCTION_URL = "https://izbuyhpftsehzwnhhjrc.supabase.co/functions/v1/void_transaction";

type NewTransaction = Omit<Transaction, 'id' | 'created_at' | 'transaction_date'>;

export async function addTransaction(transaction: NewTransaction) {
    const { data, error } = await supabase
        .from('transactions')
        .insert({
            ...transaction,
            transaction_date: new Date().toISOString().substring(0, 10),
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export const recordTransaction = addTransaction;

// --- Fetch Hooks ---

interface TransactionFilters {
    searchTerm?: string;
    typeFilter?: Transaction['type'] | 'All';
    paymentMethodFilter?: PaymentMethod | 'All';
    dateRange?: { from: Date | undefined, to: Date | undefined };
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
            
            if (typeFilter !== 'All') {
                query = query.eq('type', typeFilter);
            }
            
            if (paymentMethodFilter !== 'All') {
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
        queryFn: () => getTransactionsByMemberId(memberId),
        enabled: !!memberId,
    });
};

// --- Mutation Hooks ---

export const useVoidTransaction = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    
    return useMutation({
        mutationFn: async (transactionId: string) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("User must be authenticated to void a transaction.");
            
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
            
            return result as { success: boolean, requiresManualMembershipReversal: boolean };
        },
        onSuccess: (result, transactionId) => {
            // Invalidate all relevant queries
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
            
            if (result.requiresManualMembershipReversal) {
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