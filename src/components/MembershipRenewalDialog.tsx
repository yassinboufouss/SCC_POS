import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from '@/utils/toast';
import { Member } from '@/data/members';
import { membershipPlans } from '@/data/membership-plans';
import { renewMemberPlan } from '@/utils/member-utils';
import { format, addDays } from 'date-fns';
import { Ticket, Calendar } from 'lucide-react';

interface MembershipRenewalDialogProps {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenewalSuccess: (member: Member) => void;
}

const renewalSchema = z.object({
  planId: z.string().min(1, { message: "A membership plan must be selected." }),
});

type RenewalFormValues = z.infer<typeof renewalSchema>;

const MembershipRenewalDialog: React.FC<MembershipRenewalDialogProps> = ({ member, open, onOpenChange, onRenewalSuccess }) => {
  const form = useForm<RenewalFormValues>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      planId: "",
    },
  });

  const selectedPlanId = form.watch("planId");
  const selectedPlan = useMemo(() => membershipPlans.find(p => p.id === selectedPlanId), [selectedPlanId]);

  const onSubmit = (values: RenewalFormValues) => {
    const renewedMember = renewMemberPlan(member.id, values.planId);
    
    if (renewedMember) {
      showSuccess(`Renewal successful! ${renewedMember.name}'s new expiration date is ${format(new Date(renewedMember.expirationDate), 'MMM dd, yyyy')}.`);
      onRenewalSuccess(renewedMember);
      form.reset({ planId: "" });
      onOpenChange(false);
    } else {
      showError("Failed to process renewal.");
    }
  };
  
  const currentExpiration = new Date(member.expirationDate);
  const isExpired = new Date() > currentExpiration;
  
  let newStartDatePreview = new Date();
  if (!isExpired) {
      newStartDatePreview = addDays(currentExpiration, 1);
  }
  
  const newExpirationDatePreview = selectedPlan 
    ? addDays(newStartDatePreview, selectedPlan.durationDays)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-blue-500" /> Renew Membership for {member.name}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            
            <div className="p-3 border rounded-md bg-red-50 dark:bg-red-950/50 text-sm">
                <p className="font-semibold text-red-600 dark:text-red-400">
                    Current Status: {member.status}
                </p>
                <p className="text-muted-foreground">
                    Previous Expiration: {format(currentExpiration, 'MMM dd, yyyy')}
                </p>
            </div>

            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select New Plan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a membership plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {membershipPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} (${plan.price.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedPlan && (
                <div className="space-y-2 p-3 border rounded-md bg-accent/50">
                    <h4 className="font-semibold text-sm">Renewal Summary</h4>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p>Start Date: <span className="font-medium">{format(newStartDatePreview, 'MMM dd, yyyy')}</span></p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <p>New Expiration: <span className="font-medium text-green-600 dark:text-green-400">{format(newExpirationDatePreview!, 'MMM dd, yyyy')}</span></p>
                    </div>
                    <p className="text-lg font-bold mt-2">Total Due: ${selectedPlan.price.toFixed(2)}</p>
                </div>
            )}

            <Button type="submit" className="w-full mt-6" disabled={!form.formState.isValid || !selectedPlan}>
              Process Renewal Payment
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipRenewalDialog;