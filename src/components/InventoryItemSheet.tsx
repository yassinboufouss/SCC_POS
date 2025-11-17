import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { InventoryItem } from '@/data/inventory';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { Package, DollarSign, AlertTriangle, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess } from '@/utils/toast';

interface InventoryItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: InventoryItem | null;
}

const InventoryItemSheet: React.FC<InventoryItemSheetProps> = ({ open, onOpenChange, selectedItem }) => {
  const [formData, setFormData] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (selectedItem) {
      setFormData(selectedItem);
    }
  }, [selectedItem]);

  if (!selectedItem || !formData) return null;

  const isLowStock = formData.stock <= 10;
  const stockBadgeVariant = formData.stock === 0 ? 'destructive' : isLowStock ? 'destructive' : 'default';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: name === 'stock' || name === 'price' ? parseFloat(value) || 0 : value,
      };
    });
  };

  const handleSave = () => {
    console.log("Saving inventory item:", formData);
    showSuccess(`Inventory item ${formData.name} updated successfully!`);
    onOpenChange(false);
    // In a real app, this would update the global inventory state/API
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

            {/* Editable Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Edit Details</h3>
              
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
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleChange} />
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="mt-auto pt-4 border-t">
            <Button className="w-full" onClick={handleSave}>
                Save Changes
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InventoryItemSheet;