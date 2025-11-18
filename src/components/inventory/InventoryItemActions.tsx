import React, { useState } from 'react';
import { InventoryItem } from '@/data/inventory';
import { Button } from '@/components/ui/button';
import { Edit, RefreshCw, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import RestockForm from '@/components/inventory/RestockForm';
import EditItemForm from '@/components/inventory/EditItemForm';

interface InventoryItemActionsProps {
  item: InventoryItem;
  onUpdate: (updatedItem: InventoryItem) => void;
}

const InventoryItemActions: React.FC<InventoryItemActionsProps> = ({ item, onUpdate }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(item);

  const handleUpdate = (updatedItem: InventoryItem) => {
    setCurrentItem(updatedItem);
    onUpdate(updatedItem);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("edit_item", { name: currentItem.name })}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
            <div className="p-3 border rounded-md bg-secondary/50 text-sm">
                <p className="font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" /> {t("current_stock_status")}
                </p>
                <p className="mt-1">
                    {t("stock")}: <span className="font-bold text-lg">{currentItem.stock}</span> {t("in_stock")}
                </p>
                <p className="text-xs text-muted-foreground">{currentItem.lastRestock && `${t("last_restock")}: ${currentItem.lastRestock}`}</p>
            </div>
            
            <Tabs defaultValue="edit">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">
                        <Edit className="h-4 w-4 mr-2" /> {t("edit_item_details")}
                    </TabsTrigger>
                    <TabsTrigger value="restock">
                        <RefreshCw className="h-4 w-4 mr-2" /> {t("restock_inventory")}
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="edit" className="mt-4">
                    <EditItemForm item={currentItem} onSuccess={handleUpdate} />
                </TabsContent>
                
                <TabsContent value="restock" className="mt-4">
                    <RestockForm item={currentItem} onSuccess={handleUpdate} />
                </TabsContent>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemActions;