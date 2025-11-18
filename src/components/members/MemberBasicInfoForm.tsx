import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Save, CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Profile } from '@/types/supabase';
import { useUpdateProfile } from '@/integrations/supabase/data/use-members.ts';
import { showSuccess, showError } from '@/utils/toast';

interface MemberBasicInfoFormProps {
  member: Profile;
  onSuccess: () => void;
  canEdit: boolean; // New prop
}

const formSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }).optional().or(z.literal('')),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date of Birth must be in YYYY-MM-DD format." }).optional().or(z.literal('')),
});

type BasicInfoFormValues = z.infer<typeof formSchema>;

const MemberBasicInfoForm: React.FC<MemberBasicInfoFormProps> = ({ member, onSuccess, canEdit }) => {
  const { t } = useTranslation();
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile();

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
      phone: member.phone || '',
      dob: member.dob || '',
    },
  });
  
  // Reset form when member ID changes (in case dialog is reused)
  React.useEffect(() => {
      form.reset({
          first_name: member.first_name || '',
          last_name: member.last_name || '',
          email: member.email || '',
          phone: member.phone || '',
          dob: member.dob || '',
      });
  }, [member.id, member.first_name, member.last_name, member.phone, member.dob, member.email, form.reset]);


  const onSubmit = async (values: BasicInfoFormValues) => {
    const updatedData: Partial<Profile> & { id: string } = {
      id: member.id,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email || null,
      phone: values.phone || null,
      dob: values.dob || null,
    };
    
    try {
        await updateProfile(updatedData);
        showSuccess(t("member_profile_updated_success", { name: `${values.first_name} ${values.last_name}` }));
        onSuccess();
    } catch (error) {
        showError(t("update_failed"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("first_name")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!canEdit} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Last Name */}
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("last_name")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!canEdit} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input placeholder="jane.doe@example.com" {...field} disabled={!canEdit} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("phone_number")}</FormLabel>
                <FormControl>
                  <Input placeholder="555-123-4567" {...field} disabled={!canEdit} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("date_of_birth")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="date" {...field} className="pr-8" disabled={!canEdit} />
                    <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full mt-4" disabled={isSaving || !canEdit}>
          <Save className="h-4 w-4 mr-2" />
          {t("save_member_changes")}
        </Button>
      </form>
    </Form>
  );
};

export default MemberBasicInfoForm;