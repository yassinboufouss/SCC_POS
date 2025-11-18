import React, { useState, useMemo } from 'react';
import { Profile } from '@/types/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Calendar, Clock, DollarSign, Edit, RefreshCw, History, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MemberRenewalForm from './MemberRenewalForm';
import MemberStatusActions from './MemberStatusActions';
import MemberDetailsCard from './MemberDetailsCard';
import MemberBasicInfoForm from './MemberBasicInfoForm';
import MemberTransactionHistory from './MemberTransactionHistory';
import MemberCheckInButton from './MemberCheckInButton';
import { useMember } from '@/integrations/supabase/data/use-members.ts';
import { useMemberTransactions } from '@/integrations/supabase/data/use-transactions.ts';
import { showSuccess, showError } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/currency-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface MemberProfileDialogProps {
  member: Profile; // Initial member data from the list
}

const MemberProfileDialog: React.FC<MemberProfileDialogProps> = ({ member }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); 
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch the freshest member data when the dialog is open
  const { data: currentMember, isLoading: isLoadingMember } = useMember(member.id);
  
  // Use the freshest data available, fall back to prop if loading or not fetched yet
  const displayMember = currentMember || member;

  const { data: transactions, isLoading: isLoadingTransactions } = useMemberTransactions(displayMember.id);

  const handleOpenChange = (open: boolean) => {
      setIsDialogOpen(open);
      if (open) {
          // If membership is inactive, default to the renewal tab
          if (displayMember.status !== 'Active') {
              setActiveTab('renewal');
          } else {
              setActiveTab('profile');
          }
      } else {
          // Reset tab and editing state when closing
          setActiveTab('profile');
          setIsEditing(false);
      }
  };

  const handleSaveBasicDetailsSuccess = () => {
      setIsEditing(false);
  };
  
  if (isLoadingMember && isDialogOpen) {
      return (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                  </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-40 w-full" />
                  </div>
              </DialogContent>
          </Dialog>
      );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> {displayMember.first_name} {displayMember.last_name} ({displayMember.member_code || displayMember.id.substring(0, 8)}...)
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">{t("member_details")}</TabsTrigger>
            <TabsTrigger value="renewal">{t("renew_membership")}</TabsTrigger>
            <TabsTrigger value="history">{t("activity_history")}</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{t("contact_information")}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-2" /> {isEditing ? t("close") : t("edit_item_details")}
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {isEditing ? (
                    <MemberBasicInfoForm member={displayMember} onSuccess={handleSaveBasicDetailsSuccess} />
                ) : (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {displayMember.first_name} {displayMember.last_name}</p>
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {displayMember.email || 'N/A'}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {displayMember.phone || 'N/A'}</p>
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {displayMember.dob || 'N/A'}</p>
                    </div>
                )}
              </CardContent>
            </Card>
            
            <MemberDetailsCard 
                member={displayMember} 
                onRenewClick={() => setActiveTab('renewal')} 
            />
            
            <MemberCheckInButton member={displayMember} />
            
            <MemberStatusActions member={displayMember} />
          </TabsContent>
          
          {/* Renewal Tab */}
          <TabsContent value="renewal" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("renew_membership_for", { name: `${displayMember.first_name} ${displayMember.last_name}` })}</CardTitle>
              </CardHeader>
              <CardContent>
                <MemberRenewalForm member={displayMember} />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" /> {t("activity_history")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    {/* Check-in Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-3 text-center">
                            <p className="text-xs text-muted-foreground">{t("total_check_ins")}</p>
                            <p className="text-2xl font-bold text-primary">{displayMember.total_check_ins || 0}</p>
                        </Card>
                        <Card className="p-3 text-center md:col-span-3">
                            <p className="text-xs text-muted-foreground">{t("last_check_in")}</p>
                            <p className="text-lg font-bold text-primary mt-1">
                                {displayMember.last_check_in ? format(new Date(displayMember.last_check_in), 'yyyy-MM-dd hh:mm a') : 'N/A'}
                            </p>
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MemberProfileDialog;