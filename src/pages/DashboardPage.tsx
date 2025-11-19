import React from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Users, DollarSign, Package, QrCode, LucideIcon } from 'lucide-react';
import DashboardMetricCard from '@/components/dashboard/DashboardMetricCard';
import ExpiringMemberships from '@/components/dashboard/ExpiringMemberships';
import LowStockAlerts from '@/components/dashboard/LowStockAlerts';
import RecentTransactionsTable from '@/components/dashboard/RecentTransactionsTable';
import MonthlySalesChart from '@/components/dashboard/MonthlySalesChart';
import { useDashboardMetrics } from '@/integrations/supabase/data/use-dashboard-metrics.ts';
import { formatCurrency } from '@/utils/currency-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { aggregateMonthlySales } from '@/utils/transaction-utils';
import { cn } from '@/lib/utils'; // Import cn utility

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  
  const { data: metrics, isLoading, isError } = useDashboardMetrics();

  if (isError) {
    return (
        <Layout>
            <div className="p-4 lg:p-6 text-center text-red-500">
                {t("error_fetching_dashboard_data")}
            </div>
        </Layout>
    );
  }

  const defaultMetrics = {
    totalActiveMembers: 0,
    monthlyRevenue: 0,
    dailyCheckIns: 0,
    lowStockCount: 0,
    expiringMemberships: [],
    lowStockItems: [],
    recentTransactions: [],
    allTransactions: [], // Default for safety
  };
  
  const currentMetrics = metrics || defaultMetrics;
  
  // Calculate chart data using the full transaction list
  const monthlySalesData = currentMetrics.allTransactions ? aggregateMonthlySales(currentMetrics.allTransactions) : [];


  const renderMetricCard = (titleKey: string, value: React.ReactNode, icon: LucideIcon, descriptionKey: string, isAlert = false, delay: number) => (
    <div className={cn("animate-fade-in-up")} style={{ animationDelay: `${delay * 100}ms` }}>
        <DashboardMetricCard
          title={t(titleKey)}
          value={isLoading ? <Skeleton className="h-8 w-20" /> : value}
          icon={icon}
          description={t(descriptionKey)}
          className={isAlert && currentMetrics.lowStockCount > 0 ? "border-red-500 shadow-md" : ""}
        />
    </div>
  );

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-8"> {/* Increased vertical spacing */}
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        
        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {renderMetricCard(
            "total_active_memberships",
            currentMetrics.totalActiveMembers,
            Users,
            "current_status",
            false,
            0
          )}
          {renderMetricCard(
            "total_revenue_mtd",
            formatCurrency(currentMetrics.monthlyRevenue),
            DollarSign,
            "this_months_sales",
            false,
            1
          )}
          {renderMetricCard(
            "daily_checkins",
            currentMetrics.dailyCheckIns,
            QrCode,
            "today_so_far",
            false,
            2
          )}
          {renderMetricCard(
            "low_stock_items",
            currentMetrics.lowStockCount,
            Package,
            "needs_reordering",
            true,
            3
          )}
        </div>
        
        {/* Chart and Alerts */}
        <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Chart Column (2/3 width) */}
            <MonthlySalesChart data={monthlySalesData} isLoading={isLoading} />
            
            {/* Alerts Column (1/3 width) */}
            <div className="lg:col-span-1 space-y-6">
                <ExpiringMemberships members={currentMetrics.expiringMemberships} isLoading={isLoading} />
                <LowStockAlerts items={currentMetrics.lowStockItems} isLoading={isLoading} />
            </div>
        </div>
        
        {/* Recent Transactions (Full width below alerts) */}
        <RecentTransactionsTable transactions={currentMetrics.recentTransactions} isLoading={isLoading} />
      </div>
    </Layout>
  );
};

export default DashboardPage;