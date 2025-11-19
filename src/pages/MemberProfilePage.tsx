import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/components/auth/SessionContextProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, History, RefreshCw, X } from 'lucide-react';
import { useMemberTransactions } from '@/integrations/supabase/data/use-transactions.ts';
import { Skeleton } from '@/components/ui/skeleton';
import MemberLogoutButton from '@/components/members/MemberLogoutButton';
import { Button } from '@/components/ui/button';
import MemberProfileTab from '@/components/members/MemberProfileTab'; // NEW
import MemberRenewalTab from '@/components/members/MemberRenewalTab'; // NEW
import MemberHistoryTab from '@/components/members/MemberHistoryTab'; // NEW

const MemberProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { profile, isLoading: isLoadingSession } = useSession();
  const [showRenewalForm, setShowRenewalForm] = useState(false); 
  
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
  
  // Member can always edit their own basic info, and always renew.
  const canEdit = true;
  const canRenew = true;
  const canCheckIn = false; // Member doesn't need to manually check themselves in here
  const canChangeStatus = false; // Member cannot freeze/cancel their own status via this UI
  
  // Determine if the member needs renewal (Expired or Pending)
  const needsRenewal = profile.status !== 'Active';
  
  // If renewal is needed, automatically show the form
  useEffect(() => {
      if (needsRenewal) {
          setShowRenewalForm(true);
      }
  }, [needsRenewal]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-primary">
              <User className="h-7 w-7" /> {t("welcome_member", { name: profile.first_name })}
            </h1>
            <MemberLogoutButton />
        </div>
        
        {/* 1. Profile & Membership Details (Uses MemberProfileTab) */}
        <MemberProfileTab 
            member={profile}
            canEdit={canEdit}
            canRenew={canRenew}
            canCheckIn={canCheckIn}
            canChangeStatus={canChangeStatus}
            onRenewClick={() => setShowRenewalForm(true)}
        />
        
        {/* 2. Conditional Renewal Form (Uses MemberRenewalTab) */}
        {showRenewalForm && (
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                        <RefreshCw className="h-5 w-5" /> {t("renew_membership")}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowRenewalForm(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <MemberRenewalTab member={profile} canRenew={canRenew} />
                </CardContent>
            </Card>
        )}
        
        {/* 3. History (Uses MemberHistoryTab) */}
        <MemberHistoryTab 
            member={profile} 
            transactions={transactions} 
            isLoadingTransactions={isLoadingTransactions} 
        />
        
      </div>
    </div>
  );
};

export default MemberProfilePage;