import React from 'react';
import { Profile } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, QrCode, Mail, User, Fingerprint } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RoleSelector from '@/components/roles/RoleSelector';
import { useSession } from '@/components/auth/SessionContextProvider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface MemberAdminTabProps {
  member: Profile;
  canChangeRole: boolean;
}

const MemberAdminTab: React.FC<MemberAdminTabProps> = ({ member, canChangeRole }) => {
  const { t } = useTranslation();
  const { profile: currentUserProfile } = useSession();
  
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
    <div className="space-y-4">
      
      {/* Core Admin Identifiers */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Fingerprint className="h-5 w-5" /> {t("account_information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="flex items-center gap-2"><QrCode className="h-4 w-4 text-muted-foreground" /> {t("member_code")}: <span className="font-medium">{member.member_code || 'N/A'}</span></p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {t("email")}: <span className="font-medium">{member.email || 'N/A'}</span></p>
            </div>
            <p className="text-xs text-muted-foreground break-all pt-2">
                <span className="font-semibold">{t("user_id")}:</span> {member.id}
            </p>
        </CardContent>
      </Card>
      
      {/* Role Management */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> {t("role_management")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 border rounded-md bg-secondary/50">
            <span className="text-muted-foreground">{t("current_role")}:</span>
            <Badge variant={getRoleVariant(member.role)} className="text-base py-1 px-3">
                {t(member.role || 'member')}
            </Badge>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">{t("assign_new_role")}:</span>
            <RoleSelector 
                profile={member} 
                currentUserId={currentUserProfile?.id || ''} 
            />
          </div>
          
          {!canChangeRole && (
              <p className="text-xs text-red-500 mt-2">{t("role_change_permission_denied")}</p>
          )}
        </CardContent>
      </Card>
      
      {/* Placeholder for future admin actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("admin_actions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t("future_admin_actions_placeholder")}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberAdminTab;