import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, User, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Profile } from '@/types/supabase';
import { differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import MemberProfileDialog from '@/components/members/MemberProfileDialog';
import { useUserRole } from '@/hooks/use-user-role';

interface ExpiringMembershipsProps {
  members: Profile[];
  isLoading: boolean;
}

const ExpiringMemberships: React.FC<ExpiringMembershipsProps> = ({ members, isLoading }) => {
  const { t } = useTranslation();
  const now = new Date();
  const { isOwner, isStaff } = useUserRole();
  
  // Staff can edit/renew members
  const canEdit = isOwner || isStaff; 

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-500" /> {t("expiring_memberships")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {isLoading ? (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        ) : members.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t("no_expiring_members")}
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const expirationDate = member.expiration_date ? new Date(member.expiration_date) : now;
              const daysLeft = differenceInDays(expirationDate, now);
              const daysText = t(daysLeft === 1 ? "days_left" : "days_left_plural", { count: daysLeft });
              
              return (
                <Dialog key={member.id}>
                    <DialogTrigger asChild>
                        <div className="flex items-center justify-between p-3 border rounded-md hover:bg-secondary transition-colors cursor-pointer">
                            <div className="flex items-center gap-3 min-w-0">
                                <User className="h-5 w-5 text-primary/70 shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{member.first_name} {member.last_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{member.plan_name}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0 space-y-1">
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                    <Clock className="h-3 w-3 mr-1" /> {daysText}
                                </Badge>
                                <Button variant="link" size="sm" className="h-6 p-0 text-xs text-primary">
                                    {t("view_details")}
                                </Button>
                            </div>
                        </div>
                    </DialogTrigger>
                    <MemberProfileDialog member={member} canEdit={canEdit} />
                </Dialog>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiringMemberships;