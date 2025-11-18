import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, CreditCard, Receipt } from 'lucide-react';
import { mockTransactions, Transaction } from '@/data/transactions';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const RecentTransactions = () => {
  const { t } = useTranslation();
  const transactions = mockTransactions;

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Card':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'Cash':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'Transfer':
        return <Receipt className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" /> {t("recent_transactions")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("member")}</TableHead>
              <TableHead>{t("type")}</TableHead>
              <TableHead>{t("item_description")}</TableHead>
              <TableHead className="text-right">{t("amount")}</TableHead>
              <TableHead className="text-center">{t("date")}</TableHead>
              <TableHead className="text-center">{t("payment")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx: Transaction) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">{tx.memberName}</TableCell>
                <TableCell>
                  <Badge variant={tx.type === 'Membership' ? 'default' : 'secondary'}>
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {tx.item}
                </TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  +${tx.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-center text-sm">{tx.date}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getPaymentIcon(tx.paymentMethod)}
                    <span className="text-xs">{t(tx.paymentMethod.toLowerCase())}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;