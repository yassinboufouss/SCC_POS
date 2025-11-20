import { Transaction, TransactionItemData } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isThisWeek, isThisMonth, parseISO, startOfMonth, subMonths } from "date-fns";
// Removed: import { incrementInventoryStock } from "./inventory-utils"; 

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
 * NOTE: This function is now implemented via the Edge Function /void_transaction.
 * @returns boolean True if manual membership reversal is required.
 */
// Removed client-side voidTransaction implementation

export interface SalesSummary {
    dailyTotal: number;
    weeklyTotal: number;
    monthlyTotal: number;
    dailyTransactions: Transaction[];
    monthlyInventorySales: number;
    monthlyMembershipSales: number;
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
    
    // NEW: Calculate monthly breakdowns by item type
    let monthlyInventorySales = 0;
    let monthlyMembershipSales = 0;
    
    monthlyTransactions.forEach(tx => {
        if (tx.items_data) {
            // Calculate the raw subtotal for the transaction (excluding giveaways, which have price 0)
            const payableItems = tx.items_data.filter(item => !item.isGiveaway && item.price > 0);
            const rawTxSubtotal = payableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            
            // If the transaction amount is 0 (e.g., pure giveaway sale), skip proportional calculation.
            if (rawTxSubtotal === 0) {
                return;
            }
            
            // Distribute the final transaction amount (tx.amount) proportionally
            payableItems.forEach(item => {
                const itemRawValue = item.price * item.quantity;
                // Proportional revenue calculation: (Item's raw value / Total raw subtotal) * Final transaction amount
                const proportionalRevenue = (itemRawValue / rawTxSubtotal) * tx.amount;
                
                if (item.type === 'membership') {
                    monthlyMembershipSales += proportionalRevenue;
                } else if (item.type === 'inventory') {
                    monthlyInventorySales += proportionalRevenue;
                }
            });
        } else {
            // Fallback for transactions without items_data (less accurate)
            if (tx.type === 'Membership') {
                monthlyMembershipSales += tx.amount;
            } else if (tx.type === 'POS Sale') {
                monthlyInventorySales += tx.amount;
            } else if (tx.type === 'Mixed Sale') {
                // Split 50/50 as a guess for mixed sales without detailed data
                monthlyMembershipSales += tx.amount / 2;
                monthlyInventorySales += tx.amount / 2;
            }
        }
    });
    
    // Round to 2 decimal places
    monthlyInventorySales = parseFloat(monthlyInventorySales.toFixed(2));
    monthlyMembershipSales = parseFloat(monthlyMembershipSales.toFixed(2));


    return {
        dailyTotal,
        weeklyTotal,
        monthlyTotal,
        dailyTransactions, // Return the list
        monthlyInventorySales,
        monthlyMembershipSales,
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