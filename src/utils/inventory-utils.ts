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

// Utility to simulate adding a new inventory item
export const addInventoryItem = (newItemData: Omit<InventoryItem, 'id' | 'lastRestock' | 'stock'> & { initialStock: number }): InventoryItem => {
  const id = `INV${(inventoryItems.length + 1).toString().padStart(3, '0')}`; // Mock ID generation
  const now = format(new Date(), 'yyyy-MM-dd');

  const newItem: InventoryItem = {
    id,
    name: newItemData.name,
    category: newItemData.category,
    stock: newItemData.initialStock,
    price: newItemData.price,
    lastRestock: now,
    imageUrl: newItemData.imageUrl || undefined,
  };

  inventoryItems.push(newItem);
  console.log("Added Inventory Item:", newItem);
  return newItem;
};