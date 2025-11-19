import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle'; // Import ThemeToggle

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  // Redirect authenticated users to the dashboard
  useEffect(() => {
    if (!isLoading && session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, isLoading, navigate]);

  if (isLoading || session) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>{t("loading")}...</p>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" /> {t("app_title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="light"
            view="sign_in"
            localization={{
                variables: {
                    sign_in: {
                        email_label: t('email'),
                        password_label: t('password'),
                        email_input_placeholder: 'your@email.com',
                        password_input_placeholder: t('password'),
                        button_label: t('log_in'),
                        loading_button_label: t('logging_in'),
                        link_text: t('already_have_an_account_sign_in'),
                    },
                    sign_up: {
                        email_label: t('email'),
                        password_label: t('password'),
                        email_input_placeholder: 'your@email.com',
                        password_input_placeholder: t('password'),
                        button_label: t('sign_up'),
                        loading_button_label: t('signing_up'),
                        link_text: t('dont_have_an_account_sign_up'),
                    },
                    forgotten_password: {
                        link_text: t('forgot_your_password'),
                    },
                }
            }}
          />
        </CardContent>
        <CardFooter className="justify-center pt-4">
            <ThemeToggle />
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;