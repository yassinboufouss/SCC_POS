import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { GymClass } from '@/data/class-schedule';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, XCircle, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { addEnrollment, removeEnrollment, getEnrollmentsByClass } from '@/utils/class-utils';
import { showSuccess, showError } from '@/utils/toast';
import { Member } from '@/data/members';
import MemberSelectDialog from './MemberSelectDialog';
import { useTranslation } from 'react-i18next';

interface ClassEnrollmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClass: GymClass | null;
}

const ClassEnrollmentSheet: React.FC<ClassEnrollmentSheetProps> = ({ open, onOpenChange, selectedClass }) => {
  const { t } = useTranslation();
  const [enrollments, setEnrollments] = useState(getEnrollmentsByClass(selectedClass?.id || ''));
  const [localClass, setLocalClass] = useState(selectedClass);

  useEffect(() => {
    if (selectedClass) {
      // Re-fetch enrollments and update local class details whenever the sheet opens or selectedClass changes
      setEnrollments(getEnrollmentsByClass(selectedClass.id));
      setLocalClass(selectedClass);
    }
  }, [selectedClass, open]);

  if (!localClass) return null;

  const isFull = localClass.currentEnrollment >= localClass.capacity;

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (removeEnrollment(memberId, localClass.id)) {
      // Update local state and class count
      setEnrollments(prev => prev.filter(e => e.memberId !== memberId));
      setLocalClass(prev => prev ? { ...prev, currentEnrollment: prev.currentEnrollment - 1 } : null);
      showSuccess(t("member_removed_success", { name: memberName, class: localClass.name }));
    } else {
      showError(t("member_remove_failed", { name: memberName }));
    }
  };
  
  const handleAddMember = (member: Member | null) => {
    if (!member) return;
    
    if (isFull) {
        showError(t("class_is_full", { name: localClass.name }));
        return;
    }
    
    // Check if member is already enrolled (client-side check before utility call)
    if (enrollments.some(e => e.memberId === member.id)) {
        showError(t("member_already_enrolled", { name: member.name }));
        return;
    }

    const newEnrollment = addEnrollment(member.id, member.name, localClass.id);
    
    if (newEnrollment) {
        // Update local state and class count
        setEnrollments(prev => [...prev, newEnrollment]);
        setLocalClass(prev => prev ? { ...prev, currentEnrollment: prev.currentEnrollment + 1 } : null);
        showSuccess(t("member_enrolled_success", { name: member.name, class: localClass.name }));
    } else {
        showError(t("enrollment_failed", { name: member.name }));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">{localClass.name}</SheetTitle>
          <SheetDescription>
            {localClass.day} {t("at")} {localClass.time} {t("with")} {localClass.trainer}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center p-3 border rounded-md bg-muted/50">
            <p className="font-semibold">{t("capacity")}</p>
            <Badge variant={isFull ? "destructive" : "default"} className="text-base py-1">
              {localClass.currentEnrollment} / {localClass.capacity} {t("enrolled")}
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-4 w-4" /> {t("enrolled_members", { count: enrollments.length })}
          </h3>

          <ScrollArea className="flex-1 border rounded-md">
            <div className="p-4 space-y-3">
              {enrollments.length > 0 ? (
                enrollments.map((enrollment) => (
                  <div key={enrollment.memberId} className="flex items-center justify-between p-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{enrollment.memberName}</p>
                      <p className="text-xs text-muted-foreground">{t("id")}: {enrollment.memberId} | {t("enrolled")}: {enrollment.enrollmentDate}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:bg-red-100"
                      onClick={() => handleRemoveMember(enrollment.memberId, enrollment.memberName)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">{t("no_members_enrolled")}</p>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Add Member Dialog Trigger */}
        <MemberSelectDialog 
            onSelectMember={handleAddMember} 
            selectedMember={null} 
            trigger={
                <Button className="w-full mt-auto" disabled={isFull}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {t("add_member_to_class")}
                </Button>
            }
        />
      </SheetContent>
    </Sheet>
  );
};

export default ClassEnrollmentSheet;