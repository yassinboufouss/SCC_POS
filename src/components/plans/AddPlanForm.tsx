import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddPlan } from '@/integrations/supabase/data/use-plans.ts';
import { useInventory } from '@/integrations/supabase/data/use-inventory.ts';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { Ticket, Gift } from 'lucide-react';
import { NewPlanInput } from '@/types/pos';
import { useUserRole } from '@/hooks/use-user-role';

interface AddPlanFormProps {
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Plan name must be at least 2 characters." }),
  duration_days: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  description: z.string().min(5, { message: "Description is required." }),
  giveaway_item_id: z.string().optional().nullable(),
});

type AddPlanFormValues = z.infer<typeof formSchema>;

const AddPlanForm: React.FC<AddPlanFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { mutateAsync: addPlan, isPending } = useAddPlan();
  const { data: inventoryItems, isLoading: isLoadingInventory } = useInventory();
  const { isOwner } = useUserRole();
  
  const form = useForm<AddPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      duration_days: 30,
      price: 0,
      description: "",
      giveaway_item_id: null,
    },
  });

  const onSubmit = async (values: AddPlanFormValues) => {
    const newPlanData: NewPlanInput = {
        name: values.name,
        duration_days: values.duration_days,
        price: values.price,
        description: values.description,
        giveaway_item_id: values.giveaway_item_id || null,
    };
    
    try {
        const newPlan = await addPlan(newPlanData);

        if (newPlan) {
            showSuccess(t("plan_created_success", { name: newPlan.name }));
            onSuccess();
        } else {
            showError(t("plan_creation_failed")); // Use specific error key
        }
    } catch (error) {
        showError(t("plan_creation_failed")); // Use specific error key
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("plan_name")}</FormLabel>
                <FormControl>
                  <Input placeholder="Monthly Premium" {...field} disabled={!isOwner} />
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
                    placeholder="30" 
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
                <FormLabel>{t("price")}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0.01" 
                    placeholder="99.99" 
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
                <Select onValueChange={field.onChange} defaultValue={field.value || ''} disabled={isLoadingInventory || !isOwner}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_optional_item")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">{t("no_giveaway")}</SelectItem>
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
                <Textarea placeholder="A brief description of the plan features." {...field} disabled={!isOwner} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending || !isOwner}>
          <Ticket className="h-4 w-4 mr-2" />
          {t("create_plan")}
        </Button>
      </form>
    </Form>
  );
};

export default AddPlanForm;