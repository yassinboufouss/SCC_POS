import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, User, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockMembers, Member } from '@/data/members';

interface POSMemberSelectorProps {
  selectedMember: Member | null;
  onSelectMember: (member: Member) => void;
  onClearMember: () => void;
}

const POSMemberSelector: React.FC<POSMemberSelectorProps> = ({ selectedMember, onSelectMember, onClearMember }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return mockMembers;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return mockMembers.filter(member =>
      member.name.toLowerCase().includes(lowerCaseSearch) ||
      member.id.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm]);

  const handleSelect = (member: Member) => {
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
            <span className="font-medium">{selectedMember.name} ({selectedMember.id})</span>
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
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary transition-colors"
                      onClick={() => handleSelect(member)}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.id} | {member.plan}</p>
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