import React, { useState, useMemo } from 'react';
import { Profile } from '@/types/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMember } from '@/integrations/supabase/data/use-members.ts';
import { useMemberTransactions } from '@/integrations/supabase/data/use-transactions.ts';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRole } from '@/hooks/use-user-role';
import MemberProfileTab from './MemberProfileTab'; // NEW
import MemberRenewalTab from './MemberRenewalTab'; // NEW
import MemberHistoryTab from './MemberHistoryTab'; // NEW

interface MemberProfileDialogProps {
  member: Profile; // Initial member data from the list
  canEdit: boolean; // New prop to control editing access (passed from parent, e.g., MembersPage)
  isDialogOpen?: boolean; // NEW: External control
  setIsDialogOpen?: (open: boolean) => void; // NEW: External control
}

const MemberProfileDialog: React.FC<MemberProfileDialogProps> = ({ member, canEdit, isDialogOpen: externalOpen, setIsDialogOpen: setExternalOpen }) => {
  const { t } = useTranslation();
  
  // Determine which state setter/getter to use
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined && setExternalOpen !== undefined;
  const isDialogOpen = isControlled ? externalOpen : internalOpen;
  const setIsDialogOpen = isControlled ? setExternalOpen : setInternalOpen;
  
  const [activeTab, setActiveTab] = useState('profile'); 
  const { isOwner, isStaff } = useUserRole(); 
  
  // Fetch the freshest member data when the dialog is open
  const { data: currentMember, isLoading: isLoadingMember } = useMember(member.id);
  
  // Use the freshest data available, fall back to prop if loading or not fetched yet
  const displayMember = currentMember || member;

  const { data: transactions, isLoading: isLoadingTransactions } = useMemberTransactions(displayMember.id);

  // Staff (and Owner) should be able to renew members
  const canRenew = isOwner || isStaff; 
  // Staff (and Owner) should be able to check members in
  const canCheckIn = isOwner || isStaff; 
  // Only Owner can perform status actions (Freeze/Cancel)
  const canChangeStatus = isOwner; 
  
  const handleOpenChange = (open: boolean) => {
      setIsDialogOpen(open);
      if (open) {
          // If membership is inactive, default to the renewal tab
          if (displayMember.status !== 'Active' && canRenew) {
              setActiveTab('renewal');
          } else {
              setActiveTab('profile');
          }
      } else {
          // Reset tab state when closing
          setActiveTab('profile');
      }
  };
  
  const getRoleVariant = (role: Profile['role']) => {
    switch (role) {
      case 'owner':
        return 'destructive';
      case 'manager':
      case 'cashier':
        return 'default';
      case 'member':
        return 'secondary';
      default:
        return 'outline';
    }
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
      {/* Only render trigger if not externally controlled */}
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> {displayMember.first_name} {displayMember.last_name} ({displayMember.member_code || displayMember.id.substring(0, 8)}...)
          </DialogTitle>
          <div className="pt-1">
            <Badge variant={getRoleVariant(displayMember.role)} className="text-sm">
                {t(displayMember.role || 'member')}
            </Badge>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">{t("member_details")}</TabsTrigger>
            <TabsTrigger value="renewal" disabled={!canRenew}>{t("renew_membership")}</TabsTrigger>
            <TabsTrigger value="history">{t("activity_history")}</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab Content */}
          <TabsContent value="profile" className="mt-4">
            <MemberProfileTab 
                member={displayMember}
                canEdit={canEdit}
                canRenew={canRenew}
                canCheckIn={canCheckIn}
                canChangeStatus={canChangeStatus}
                onRenewClick={() => setActiveTab('renewal')}
            />
          </TabsContent>
          
          {/* Renewal Tab Content */}
          <TabsContent value="renewal" className="mt-4">
            <MemberRenewalTab member={displayMember} canRenew={canRenew} />
          </TabsContent>
          
          {/* History Tab Content */}
          <TabsContent value="history" className="mt-4">
            <MemberHistoryTab 
                member={displayMember} 
                transactions={transactions} 
                isLoadingTransactions={isLoadingTransactions} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MemberProfileDialog;