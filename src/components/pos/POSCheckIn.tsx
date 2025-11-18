import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, UserCheck, UserX, Search } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { mockMembers, Member } from '@/data/members';
import { processCheckIn } from '@/utils/member-utils';
import { useTranslation } from 'react-i18next';

const POSCheckIn: React.FC = () => {
  const { t } = useTranslation();
  const [memberCode, setMemberCode] = useState('');
  const [memberInfo, setMemberInfo] = useState<Member | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const handleCheckIn = (code: string) => {
    setIsCheckingIn(true);
    setMemberInfo(null);
    
    setTimeout(() => {
      const member = mockMembers.find(m => m.id === code.toUpperCase());
      
      if (member) {
        if (member.status === 'Active') {
          const checkedInMember = processCheckIn(member.id);
          if (checkedInMember) {
            setMemberInfo(checkedInMember);
            showSuccess(`${checkedInMember.name} ${t("checked_in_successfully")} ${t("total_check_ins")}: ${checkedInMember.totalCheckIns}`);
          } else {
            setMemberInfo(member);
            showError(t("checkin_failed", { name: member.name }));
          }
        } else {
          setMemberInfo(member);
          showError(`${member.name}: ${t("membership_is", { status: member.status })} ${t("cannot_check_in")}`);
        }
      } else {
        showError(t("member_code_not_found", { code }));
      }
      setIsCheckingIn(false);
      setMemberCode('');
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberCode.trim()) {
      handleCheckIn(memberCode.trim());
    }
  };

  const renderMemberStatus = () => {
    if (!memberInfo) return null;

    const statusClass = memberInfo.status === 'Active' ? 'text-green-600' : 'text-red-600';
    const Icon = memberInfo.status === 'Active' ? UserCheck : UserX;

    return (
      <div className="mt-4 p-3 border rounded-lg bg-background shadow-sm">
        <div className="flex items-center space-x-3">
          <Icon className={`h-6 w-6 ${statusClass}`} />
          <div>
            <h3 className="text-lg font-semibold">{memberInfo.name} ({memberInfo.id})</h3>
            <p className="text-xs text-muted-foreground">{memberInfo.plan} {t("plan")}</p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t space-y-1 text-sm">
          <p>{t("status")}: <span className={`font-bold ${statusClass}`}>{memberInfo.status}</span></p>
          {memberInfo.lastCheckIn && (
            <p className="text-xs text-muted-foreground">{t("last_check_in")}: {memberInfo.lastCheckIn}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4">
      <CardHeader className="p-0 mb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <QrCode className="h-5 w-5" /> {t("member_check_in_system")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder={t("enter_member_id")}
            value={memberCode}
            onChange={(e) => setMemberCode(e.target.value)}
            className="flex-1 h-10"
            disabled={isCheckingIn}
          />
          <Button type="submit" size="sm" disabled={isCheckingIn}>
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        {renderMemberStatus()}
        
      </CardContent>
    </Card>
  );
};

export default POSCheckIn;