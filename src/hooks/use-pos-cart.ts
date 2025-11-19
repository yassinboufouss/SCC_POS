import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAddTransaction } from '@/integrations/supabase/data/use-transactions.ts';
import { useInventory } from '@/integrations/supabase/data/use-inventory.ts';
import { usePlans } from '@/integrations/supabase/data/use-plans.ts';
import { useRenewMemberPlan } from '@/integrations/supabase/data/use-members.ts';
import { CartItem, PaymentMethod } from '@/types/pos';
import { Profile, InventoryItem, MembershipPlan, TransactionItemData } from '@/types/supabase';
import { reduceInventoryStock } from '@/utils/inventory-utils';
import { showSuccess, showError } from '@/utils/toast';
import { formatCurrency } from '@/utils/currency-utils';
import { v4 as uuidv4 } from 'uuid';

export const usePOSCart = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // --- State ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash'); 
  const [discountPercent, setDiscountPercent] = useState(0);
  const [justRegisteredMemberId, setJustRegisteredMemberId] = useState<string | null>(null); 
  
  // --- Data Hooks ---
  const { data: liveInventoryItems } = useInventory();
  const { data: membershipPlans } = usePlans();
  const { mutateAsync: addTransaction, isPending: isProcessingSale } = useAddTransaction();
  const { mutateAsync: renewMember } = useRenewMemberPlan();

  // --- Cart Manipulation Functions ---
  
  const updatePrice = (sourceId: string, type: 'inventory' | 'membership', newPrice: number) => {
    setCart(prevCart => prevCart.map(item => {
        if (item.sourceId === sourceId && item.type === type) {
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
          originalPrice: item.price, 
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
                originalPrice: plan.price, 
                quantity: 1, 
                type: 'membership' 
            });
            planAdded = true;
        }
        
        if (plan.giveaway_item_id) {
            const giveawayItem = liveInventoryItems?.find(i => i.id === plan.giveaway_item_id);
            
            if (giveawayItem) {
                const existingGiveaway = newCart.find(i => i.sourceId === giveawayItem.id && i.type === 'inventory' && i.isGiveaway);
                
                if (existingGiveaway) {
                    if (planAdded && existingPlan) {
                        return newCart.map(i =>
                            i.sourceId === giveawayItem.id && i.type === 'inventory' && i.isGiveaway ? { ...i, quantity: i.quantity + 1 } : i
                        );
                    }
                } else {
                    newCart.push({
                        sourceId: giveawayItem.id,
                        name: `${giveawayItem.name} (${t("free_giveaway")})`,
                        price: 0, 
                        originalPrice: giveawayItem.price, 
                        quantity: 1,
                        type: 'inventory',
                        stock: giveawayItem.stock,
                        imageUrl: giveawayItem.image_url || undefined,
                        isGiveaway: true, 
                    });
                }
            } else {
                showError(t("giveaway_item_not_found"));
            }
        }
        
        return newCart;
    });
  };

  const updateQuantity = (sourceId: string, type: 'inventory' | 'membership', delta: number) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.sourceId === sourceId && i.type === type && !i.isGiveaway);
      if (!item) return prevCart; 

      const newQuantity = item.quantity + delta;
      
      if (newQuantity <= 0) {
        const plan = membershipPlans?.find(p => p.id === sourceId && type === 'membership');
        
        if (plan?.giveaway_item_id) {
            return prevCart.filter(i => 
                !(i.sourceId === sourceId && i.type === type) && 
                !(i.sourceId === plan.giveaway_item_id && i.isGiveaway) 
            );
        }
        
        return prevCart.filter(i => !(i.sourceId === sourceId && i.type === type));
      }
      
      if (item.type === 'inventory' && item.stock !== Infinity) { 
        const inventoryStock = liveInventoryItems?.find(i => i.id === sourceId)?.stock || item.stock || 0;
        if (newQuantity > inventoryStock) {
          showError(t("cannot_add_more_stock_limit", { name: item.name }));
          return prevCart;
        }
      }
      
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
        if (type === 'membership') {
            const plan = membershipPlans?.find(p => p.id === sourceId);
            if (plan?.giveaway_item_id) {
                return prevCart.filter(i => 
                    !(i.sourceId === sourceId && i.type === type) && 
                    !(i.sourceId === plan.giveaway_item_id && i.isGiveaway) 
                );
            }
        }
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
  
  const handleRegistrationSuccess = ({ member, plan, paymentMethod }: { member: Profile, plan: Pick<MembershipPlan, 'id' | 'name' | 'duration_days' | 'price' | 'giveaway_item_id'>, paymentMethod: PaymentMethod }) => {
    setSelectedMember(member);
    setPaymentMethod(paymentMethod);
    setJustRegisteredMemberId(member.id); 
    addMembershipToCart(plan as MembershipPlan); 
    showSuccess(t("registration_and_cart_success", { name: `${member.first_name} ${member.last_name}` }));
    return member; 
  };


  // --- Calculations ---

  const { subtotal, discountAmount, tax, total } = useMemo(() => {
    const payableCart = cart.filter(item => !item.isGiveaway);
    const rawSubtotal = payableCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const discountFactor = discountPercent / 100;
    const discountAmount = rawSubtotal * discountFactor;
    
    const TAX_RATE = 0.08; 
    
    const rawTaxableSubtotal = payableCart
        .filter(item => item.type === 'inventory')
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
        
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

  // --- Checkout Logic ---

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
        // 1. Process inventory stock reduction
        const inventoryItemsSold = cart.filter(item => item.type === 'inventory');
        
        await Promise.all(inventoryItemsSold.map(async item => {
            if (item.stock !== Infinity) { 
                const currentStock = liveInventoryItems?.find(i => i.id === item.sourceId)?.stock || item.stock || 0;
                if (currentStock >= item.quantity) {
                    await reduceInventoryStock(item.sourceId, item.quantity);
                } else {
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
                const isInitialRegistrationPlan = selectedMember.id === justRegisteredMemberId;
                
                if (!isInitialRegistrationPlan) {
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
        
        const itemDescription = cart.map(item => `${item.name} x${item.quantity}`).join(', ');
        
        const itemsData: TransactionItemData[] = cart.map(item => ({
            sourceId: item.sourceId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            type: item.type,
            isGiveaway: item.isGiveaway,
        }));
        
        const memberId = selectedMember?.member_code || selectedMember?.id || 'GUEST';
        const memberName = selectedMember ? `${selectedMember.first_name} ${selectedMember.last_name}` : t('guest_customer');
        
        if (total > 0 || cart.some(item => item.isGiveaway)) {
            const newTransaction = {
                member_id: memberId,
                member_name: memberName,
                type: transactionType,
                item_description: itemDescription,
                items_data: itemsData, 
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
        handleClearCart();
        
    } catch (error) {
        console.error("Checkout failed:", error);
        showError(t("checkout_failed"));
    }
  };

  return {
    // State
    cart,
    selectedMember,
    paymentMethod,
    discountPercent,
    isProcessingSale,
    
    // Setters
    setPaymentMethod,
    setDiscountPercent,
    setSelectedMember,
    
    // Functions
    updatePrice,
    addCustomItemToCart,
    addInventoryToCart,
    addMembershipToCart,
    updateQuantity,
    removeItem,
    handleClearMember,
    handleClearCart,
    handleRegistrationSuccess,
    handleCheckout,
    
    // Calculations
    subtotal,
    discountAmount,
    tax,
    total,
  };
};