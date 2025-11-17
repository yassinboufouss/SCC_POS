import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Ticket, Clock } from 'lucide-react';
import { membershipPlans, MembershipPlan } from '@/data/membership-plans';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import NewMembershipPlanDialog from '@/components/NewMembershipPlanDialog';

const MembershipPlansPage = () => {
  // In a real app, we would have state management for adding/editing plans.

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Duration</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membershipPlans.map((plan: MembershipPlan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    ${plan.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="flex items-center justify-center mx-auto w-24">
                      <Clock className="h-3 w-3 mr-1" /> {plan.durationDays} Days
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                    {plan.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Edit Plan</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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