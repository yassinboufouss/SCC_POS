import { mockMembers } from "@/data/members";
import { mockTransactions } from "@/data/transactions";
import { inventoryItems } from "@/data/inventory";
import { isSameMonth, parseISO } from "date-fns";

export interface DashboardMetrics {
  activeMembers: number;
  monthlyRevenue: number;
  lowStockItems: number;
  expiredMemberships: number;
}

export const calculateDashboardMetrics = (): DashboardMetrics => {
  const today = new Date();
  
  // 1. Active Members & Expired Memberships
  const activeMembers = mockMembers.filter(m => m.status === 'Active').length;
  const expiredMemberships = mockMembers.filter(m => m.status === 'Expired').length;

  // 2. Monthly Revenue (MTD - Month To Date)
  const monthlyRevenue = mockTransactions
    .filter(tx => isSameMonth(parseISO(tx.date), today))
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 3. Low Stock Items
  const LOW_STOCK_THRESHOLD = 10;
  const lowStockItems = inventoryItems.filter(item => item.stock <= LOW_STOCK_THRESHOLD).length;

  // 4. Daily Check-ins (This metric is usually real-time, but we'll mock a simple count for now)
  // Since we don't have a dedicated check-in log, we'll use a fixed mock value for the dashboard component itself.

  return {
    activeMembers,
    monthlyRevenue,
    lowStockItems,
    expiredMemberships,
  };
};