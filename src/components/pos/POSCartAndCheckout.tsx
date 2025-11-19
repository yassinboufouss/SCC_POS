import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, DollarSign, Percent, CreditCard, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import POSCartItem from './POSCartItem.tsx';
import { CartItem, PaymentMethod } from '@/types/pos.ts';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency-utils';
import { Profile } from '@/types/supabase';
import { cn } from '@/lib/utils';

interface POSCartAndCheckoutProps {
  cart: CartItem[];
  selectedMember: Profile | null;
  paymentMethod: PaymentMethod; 
  setPaymentMethod: (method: PaymentMethod) => void;
  discountPercent: number;
  setDiscountPercent: (percent: number) => void;
  updateQuantity: (sourceId: string, type: 'inventory' | 'membership', delta: number) => void;
  removeItem: (sourceId: string, type: 'inventory' | 'membership') => void;
  handleCheckout: () => void;
  handleClearCart: () => void;
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
  isProcessingSale: boolean;
  onClearMember: () => void; 
  className?: string;
}

const POSCartAndCheckout: React.FC<POSCartAndCheckoutProps> = ({
  cart,
  selectedMember,
  paymentMethod, 
  setPaymentMethod,
  discountPercent,
  setDiscountPercent,
  updateQuantity,
  removeItem,
  handleCheckout,
  handleClearCart,
  subtotal,
  discountAmount,
  tax,
  total,
  isProcessingSale,
  onClearMember, 
  className,
}) => {
  const { t } = useTranslation();
  
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

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" /> {t("shopping_cart", { count: cart.length })}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        
        {/* Member Selection Display */}
        <div className="mb-4 text-sm text-muted-foreground p-2 border rounded-md flex items-center justify-between shrink-0">
            <div className="flex items-center">
                {t("member_customer")}: 
                <span className="font-medium text-foreground ml-1">
                    {selectedMember ? `${selectedMember.first_name} ${selectedMember.last_name} (${selectedMember.member_code})` : t("guest_customer")}
                </span>
            </div>
            {selectedMember && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={onClearMember} disabled={isProcessingSale}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>

        {/* Cart Items List - Scrollable area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 min-h-[50px]">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              {t("cart_is_empty")}
            </div>
          ) : (
            cart.map((item, index) => (
              <POSCartItem 
                key={`${item.sourceId}-${index}`} 
                item={item} 
                updateQuantity={updateQuantity} 
                removeItem={removeItem} 
              />
            ))
          )}
        </div>

        {/* Totals and Checkout - Fixed at the bottom */}
        <div className="mt-auto pt-4 border-t shrink-0">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>{t("subtotal")}</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            {/* Discount Input */}
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="discount-input" className="flex items-center gap-1 text-muted-foreground">
                  <Percent className="h-3 w-3" /> {t("discount")}
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
                  disabled={isProcessingSale}
              />
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-500">
                  <span>{t("discount_applied")}</span>
                  <span className="font-medium">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>{t("tax_inventory")}</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>{t("total")}</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          
          <Separator className="my-4" />
      
          {/* Payment Method Selection */}
          <div className="space-y-2">
              <h4 className="font-semibold text-sm mb-2">{t("payment_method")}</h4>
              <Select 
                value={paymentMethod} 
                onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
                disabled={cart.length === 0 || isProcessingSale}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("select_payment_method")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Card">{t("card")}</SelectItem>
                  <SelectItem value="Cash">{t("cash")}</SelectItem>
                  <SelectItem value="Transfer">{t("transfer")}</SelectItem>
                </SelectContent>
              </Select>
          </div>
          
          <Button 
            className="w-full mt-4 h-12 text-lg" 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessingSale}
          >
            {isProcessingSale ? t("processing_sale") : t("process_sale")}
          </Button>
          <Button 
            variant="outline" 
            className="w-full mt-2 text-red-500" 
            onClick={handleClearCart}
            disabled={cart.length === 0 || isProcessingSale}
          >
            <Trash2 className="h-4 w-4 mr-2" /> {t("clear_cart")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default POSCartAndCheckout;