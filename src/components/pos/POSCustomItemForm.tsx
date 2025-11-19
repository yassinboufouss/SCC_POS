import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CartItem } from '@/types/pos';
import { v4 as uuidv4 } from 'uuid';

interface POSCustomItemFormProps {
  addCustomItemToCart: (item: CartItem) => void;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1." }),
});

type CustomItemFormValues = z.infer<typeof formSchema>;

const POSCustomItemForm: React.FC<POSCustomItemFormProps> = ({ addCustomItemToCart }) => {
  const { t } = useTranslation();
  
  const form = useForm<CustomItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      quantity: 1,
    },
  });

  const onSubmit = (values: CustomItemFormValues) => {
    const customItem: CartItem = {
      sourceId: uuidv4(), // Use a unique ID for custom items
      name: values.name,
      price: values.price,
      originalPrice: values.price,
      quantity: values.quantity,
      type: 'inventory', // Treat as inventory for tax/sale purposes, but without stock tracking
      stock: Infinity, // Indicate no stock limit
      imageUrl: undefined,
      isGiveaway: false,
    };
    
    addCustomItemToCart(customItem);
    
    // Reset form, keeping quantity at 1
    form.reset({
        name: "",
        price: 0,
        quantity: 1,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-card">
        <h4 className="font-semibold text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-yellow-600" /> {t("custom_sale_item")}
        </h4>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-3 md:col-span-1">
                <FormLabel>{t("item_name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("service_fee_or_custom_product")} {...field} />
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
              <FormItem className="col-span-3 md:col-span-1">
                <FormLabel>{t("price")}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0.01" 
                    placeholder="10.00" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value)}
                    value={field.value === 0 ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Quantity */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="col-span-3 md:col-span-1">
                <FormLabel>{t("quantity")}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="1" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value)}
                    value={field.value === 0 ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {t("add_to_cart")}
        </Button>
      </form>
    </Form>
  );
};

export default POSCustomItemForm;