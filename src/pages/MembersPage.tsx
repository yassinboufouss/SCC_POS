import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, UserPlus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import MemberRegistrationForm from '@/components/members/MemberRegistrationForm';
import MemberProfileDialog from '@/components/members/MemberProfileDialog';
import { useMembers } from '@/integrations/supabase/data/use-members.ts';
import { Profile, MembershipPlan } from '@/types/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddTransaction } from '@/integrations/supabase/data/use-transactions.ts';
import { PaymentMethod } from '@/types/pos';
import { showError } from '@/utils/toast'; // <-- Added missing import
import { useUserRole } from '@/hooks/use-user-role'; // Import useUserRole

const statusOptions: (Profile['status'] | 'All')[] = ['All', 'Active', 'Pending', 'Expired'];

const MembersPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Profile['status'] | 'All'>('All');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  
  const { data: members, isLoading } = useMembers(searchTerm, statusFilter);
  const { mutateAsync: recordTransaction } = useAddTransaction();
  const { isOwner, isStaff } = useUserRole(); // Use role hook

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

  const handleRegistrationSuccess = async ({ member, plan, paymentMethod }: { member: Profile, plan: Pick<MembershipPlan, 'id' | 'name' | 'duration_days' | 'price'>, paymentMethod: PaymentMethod }) => {
    try {
        // Record Transaction for the membership fee immediately (since this is standalone registration)
        await recordTransaction({
            member_id: member.member_code || member.id,
            member_name: `${member.first_name} ${member.last_name}`,
            type: 'Membership',
            item_description: `${plan.name} (${plan.duration_days} days)`,
            amount: plan.price,
            payment_method: paymentMethod,
        });
        
        setIsRegistrationOpen(false);
    } catch (error) {
        showError(t("registration_failed"));
    }
  };
  
  // Staff (and Owner) should be able to register members
  const canRegister = isOwner || isStaff; 
  // Only Owner can edit core profile details (as requested by user)
  const canEdit = isOwner; 
  
  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t("member_management")}</h1>
          
          <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canRegister}>
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

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t("member_directory", { count: members?.length || 0 })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-4">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                    placeholder={t("search_members_by_name")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm flex-1 min-w-[150px]"
                />
                
                <Select value={statusFilter} onValueChange={(value: Profile['status'] | 'All') => setStatusFilter(value)}>
                    <SelectTrigger className="w-[180px] shrink-0">
                        <SelectValue placeholder={t("select_status")} />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map(status => (
                            <SelectItem key={status} value={status}>
                                {t(status)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                  ) : members && members.length > 0 ? (
                    members.map((member) => (
                      <TableRow key={member.id} className="hover:bg-secondary/50 transition-colors">
                        <TableCell className="font-medium text-xs">{member.member_code || member.id.substring(0, 8)}...</TableCell>
                        <TableCell>{member.first_name} {member.last_name}</TableCell>
                        <TableCell>{member.plan_name}</TableCell>
                        <TableCell>{member.expiration_date}</TableCell>
                        <TableCell>
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MembersPage;