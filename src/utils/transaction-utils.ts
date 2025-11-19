import { Transaction, TransactionItemData } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isThisWeek, isThisMonth, parseISO, startOfMonth, subMonths } from "date-fns";
import { incrementInventoryStock } from "./inventory-utils"; // Import stock increment utility

// Utility to simulate adding a new transaction
export const addTransaction = async (newTransaction: Omit<Transaction, 'id' | 'created_at' | 'transaction_date' | 'items_data'> & { items_data: TransactionItemData[] }): Promise<Transaction | null> => {
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
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase getTransactionsByMemberId error:", error);
        throw new Error("Failed to fetch member transactions.");
    }
    return data || [];
};

/**
 * Voids a transaction, reverses inventory stock changes, and handles membership reversal (if applicable).
 */
export const voidTransaction = async (transactionId: string): Promise<void> => {
    // 1. Fetch the transaction details before deletion
    const { data: tx, error: fetchError } = await supabase
        .from('transactions')
        .select('item_description, type, items_data') // Fetch items_data
        .eq('id', transactionId)
        .single();

    if (fetchError || !tx) {
        console.error("Supabase voidTransaction fetch error:", fetchError);
        throw new Error("Transaction not found or failed to fetch.");
    }
    
    // 2. Attempt Inventory Reversal (Robust: Use items_data)
    if (tx.items_data && (tx.type === 'POS Sale' || tx.type === 'Mixed Sale')) {
        const inventoryItemsToReverse = tx.items_data.filter(item => item.type === 'inventory' && item.quantity > 0);
        
        if (inventoryItemsToReverse.length > 0) {
            await Promise.all(inventoryItemsToReverse.map(async item => {
                // Use sourceId (Inventory ID) for accurate reversal
                await incrementInventoryStock(item.sourceId, item.quantity);
            }));
        }
    }
    
    // 3. Membership Reversal (Placeholder - too complex for simple implementation)
    if (tx.type === 'Membership' || tx.type === 'Mixed Sale') {
        console.warn(`Transaction ${transactionId} involved membership. Manual membership reversal may be required.`);
    }

    // 4. Delete the transaction
    const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

    if (deleteError) {
        console.error("Supabase voidTransaction delete error:", deleteError);
        throw new Error("Failed to delete transaction.");
    }
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

export interface MonthlySalesData {
    month: string; // e.g., "Jan 24"
    revenue: number;
}

/**
 * Aggregates transactions into monthly revenue data for the last 6 months.
 */
export const aggregateMonthlySales = (transactions: Transaction[]): MonthlySalesData[] => {
    const monthlyData: { [key: string]: number } = {};
    const now = new Date();
    
    // Initialize data points for the last 6 months
    for (let i = 0; i < 6; i++) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthKey = format(monthStart, 'MMM yy');
        monthlyData[monthKey] = 0;
    }

    // Aggregate transactions
    transactions.forEach(tx => {
        if (tx.transaction_date) {
            const txDate = parseISO(tx.transaction_date);
            const monthKey = format(startOfMonth(txDate), 'MMM yy');
            
            if (monthlyData.hasOwnProperty(monthKey)) {
                monthlyData[monthKey] += tx.amount;
            }
        }
    });

    // Convert to array and sort chronologically
    const result = Object.keys(monthlyData).map(month => ({
        month,
        revenue: parseFloat(monthlyData[month].toFixed(2)),
    })).sort((a, b) => {
        // Simple sorting based on month string (e.g., Jan 24 < Feb 24)
        const dateA = parseISO(a.month.replace(' ', ' 1, 20'));
        const dateB = parseISO(b.month.replace(' ', ' 1, 20'));
        return dateA.getTime() - dateB.getTime();
    });
    
    return result;
};