import React, { useState, useMemo } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { reduceInventoryStock } from '@/utils/inventory-utils';
import { format } from 'date-fns';
import { useAddTransaction } from '@/integrations/supabase/data/use-transactions.ts';
import { useInventory } from '@/integrations/supabase/data/use-inventory.ts';
import { useRenewMemberPlan } from '@/integrations/supabase/data/use-members.ts';
import POSProductSelection from '@/components/pos/POSProductSelection';
import POSCartAndCheckout from '@/components/pos/POSCartAndCheckout';
import POSMemberSelector from '@/components/pos/POSMemberSelector';
import POSTransactionSummary from '@/components/pos/POSTransactionSummary';
import { CartItem, PaymentMethod } from '@/types/pos';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { formatCurrency } from '@/utils/currency-utils';
import { Profile, InventoryItem, MembershipPlan, TransactionItemData } from '@/types/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, UserPlus } from 'lucide-react';
import MemberRegistrationForm from '@/components/members/MemberRegistrationForm';
import { usePlans } from '@/integrations/supabase/data/use-plans.ts';
import { v4 as uuidv4 } from 'uuid';

const POSPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash'); 
  const [discountPercent, setDiscountPercent] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'register'>('products');
  const [justRegisteredMemberId, setJustRegisteredMemberId] = useState<string | null>(null); // Track newly registered member
  
  // Fetch live inventory data to check stock limits and get giveaway details
  const { data: liveInventoryItems } = useInventory();
  const { data: membershipPlans } = usePlans();
  const { mutateAsync: addTransaction, isPending: isProcessingSale } = useAddTransaction();
  const { mutateAsync: renewMember } = useRenewMemberPlan();

  // --- Cart Manipulation Functions ---
  
  const updatePrice = (sourceId: string, type: 'inventory' | 'membership', newPrice: number) => {
    setCart(prevCart => prevCart.map(item => {
        if (item.sourceId === sourceId && item.type === type) {
            // Ensure price is non-negative
            const price = Math.max(0, newPrice);
            return { ...item, price };
        }
        return item;
    }));
  };

  const addCustomItemToCart = (item: CartItem) => {
    setCart(prevCart => [...prevCart, item]);
    showSuccess(t("item_added_to_cart", { name: item.name }));
  };

  const addInventoryToCart = (item: InventoryItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.sourceId === item.id && i.type === 'inventory' && !i.isGiveaway);
      
      // Use live stock data for check
      const currentStock = liveInventoryItems?.find(i => i.id === item.id)?.stock || item.stock;
      
      if (existingItem) {
        if (existingItem.quantity + 1 > currentStock) {
            showError(t("cannot_add_more_stock_limit", { name: item.name }));
            return prevCart;
        }
        return prevCart.map(i =>
          i.sourceId === item.id && i.type === 'inventory' && !i.isGiveaway ? { ...i, quantity: i.quantity + 1 } : i
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
          originalPrice: item.price, // Added originalPrice
          quantity: 1, 
          type: 'inventory', 
          stock: currentStock,
          imageUrl: item.image_url || undefined
      }];
    });
  };
  
  const addMembershipToCart = (plan: MembershipPlan) => {
    setCart(prevCart => {
        const newCart: CartItem[] = [];
        let planAdded = false;

        // 1. Add/Increment Membership Plan
        const existingPlan = prevCart.find(i => i.sourceId === plan.id && i.type === 'membership');

        if (existingPlan) {
            newCart.push(...prevCart.map(i =>
                i.sourceId === plan.id && i.type === 'membership' ? { ...i, quantity: i.quantity + 1 } : i
            ));
            planAdded = true;
        } else {
            newCart.push(...prevCart, { 
                sourceId: plan.id, 
                name: `${plan.name} (${plan.duration_days} ${t("days")})`, 
                price: plan.price, 
                originalPrice: plan.price, // Added originalPrice
                quantity: 1, 
                type: 'membership' 
            });
            planAdded = true;
        }
        
        // 2. Add Giveaway Item (if applicable and not already added as a giveaway for this plan)
        if (plan.giveaway_item_id) {
            const giveawayItem = liveInventoryItems?.find(i => i.id === plan.giveaway_item_id);
            
            if (giveawayItem) {
                // Check if the giveaway item is already in the cart as a FREE item for this plan
                const existingGiveaway = newCart.find(i => i.sourceId === giveawayItem.id && i.type === 'inventory' && i.isGiveaway);
                
                if (existingGiveaway) {
                    // If the plan quantity was incremented, increment the giveaway quantity too
                    if (planAdded && existingPlan) {
                        return newCart.map(i =>
                            i.sourceId === giveawayItem.id && i.type === 'inventory' && i.isGiveaway ? { ...i, quantity: i.quantity + 1 } : i
                        );
                    }
                } else {
                    // Add new giveaway item
                    newCart.push({
                        sourceId: giveawayItem.id,
                        name: `${giveawayItem.name} (${t("free_giveaway")})`,
                        price: 0, // FREE
                        originalPrice: giveawayItem.price, // Store original price for reference, even if price is 0
                        quantity: 1,
                        type: 'inventory',
                        stock: giveawayItem.stock,
                        imageUrl: giveawayItem.image_url || undefined,
                        isGiveaway: true, // Mark as free item
                    });
                }
            } else {
                showError(t("giveaway_item_not_found"));
            }
        }
        
        // Filter out any old items if we modified the cart structure above (e.g., if we didn't use map correctly)
        // Since we used map/push correctly, we just return the new cart.
        return newCart;
    });
  };

  const updateQuantity = (sourceId: string, type: 'inventory' | 'membership', delta: number) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.sourceId === sourceId && i.type === type && !i.isGiveaway);
      if (!item) return prevCart; // Only allow manual quantity update on non-giveaway items

      const newQuantity = item.quantity + delta;
      
      if (newQuantity <= 0) {
        // If removing the last item, also remove any associated free giveaway items
        const plan = membershipPlans?.find(p => p.id === sourceId && type === 'membership');
        
        if (plan?.giveaway_item_id) {
            return prevCart.filter(i => 
                !(i.sourceId === sourceId && i.type === type) && // Remove plan
                !(i.sourceId === plan.giveaway_item_id && i.isGiveaway) // Remove associated giveaway
            );
        }
        
        return prevCart.filter(i => !(i.sourceId === sourceId && i.type === type));
      }
      
      if (item.type === 'inventory' && item.stock !== Infinity) { // Check stock only for real inventory
        const inventoryStock = liveInventoryItems?.find(i => i.id === sourceId)?.stock || item.stock || 0;
        if (newQuantity > inventoryStock) {
          showError(t("cannot_add_more_stock_limit", { name: item.name }));
          return prevCart;
        }
      }
      
      // If updating a membership quantity, update the associated giveaway quantity too
      if (item.type === 'membership') {
          const plan = membershipPlans?.find(p => p.id === sourceId);
          if (plan?.giveaway_item_id) {
              return prevCart.map(i => {
                  if (i.sourceId === sourceId && i.type === 'membership') {
                      return { ...i, quantity: newQuantity };
                  }
                  if (i.sourceId === plan.giveaway_item_id && i.isGiveaway) {
                      return { ...i, quantity: newQuantity };
                  }
                  return i;
              });
          }
      }

      return prevCart.map(i =>
        i.sourceId === sourceId && i.type === type ? { ...i, quantity: newQuantity } : i
      );
    });
  };

  const removeItem = (sourceId: string, type: 'inventory' | 'membership') => {
    setCart(prevCart => {
        // If removing a membership plan, also remove its associated giveaway item
        if (type === 'membership') {
            const plan = membershipPlans?.find(p => p.id === sourceId);
            if (plan?.giveaway_item_id) {
                return prevCart.filter(i => 
                    !(i.sourceId === sourceId && i.type === type) && // Remove plan
                    !(i.sourceId === plan.giveaway_item_id && i.isGiveaway) // Remove associated giveaway
                );
            }
        }
        // Prevent removing giveaway items manually (they are tied to the plan)
        const itemToRemove = prevCart.find(i => i.sourceId === sourceId && i.type === type);
        if (itemToRemove?.isGiveaway) {
            showError(t("cannot_remove_giveaway"));
            return prevCart;
        }
        
        return prevCart.filter(i => !(i.sourceId === sourceId && i.type === type));
    });
  };
  
  const handleClearMember = () => {
    setSelectedMember(null);
    setJustRegisteredMemberId(null);
  };
  
  const handleClearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setSelectedMember(null);
    setPaymentMethod('Cash');
    setJustRegisteredMemberId(null);
  };
  
  // Handler for successful registration via POS tab (UPDATED)
  const handleRegistrationSuccess = ({ member, plan, paymentMethod }: { member: Profile, plan: Pick<MembershipPlan, 'id' | 'name' | 'duration_days' | 'price' | 'giveaway_item_id'>, paymentMethod: PaymentMethod }) => {
    // 1. Select the new member
    setSelectedMember(member);
    
    // 2. Set the payment method used for registration
    setPaymentMethod(paymentMethod);
    
    // 3. Mark as just registered
    setJustRegisteredMemberId(member.id); 
    
    // 4. Add the plan (and potential giveaway) to the cart. 
    // We cast 'plan' to MembershipPlan because addMembershipToCart expects the full type.
    addMembershipToCart(plan as MembershipPlan); 
    
    showSuccess(t("registration_and_cart_success", { name: `${member.first_name} ${member.last_name}` }));
    
    // 5. Switch back to the products tab
    setActiveTab('products');
  };


  // --- Calculations ---

  const { subtotal, discountAmount, tax, total } = useMemo(() => {
    // Only calculate price based on non-giveaway items
    const payableCart = cart.filter(item => !item.isGiveaway);
    
    // Use item.price (which might be overridden) for calculation
    const rawSubtotal = payableCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // 1. Apply Discount to Subtotal
    const discountFactor = discountPercent / 100;
    const discountAmount = rawSubtotal * discountFactor;
    
    const TAX_RATE = 0.08; // 8% sales tax
    
    // 2. Calculate Taxable Base (only inventory items, including custom items, after discount, excluding giveaways)
    // Custom items are treated as inventory for tax purposes.
    const rawTaxableSubtotal = payableCart
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

  // --- Checkout (UPDATED) ---

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
        // 1. Process inventory stock reduction (only for real inventory items, excluding custom items where stock is Infinity)
        const inventoryItemsSold = cart.filter(item => item.type === 'inventory');
        
        await Promise.all(inventoryItemsSold.map(async item => {
            // Check if it's a real inventory item (stock is not Infinity)
            if (item.stock !== Infinity) { 
                // Use live stock data for check
                const currentStock = liveInventoryItems?.find(i => i.id === item.sourceId)?.stock || item.stock || 0;
                if (currentStock >= item.quantity) {
                    await reduceInventoryStock(item.sourceId, item.quantity);
                } else {
                    // If a giveaway item is out of stock, we should still proceed with the sale, 
                    // but log a warning or notify staff (for now, we just log and proceed).
                    if (item.isGiveaway) {
                        console.warn(`Giveaway item ${item.name} is out of stock but sale proceeded.`);
                    } else {
                        throw new Error(t("checkout_failed_stock_issue", { name: item.name }));
                    }
                }
            }
        }));
        
        // 2. Process Membership Renewals/Activation
        const membershipItemsSold = cart.filter(item => item.type === 'membership');
        
        if (selectedMember && membershipItemsSold.length > 0) {
            let renewalPerformed = false;
            
            for (const item of membershipItemsSold) {
                const planId = item.sourceId;
                
                // If the selected member is the one just registered, we skip the renewal/activation step 
                // because registerNewUserAndProfile already handled the profile update.
                const isInitialRegistrationPlan = selectedMember.id === justRegisteredMemberId;
                
                if (!isInitialRegistrationPlan) {
                    // Case: Renewal or stacking for an existing member
                    for (let i = 0; i < item.quantity; i++) {
                        const updatedMemberResult = await renewMember({ profileId: selectedMember.id, planId });
                        if (updatedMemberResult?.profile) {
                            setSelectedMember(updatedMemberResult.profile); 
                            renewalPerformed = true;
                        }
                    }
                }
            }
            
            if (renewalPerformed) {
                showSuccess(t("membership_renewal_pos_success", { name: `${selectedMember.first_name} ${selectedMember.last_name}` }));
            }
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
        
        // Generate item description (legacy field)
        const itemDescription = cart.map(item => `${item.name} x${item.quantity}`).join(', ');
        
        // Generate structured item data (NEW field)
        const itemsData: TransactionItemData[] = cart.map(item => ({
            sourceId: item.sourceId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            type: item.type,
            isGiveaway: item.isGiveaway,
        }));
        
        // Use selected member details or default to Guest
        const memberId = selectedMember?.member_code || selectedMember?.id || 'GUEST';
        const memberName = selectedMember ? `${selectedMember.first_name} ${selectedMember.last_name}` : t('guest_customer');
        
        // Only record a transaction if the total is greater than zero OR if it contains a giveaway item (which has price 0 but needs tracking)
        if (total > 0 || cart.some(item => item.isGiveaway)) {
            const newTransaction = {
                member_id: memberId,
                member_name: memberName,
                type: transactionType,
                item_description: itemDescription,
                items_data: itemsData, // Include structured data
                amount: total,
                payment_method: paymentMethod,
            };

            await addTransaction(newTransaction);
        }


        showSuccess(t("sale_processed_success", { 
            type: transactionType, 
            method: t(paymentMethod.toLowerCase()), 
            total: formatCurrency(total),
        }));
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['profiles'] });

        
        // Reset state
        setCart([]);
        setInventorySearchTerm('');
        setDiscountPercent(0);
        setSelectedMember(null);
        setPaymentMethod('Cash');
        setJustRegisteredMemberId(null); // Clear registration flag
        
    } catch (error) {
        console.error("Checkout failed:", error);
        showError(t("checkout_failed"));
    }
  };

  return (
    <Layout>
      {/* Removed h-screen and overflow-hidden from the main container */}
      <div className="p-4 lg:p-6 flex flex-col h-full"> 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0"> {/* Use flex-1 and min-h-0 */}
          
          {/* Left Column (2/3 width) - Product Selection / Registration Tabs */}
          <div className="lg:col-span-2 flex flex-col min-h-0"> 
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'products' | 'register')} className="flex flex-col flex-1 min-h-0">
                <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
                    <TabsTrigger value="products">
                        <Package className="h-4 w-4 mr-2" /> {t("pos_products_tab")}
                    </TabsTrigger>
                    <TabsTrigger value="register">
                        <UserPlus className="h-4 w-4 mr-2" /> {t("pos_register_tab")}
                    </TabsTrigger>
                </TabsList>
                
                {/* Content area needs to be scrollable if necessary */}
                <TabsContent value="products" className="flex-1 min-h-0 overflow-y-auto pb-4">
                    <POSProductSelection
                      inventorySearchTerm={inventorySearchTerm}
                      setInventorySearchTerm={setInventorySearchTerm}
                      addInventoryToCart={addInventoryToCart}
                      addMembershipToCart={addMembershipToCart}
                      addCustomItemToCart={addCustomItemToCart}
                    />
                </TabsContent>
                
                <TabsContent value="register" className="flex-1 min-h-0 overflow-y-auto pb-4">
                    <MemberRegistrationForm onSuccess={handleRegistrationSuccess} />
                </TabsContent>
            </Tabs>
          </div>

          {/* Right Column (1/3 width) - Cart & Checkout */}
          <div className="lg:col-span-1 flex flex-col space-y-4 min-h-0"> 
              <POSTransactionSummary />
              
              {/* Removed MemberCheckInScanner as it is now only on the Check-In page */}
              
              <POSMemberSelector 
                selectedMember={selectedMember}
                onSelectMember={setSelectedMember}
                onClearMember={handleClearMember}
              />
              
              {/* Make this component take up remaining space */}
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
                  onClearMember={handleClearMember}
                  updatePrice={updatePrice} // Pass the new function
                  className="flex-1"
              />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default POSPage;