import React, { useState, useMemo } from 'react';
import { Member, mockMembers } from '@/data/members';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Calendar, Clock, DollarSign, Edit, RefreshCw, XCircle, History, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTransactionsByMemberId } from '@/utils/transaction-utils';
import MemberRenewalForm from './MemberRenewalForm';
import MemberStatusActions from './MemberStatusActions';
import { updateMember } from '@/utils/member-utils';
import { showSuccess, showError } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/currency-utils';

interface MemberProfileDialogProps {
  member: Member;
  onUpdate: (updatedMember: Member) => void;
}

const MemberProfileDialog: React.FC<MemberProfileDialogProps> = ({ member, onUpdate }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState(member);
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for editing basic info
  const [editName, setEditName] = useState(currentMember.name);
  const [editEmail, setEditEmail] = useState(currentMember.email);
  const [editPhone, setEditPhone] = useState(currentMember.phone);
  const [editDob, setEditDob] = useState(currentMember.dob);

  // Recalculate transactions whenever the dialog opens or member updates
  const transactions = useMemo(() => getTransactionsByMemberId(currentMember.id), [currentMember.id, isDialogOpen]);

  const getStatusVariant = (status: Member['status']) => {
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
  
  const handleMemberUpdate = (updatedMember: Member) => {
    setCurrentMember(updatedMember);
    onUpdate(updatedMember);
  };
  
  const handleSaveBasicDetails = () => {
    if (!editName || !editEmail || !editPhone || !editDob) {
        showError("All fields are required.");
        return;
    }
    
    const updatedMember: Member = {
        ...currentMember,
        name: editName,
        email: editEmail,
        phone: editPhone,
        dob: editDob,
    };
    
    updateMember(updatedMember);
    handleMemberUpdate(updatedMember);
    showSuccess(t("member_profile_updated_success", { name: updatedMember.name }));
    setIsEditing(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (open) {
            // Reset local state when opening
            setCurrentMember(member);
            setEditName(member.name);
            setEditEmail(member.email);
            setEditPhone(member.phone);
            setEditDob(member.dob);
            setIsEditing(false);
        }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> {currentMember.name} ({currentMember.id})
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full">
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
                            <Label htmlFor="edit-name">{t("full_name")}</Label>
                            <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-email">{t("email")}</Label>
                            <Input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-phone">{t("phone_number")}</Label>
                            <Input id="edit-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-dob">{t("date_of_birth")}</Label>
                            <Input id="edit-dob" type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} />
                        </div>
                        <div className="col-span-2 pt-2">
                            <Button onClick={handleSaveBasicDetails} className="w-full">
                                <Save className="h-4 w-4 mr-2" /> {t("save_member_changes")}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {currentMember.name}</p>
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {currentMember.email}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {currentMember.phone}</p>
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {currentMember.dob}</p>
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
                    <span className="font-medium">{currentMember.plan}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("start_date")}:</span>
                    <span className="font-medium">{currentMember.startDate}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("expiration")}:</span>
                    <span className="font-medium">{currentMember.expirationDate}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("current_status")}:</span>
                    <Badge variant={getStatusVariant(currentMember.status)}>{t(currentMember.status)}</Badge>
                </div>
                
                {currentMember.status !== 'Active' && (
                    <Button 
                        variant="outline" 
                        className="w-full mt-4 text-green-600 border-green-200 hover:bg-green-50"
                        // Note: We cannot directly switch tabs from here without passing the form control down, 
                        // but for a simple mock, we can rely on the user clicking the tab manually or implement a more complex state lift.
                        // For now, we'll just show the button.
                        onClick={() => console.log("Switch to renewal tab logic needed")}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" /> {t("renew_membership_now")}
                    </Button>
                )}
              </CardContent>
            </Card>
            
            <MemberStatusActions member={currentMember} onStatusUpdate={handleMemberUpdate} />
          </TabsContent>
          
          {/* Renewal Tab */}
          <TabsContent value="renewal" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("renew_membership_for", { name: currentMember.name })}</CardTitle>
              </CardHeader>
              <CardContent>
                <MemberRenewalForm member={currentMember} onRenewalSuccess={handleMemberUpdate} />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" /> {t("recent_transactions_title", { count: transactions.length })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-3 text-center">
                            <p className="text-xs text-muted-foreground">{t("total_check_ins")}</p>
                            <p className="text-2xl font-bold text-primary">{currentMember.totalCheckIns}</p>
                        </Card>
                        <Card className="p-3 text-center md:col-span-3">
                            <p className="text-xs text-muted-foreground">{t("last_check_in")}</p>
                            <p className="text-lg font-bold text-primary mt-1">{currentMember.lastCheckIn || 'N/A'}</p>
                        </Card>
                    </div>
                    
                    <Separator />
                    
                    {transactions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">{t("no_recent_transactions")}</p>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                                    <div className="text-sm min-w-0 flex-1">
                                        <p className="font-medium truncate">{tx.item}</p>
                                        <p className="text-xs text-muted-foreground">{tx.date} | {t(tx.paymentMethod.toLowerCase())}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-base text-green-600">{formatCurrency(tx.amount)}</p>
                                        <Badge variant="secondary" className="text-xs">{t(tx.type.replace(/\s/g, '_').toLowerCase())}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
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