import React, { useMemo } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History } from 'lucide-react';
import TransactionsTable from '@/components/transactions/TransactionsTable';
import { mockTransactions } from '@/data/transactions';

const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  
  const totalTransactions = useMemo(() => mockTransactions.length, []);

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
            <TransactionsTable />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TransactionsPage;