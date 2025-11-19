import React, { useState, useMemo } from 'react';
import { InventoryItem, MembershipPlan, Profile } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gift, Image, User, Check, Search, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency-utils';
import { useMembers } from '@/integrations/supabase/data/use-members.ts';
import { useIssueManualGiveaway } from '@/integrations/supabase/data/use-inventory.ts';
import { showSuccess, showError } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface GiveawayItemCardProps {
  item: InventoryItem;
  // This is now optional, as we display all inventory items
  linkedPlans?: MembershipPlan[]; 
}

const GiveawayItemCard: React.FC<GiveawayItemCardProps> = ({ item, linkedPlans = [] }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch only active members for giveaway issuance
  const { data: members, isLoading: isLoadingMembers } = useMembers(searchTerm, 'Active');
  const { mutateAsync: issueGiveaway, isPending: isIssuing } = useIssueManualGiveaway();

  const isOutOfStock = item.stock <= 0;

  const handleSelectMember = (member: Profile) => {
    setSelectedMember(member);
    setSearchTerm('');
  };

  const handleIssue = async () => {
    if (!selectedMember || isOutOfStock) return;

    try {
      const memberId = selectedMember.member_code || selectedMember.id;
      const memberName = `${selectedMember.first_name} ${selectedMember.last_name}`;
      
      await issueGiveaway({
        itemId: item.id,
        memberId: memberId,
        memberName: memberName,
        itemName: item.name,
      });

      showSuccess(t("giveaway_issued_success", { item: item.name, member: memberName }));
      setIsDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      showError(t("giveaway_issued_failed"));
    }
  };

  return (
    <Card className="shadow-lg flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> {item.name}
        </CardTitle>
        <Badge variant={isOutOfStock ? 'destructive' : 'default'}>
          {t("stock")}: {item.stock}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
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
        
        <p className="text-sm font-medium">{t("price")}: {formatCurrency(item.price)}</p>
        
        {/* Display linked plans if any */}
        <div className="text-xs text-muted-foreground">
            <p className="font-semibold mb-1">{t("item_is_giveaway_for")}</p>
            {linkedPlans.length > 0 ? (
                <ul className="list-disc list-inside pl-2">
                    {linkedPlans.map(plan => <li key={plan.id}>{plan.name}</li>)}
                </ul>
            ) : (
                <p>{t("no_giveaway")}</p>
            )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
                variant="outline" 
                className="w-full mt-3" 
                disabled={isOutOfStock}
            >
              <Gift className="h-4 w-4 mr-2" /> {t("issue_giveaway")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("issue_giveaway_to_member")}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="font-semibold">{t("item_name")}: {item.name}</p>
              <p className="text-sm text-muted-foreground">{t("stock")}: {item.stock}</p>
              
              {/* Member Search */}
              <Input
                placeholder={t("search_by_name_or_id")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10"
                disabled={isIssuing}
              />
              
              {/* Member List */}
              <div className="max-h-40 overflow-y-auto border rounded-md">
                {isLoadingMembers ? (
                    <div className="p-4 space-y-2">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : members && members.length > 0 ? (
                  members.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary transition-colors"
                      onClick={() => handleSelectMember(member)}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{member.first_name} {member.last_name}</p>
                        <p className="text-xs text-muted-foreground">{member.member_code} | {member.plan_name}</p>
                      </div>
                      {selectedMember?.id === member.id && <Check className="h-4 w-4 text-green-500" />}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    {t("no_members_found")}
                  </div>
                )}
              </div>
              
              {/* Selected Member Confirmation */}
              {selectedMember && (
                <div className="p-3 border rounded-md bg-green-50/50 dark:bg-green-900/50 flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{selectedMember.first_name} {selectedMember.last_name}</span>
                </div>
              )}
            </div>
            
            <Button 
                onClick={handleIssue} 
                disabled={!selectedMember || isOutOfStock || isIssuing}
                className="w-full"
            >
                {isIssuing ? t("processing_sale") : t("issue_item")}
            </Button>
            {isOutOfStock && (
                <p className="text-sm text-red-500 text-center">{t("item_not_in_stock")}</p>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GiveawayItemCard;