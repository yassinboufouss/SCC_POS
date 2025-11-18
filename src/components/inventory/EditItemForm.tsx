import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateInventoryItem } from '@/utils/inventory-utils';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import { InventoryItem } from '@/data/inventory';
import { formatCurrency } from '@/utils/currency-utils';

interface EditItemFormProps {
  item: InventoryItem;
  onSuccess: (updatedItem: InventoryItem) => void;
}

const categories = ['Apparel', 'Supplements', 'Equipment'] as const;
type CategoryType = typeof categories[number];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.enum(categories),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  stock: z.coerce.number().int().min(0, { message: "Stock cannot be negative." }),
  imageUrl: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal('')),
});

type EditItemFormValues = z.infer<typeof formSchema>;

const EditItemForm: React.FC<EditItemFormProps> = ({ item, onSuccess }) => {
  const { t } = useTranslation();
  
  const form = useForm<EditItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name,
      category: item.category,
      price: item.price,
      stock: item.stock,
      imageUrl: item.imageUrl || '',
    },
  });

  const onSubmit = async (values: EditItemFormValues) => {
    const updatedItem: InventoryItem = {
      ...item,
      name: values.name,
      category: values.category as CategoryType,
      price: values.price,
      stock: values.stock,
      imageUrl: values.imageUrl || undefined,
    };
    
    await updateInventoryItem(updatedItem);
    showSuccess(t("plan_updated_success", { name: updatedItem.name })); // Reusing translation key for success message
    onSuccess(updatedItem);
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
                <FormLabel>{t("item_name")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("category")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_a_category")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          
          {/* Current Stock (Manual) */}
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("current_stock_manual")}</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Image URL */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("product_image_url")}</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full mt-4">
          <Save className="h-4 w-4 mr-2" />
          {t("save_item_details")}
        </Button>
      </form>
    </Form>
  );
};

export default EditItemForm;