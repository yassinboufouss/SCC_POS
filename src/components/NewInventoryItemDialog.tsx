import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import ImageUploadField from './ImageUploadField';

const InventoryCategories = ['Apparel', 'Supplements', 'Equipment'] as const;

const newItemSchema = z.object({
  name: z.string().min(2, { message: "Item name is required." }),
  category: z.enum(InventoryCategories, { required_error: "Category is required." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  stock: z.coerce.number().int().min(0, { message: "Stock must be a non-negative integer." }),
  imageUrl: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal('')),
});

type NewItemFormValues = z.infer<typeof newItemSchema>;

const NewInventoryItemDialog = () => {
  const [open, setOpen] = useState(false);
  
  const form = useForm<NewItemFormValues>({
    resolver: zodResolver(newItemSchema),
    defaultValues: {
      name: "",
      category: undefined,
      price: 0.00,
      stock: 0,
      imageUrl: "",
    },
  });

  const onSubmit = (values: NewItemFormValues) => {
    const newItem = {
      ...values,
      id: `INV${Math.floor(Math.random() * 10000)}`, // Mock ID generation
      lastRestock: format(new Date(), 'yyyy-MM-dd'),
      imageUrl: values.imageUrl || undefined,
    };
    
    console.log("Adding new inventory item:", newItem);
    showSuccess(`New item '${values.name}' added to inventory.`);
    
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Protein Bar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {InventoryCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploadField 
                      label="Product Image URL (Optional)"
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-6" disabled={!form.formState.isValid}>
              Save Item
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewInventoryItemDialog;