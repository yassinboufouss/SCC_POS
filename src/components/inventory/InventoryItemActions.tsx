import React, { useState } from 'react';
import { InventoryItem } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Edit, RefreshCw, Package, Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import RestockForm from '@/components/inventory/RestockForm';
import EditItemForm from '@/components/inventory/EditItemForm';
import { useInventory, useDeleteInventoryItem } from '@/integrations/supabase/data/use-inventory.ts';
import { useUserRole } from '@/hooks/use-user-role';
import { showSuccess, showError } from '@/utils/toast';

interface InventoryItemActionsProps {
  item: InventoryItem;
}

const InventoryItemActions: React.FC<InventoryItemActionsProps> = ({ item }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { isOwner } = useUserRole();
  
  const { mutateAsync: deleteItem, isPending: isDeleting } = useDeleteInventoryItem();
  
  // We use the useInventory hook to ensure the item data displayed in the dialog is fresh 
  const { data: freshInventoryItems } = useInventory();
  const currentItem = freshInventoryItems?.find(i => i.id === item.id) || item;

  const handleUpdateSuccess = () => {
    // Mutation hooks handle invalidation, we just close the dialog
    setIsDialogOpen(false);
  };
  
  const handleDelete = async () => {
      try {
          await deleteItem(currentItem.id);
          showSuccess(t("item_deleted_success", { name: currentItem.name }));
          setIsDeleteConfirmOpen(false);
          setIsDialogOpen(false);
      } catch (error) {
          showError(t("delete_failed"));
      }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={!isOwner}>
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
              
              {/* Delete Button */}
              <div className="pt-4 border-t">
                  <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      disabled={!isOwner}
                  >
                      <Trash2 className="h-4 w-4 mr-2" /> {t("delete_item")}
                  </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" /> {t("confirm_deletion")}
                  </DialogTitle>
                  <DialogDescription>
                      {t("delete_item_confirmation", { name: currentItem.name })}
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeleting}>
                      {t("cancel")}
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? t("deleting") : t("confirm_delete")}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
};

export default InventoryItemActions;