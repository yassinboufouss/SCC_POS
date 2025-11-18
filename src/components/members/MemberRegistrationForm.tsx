import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { membershipPlans } from '@/data/membership-plans';
import { addMember } from '@/utils/member-utils';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { CalendarIcon, UserPlus } from 'lucide-react';
import { formatCurrency } from '@/utils/currency-utils';

interface MemberRegistrationFormProps {
  onSuccess: () => void;
}

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date of Birth must be in YYYY-MM-DD format." }),
  planId: z.string().min(1, { message: "Please select a membership plan." }),
});

type RegistrationFormValues = z.infer<typeof formSchema>;

const MemberRegistrationForm: React.FC<MemberRegistrationFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dob: format(new Date(2000, 0, 1), 'yyyy-MM-dd'), // Default to 2000-01-01
      planId: "",
    },
  });

  const onSubmit = (values: RegistrationFormValues) => {
    const newMember = addMember({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      dob: values.dob,
      planId: values.planId,
    });

    if (newMember) {
      showSuccess(t("registration_success", { name: newMember.name, date: newMember.expirationDate }));
      onSuccess();
    } else {
      showError(t("registration_failed"));
    }
  };
  
  const selectedPlan = membershipPlans.find(p => p.id === form.watch('planId'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("full_name")}</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input placeholder="jane.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("phone_number")}</FormLabel>
                <FormControl>
                  <Input placeholder="555-123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("date_of_birth")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="date" {...field} className="pr-8" />
                    <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Plan Selection */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">{t("membership_plan")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("choose_a_membership_plan")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_plan")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {membershipPlans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} ({formatCurrency(plan.price)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedPlan && (
              <div className="mt-4 p-3 border rounded-md bg-secondary/50 text-sm">
                <p className="font-semibold">{t("plan_details")}:</p>
                <p>{t("duration")}: {selectedPlan.durationDays} {t("days")}</p>
                <p>{t("price")}: {formatCurrency(selectedPlan.price)}</p>
                <p className="text-muted-foreground mt-1">{selectedPlan.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          <UserPlus className="h-4 w-4 mr-2" />
          {form.formState.isSubmitting ? t("register_member_process_payment") : t("register_member_process_payment")}
        </Button>
      </form>
    </Form>
  );
};

export default MemberRegistrationForm;