import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, User, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMembers } from '@/integrations/supabase/data/use-members.ts';
import { Profile } from '@/types/supabase';
import { Skeleton } from '@/components/ui/skeleton';

interface POSMemberSelectorProps {
  selectedMember: Profile | null;
  onSelectMember: (member: Profile) => void;
  onClearMember: () => void;
}

const POSMemberSelector: React.FC<POSMemberSelectorProps> = ({ selectedMember, onSelectMember, onClearMember }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch members based on search term
  const { data: members, isLoading } = useMembers(searchTerm);

  const handleSelect = (member: Profile) => {
    onSelectMember(member);
    setIsDialogOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onClearMember();
  };

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">{t("member_customer")}</h4>
      
      {selectedMember ? (
        <div className="flex items-center justify-between p-3 border rounded-md bg-secondary/50">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="font-medium">{selectedMember.first_name} {selectedMember.last_name} ({selectedMember.member_code || selectedMember.id.substring(0, 8)}...)</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-muted-foreground">
              <Search className="h-4 w-4 mr-2" />
              {t("search_select_member")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("search_select_member")}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Input
                placeholder={t("search_by_name_or_id")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10"
              />
              
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {isLoading ? (
                    <div className="p-4 space-y-2">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : members && members.length > 0 ? (
                  members.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary transition-colors"
                      onClick={() => handleSelect(member)}
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
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default POSMemberSelector;