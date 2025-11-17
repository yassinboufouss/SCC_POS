import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import { Button } from '@/components/ui/button';
import { PlusCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { mockMembers, Member } from '@/data/members';
import MemberProfileSheet from '@/components/MemberProfileSheet';

interface MembersListProps {
  onViewMember: (member: Member) => void;
}

const MembersList: React.FC<MembersListProps> = ({ onViewMember }) => {
  const navigate = useNavigate();
  
  const members = mockMembers;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Member Management</h1>
        <Button onClick={() => navigate('register')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Register New Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Members ({members.filter(m => m.status === 'Active').length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder="Search members by name or email..." />
          </div>
          <Separator className="mb-4" />
          
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.plan} Plan (ID: {member.id})</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${member.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                      {member.status}
                    </span>
                    <p className="text-xs text-muted-foreground">Expires: {member.expirationDate}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onViewMember(member)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


const MembersPage = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col flex-1">
      <Routes>
        <Route index element={<MembersList onViewMember={handleViewMember} />} />
        <Route path="register" element={<RegistrationForm />} />
      </Routes>
      
      <MemberProfileSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedMember={selectedMember}
      />
    </div>
  );
};

export default MembersPage;