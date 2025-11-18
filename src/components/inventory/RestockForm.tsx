import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { InventoryItem } from '@/types/supabase';
import { useRestockInventoryItem } from '@/integrations/supabase/data/use-inventory.ts';
import { useUserRole } from '@/hooks/use-user-role';

interface RestockFormProps {
  item: InventoryItem;
  onSuccess: () => void;
}

const formSchema = z.object({
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1." }),
});

type RestockFormValues = z.infer<typeof formSchema>;

const RestockForm: React.FC<RestockFormProps> = ({ item, onSuccess }) => {
  const { t } = useTranslation();
  const { mutateAsync: restockItem, isPending } = useRestockInventoryItem();
  const { isOwner } = useUserRole();
  
  const form = useForm<RestockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const onSubmit = async (values: RestockFormValues) => {
    try {
        const updatedItem = await restockItem({ 
            itemId: item.id, 
            quantity: values.quantity,
            currentStock: item.stock,
        });

        if (updatedItem) {
            showSuccess(t("restock_success", { quantity: values.quantity, name: updatedItem.name, stock: updatedItem.stock }));
            onSuccess();
        } else {
            showError(t("restock_failed"));
        }
    } catch (error) {
        showError(t("restock_failed"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-end gap-4">
            <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                <FormItem className="flex-1">
                    <FormLabel>{t("quantity_to_add")}</FormLabel>
                    <FormControl>
                    <Input 
                        type="number" 
                        min="1" 
                        placeholder="10" 
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
            <Button type="submit" disabled={isPending || !isOwner}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("restock")}
            </Button>
        </div>
      </form>
    </Form>
  );
};

export default RestockForm;