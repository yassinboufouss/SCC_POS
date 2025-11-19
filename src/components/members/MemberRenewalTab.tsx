import React from 'react';
import { Profile } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MemberRenewalForm from './MemberRenewalForm';

interface MemberRenewalTabProps {
  member: Profile;
  canRenew: boolean;
}

const MemberRenewalTab: React.FC<MemberRenewalTabProps> = ({ member, canRenew }) => {
  const { t } = useTranslation();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-5 w-5" /> {t("renew_membership_for", { name: `${member.first_name} ${member.last_name}` })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MemberRenewalForm member={member} canRenew={canRenew} />
      </CardContent>
    </Card>
  );
};

export default MemberRenewalTab;