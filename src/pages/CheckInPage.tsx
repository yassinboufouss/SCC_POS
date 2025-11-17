import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, UserCheck, UserX, Search } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { mockMembers, Member } from '@/data/members'; // Import centralized data

const CheckInPage = () => {
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
        setMemberInfo(member);
        if (member.status === 'Active') {
          showSuccess(`${member.name} checked in successfully!`);
        } else {
          showError(`${member.name}: Membership is ${member.status}. Cannot check in.`);
        }
      } else {
        showError(`Member code ${code} not found.`);
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
            <p className="text-muted-foreground">{memberInfo.plan} Plan</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-lg">Status: <span className={`font-bold ${statusClass}`}>{memberInfo.status}</span></p>
          {memberInfo.lastCheckIn && (
            <p className="text-sm text-muted-foreground">Last Check-in: {memberInfo.lastCheckIn}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Member Check-In System</h1>
      
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <QrCode className="h-6 w-6" /> Scan or Enter Member Code
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Enter Member ID (e.g., M001)"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              className="flex-1 text-lg h-12"
              disabled={isCheckingIn}
            />
            <Button type="submit" size="lg" disabled={isCheckingIn}>
              <Search className="h-5 w-5 mr-2" /> Lookup
            </Button>
          </form>
          
          <p className="text-sm text-muted-foreground mt-2">
            *In a real system, this field would capture input from a QR/Barcode scanner.
          </p>
          
          {renderMemberStatus()}
          
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInPage;