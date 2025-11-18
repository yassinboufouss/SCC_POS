import { Transaction } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";

// Utility to simulate adding a new transaction
export const addTransaction = async (newTransaction: Omit<Transaction, 'id' | 'created_at' | 'transaction_date'>): Promise<Transaction | null> => {
    const transactionData = {
        ...newTransaction,
        transaction_date: format(new Date(), 'yyyy-MM-dd'), // Ensure date is current
    };
    
    const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

    if (error) {
        console.error("Supabase addTransaction error:", error);
        throw new Error("Failed to record transaction.");
    }
    return data;
};

// Utility to retrieve transactions for a specific member (synchronous read from cache/query)
export const getTransactionsByMemberId = async (memberId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('member_id', memberId)
        .order('transaction_date', { ascending: false });

    if (error) {
        console.error("Supabase getTransactionsByMemberId error:", error);
        throw new Error("Failed to fetch member transactions.");
    }
    return data || [];
};

export interface SalesSummary {
    dailyTotal: number;
    weeklyTotal: number;
    monthlyTotal: number;
}

// Utility to calculate sales summary from a list of transactions
export const calculateSalesSummary = (transactions: Transaction[]): SalesSummary => {
    const dailyTransactions = transactions.filter(tx => tx.transaction_date && isToday(new Date(tx.transaction_date)));
    // Assuming week starts on Monday (weekStartsOn: 1)
    const weeklyTransactions = transactions.filter(tx => tx.transaction_date && isThisWeek(new Date(tx.transaction_date), { weekStartsOn: 1 })); 
    const monthlyTransactions = transactions.filter(tx => tx.transaction_date && isThisMonth(new Date(tx.transaction_date)));

    const dailyTotal = dailyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const weeklyTotal = weeklyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const monthlyTotal = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    return {
        dailyTotal,
        weeklyTotal,
        monthlyTotal,
    };
};