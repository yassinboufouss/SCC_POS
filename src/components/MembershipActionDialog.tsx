import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Member } from '@/data/members';
import { showSuccess, showError } from '@/utils/toast';
import { freezeMemberPlan, cancelMemberPlan } from '@/utils/member-utils';
import { AlertTriangle, PauseCircle, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MembershipActionDialogProps {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionSuccess: (member: Member) => void;
}

const MembershipActionDialog: React.FC<MembershipActionDialogProps> = ({ member, open, onOpenChange, onActionSuccess }) => {
  const [actionType, setActionType] = useState<'freeze' | 'cancel' | null>(null);

  const handleAction = () => {
    let updatedMember: Member | null = null;
    
    if (actionType === 'freeze') {
      updatedMember = freezeMemberPlan(member.id);
      if (updatedMember) {
        showSuccess(`${member.name}'s membership has been frozen (Status: Pending).`);
      } else {
        showError(`Failed to freeze membership for ${member.name}.`);
      }
    } else if (actionType === 'cancel') {
      updatedMember = cancelMemberPlan(member.id);
      if (updatedMember) {
        showSuccess(`${member.name}'s membership has been permanently cancelled.`);
      } else {
        showError(`Failed to cancel membership for ${member.name}.`);
      }
    }

    if (updatedMember) {
      onActionSuccess(updatedMember);
    }
    onOpenChange(false);
    setActionType(null);
  };
  
  const handleOpenChange = (newOpen: boolean) => {
      if (!newOpen) {
          setActionType(null);
      }
      onOpenChange(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" /> Membership Action
          </DialogTitle>
          <DialogDescription>
            Select an action for {member.name}'s membership ({member.plan}).
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
            {/* Freeze Option */}
            <div 
                className={`p-4 border rounded-md cursor-pointer transition-all ${actionType === 'freeze' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/50' : 'hover:bg-muted/50'}`}
                onClick={() => setActionType('freeze')}
            >
                <div className="flex items-center gap-3">
                    <PauseCircle className="h-5 w-5 text-blue-500" />
                    <div>
                        <p className="font-semibold">Freeze Membership</p>
                        <p className="text-sm text-muted-foreground">Temporarily suspend access. Status will be set to 'Pending'.</p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Cancel Option */}
            <div 
                className={`p-4 border rounded-md cursor-pointer transition-all ${actionType === 'cancel' ? 'border-red-500 bg-red-50/50 dark:bg-red-950/50' : 'hover:bg-muted/50'}`}
                onClick={() => setActionType('cancel')}
            >
                <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                        <p className="font-semibold">Cancel Membership</p>
                        <p className="text-sm text-muted-foreground">Permanently terminate the membership. Status will be set to 'Expired'.</p>
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            variant={actionType === 'cancel' ? 'destructive' : 'default'} 
            onClick={handleAction} 
            disabled={!actionType}
          >
            Confirm {actionType === 'freeze' ? 'Freeze' : actionType === 'cancel' ? 'Cancellation' : 'Action'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipActionDialog;