import React from 'react';
import { Transaction } from '@/types/supabase';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency-utils';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign } from 'lucide-react';
import TransactionDetailsDialog from '@/components/transactions/TransactionDetailsDialog';

interface MemberTransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const MemberTransactionHistory: React.FC<MemberTransactionHistoryProps> = ({ transactions, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">{t("no_recent_transactions")}</p>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{t("type")}</TableHead>
            <TableHead>{t("item_description")}</TableHead>
            <TableHead className="text-right">{t("amount")}</TableHead>
            <TableHead className="w-[100px] text-right">{t("date")}</TableHead>
            <TableHead className="w-[50px] text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {t(tx.type.replace(/\s/g, '_').toLowerCase())}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{tx.item_description}</TableCell>
              <TableCell className="text-right font-semibold text-green-600 flex items-center justify-end gap-1">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(tx.amount)}
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {tx.transaction_date ? format(new Date(tx.transaction_date), 'yyyy-MM-dd') : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <TransactionDetailsDialog transaction={tx} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MemberTransactionHistory;