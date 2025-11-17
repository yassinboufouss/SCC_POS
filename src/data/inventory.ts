export type InventoryItem = {
  id: string;
  name: string;
  category: 'Apparel' | 'Supplements' | 'Equipment';
  stock: number;
  price: number;
  lastRestock: string; // Date string
};

export const inventoryItems: InventoryItem[] = [
  {
    id: "INV001",
    name: "Protein Powder (Vanilla)",
    category: "Supplements",
    stock: 45,
    price: 39.99,
    lastRestock: "2024-10-01",
  },
  {
    id: "INV002",
    name: "Gym Towel (Logo)",
    category: "Apparel",
    stock: 120,
    price: 9.50,
    lastRestock: "2024-09-15",
  },
  {
    id: "INV003",
    name: "Water Bottle (Insulated)",
    category: "Equipment",
    stock: 15,
    price: 19.99,
    lastRestock: "2024-10-10",
  },
  {
    id: "INV004",
    name: "Pre-Workout Mix",
    category: "Supplements",
    stock: 5, // Low stock
    price: 29.99,
    lastRestock: "2024-10-20",
  },
];