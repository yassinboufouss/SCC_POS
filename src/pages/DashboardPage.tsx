import React, { useMemo } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Users, DollarSign, Package, QrCode } from 'lucide-react';
import DashboardMetricCard from '@/components/dashboard/DashboardMetricCard.tsx';
import ExpiringMemberships from '@/components/dashboard/ExpiringMemberships.tsx';
import LowStockAlerts from '@/components/dashboard/LowStockAlerts.tsx';
import RecentTransactionsTable from '@/components/dashboard/RecentTransactionsTable.tsx';
import { getDashboardMetrics } from '@/utils/dashboard-utils';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Calculate metrics once
  const metrics = useMemo(() => getDashboardMetrics(), []);

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        
        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardMetricCard
            title={t("total_active_memberships")}
            value={metrics.totalActiveMembers}
            icon={Users}
            description={t("today_so_far")}
          />
          <DashboardMetricCard
            title={t("total_revenue_mtd")}
            value={`$${metrics.monthlyRevenue.toFixed(2)}`}
            icon={DollarSign}
            description={t("this_months_sales")}
          />
          <DashboardMetricCard
            title={t("daily_checkins")}
            value={metrics.dailyCheckIns}
            icon={QrCode}
            description={t("today_so_far")}
          />
          <DashboardMetricCard
            title={t("low_stock_items")}
            value={metrics.lowStockCount}
            icon={Package}
            description={t("needs_reordering")}
            className={metrics.lowStockCount > 0 ? "border-red-500 shadow-md" : ""}
          />
        </div>
        
        {/* Alerts and Transactions */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Alerts Column (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            <ExpiringMemberships members={metrics.expiringMemberships} />
            {metrics.lowStockCount > 0 && (
                <LowStockAlerts items={metrics.lowStockItems} />
            )}
          </div>
          
          {/* Recent Transactions (2/3 width) */}
          <div className="lg:col-span-2">
            <RecentTransactionsTable transactions={metrics.recentTransactions} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;