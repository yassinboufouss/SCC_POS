import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, User, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Member } from '@/data/members';
import { differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ExpiringMembershipsProps {
  members: Member[];
}

const ExpiringMemberships: React.FC<ExpiringMembershipsProps> = ({ members }) => {
  const { t } = useTranslation();
  const now = new Date();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-500" /> {t("expiring_memberships")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {members.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t("no_expiring_members")}
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const daysLeft = differenceInDays(new Date(member.expirationDate), now);
              const daysText = t(daysLeft === 1 ? "days_left" : "days_left_plural", { count: daysLeft });
              
              return (
                <div key={member.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <User className="h-5 w-5 text-primary/70 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.plan}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                      <Clock className="h-3 w-3 mr-1" /> {daysText}
                    </Badge>
                    <Button variant="link" size="sm" className="h-6 p-0 text-xs text-primary">
                        {t("renew_membership_now")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiringMemberships;