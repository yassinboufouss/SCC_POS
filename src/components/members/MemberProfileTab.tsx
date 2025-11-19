import React, { useState } from 'react';
import { Profile } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Calendar, Edit, X, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MemberBasicInfoForm from './MemberBasicInfoForm';
import MemberDetailsCard from './MemberDetailsCard';
import MemberCheckInButton from './MemberCheckInButton';
import MemberStatusActions from './MemberStatusActions';
import { useUserRole } from '@/hooks/use-user-role';

interface MemberProfileTabProps {
  member: Profile;
  canEdit: boolean;
  canRenew: boolean;
  canCheckIn: boolean;
  canChangeStatus: boolean;
  onRenewClick: () => void;
}

const MemberProfileTab: React.FC<MemberProfileTabProps> = ({
  member,
  canEdit,
  canRenew,
  canCheckIn,
  canChangeStatus,
  onRenewClick,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveBasicDetailsSuccess = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">{t("contact_information")}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} disabled={!canEdit}>
            {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? t("close") : t("edit_item_details")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {isEditing ? (
            <MemberBasicInfoForm member={member} onSuccess={handleSaveBasicDetailsSuccess} canEdit={canEdit} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {member.first_name} {member.last_name}</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {member.email || 'N/A'}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {member.phone || 'N/A'}</p>
              <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {member.dob || 'N/A'}</p>
              <p className="flex items-center gap-2"><QrCode className="h-4 w-4 text-muted-foreground" /> {t("member_code")}: <span className="font-medium">{member.member_code || 'N/A'}</span></p>
            </div>
          )}
        </CardContent>
      </Card>

      <MemberDetailsCard
        member={member}
        onRenewClick={onRenewClick}
        canRenew={canRenew}
      />

      {canCheckIn && <MemberCheckInButton member={member} />}

      {canChangeStatus && <MemberStatusActions member={member} />}
    </div>
  );
};

export default MemberProfileTab;