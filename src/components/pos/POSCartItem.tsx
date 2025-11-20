import React from 'react';
import { CartItem } from '@/types/pos';
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, Ticket, Image, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency-utils';
import { useUserRole } from '@/hooks/use-user-role';
import { Input } from '@/components/ui/input';

interface POSCartItemProps {
  item: CartItem;
  updateQuantity: (sourceId: string, type: 'inventory' | 'membership', delta: number) => void;
  removeItem: (sourceId: string, type: 'inventory' | 'membership') => void;
  updatePrice: (sourceId: string, type: 'inventory' | 'membership', newPrice: number) => void;
}

const POSCartItem: React.FC<POSCartItemProps> = ({ item, updateQuantity, removeItem, updatePrice }) => {
  const { t } = useTranslation();
  const { isOwner, isManager } = useUserRole();
  
  const isGiveaway = item.isGiveaway;
  // Only Owner (which includes co owner) or Manager can override price, and it must not be a giveaway item
  const canOverridePrice = (isOwner || isManager) && !isGiveaway;
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value >= 0) {
          updatePrice(item.sourceId, item.type, value);
      }
  };
  
  // Determine if the price has been manually overridden
  const isPriceOverridden = item.price !== item.originalPrice;

  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-b-0">
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
                {isGiveaway && <Gift className="h-3 w-3 text-green-500" />}
                {item.name}
            </p>
            
            {/* Price and Quantity Display/Input */}
            <div className="flex items-center gap-1">
                {canOverridePrice ? (
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price.toFixed(2)}
                        onChange={handlePriceChange}
                        className="w-20 h-6 text-sm text-right p-1"
                    />
                ) : (
                    <span className="text-sm font-medium">
                        {isGiveaway ? t("free_item") : formatCurrency(item.price)}
                    </span>
                )}
                
                {!isGiveaway && (
                    <span className="text-xs text-muted-foreground">
                        x {item.quantity}
                    </span>
                )}
                
                {/* Show original price if overridden */}
                {isPriceOverridden && canOverridePrice && (
                    <span className="text-xs text-red-400 line-through ml-1">
                        {formatCurrency(item.originalPrice)}
                    </span>
                )}
            </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {/* Only allow quantity modification on non-giveaway items */}
        {!isGiveaway && (item.type === 'inventory' || item.type === 'membership') && (
            <>
                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.sourceId, item.type, -1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.sourceId, item.type, 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
            </>
        )}
        
        {/* Membership plans can be removed, but not inventory giveaways */}
        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-100" onClick={() => removeItem(item.sourceId, item.type)} disabled={isGiveaway}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default POSCartItem;