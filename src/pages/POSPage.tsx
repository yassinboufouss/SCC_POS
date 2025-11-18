import React, { useState, useMemo } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { updateInventoryItem } from '@/utils/inventory-utils';
import { format } from 'date-fns';
import { addTransaction } from '@/utils/transaction-utils';
import { inventoryItems, InventoryItem } from '@/data/inventory';
import { membershipPlans, MembershipPlan } from '@/data/membership-plans';
import POSProductSelection from '@/components/pos/POSProductSelection';
import POSCartAndCheckout from '@/components/pos/POSCartAndCheckout';
import POSCheckIn from '@/components/pos/POSCheckIn';
import POSMemberSelector from '@/components/pos/POSMemberSelector';
import POSTransactionSummary from '@/components/pos/POSTransactionSummary';
import { CartItem, PaymentMethod } from '@/types/pos';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { formatCurrency } from '@/utils/currency-utils';
import { Member } from '@/data/members';

const POSPage = () => {
  const { t } = useTranslation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  // Hardcode payment method to 'Cash'
  const paymentMethod: PaymentMethod = 'Cash'; 
  const [discountPercent, setDiscountPercent] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // --- Cart Manipulation Functions ---

  const addInventoryToCart = (item: InventoryItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.sourceId === item.id && i.type === 'inventory');
      
      if (existingItem) {
        if (existingItem.quantity + 1 > item.stock) {
            showSuccess(t("cannot_add_more_stock_limit", { defaultValue: `Cannot add more ${item.name}. Stock limit reached.` }));
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
            name: `${plan.name} (${plan.durationDays} ${t("days")})`, 
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
          showError(t("cannot_add_more_stock_limit", { defaultValue: `Cannot add more ${item.name}. Stock limit reached.` }));
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
    setSelectedMember(null);
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

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    // Payment method is always 'Cash' now

    // 1. Process inventory stock reduction (mock)
    const inventoryItemsSold = cart.filter(item => item.type === 'inventory');
    
    // Use Promise.all to wait for all inventory updates
    await Promise.all(inventoryItemsSold.map(async item => {
        const inventoryItem = inventoryItems.find(i => i.id === item.sourceId);
        if (inventoryItem) {
            const updatedItem = {
                ...inventoryItem,
                stock: inventoryItem.stock - item.quantity,
            };
            await updateInventoryItem(updatedItem); 
        }
    }));
    
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
    
    // Use selected member details or default to Guest
    const memberId = selectedMember?.id || 'GUEST';
    const memberName = selectedMember?.name || t('guest_customer');
    
    const newTransaction = {
        memberId: memberId,
        memberName: memberName,
        type: transactionType,
        item: itemDescription,
        amount: total,
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: paymentMethod, // Always 'Cash'
    };

    await addTransaction(newTransaction);

    console.log("Processing sale:", newTransaction);
    showSuccess(t("sale_processed_success", { 
        type: transactionType, 
        method: t(paymentMethod.toLowerCase()), 
        total: formatCurrency(total),
        defaultValue: `${transactionType} processed successfully via ${paymentMethod}! Total: ${formatCurrency(total)}`
    }));
    
    // Reset state
    setCart([]);
    setInventorySearchTerm('');
    setDiscountPercent(0);
    setSelectedMember(null);
  };

  return (
    <Layout>
      <div className="min-h-screen p-4 lg:p-6">
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
          <div className="lg:col-span-1 flex flex-col space-y-6">
              <POSTransactionSummary />
              <POSCheckIn />
              
              <POSMemberSelector 
                selectedMember={selectedMember}
                onSelectMember={setSelectedMember}
                onClearMember={() => setSelectedMember(null)}
              />
              
              <POSCartAndCheckout
                  cart={cart}
                  selectedMember={selectedMember}
                  paymentMethod={paymentMethod} // Passed as hardcoded value
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
    </Layout>
  );
};

export default POSPage;