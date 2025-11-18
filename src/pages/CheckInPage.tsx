import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, UserCheck, UserX, Search } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { mockMembers, Member } from '@/data/members'; // Import centralized data
import { processCheckIn } from '@/utils/member-utils'; // Import new utility
import { useTranslation } from 'react-i18next';

const CheckInPage = () => {
  const { t } = useTranslation();
  const [memberCode, setMemberCode] = useState('');
  const [memberInfo, setMemberInfo] = useState<Member | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const handleCheckIn = (code: string) => {
    setIsCheckingIn(true);
    setMemberInfo(null);
    
    // Simulate API delay
    setTimeout(() => {
      const member = mockMembers.find(m => m.id === code.toUpperCase());
      
      if (member) {
        if (member.status === 'Active') {
          const checkedInMember = processCheckIn(member.id);
          if (checkedInMember) {
            setMemberInfo(checkedInMember);
            showSuccess(`${checkedInMember.name} ${t("checked_in_successfully", { defaultValue: "checked in successfully!" })} ${t("total_check_ins")}: ${checkedInMember.totalCheckIns}`);
          } else {
            // Should not happen if status is 'Active', but for safety
            setMemberInfo(member);
            showError(t("checkin_failed", { name: member.name }));
          }
        } else {
          setMemberInfo(member);
          showError(`${member.name}: ${t("membership_is", { status: member.status })} ${t("cannot_check_in")}`);
          // Removed renewal dialog trigger
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

    const statusClass = memberInfo.status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const Icon = memberInfo.status === 'Active' ? UserCheck : UserX;

    return (
      <div className="mt-6 p-4 border rounded-lg bg-background shadow-sm">
        <div className="flex items-center space-x-3">
          <Icon className={`h-8 w-8 ${statusClass}`} />
          <div>
            <h3 className="text-xl font-semibold">{memberInfo.name} ({memberInfo.id})</h3>
            <p className="text-muted-foreground">{memberInfo.plan} {t("plan")}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t space-y-2">
          <p className="text-lg">{t("status")}: <span className={`font-bold ${statusClass}`}>{memberInfo.status}</span></p>
          {memberInfo.lastCheckIn && (
            <p className="text-sm text-muted-foreground">{t("last_check_in")}: {memberInfo.lastCheckIn}</p>
          )}
          
          {/* Removed renewal button */}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center">{t("member_check_in_system")}</h1>
      
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <QrCode className="h-6 w-6" /> {t("scan_or_enter_code")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder={t("enter_member_id")}
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              className="flex-1 text-lg h-12"
              disabled={isCheckingIn}
            />
            <Button type="submit" size="lg" disabled={isCheckingIn}>
              <Search className="h-5 w-5 mr-2" /> {t("lookup")}
            </Button>
          </form>
          
          <p className="text-sm text-muted-foreground mt-2">
            {t("checkin_note")}
          </p>
          
          {renderMemberStatus()}
          
        </CardContent>
      </Card>
      
      {/* Removed renewal dialog component */}
    </div>
  );
};

export default CheckInPage;