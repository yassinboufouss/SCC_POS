import { InventoryItem, inventoryItems } from "@/data/inventory";
import { format } from "date-fns";
import { simulateApiCall } from "./api-simulation";

// Utility to simulate updating inventory data
export const updateInventoryItem = async (updatedItem: InventoryItem): Promise<void> => {
  const index = inventoryItems.findIndex(item => item.id === updatedItem.id);
  if (index !== -1) {
    // Simulate updating the item in the mock array
    inventoryItems[index] = updatedItem;
    console.log(`Mock Inventory Updated: ${updatedItem.name}`);
  }
  await simulateApiCall(undefined);
};

// Utility to simulate adding stock
export const restockInventoryItem = async (itemId: string, quantity: number): Promise<InventoryItem | null> => {
  const item = inventoryItems.find(i => i.id === itemId);
  if (item) {
    item.stock += quantity;
    item.lastRestock = format(new Date(), 'yyyy-MM-dd');
    await updateInventoryItem(item);
    return simulateApiCall(item);
  }
  return simulateApiCall(null);
};

// Utility to simulate adding a new inventory item
export const addInventoryItem = async (newItemData: Omit<InventoryItem, 'id' | 'lastRestock' | 'stock'> & { initialStock: number }): Promise<InventoryItem | null> => {
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
  return simulateApiCall(newItem);
};