import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Mail, Phone, Calendar, Edit, Save, Shield } from 'lucide-react';
import { useSession } from '@/components/auth/SessionContextProvider';
import { Skeleton } from '@/components/ui/skeleton';
import MemberBasicInfoForm from '@/components/members/MemberBasicInfoForm';
import MemberLogoutButton from '@/components/members/MemberLogoutButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/use-user-role';
import { Profile } from '@/types/supabase';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { profile, isLoading: isLoadingSession } = useSession();
  const { role } = useUserRole();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoadingSession) {
    return (
      <Layout>
        <div className="p-4 lg:p-6 flex items-center justify-center h-full">
          <Skeleton className="h-40 w-full max-w-xl" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="p-4 lg:p-6 text-center text-red-500">
          {t("error_fetching_dashboard_data")}
        </div>
      </Layout>
    );
  }
  
  const handleSaveSuccess = () => {
      setIsEditing(false);
  };
  
  const getRoleVariant = (userRole: Profile['role']) => {
    switch (userRole) {
      case 'owner':
        return 'destructive';
      case 'manager':
      case 'cashier':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-7 w-7 text-primary" /> {t("settings")}
            </h1>
            <MemberLogoutButton />
        </div>
        
        {/* Profile Card */}
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" /> {t("my_profile")}
                </CardTitle>
                <div className="flex items-center gap-3">
                    <Badge variant={getRoleVariant(role)} className="text-sm flex items-center gap-1">
                        <Shield className="h-3 w-3" /> {t(role || 'member')}
                    </Badge>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                        {isEditing ? t("save_changes") : t("edit_profile")}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <MemberBasicInfoForm 
                        member={profile} 
                        onSuccess={handleSaveSuccess} 
                        canEdit={true} // Staff/Owner can edit their own profile
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {profile.first_name} {profile.last_name}</p>
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {profile.email || 'N/A'}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {profile.phone || 'N/A'}</p>
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {profile.dob || 'N/A'}</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
        {/* Security Settings Placeholder */}
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" /> {t("security_settings")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{t("security_settings_placeholder")}</p>
            </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;