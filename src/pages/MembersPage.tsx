import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/integrations/supabase/data/query-keys';
import { Profile, MembershipPlan } from '@/types/supabase';
import { PaymentMethod } from '@/types/pos';
import { recordTransaction } from '@/integrations/supabase/data/use-transactions';
import { toast } from 'sonner';
import MemberRegistrationForm from '@/components/members/MemberRegistrationForm'; // FIX: Changed to default import
import { MemberTable } from '@/components/members/MemberTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

// Assuming this function is defined within the component or passed down
const handleRegistrationSuccess = async (member: Profile, plan: MembershipPlan, paymentMethod: PaymentMethod) => {
    const t = (key: string, options?: any) => key; // Placeholder for t function

    // Record Transaction for the membership fee immediately (since this is standalone registration)
    await recordTransaction({
        member_id: member.member_code || member.id,
        member_name: member.first_name + ' ' + member.last_name,
        type: 'Membership',
        item_description: `New Registration: ${plan.name}`,
        amount: plan.price,
        payment_method: paymentMethod,
        items_data: [{
            sourceId: plan.id,
            name: plan.name,
            quantity: 1,
            price: plan.price,
            originalPrice: plan.price,
            type: 'membership',
        }],
        discount_percent: 0,
    });

    toast.success(t("registration_success", { name: member.first_name, date: member.expiration_date }));
};

export const MembersPage = () => {
  const { t } = useTranslation();
  
  const { data: members, isLoading, error } = useQuery({
    queryKey: queryKeys.profiles.all,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'member');
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: queryKeys.plans.all,
    queryFn: async () => {
      const { data, error } = await supabase.from('membership_plans').select('*');
      if (error) throw error;
      return data as MembershipPlan[];
    },
  });

  if (isLoading || isLoadingPlans) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500">{t("error_fetching_dashboard_data")}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">{t("member_management")}</h1>
      
      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">{t("member_directory", { count: members?.length || 0 })}</TabsTrigger>
          <TabsTrigger value="register">{t("register_new_member")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="directory">
          <Card>
            <CardHeader>
              <CardTitle>{t("member_directory", { count: members?.length || 0 })}</CardTitle>
            </CardHeader>
            <CardContent>
              {members && <MemberTable members={members} />}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>{t("new_member_details_plan_selection")}</CardTitle>
            </CardHeader>
            <CardContent>
              {plans && <MemberRegistrationForm plans={plans} onSuccess={handleRegistrationSuccess} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};