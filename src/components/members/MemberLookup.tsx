import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, Search, User, RefreshCw } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useProcessCheckIn } from '@/integrations/supabase/data/use-members.ts';
import { getProfileByMemberCode } from '@/utils/member-utils';
import { useTranslation } from 'react-i18next';
import { Profile } from '@/types/supabase';
import { format } from 'date-fns';
import MemberCheckInButton from './MemberCheckInButton';
import MemberProfileDialog from './MemberProfileDialog';
import { useUserRole } from '@/hooks/use-user-role';

const MemberLookup: React.FC = () => {
  const { t } = useTranslation();
  const { isOwner, isStaff } = useUserRole();
  const [memberCode, setMemberCode] = useState('');
  const [memberInfo, setMemberInfo] = useState<Profile | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false); // State for the profile dialog
  
  const { mutateAsync: processCheckIn, isPending: isCheckingIn } = useProcessCheckIn();

  const handleLookup = useCallback(async (code: string) => {
    setMemberInfo(null);
    setIsLookingUp(true);
    
    try {
        const member = await getProfileByMemberCode(code);
        
        if (member) {
          setMemberInfo(member);
          showSuccess(t("member_found", { name: `${member.first_name} ${member.last_name}` }));
        } else {
          showError(t("member_code_not_found", { code }));
        }
    } catch (error) {
        showError(t("lookup_failed"));
    } finally {
        setIsLookingUp(false);
    }
  }, [t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberCode.trim()) {
      handleLookup(memberCode.trim());
    }
  };
  
  const handleCheckInSuccess = (updatedMember: Profile) => {
      // Update local state with fresh data after check-in
      setMemberInfo(updatedMember);
  };
  
  const handleViewProfile = () => {
      setIsProfileDialogOpen(true);
  };
  
  // Allow all staff/owners to edit basic profile details
  const canEdit = isOwner || isStaff; 
  
  const MemberDialog = memberInfo ? (
      <MemberProfileDialog 
          member={memberInfo} 
          canEdit={canEdit} 
          isDialogOpen={isProfileDialogOpen}
          setIsDialogOpen={setIsProfileDialogOpen}
      />
  ) : null;


  return (
    <Card className="p-4">
      <CardHeader className="p-0 mb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <QrCode className="h-5 w-5" /> {t("member_check_in_system")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder={t("enter_member_id")}
            value={memberCode}
            onChange={(e) => setMemberCode(e.target.value)}
            className="flex-1 h-10"
            disabled={isCheckingIn || isLookingUp}
          />
          <Button type="submit" size="sm" disabled={isCheckingIn || isLookingUp}>
            {isLookingUp ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>
        
        {memberInfo && (
            <div className="space-y-4">
                <div className="p-3 border rounded-lg bg-background shadow-sm">
                    <div className="flex items-center space-x-3">
                        <User className={`h-6 w-6 ${memberInfo.status === 'Active' ? 'text-green-600' : 'text-red-600'} shrink-0`} />
                        <div>
                            <h3 className="text-lg font-semibold">{memberInfo.first_name} {memberInfo.last_name}</h3>
                            <p className="text-xs text-muted-foreground">{memberInfo.member_code} | {memberInfo.plan_name}</p>
                        </div>
                    </div>
                    <div className="mt-2 pt-2 border-t space-y-1 text-sm">
                        <p>{t("status")}: <span className={`font-bold ${memberInfo.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{t(memberInfo.status || 'Pending')}</span></p>
                        {memberInfo.last_check_in && (
                            <p className="text-xs text-muted-foreground">{t("last_check_in")}: {format(new Date(memberInfo.last_check_in), 'yyyy-MM-dd hh:mm a')}</p>
                        )}
                    </div>
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MemberCheckInButton member={memberInfo} onCheckInSuccess={handleCheckInSuccess} />
                    
                    <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleViewProfile}
                    >
                        <User className="h-4 w-4 mr-2" /> {t("view_full_profile")}
                    </Button>
                </div>
            </div>
        )}
        
      </CardContent>
      
      {/* Render the dialog outside the CardContent */}
      {MemberDialog}
    </Card>
  );
};

export default MemberLookup;