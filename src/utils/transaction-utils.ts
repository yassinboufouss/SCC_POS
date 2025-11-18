import { Transaction, mockTransactions } from "@/data/transactions";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { simulateApiCall } from "./api-simulation";

// Utility to simulate adding a new transaction
export const addTransaction = async (newTransaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const id = `T${(mockTransactions.length + 1).toString().padStart(3, '0')}`; // Mock ID generation
    const transaction: Transaction = {
        ...newTransaction,
        id,
        date: format(new Date(), 'yyyy-MM-dd'), // Ensure date is current
    };
    mockTransactions.unshift(transaction); // Add to the beginning for "recent" view
    console.log("Transaction recorded:", transaction);
    return simulateApiCall(transaction);
};

// Utility to retrieve transactions for a specific member
export const getTransactionsByMemberId = (memberId: string): Transaction[] => {
    // This is a synchronous read operation, no need to simulate API call here unless we fetch all data async
    return mockTransactions
        .filter(tx => tx.memberId === memberId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export interface SalesSummary {
    dailyTotal: number;
    weeklyTotal: number;
    monthlyTotal: number;
}

export const getSalesSummary = (): SalesSummary => {
    // This is a synchronous read operation, no need to simulate API call here unless we fetch all data async
    
    const dailyTransactions = mockTransactions.filter(tx => isToday(new Date(tx.date)));
    // Assuming week starts on Monday (weekStartsOn: 1)
    const weeklyTransactions = mockTransactions.filter(tx => isThisWeek(new Date(tx.date), { weekStartsOn: 1 })); 
    const monthlyTransactions = mockTransactions.filter(tx => isThisMonth(new Date(tx.date)));

    const dailyTotal = dailyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const weeklyTotal = weeklyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const monthlyTotal = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    return {
        dailyTotal,
        weeklyTotal,
        monthlyTotal,
    };
};