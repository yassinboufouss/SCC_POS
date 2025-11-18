import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMembers, Member } from '@/data/members';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';

const MembersPage: React.FC = () => {
  const { t } = useTranslation();
  const members: Member[] = mockMembers; // Use mock data

  const getStatusVariant = (status: Member['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Expired':
        return 'destructive';
      case 'Pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t("member_management")}</h1>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            {t("register_new_member")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("member_directory", { count: members.length })}</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {members.map((member) => (
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
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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