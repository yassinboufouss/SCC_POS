import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addInventoryItem } from '@/utils/inventory-utils';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { PackagePlus } from 'lucide-react';
import { InventoryItem } from '@/data/inventory';

interface AddItemFormProps {
  onSuccess: () => void;
}

const categories = ['Apparel', 'Supplements', 'Equipment'] as const;
type CategoryType = typeof categories[number];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.enum(categories),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  initialStock: z.coerce.number().int().min(0, { message: "Stock cannot be negative." }),
  imageUrl: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal('')),
});

type AddItemFormValues = z.infer<typeof formSchema>;

const AddItemForm: React.FC<AddItemFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  
  const form = useForm<AddItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: 'Apparel',
      price: 0,
      initialStock: 0,
      imageUrl: "",
    },
  });

  const onSubmit = (values: AddItemFormValues) => {
    const newItem = addInventoryItem({
      name: values.name,
      category: values.category as CategoryType,
      price: values.price,
      initialStock: values.initialStock,
      imageUrl: values.imageUrl || undefined,
    });

    if (newItem) {
      showSuccess(t("item_added_success", { name: newItem.name }));
      onSuccess();
    } else {
      showError(t("restock_failed")); // Reusing a generic error key
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
                <FormLabel>{t("item_name")}</FormLabel>
                <FormControl>
                  <Input placeholder="New Product Name" {...field} />
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
                <FormLabel>{t("price")}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0.01" placeholder="19.99" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Initial Stock */}
          <FormField
            control={form.control}
            name="initialStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("initial_stock")}</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="10" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          <PackagePlus className="h-4 w-4 mr-2" />
          {t("save_item")}
        </Button>
      </form>
    </Form>
  );
};

export default AddItemForm;