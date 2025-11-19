import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { calculateSalesSummary } from '@/utils/transaction-utils';
import { formatCurrency } from '@/utils/currency-utils';
import { useTransactions } from '@/integrations/supabase/data/use-transactions.ts';
import { Skeleton } from '@/components/ui/skeleton';
import POSSalesSummaryDialog from './POSSalesSummaryDialog'; // Import the new dialog

const POSTransactionSummary: React.FC = () => {
  const { t } = useTranslation();
  
  const { data: transactions, isLoading } = useTransactions();
  
  const summary = transactions ? calculateSalesSummary(transactions) : { dailyTotal: 0, weeklyTotal: 0, monthlyTotal: 0, dailyTransactions: [] };

  // Calculate daily breakdowns
  const dailyBreakdowns = useMemo(() => {
      const paymentBreakdown: Record<string, number> = {};
      const typeBreakdown: Record<string, number> = {};
      
      summary.dailyTransactions.forEach(tx => {
          // Payment Method Breakdown
          const method = tx.payment_method;
          paymentBreakdown[method] = (paymentBreakdown[method] || 0) + tx.amount;
          
          // Transaction Type Breakdown
          const type = tx.type;
          typeBreakdown[type] = (typeBreakdown[type] || 0) + tx.amount;
      });
      
      return {
          count: summary.dailyTransactions.length,
          paymentBreakdown,
          typeBreakdown,
      };
  }, [summary.dailyTransactions]);

  const metrics = [
    { 
      title: t("daily_sales_total"), 
      value: formatCurrency(summary.dailyTotal), 
      icon: Clock, 
      color: "text-green-600" 
    },
    { 
      title: t("weekly_sales_total"), 
      value: formatCurrency(summary.weeklyTotal), 
      icon: Calendar, 
      color: "text-blue-600" 
    },
    { 
      title: t("monthly_sales_total"), 
      value: formatCurrency(summary.monthlyTotal), 
      icon: TrendingUp, 
      color: "text-purple-600" 
    },
  ];

  return (
    <Card className="p-4">
      <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xl">
          <DollarSign className="h-5 w-5" /> {t("sales_summary")}
        </CardTitle>
        
        {/* Use the new dialog component for preview and print */}
        <POSSalesSummaryDialog 
            summary={summary} 
            dailyBreakdowns={dailyBreakdowns} 
            isLoading={isLoading} 
        />
      </CardHeader>
      <CardContent className="p-0">
        
        {/* Visible Live Summary */}
        <div className="space-y-4">
            {/* Daily Transaction Count */}
            <div className="p-3 border rounded-md bg-secondary/50 text-center">
                <p className="text-xs font-medium text-muted-foreground">{t("daily_transaction_count")}</p>
                {isLoading ? <Skeleton className="h-6 w-1/3 mx-auto mt-1" /> : <p className="text-xl font-bold mt-0.5 text-primary">{dailyBreakdowns.count}</p>}
            </div>
            
            {isLoading ? (
                <div className="grid grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                  {metrics.map((metric) => (
                    <div key={metric.title} className="p-2 border rounded-md bg-secondary/50 text-center">
                      <metric.icon className={`h-5 w-5 mx-auto mb-1 ${metric.color}`} />
                      <p className="text-xs font-medium text-muted-foreground">{metric.title}</p>
                      <p className="text-sm font-bold mt-0.5">{metric.value}</p>
                    </div>
                  ))}
                </div>
            )}
            
            {/* Detailed Breakdowns (Live View - simplified) */}
            {!isLoading && dailyBreakdowns.count > 0 && (
                <div className="mt-4 space-y-4">
                    {/* Payment Breakdown */}
                    <div className="space-y-2 p-3 border rounded-md">
                        <h5 className="font-semibold text-sm border-b pb-1">{t("payment_method_breakdown")}</h5>
                        {Object.entries(dailyBreakdowns.paymentBreakdown).map(([method, total]) => (
                            <div key={method} className="flex justify-between text-sm">
                                <span>{t(method.toLowerCase())}</span>
                                <span className="font-medium">{formatCurrency(total)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default POSTransactionSummary;