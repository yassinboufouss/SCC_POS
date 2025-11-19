import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/components/auth/SessionContextProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, History, QrCode } from 'lucide-react';
import MemberDetailsCard from '@/components/members/MemberDetailsCard';
import MemberTransactionHistory from '@/components/members/MemberTransactionHistory';
import { useMemberTransactions } from '@/integrations/supabase/data/use-transactions.ts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import MemberLogoutButton from '@/components/members/MemberLogoutButton'; // Import the new component

const MemberProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { profile, isLoading: isLoadingSession } = useSession();
  
  const memberId = profile?.id || '';
  const { data: transactions, isLoading: isLoadingTransactions } = useMemberTransactions(memberId);

  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t("loading")}...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-red-500">
        {t("error_fetching_dashboard_data")}
      </div>
    );
  }
  
  // Note: MemberDetailsCard expects onRenewClick and canRenew props, but since this is a read-only member portal, 
  // we pass no-op and false respectively.

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-primary">
              <User className="h-7 w-7" /> {t("welcome_member", { name: profile.first_name })}
            </h1>
            <MemberLogoutButton /> {/* Added Logout Button */}
        </div>
        
        {/* Membership Status Card */}
        <MemberDetailsCard 
            member={profile} 
            onRenewClick={() => { /* Read-only, no action */ }} 
            canRenew={false} 
        />
        
        {/* Check-in Status Card */}
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <QrCode className="h-5 w-5" /> {t("check_in_status")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">{t("total_check_ins")}</p>
                        <p className="text-xl font-bold text-primary">{profile.total_check_ins || 0}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">{t("last_check_in")}</p>
                        <p className="text-sm font-medium">
                            {profile.last_check_in ? format(new Date(profile.last_check_in), 'yyyy-MM-dd hh:mm a') : t('never_checked_in')}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" /> {t("transaction_history", { count: transactions?.length || 0 })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MemberTransactionHistory 
                transactions={transactions || []} 
                isLoading={isLoadingTransactions} 
            />
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};

export default MemberProfilePage;