import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Ticket, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PlanTable from '@/components/plans/PlanTable.tsx';
import AddPlanForm from '@/components/plans/AddPlanForm.tsx';
import { usePlans } from '@/integrations/supabase/data/use-plans.ts';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRole } from '@/hooks/use-user-role';

const PlansPage: React.FC = () => {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { isOwner } = useUserRole();
  
  const { data: membershipPlans, isLoading } = usePlans(searchTerm);

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t("plans_management")}</h1>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button disabled={!isOwner}>
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
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" /> {t("current_plans", { count: membershipPlans?.length || 0 })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                    placeholder={t("search_plans_by_name")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm flex-1"
                />
            </div>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            ) : (
                <PlanTable plans={membershipPlans || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PlansPage;