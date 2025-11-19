import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Eye, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import POSReceipt from './POSReceipt';
import { SalesSummary } from '@/utils/transaction-utils';

interface POSSalesSummaryDialogProps {
  summary: SalesSummary;
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
        
        // Use a higher scale for better resolution in the PDF
        const canvas = await html2canvas(element, { 
            scale: 3, // Increased scale for better quality
            useCORS: true, 
            logging: false,
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        // A4 dimensions in mm (210 x 297)
        const A4_WIDTH_MM = 210;
        const A4_HEIGHT_MM = 297;

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const imgProps = pdf.getImageProperties(imgData);
        
        // Calculate the width of the image in the PDF based on A4 width
        const pdfWidth = A4_WIDTH_MM;
        // Calculate the height of the image in the PDF to maintain aspect ratio
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = pdfHeight;
        let position = 0;

        // Add the first page
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= A4_HEIGHT_MM;

        // Handle multi-page content
        while (heightLeft > 0) {
            position = heightLeft * -1;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= A4_HEIGHT_MM;
        }
        
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
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