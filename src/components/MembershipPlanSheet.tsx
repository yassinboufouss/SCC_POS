import React, { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MembershipPlan } from '@/data/membership-plans';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { Ticket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess } from '@/utils/toast';
import { updateMembershipPlan } from '@/utils/membership-plan-utils';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from 'react-i18next';

interface MembershipPlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: MembershipPlan | null;
}

const planSchema = z.object({
  name: z.string().min(2, { message: "Plan name is required." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  durationDays: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
  description: z.string().min(10, { message: "Description is required." }),
});

type PlanFormValues = z.infer<typeof planSchema>;

const MembershipPlanSheet: React.FC<MembershipPlanSheetProps> = ({ open, onOpenChange, selectedPlan }) => {
  const { t } = useTranslation();
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
  });

  useEffect(() => {
    if (selectedPlan) {
      form.reset({
        name: selectedPlan.name,
        price: selectedPlan.price,
        durationDays: selectedPlan.durationDays,
        description: selectedPlan.description,
      });
    }
  }, [selectedPlan, form]);

  if (!selectedPlan) return null;

  const onSubmit = (values: PlanFormValues) => {
    const updatedPlan: MembershipPlan = {
      ...selectedPlan,
      name: values.name,
      price: parseFloat(values.price.toFixed(2)),
      durationDays: values.durationDays,
      description: values.description,
    };

    updateMembershipPlan(updatedPlan);
    showSuccess(t("plan_updated_success", { name: updatedPlan.name }));
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center gap-2">
            <Ticket className="h-6 w-6" /> {t("edit_plan", { name: selectedPlan.name })}
          </SheetTitle>
          <SheetDescription>
            {t("plan_id", { id: selectedPlan.id })}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
              
              {/* Plan Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t("core_details")}</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("plan_name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Annual Premium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("price")} ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="durationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("duration_days_label")}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description_label")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed description of plan benefits..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Placeholder for associated members/analytics */}
              <div className="p-3 border rounded-md bg-background text-sm text-muted-foreground">
                <p>{t("associated_members_placeholder")}</p>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
                  {t("save_plan_changes")}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MembershipPlanSheet;