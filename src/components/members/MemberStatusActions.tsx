import React, { useState } from 'react';
import { Profile } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Pause, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUpdateMemberStatus } from '@/integrations/supabase/data/use-members.ts';
import { showSuccess, showError } from '@/utils/toast';

interface MemberStatusActionsProps {
  member: Profile;
}

const MemberStatusActions: React.FC<MemberStatusActionsProps> = ({ member }) => {
  const { t } = useTranslation();
  const [isFreezeOpen, setIsFreezeOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const { mutateAsync: updateStatus, isPending } = useUpdateMemberStatus();

  const handleStatusChange = async (newStatus: 'Pending' | 'Expired', actionKey: 'freeze' | 'cancel') => {
    try {
        const updatedMember = await updateStatus({ profileId: member.id, newStatus });

        if (updatedMember) {
            showSuccess(t(`${actionKey}_success`, { name: `${updatedMember.first_name} ${updatedMember.last_name}` }));
            setIsFreezeOpen(false);
            setIsCancelOpen(false);
        } else {
            showError(t(`${actionKey}_failed`, { name: `${member.first_name} ${member.last_name}` }));
        }
    } catch (error) {
        showError(t(`${actionKey}_failed`, { name: `${member.first_name} ${member.last_name}` }));
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">{t("membership_action")}</h4>
      <p className="text-sm text-muted-foreground">{t("select_action_for", { name: `${member.first_name} ${member.last_name}`, plan: member.plan_name })}</p>

      {/* Freeze Membership */}
      <Dialog open={isFreezeOpen} onOpenChange={setIsFreezeOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start" disabled={member.status === 'Pending'}>
            <Pause className="h-4 w-4 mr-2 text-yellow-500" />
            {t("freeze_membership")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" /> {t("confirm_action", { action: t("freeze_membership") })}
            </DialogTitle>
            <DialogDescription>
              {t("freeze_description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFreezeOpen(false)}>{t("close")}</Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStatusChange('Pending', 'freeze')}
              disabled={isPending}
            >
              {t("freeze_membership")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Membership */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-red-500 border-red-200 hover:bg-red-50">
            <XCircle className="h-4 w-4 mr-2" />
            {t("cancel_membership")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" /> {t("confirm_action", { action: t("cancel_membership") })}
            </DialogTitle>
            <DialogDescription>
              {t("cancel_description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)}>{t("close")}</Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStatusChange('Expired', 'cancel')}
              disabled={isPending}
            >
              {t("cancel_membership")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberStatusActions;