import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, X, Trash2, Plus, Minus, UserX, Ticket, Image, DollarSign, CreditCard, Receipt, Percent } from 'lucide-react';
import { inventoryItems, InventoryItem } from '@/data/inventory';
import { membershipPlans, MembershipPlan } from '@/data/membership-plans';
import { showSuccess, showError } from '@/utils/toast';
import MemberSelectDialog from '@/components/MemberSelectDialog';
import { Member } from '@/data/members';
import { updateInventoryItem } from '@/utils/inventory-utils';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { addTransaction } from '@/utils/transaction-utils';

// Define a unified CartItem type
interface CartItem {
  sourceId: string; // ID of the source item/plan
  name: string;
  price: number;
  quantity: number;
  type: 'inventory' | 'membership';
  // Only relevant for inventory items (for stock validation)
  stock?: number; 
  imageUrl?: string; // Added imageUrl for display in cart
}

const POSPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'Transfer'>('Card');
  const [discountPercent, setDiscountPercent] = useState(0); // New state for discount

  const filteredInventoryItems = useMemo(() => {
    return inventoryItems.filter(item =>
      item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(inventorySearchTerm.toLowerCase())
    );
  }, [inventorySearchTerm]);

  // --- Cart Manipulation Functions ---

  const addInventoryToCart = (item: InventoryItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.sourceId === item.id && i.type === 'inventory');
      
      if (existingItem) {
        if (existingItem.quantity + 1 > item.stock) {
            showSuccess(`Cannot add more ${item.name}. Stock limit reached.`);
            return prevCart;
        }
        return prevCart.map(i =>
          i.sourceId === item.id && i.type === 'inventory' ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      
      return [...prevCart, { 
          sourceId: item.id, 
          name: item.name, 
          price: item.price, 
          quantity: 1, 
          type: 'inventory', 
          stock: item.stock,
          imageUrl: item.imageUrl // Store image URL
      }];
    });
  };
  
  const addMembershipToCart = (plan: MembershipPlan) => {
    setCart(prevCart => {
        const existingItem = prevCart.find(i => i.sourceId === plan.id && i.type === 'membership');

        if (existingItem) {
            return prevCart.map(i =>
                i.sourceId === plan.id && i.type === 'membership' ? { ...i, quantity: i.quantity + 1 } : i
            );
        }

        return [...prevCart, { 
            sourceId: plan.id, 
            name: `${plan.name} (${plan.durationDays} days)`, 
            price: plan.price, 
            quantity: 1, 
            type: 'membership' 
        }];
    });
  };

  const updateQuantity = (sourceId: string, type: 'inventory' | 'membership', delta: number) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.sourceId === sourceId && i.type === type);
      if (!item) return prevCart;

      const newQuantity = item.quantity + delta;
      
      if (newQuantity <= 0) {
        return prevCart.filter(i => !(i.sourceId === sourceId && i.type === type));
      }
      
      if (item.type === 'inventory') {
        const inventoryStock = inventoryItems.find(i => i.id === sourceId)?.stock || 0;
        if (newQuantity > inventoryStock) {
          showError(`Cannot add more ${item.name}. Stock limit reached.`);
          return prevCart;
        }
      }

      return prevCart.map(i =>
        i.sourceId === sourceId && i.type === type ? { ...i, quantity: newQuantity } : i
      );
    });
  };

  const removeItem = (sourceId: string, type: 'inventory' | 'membership') => {
    setCart(prevCart => prevCart.filter(i => !(i.sourceId === sourceId && i.type === type)));
  };
  
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 0) {
        setDiscountPercent(0);
    } else if (value > 100) {
        setDiscountPercent(100);
    } else {
        setDiscountPercent(value);
    }
  };

  // --- Calculations ---

  const { subtotal, discountAmount, taxableSubtotal, tax, total } = useMemo(() => {
    const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // 1. Apply Discount to Subtotal
    const discountFactor = discountPercent / 100;
    const discountAmount = rawSubtotal * discountFactor;
    const discountedSubtotal = rawSubtotal - discountAmount;
    
    const TAX_RATE = 0.08; // 8% sales tax
    
    // 2. Calculate Taxable Base (only inventory items, after discount)
    const rawTaxableSubtotal = cart
        .filter(item => item.type === 'inventory')
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
        
    // Apply the same percentage discount to the taxable base
    const discountedTaxableSubtotal = rawTaxableSubtotal * (1 - discountFactor);
        
    const calculatedTax = discountedTaxableSubtotal * TAX_RATE;
    const finalTotal = discountedSubtotal + calculatedTax;
    
    return { 
        subtotal: rawSubtotal, 
        discountAmount, 
        taxableSubtotal: discountedTaxableSubtotal, 
        tax: calculatedTax, 
        total: finalTotal 
    };
  }, [cart, discountPercent]);

  // --- Checkout ---

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!paymentMethod) {
        showError("Please select a payment method.");
        return;
    }

    // 1. Process inventory stock reduction (mock)
    const inventoryItemsSold = cart.filter(item => item.type === 'inventory');
    inventoryItemsSold.forEach(item => {
        const inventoryItem = inventoryItems.find(i => i.id === item.sourceId);
        if (inventoryItem) {
            const updatedItem = {
                ...inventoryItem,
                stock: inventoryItem.stock - item.quantity,
            };
            updateInventoryItem(updatedItem); 
        }
    });
    
    const hasMembership = cart.some(item => item.type === 'membership');
    const hasInventory = inventoryItemsSold.length > 0;
    
    let transactionType: 'Membership' | 'POS Sale' | 'Mixed Sale';
    if (hasMembership && hasInventory) {
        transactionType = 'Mixed Sale';
    } else if (hasMembership) {
        transactionType = 'Membership';
    } else {
        transactionType = 'POS Sale';
    }
    
    const itemDescription = cart.map(item => `${item.name} x${item.quantity}`).join(', ');
    
    const newTransaction = {
        memberId: selectedMember?.id || 'GUEST',
        memberName: selectedMember?.name || 'Guest Customer',
        type: transactionType,
        item: itemDescription,
        amount: total,
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: paymentMethod,
    };

    addTransaction(newTransaction);

    console.log("Processing sale:", newTransaction);
    showSuccess(`${transactionType} processed successfully via ${paymentMethod}! Total: $${total.toFixed(2)}`);
    
    // Reset state
    setCart([]);
    setInventorySearchTerm('');
    setSelectedMember(null);
    setPaymentMethod('Card');
    setDiscountPercent(0); // Reset discount
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Point of Sale (POS)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Product Selection (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Membership Plans Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" /> Membership Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {membershipPlans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className="border rounded-lg p-3 cursor-pointer bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex flex-col justify-between"
                    onClick={() => addMembershipToCart(plan)}
                  >
                    <div>
                      <p className="font-medium truncate">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.durationDays} days</p>
                    </div>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">${plan.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Inventory Products Section */}
          <Card>
            <CardHeader>
              <CardTitle>Available Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search inventory products..."
                value={inventorySearchTerm}
                onChange={(e) => setInventorySearchTerm(e.target.value)}
                className="mb-4"
              />
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[40vh] overflow-y-auto pr-2">
                {filteredInventoryItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={cn(
                        "border rounded-lg p-3 cursor-pointer hover:bg-primary/10 transition-colors flex flex-col justify-between",
                        item.stock === 0 && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => item.stock > 0 && addInventoryToCart(item)}
                  >
                    {/* Product Image */}
                    <div className="h-24 w-full mb-2 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {item.imageUrl ? (
                            <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <Image className="h-6 w-6 text-muted-foreground" />
                        )}
                    </div>
                    
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
                {filteredInventoryItems.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-8">No products found matching "{inventorySearchTerm}"</p>
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
                  cart.map((item, index) => (
                    <div key={`${item.sourceId}-${index}`} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Image Thumbnail for Inventory Items */}
                        {item.type === 'inventory' && (
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
                        )}
                        
                        <div className="min-w-0">
                            <p className="font-medium truncate flex items-center gap-1">
                                {item.type === 'membership' && <Ticket className="h-3 w-3 text-blue-500" />}
                                {item.name}
                            </p>
                            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.sourceId, item.type, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.sourceId, item.type, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-100" onClick={() => removeItem(item.sourceId, item.type)}>
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
                  
                  {/* Discount Input */}
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="discount-input" className="flex items-center gap-1 text-muted-foreground">
                        <Percent className="h-3 w-3" /> Discount (%)
                    </Label>
                    <Input
                        id="discount-input"
                        type="number"
                        placeholder="0"
                        value={discountPercent === 0 ? '' : discountPercent}
                        onChange={handleDiscountChange}
                        className="w-20 h-8 text-right"
                        min={0}
                        max={100}
                    />
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-500">
                        <span>Discount Applied:</span>
                        <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Tax (8% on inventory):</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
            
                {/* Payment Method Selection */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm mb-2">Select Payment Method</h4>
                    <RadioGroup 
                        defaultValue="Card" 
                        value={paymentMethod} 
                        onValueChange={(value: 'Card' | 'Cash' | 'Transfer') => setPaymentMethod(value)}
                        className="grid grid-cols-3 gap-2"
                    >
                        <Label
                            htmlFor="payment-card"
                            className={cn(
                                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                paymentMethod === 'Card' && "border-primary"
                            )}
                        >
                            <CreditCard className="mb-1 h-5 w-5" />
                            Card
                            <RadioGroupItem value="Card" id="payment-card" className="sr-only" />
                        </Label>
                        <Label
                            htmlFor="payment-cash"
                            className={cn(
                                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                paymentMethod === 'Cash' && "border-primary"
                            )}
                        >
                            <DollarSign className="mb-1 h-5 w-5" />
                            Cash
                            <RadioGroupItem value="Cash" id="payment-cash" className="sr-only" />
                        </Label>
                        <Label
                            htmlFor="payment-transfer"
                            className={cn(
                                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                paymentMethod === 'Transfer' && "border-primary"
                            )}
                        >
                            <Receipt className="mb-1 h-5 w-5" />
                            Transfer
                            <RadioGroupItem value="Transfer" id="payment-transfer" className="sr-only" />
                        </Label>
                    </RadioGroup>
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