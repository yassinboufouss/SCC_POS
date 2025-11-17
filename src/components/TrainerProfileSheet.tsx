import React, { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Trainer } from '@/data/trainers';
import { classSchedule } from '@/data/class-schedule';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dumbbell, Star, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess } from '@/utils/toast';
import { updateTrainer } from '@/utils/trainer-utils';

interface TrainerProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTrainer: Trainer | null;
}

const TrainerSpecialties = ['Yoga & Flexibility', 'HIIT & Spin', 'Weightlifting & Strength', 'Cardio', 'Pilates'] as const;
const TrainerStatuses = ['Active', 'On Leave'] as const;

const trainerSchema = z.object({
  specialty: z.enum(TrainerSpecialties, { required_error: "Specialty is required." }),
  status: z.enum(TrainerStatuses, { required_error: "Status is required." }),
});

type TrainerFormValues = z.infer<typeof trainerSchema>;

const TrainerProfileSheet: React.FC<TrainerProfileSheetProps> = ({ open, onOpenChange, selectedTrainer }) => {
  const form = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerSchema),
  });

  useEffect(() => {
    if (selectedTrainer) {
      form.reset({
        specialty: selectedTrainer.specialty as TrainerFormValues['specialty'],
        status: selectedTrainer.status as TrainerFormValues['status'],
      });
    }
  }, [selectedTrainer, form]);

  if (!selectedTrainer) return null;

  const trainerClasses = classSchedule.filter(cls => cls.trainer === selectedTrainer.name);

  const statusVariant = selectedTrainer.status === 'Active' ? 'default' : 'destructive';

  const onSubmit = (values: TrainerFormValues) => {
    const updatedTrainer: Trainer = {
      ...selectedTrainer,
      specialty: values.specialty,
      status: values.status,
    };

    updateTrainer(updatedTrainer);
    showSuccess(`Trainer ${updatedTrainer.name} profile updated.`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">{selectedTrainer.name}</SheetTitle>
          <SheetDescription>
            Specialty: {selectedTrainer.specialty}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
              
              {/* Trainer Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-md bg-muted/50">
                  <p className="text-sm font-medium text-muted-foreground">Member Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold">{selectedTrainer.memberRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="p-3 border rounded-md bg-muted/50">
                  <p className="text-sm font-medium text-muted-foreground">Total Classes Taught</p>
                  <span className="text-lg font-bold">{selectedTrainer.classesTaught}</span>
                </div>
              </div>

              <Separator />
              
              {/* Editable Fields */}
              <h3 className="text-lg font-semibold">Edit Details</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TrainerSpecialties.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TrainerStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Assigned Classes */}
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Dumbbell className="h-4 w-4" /> Assigned Classes ({trainerClasses.length})
              </h3>

              <div className="border rounded-md h-64">
                <ScrollArea className="h-full">
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
              
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
                    Save Trainer Changes
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default TrainerProfileSheet;