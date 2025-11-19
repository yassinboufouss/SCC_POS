import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dumbbell, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { showError } from '@/utils/toast';

// --- Zod Schemas ---
const baseSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t("invalid_email_address")),
  password: z.string().min(6, t("password_min_length")),
});

type SignInFormValues = z.infer<ReturnType<typeof baseSchema>>;

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { session, isLoading } = useSession();
  const navigate = useNavigate();
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect authenticated users
  useEffect(() => {
    if (!isLoading && session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, isLoading, navigate]);

  // --- Form Setup ---
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(baseSchema(t)),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const isPending = form.formState.isSubmitting;

  // --- Authentication Handlers ---
  const handleAuth = async (values: SignInFormValues) => {
    try {
      let authResponse;
      
      if (view === 'sign_in') {
        authResponse = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
      } else {
        // Sign up logic (using minimal fields)
        authResponse = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });
      }

      if (authResponse.error) {
        showError(t("login_failed_error", { error: authResponse.error.message }));
      }
      // Success handled by onAuthStateChange in SessionContextProvider
      
    } catch (error) {
      showError(t("login_failed_error", { error: t("unknown_error") }));
    }
  };
  
  // If loading or already logged in, show loading state
  if (isLoading || session) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>{t("loading")}...</p>
        </div>
    );
  }
  
  const cardTitle = view === 'sign_in' ? t("welcome_back") : t("create_account");
  const cardSubtitle = view === 'sign_in' ? t("please_enter_credentials") : t("enter_details_to_sign_up");
  const buttonLabel = view === 'sign_in' ? t("log_in") : t("sign_up");
  const toggleViewText = view === 'sign_in' ? t("dont_have_an_account_sign_up") : t("already_have_an_account_sign_in");
  
  // Custom Input Component for styling consistency and icons
  const CustomInput = React.forwardRef<HTMLInputElement, { icon: React.ReactNode, type: string, placeholder: string, disabled: boolean, toggle?: React.ReactNode, name: string }>(
      ({ icon, type, placeholder, disabled, toggle, ...props }, ref) => (
          <div className="relative flex items-center">
              <span className="absolute left-4 text-[#9CA3AF] z-10">{icon}</span>
              <Input
                  ref={ref}
                  type={type}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={cn(
                      "h-12 pl-12 pr-4 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl text-[15px] placeholder:text-[#9CA3AF] transition-all duration-200",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0",
                      form.formState.errors[props.name as keyof SignInFormValues] && "border-destructive focus-visible:ring-destructive"
                  )}
                  {...props}
              />
              {toggle && <span className="absolute right-4 cursor-pointer text-[#9CA3AF]">{toggle}</span>}
          </div>
      )
  );
  CustomInput.displayName = 'CustomInput';

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden 
                 bg-gradient-to-r from-primary/10 via-background to-primary/10 
                 bg-[length:400%_400%] animate-gradient-shift"
    >
      {/* Removed Background Video and Overlay */}
      
      <Card 
        className={cn(
          "w-full max-w-md z-10 p-10 rounded-[16px] shadow-[0px_8px_24px_rgba(0,0,0,0.08)]", 
          "bg-white/90 dark:bg-card/90 backdrop-blur-sm"
        )}
      >
        <CardHeader className="text-center p-0 mb-8">
          {/* Logo and App Title */}
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="text-2xl font-extrabold text-[#111827] dark:text-foreground ml-2">{t("app_title")}</span>
          </div>
          
          <CardTitle className="text-2xl font-semibold text-[#111827] dark:text-foreground">
            {cardTitle}
          </CardTitle>
          <p className="text-sm text-[#6B7280] dark:text-muted-foreground mt-2">
            {cardSubtitle}
          </p>
        </CardHeader>
        
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-5">
              
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">{t("email")}</FormLabel>
                    <FormControl>
                      <CustomInput 
                          icon={<Mail className="h-4 w-4" />}
                          type="email" 
                          placeholder="Email Address" 
                          disabled={isPending}
                          {...field} 
                          name={field.name}
                      />
                    </FormControl>
                    <FormMessage className="text-[13px] text-destructive" />
                  </FormItem>
                )}
              />
              
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">{t("password")}</FormLabel>
                    <FormControl>
                      <CustomInput 
                          icon={<Lock className="h-4 w-4" />}
                          type={showPassword ? "text" : "password"} 
                          placeholder={t("password")} 
                          disabled={isPending}
                          toggle={
                              showPassword ? (
                                  <EyeOff className="h-4 w-4" onClick={() => setShowPassword(false)} />
                              ) : (
                                  <Eye className="h-4 w-4" onClick={() => setShowPassword(true)} />
                              )
                          }
                          {...field} 
                          name={field.name}
                      />
                    </FormControl>
                    <FormMessage className="text-[13px] text-destructive" />
                  </FormItem>
                )}
              />
              
              {/* Remember Me & Forgot Password (Only for Sign In) */}
              {view === 'sign_in' && (
                  <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                          <Checkbox id="remember" className="rounded-md h-4 w-4" />
                          <label
                              htmlFor="remember"
                              className="text-sm font-normal text-[#374151] dark:text-muted-foreground"
                          >
                              {t("remember_me")}
                          </label>
                      </div>
                      <Button variant="link" className="p-0 h-auto text-primary font-medium text-sm">
                          {t("forgot_your_password")}
                      </Button>
                  </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className={cn(
                    "w-full h-12 text-base font-medium rounded-xl transition-all duration-200",
                    "bg-primary hover:bg-[#3D5BE0] dark:bg-primary dark:hover:bg-primary/90",
                    isPending && "opacity-70 cursor-not-allowed"
                )}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : buttonLabel}
              </Button>
            </form>
          </Form>
          
          {/* Removed Divider and Social Login Buttons */}
          
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 pt-8 px-0 pb-0">
            {/* Sign Up / Sign In Toggle */}
            <Button 
                variant="link" 
                className="p-0 h-auto text-sm text-[#6B7280] dark:text-muted-foreground"
                onClick={() => {
                    setView(view === 'sign_in' ? 'sign_up' : 'sign_in');
                    form.reset(); // Clear form state on view switch
                }}
            >
                {toggleViewText}
            </Button>
            
            <LanguageSwitcher />
            
            {/* Footer Text */}
            <p className="text-xs text-[#6B7280] dark:text-muted-foreground text-center mt-4">
                {t("copyright_text", { year: new Date().getFullYear() })}
            </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;