import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addMembershipPlan, NewPlanInput } from '@/utils/plan-utils';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { Ticket } from 'lucide-react';

interface AddPlanFormProps {
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Plan name must be at least 2 characters." }),
  durationDays: z.coerce.number().int().min(1, { message: "Duration must be at least 1 day." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  description: z.string().min(5, { message: "Description is required." }),
});

type AddPlanFormValues = z.infer<typeof formSchema>;

const AddPlanForm: React.FC<AddPlanFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  
  const form = useForm<AddPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      durationDays: 30,
      price: 0,
      description: "",
    },
  });

  const onSubmit = (values: AddPlanFormValues) => {
    const newPlanData: NewPlanInput = {
        name: values.name,
        durationDays: values.durationDays,
        price: values.price,
        description: values.description,
    };
    
    const newPlan = addMembershipPlan(newPlanData);

    if (newPlan) {
      showSuccess(t("plan_created_success", { name: newPlan.name }));
      onSuccess();
    } else {
      showError(t("registration_failed")); // Reusing generic error key
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
                  <Input placeholder="Monthly Premium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Duration Days */}
          <FormField
            control={form.control}
            name="durationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("duration_days_label")}</FormLabel>
                <FormControl>
                  <Input type="number" min="1" placeholder="30" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
                  <Input type="number" step="0.01" min="0.01" placeholder="99.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                <Textarea placeholder="A brief description of the plan features." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          <Ticket className="h-4 w-4 mr-2" />
          {t("create_plan")}
        </Button>
      </form>
    </Form>
  );
};

export default AddPlanForm;