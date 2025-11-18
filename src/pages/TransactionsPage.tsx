import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History, Search } from 'lucide-react';
import TransactionsTable from '@/components/transactions/TransactionsTable';
import { useTransactions } from '@/integrations/supabase/data/use-transactions.ts';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: transactions, isLoading } = useTransactions(searchTerm);
  const totalTransactions = transactions?.length || 0;

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t("transactions")}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> {t("transaction_history", { count: totalTransactions })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t("search_transactions_by_member")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-lg"
                />
            </div>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            ) : (
                <TransactionsTable transactions={transactions || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TransactionsPage;