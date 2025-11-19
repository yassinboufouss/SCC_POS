import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, PackagePlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import InventoryTable from '@/components/inventory/InventoryTable';
import AddItemForm from '@/components/inventory/AddItemForm';
import { useInventory } from '@/integrations/supabase/data/use-inventory.ts';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRole } from '@/hooks/use-user-role';

const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { isOwner } = useUserRole();
  
  const { data: inventoryItems, isLoading } = useInventory(searchTerm);

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    // React Query handles invalidation, no need for inventoryKey state
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t("inventory_management")}</h1>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button disabled={!isOwner}>
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
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> {t("inventory")} ({inventoryItems?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                    placeholder={t("search_items_by_name")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm flex-1"
                />
            </div>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            ) : (
                <InventoryTable items={inventoryItems || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InventoryPage;