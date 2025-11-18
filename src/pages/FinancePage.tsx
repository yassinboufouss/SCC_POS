import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import RecentTransactions from '@/components/RecentTransactions';
import { calculateDashboardMetrics } from '@/utils/dashboard-metrics';
import RevenueBreakdownChart from '@/components/RevenueBreakdownChart';

const FinancePage = () => {
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
      <h1 className="text-3xl font-bold">Finance & Reports</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
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
              Active Members
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.newMembers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        {/* Outstanding Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Invoices
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.outstandingInvoices.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment (Mock)</p>
          </CardContent>
        </Card>
        
        {/* Expenses MTD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expenses (MTD)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.expenseMTD.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Includes payroll & utilities (Mock)</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueBreakdownChart />
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Detailed Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Generate and view detailed financial reports for various periods.</p>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">Membership Sales Report</Button>
              <Button variant="outline" className="justify-start">Inventory Profit Report</Button>
              <Button variant="outline" className="justify-start">Trainer Payroll Summary</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <RecentTransactions />
    </div>
  );
};

export default FinancePage;