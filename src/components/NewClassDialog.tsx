import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess } from '@/utils/toast';
import { trainers } from '@/data/trainers';
import { useTranslation } from 'react-i18next';

const DaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const newClassSchema = z.object({
  name: z.string().min(2, { message: "Class name is required." }),
  trainerName: z.string().min(1, { message: "Trainer is required." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, { message: "Time must be in HH:MM AM/PM format (e.g., 07:00 AM)." }),
  day: z.enum(DaysOfWeek, { required_error: "Day is required." }),
  capacity: z.coerce.number().int().min(1, { message: "Capacity must be at least 1." }),
});

type NewClassFormValues = z.infer<typeof newClassSchema>;

const NewClassDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const form = useForm<NewClassFormValues>({
    resolver: zodResolver(newClassSchema),
    defaultValues: {
      name: "",
      trainerName: "",
      time: "",
      day: undefined,
      capacity: 10,
    },
  });

  const onSubmit = (values: NewClassFormValues) => {
    const newClass = {
      ...values,
      id: `CLS${Math.floor(Math.random() * 10000)}`, // Mock ID generation
      trainer: values.trainerName,
      currentEnrollment: 0,
    };
    
    console.log("Adding new class:", newClass);
    showSuccess(t("class_scheduled_success", { name: values.name }));
    
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> {t("add_new_class")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{t("schedule_new_class")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("class_name_label")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Zumba Basics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("trainer_label")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_assigned_trainer")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {trainers.filter(t => t.status === 'Active').map((trainer) => (
                        <SelectItem key={trainer.id} value={trainer.name}>
                          {trainer.name} ({trainer.specialty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("day")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("day")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DaysOfWeek.map((day) => (
                          <SelectItem key={day} value={day}>
                            {t(day.toLowerCase(), { defaultValue: day })}
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
                name="time"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{t("time_format")}</FormLabel>
                    <FormControl>
                      <Input placeholder="06:30 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("max_capacity")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="10" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-6" disabled={!form.formState.isValid}>
              {t("schedule_class")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewClassDialog;