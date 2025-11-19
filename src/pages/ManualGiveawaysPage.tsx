import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Gift, Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useInventory } from '@/integrations/supabase/data/use-inventory.ts';
import { usePlans } from '@/integrations/supabase/data/use-plans.ts';
import GiveawayItemCard from '@/components/giveaways/GiveawayItemCard.tsx';
import { useUserRole } from '@/hooks/use-user-role';
import { InventoryItem, MembershipPlan } from '@/types/supabase';

const ManualGiveawaysPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const { isOwner, isManager, isCashier } = useUserRole();
  
  // Fetch all inventory items based on search term
  const { data: inventoryItems, isLoading: isLoadingInventory } = useInventory(searchTerm);
  // Fetch all plans to determine which items are linked
  const { data: membershipPlans, isLoading: isLoadingPlans } = usePlans();
  
  const isLoading = isLoadingInventory || isLoadingPlans;

  // Map inventory items to include their linked plans for display
  const itemsWithLinks = useMemo(() => {
    if (!inventoryItems || !membershipPlans) return [];
    
    // Create a map of item ID to list of plans it's linked to
    const itemToPlansMap = new Map<string, MembershipPlan[]>();
    
    membershipPlans.forEach(plan => {
        if (plan.giveaway_item_id) {
            if (!itemToPlansMap.has(plan.giveaway_item_id)) {
                itemToPlansMap.set(plan.giveaway_item_id, []);
            }
            itemToPlansMap.get(plan.giveaway_item_id)?.push(plan);
        }
    });
    
    // Map all inventory items to include their associated plans
    return inventoryItems.map(item => ({
        item,
        linkedPlans: itemToPlansMap.get(item.id) || [],
    }));

  }, [inventoryItems, membershipPlans]);

  if (!isOwner && !isManager && !isCashier) {
      return (
          <Layout>
              <div className="p-4 lg:p-6 text-center text-red-500">
                  {t("access_denied")}
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gift className="h-7 w-7 text-green-600" /> {t("giveaway_management")}
        </h1>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> {t("giveaway_items_list", { count: itemsWithLinks.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                    placeholder={t("search_items_by_name")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm flex-1"
                />
            </div>
            
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
                </div>
            ) : itemsWithLinks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {itemsWithLinks.map(({ item, linkedPlans }) => (
                        <GiveawayItemCard 
                            key={item.id} 
                            item={item} 
                            linkedPlans={linkedPlans} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    {t("no_giveaway_items")}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ManualGiveawaysPage;