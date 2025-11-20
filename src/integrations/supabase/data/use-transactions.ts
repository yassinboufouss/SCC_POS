import { supabase } from '@/integrations/supabase/supabase-client';
import { Transaction } from '@/types/supabase';

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