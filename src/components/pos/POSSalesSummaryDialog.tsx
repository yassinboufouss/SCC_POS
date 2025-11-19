import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Eye, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import POSReceipt from './POSReceipt';
import { Transaction } from '@/types/supabase';

interface POSSalesSummaryDialogProps {
  summary: {
    dailyTotal: number;
    weeklyTotal: number;
    monthlyTotal: number;
    dailyTransactions: Transaction[];
  };
  dailyBreakdowns: {
    count: number;
    paymentBreakdown: Record<string, number>;
    typeBreakdown: Record<string, number>;
  };
  isLoading: boolean;
}

const POSSalesSummaryDialog: React.FC<POSSalesSummaryDialogProps> = ({ summary, dailyBreakdowns, isLoading }) => {
  const { t } = useTranslation();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = React.useState(false);
  
  const hasSales = summary.dailyTransactions.length > 0;

  const handlePrint = async () => {
    if (!receiptRef.current || !hasSales) {
        showError(t("print_summary_failed"));
        return;
    }

    setIsPrinting(true);
    try {
        const element = receiptRef.current;
        
        // Capture the visible element inside the dialog
        const canvas = await html2canvas(element, { 
            scale: 2,
            useCORS: true, 
        });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        pdf.save(`Sales_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
        
        showSuccess(t("print_summary_success"));
    } catch (error) {
        console.error("PDF generation failed:", error);
        showError(t("print_summary_failed"));
    } finally {
        setIsPrinting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
            variant="outline" 
            size="sm" 
            disabled={isLoading || !hasSales}
        >
            <Eye className="h-4 w-4 mr-2" /> {t("view_summary")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            {t("daily_sales_invoice")}
          </DialogTitle>
        </DialogHeader>
        
        {/* Receipt Preview Area */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div ref={receiptRef}>
                <POSReceipt 
                    summary={summary} 
                    dailyBreakdowns={dailyBreakdowns} 
                    className="shadow-none border-0 p-0" // Remove extra styling for dialog display
                />
            </div>
        </div>
        
        {/* Print Footer */}
        <div className="p-4 border-t flex justify-end">
            <Button 
                onClick={handlePrint} 
                disabled={isPrinting || !hasSales}
            >
                {isPrinting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Printer className="h-4 w-4 mr-2" />}
                {t("print")}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSSalesSummaryDialog;