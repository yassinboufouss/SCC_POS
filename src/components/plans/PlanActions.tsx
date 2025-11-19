import React, { useState } from 'react';
import { MembershipPlan } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Edit, Save, Ticket, Gift, Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdatePlan, useDeletePlan } from '@/integrations/supabase/data/use-plans.ts';
import { useInventory } from '@/integrations/supabase/data/use-inventory.ts';
import { showSuccess, showError } from '@/utils/toast';
import { Separator } from '@/components/ui/separator';
import { useUserRole } from '@/hooks/use-user-role';

interface PlanActionsProps {
  plan: MembershipPlan;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Plan name must be at least 2 characters." }),
  duration_days: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  description: z.string().min(5, { message: "Description is required." }),
  giveaway_item_id: z.string().optional().nullable(),
});

type EditPlanFormValues = z.infer<typeof formSchema>;

const PlanActions: React.FC<PlanActionsProps> = ({ plan }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { mutateAsync: updatePlan, isPending: isUpdating } = useUpdatePlan();
  const { mutateAsync: deletePlan, isPending: isDeleting } = useDeletePlan();
  const { data: inventoryItems, isLoading: isLoadingInventory } = useInventory();
  const { isOwner } = useUserRole();
  
  const form = useForm<EditPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: plan.name,
      duration_days: plan.duration_days,
      price: plan.price,
      description: plan.description || "",
      giveaway_item_id: plan.giveaway_item_id || null,
    },
  });

  const onSubmit = async (values: EditPlanFormValues) => {
    const updatedPlan: Partial<MembershipPlan> & { id: string } = {
      id: plan.id,
      name: values.name,
      duration_days: values.duration_days,
      price: values.price,
      description: values.description,
      giveaway_item_id: values.giveaway_item_id === 'none' ? null : values.giveaway_item_id || null,
    };
    
    try {
        await updatePlan(updatedPlan);
        showSuccess(t("plan_updated_success", { name: updatedPlan.name }));
        setIsDialogOpen(false);
    } catch (error) {
        showError(t("update_failed"));
    }
  };
  
  const handleDelete = async () => {
      try {
          await deletePlan(plan.id);
          showSuccess(t("plan_deleted_success", { name: plan.name }));
          setIsDeleteConfirmOpen(false);
          setIsDialogOpen(false);
      } catch (error) {
          showError(t("delete_failed"));
      }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={!isOwner}>
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
                        <Input {...field} disabled={!isOwner} />
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
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                          value={field.value === 0 ? '' : field.value}
                          disabled={!isOwner}
                        />
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
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0.01" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                          value={field.value === 0 ? '' : field.value}
                          disabled={!isOwner}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Giveaway Item */}
                <FormField
                  control={form.control}
                  name="giveaway_item_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Gift className="h-4 w-4 text-green-600" /> {t("free_giveaway_item")}</FormLabel>
                      <Select 
                          onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                          value={field.value || 'none'} 
                          disabled={isLoadingInventory || !isOwner}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("select_optional_item")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">{t("no_giveaway")}</SelectItem>
                          {inventoryItems?.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.stock} {t("in_stock")})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Textarea {...field} disabled={!isOwner} />
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

              <Button type="submit" className="w-full mt-4" disabled={isUpdating || !isOwner}>
                <Save className="h-4 w-4 mr-2" />
                {t("save_plan_changes")}
              </Button>
              
              {/* Delete Button */}
              <Button 
                  variant="destructive" 
                  className="w-full mt-2" 
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  disabled={!isOwner}
                  type="button"
              >
                  <Trash2 className="h-4 w-4 mr-2" /> {t("delete_plan")}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" /> {t("confirm_deletion")}
                  </DialogTitle>
                  <DialogDescription>
                      {t("delete_plan_confirmation", { name: plan.name })}
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeleting}>
                      {t("cancel")}
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? t("deleting") : t("confirm_delete")}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
};

export default PlanActions;