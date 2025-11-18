import React from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Users, DollarSign, Package, QrCode } from 'lucide-react';
import DashboardMetricCard from '@/components/dashboard/DashboardMetricCard';
import ExpiringMemberships from '@/components/dashboard/ExpiringMemberships';
import LowStockAlerts from '@/components/dashboard/LowStockAlerts';
import RecentTransactionsTable from '@/components/dashboard/RecentTransactionsTable';
import { useDashboardMetrics } from '@/integrations/supabase/data/use-dashboard-metrics.ts';
import { formatCurrency } from '@/utils/currency-utils';
import { Skeleton } from '@/components/ui/skeleton';

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
  };
  
  const currentMetrics = metrics || defaultMetrics;

  const renderMetricCard = (titleKey: string, value: React.ReactNode, icon: React.FC<any>, descriptionKey: string, isAlert = false) => (
    <DashboardMetricCard
      title={t(titleKey)}
      value={isLoading ? <Skeleton className="h-8 w-20" /> : value}
      icon={icon}
      description={t(descriptionKey)}
      className={isAlert && currentMetrics.lowStockCount > 0 ? "border-red-500 shadow-md" : ""}
    />
  );

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        
        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {renderMetricCard(
            "total_active_memberships",
            currentMetrics.totalActiveMembers,
            Users,
            "today_so_far"
          )}
          {renderMetricCard(
            "total_revenue_mtd",
            formatCurrency(currentMetrics.monthlyRevenue),
            DollarSign,
            "this_months_sales"
          )}
          {renderMetricCard(
            "daily_checkins",
            currentMetrics.dailyCheckIns,
            QrCode,
            "today_so_far"
          )}
          {renderMetricCard(
            "low_stock_items",
            currentMetrics.lowStockCount,
            Package,
            "needs_reordering",
            true
          )}
        </div>
        
        {/* Alerts and Transactions */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Alerts Column (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            <ExpiringMemberships members={currentMetrics.expiringMemberships} isLoading={isLoading} />
            <LowStockAlerts items={currentMetrics.lowStockItems} isLoading={isLoading} />
          </div>
          
          {/* Recent Transactions (2/3 width) */}
          <div className="lg:col-span-2">
            <RecentTransactionsTable transactions={currentMetrics.recentTransactions} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;