import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './query-keys.ts';
import { Profile, InventoryItem, Transaction } from '@/types/supabase';
import { isThisMonth, isFuture, differenceInDays, format } from "date-fns";
import { calculateSalesSummary } from '@/utils/transaction-utils';

// Helper to get today's date string for comparison (YYYY-MM-DD)
const todayString = format(new Date(), 'yyyy-MM-dd');

export interface DashboardMetrics {
  totalActiveMembers: number;
  monthlyRevenue: number;
  dailyCheckIns: number;
  lowStockCount: number;
  expiringMemberships: Profile[];
  lowStockItems: InventoryItem[];
  recentTransactions: Transaction[];
  allTransactions: Transaction[]; // NEW: Expose all transactions for charting
  memberStatusDistribution: { active: number, expired: number, pending: number }; 
  // NEW: Monthly Sales Breakdowns
  monthlyInventorySales: number;
  monthlyMembershipSales: number;
}

const fetchDashboardData = async (): Promise<{ profiles: Profile[], inventory: InventoryItem[], transactions: Transaction[] }> => {
    const [
        { data: profiles, error: profilesError },
        { data: inventory, error: inventoryError },
        { data: transactions, error: transactionsError },
    ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('inventory_items').select('*'),
        // Fetch all transactions for local calculation of MTD/Daily/Recent/Chart
        supabase.from('transactions').select('*'), 
    ]);

    if (profilesError || inventoryError || transactionsError) {
        console.error("Dashboard data fetch error:", profilesError || inventoryError || transactionsError);
        throw new Error("Failed to fetch dashboard data.");
    }

    return {
        profiles: profiles as Profile[],
        inventory: inventory as InventoryItem[],
        transactions: transactions as Transaction[],
    };
};

const calculateMetrics = (profiles: Profile[], inventory: InventoryItem[], transactions: Transaction[]): DashboardMetrics => {
    const now = new Date();

    // 1. Active Members (and calculate status distribution)
    let activeCount = 0;
    let expiredCount = 0;
    let pendingCount = 0;
    
    const processedProfiles = profiles.map(profile => {
        let currentStatus = profile.status;
        
        if (currentStatus === 'Active' && profile.expiration_date) {
            const expirationDate = new Date(profile.expiration_date);
            if (!isFuture(expirationDate)) {
                currentStatus = 'Expired' as const;
            }
        }
        
        if (currentStatus === 'Active') activeCount++;
        else if (currentStatus === 'Expired') expiredCount++;
        else pendingCount++;
        
        return { ...profile, status: currentStatus };
    });
    
    const totalActiveMembers = activeCount; // This metric remains the same, based on the calculated status
    
    // FIX: Define activeMembers based on the processed list
    const activeMembers = processedProfiles.filter(p => p.status === 'Active');

    // 2. Monthly Revenue (MTD) and Sales Breakdowns
    const { 
        monthlyTotal: monthlyRevenue, 
        monthlyInventorySales, 
        monthlyMembershipSales 
    } = calculateSalesSummary(transactions);

    // 3. Daily Check-ins
    const dailyCheckIns = profiles.filter(m => {
        if (!m.last_check_in) return false;
        // last_check_in is ISO string (TIMESTAMP WITH TIME ZONE)
        const checkInDate = new Date(m.last_check_in);
        return format(checkInDate, 'yyyy-MM-dd') === todayString;
    }).length;

    // 4. Low Stock Items (Stock < 10)
    const lowStockItems = inventory.filter(item => item.stock > 0 && item.stock < 10);
    const lowStockCount = lowStockItems.length;

    // 5. Expiring Memberships (Active members expiring in the next 30 days)
    const expiringMemberships = activeMembers
        .filter(m => {
            if (!m.expiration_date) return false;
            const expirationDate = new Date(m.expiration_date);
            if (isFuture(expirationDate)) {
                const daysUntilExpiration = differenceInDays(expirationDate, now);
                return daysUntilExpiration >= 0 && daysUntilExpiration <= 30;
            }
            return false;
        })
        .sort((a, b) => {
            const dateA = a.expiration_date ? new Date(a.expiration_date) : now;
            const dateB = b.expiration_date ? new Date(b.expiration_date) : now;
            return differenceInDays(dateA, now) - differenceInDays(dateB, now);
        });
        
    // 6. Recent Transactions (Top 5)
    const recentTransactions = [...transactions].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5);


    return {
        totalActiveMembers,
        monthlyRevenue,
        dailyCheckIns,
        lowStockCount,
        expiringMemberships,
        lowStockItems,
        recentTransactions,
        allTransactions: transactions, // Return the full list
        memberStatusDistribution: { active: activeCount, expired: expiredCount, pending: pendingCount },
        monthlyInventorySales,
        monthlyMembershipSales,
    };
};

export const useDashboardMetrics = () => {
    return useQuery({
        queryKey: queryKeys.dashboard.metrics,
        queryFn: async () => {
            const { profiles, inventory, transactions } = await fetchDashboardData();
            return calculateMetrics(profiles, inventory, transactions);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};