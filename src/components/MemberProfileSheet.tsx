import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Member } from '@/data/members';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Calendar, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { membershipPlans } from '@/data/membership-plans';
import { showSuccess } from '@/utils/toast';
import { updateMember } from '@/utils/member-utils';
import MembershipRenewalDialog from './MembershipRenewalDialog';
import MembershipActionDialog from './MembershipActionDialog';

interface MemberProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMember: Member | null;
}

const MemberStatuses = ['Active', 'Expired', 'Pending'] as const;

const memberSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number is required." }),
  dob: z.string().min(1, { message: "Date of birth is required." }),
  plan: z.string().min(1, { message: "Membership plan is required." }),
  status: z.enum(MemberStatuses, { required_error: "Status is required." }),
});

type MemberFormValues = z.infer<typeof memberSchema>;

const MemberProfileSheet: React.FC<MemberProfileSheetProps> = ({ open, onOpenChange, selectedMember }) => {
  const [localMember, setLocalMember] = useState<Member | null>(selectedMember);
  const [isRenewalDialogOpen, setIsRenewalDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
  });

  useEffect(() => {
    if (selectedMember) {
      setLocalMember(selectedMember);
      form.reset({
        email: selectedMember.email,
        phone: selectedMember.phone,
        dob: selectedMember.dob,
        plan: selectedMember.plan,
        status: selectedMember.status as MemberFormValues['status'],
      });
    }
  }, [selectedMember, form]);

  if (!localMember) return null;

  const statusVariant = localMember.status === 'Active' ? 'default' : 'destructive';
  const expirationDate = new Date(localMember.expirationDate);
  const isExpired = localMember.status === 'Expired';

  const onSubmit = (values: MemberFormValues) => {
    // Note: We are not recalculating expirationDate here for simplicity, 
    // but in a real app, changing the plan would require recalculation.
    const updatedMember: Member = {
      ...localMember,
      email: values.email,
      phone: values.phone,
      dob: values.dob,
      plan: values.plan,
      status: values.status,
    };

    updateMember(updatedMember);
    setLocalMember(updatedMember); // Update local state immediately
    showSuccess(`Member ${updatedMember.name} profile updated.`);
    onOpenChange(false);
  };
  
  const handleRenewalSuccess = (renewedMember: Member) => {
      setLocalMember(renewedMember); // Update local state after renewal
      setIsRenewalDialogOpen(false);
      // Also update the form state to reflect the new plan/status
      form.reset({
        ...form.getValues(),
        plan: renewedMember.plan,
        status: renewedMember.status as MemberFormValues['status'],
      });
  };
  
  const handleActionSuccess = (updatedMember: Member) => {
      setLocalMember(updatedMember);
      setIsActionDialogOpen(false);
      // Update form state to reflect new status
      form.reset({
        ...form.getValues(),
        status: updatedMember.status as MemberFormValues['status'],
      });
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" /> {localMember.name}
          </SheetTitle>
          <SheetDescription>
            Member ID: {localMember.id}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
              
              {/* Status Card (Display only) */}
              <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                  <Badge variant={statusVariant} className="text-base py-1">
                    {localMember.status}
                  </Badge>
                </div>
                <Separator />
                <div className="text-sm">
                  <p>Start Date: {format(new Date(localMember.startDate), 'MMM dd, yyyy')}</p>
                  <p className={isExpired ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'}>
                    Expiration: {format(expirationDate, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {/* Editable Contact Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Editable Membership Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Membership Details</h3>
                
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Plan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {membershipPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.name}>
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MemberStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Activity Stats (Display only) */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Activity & History</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md bg-background">
                    <p className="text-sm font-medium text-muted-foreground">Total Check-ins</p>
                    <span className="text-xl font-bold">{localMember.totalCheckIns}</span>
                  </div>
                  <div className="p-3 border rounded-md bg-background">
                    <p className="text-sm font-medium text-muted-foreground">Last Check-in</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{localMember.lastCheckIn || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Placeholder for Transaction History */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Transaction History</h3>
                <p className="text-sm text-muted-foreground">
                  (Placeholder for recent payments and purchases)
                </p>
              </div>
              
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
                    Save Member Changes
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
        
        <div className="mt-auto pt-4 border-t space-y-2">
            {localMember.status !== 'Active' && (
                <Button variant="default" className="w-full" onClick={() => setIsRenewalDialogOpen(true)}>
                    Renew Membership
                </Button>
            )}
            <Button 
                variant="outline" 
                className="w-full text-red-500"
                onClick={() => setIsActionDialogOpen(true)}
            >
                Freeze/Cancel Membership
            </Button>
        </div>
        
        {/* Renewal Dialog */}
        {localMember && isRenewalDialogOpen && (
            <MembershipRenewalDialog
                open={isRenewalDialogOpen}
                onOpenChange={setIsRenewalDialogOpen}
                member={localMember}
                onRenewalSuccess={handleRenewalSuccess}
            />
        )}
        
        {/* Action Dialog */}
        {localMember && isActionDialogOpen && (
            <MembershipActionDialog
                open={isActionDialogOpen}
                onOpenChange={setIsActionDialogOpen}
                member={localMember}
                onActionSuccess={handleActionSuccess}
            />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MemberProfileSheet;