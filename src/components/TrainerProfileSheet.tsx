import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Trainer } from '@/data/trainers';
import { classSchedule } from '@/data/class-schedule';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dumbbell, Star, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface TrainerProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTrainer: Trainer | null;
}

const TrainerProfileSheet: React.FC<TrainerProfileSheetProps> = ({ open, onOpenChange, selectedTrainer }) => {
  if (!selectedTrainer) return null;

  const trainerClasses = classSchedule.filter(cls => cls.trainer === selectedTrainer.name);

  const statusVariant = selectedTrainer.status === 'Active' ? 'default' : 'destructive';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">{selectedTrainer.name}</SheetTitle>
          <SheetDescription>
            Specialty: {selectedTrainer.specialty}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4 flex-1 flex flex-col">
          
          {/* Trainer Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-md bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={statusVariant} className="mt-1 text-base py-1">
                {selectedTrainer.status}
              </Badge>
            </div>
            <div className="p-3 border rounded-md bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground">Member Rating</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold">{selectedTrainer.memberRating.toFixed(1)}</span>
              </div>
            </div>
            <div className="p-3 border rounded-md bg-muted/50 col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Total Classes Taught</p>
              <span className="text-lg font-bold">{selectedTrainer.classesTaught}</span>
            </div>
          </div>

          <Separator />

          {/* Assigned Classes */}
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Dumbbell className="h-4 w-4" /> Assigned Classes ({trainerClasses.length})
          </h3>

          <ScrollArea className="flex-1 border rounded-md h-64">
            <div className="p-4 space-y-3">
              {trainerClasses.length > 0 ? (
                trainerClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {cls.day} | <Clock className="h-3 w-3" /> {cls.time}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {cls.currentEnrollment}/{cls.capacity}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No classes currently assigned.</p>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="mt-auto pt-4 border-t">
            <Button className="w-full">
                Manage Schedule
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TrainerProfileSheet;