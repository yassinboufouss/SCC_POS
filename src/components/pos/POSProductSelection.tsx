import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Ticket, Image } from 'lucide-react';
import { InventoryItem, MembershipPlan } from '@/types/supabase';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency-utils';
import { useInventory } from '@/integrations/supabase/data/use-inventory.ts';
import { usePlans } from '@/integrations/supabase/data/use-plans.ts';
import { Skeleton } from '@/components/ui/skeleton';

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
  
  const { data: inventoryItems, isLoading: isLoadingInventory } = useInventory(inventorySearchTerm);
  const { data: membershipPlans, isLoading: isLoadingPlans } = usePlans();

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
          {isLoadingPlans ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {membershipPlans?.map((plan) => (
                <div 
                  key={plan.id} 
                  className="border rounded-lg p-3 cursor-pointer bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex flex-col justify-between"
                  onClick={() => addMembershipToCart(plan)}
                >
                  <div>
                    <p className="font-medium truncate">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.duration_days} {t("days")}</p>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(plan.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          
          {isLoadingInventory ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[40vh] overflow-y-auto pr-2">
              {inventoryItems?.map((item) => (
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
                      {item.image_url ? (
                          <img 
                              src={item.image_url} 
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
                    <span className="text-lg font-bold text-primary">{formatCurrency(item.price)}</span>
                    <span className={`text-xs font-semibold ${item.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                      {t("stock")} {item.stock}
                    </span>
                  </div>
                </div>
              ))}
              {inventoryItems?.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">{t("no_products_found", { term: inventorySearchTerm })}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default POSProductSelection;