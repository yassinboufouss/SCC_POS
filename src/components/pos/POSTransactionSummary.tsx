import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, Clock, TrendingUp, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { calculateSalesSummary } from '@/utils/transaction-utils';
import { formatCurrency } from '@/utils/currency-utils';
import { useTransactions } from '@/integrations/supabase/data/use-transactions.ts';
import { Skeleton } from '@/components/ui/skeleton';
import POSSalesSummaryDialog from './POSSalesSummaryDialog'; // Import the new dialog
import { Separator } from '@/components/ui/separator';

const POSTransactionSummary: React.FC = () => {
  const { t } = useTranslation();
  
  // Fetch all transactions (required for calculating daily/weekly/monthly totals)
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

  const periodMetrics = [
    { 
      title: t("weekly_sales_total"), 
      value: formatCurrency(summary.weeklyTotal), 
      icon: Calendar, 
    },
    { 
      title: t("monthly_sales_total"), 
      value: formatCurrency(summary.monthlyTotal), 
      icon: TrendingUp, 
    },
  ];

  return (
    <Card className="p-4 flex flex-col h-full">
      <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xl">
          <DollarSign className="h-5 w-5" /> {t("sales_summary")}
        </CardTitle>
        
        <POSSalesSummaryDialog 
            summary={summary} 
            dailyBreakdowns={dailyBreakdowns} 
            isLoading={isLoading} 
        />
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col justify-between">
        
        {/* 1. Daily Total (Most Prominent) */}
        <div className="space-y-4 mb-4">
            <div className="p-4 border rounded-lg bg-primary/10 dark:bg-primary/20 text-center">
                <p className="text-sm font-medium text-muted-foreground">{t("daily_sales_total")}</p>
                {isLoading ? (
                    <Skeleton className="h-10 w-2/3 mx-auto mt-2" />
                ) : (
                    <p className="text-4xl font-extrabold text-primary mt-1">
                        {formatCurrency(summary.dailyTotal)}
                    </p>
                )}
            </div>
            
            {/* Daily Transaction Count */}
            <div className="flex justify-between items-center text-sm p-2 border rounded-md bg-secondary/50">
                <span className="font-medium text-muted-foreground">{t("daily_transaction_count")}</span>
                {isLoading ? <Skeleton className="h-4 w-10" /> : <span className="font-bold text-primary">{dailyBreakdowns.count}</span>}
            </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* 2. Period Totals (Weekly/Monthly) */}
        <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">{t("period_totals")}</h4>
            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
            ) : (
                periodMetrics.map((metric) => (
                    <div key={metric.title} className="flex justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <metric.icon className="h-4 w-4" /> {metric.title}
                        </span>
                        <span className="font-bold">{metric.value}</span>
                    </div>
                ))
            )}
        </div>
        
        {/* 3. Daily Breakdowns (Payment & Type) */}
        {!isLoading && dailyBreakdowns.count > 0 && (
            <div className="mt-4 pt-4 border-t space-y-3">
                <h5 className="font-semibold text-sm text-muted-foreground">{t("daily_breakdowns")}</h5>
                
                <div className="grid grid-cols-2 gap-4">
                    {/* Payment Breakdown */}
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{t("payment_method_breakdown")}</p>
                        {Object.entries(dailyBreakdowns.paymentBreakdown).map(([method, total]) => (
                            <div key={method} className="flex justify-between text-sm">
                                <span>{t(method.toLowerCase())}</span>
                                <span className="font-medium">{formatCurrency(total)}</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Type Breakdown */}
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{t("transaction_type_breakdown")}</p>
                        {Object.entries(dailyBreakdowns.typeBreakdown).map(([type, total]) => (
                            <div key={type} className="flex justify-between text-sm">
                                <span>{t(type.replace(/\s/g, '_').toLowerCase())}</span>
                                <span className="font-medium">{formatCurrency(total)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default POSTransactionSummary;