import React, { useState, useMemo } from 'react';
import { InventoryItem, inventoryItems } from '@/data/inventory';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InventoryItemActions from '@/components/inventory/InventoryItemActions';
import { formatCurrency } from '@/utils/currency-utils';

const InventoryTable: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  // Use state to hold the list, so updates from forms trigger re-render
  const [items, setItems] = useState<InventoryItem[]>(inventoryItems);

  const filteredItems = useMemo(() => {
    const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
    
    if (!searchTerm) {
      return sortedItems;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return sortedItems.filter(item =>
      item.name.toLowerCase().includes(lowerCaseSearch) ||
      item.category.toLowerCase().includes(lowerCaseSearch) ||
      item.id.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, items]);
  
  const handleItemUpdate = (updatedItem: InventoryItem) => {
    // Update the local state to reflect changes (restock or edit)
    setItems(prevItems => prevItems.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const getStockVariant = (stock: number) => {
    if (stock === 0) return 'destructive';
    if (stock < 10) return 'default'; // Using default for warning color
    return 'secondary';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
              placeholder={t("search_items_by_name")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
          />
      </div>
      
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
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-8 h-8 rounded-sm overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {item.imageUrl ? (
                            <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <Image className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-xs">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStockVariant(item.stock)}>
                      {item.stock} {item.stock === 0 ? t("out_of_stock") : t("in_stock")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.lastRestock}</TableCell>
                  <TableCell className="text-right">
                    <InventoryItemActions item={item} onUpdate={handleItemUpdate} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      {t("no_products_found", { term: searchTerm })}
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