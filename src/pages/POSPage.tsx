import React, { useState, useMemo } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { reduceInventoryStock } from '@/utils/inventory-utils';
import { format } from 'date-fns';
import { useAddTransaction } from '@/integrations/supabase/data/use-transactions.ts';
import { useInventory } from '@/integrations/supabase/data/use-inventory.ts';
import { useRenewMemberPlan } from '@/integrations/supabase/data/use-members.ts';
import POSProductSelection from '@/components/pos/POSProductSelection';
import POSCartAndCheckout from '@/components/pos/POSCartAndCheckout';
import MemberCheckInScanner from '@/components/members/MemberCheckInScanner';
import POSMemberSelector from '@/components/pos/POSMemberSelector';
import POSTransactionSummary from '@/components/pos/POSTransactionSummary';
import { CartItem, PaymentMethod } from '@/types/pos';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { formatCurrency } from '@/utils/currency-utils';
import { Profile, InventoryItem, MembershipPlan } from '@/types/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, UserPlus } from 'lucide-react';
import MemberRegistrationForm from '@/components/members/MemberRegistrationForm';
import { usePlans } from '@/integrations/supabase/data/use-plans.ts';

const POSPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash'); 
  const [discountPercent, setDiscountPercent] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'register'>('products'); // New state for tabs
  
  // Fetch live inventory data to check stock limits
  const { data: liveInventoryItems } = useInventory();
  const { data: membershipPlans } = usePlans(); // Fetch all plans to look up details after registration
  const { mutateAsync: addTransaction, isPending: isProcessingSale } = useAddTransaction();
  const { mutateAsync: renewMember } = useRenewMemberPlan();

  // --- Cart Manipulation Functions ---

  const addInventoryToCart = (item: InventoryItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.sourceId === item.id && i.type === 'inventory');
      
      // Use live stock data for check
      const currentStock = liveInventoryItems?.find(i => i.id === item.id)?.stock || item.stock;
      
      if (existingItem) {
        if (existingItem.quantity + 1 > currentStock) {
            showError(t("cannot_add_more_stock_limit", { name: item.name }));
            return prevCart;
        }
        return prevCart.map(i =>
          i.sourceId === item.id && i.type === 'inventory' ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      
      if (currentStock === 0) {
          showError(t("out_of_stock_cannot_add", { name: item.name }));
          return prevCart;
      }
      
      return [...prevCart, { 
          sourceId: item.id, 
          name: item.name, 
          price: item.price, 
          quantity: 1, 
          type: 'inventory', 
          stock: currentStock,
          imageUrl: item.image_url || undefined
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
            name: `${plan.name} (${plan.duration_days} ${t("days")})`, 
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
        const inventoryStock = liveInventoryItems?.find(i => i.id === sourceId)?.stock || item.stock || 0;
        if (newQuantity > inventoryStock) {
          showError(t("cannot_add_more_stock_limit", { name: item.name }));
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
  
  const handleClearMember = () => {
    setSelectedMember(null);
  };
  
  const handleClearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setSelectedMember(null);
    setPaymentMethod('Cash'); // Reset payment method
  };
  
  // Handler for member lookup via check-in scanner
  const handleMemberFound = (member: Profile) => {
      setSelectedMember(member);
      // If the member is not active, prompt for renewal by adding a generic membership item to the cart
      // NOTE: We won't automatically add an item, but selecting the member is enough to proceed with renewal in the POS flow.
  };
  
  const handleRegistrationSuccess = (member: Profile, planId: string) => {
    // 1. Select the new member
    setSelectedMember(member);
    
    // 2. Add the purchased plan to the cart
    const plan = membershipPlans?.find(p => p.id === planId);
    if (plan) {
        addMembershipToCart(plan);
        showSuccess(t("registration_and_cart_success", { name: `${member.first_name} ${member.last_name}` }));
    } else {
        showError(t("plan_not_found_after_registration"));
    }
    
    // 3. Switch back to the products tab
    setActiveTab('products');
  };


  // --- Calculations ---

  const { subtotal, discountAmount, tax, total } = useMemo(() => {
    const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // 1. Apply Discount to Subtotal
    const discountFactor = discountPercent / 100;
    const discountAmount = rawSubtotal * discountFactor;
    
    const TAX_RATE = 0.08; // 8% sales tax
    
    // 2. Calculate Taxable Base (only inventory items, after discount)
    const rawTaxableSubtotal = cart
        .filter(item => item.type === 'inventory')
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
        
    // Apply the same percentage discount to the taxable base
    const discountedTaxableSubtotal = rawTaxableSubtotal * (1 - discountFactor);
        
    const calculatedTax = discountedTaxableSubtotal * TAX_RATE;
    const discountedSubtotal = rawSubtotal - discountAmount;
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
    
    try {
        // 1. Process inventory stock reduction (using RPC for atomic update)
        const inventoryItemsSold = cart.filter(item => item.type === 'inventory');
        
        await Promise.all(inventoryItemsSold.map(async item => {
            await reduceInventoryStock(item.sourceId, item.quantity);
        }));
        
        // 2. Process Membership Renewals (if a member is selected)
        const membershipItemsSold = cart.filter(item => item.type === 'membership');
        
        if (selectedMember && membershipItemsSold.length > 0) {
            // Renew the selected member's plan for each membership item in the cart
            for (const item of membershipItemsSold) {
                const planId = item.sourceId;
                for (let i = 0; i < item.quantity; i++) {
                    const updatedMember = await renewMember({ profileId: selectedMember.id, planId });
                    if (updatedMember) {
                        // Update local state to reflect the latest expiration date for stacking
                        setSelectedMember(updatedMember); 
                    }
                }
            }
            showSuccess(t("membership_renewal_pos_success", { name: `${selectedMember.first_name} ${selectedMember.last_name}` }));
        }
        
        // 3. Determine transaction type and description
        const hasMembership = membershipItemsSold.length > 0;
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
        const memberName = selectedMember ? `${selectedMember.first_name} ${selectedMember.last_name}` : t('guest_customer');
        
        const newTransaction = {
            member_id: memberId,
            member_name: memberName,
            type: transactionType,
            item_description: itemDescription,
            amount: total,
            payment_method: paymentMethod,
            transaction_date: format(new Date(), 'yyyy-MM-dd'),
        };

        await addTransaction(newTransaction);

        showSuccess(t("sale_processed_success", { 
            type: transactionType, 
            method: t(paymentMethod.toLowerCase()), 
            total: formatCurrency(total),
        }));
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        
        // Reset state
        setCart([]);
        setInventorySearchTerm('');
        setDiscountPercent(0);
        setSelectedMember(null);
        setPaymentMethod('Cash');
        
    } catch (error) {
        console.error("Checkout failed:", error);
        showError(t("checkout_failed"));
    }
  };

  return (
    <Layout>
      <div className="min-h-screen p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3 width) - Product Selection / Registration Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'products' | 'register')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="products">
                        <Package className="h-4 w-4 mr-2" /> {t("pos_products_tab")}
                    </TabsTrigger>
                    <TabsTrigger value="register">
                        <UserPlus className="h-4 w-4 mr-2" /> {t("pos_register_tab")}
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="products">
                    <POSProductSelection
                      inventorySearchTerm={inventorySearchTerm}
                      setInventorySearchTerm={setInventorySearchTerm}
                      addInventoryToCart={addInventoryToCart}
                      addMembershipToCart={addMembershipToCart}
                    />
                </TabsContent>
                
                <TabsContent value="register">
                    <MemberRegistrationForm onSuccess={handleRegistrationSuccess} />
                </TabsContent>
            </Tabs>
          </div>

          {/* Right Column (1/3 width) - Cart & Checkout */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
              <POSTransactionSummary />
              
              {/* Updated Check-In Scanner */}
              <MemberCheckInScanner onMemberFound={handleMemberFound} />
              
              <POSMemberSelector 
                selectedMember={selectedMember}
                onSelectMember={setSelectedMember}
                onClearMember={handleClearMember}
              />
              
              <POSCartAndCheckout
                  cart={cart}
                  selectedMember={selectedMember}
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
                  isProcessingSale={isProcessingSale}
                  onClearMember={handleClearMember} // Passed the clear function here
              />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default POSPage;