import React, { useState } from 'react';
import { Transaction } from '@/types/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, DollarSign, History, User, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency-utils';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useUserRole } from '@/hooks/use-user-role';
import { useVoidTransaction } from '@/integrations/supabase/data/use-transactions.ts';
import { showSuccess, showError } from '@/utils/toast';

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
  
  const formattedDate = transaction.created_at 
    ? format(new Date(transaction.created_at), 'yyyy-MM-dd hh:mm a') 
    : (transaction.transaction_date || 'N/A');

  // Assuming item_description is a comma-separated list of items (as generated in POSPage.tsx)
  const itemsList = transaction.item_description?.split(',').map(item => item.trim()) || [];
  
  const handleVoid = async () => {
      try {
          await voidTx(transaction.id);
          showSuccess(t("transaction_void_success", { id: transaction.id.substring(0, 8) }));
          setIsVoidConfirmOpen(false);
          setIsDialogOpen(false);
      } catch (error) {
          showError(t("transaction_void_failed"));
      }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> {t("transaction_details")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          
          {/* Transaction ID */}
          <div className="p-3 border rounded-md bg-secondary/50 text-sm">
            <p className="font-semibold">{t("transaction_id")}:</p>
            <p className="font-mono text-xs break-all">{transaction.id}</p>
          </div>

          {/* Core Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><User className="h-4 w-4" /> {t("member_customer")}:</span>
              <span className="font-medium">{transaction.member_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><History className="h-4 w-4" /> {t("sale_type")}:</span>
              <span className="font-medium">{t(transaction.type.replace(/\s/g, '_').toLowerCase())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4" /> {t("payment")}:</span>
              <span className="font-medium">{t(transaction.payment_method.toLowerCase())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4" /> {t("transaction_date_time")}:</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* Items Purchased */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{t("items_purchased")}</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 space-y-1 max-h-32 overflow-y-auto">
              {itemsList.length > 0 ? (
                itemsList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <li>N/A</li>
              )}
            </ul>
          </div>
          
          <Separator />

          {/* Total Amount */}
          <div className="flex justify-between text-xl font-bold pt-2">
            <span>{t("total_amount")}</span>
            <span className="text-green-600">{formatCurrency(transaction.amount)}</span>
          </div>
        </div>
        
        {/* Void Button (Staff Only) */}
        {canVoid && (
            <div className="pt-4 border-t">
                <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => setIsVoidConfirmOpen(true)}
                    disabled={isVoiding}
                >
                    <Trash2 className="h-4 w-4 mr-2" /> {t("void_transaction")}
                </Button>
            </div>
        )}
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
                  <Button variant="destructive" onClick={handleVoid} disabled={isVoiding}>
                      {isVoiding ? t("voiding") : t("confirm_void_action")}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default TransactionDetailsDialog;