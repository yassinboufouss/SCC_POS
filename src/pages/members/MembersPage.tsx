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
import { useTranslation } from 'react-i18next';

interface MembersListProps {
  onViewMember: (member: Member) => void;
}

const MembersList: React.FC<MembersListProps> = ({ onViewMember }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const columns = createMemberColumns(onViewMember);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("member_management")}</h1>
        <Button onClick={() => navigate('register')}>
          <PlusCircle className="mr-2 h-4 w-4" /> {t("register_new_member")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("member_directory", { count: mockMembers.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={mockMembers} 
            filterColumnId="name"
            filterPlaceholder={t("search_members_by_name")}
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