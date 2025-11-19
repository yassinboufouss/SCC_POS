import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

const MemberLogoutButton: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      showError(t('logout_failed'));
    } else {
      // Redirection handled by SessionContextProvider/ProtectedRoute, but navigate just in case
      navigate('/');
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout}
      className="text-red-500 border-red-200 hover:bg-red-50"
    >
      <LogOut className="h-4 w-4 mr-2" />
      {t("logout")}
    </Button>
  );
};

export default MemberLogoutButton;