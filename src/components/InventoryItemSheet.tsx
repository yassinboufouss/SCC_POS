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
import ImageUploadField from './ImageUploadField'; // Import the component

interface InventoryItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: InventoryItem | null;
}

const InventoryItemSheet: React.FC<InventoryItemSheetProps> = ({ open, onOpenChange, selectedItem }) => {
  const [formData, setFormData] = useState<InventoryItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState(0);

  useEffect(() => {
    if (selectedItem) {
      setFormData(selectedItem);
      setRestockQuantity(0); // Reset restock input when item changes
    }
  }, [selectedItem]);

  if (!selectedItem || !formData) return null;

  const isLowStock = formData.stock <= 10;
  const stockBadgeVariant = formData.stock === 0 ? 'destructive' : isLowStock ? 'destructive' : 'default';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      // Handle numeric inputs
      const newValue = name === 'stock' || name === 'price' ? parseFloat(value) || 0 : value;
      return {
        ...prev,
        [name]: newValue,
      } as InventoryItem;
    });
  };
  
  const handleImageUrlChange = (url: string) => {
    setFormData(prev => {
        if (!prev) return null;
        return {
            ...prev,
            imageUrl: url,
        } as InventoryItem;
    });
  };

  const handleSave = () => {
    if (!formData) return;
    
    // Ensure stock is integer and price is fixed to 2 decimal places before saving
    const updatedData: InventoryItem = {
        ...formData,
        stock: Math.floor(formData.stock),
        price: parseFloat(formData.price.toFixed(2)),
        // Ensure imageUrl is undefined if empty string
        imageUrl: formData.imageUrl || undefined,
    };

    updateInventoryItem(updatedData);
    showSuccess(`Inventory item ${updatedData.name} details updated.`);
    onOpenChange(false);
  };
  
  const handleRestock = () => {
    if (!formData || restockQuantity <= 0) {
        showError("Please enter a valid quantity to restock.");
        return;
    }
    
    const updatedItem = restockInventoryItem(formData.id, restockQuantity);
    
    if (updatedItem) {
        setFormData(updatedItem); // Update local state with new stock/date
        showSuccess(`Restocked ${restockQuantity} units of ${updatedItem.name}. New stock: ${updatedItem.stock}`);
        setRestockQuantity(0);
    } else {
        showError("Failed to restock item.");
    }
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center gap-2">
            <Package className="h-6 w-6" /> {selectedItem.name}
          </SheetTitle>
          <SheetDescription>
            Category: {selectedItem.category} | ID: {selectedItem.id}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4">
          <div className="space-y-6 p-1">
            
            {/* Stock Status */}
            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground">Current Stock Status</p>
                <Badge variant={stockBadgeVariant} className="text-base py-1 flex items-center gap-1">
                  {isLowStock && <AlertTriangle className="h-4 w-4" />}
                  {formData.stock} in Stock
                </Badge>
              </div>
              <Separator />
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>Last Restock: <span className="font-semibold">{formData.lastRestock}</span></p>
                </div>
              </div>
            </div>
            
            {/* Restock Action */}
            <div className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
                <h3 className="text-lg font-semibold">Restock Inventory</h3>
                <div className="flex gap-2">
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="restock-qty">Quantity to Add</Label>
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
                        <Plus className="h-4 w-4 mr-2" /> Restock
                    </Button>
                </div>
            </div>


            {/* Editable Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Edit Item Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock (Manual Override)</Label>
                  <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleChange} />
              </div>
              
              {/* Image URL Field */}
              <ImageUploadField 
                label="Product Image URL"
                value={formData.imageUrl || ''}
                onChange={handleImageUrlChange}
              />
            </div>
          </div>
        </ScrollArea>
        
        <div className="mt-auto pt-4 border-t">
            <Button className="w-full" onClick={handleSave}>
                Save Item Details
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InventoryItemSheet;