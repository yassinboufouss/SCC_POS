import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { mockTransactions } from '@/data/transactions';
import { transactionColumns } from '@/pages/finance/transaction-columns.tsx';

const TransactionsPage = () => {
  // Note: We use a copy of mockTransactions to ensure the DataTable receives a stable array for filtering/sorting
  const data = [...mockTransactions]; 

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transaction History</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> All Transactions ({data.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={transactionColumns}
            data={data}
            filterColumnId="memberName"
            filterPlaceholder="Search transactions by member name..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;