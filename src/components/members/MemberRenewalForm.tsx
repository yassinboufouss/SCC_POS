import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Profile } from '@/types/supabase';
import { usePlans } from '@/integrations/supabase/data/use-plans.ts';
import { useRenewMemberPlan } from '@/integrations/supabase/data/use-members.ts';
import { useAddTransaction } from '@/integrations/supabase/data/use-transactions.ts'; // Import transaction hook
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { format, addDays } from 'date-fns';
import { CreditCard, Ticket } from 'lucide-react';
import { formatCurrency } from '@/utils/currency-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentMethod } from '@/types/pos';

interface MemberRenewalFormProps {
  member: Profile;
}

const formSchema = z.object({
  planId: z.string().min(1, { message: "Please select a membership plan." }),
  paymentMethod: z.enum(['Card', 'Cash', 'Transfer'], { required_error: "Please select a payment method." }),
});

type RenewalFormValues = z.infer<typeof formSchema>;

const MemberRenewalForm: React.FC<MemberRenewalFormProps> = ({ member }) => {
  const { t } = useTranslation();
  const { data: membershipPlans, isLoading: isLoadingPlans } = usePlans();
  const { mutateAsync: renewPlan, isPending: isRenewing } = useRenewMemberPlan();
  const { mutateAsync: recordTransaction, isPending: isRecording } = useAddTransaction();
  
  const isPending = isRenewing || isRecording;

  const form = useForm<RenewalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: '',
      paymentMethod: 'Card',
    },
  });
  
  const selectedPlanId = form.watch('planId');
  const selectedPlan = membershipPlans?.find(p => p.id === selectedPlanId);

  const renewalSummary = useMemo(() => {
    if (!selectedPlan) {
      return { newStartDate: null, newExpiration: null, totalDue: 0 };
    }

    const today = new Date();
    const currentExpiration = member.expiration_date ? new Date(member.expiration_date) : today;
    
    let newStartDate = today;
    
    // If membership is still active (expiration date is in the future), start the new plan immediately after the current one ends.
    if (currentExpiration.getTime() > today.getTime()) {
        newStartDate = addDays(currentExpiration, 1);
    }
    
    const newExpirationDate = addDays(newStartDate, selectedPlan.duration_days);

    return {
      newStartDate: format(newStartDate, 'MMM dd, yyyy'),
      newExpiration: format(newExpirationDate, 'MMM dd, yyyy'),
      totalDue: selectedPlan.price,
    };
  }, [selectedPlan, member.expiration_date]);


  const onSubmit = async (values: RenewalFormValues) => {
    if (!selectedPlan) return;
    
    try {
        const updatedMember = await renewPlan({ profileId: member.id, planId: values.planId });

        if (updatedMember) {
            // 1. Record Transaction
            await recordTransaction({
                member_id: updatedMember.member_code || updatedMember.id,
                member_name: `${updatedMember.first_name} ${updatedMember.last_name}`,
                type: 'Membership',
                item_description: `${selectedPlan.name} Renewal (${selectedPlan.duration_days} days)`,
                amount: selectedPlan.price,
                payment_method: values.paymentMethod as PaymentMethod,
            });
            
            showSuccess(t("renewal_success", { name: `${updatedMember.first_name} ${updatedMember.last_name}`, date: updatedMember.expiration_date }));
            // Invalidation handled by hook
        } else {
            showError(t("renewal_failed"));
        }
    } catch (error) {
        showError(t("renewal_failed"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Current Status */}
        <div className="p-3 border rounded-md bg-secondary/50 text-sm">
            <p className="font-semibold">{t("current_status_colon")} <span className="font-bold text-primary">{t(member.status || 'Pending')}</span></p>
            <p className="text-xs text-muted-foreground">{t("previous_expiration")}: {member.expiration_date || 'N/A'}</p>
        </div>

        {/* Plan Selection */}
        {isLoadingPlans ? (
            <Skeleton className="h-24 w-full" />
        ) : (
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Ticket className="h-4 w-4" /> {t("select_new_plan")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("choose_a_membership_plan")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {membershipPlans?.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} ({formatCurrency(plan.price)}) - {plan.duration_days} {t("days")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}
        
        {/* Renewal Summary */}
        {selectedPlan && (
          <div className="space-y-2 p-4 border rounded-md">
            <h4 className="font-semibold">{t("renewal_summary")}</h4>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("start_date_colon")}</span>
              <span className="font-medium">{renewalSummary.newStartDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("new_expiration")}</span>
              <span className="font-medium text-green-600">{renewalSummary.newExpiration}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{t("total_due")}</span>
              <span>{formatCurrency(renewalSummary.totalDue)}</span>
            </div>
          </div>
        )}
        
        {/* Payment Method Selection */}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
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

        <Button type="submit" className="w-full" disabled={!selectedPlan || isPending}>
          {t("process_renewal_payment")}
        </Button>
      </form>
    </Form>
  );
};

export default MemberRenewalForm;