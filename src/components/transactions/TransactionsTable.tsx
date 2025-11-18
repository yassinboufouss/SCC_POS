import React, { useState, useMemo } from 'react';
import { mockTransactions, Transaction } from '@/data/transactions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency-utils';

const TransactionsTable: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use a copy of mockTransactions and sort them by date descending
  const allTransactions = useMemo(() => {
    return [...mockTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) {
      return allTransactions;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return allTransactions.filter(tx =>
      tx.memberName.toLowerCase().includes(lowerCaseSearch) ||
      tx.item.toLowerCase().includes(lowerCaseSearch) ||
      tx.id.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, allTransactions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
              placeholder={t("search_transactions_by_member")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-lg"
          />
      </div>
      
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium text-xs">{tx.id}</TableCell>
                  <TableCell>{tx.memberName}</TableCell>
                  <TableCell>
                      <Badge variant="secondary" className="text-xs">
                          {t(tx.type.replace(/\s/g, '_').toLowerCase())}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{tx.item}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600 flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell className="text-right text-sm">{t(tx.paymentMethod.toLowerCase())}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{tx.date}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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