import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dumbbell, LogIn } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';

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
    <div 
      className={cn(
        "flex items-center justify-center min-h-screen p-4",
        "bg-cover bg-center relative"
      )}
      style={{ backgroundImage: "url('/gym-background.jpg')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <Card className="w-full max-w-md z-10 shadow-2xl border-primary/20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-4xl font-extrabold flex items-center justify-center gap-3 text-primary animate-fade-in-up">
            <Dumbbell className="h-8 w-8" /> {t("app_title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">{t("login_description")}</p>
        </CardHeader>
        <CardContent className="px-6 pb-4">
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
            theme="light" // ThemeSupa handles dark mode via CSS variables
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
        <CardFooter className="flex flex-col gap-2 pt-4 px-6 pb-6">
            <ThemeToggle />
            <LanguageSwitcher />
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;