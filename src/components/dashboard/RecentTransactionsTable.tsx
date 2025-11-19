import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Transaction } from '@/types/supabase';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currency-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions, isLoading }) => {
  const { t } = useTranslation();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" /> {t("recent_transactions_title", { count: transactions.length })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t("no_recent_transactions")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("member")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("item_description")}</TableHead>
                  <TableHead className="text-right">{t("amount")}</TableHead>
                  <TableHead className="text-right">{t("payment")}</TableHead>
                  <TableHead className="w-[100px] text-right">{t("date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.member_name}</TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="text-xs">
                            {t(tx.type.replace(/\s/g, '_').toLowerCase())}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{tx.item_description}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell className="text-right text-sm">{t(tx.payment_method.toLowerCase())}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground select-none">
                        {tx.transaction_date ? format(new Date(tx.transaction_date), 'yyyy-MM-dd') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsTable;