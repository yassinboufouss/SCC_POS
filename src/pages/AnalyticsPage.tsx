import React from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { BarChart3, DollarSign, History, Users, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardMetricCard from '@/components/dashboard/DashboardMetricCard';
import MonthlySalesChart from '@/components/dashboard/MonthlySalesChart';
import MemberStatusChart from '@/components/dashboard/MemberStatusChart'; // Import new chart
import { useDashboardMetrics } from '@/integrations/supabase/data/use-dashboard-metrics.ts';
import { aggregateMonthlySales } from '@/utils/transaction-utils';
import { formatCurrency } from '@/utils/currency-utils';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsPage: React.FC = () => {
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
    allTransactions: [],
    memberStatusDistribution: { active: 0, expired: 0, pending: 0 },
  };
  
  const currentMetrics = metrics || defaultMetrics;
  
  const monthlySalesData = currentMetrics.allTransactions ? aggregateMonthlySales(currentMetrics.allTransactions) : [];
  const totalTransactionsCount = currentMetrics.allTransactions?.length || 0;
  
  // Calculate total revenue across all time (for a KPI card)
  const totalRevenue = currentMetrics.allTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const renderMetricCard = (titleKey: string, value: React.ReactNode, icon: LucideIcon, descriptionKey: string) => (
    <DashboardMetricCard
      title={t(titleKey)}
      value={isLoading ? <Skeleton className="h-8 w-20" /> : value}
      icon={icon}
      description={t(descriptionKey)}
    />
  );

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-primary" /> {t("sales_analytics_title")}
        </h1>
        
        {/* Key Performance Indicators */}
        <div className="grid gap-4 md:grid-cols-3">
          {renderMetricCard(
            "total_active_memberships",
            currentMetrics.totalActiveMembers,
            Users,
            t("current_status")
          )}
          {renderMetricCard(
            "total_revenue_mtd",
            formatCurrency(currentMetrics.monthlyRevenue),
            DollarSign,
            t("this_months_sales")
          )}
          {renderMetricCard(
            "total_transactions_count",
            totalTransactionsCount,
            History,
            t("all_time")
          )}
        </div>
        
        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Revenue Chart */}
            <MonthlySalesChart data={monthlySalesData} isLoading={isLoading} />
            
            {/* Member Status Distribution Chart */}
            <MemberStatusChart 
                distribution={currentMetrics.memberStatusDistribution} 
                isLoading={isLoading} 
            />
        </div>
        
        {/* Additional Analytics (Placeholder for future expansion) */}
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{t("plan_analytics")}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{t("placeholder_plan_analytics")}</p>
            </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;