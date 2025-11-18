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
import { useUpdateProfile } from '@/integrations/supabase/data/use-members.ts';
import { useMemberTransactions } from '@/integrations/supabase/data/use-transactions.ts';
import { showSuccess, showError } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/currency-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface MemberProfileDialogProps {
  member: Profile;
}

const MemberProfileDialog: React.FC<MemberProfileDialogProps> = ({ member }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // State for active tab
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for editing basic info
  const [editFirstName, setEditFirstName] = useState(member.first_name || '');
  const [editLastName, setEditLastName] = useState(member.last_name || '');
  const [editEmail, setEditEmail] = useState(member.email || '');
  const [editPhone, setEditPhone] = useState(member.phone || '');
  const [editDob, setEditDob] = useState(member.dob || '');
  
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { data: transactions, isLoading: isLoadingTransactions } = useMemberTransactions(member.id);

  // Reset local state when member changes
  React.useEffect(() => {
    setEditFirstName(member.first_name || '');
    setEditLastName(member.last_name || '');
    // Note: Email is managed by Auth, but we keep it here for display/mock editing
    setEditEmail(member.email || ''); 
    setEditPhone(member.phone || '');
    setEditDob(member.dob || '');
    setIsEditing(false);
    // Reset tab to profile whenever the member prop changes
    setActiveTab('profile');
  }, [member]);
  
  const handleOpenChange = (open: boolean) => {
      setIsDialogOpen(open);
      if (open) {
          // If membership is inactive, default to the renewal tab
          if (member.status !== 'Active') {
              setActiveTab('renewal');
          } else {
              setActiveTab('profile');
          }
      }
  };

  const getStatusVariant = (status: Profile['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Expired':
        return 'destructive';
      case 'Pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  
  const handleSaveBasicDetails = async () => {
    if (!editFirstName || !editLastName || !editPhone || !editDob) {
        showError(t("all_fields_required"));
        return;
    }
    
    const updatedData: Partial<Profile> & { id: string } = {
        id: member.id,
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone,
        dob: editDob,
    };
    
    try {
        await updateProfile(updatedData);
        showSuccess(t("member_profile_updated_success", { name: `${editFirstName} ${editLastName}` }));
        setIsEditing(false);
    } catch (error) {
        showError(t("update_failed"));
    }
  };

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
            <User className="h-5 w-5" /> {member.first_name} {member.last_name} ({member.member_code || member.id.substring(0, 8)}...)
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="edit-first-name">{t("first_name")}</Label>
                            <Input id="edit-first-name" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-last-name">{t("last_name")}</Label>
                            <Input id="edit-last-name" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-email">{t("email")}</Label>
                            <Input id="edit-email" type="email" value={editEmail || ''} disabled /> {/* Email is read-only (Auth managed) */}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-phone">{t("phone_number")}</Label>
                            <Input id="edit-phone" value={editPhone || ''} onChange={(e) => setEditPhone(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-dob">{t("date_of_birth")}</Label>
                            <Input id="edit-dob" type="date" value={editDob || ''} onChange={(e) => setEditDob(e.target.value)} />
                        </div>
                        <div className="col-span-2 pt-2">
                            <Button onClick={handleSaveBasicDetails} className="w-full" disabled={isSaving}>
                                <Save className="h-4 w-4 mr-2" /> {t("save_member_changes")}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {member.first_name} {member.last_name}</p>
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {member.email || 'N/A'}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {member.phone || 'N/A'}</p>
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {member.dob || 'N/A'}</p>
                    </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("membership_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("plan")}:</span>
                    <span className="font-medium">{member.plan_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("start_date")}:</span>
                    <span className="font-medium">{member.start_date || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("expiration")}:</span>
                    <span className="font-medium">{member.expiration_date || 'N/A'}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("current_status")}:</span>
                    <Badge variant={getStatusVariant(member.status)}>{t(member.status || 'Pending')}</Badge>
                </div>
                
                {member.status !== 'Active' && (
                    <Button 
                        variant="outline" 
                        className="w-full mt-4 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => setActiveTab('renewal')}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" /> {t("renew_membership_now")}
                    </Button>
                )}
              </CardContent>
            </Card>
            
            <MemberStatusActions member={member} />
          </TabsContent>
          
          {/* Renewal Tab */}
          <TabsContent value="renewal" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("renew_membership_for", { name: `${member.first_name} ${member.last_name}` })}</CardTitle>
              </CardHeader>
              <CardContent>
                <MemberRenewalForm member={member} />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" /> {t("recent_transactions_title", { count: transactions?.length || 0 })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-3 text-center">
                            <p className="text-xs text-muted-foreground">{t("total_check_ins")}</p>
                            <p className="text-2xl font-bold text-primary">{member.total_check_ins || 0}</p>
                        </Card>
                        <Card className="p-3 text-center md:col-span-3">
                            <p className="text-xs text-muted-foreground">{t("last_check_in")}</p>
                            <p className="text-lg font-bold text-primary mt-1">
                                {member.last_check_in ? format(new Date(member.last_check_in), 'yyyy-MM-dd hh:mm a') : 'N/A'}
                            </p>
                        </Card>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    {isLoadingTransactions ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : transactions && transactions.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                                    <div className="text-sm min-w-0 flex-1">
                                        <p className="font-medium truncate">{tx.item_description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {tx.transaction_date} | {t(tx.payment_method.toLowerCase())}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-base text-green-600">{formatCurrency(tx.amount)}</p>
                                        <Badge variant="secondary" className="text-xs">{t(tx.type.replace(/\s/g, '_').toLowerCase())}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">{t("no_recent_transactions")}</p>
                    )}
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