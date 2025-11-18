import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, FileText, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import RecentTransactions from '@/components/RecentTransactions';
import { calculateDashboardMetrics } from '@/utils/dashboard-metrics';
import RevenueBreakdownChart from '@/components/RevenueBreakdownChart';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FinancePage = () => {
  const { t } = useTranslation();
  const metrics = calculateDashboardMetrics();
  
  // Mock Financial Data (using calculated revenue)
  const financialData = {
    monthlyRevenue: metrics.monthlyRevenue,
    newMembers: metrics.activeMembers, // Reusing active members count as a proxy for new members MTD for simplicity
    outstandingInvoices: 1200.50, // Keeping this mock as we lack invoice data
    expenseMTD: 15000.00, // Keeping this mock
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("finance_reports_title")}</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_revenue_mtd")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+18.5% vs last month (Mock)</p>
          </CardContent>
        </Card>
        
        {/* Active Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("active_members")}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.newMembers}</div>
            <p className="text-xs text-muted-foreground">{t("total_active_memberships")}</p>
          </CardContent>
        </Card>
        
        {/* Outstanding Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("outstanding_invoices")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.outstandingInvoices.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t("awaiting_payment_mock")}</p>
          </CardContent>
        </Card>
        
        {/* Expenses MTD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("expenses_mtd")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.expenseMTD.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t("includes_payroll_mock")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueBreakdownChart />
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> {t("detailed_reports")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t("generate_view_reports")}
            </p>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">{t("membership_sales_report")}</Button>
              <Button variant="outline" className="justify-start">{t("inventory_profit_report")}</Button>
              <Button variant="outline" className="justify-start">{t("trainer_payroll_summary")}</Button>
            </div>
            <Separator />
            <Button asChild className="w-full">
                <Link to="/finance/transactions">
                    {t("view_all_transactions")} <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <RecentTransactions />
    </div>
  );
};

export default FinancePage;