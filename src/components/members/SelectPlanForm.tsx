import React from 'react';
import { useTranslation } from 'react-i18next';
import { MembershipPlan } from '@/types/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { usePlans } from '@/integrations/supabase/data/use-plans';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/currency-utils';

interface SelectPlanFormProps {
  form: any; // Use any for react-hook-form instance passed from parent
  onPlanSelect: (plan: MembershipPlan) => void;
  selectedPlanId: string | undefined;
}

export const SelectPlanForm: React.FC<SelectPlanFormProps> = ({ form, onPlanSelect, selectedPlanId }) => {
  const { t } = useTranslation();
  const { data: membershipPlans, isLoading: isLoadingPlans } = usePlans();

  const handleValueChange = (planId: string) => {
    form.setValue('planId', planId, { shouldValidate: true });
    const selectedPlan = membershipPlans?.find(p => p.id === planId);
    if (selectedPlan) {
      onPlanSelect(selectedPlan);
    }
  };

  return (
    <div className="space-y-4">
      {isLoadingPlans ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <FormField
          control={form.control}
          name="planId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("select_new_plan")}</FormLabel>
              <Select onValueChange={handleValueChange} value={selectedPlanId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_a_plan")} />
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
      
      {selectedPlanId && membershipPlans && (
        <div className="mt-4 p-3 border rounded-md bg-secondary/50 text-sm">
          <p className="font-semibold">{t("plan_details")}:</p>
          <p>{t("duration")}: {membershipPlans.find(p => p.id === selectedPlanId)?.duration_days} {t("days")}</p>
          <p>{t("price")}: {formatCurrency(membershipPlans.find(p => p.id === selectedPlanId)?.price || 0)}</p>
        </div>
      )}
    </div>
  );
};