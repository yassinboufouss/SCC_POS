import React, { useMemo } from 'react';
import { Profile } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProcessCheckIn } from '@/integrations/supabase/data/use-members.ts';
import { showSuccess, showError } from '@/utils/toast';
import { isToday } from 'date-fns';

interface MemberCheckInButtonProps {
  member: Profile;
  onCheckInSuccess?: (updatedMember: Profile) => void;
}

const MemberCheckInButton: React.FC<MemberCheckInButtonProps> = ({ member, onCheckInSuccess }) => {
  const { t } = useTranslation();
  const { mutateAsync: processCheckIn, isPending } = useProcessCheckIn();

  const isCheckedInToday = useMemo(() => {
    if (!member.last_check_in) return false;
    return isToday(new Date(member.last_check_in));
  }, [member.last_check_in]);

  const isActive = member.status === 'Active';
  const isDisabled = !isActive || isCheckedInToday || isPending;

  const handleCheckIn = async () => {
    if (!member.id || !isActive || isCheckedInToday) return;

    try {
        const checkedInMember = await processCheckIn({ 
            profileId: member.id, 
            currentCheckIns: member.total_check_ins || 0 
        });
        
        if (checkedInMember) {
            showSuccess(t("checked_in_successfully_profile", { name: `${checkedInMember.first_name} ${checkedInMember.last_name}` }));
            onCheckInSuccess?.(checkedInMember);
        } else {
            showError(t("checkin_failed", { name: `${member.first_name} ${member.last_name}` }));
        }
    } catch (error) {
        showError(t("checkin_failed", { name: `${member.first_name} ${member.last_name}` }));
    }
  };

  if (isCheckedInToday) {
    return (
      <Button variant="secondary" className="w-full justify-start text-green-600" disabled>
        <CheckCircle className="h-4 w-4 mr-2" />
        {t("already_checked_in")}
      </Button>
    );
  }
  
  if (!isActive) {
      return (
        <Button variant="outline" className="w-full justify-start text-muted-foreground" disabled>
            <Clock className="h-4 w-4 mr-2" />
            {t("cannot_check_in_inactive")}
        </Button>
      );
  }

  return (
    <Button 
      variant="default" 
      className="w-full justify-start" 
      onClick={handleCheckIn}
      disabled={isDisabled}
    >
      <UserCheck className="h-4 w-4 mr-2" />
      {isPending ? t("checking_in") : t("manual_check_in")}
    </Button>
  );
};

export default MemberCheckInButton;