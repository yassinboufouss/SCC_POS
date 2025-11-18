import { useSession } from '@/components/auth/SessionContextProvider';
import { Profile } from '@/types/supabase';

type UserRole = Profile['role'];

export const useUserRole = () => {
  const { profile, isLoading } = useSession();
  
  const role: UserRole = profile?.role || null;

  const isOwner = role === 'owner';
  const isManager = role === 'manager';
  const isCashier = role === 'cashier';
  
  // Staff includes managers and cashiers
  const isStaff = isManager || isCashier; 
  
  const isMember = role === 'member';
  const isAuthenticated = !!profile;

  return {
    role,
    isOwner,
    isManager,
    isCashier,
    isStaff, // Keep isStaff for general checks
    isMember,
    isAuthenticated,
    isLoading,
  };
};