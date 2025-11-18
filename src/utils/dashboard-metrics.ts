import { mockMembers } from "@/data/members";
import { mockTransactions, Transaction } from "@/data/transactions";
import { inventoryItems } from "@/data/inventory";
import { isSameMonth, parseISO } from "date-fns";

export interface DashboardMetrics {
  activeMembers: number;
  monthlyRevenue: number;
  lowStockItems: number;
  expiredMemberships: number;
  monthlyExpenses: number; // New metric
  monthlyProfit: number; // New metric
  profitMargin: number; // New metric
}

export interface RevenueBreakdown {
  type: 'Membership' | 'POS Sale' | 'Mixed Sale';
  amount: number;
}

// Mock fixed expenses for MTD calculation
const MOCK_MONTHLY_EXPENSES = 15000.00;

export const calculateDashboardMetrics = (): DashboardMetrics => {
  const today = new Date();
  
  // 1. Active Members & Expired Memberships
  const activeMembers = mockMembers.filter(m => m.status === 'Active').length;
  const expiredMemberships = mockMembers.filter(m => m.status === 'Expired').length;

  // 2. Monthly Revenue (MTD - Month To Date)
  const monthlyRevenue = mockTransactions
    .filter(tx => isSameMonth(parseISO(tx.date), today))
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  // 3. Financial Calculations
  const monthlyExpenses = MOCK_MONTHLY_EXPENSES;
  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const profitMargin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;

  // 4. Low Stock Items
  const LOW_STOCK_THRESHOLD = 10;
  const lowStockItems = inventoryItems.filter(item => item.stock <= LOW_STOCK_THRESHOLD).length;

  return {
    activeMembers,
    monthlyRevenue,
    lowStockItems,
    expiredMemberships,
    monthlyExpenses,
    monthlyProfit,
    profitMargin,
  };
};

export const calculateMonthlyRevenueBreakdown = (): RevenueBreakdown[] => {
  const today = new Date();
  const monthlyTransactions = mockTransactions.filter(tx => isSameMonth(parseISO(tx.date), today));

  const breakdownMap = monthlyTransactions.reduce((acc, tx) => {
    const type = tx.type;
    acc[type] = (acc[type] || 0) + tx.amount;
    return acc;
  }, {} as Record<Transaction['type'], number>);

  return Object.entries(breakdownMap).map(([type, amount]) => ({
    type: type as Transaction['type'],
    amount,
  }));
};