import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/components/auth/SessionContextProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, History, QrCode, Mail, Phone, Calendar, Edit, RefreshCw, X } from 'lucide-react';
import MemberDetailsCard from '@/components/members/MemberDetailsCard';
import MemberTransactionHistory from '@/components/members/MemberTransactionHistory';
import { useMemberTransactions } from '@/integrations/supabase/data/use-transactions.ts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import MemberLogoutButton from '@/components/members/MemberLogoutButton';
import { Button } from '@/components/ui/button';
import MemberBasicInfoForm from '@/components/members/MemberBasicInfoForm'; // Import form
import MemberRenewalForm from '@/components/members/MemberRenewalForm'; // Import renewal form

const MemberProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { profile, isLoading: isLoadingSession } = useSession();
  const [isEditing, setIsEditing] = React.useState(false); // State for editing mode
  
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
  
  const handleSaveSuccess = () => {
      setIsEditing(false);
  };
  
  // Determine if the member needs renewal (Expired or Pending)
  const needsRenewal = profile.status !== 'Active';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-primary">
              <User className="h-7 w-7" /> {t("welcome_member", { name: profile.first_name })}
            </h1>
            <div className="flex gap-2 shrink-0">
                {/* Toggle Edit Button */}
                <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                    {isEditing ? t("close_editing") : t("edit_profile")}
                </Button>
                <MemberLogoutButton />
            </div>
        </div>
        
        {/* Basic Info Card */}
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" /> {t("contact_information")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <MemberBasicInfoForm 
                        member={profile} 
                        onSuccess={handleSaveSuccess} 
                        canEdit={true} // Member can edit their own profile
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {profile.first_name} {profile.last_name}</p>
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {profile.email || 'N/A'}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {profile.phone || 'N/A'}</p>
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {profile.dob || 'N/A'}</p>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Membership Status Card and Check-in Status Card side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MemberDetailsCard 
                member={profile} 
                onRenewClick={() => { /* Read-only, no action */ }} 
                canRenew={false} 
            />
            
            {/* Check-in Status Card */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <QrCode className="h-5 w-5" /> {t("check_in_status")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">{t("total_check_ins")}</p>
                            <p className="text-2xl font-bold text-primary">{profile.total_check_ins || 0}</p>
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
        </div>
        
        {/* Conditional Renewal Form */}
        {needsRenewal && (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                        <RefreshCw className="h-5 w-5" /> {t("renew_membership")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MemberRenewalForm member={profile} canRenew={true} />
                </CardContent>
            </Card>
        )}
        
        {/* Transaction History */}
        <Card className="shadow-lg">
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