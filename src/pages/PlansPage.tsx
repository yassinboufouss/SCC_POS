import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Ticket, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PlanTable from '@/components/plans/PlanTable.tsx';
import AddPlanForm from '@/components/plans/AddPlanForm.tsx';
import { membershipPlans } from '@/data/membership-plans';

const PlansPage: React.FC = () => {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // State key to force re-render of PlanTable when a new plan is added
  const [planKey, setPlanKey] = useState(0); 

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    setPlanKey(prev => prev + 1); // Force re-render of the table
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t("plans_management")}</h1>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("create_new_plan")}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{t("create_new_membership_plan")}</DialogTitle>
                    </DialogHeader>
                    <AddPlanForm onSuccess={handleAddSuccess} />
                </DialogContent>
            </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" /> {t("current_plans", { count: membershipPlans.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlanTable key={planKey} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PlansPage;