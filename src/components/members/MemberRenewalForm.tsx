import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Profile, MembershipPlan } from '@/types/supabase';
import { PaymentMethod } from '@/types/pos';
import { recordTransaction } from '@/integrations/supabase/data/use-transactions';
import { useRenewMemberPlan } from '@/integrations/supabase/data/use-members';
import { formatCurrency } from '@/utils/currency-utils';
import { calculateRenewalDates } from '@/utils/date-utils';

// Define the form schema
const renewalFormSchema = z.object({
  paymentMethod: z.enum(['Card', 'Cash', 'Transfer'], {
    required_error: "select_payment_method_error",
  }),
});

type RenewalFormValues = z.infer<typeof renewalFormSchema>;

interface MemberRenewalFormProps {
    profile: Profile;
    selectedPlan: MembershipPlan;
    totalDue: number;
    onSuccess: () => void;
}

export const MemberRenewalForm: React.FC<MemberRenewalFormProps> = ({ profile, selectedPlan, totalDue, onSuccess }) => {
  const { t } = useTranslation();
  const form = useForm<RenewalFormValues>({
    resolver: zodResolver(renewalFormSchema),
    defaultValues: {
      paymentMethod: 'Card',
    },
  });

  const { mutateAsync: renewMember, isPending: isRenewing } = useRenewMemberPlan();
  
  const { newExpiration } = calculateRenewalDates(profile.expiration_date, selectedPlan.duration_days);

  const onSubmit = async (values: RenewalFormValues) => {
    const paymentMethod = values.paymentMethod as PaymentMethod;
    const updatedProfile = profile; // Placeholder: In a real app, this might be the result of a prior step or the current profile

    try {
        // 1. Record Transaction
        await recordTransaction({
            member_id: updatedProfile.member_code || updatedProfile.id,
            member_name: updatedProfile.first_name + ' ' + updatedProfile.last_name,
            type: 'Membership',
            item_description: `Renewal: ${selectedPlan.name}`,
            amount: totalDue,
            payment_method: paymentMethod,
            items_data: [{
                sourceId: selectedPlan.id,
                name: selectedPlan.name,
                quantity: 1,
                price: selectedPlan.price,
                originalPrice: selectedPlan.price,
                type: 'membership',
            }],
            discount_percent: 0,
        });

        // 2. Renew the membership
        await renewMember({
            profileId: profile.id,
            planId: selectedPlan.id,
        });

        toast.success(t("renewal_success", { name: profile.first_name, date: newExpiration }));
        onSuccess();
    } catch (error) {
        console.error("Renewal failed:", error);
        toast.error(t("renewal_failed"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Renewal Summary */}
        <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold">{t("renewal_summary")}</h3>
            <p className="text-sm">{t("previous_expiration")}: {profile.expiration_date || t("N/A")}</p>
            <p className="text-sm">{t("new_expiration")}: <span className="font-medium text-primary">{newExpiration}</span></p>
            <p className="text-sm">{t("plan")}: {selectedPlan.name} ({selectedPlan.duration_days} {t("days")})</p>
            <p className="text-lg font-bold mt-2">{t("total_due")}: <span className="text-green-600">{formatCurrency(totalDue)}</span></p>
        </div>

        {/* Payment Method Selection */}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("select_payment_method")}</FormLabel>
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

        <Button type="submit" className="w-full" disabled={isRenewing}>
          {isRenewing ? t("processing_sale") : t("process_renewal_payment")}
        </Button>
      </form>
    </Form>
  );
};