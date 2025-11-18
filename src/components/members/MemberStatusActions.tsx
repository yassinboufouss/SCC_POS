import React, { useState } from 'react';
import { Member } from '@/data/members';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Pause, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updateMemberStatus } from '@/utils/member-utils';
import { showSuccess, showError } from '@/utils/toast';

interface MemberStatusActionsProps {
  member: Member;
  onStatusUpdate: (updatedMember: Member) => void;
}

const MemberStatusActions: React.FC<MemberStatusActionsProps> = ({ member, onStatusUpdate }) => {
  const { t } = useTranslation();
  const [isFreezeOpen, setIsFreezeOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const handleStatusChange = (newStatus: 'Pending' | 'Expired', actionKey: 'freeze' | 'cancel') => {
    const updatedMember = updateMemberStatus(member.id, newStatus);

    if (updatedMember) {
      showSuccess(t(`${actionKey}_success`, { name: updatedMember.name }));
      onStatusUpdate(updatedMember);
      setIsFreezeOpen(false);
      setIsCancelOpen(false);
    } else {
      showError(t(`${actionKey}_failed`, { name: member.name }));
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">{t("membership_action")}</h4>
      <p className="text-sm text-muted-foreground">{t("select_action_for", { name: member.name, plan: member.plan })}</p>

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