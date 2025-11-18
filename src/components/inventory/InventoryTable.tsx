import React, { useState, useMemo } from 'react';
import { InventoryItem } from '@/types/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InventoryItemActions from '@/components/inventory/InventoryItemActions';
import { formatCurrency } from '@/utils/currency-utils';

interface InventoryTableProps {
    items: InventoryItem[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items }) => {
  const { t } = useTranslation();
  
  // The filtering and sorting logic is now handled by the useInventory hook in the parent page.
  // This component just renders the provided list.

  const getStockVariant = (stock: number) => {
    if (stock === 0) return 'destructive';
    if (stock < 10) return 'default'; // Using default for warning color
    return 'secondary';
  };

  return (
    <div className="space-y-4">
      {/* Search input is now in the parent page */}
      
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[100px]">{t("id")}</TableHead>
              <TableHead>{t("item_name")}</TableHead>
              <TableHead>{t("category")}</TableHead>
              <TableHead className="text-right">{t("price")}</TableHead>
              <TableHead className="text-center">{t("stock")}</TableHead>
              <TableHead className="w-[120px]">{t("last_restock")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-8 h-8 rounded-sm overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {item.image_url ? (
                            <img 
                                src={item.image_url} 
                                alt={item.name} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <Image className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-xs">{item.id.substring(0, 8)}...</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStockVariant(item.stock)}>
                      {item.stock} {item.stock === 0 ? t("out_of_stock") : t("in_stock")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.last_restock ? item.last_restock : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Pass the item directly. Actions component will handle mutations and invalidation */}
                    <InventoryItemActions item={item} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      {t("no_products_found")}
                  </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InventoryTable;