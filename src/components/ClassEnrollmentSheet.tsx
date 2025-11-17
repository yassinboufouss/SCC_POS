import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { GymClass } from '@/data/class-schedule';
import { mockEnrollments } from '@/data/enrollment';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ClassEnrollmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClass: GymClass | null;
}

const ClassEnrollmentSheet: React.FC<ClassEnrollmentSheetProps> = ({ open, onOpenChange, selectedClass }) => {
  if (!selectedClass) return null;

  const enrollments = mockEnrollments.filter(e => e.classId === selectedClass.id);
  const isFull = selectedClass.currentEnrollment >= selectedClass.capacity;

  const handleRemoveMember = (memberId: string) => {
    // Placeholder for removal logic
    console.log(`Removing member ${memberId} from class ${selectedClass.name}`);
    // In a real app, this would trigger a state update/API call
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">{selectedClass.name}</SheetTitle>
          <SheetDescription>
            {selectedClass.day} at {selectedClass.time} with {selectedClass.trainer}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center p-3 border rounded-md bg-muted/50">
            <p className="font-semibold">Capacity:</p>
            <Badge variant={isFull ? "destructive" : "default"} className="text-base py-1">
              {selectedClass.currentEnrollment} / {selectedClass.capacity} Enrolled
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-4 w-4" /> Enrolled Members ({enrollments.length})
          </h3>

          <ScrollArea className="flex-1 border rounded-md">
            <div className="p-4 space-y-3">
              {enrollments.length > 0 ? (
                enrollments.map((enrollment) => (
                  <div key={enrollment.memberId} className="flex items-center justify-between p-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{enrollment.memberName}</p>
                      <p className="text-xs text-muted-foreground">ID: {enrollment.memberId} | Enrolled: {enrollment.enrollmentDate}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:bg-red-100"
                      onClick={() => handleRemoveMember(enrollment.memberId)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No members currently enrolled.</p>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <Button className="mt-auto">
          Add Member to Class
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default ClassEnrollmentSheet;