import React from 'react';
import { Profile } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface MemberDetailsCardProps {
  member: Profile;
  onRenewClick: () => void;
  canRenew: boolean; // New prop
}

const MemberDetailsCard: React.FC<MemberDetailsCardProps> = ({ member, onRenewClick, canRenew }) => {
  const { t } = useTranslation();

  const getStatusVariant = (status: Profile['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Expired':
      case 'Pending': // Treat pending as secondary/warning
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  
  // Check if the membership is actually expired or pending
  const needsRenewal = member.status !== 'Active';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" /> {t("membership_details")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        
        <div className="flex justify-between items-center p-2 border rounded-md bg-secondary/50">
            <span className="text-muted-foreground">{t("current_status")}:</span>
            <Badge variant={getStatusVariant(member.status)} className="text-base py-1 px-3">
                {t(member.status || 'Pending')}
            </Badge>
        </div>
        
        <Separator className="my-2" />

        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="text-muted-foreground">{t("plan")}:</span>
                <span className="font-medium">{member.plan_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">{t("start_date")}:</span>
                <span className="font-medium">{member.start_date || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">{t("expiration")}:</span>
                <span className="font-medium text-red-600">{member.expiration_date || 'N/A'}</span>
            </div>
        </div>
        
        {needsRenewal && (
            <Button 
                variant="outline" 
                className="w-full mt-4 text-green-600 border-green-200 hover:bg-green-50"
                onClick={onRenewClick}
                disabled={!canRenew}
            >
                <RefreshCw className="h-4 w-4 mr-2" /> {t("renew_membership_now")}
            </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberDetailsCard;