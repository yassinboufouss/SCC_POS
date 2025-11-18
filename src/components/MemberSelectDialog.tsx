import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Check } from 'lucide-react';
import { mockMembers, Member } from '@/data/members';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface MemberSelectDialogProps {
  onSelectMember: (member: Member | null) => void;
  selectedMember: Member | null;
  trigger?: React.ReactNode; // New optional trigger prop
}

const MemberSelectDialog: React.FC<MemberSelectDialogProps> = ({ onSelectMember, selectedMember, trigger }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return mockMembers.slice(0, 10); // Show top 10 if no search term
    
    return mockMembers.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20); // Limit results
  }, [searchTerm]);

  const handleSelect = (member: Member) => {
    onSelectMember(member);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
            <Button variant="outline" className="w-full justify-start text-left">
              <User className="mr-2 h-4 w-4" /> 
              {selectedMember ? `Member: ${selectedMember.name}` : 'Select Member (Optional)'}
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Search & Select Member</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          
          <ScrollArea className="h-64 border rounded-md">
            <div className="p-2">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent rounded-md transition-colors"
                    onClick={() => handleSelect(member)}
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {member.id} | Plan: {member.plan}</p>
                    </div>
                    <Badge variant={member.status === 'Active' ? 'default' : 'destructive'}>
                      {member.status}
                    </Badge>
                    {selectedMember?.id === member.id && <Check className="h-4 w-4 text-green-500 ml-2" />}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No members found.</p>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="p-6 pt-0 border-t">
            <Button variant="secondary" onClick={() => onSelectMember(null)} className="w-full">
                Clear Selected Member
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberSelectDialog;