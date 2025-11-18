import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import InventoryTable from '@/components/inventory/InventoryTable';
import AddItemForm from '@/components/inventory/AddItemForm';
import { inventoryItems } from '@/data/inventory';

const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // State key to force re-render of InventoryTable when a new item is added
  const [inventoryKey, setInventoryKey] = useState(0); 

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    setInventoryKey(prev => prev + 1); // Force re-render of the table
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t("inventory_management")}</h1>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PackagePlus className="h-4 w-4 mr-2" />
                        {t("add_new_item")}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{t("add_new_inventory_item")}</DialogTitle>
                    </DialogHeader>
                    <AddItemForm onSuccess={handleAddSuccess} />
                </DialogContent>
            </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> {t("inventory")} ({inventoryItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryTable key={inventoryKey} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InventoryPage;