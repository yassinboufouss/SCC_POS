import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currency-utils';
import { Transaction, TransactionItemData } from '@/types/supabase';
import { cn } from '@/lib/utils';
import { Dumbbell, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface TransactionReceiptProps {
  transaction: Transaction;
  className?: string;
}

// Constants
const TAX_RATE = 0.08;

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({ transaction, className }) => {
  const { t } = useTranslation();
  
  const { 
    subtotal, 
    discountAmount, 
    tax, 
    finalTotal, 
    payableItems 
  } = useMemo(() => {
    const items = transaction.items_data || [];
    
    // 1. Calculate raw subtotal and identify inventory items
    const payableItems = items.filter(item => !item.isGiveaway);
    const rawSubtotal = payableItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
    
    // 2. Determine discount (This is complex as we don't store discount percent in TX, 
    // but we can infer the discount amount if the final amount is less than the raw subtotal)
    // NOTE: We rely on the fact that the final transaction amount (transaction.amount) is the total paid.
    
    // We need to calculate the discount amount based on the difference between the sum of item.price * quantity 
    // and the final transaction amount, accounting for tax.
    
    // For simplicity and auditability, we will assume the discount was applied proportionally 
    // to the difference between the sum of original prices and the sum of paid prices.
    
    const sumOfPaidPrices = payableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // If the transaction was recorded via POS, the discount is already factored into the final amount.
    // We will calculate the discount amount by comparing the sum of original prices vs sum of paid prices.
    
    const totalOriginalPrice = payableItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
    const totalPaidPrice = payableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Discount applied via manual price override (if any)
    const manualDiscount = totalOriginalPrice - totalPaidPrice;
    
    // Calculate taxable base (inventory items at paid price)
    const taxableBase = payableItems
        .filter(item => item.type === 'inventory')
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
        
    const calculatedTax = taxableBase * TAX_RATE;
    
    // The final total should match transaction.amount (within tolerance)
    const calculatedTotal = totalPaidPrice + calculatedTax;
    
    // Use the recorded transaction amount as the source of truth for the final total
    const finalTotal = transaction.amount;
    
    // Calculate the total discount applied (manual price overrides + percentage discount if any)
    // Since we don't store the percentage discount, we use the difference between the raw subtotal (original prices) 
    // and the final total, minus the calculated tax.
    const totalDiscount = totalOriginalPrice - (finalTotal - calculatedTax);
    
    return {
      subtotal: totalOriginalPrice,
      discountAmount: Math.max(0, totalDiscount), // Ensure discount is not negative
      tax: calculatedTax,
      finalTotal: finalTotal,
      payableItems,
    };
  }, [transaction]);

  const formattedDate = transaction.created_at 
    ? format(new Date(transaction.created_at), 'yyyy-MM-dd hh:mm a') 
    : (transaction.transaction_date || 'N/A');

  return (
    <div className={cn("w-full p-6 bg-card text-foreground border border-border rounded-lg shadow-xl", className)}>
      
      {/* Header */}
      <div className="text-center border-b border-border pb-4 mb-4">
        <div className="flex items-center justify-center mb-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-extrabold text-foreground ml-2">{t("app_title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{t("transaction_details")}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("transaction_id")}: {transaction.id.substring(0, 8)}...</p>
      </div>

      {/* Customer Info */}
      <div className="space-y-1 mb-4 text-sm">
        <p><span className="font-semibold">{t("member_customer")}:</span> {transaction.member_name}</p>
        <p><span className="font-semibold">{t("sale_type")}:</span> {t(transaction.type.replace(/\s/g, '_').toLowerCase())}</p>
        <p><span className="font-semibold">{t("payment")}:</span> {t(transaction.payment_method.toLowerCase())}</p>
        <p><span className="font-semibold">{t("date")}:</span> {formattedDate}</p>
      </div>

      {/* Itemized List */}
      <div className="space-y-2 mb-4 border-t border-b border-border py-4">
        <h2 className="text-lg font-bold mb-2">{t("items_purchased")}</h2>
        
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left font-semibold text-muted-foreground">
              <th className="py-1 w-1/2">{t("item_name")}</th>
              <th className="py-1 text-center w-1/6">{t("quantity")}</th>
              <th className="py-1 text-right w-1/3">{t("price")}</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items_data?.map((item, index) => (
              <tr key={index} className="border-b border-border/50 last:border-b-0">
                <td className="py-1">
                  <p className={cn("font-medium truncate", item.isGiveaway && "text-green-600")}>
                    {item.name}
                  </p>
                  {item.isGiveaway && (
                      <p className="text-xs text-green-500">{t("free_giveaway")}</p>
                  )}
                  {item.price < item.originalPrice && !item.isGiveaway && (
                      <p className="text-xs text-red-500">{t("discount_applied")} (Override)</p>
                  )}
                </td>
                <td className="py-1 text-center text-muted-foreground">
                  {item.quantity}
                </td>
                <td className="py-1 font-bold text-right">
                  {item.isGiveaway ? t("free_item") : formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("raw_subtotal")} (Original Price)</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span className="text-muted-foreground">{t("discount_applied")}</span>
              <span className="font-medium">-{formatCurrency(discountAmount)}</span>
            </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("tax_inventory")} ({TAX_RATE * 100}%)</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>
        
        <Separator className="my-2" />
        
        <div className="flex justify-between text-xl font-bold">
          <span>{t("total_amount")}</span>
          <span className="text-green-600">{formatCurrency(finalTotal)}</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center pt-4 mt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">{t("thank_you_for_using_pos")}</p>
      </div>
    </div>
  );
};

export default TransactionReceipt;