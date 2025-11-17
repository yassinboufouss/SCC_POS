import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Pencil } from 'lucide-react';
import { InventoryItem, inventoryItems } from '@/data/inventory';
import InventoryItemSheet from '@/components/InventoryItemSheet';
import NewInventoryItemDialog from '@/components/NewInventoryItemDialog';
import { DataTable } from '@/components/DataTable';
import { createInventoryColumns } from './inventory/inventory-columns';

const InventoryPage = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsSheetOpen(true);
  };
  
  const columns = createInventoryColumns(handleEditItem);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <NewInventoryItemDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Current Stock ({inventoryItems.length} unique items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={inventoryItems}
            filterColumnId="name"
            filterPlaceholder="Search items by name..."
          />
        </CardContent>
      </Card>
      
      <InventoryItemSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedItem={selectedItem}
      />
    </div>
  );
};

export default InventoryPage;