export type InventoryItem = {
  id: string;
  name: string;
  category: 'Apparel' | 'Supplements' | 'Equipment';
  stock: number;
  price: number;
  lastRestock: string; // Date string
  imageUrl?: string; // Optional image URL
};

export const inventoryItems: InventoryItem[] = [
  {
    id: "INV001",
    name: "Protein Powder (Vanilla)",
    category: "Supplements",
    stock: 45,
    price: 39.99,
    lastRestock: "2024-10-01",
    imageUrl: "https://images.unsplash.com/photo-1579751626657-72bc17010498?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "INV002",
    name: "Gym Towel (Logo)",
    category: "Apparel",
    stock: 120,
    price: 9.50,
    lastRestock: "2024-09-15",
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2bc9461aa?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "INV003",
    name: "Water Bottle (Insulated)",
    category: "Equipment",
    stock: 15,
    price: 19.99,
    lastRestock: "2024-10-10",
    imageUrl: "https://images.unsplash.com/photo-1546877725-f67587a779f9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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