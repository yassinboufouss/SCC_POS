import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { inventoryItems, InventoryItem } from '@/data/inventory';

const LOW_STOCK_THRESHOLD = 10;

const InventoryPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Current Stock ({inventoryItems.length} unique items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock Level</TableHead>
                <TableHead>Last Restock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item: InventoryItem) => {
                const isLowStock = item.stock <= LOW_STOCK_THRESHOLD;
                
                let stockBadgeVariant: 'default' | 'secondary' | 'destructive' = 'secondary';
                if (item.stock === 0) {
                    stockBadgeVariant = 'destructive';
                } else if (isLowStock) {
                    stockBadgeVariant = 'destructive';
                } else {
                    stockBadgeVariant = 'default';
                }

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={stockBadgeVariant} className="flex items-center justify-center mx-auto w-28">
                        {isLowStock && item.stock > 0 && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {item.stock} {item.stock === 0 ? 'Out of Stock' : 'in Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.lastRestock}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryPage;