import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, UserCheck, UserX, Search, RefreshCw } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useProcessCheckIn } from '@/integrations/supabase/data/use-members.ts';
import { getProfileByMemberCode } from '@/utils/member-utils'; // Import the new utility
import { useTranslation } from 'react-i18next';
import { Profile } from '@/types/supabase';
import { format } from 'date-fns';

interface MemberCheckInScannerProps {
  // Optional callback when a member is successfully looked up (regardless of status)
  onMemberFound?: (member: Profile) => void;
}

const MemberCheckInScanner: React.FC<MemberCheckInScannerProps> = ({ onMemberFound }) => {
  const { t } = useTranslation();
  const [memberCode, setMemberCode] = useState('');
  const [memberInfo, setMemberInfo] = useState<Profile | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  
  const { mutateAsync: processCheckIn, isPending: isCheckingIn } = useProcessCheckIn();

  const handleCheckIn = async (code: string) => {
    setMemberInfo(null);
    setIsLookingUp(true);
    
    try {
        const member = await getProfileByMemberCode(code);
        
        if (member) {
          // Notify parent component immediately
          onMemberFound?.(member);
          
          if (member.status === 'Active' && member.id) {
            try {
                const checkedInMember = await processCheckIn({ 
                    profileId: member.id, 
                    currentCheckIns: member.total_check_ins || 0 
                });
                
                if (checkedInMember) {
                  setMemberInfo(checkedInMember);
                  showSuccess(`${checkedInMember.first_name} ${checkedInMember.last_name} ${t("checked_in_successfully")} ${t("total_check_ins")}: ${checkedInMember.total_check_ins}`);
                } else {
                  // If check-in failed (e.g., status changed mid-process), show current info
                  setMemberInfo(member);
                  showError(t("checkin_failed", { name: `${member.first_name} ${member.last_name}` }));
                }
            } catch (error) {
                setMemberInfo(member);
                showError(t("checkin_failed", { name: `${member.first_name} ${member.last_name}` }));
            }
          } else {
            setMemberInfo(member);
            showError(`${member.first_name} ${member.last_name}: ${t("membership_is", { status: t(member.status || 'Pending') })} ${t("cannot_check_in")}`);
          }
        } else {
          showError(t("member_code_not_found", { code }));
        }
    } catch (error) {
        showError(t("lookup_failed")); // Add a generic lookup failed message
    } finally {
        setMemberCode('');
        setIsLookingUp(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberCode.trim()) {
      handleCheckIn(memberCode.trim());
    }
  };

  const renderMemberStatus = () => {
    if (!memberInfo) return null;

    const isActive = memberInfo.status === 'Active';
    const statusClass = isActive ? 'text-green-600' : 'text-red-600';
    const Icon = isActive ? UserCheck : UserX;

    return (
      <div className="mt-4 p-3 border rounded-lg bg-background shadow-sm">
        <div className="flex items-center space-x-3">
          <Icon className={`h-6 w-6 ${statusClass} shrink-0`} />
          <div>
            <h3 className="text-lg font-semibold">{memberInfo.first_name} {memberInfo.last_name} ({memberInfo.member_code})</h3>
            <p className="text-xs text-muted-foreground">{memberInfo.plan_name} {t("plan")}</p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t space-y-1 text-sm">
          <p>{t("status")}: <span className={`font-bold ${statusClass}`}>{t(memberInfo.status || 'Pending')}</span></p>
          {memberInfo.last_check_in && (
            <p className="text-xs text-muted-foreground">{t("last_check_in")}: {format(new Date(memberInfo.last_check_in), 'yyyy-MM-dd hh:mm a')}</p>
          )}
          
          {!isActive && (
            <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-blue-600 flex items-center"
                onClick={() => onMemberFound?.(memberInfo)} // Re-trigger onMemberFound for POS context
            >
                <RefreshCw className="h-3 w-3 mr-1" /> {t("renew_membership_now")}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4">
      <CardHeader className="p-0 mb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <QrCode className="h-5 w-5" /> {t("member_check_in_system")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder={t("enter_member_id")}
            value={memberCode}
            onChange={(e) => setMemberCode(e.target.value)}
            className="flex-1 h-10"
            disabled={isCheckingIn || isLookingUp}
          />
          <Button type="submit" size="sm" disabled={isCheckingIn || isLookingUp}>
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        {renderMemberStatus()}
        
      </CardContent>
    </Card>
  );
};

export default MemberCheckInScanner;