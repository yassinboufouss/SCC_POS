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
import { useTranslation } from 'react-i18next';

const TrainerSpecialties = ['Yoga & Flexibility', 'HIIT & Spin', 'Weightlifting & Strength', 'Cardio', 'Pilates'] as const;

const newTrainerSchema = z.object({
  name: z.string().min(2, { message: "Trainer name is required." }),
  specialty: z.enum(TrainerSpecialties, { required_error: "Specialty is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number is required." }),
});

type NewTrainerFormValues = z.infer<typeof newTrainerSchema>;

const NewTrainerDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const form = useForm<NewTrainerFormValues>({
    resolver: zodResolver(newTrainerSchema),
    defaultValues: {
      name: "",
      specialty: undefined,
      email: "",
      phone: "",
    },
  });

  const onSubmit = (values: NewTrainerFormValues) => {
    const newTrainer = {
      ...values,
      id: `T${Math.floor(Math.random() * 10000)}`, // Mock ID generation
      status: 'Active',
      classesTaught: 0,
      memberRating: 5.0,
    };
    
    console.log("Registering new trainer:", newTrainer);
    showSuccess(t("trainer_registered_success", { name: values.name }));
    
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> {t("add_new_trainer")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{t("register_new_trainer")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("full_name_label")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("specialty")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_primary_specialty")} />
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane.doe@gym.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phone_number")}</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 555-5555" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-6" disabled={!form.formState.isValid}>
              {t("register_trainer")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTrainerDialog;