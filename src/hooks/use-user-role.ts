import { useSession } from '@/components/auth/SessionContextProvider';
import { Profile } from '@/types/supabase';

type UserRole = Profile['role'];

export const useUserRole = () => {
  const { profile, isLoading } = useSession();
  
  const role: UserRole = profile?.role || null;

  const isTrueOwner = role === 'owner';
  const isCoOwner = role === 'co owner'; // NEW
  const isManager = role === 'manager';
  const isCashier = role === 'cashier';
  
  // isOwner now represents anyone with Owner-level permissions
  const isOwner = isTrueOwner || isCoOwner; // UPDATED: Includes co owner
  
  // Staff includes managers and cashiers
  const isStaff = isManager || isCashier; 
  
  const isMember = role === 'member';
  const isAuthenticated = !!profile;

  return {
    role,
    isOwner, // This is the combined permission check used everywhere
    isManager,
    isCashier,
    isStaff, // Keep isStaff for general checks
    isMember,
    isAuthenticated,
    isLoading,
  };
};