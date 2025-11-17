import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMembers, Member } from '@/data/members';
import MemberProfileSheet from '@/components/MemberProfileSheet';
import { DataTable } from '@/components/DataTable';
import { createMemberColumns } from './member-columns';

interface MembersListProps {
  onViewMember: (member: Member) => void;
}

const MembersList: React.FC<MembersListProps> = ({ onViewMember }) => {
  const navigate = useNavigate();
  
  const columns = createMemberColumns(onViewMember);

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
          <CardTitle>Member Directory ({mockMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={mockMembers} 
            filterColumnId="name"
            filterPlaceholder="Search members by name..."
          />
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