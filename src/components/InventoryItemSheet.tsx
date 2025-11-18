import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { InventoryItem } from '@/data/inventory';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { Package, AlertTriangle, Calendar, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import { restockInventoryItem, updateInventoryItem } from '@/utils/inventory-utils';
import ImageUploadField from './ImageUploadField'; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface InventoryItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: InventoryItem | null;
}

const InventoryCategories = ['Apparel', 'Supplements', 'Equipment'] as const;

const itemSchema = z.object({
  name: z.string().min(2, { message: "Item name is required." }),
  category: z.enum(InventoryCategories, { required_error: "Category is required." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than zero." }),
  stock: z.coerce.number().int().min(0, { message: "Stock must be a non-negative integer." }),
  imageUrl: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal('')),
});

type ItemFormValues = z.infer<typeof itemSchema>;


const InventoryItemSheet: React.FC<InventoryItemSheetProps> = ({ open, onOpenChange, selectedItem }) => {
  const { t } = useTranslation();
  const [localItem, setLocalItem] = useState<InventoryItem | null>(selectedItem);
  const [restockQuantity, setRestockQuantity] = useState(0);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
  });

  useEffect(() => {
    if (selectedItem) {
      setLocalItem(selectedItem);
      setRestockQuantity(0); // Reset restock input when item changes
      form.reset({
        name: selectedItem.name,
        category: selectedItem.category,
        price: selectedItem.price,
        stock: selectedItem.stock,
        imageUrl: selectedItem.imageUrl || '',
      });
    }
  }, [selectedItem, form]);

  if (!localItem) return null;

  const isLowStock = localItem.stock <= 10;
  const stockBadgeVariant = localItem.stock === 0 ? 'destructive' : isLowStock ? 'destructive' : 'default';

  const handleSave = (values: ItemFormValues) => {
    const updatedData: InventoryItem = {
        ...localItem,
        name: values.name,
        category: values.category,
        stock: values.stock,
        price: parseFloat(values.price.toFixed(2)),
        imageUrl: values.imageUrl || undefined,
    };

    updateInventoryItem(updatedData);
    setLocalItem(updatedData); // Update local state immediately
    showSuccess(t("item_details_updated_success", { name: updatedData.name }));
    onOpenChange(false);
  };
  
  const handleRestock = () => {
    if (!localItem || restockQuantity <= 0) {
        showError(t("restock_invalid_quantity"));
        return;
    }
    
    const updatedItem = restockInventoryItem(localItem.id, restockQuantity);
    
    if (updatedItem) {
        setLocalItem(updatedItem); // Update local state with new stock/date
        // Also update the form state to reflect the new stock count
        form.setValue('stock', updatedItem.stock);
        showSuccess(t("restock_success", { quantity: restockQuantity, name: updatedItem.name, stock: updatedItem.stock }));
        setRestockQuantity(0);
    } else {
        showError(t("restock_failed"));
    }
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center gap-2">
            <Package className="h-6 w-6" /> {t("edit_item", { name: localItem.name })}
          </SheetTitle>
          <SheetDescription>
            {t("category")}: {localItem.category} | {t("item_id", { id: localItem.id })}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4">
          <div className="space-y-6 p-1">
            
            {/* Stock Status */}
            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground">{t("current_stock_status")}</p>
                <Badge variant={stockBadgeVariant} className="text-base py-1 flex items-center gap-1">
                  {isLowStock && <AlertTriangle className="h-4 w-4" />}
                  {localItem.stock} {t("in_stock")}
                </Badge>
              </div>
              <Separator />
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{t("last_restock")}: <span className="font-semibold">{localItem.lastRestock}</span></p>
                </div>
              </div>
            </div>
            
            {/* Restock Action */}
            <div className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
                <h3 className="text-lg font-semibold">{t("restock_inventory")}</h3>
                <div className="flex gap-2">
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="restock-qty">{t("quantity_to_add")}</Label>
                        <Input 
                            id="restock-qty" 
                            type="number" 
                            value={restockQuantity === 0 ? '' : restockQuantity} 
                            onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)} 
                            min="1"
                        />
                    </div>
                    <Button 
                        onClick={handleRestock} 
                        disabled={restockQuantity <= 0}
                        className="self-end h-10"
                    >
                        <Plus className="h-4 w-4 mr-2" /> {t("restock")}
                    </Button>
                </div>
            </div>


            {/* Editable Fields */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                    <h3 className="text-lg font-semibold">{t("edit_item_details")}</h3>
                    
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("item_name")}</FormLabel>
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
                                <FormLabel>{t("category")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("select_a_category")} />
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
                                    <FormLabel>{t("price")} ($)</FormLabel>
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
                                    <FormLabel>{t("current_stock_manual")}</FormLabel>
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
                                        label={t("product_image_url")}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <div className="pt-4">
                        <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
                            {t("save_item_details")}
                        </Button>
                    </div>
                </form>
            </Form>
          </div>
        </ScrollArea>
        
      </SheetContent>
    </Sheet>
  );
};

export default InventoryItemSheet;