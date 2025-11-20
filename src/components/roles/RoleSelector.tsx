import React from 'react';
import { Profile } from '@/types/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useUpdateMemberRole } from '@/integrations/supabase/data/use-members';
import { showSuccess, showError } from '@/utils/toast';
import { useUserRole } from '@/hooks/use-user-role'; // Import useUserRole

interface RoleSelectorProps {
  profile: Profile;
  currentUserId: string;
}

const availableRoles: Profile['role'][] = ['owner', 'co owner', 'manager', 'cashier', 'member'];

const RoleSelector: React.FC<RoleSelectorProps> = ({ profile, currentUserId }) => {
  const { t } = useTranslation();
  const { mutateAsync: updateRole, isPending } = useUpdateMemberRole();
  const { isOwner: isCurrentUserOwner } = useUserRole(); // Check if current user is owner/co owner
  
  const isSelf = profile.id === currentUserId;
  
  // Prevent self-modification.
  // Only allow 'owner' or 'co owner' to change roles.
  const isDisabled = isSelf || isPending || !isCurrentUserOwner; 

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
          // Only allow 'owner' role to be selected if the current user is an owner/co-owner
          <SelectItem key={role} value={role} disabled={role === 'owner' && !isCurrentUserOwner}>
            {t(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RoleSelector;