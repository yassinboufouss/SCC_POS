import React, { useState } from 'react';
import { MembershipPlan } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Edit, Save, Ticket } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdatePlan } from '@/integrations/supabase/data/use-plans.ts';
import { showSuccess, showError } from '@/utils/toast';
import { Separator } from '@/components/ui/separator';

interface PlanActionsProps {
  plan: MembershipPlan;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Plan name must be at least 2 characters." }),
  duration_days: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  description: z.string().min(5, { message: "Description is required." }),
});

type EditPlanFormValues = z.infer<typeof formSchema>;

const PlanActions: React.FC<PlanActionsProps> = ({ plan }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mutateAsync: updatePlan, isPending } = useUpdatePlan();
  
  const form = useForm<EditPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: plan.name,
      duration_days: plan.duration_days,
      price: plan.price,
      description: plan.description || "",
    },
  });

  const onSubmit = async (values: EditPlanFormValues) => {
    const updatedPlan: Partial<MembershipPlan> & { id: string } = {
      id: plan.id,
      name: values.name,
      duration_days: values.duration_days,
      price: values.price,
      description: values.description,
    };
    
    try {
        await updatePlan(updatedPlan);
        showSuccess(t("plan_updated_success", { name: updatedPlan.name }));
        setIsDialogOpen(false);
    } catch (error) {
        showError(t("update_failed"));
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("edit_plan", { name: plan.name })}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="p-3 border rounded-md bg-secondary/50 text-sm">
                <p className="font-semibold">{t("plan_id")}: <span className="font-mono text-xs">{plan.id.substring(0, 8)}...</span></p>
            </div>
            
            <h4 className="font-semibold">{t("core_details")}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("plan_name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Duration Days */}
              <FormField
                control={form.control}
                name="duration_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("duration_days_label")}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("price")} ({t("currency_symbol")})</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description_label")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <h4 className="font-semibold flex items-center gap-2">
                <Ticket className="h-4 w-4" /> {t("plan_analytics")}
            </h4>
            <p className="text-sm text-muted-foreground">{t("associated_members_placeholder")}</p>

            <Button type="submit" className="w-full mt-4" disabled={isPending}>
              <Save className="h-4 w-4 mr-2" />
              {t("save_plan_changes")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanActions;