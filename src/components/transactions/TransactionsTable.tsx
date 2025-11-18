import React from 'react';
import { Transaction } from '@/types/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency-utils';
import { format } from 'date-fns';
import TransactionDetailsDialog from './TransactionDetailsDialog';

interface TransactionsTableProps {
    transactions: Transaction[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  const { t } = useTranslation();
  
  // Filtering is handled by the useTransactions hook in the parent page.

  return (
    <div className="space-y-4">
      {/* Search input is now in the parent page */}
      
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t("id")}</TableHead>
              <TableHead>{t("member")}</TableHead>
              <TableHead>{t("type")}</TableHead>
              <TableHead>{t("item_description")}</TableHead>
              <TableHead className="text-right">{t("amount")}</TableHead>
              <TableHead className="text-right">{t("payment")}</TableHead>
              <TableHead className="w-[100px] text-right">{t("date")}</TableHead>
              <TableHead className="w-[50px] text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium text-xs">{tx.id.substring(0, 8)}...</TableCell>
                  <TableCell>{tx.member_name}</TableCell>
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
                  <TableCell className="text-right text-sm">{t(tx.payment_method.toLowerCase())}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {tx.transaction_date ? format(new Date(tx.transaction_date), 'yyyy-MM-dd') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <TransactionDetailsDialog transaction={tx} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      {t("no_recent_transactions")}
                  </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionsTable;