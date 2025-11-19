import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlans } from '@/integrations/supabase/data/use-plans.ts';
import { useRegisterMember, NewMemberInput } from '@/integrations/supabase/data/use-members.ts';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { CalendarIcon, UserPlus, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/utils/currency-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Profile, MembershipPlan } from '@/types/supabase'; // Import Profile and MembershipPlan type
import { PaymentMethod } from '@/types/pos'; // Import PaymentMethod type

interface MemberRegistrationFormProps {
  // Updated onSuccess signature to return registration result for parent to handle transaction
  onSuccess: (result: { member: Profile, plan: Pick<MembershipPlan, 'id' | 'name' | 'duration_days' | 'price' | 'giveaway_item_id'>, paymentMethod: PaymentMethod }) => void;
}

const formSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date of Birth must be in YYYY-MM-DD format." }),
  planId: z.string().min(1, { message: "Please select a membership plan." }),
  paymentMethod: z.enum(['Card', 'Cash', 'Transfer'], { required_error: "Please select a payment method." }),
});

type RegistrationFormValues = z.infer<typeof formSchema>;

const MemberRegistrationForm: React.FC<MemberRegistrationFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { data: membershipPlans, isLoading: isLoadingPlans } = usePlans();
  const { mutateAsync: registerMember, isPending: isRegistering } = useRegisterMember();
  
  const isPending = isRegistering;

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      dob: format(new Date(2000, 0, 1), 'yyyy-MM-dd'), // Default to 2000-01-01
      planId: "",
      paymentMethod: 'Cash',
    },
  });

  const onSubmit = async (values: RegistrationFormValues) => {
    const { planId, paymentMethod, ...memberDetails } = values;
    
    const registrationData: Omit<NewMemberInput, 'paymentMethod'> = {
      ...(memberDetails as Omit<NewMemberInput, 'paymentMethod'>),
      planId: planId,
    };

    try {
        // 1. Register the user and activate the plan via Edge Function
        const result = await registerMember(registrationData);

        if (!result || !result.profile) {
            showError(t("registration_failed"));
            return;
        }
        
        const { profile: newMember, plan: selectedPlan } = result;

        // 2. Pass data back to parent for transaction handling/cart addition
        // The plan object now includes giveaway_item_id from the Edge Function response
        onSuccess({ member: newMember, plan: selectedPlan, paymentMethod }); 
        
        // Reset form fields
        form.reset({
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            dob: format(new Date(2000, 0, 1), 'yyyy-MM-dd'),
            planId: values.planId, // Keep selected plan for quick re-registration
            paymentMethod: values.paymentMethod,
        });
        
    } catch (error) {
        showError(t("registration_failed"));
    }
  };
  
  const selectedPlan = membershipPlans?.find(p => p.id === form.watch('planId'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("first_name")}</FormLabel>
                <FormControl>
                  <Input placeholder="Jane" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Last Name */}
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("last_name")}</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
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
            {isLoadingPlans ? (
                <Skeleton className="h-10 w-full" />
            ) : (
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
                          {membershipPlans?.map(plan => (
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
            )}
            
            {selectedPlan && (
              <div className="mt-4 p-3 border rounded-md bg-secondary/50 text-sm">
                <p className="font-semibold">{t("plan_details")}:</p>
                <p>{t("duration")}: {selectedPlan.duration_days} {t("days")}</p>
                <p>{t("price")}: {formatCurrency(selectedPlan.price)}</p>
                <p className="text-muted-foreground mt-1">{selectedPlan.description}</p>
              </div>
            )}
            
            {/* Payment Method Selection */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="flex items-center gap-1"><CreditCard className="h-4 w-4" /> {t("select_payment_method")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_payment_method")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Card">{t("card")}</SelectItem>
                      <SelectItem value="Cash">{t("cash")}</SelectItem>
                      <SelectItem value="Transfer">{t("transfer")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isPending}>
          <UserPlus className="h-4 w-4 mr-2" />
          {isPending ? t("register_member_process_payment_loading") : t("register_member_process_payment")}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
            {t("email_update_confirmation_sent", { email: t("member_email") })}
        </p>
      </form>
    </Form>
  );
};

export default MemberRegistrationForm;