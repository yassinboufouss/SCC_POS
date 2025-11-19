import React from 'react';
import { Profile, Transaction } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DollarSign, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MemberTransactionHistory from './MemberTransactionHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface MemberHistoryTabProps {
  member: Profile;
  transactions: Transaction[] | undefined;
  isLoadingTransactions: boolean;
}

const MemberHistoryTab: React.FC<MemberHistoryTabProps> = ({ member, transactions, isLoadingTransactions }) => {
  const { t } = useTranslation();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" /> {t("activity_history")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Check-in Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3 text-center shadow-sm">
              <p className="text-xs text-muted-foreground">{t("total_check_ins")}</p>
              <p className="text-2xl font-bold text-primary">{member.total_check_ins || 0}</p>
            </Card>
            <Card className="p-3 text-center md:col-span-3 shadow-sm">
              <p className="text-xs text-muted-foreground">{t("last_check_in")}</p>
              {member.last_check_in ? (
                <p className="text-lg font-bold text-primary mt-1">
                  {format(new Date(member.last_check_in), 'yyyy-MM-dd hh:mm a')}
                </p>
              ) : (
                <p className="text-lg font-bold text-primary mt-1">N/A</p>
              )}
            </Card>
          </div>

          <Separator className="my-2" />

          {/* Transaction History Table */}
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> {t("transaction_history", { count: transactions?.length || 0 })}
          </h4>
          <MemberTransactionHistory
            transactions={transactions || []}
            isLoading={isLoadingTransactions}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberHistoryTab;