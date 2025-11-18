import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Ticket, Image } from 'lucide-react';
import { inventoryItems, InventoryItem } from '@/data/inventory';
import { membershipPlans, MembershipPlan } from '@/data/membership-plans';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface POSProductSelectionProps {
  inventorySearchTerm: string;
  setInventorySearchTerm: (term: string) => void;
  addInventoryToCart: (item: InventoryItem) => void;
  addMembershipToCart: (plan: MembershipPlan) => void;
}

const POSProductSelection: React.FC<POSProductSelectionProps> = ({
  inventorySearchTerm,
  setInventorySearchTerm,
  addInventoryToCart,
  addMembershipToCart,
}) => {
  const { t } = useTranslation();
  
  const filteredInventoryItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(inventorySearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      
      {/* Membership Plans Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" /> {t("membership_plans_title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {membershipPlans.map((plan) => (
              <div 
                key={plan.id} 
                className="border rounded-lg p-3 cursor-pointer bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex flex-col justify-between"
                onClick={() => addMembershipToCart(plan)}
              >
                <div>
                  <p className="font-medium truncate">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.durationDays} {t("days")}</p>
                </div>
                <div className="mt-2">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">${plan.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Inventory Products Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("available_products")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder={t("search_inventory_products")}
            value={inventorySearchTerm}
            onChange={(e) => setInventorySearchTerm(e.target.value)}
            className="mb-4"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[40vh] overflow-y-auto pr-2">
            {filteredInventoryItems.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                    "border rounded-lg p-3 cursor-pointer hover:bg-primary/10 transition-colors flex flex-col justify-between",
                    item.stock === 0 && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => item.stock > 0 && addInventoryToCart(item)}
              >
                {/* Product Image */}
                <div className="h-24 w-full mb-2 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {item.imageUrl ? (
                        <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <Image className="h-6 w-6 text-muted-foreground" />
                    )}
                </div>
                
                <div>
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">${item.price.toFixed(2)}</span>
                  <span className={`text-xs font-semibold ${item.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                    {t("stock")} {item.stock}
                  </span>
                </div>
              </div>
            ))}
            {filteredInventoryItems.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-8">{t("no_products_found", { term: inventorySearchTerm })}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default POSProductSelection;