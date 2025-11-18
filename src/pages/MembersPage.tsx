import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMembers, Member } from '@/data/members';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, UserPlus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import MemberRegistrationForm from '@/components/members/MemberRegistrationForm';
import MemberProfileDialog from '@/components/members/MemberProfileDialog';

const MembersPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  // State to force re-render of the member list when a member is updated
  const [memberUpdateKey, setMemberUpdateKey] = useState(0); 

  const membersList = useMemo(() => {
    // We use a key to force re-evaluation of mockMembers when an update occurs
    // In a real app, this would be handled by a state management library or query invalidation.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _key = memberUpdateKey; 
    return mockMembers;
  }, [memberUpdateKey]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm) {
      return membersList;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return membersList.filter(member =>
      member.name.toLowerCase().includes(lowerCaseSearch) ||
      member.id.toLowerCase().includes(lowerCaseSearch) ||
      member.email.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, membersList]);

  const getStatusVariant = (status: Member['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Expired':
        return 'destructive';
      case 'Pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleRegistrationSuccess = () => {
    setIsRegistrationOpen(false);
    setMemberUpdateKey(prev => prev + 1);
  };
  
  const handleMemberUpdate = () => {
    setMemberUpdateKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t("member_management")}</h1>
          
          <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                {t("register_new_member")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{t("register_new_member")}</DialogTitle>
              </DialogHeader>
              <MemberRegistrationForm onSuccess={handleRegistrationSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("member_directory", { count: filteredMembers.length })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t("search_members_by_name")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">{t("id")}</TableHead>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("plan")}</TableHead>
                    <TableHead>{t("expires")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.id}</TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.plan}</TableCell>
                        <TableCell>{member.expirationDate}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(member.status)}>
                            {t(member.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <MemberProfileDialog member={member} onUpdate={handleMemberUpdate} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            {t("no_members_found")}
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MembersPage;