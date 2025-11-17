import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from 'lucide-react';
import { membershipPlans, MembershipPlan } from '@/data/membership-plans';
import NewMembershipPlanDialog from '@/components/NewMembershipPlanDialog';
import { DataTable } from '@/components/DataTable';
import { createPlanColumns } from './plans/plan-columns';
import { Button } from '@/components/ui/button'; // Ensure Button is imported if used in actions

const MembershipPlansPage = () => {
  // Placeholder for edit functionality
  const handleEditPlan = (plan: MembershipPlan) => {
    console.log("Editing plan:", plan.name);
    // In a real app, this would open an edit dialog/sheet
  };
  
  const columns = createPlanColumns(handleEditPlan);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Membership Plans Management</h1>
        <NewMembershipPlanDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" /> Current Plans ({membershipPlans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={membershipPlans}
            filterColumnId="name"
            filterPlaceholder="Search plans by name..."
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Plan Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            (Placeholder for charts showing popular plans and revenue breakdown.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MembershipPlansPage;