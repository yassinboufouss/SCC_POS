import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, DollarSign, Percent } from 'lucide-react';
import { Label } from '@/components/ui/label';
import POSCartItem from './POSCartItem.tsx';
import { CartItem, PaymentMethod } from '@/types/pos.ts';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency-utils';
import { Member } from '@/data/members';

interface POSCartAndCheckoutProps {
  cart: CartItem[];
  selectedMember: Member | null;
  // paymentMethod is now always 'Cash'
  paymentMethod: PaymentMethod; 
  // setPaymentMethod removed
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
}

const POSCartAndCheckout: React.FC<POSCartAndCheckoutProps> = ({
  cart,
  selectedMember,
  paymentMethod, // Still received, but hardcoded to 'Cash'
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" /> {t("shopping_cart", { count: cart.length })}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        
        {/* Member Selection Display */}
        <div className="mb-4 text-sm text-muted-foreground p-2 border rounded-md">
            {t("member_customer")}: 
            <span className="font-medium text-foreground ml-1">
                {selectedMember ? `${selectedMember.name} (${selectedMember.id})` : t("guest_customer")}
            </span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
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

        {/* Totals and Checkout */}
        <div className="mt-auto pt-4 border-t">
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
      
          {/* Payment Method Display (Hardcoded to Cash) */}
          <div className="space-y-2">
              <h4 className="font-semibold text-sm mb-2">{t("payment_method")}</h4>
              <div className="flex items-center justify-center rounded-md border-2 border-primary bg-popover p-3 text-sm">
                  <DollarSign className="mb-1 h-5 w-5 mr-2" />
                  {t("cash")}
              </div>
          </div>
          
          <Button 
            className="w-full mt-4 h-12 text-lg" 
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            {t("process_sale")}
          </Button>
          <Button 
            variant="outline" 
            className="w-full mt-2 text-red-500" 
            onClick={handleClearCart}
            disabled={cart.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" /> {t("clear_cart")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default POSCartAndCheckout;