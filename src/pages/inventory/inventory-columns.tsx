import { ColumnDef } from "@tanstack/react-table";
import { InventoryItem } from "@/data/inventory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, AlertTriangle } from "lucide-react";

// Define a type for the action handler passed from the parent component
type InventoryActionHandler = (item: InventoryItem) => void;

const LOW_STOCK_THRESHOLD = 10;

export const createInventoryColumns = (onEditItem: InventoryActionHandler): ColumnDef<InventoryItem>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Item Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const price: number = row.getValue("price");
      return <div className="text-right font-semibold">${price.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Stock
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const stock: number = row.getValue("stock");
      const isLowStock = stock <= LOW_STOCK_THRESHOLD;
      
      let stockBadgeVariant: 'default' | 'secondary' | 'destructive' = 'secondary';
      if (stock === 0) {
          stockBadgeVariant = 'destructive';
      } else if (isLowStock) {
          stockBadgeVariant = 'destructive';
      } else {
          stockBadgeVariant = 'default';
      }

      return (
        <div className="text-center">
          <Badge variant={stockBadgeVariant} className="flex items-center justify-center mx-auto w-28">
            {isLowStock && stock > 0 && <AlertTriangle className="h-3 w-3 mr-1" />}
            {stock} {stock === 0 ? 'Out of Stock' : 'in Stock'}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "lastRestock",
    header: "Last Restock",
    cell: ({ row }) => <div className="text-muted-foreground text-sm">{row.getValue("lastRestock")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="text-right">
            <Button variant="outline" size="sm" onClick={() => onEditItem(item)}>
                <Pencil className="h-4 w-4" />
            </Button>
        </div>
      );
    },
  },
];