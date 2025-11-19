import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Mail, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/components/auth/SessionContextProvider';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

type EmailFormValues = z.infer<typeof formSchema>;

const EmailManagementForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSession();
  
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });
  
  const isPending = form.formState.isSubmitting;

  const onSubmit = async (values: EmailFormValues) => {
    if (values.email === user?.email) {
        showError(t("email_already_current"));
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.updateUser({
            email: values.email,
        });

        if (error) {
            console.error("Email update error:", error);
            showError(t("email_update_failed", { error: error.message }));
            return;
        }
        
        // Supabase sends a confirmation email to the new address
        showSuccess(t("email_update_confirmation_sent", { email: values.email }));
        
    } catch (error) {
        showError(t("email_update_failed", { error: t("unknown_error") }));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* New Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("new_email_address")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder="new.email@example.com" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full mt-4" disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />
          {isPending ? t("saving") : t("update_email")}
        </Button>
        
        <p className="text-xs text-muted-foreground pt-2">
            {t("email_update_note")}
        </p>
      </form>
    </Form>
  );
};

export default EmailManagementForm;