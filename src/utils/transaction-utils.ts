import { Transaction, mockTransactions } from "@/data/transactions";
import { format } from "date-fns";

// Utility to simulate adding a new transaction
export const addTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const id = `T${(mockTransactions.length + 1).toString().padStart(3, '0')}`; // Mock ID generation
    const transaction: Transaction = {
        ...newTransaction,
        id,
        date: format(new Date(), 'yyyy-MM-dd'), // Ensure date is current
    };
    mockTransactions.unshift(transaction); // Add to the beginning for "recent" view
    console.log("Transaction recorded:", transaction);
    return transaction;
};

// Utility to retrieve transactions for a specific member
export const getTransactionsByMemberId = (memberId: string): Transaction[] => {
    // In a real app, this would query a database. Here we filter the mock array.
    return mockTransactions
        .filter(tx => tx.memberId === memberId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};