import React, { useState, useMemo } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { updateInventoryItem } from '@/utils/inventory-utils';
import { format } from 'date-fns';
import { addTransaction } from '@/utils/transaction-utils';
import { inventoryItems, InventoryItem } from '@/data/inventory';
import { membershipPlans, MembershipPlan } from '@/data/membership-plans';
import { Member } from '@/data/members';
import POSProductSelection from '@/components/pos/POSProductSelection';
import POSCartAndCheckout from '@/components/pos/POSCartAndCheckout';
import { CartItem, PaymentMethod } from '@/types/pos';

const POSPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [discountPercent, setDiscountPercent] = useState(0);

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
          imageUrl: item.imageUrl
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
  
  const handleClearCart = () => {
    setCart([]);
    setDiscountPercent(0);
  };

  // --- Calculations ---

  const { subtotal, discountAmount, tax, total } = useMemo(() => {
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
    setDiscountPercent(0);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Point of Sale (POS)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Product Selection (2/3 width) */}
        <div className="lg:col-span-2">
          <POSProductSelection
            inventorySearchTerm={inventorySearchTerm}
            setInventorySearchTerm={setInventorySearchTerm}
            addInventoryToCart={addInventoryToCart}
            addMembershipToCart={addMembershipToCart}
          />
        </div>

        {/* Cart & Checkout (1/3 width) */}
        <div className="lg:col-span-1">
          <POSCartAndCheckout
            cart={cart}
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            handleCheckout={handleCheckout}
            handleClearCart={handleClearCart}
            subtotal={subtotal}
            discountAmount={discountAmount}
            tax={tax}
            total={total}
          />
        </div>
      </div>
    </div>
  );
};

export default POSPage;