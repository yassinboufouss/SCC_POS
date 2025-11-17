import { InventoryItem, inventoryItems } from "@/data/inventory";
import { format } from "date-fns";

// Utility to simulate updating inventory data
export const updateInventoryItem = (updatedItem: InventoryItem) => {
  const index = inventoryItems.findIndex(item => item.id === updatedItem.id);
  if (index !== -1) {
    // Simulate updating the item in the mock array
    inventoryItems[index] = updatedItem;
    console.log(`Mock Inventory Updated: ${updatedItem.name}`);
  }
};

// Utility to simulate adding stock
export const restockInventoryItem = (itemId: string, quantity: number) => {
  const item = inventoryItems.find(i => i.id === itemId);
  if (item) {
    item.stock += quantity;
    item.lastRestock = format(new Date(), 'yyyy-MM-dd');
    updateInventoryItem(item);
    return item;
  }
  return null;
};