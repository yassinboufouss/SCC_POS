import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Member } from '@/data/members';
import { membershipPlans } from '@/data/membership-plans';
import { renewMemberPlan } from '@/utils/member-utils';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { format, addDays } from 'date-fns';
import { CreditCard, Ticket } from 'lucide-react';

interface MemberRenewalFormProps {
  member: Member;
  onRenewalSuccess: (updatedMember: Member) => void;
}

const formSchema = z.object({
  planId: z.string().min(1, { message: "Please select a membership plan." }),
  paymentMethod: z.enum(['Card', 'Cash', 'Transfer'], { required_error: "Please select a payment method." }),
});

type RenewalFormValues = z.infer<typeof formSchema>;

const MemberRenewalForm: React.FC<MemberRenewalFormProps> = ({ member, onRenewalSuccess }) => {
  const { t } = useTranslation();
  
  const form = useForm<RenewalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: '',
      paymentMethod: 'Card',
    },
  });
  
  const selectedPlanId = form.watch('planId');
  const selectedPlan = membershipPlans.find(p => p.id === selectedPlanId);

  const renewalSummary = useMemo(() => {
    if (!selectedPlan) {
      return { newStartDate: null, newExpiration: null, totalDue: 0 };
    }

    const today = new Date();
    const currentExpiration = new Date(member.expirationDate);
    
    let newStartDate = today;
    
    // If membership is still active (expiration date is in the future), start the new plan immediately after the current one ends.
    if (currentExpiration.getTime() > today.getTime()) {
        newStartDate = addDays(currentExpiration, 1);
    }
    
    const newExpirationDate = addDays(newStartDate, selectedPlan.durationDays);

    return {
      newStartDate: format(newStartDate, 'MMM dd, yyyy'),
      newExpiration: format(newExpirationDate, 'MMM dd, yyyy'),
      totalDue: selectedPlan.price,
    };
  }, [selectedPlan, member.expirationDate]);


  const onSubmit = (values: RenewalFormValues) => {
    const updatedMember = renewMemberPlan(member.id, values.planId);

    if (updatedMember) {
      // In a real app, we would also record a transaction here using values.paymentMethod
      showSuccess(t("renewal_success", { name: updatedMember.name, date: updatedMember.expirationDate }));
      onRenewalSuccess(updatedMember);
    } else {
      showError(t("renewal_failed"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Current Status */}
        <div className="p-3 border rounded-md bg-secondary/50 text-sm">
            <p className="font-semibold">{t("current_status_colon")} <span className="font-bold text-primary">{t(member.status)}</span></p>
            <p className="text-xs text-muted-foreground">{t("previous_expiration")}: {member.expirationDate}</p>
        </div>

        {/* Plan Selection */}
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
                  {membershipPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} (${plan.price.toFixed(2)}) - {plan.durationDays} {t("days")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
              <span>${renewalSummary.totalDue.toFixed(2)}</span>
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

        <Button type="submit" className="w-full" disabled={!selectedPlan || form.formState.isSubmitting}>
          {t("process_renewal_payment")}
        </Button>
      </form>
    </Form>
  );
};

export default MemberRenewalForm;