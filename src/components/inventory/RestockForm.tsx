import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useRestockInventoryItem } from '@/integrations/supabase/data/use-inventory';
import { InventoryItem } from '@/types/supabase';
import { showSuccess } from '@/utils/toast';
import { RefreshCw } from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';

interface RestockFormProps {
  item: InventoryItem;
  onSuccess: () => void;
}

const formSchema = z.object({
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1." }),
});

type RestockFormValues = z.infer<typeof formSchema>;

export const RestockForm: React.FC<RestockFormProps> = ({ item, onSuccess }) => {
  const { t } = useTranslation();
  const { isOwner } = useUserRole();
  
  const form = useForm<RestockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 10,
    },
  });

  const { mutateAsync: restockItem, isPending } = useRestockInventoryItem();

  const onSubmit = async (values: RestockFormValues) => {
    try {
      const updatedItem = await restockItem({ itemId: item.id, quantity: values.quantity }) as InventoryItem;
      
      if (updatedItem) {
        showSuccess(t("restock_success", { quantity: values.quantity, name: updatedItem.name, stock: updatedItem.stock }));
        onSuccess();
        form.reset({ quantity: 10 });
      }
    } catch (error) {
      toast.error(t("restock_failed"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("quantity_to_add")}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  {...field} 
                  onChange={e => field.onChange(e.target.value)}
                  value={field.value === 0 ? '' : field.value}
                  disabled={isPending || !isOwner}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full mt-4" disabled={isPending || !isOwner}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("restock")}
        </Button>
      </form>
    </Form>
  );
};

export default RestockForm;