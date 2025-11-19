import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  
  const hasSales = summary.dailyTransactions.length > 0;
  
  const handlePrint = () => {
      window.print();
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
            <div>
                <POSReceipt 
                    summary={summary}
                    dailyBreakdowns={dailyBreakdowns} 
                    className="shadow-none border-0 p-0"
                />
            </div>
        </div>
        
        <DialogFooter className="p-6 pt-0">
            <Button 
                onClick={handlePrint} 
                disabled={isLoading || !hasSales}
                className="w-full"
            >
                <Printer className="h-4 w-4 mr-2" /> {t("print_receipt")}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default POSSalesSummaryDialog;