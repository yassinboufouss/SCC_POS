import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Shield, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMembers } from '@/integrations/supabase/data/use-members.ts';
import { useSession } from '@/components/auth/SessionContextProvider';
import { Profile } from '@/types/supabase';
import RoleSelector from '@/components/roles/RoleSelector';
import { useUserRole } from '@/hooks/use-user-role';
import { Badge } from '@/components/ui/badge';

const RoleManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const { profile: currentUserProfile, isLoading: isLoadingSession } = useSession();
  const { isOwner } = useUserRole();
  
  // Fetch all profiles (no status filter needed here)
  const { data: allProfiles, isLoading: isLoadingProfiles } = useMembers(searchTerm, 'All');

  // Filter out the current owner from the list
  const profiles = allProfiles?.filter(p => p.id !== currentUserProfile?.id) || [];
  
  const isLoading = isLoadingSession || isLoadingProfiles;

  if (!isOwner) {
      // Should be handled by ProtectedRoute, but good practice to double check
      return (
          <Layout>
              <div className="p-4 lg:p-6 text-center text-red-500">
                  {t("access_denied")}
              </div>
          </Layout>
      );
  }

  const getRoleVariant = (role: Profile['role']) => {
    switch (role) {
      case 'owner':
        return 'destructive';
      case 'manager':
      case 'cashier':
        return 'default';
      case 'member':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" /> {t("role_management")}
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("user_roles_directory", { count: profiles.length })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t("search_users_by_name_email")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead className="w-[150px]">{t("current_role")}</TableHead>
                    <TableHead className="w-[150px] text-right">{t("assign_new_role")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                  ) : profiles.length > 0 ? (
                    profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.first_name} {profile.last_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{profile.email}</TableCell>
                        <TableCell>
                            <Badge variant={getRoleVariant(profile.role)}>
                                {t(profile.role || 'member')}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <RoleSelector profile={profile} currentUserId={currentUserProfile?.id || ''} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            {t("no_users_found")}
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

export default RoleManagementPage;