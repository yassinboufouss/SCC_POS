import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Gift, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useInventory } from '@/integrations/supabase/data/use-inventory.ts';
import { usePlans } from '@/integrations/supabase/data/use-plans.ts';
import GiveawayItemCard from '@/components/giveaways/GiveawayItemCard.tsx';
import { useUserRole } from '@/hooks/use-user-role';

const GiveawaysPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const { isOwner, isManager, isCashier } = useUserRole();
  
  const { data: inventoryItems, isLoading: isLoadingInventory } = useInventory();
  const { data: membershipPlans, isLoading: isLoadingPlans } = usePlans();
  
  const isLoading = isLoadingInventory || isLoadingPlans;

  // 1. Determine which inventory items are designated as giveaways
  const giveawayItems = useMemo(() => {
    if (!inventoryItems || !membershipPlans) return [];
    
    // Create a map of item ID to list of plans it's linked to
    const itemToPlansMap = new Map<string, typeof membershipPlans>();
    
    membershipPlans.forEach(plan => {
        if (plan.giveaway_item_id) {
            if (!itemToPlansMap.has(plan.giveaway_item_id)) {
                itemToPlansMap.set(plan.giveaway_item_id, []);
            }
            itemToPlansMap.get(plan.giveaway_item_id)?.push(plan);
        }
    });
    
    // Filter inventory items that are linked to any plan
    const linkedItems = inventoryItems.filter(item => itemToPlansMap.has(item.id));
    
    // Map linked items to include their associated plans and filter by search term
    return linkedItems.map(item => ({
        item,
        linkedPlans: itemToPlansMap.get(item.id) || [],
    })).filter(({ item }) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  }, [inventoryItems, membershipPlans, searchTerm]);

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
                <Gift className="h-5 w-5" /> {t("giveaway_items_list", { count: giveawayItems.length })}
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
            ) : giveawayItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {giveawayItems.map(({ item, linkedPlans }) => (
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

export default GiveawaysPage;