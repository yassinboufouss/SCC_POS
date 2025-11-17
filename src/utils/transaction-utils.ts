import { Transaction, mockTransactions } from "@/data/transactions";

export const addTransaction = (newTransaction: Omit<Transaction, 'id'>): Transaction => {
  // Generate a mock ID
  const id = `T${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
  
  const transactionWithId: Transaction = {
    ...newTransaction,
    id,
  };
  
  // Add to the beginning of the mock array to appear immediately in RecentTransactions
  mockTransactions.unshift(transactionWithId);
  
  // Keep the mock array size manageable (e.g., last 20 transactions)
  if (mockTransactions.length > 20) {
    mockTransactions.pop();
  }
  
  return transactionWithId;
};