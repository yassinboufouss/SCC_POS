import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Chrome } from 'lucide-react'; // Changed from Mail
import { showError } from '@/utils/toast';

const SocialAuthButtons: React.FC = () => {
  const { t } = useTranslation();

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`, // Redirect to dashboard after successful login
        },
      });

      if (error) {
        console.error(`OAuth sign in failed for Google:`, error);
        showError(t("login_failed_error", { error: error.message }));
      }
    } catch (error) {
      showError(t("login_failed_error", { error: t("unknown_error") }));
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full h-12 text-base font-medium rounded-xl border-[#E5E7EB] dark:border-muted-foreground/50"
        onClick={handleGoogleSignIn}
      >
        <Chrome className="h-5 w-5 mr-3 text-red-500" /> 
        {t("continue_with_google")}
      </Button>
    </div>
  );
};

export default SocialAuthButtons;