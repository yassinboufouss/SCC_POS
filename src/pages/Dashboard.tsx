import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, CalendarCheck, Package } from "lucide-react";
import RevenueChart from "@/components/RevenueChart";
import { calculateDashboardMetrics } from "@/utils/dashboard-metrics";
import RecentTransactions from "@/components/RecentTransactions";
import ExpiringMembersList from "@/components/ExpiringMembersList";
import LowStockAlerts from "@/components/LowStockAlerts";
import RevenueBreakdownChart from "@/components/RevenueBreakdownChart";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();
  const metrics = calculateDashboardMetrics();
  
  // Daily check-ins remains a simple mock value for now
  const dailyCheckins = 345; 

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("dashboard")} Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("active_members")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t("total_active_memberships")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_revenue_mtd")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t("this_months_sales")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("daily_checkins")}
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyCheckins}</div>
            <p className="text-xs text-muted-foreground">{t("today_so_far")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("low_stock_items")}
            </CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">{t("needs_reordering")}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Grid (Revenue Trend & Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <RevenueChart />
        </div>
        <div className="lg:col-span-1">
            <RevenueBreakdownChart />
        </div>
      </div>

      {/* Transactions and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <RecentTransactions />
        </div>
        <div className="lg:col-span-1 space-y-6">
            <ExpiringMembersList />
            <LowStockAlerts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;