import { useSession } from '@/components/auth/SessionContextProvider';
import { Profile } from '@/types/supabase';

type UserRole = Profile['role'];

export const useUserRole = () => {
  const { profile, isLoading } = useSession();
  
  const role: UserRole = profile?.role || null;

  const isOwner = role === 'owner';
  const isStaff = role === 'staff';
  const isMember = role === 'member'; // NEW
  const isAuthenticated = !!profile;

  return {
    role,
    isOwner,
    isStaff,
    isMember, // Export new role check
    isAuthenticated,
    isLoading,
  };
};