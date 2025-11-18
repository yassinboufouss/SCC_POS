import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Transaction } from '@/data/transactions';
import { Badge } from '@/components/ui/badge';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
}

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" /> {t("recent_transactions_title", { count: transactions.length })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
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
                    <TableCell className="font-medium">{tx.memberName}</TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="text-xs">
                            {t(tx.type.replace(/\s/g, '_').toLowerCase())}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{tx.item}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">${tx.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-sm">{t(tx.paymentMethod.toLowerCase())}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{tx.date}</TableCell>
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