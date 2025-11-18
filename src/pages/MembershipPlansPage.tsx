import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from 'lucide-react';
import { membershipPlans, MembershipPlan } from '@/data/membership-plans';
import NewMembershipPlanDialog from '@/components/NewMembershipPlanDialog';
import { DataTable } from '@/components/DataTable';
import { createPlanColumns } from './plans/plan-columns';
import MembershipPlanSheet from '@/components/MembershipPlanSheet';
import { useTranslation } from 'react-i18next';

const MembershipPlansPage = () => {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  const handleEditPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setIsSheetOpen(true);
  };
  
  const columns = createPlanColumns(handleEditPlan);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("plans_management")}</h1>
        <NewMembershipPlanDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" /> {t("current_plans", { count: membershipPlans.length })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={membershipPlans}
            filterColumnId="name"
            filterPlaceholder={t("search_plans_by_name")}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("plan_analytics")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("placeholder_plan_analytics")}
          </p>
        </CardContent>
      </Card>
      
      {/* Membership Plan Edit Sheet */}
      <MembershipPlanSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedPlan={selectedPlan}
      />
    </div>
  );
};

export default MembershipPlansPage;