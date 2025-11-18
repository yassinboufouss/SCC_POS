import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddInventoryItem } from '@/integrations/supabase/data/use-inventory.ts';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { PackagePlus } from 'lucide-react';
import { NewInventoryItemInput } from '@/types/pos';
import { useUserRole } from '@/hooks/use-user-role';

interface AddItemFormProps {
  onSuccess: () => void;
}

const categories = ['Apparel', 'Supplements', 'Equipment'] as const;
type CategoryType = typeof categories[number];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.enum(categories),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  initial_stock: z.coerce.number().int().min(0, { message: "Stock cannot be negative." }),
  image_url: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal('')),
});

type AddItemFormValues = z.infer<typeof formSchema>;

const AddItemForm: React.FC<AddItemFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { mutateAsync: addItem, isPending } = useAddInventoryItem();
  const { isOwner } = useUserRole();
  
  const form = useForm<AddItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: 'Apparel',
      price: 0,
      initial_stock: 0,
      image_url: "",
    },
  });

  const onSubmit = async (values: AddItemFormValues) => {
    const newItemData: NewInventoryItemInput & { image_url?: string } = {
      name: values.name,
      category: values.category as CategoryType,
      price: values.price,
      initial_stock: values.initial_stock,
      image_url: values.image_url || undefined,
    };
    
    try {
        const newItem = await addItem(newItemData);

        if (newItem) {
            showSuccess(t("item_added_success", { name: newItem.name }));
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("item_name")}</FormLabel>
                <FormControl>
                  <Input placeholder="New Product Name" {...field} disabled={!isOwner} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isOwner}>
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
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0.01" 
                    placeholder="19.99" 
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
          
          {/* Initial Stock */}
          <FormField
            control={form.control}
            name="initial_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("initial_stock")}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
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
        </div>
        
        {/* Image URL */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("product_image_url")}</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} disabled={!isOwner} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending || !isOwner}>
          <PackagePlus className="h-4 w-4 mr-2" />
          {t("save_item")}
        </Button>
      </form>
    </Form>
  );
};

export default AddItemForm;