import React, { useState, useRef } from 'react';
import { Profile } from '@/types/supabase';
import { useTranslation } from 'react-i18next';
import { User, Upload, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadAvatar, deleteAvatar } from '@/utils/member-utils';
import { showSuccess, showError } from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/integrations/supabase/data/query-keys';

interface MemberAvatarUploaderProps {
  member: Profile;
  canEdit: boolean;
}

const MemberAvatarUploader: React.FC<MemberAvatarUploaderProps> = ({ member, canEdit }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const f = firstName ? firstName[0] : '';
    const l = lastName ? lastName[0] : '';
    return (f + l).toUpperCase() || '?';
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newUrl = await uploadAvatar(member.id, file, member.avatar_url);
      showSuccess(t("avatar_upload_success"));
      
      // Manually update the profile query cache to reflect the new avatar URL immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(member.id) });
      
    } catch (error) {
      showError(t("avatar_upload_failed"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
    }
  };
  
  const handleDeleteAvatar = async () => {
      if (!member.avatar_url) return;
      
      setIsUploading(true);
      try {
          await deleteAvatar(member.id, member.avatar_url);
          showSuccess(t("avatar_delete_success"));
          queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(member.id) });
      } catch (error) {
          showError(t("avatar_delete_failed"));
      } finally {
          setIsUploading(false);
      }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <Avatar className="h-24 w-24 border-4 border-primary/50 shadow-lg">
        <AvatarImage src={member.avatar_url || undefined} alt={`${member.first_name} avatar`} />
        <AvatarFallback className="bg-secondary text-2xl font-semibold">
          {getInitials(member.first_name, member.last_name)}
        </AvatarFallback>
      </Avatar>
      
      {canEdit && (
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            {t("upload_avatar")}
          </Button>
          
          {member.avatar_url && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteAvatar}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberAvatarUploader;