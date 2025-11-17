import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, X, Trash2, Plus, Minus, UserX } from 'lucide-react';
import { inventoryItems, InventoryItem } from '@/data/inventory';
import { showSuccess } from '@/utils/toast';
import MemberSelectDialog from '@/components/MemberSelectDialog';
import { Member } from '@/data/members';

interface CartItem extends InventoryItem {
  quantity: number;
}

const POSPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const addToCart = (item: InventoryItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id);
      if (existingItem) {
        // Check stock limit
        if (existingItem.quantity + 1 > item.stock) {
            // In a real app, we'd show an error toast here.
            return prevCart;
        }
        return prevCart.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.id === itemId);
      if (!item) return prevCart;

      const newQuantity = item.quantity + delta;
      const inventoryStock = inventoryItems.find(i => i.id === itemId)?.stock || 0;

      if (newQuantity <= 0) {
        return prevCart.filter(i => i.id !== itemId);
      }
      
      if (newQuantity > inventoryStock) {
        // Stock limit reached
        return prevCart;
      }

      return prevCart.map(i =>
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      );
    });
  };

  const removeItem = (itemId: string) => {
    setCart(prevCart => prevCart.filter(i => i.id !== itemId));
  };

  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const TAX_RATE = 0.08; // 8% sales tax
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const transactionDetails = {
        memberId: selectedMember?.id || 'GUEST',
        memberName: selectedMember?.name || 'Guest Customer',
        items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total: total.toFixed(2),
    };

    console.log("Processing sale:", transactionDetails);
    showSuccess(`Sale processed successfully! Total: $${total.toFixed(2)}`);
    setCart([]);
    setSearchTerm('');
    setSelectedMember(null); // Clear member after checkout
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Point of Sale (POS)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Product Selection (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="border rounded-lg p-3 cursor-pointer hover:bg-primary/10 transition-colors flex flex-col justify-between"
                    onClick={() => addToCart(item)}
                  >
                    <div>
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">${item.price.toFixed(2)}</span>
                      <span className={`text-xs font-semibold ${item.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                        Stock: {item.stock}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">No products found matching "{searchTerm}"</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart & Checkout (1/3 width) */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Shopping Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              
              {/* Member Selection */}
              <div className="mb-4">
                <MemberSelectDialog 
                    onSelectMember={setSelectedMember} 
                    selectedMember={selectedMember} 
                />
                {selectedMember && (
                    <div className="flex items-center justify-between text-sm mt-2 p-2 bg-accent rounded-md">
                        <p className="font-medium">
                            {selectedMember.name}
                        </p>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedMember(null)}>
                            <UserX className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {cart.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    Cart is empty. Add items to start a sale.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-100" onClick={() => removeItem(item.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals and Checkout */}
              <div className="mt-auto pt-4 border-t">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 h-12 text-lg" 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  Process Sale
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full mt-2 text-red-500" 
                  onClick={() => setCart([])}
                  disabled={cart.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Clear Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default POSPage;