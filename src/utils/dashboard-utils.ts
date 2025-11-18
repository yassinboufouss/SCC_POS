import { mockMembers, Member } from "@/data/members";
import { mockTransactions, Transaction } from "@/data/transactions";
import { inventoryItems, InventoryItem } from "@/data/inventory";
import { isThisMonth, isFuture, differenceInDays, format } from "date-fns";

// Helper to get today's date string for comparison (YYYY-MM-DD)
const todayString = format(new Date(), 'yyyy-MM-dd');

export interface DashboardMetrics {
  totalActiveMembers: number;
  monthlyRevenue: number;
  dailyCheckIns: number;
  lowStockCount: number;
  expiringMemberships: Member[];
  lowStockItems: InventoryItem[];
  recentTransactions: Transaction[];
}

export const getDashboardMetrics = (): DashboardMetrics => {
  const now = new Date();

  // 1. Active Members
  const activeMembers = mockMembers.filter(m => m.status === 'Active');
  const totalActiveMembers = activeMembers.length;

  // 2. Monthly Revenue (MTD)
  const monthlyRevenue = mockTransactions
    .filter(tx => isThisMonth(new Date(tx.date)))
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 3. Daily Check-ins (Mock: count members whose lastCheckIn was today)
  const dailyCheckIns = mockMembers.filter(m => {
    if (!m.lastCheckIn) return false;
    // lastCheckIn format is 'YYYY-MM-DD HH:MM AM/PM'. We only care about the date part.
    const checkInDatePart = m.lastCheckIn.split(' ')[0];
    return checkInDatePart === todayString;
  }).length;

  // 4. Low Stock Items (Stock < 10)
  const lowStockItems = inventoryItems.filter(item => item.stock > 0 && item.stock < 10);
  const lowStockCount = lowStockItems.length;

  // 5. Expiring Memberships (Active members expiring in the next 30 days)
  const expiringMemberships = activeMembers
    .filter(m => {
      const expirationDate = new Date(m.expirationDate);
      if (isFuture(expirationDate)) {
        const daysUntilExpiration = differenceInDays(expirationDate, now);
        return daysUntilExpiration >= 0 && daysUntilExpiration <= 30;
      }
      return false;
    })
    .sort((a, b) => differenceInDays(new Date(a.expirationDate), now) - differenceInDays(new Date(b.expirationDate), now));
    
  // 6. Recent Transactions (Top 5)
  const recentTransactions = [...mockTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);


  return {
    totalActiveMembers,
    monthlyRevenue,
    dailyCheckIns,
    lowStockCount,
    expiringMemberships,
    lowStockItems,
    recentTransactions,
  };
};