import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Printer, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSalesSummary } from '@/utils/transaction-utils';
import { formatCurrency } from '@/utils/currency-utils';
import { showSuccess } from '@/utils/toast';

const POSTransactionSummary: React.FC = () => {
  const { t } = useTranslation();
  
  // Recalculate summary whenever component mounts/updates
  const summary = useMemo(() => getSalesSummary(), []);

  const handlePrint = () => {
    console.log("--- Sales Summary Report ---");
    console.log(`Daily Total: ${formatCurrency(summary.dailyTotal)}`);
    console.log(`Weekly Total: ${formatCurrency(summary.weeklyTotal)}`);
    console.log(`Monthly Total: ${formatCurrency(summary.monthlyTotal)}`);
    showSuccess(t("print_summary_success"));
  };

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
        <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> {t("print")}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <div key={metric.title} className="p-2 border rounded-md bg-secondary/50 text-center">
              <metric.icon className={`h-5 w-5 mx-auto mb-1 ${metric.color}`} />
              <p className="text-xs font-medium text-muted-foreground">{metric.title}</p>
              <p className="text-sm font-bold mt-0.5">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default POSTransactionSummary;