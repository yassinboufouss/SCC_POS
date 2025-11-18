import React from 'react';
import { Profile } from '@/types/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useUpdateMemberRole } from '@/integrations/supabase/data/use-members';
import { showSuccess, showError } from '@/utils/toast';

interface RoleSelectorProps {
  profile: Profile;
  currentUserId: string;
}

const availableRoles: Profile['role'][] = ['manager', 'cashier', 'member'];

const RoleSelector: React.FC<RoleSelectorProps> = ({ profile, currentUserId }) => {
  const { t } = useTranslation();
  const { mutateAsync: updateRole, isPending } = useUpdateMemberRole();
  
  const isSelf = profile.id === currentUserId;
  const isDisabled = isSelf || isPending || profile.role === 'owner';

  const handleRoleChange = async (newRole: string) => {
    if (!availableRoles.includes(newRole as Profile['role'])) return;

    try {
      await updateRole({ profileId: profile.id, newRole: newRole as Profile['role'] });
      showSuccess(t("role_update_success", { name: `${profile.first_name} ${profile.last_name}`, role: t(newRole) }));
    } catch (error) {
      showError(t("role_update_failed"));
    }
  };

  return (
    <Select 
      value={profile.role || 'member'} 
      onValueChange={handleRoleChange} 
      disabled={isDisabled}
    >
      <SelectTrigger className="w-[120px] h-8 text-xs">
        <SelectValue placeholder={t("select_role")} />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {t(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RoleSelector;