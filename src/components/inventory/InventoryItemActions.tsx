import React, { useState } from 'react';
import { InventoryItem } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Edit, RefreshCw, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import RestockForm from '@/components/inventory/RestockForm';
import EditItemForm from '@/components/inventory/EditItemForm';
import { useInventory } from '@/integrations/supabase/data/use-inventory.ts'; // Import hook to get fresh data

interface InventoryItemActionsProps {
  item: InventoryItem;
}

const InventoryItemActions: React.FC<InventoryItemActionsProps> = ({ item }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // We use the useInventory hook to ensure the item data displayed in the dialog is fresh 
  // (though the mutation hooks handle invalidation, this ensures the dialog reflects the latest state if opened later)
  const { data: freshInventoryItems } = useInventory();
  const currentItem = freshInventoryItems?.find(i => i.id === item.id) || item;

  const handleUpdateSuccess = () => {
    // Mutation hooks handle invalidation, we just close the dialog
    setIsDialogOpen(false);
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
                <p className="text-xs text-muted-foreground">{currentItem.last_restock && `${t("last_restock")}: ${currentItem.last_restock}`}</p>
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
                    <EditItemForm item={currentItem} onSuccess={handleUpdateSuccess} />
                </TabsContent>
                
                <TabsContent value="restock" className="mt-4">
                    <RestockForm item={currentItem} onSuccess={handleUpdateSuccess} />
                </TabsContent>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemActions;