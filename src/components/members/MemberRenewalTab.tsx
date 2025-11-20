import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Profile, MembershipPlan } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberRenewalForm } from './MemberRenewalForm';
import { SelectPlanForm } from './SelectPlanForm';
import { calculateRenewalDates } from '@/utils/date-utils';
import { formatCurrency } from '@/utils/currency-utils';
import { usePlans } from '@/integrations/supabase/data/use-plans';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface MemberRenewalTabProps {
  member: Profile;
  canRenew: boolean;
}

// Define a minimal form schema just to hold the selected plan ID
const planSelectionSchema = z.object({
    planId: z.string().min(1, { message: "Please select a plan." }),
});

type PlanSelectionFormValues = z.infer<typeof planSelectionSchema>;

const MemberRenewalTab: React.FC<MemberRenewalTabProps> = ({ member, canRenew }) => {
  const { t } = useTranslation();
  const { data: allPlans, isLoading: isLoadingPlans } = usePlans();
  
  const form = useForm<PlanSelectionFormValues>({
    resolver: zodResolver(planSelectionSchema),
    defaultValues: {
        planId: member.plan_name ? allPlans?.find(p => p.name === member.plan_name)?.id || '' : '',
    }
  });
  
  const selectedPlanId = form.watch('planId');
  const selectedPlan = allPlans?.find(p => p.id === selectedPlanId);
  
  const { newExpiration } = calculateRenewalDates(member.expiration_date, selectedPlan?.duration_days || 0);
  
  const totalDue = selectedPlan?.price || 0;
  
  const handlePlanSelect = (plan: MembershipPlan) => {
      // This is handled by the form's onValueChange in SelectPlanForm
  };
  
  const handleRenewalSuccess = () => {
      // Reset form state or close dialog if needed
  };

  if (isLoadingPlans) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  if (!canRenew) {
      return (
          <div className="text-center text-red-500 py-8">
              {t("access_denied")}
          </div>
      );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t("renew_membership_for", { name: `${member.first_name} ${member.last_name}` })}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* 1. Plan Selection */}
        <SelectPlanForm 
            form={form} 
            onPlanSelect={handlePlanSelect} 
            selectedPlanId={selectedPlanId}
        />
        
        {/* 2. Renewal Form (Conditional on plan selection) */}
        {selectedPlan ? (
            <MemberRenewalForm 
                profile={member} 
                selectedPlan={selectedPlan} 
                totalDue={totalDue} 
                onSuccess={handleRenewalSuccess} 
            />
        ) : (
            <div className="p-4 border rounded-lg bg-yellow-50/50 text-center text-sm text-yellow-700">
                {t("select_plan_error")}
            </div>
        )}
        
      </CardContent>
    </Card>
  );
};

export default MemberRenewalTab;