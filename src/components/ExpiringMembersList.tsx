import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, User, Clock, AlertTriangle } from 'lucide-react';
import { getExpiringMembers } from '@/utils/member-utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const ExpiringMembersList = () => {
  // Fetch members expiring within the next 30 days
  const expiringMembers = getExpiringMembers(30);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5 text-orange-500" /> Expiring Memberships
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {expiringMembers.length > 0 ? (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
              {expiringMembers.map((member) => {
                const daysLeft = differenceInDays(new Date(member.expirationDate), new Date());
                const isUrgent = daysLeft <= 7;
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.plan}</p>
                      </div>
                    </div>
                    <Badge variant={isUrgent ? 'destructive' : 'secondary'} className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {daysLeft} days left
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mb-2 text-green-500" />
            <p>No memberships expiring in the next 30 days.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiringMembersList;