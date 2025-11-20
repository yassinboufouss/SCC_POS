import React, { useState } from 'react';
import { Profile } from '@/types/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMembers } from '@/integrations/supabase/data/use-members';
import { Skeleton } from '@/components/ui/skeleton';
import MemberProfileDialog from './MemberProfileDialog';
import { useUserRole } from '@/hooks/use-user-role';

interface MemberTableProps {
    // Initial list is passed, but the component uses its own hook for filtering/fetching
    members: Profile[]; 
}

const MemberTable: React.FC<MemberTableProps> = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Profile['status'] | 'All'>('All');
  const { isOwner, isStaff } = useUserRole();
  
  // Fetch data using the hook based on filters
  const { data: filteredMembers, isLoading } = useMembers(searchTerm, statusFilter);
  
  // Staff (Owner/Manager/Cashier) can edit member profiles
  const canEdit = isOwner || isStaff; 

  const getStatusVariant = (status: Profile['status']) => {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
                placeholder={t("search_members_by_name_code_phone")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-lg flex-1"
            />
        </div>
        
        <Select 
            value={statusFilter} 
            onValueChange={(value: Profile['status'] | 'All') => setStatusFilter(value)}
        >
            <SelectTrigger className="w-[150px] min-w-[150px]">
                <SelectValue placeholder={t("select_status")} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="All">{t("All")}</SelectItem>
                <SelectItem value="Active">{t("Active")}</SelectItem>
                <SelectItem value="Pending">{t("Pending")}</SelectItem>
                <SelectItem value="Expired">{t("Expired")}</SelectItem>
            </SelectContent>
        </Select>
      </div>
      
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t("member_id")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("plan")}</TableHead>
              <TableHead className="w-[120px]">{t("expires")}</TableHead>
              <TableHead className="w-[100px] text-center">{t("status")}</TableHead>
              <TableHead className="w-[50px] text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredMembers && filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium text-xs">{member.member_code || member.id.substring(0, 8)}...</TableCell>
                  <TableCell>{member.first_name} {member.last_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.plan_name || 'N/A'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.expiration_date || 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusVariant(member.status)}>
                      {t(member.status || 'Pending')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <MemberProfileDialog member={member} canEdit={canEdit} />
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
    </div>
  );
};

export { MemberTable };