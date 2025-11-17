import React from 'react';
import { CartItem } from '@/types/pos';
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, Ticket, Image } from 'lucide-react';

interface POSCartItemProps {
  item: CartItem;
  updateQuantity: (sourceId: string, type: 'inventory' | 'membership', delta: number) => void;
  removeItem: (sourceId: string, type: 'inventory' | 'membership') => void;
}

const POSCartItem: React.FC<POSCartItemProps> = ({ item, updateQuantity, removeItem }) => {
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
                {item.name}
            </p>
            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.sourceId, item.type, -1)}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.sourceId, item.type, 1)}>
          <Plus className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-100" onClick={() => removeItem(item.sourceId, item.type)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default POSCartItem;