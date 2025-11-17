import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Member } from '@/data/members';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Calendar, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface MemberProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMember: Member | null;
}

const MemberProfileSheet: React.FC<MemberProfileSheetProps> = ({ open, onOpenChange, selectedMember }) => {
  if (!selectedMember) return null;

  const statusVariant = selectedMember.status === 'Active' ? 'default' : 'destructive';
  const expirationDate = new Date(selectedMember.expirationDate);
  const isExpired = selectedMember.status === 'Expired';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" /> {selectedMember.name}
          </SheetTitle>
          <SheetDescription>
            Member ID: {selectedMember.id}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4">
          <div className="space-y-6 p-1">
            
            {/* Status Card */}
            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground">Membership Status</p>
                <Badge variant={statusVariant} className="text-base py-1">
                  {selectedMember.status}
                </Badge>
              </div>
              <Separator />
              <div className="text-sm">
                <p>Plan: <span className="font-semibold">{selectedMember.plan}</span></p>
                <p>Start Date: {format(new Date(selectedMember.startDate), 'MMM dd, yyyy')}</p>
                <p className={isExpired ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'}>
                  Expiration: {format(expirationDate, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{selectedMember.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{selectedMember.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>DOB: {format(new Date(selectedMember.dob), 'MMM dd, yyyy')}</span>
              </div>
            </div>

            <Separator />

            {/* Activity Stats */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Activity & History</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-md bg-background">
                  <p className="text-sm font-medium text-muted-foreground">Total Check-ins</p>
                  <span className="text-xl font-bold">{selectedMember.totalCheckIns}</span>
                </div>
                <div className="p-3 border rounded-md bg-background">
                  <p className="text-sm font-medium text-muted-foreground">Last Check-in</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{selectedMember.lastCheckIn || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Placeholder for Transaction History */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Transaction History</h3>
              <p className="text-sm text-muted-foreground">
                (Placeholder for recent payments and purchases)
              </p>
            </div>

          </div>
        </ScrollArea>
        
        <div className="mt-auto pt-4 border-t space-y-2">
            <Button className="w-full">
                Renew/Upgrade Membership
            </Button>
            <Button variant="outline" className="w-full text-red-500">
                Freeze/Cancel Membership
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MemberProfileSheet;