import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { membershipPlans } from "@/data/membership-plans.ts";
import { addDays, format } from "date-fns";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { addMember, NewMemberInput } from '@/utils/member-utils'; // Import utility and type
import { useTranslation } from 'react-i18next';

const memberRegistrationSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number is required." }),
  dob: z.string().min(1, { message: "Date of birth is required." }),
  planId: z.string().min(1, { message: "Membership plan is required." }),
});

type MemberRegistrationFormValues = z.infer<typeof memberRegistrationSchema>;

const RegistrationForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm<MemberRegistrationFormValues>({
    resolver: zodResolver(memberRegistrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dob: "",
      planId: "",
    },
  });

  const selectedPlanId = form.watch("planId");
  const selectedPlan = membershipPlans.find(p => p.id === selectedPlanId);

  const onSubmit = (values: MemberRegistrationFormValues) => {
    if (!selectedPlan) {
        showError(t("select_plan_error"));
        return;
    }

    // Type assertion is used here because we know the Zod resolver guarantees all fields are present
    const newMember = addMember(values as NewMemberInput);

    if (newMember) {
        showSuccess(t("registration_success", { 
            name: newMember.name, 
            date: format(new Date(newMember.expirationDate), 'MMM dd, yyyy') 
        }));
        
        // Simulate successful registration and navigate back to the list
        form.reset();
        navigate('/members');
    } else {
        showError(t("registration_failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/members')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{t("register_new_member")}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("new_member_details_plan_selection", { defaultValue: "New Member Details & Plan Selection" })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("full_name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email")}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
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
                      <FormLabel>{t("phone_number")}</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
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
                      <FormLabel>{t("date_of_birth")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Membership Plan Selection */}
              <Card className="p-4 bg-muted/50">
                <CardTitle className="text-lg mb-4">{t("membership_plan")}</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="planId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("select_plan")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("choose_a_membership_plan")} />
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
                    <div className="space-y-2">
                      <Label>{t("plan_details")}</Label>
                      <div className="p-3 border rounded-md bg-background text-sm">
                        <p>{t("duration")}: {selectedPlan.durationDays} {t("days")}</p>
                        <p>{t("price")}: ${selectedPlan.price.toFixed(2)}</p>
                        <p className="text-muted-foreground">{selectedPlan.description}</p>
                        
                        {/* Calculate Expiration Date Preview */}
                        {form.formState.isValid && (
                          <p className="mt-2 font-medium text-green-600 dark:text-green-400">
                            {t("expires")}: {format(addDays(new Date(), selectedPlan.durationDays), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="pt-4">
                <Button type="submit" disabled={!form.formState.isValid}>
                  {t("register_member_process_payment")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;