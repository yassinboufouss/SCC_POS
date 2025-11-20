import React, { useState } from 'react';
import { Transaction } from '@/types/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, History, Trash2, AlertTriangle, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '@/hooks/use-user-role';
import { useVoidTransaction } from '@/integrations/supabase/data/use-transactions.ts';
import { showError } from '@/utils/toast';
import TransactionReceipt from './TransactionReceipt'; // Import the new component

interface TransactionDetailsDialogProps {
  transaction: Transaction;
}

const TransactionDetailsDialog: React.FC<TransactionDetailsDialogProps> = ({ transaction }) => {
  const { t } = useTranslation();
  const { isOwner, isManager, isCashier } = useUserRole();
  const canVoid = isOwner || isManager || isCashier;
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVoidConfirmOpen, setIsVoidConfirmOpen] = useState(false);
  
  const { mutateAsync: voidTx, isPending: isVoiding } = useVoidTransaction();
  
  const handleVoidTransaction = async () => {
      try {
          await voidTx(transaction.id);
          // Success/Warning toast handled by the hook's onSuccess callback
          setIsVoidConfirmOpen(false);
          setIsDialogOpen(false);
      } catch (error) {
          showError(t("transaction_void_failed"));
      }
  };
  
  const handlePrint = () => {
      // Use the browser's print function, targeting the receipt content
      const receiptElement = document.getElementById('transaction-receipt-print');
      if (receiptElement) {
          const printWindow = window.open('', '', 'height=600,width=800');
          if (printWindow) {
              printWindow.document.write('<html><head><title>Receipt</title>');
              // Inject necessary styles for printing (Tailwind utility classes are usually sufficient)
              printWindow.document.write('<style>@media print { body { margin: 0; } .no-print { display: none; } }</style>');
              printWindow.document.write('</head><body>');
              printWindow.document.write(receiptElement.outerHTML);
              printWindow.document.write('</body></html>');
              printWindow.document.close();
              printWindow.print();
          }
      }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[450px] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> {t("transaction_details")}
            </DialogTitle>
          </DialogHeader>
          
          {/* Receipt Content */}
          <div className="max-h-[70vh] overflow-y-auto p-6 pt-0">
            <div id="transaction-receipt-print">
                <TransactionReceipt transaction={transaction} className="shadow-none border-0 p-0" />
            </div>
          </div>
          
          <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button 
                variant="outline" 
                onClick={handlePrint}
                className="w-full sm:w-auto"
            >
                <Printer className="h-4 w-4 mr-2" /> {t("print_receipt")}
            </Button>
            
            {canVoid && (
                <Button 
                    variant="destructive" 
                    onClick={() => setIsVoidConfirmOpen(true)}
                    disabled={isVoiding}
                    className="w-full sm:w-auto"
                >
                    <Trash2 className="h-4 w-4 mr-2" /> {t("void_transaction")}
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
        
        {/* Void Confirmation Dialog */}
        <Dialog open={isVoidConfirmOpen} onOpenChange={setIsVoidConfirmOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" /> {t("confirm_void")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("void_transaction_confirmation", { id: transaction.id.substring(0, 8) })}
                        <p className="mt-2 font-semibold text-red-700 dark:text-red-400">
                            {t("void_transaction_warning")}
                        </p>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsVoidConfirmOpen(false)} disabled={isVoiding}>
                        {t("cancel")}
                    </Button>
                    <Button variant="destructive" onClick={handleVoidTransaction} disabled={isVoiding}>
                        {isVoiding ? t("voiding") : t("confirm_void_action")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </Dialog>
    </>
  );
};

export default TransactionDetailsDialog;