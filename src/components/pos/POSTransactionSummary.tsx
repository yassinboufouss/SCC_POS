import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Printer, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { calculateSalesSummary } from '@/utils/transaction-utils';
import { formatCurrency } from '@/utils/currency-utils';
import { showSuccess, showError } from '@/utils/toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTransactions } from '@/integrations/supabase/data/use-transactions.ts';
import { Skeleton } from '@/components/ui/skeleton';

const POSTransactionSummary: React.FC = () => {
  const { t } = useTranslation();
  const summaryRef = useRef<HTMLDivElement>(null);
  
  const { data: transactions, isLoading } = useTransactions();
  
  const summary = transactions ? calculateSalesSummary(transactions) : { dailyTotal: 0, weeklyTotal: 0, monthlyTotal: 0 };

  const handlePrint = async () => {
    if (!summaryRef.current) {
        showError(t("print_summary_failed"));
        return;
    }

    try {
        const element = summaryRef.current;
        
        // Use html2canvas to capture the element as an image
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        // Initialize jsPDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Add the image to the PDF
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        // Save the PDF
        pdf.save(`Sales_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
        
        showSuccess(t("print_summary_success"));
    } catch (error) {
        console.error("PDF generation failed:", error);
        showError(t("print_summary_failed"));
    }
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
        <Button variant="outline" size="sm" onClick={handlePrint} disabled={isLoading}>
            <Printer className="h-4 w-4 mr-2" /> {t("print")}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {/* Content to be captured by PDF generator */}
        <div ref={summaryRef} className="p-2"> 
            <h4 className="text-lg font-bold mb-3">{t("sales_summary")} - {t("today_so_far")}</h4>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default POSTransactionSummary;