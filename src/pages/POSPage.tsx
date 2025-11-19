import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import POSProductSelection from '@/components/pos/POSProductSelection';
import POSCartAndCheckout from '@/components/pos/POSCartAndCheckout';
import POSMemberSelector from '@/components/pos/POSMemberSelector';
import POSTransactionSummary from '@/components/pos/POSTransactionSummary';
import MemberRegistrationForm from '@/components/members/MemberRegistrationForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, UserPlus } from 'lucide-react';
import { usePOSCart } from '@/hooks/use-pos-cart'; // Import the new hook

const POSPage = () => {
  const { t } = useTranslation();
  
  // UI State (kept local)
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'register'>('products');
  
  // Core POS Logic Hook
  const {
    cart,
    selectedMember,
    paymentMethod,
    setPaymentMethod,
    discountPercent,
    setDiscountPercent,
    isProcessingSale,
    setSelectedMember,
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
    subtotal,
    discountAmount,
    tax,
    total,
  } = usePOSCart();

  // Handler for successful registration via POS tab
  const handleRegistrationSuccessAndTabSwitch = (result: Parameters<typeof handleRegistrationSuccess>[0]) => {
    // 1. Process registration and cart update via hook
    handleRegistrationSuccess(result);
    
    // 2. Switch back to the products tab
    setActiveTab('products');
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 flex flex-col h-full"> 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          
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
                    <MemberRegistrationForm onSuccess={handleRegistrationSuccessAndTabSwitch} />
                </TabsContent>
            </Tabs>
          </div>

          {/* Right Column (1/3 width) - Cart & Checkout */}
          <div className="lg:col-span-1 flex flex-col space-y-4 min-h-0"> 
              <POSTransactionSummary />
              
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
                  onClearMember={handleClearMember}
                  updatePrice={updatePrice}
                  className="flex-1"
              />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default POSPage;