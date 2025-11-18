import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { queryKeys } from './query-keys.ts';
import { registerNewUserAndProfile, updateProfile, updateMemberStatus, renewMemberPlan, NewMemberInput, processCheckIn, getProfileByMemberCode, updateMemberRole } from '@/utils/member-utils';
import { isFuture } from 'date-fns';

// Re-export NewMemberInput to allow components to import it
export type { NewMemberInput };

// --- Fetch Hooks ---

export const useMembers = (searchTerm: string = '', statusFilter: Profile['status'] | 'All' = 'All') => {
  const search = searchTerm.toLowerCase();
  
  return useQuery({
    queryKey: queryKeys.profiles.list(search, statusFilter),
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('last_name', { ascending: true });

      if (search) {
        // Supabase doesn't support full text search on multiple columns easily in RLS context, 
        // so we filter by name/code/email using ILIKE (case-insensitive)
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,member_code.ilike.%${search}%`);
      }
      
      // Apply status filter (Supabase side)
      // We fetch all data first, then apply client-side filtering based on the calculated status below,
      // but we still apply the filter here if possible to reduce payload size.
      // Since we need to calculate 'Expired' status client-side, we only apply the filter if it's not 'All' and not 'Expired'.
      if (statusFilter && statusFilter !== 'All' && statusFilter !== 'Expired') {
          query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase fetch members error:", error);
        throw new Error("Failed to fetch members.");
      }
      
      const profiles = data as Profile[];
      
      // Client-side logic to ensure 'Expired' status is correctly applied if expiration date passed
      const now = new Date();
      
      const processedProfiles = profiles.map(profile => {
          let currentStatus = profile.status;
          
          if (currentStatus === 'Active' && profile.expiration_date) {
              const expirationDate = new Date(profile.expiration_date);
              if (!isFuture(expirationDate)) {
                  // Temporarily mark as Expired for UI display
                  currentStatus = 'Expired' as const;
              }
          }
          return { ...profile, status: currentStatus };
      });
      
      // Apply client-side filtering for 'Expired' or 'All' if the initial query didn't filter it
      if (statusFilter === 'Expired') {
          return processedProfiles.filter(p => p.status === 'Expired');
      }
      
      return processedProfiles;
    },
  });
};

export const useMember = (id: string) => {
  return useQuery({
    queryKey: queryKeys.profiles.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Supabase fetch member error:", error);
        throw new Error("Failed to fetch member details.");
      }
      
      const profile = data as Profile;
      
      // Client-side check for expiration status
      if (profile.status === 'Active' && profile.expiration_date) {
          const expirationDate = new Date(profile.expiration_date);
          if (!isFuture(expirationDate)) {
              return { ...profile, status: 'Expired' as const };
          }
      }
      
      return profile;
    },
    enabled: !!id,
  });
};

// NEW: Hook to fetch a member by member_code
export const useMemberByCode = (memberCode: string) => {
    return useQuery({
        queryKey: queryKeys.profiles.byCode(memberCode),
        queryFn: () => getProfileByMemberCode(memberCode),
        enabled: !!memberCode,
    });
};


// Renamed hook for member registration (Auth + Profile creation)
export const useRegisterMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newMemberData: Omit<NewMemberInput, 'paymentMethod'>) => registerNewUserAndProfile(newMemberData),
    onSuccess: () => {
      // Invalidate all member lists and dashboard metrics
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedProfile: Partial<Profile> & { id: string }) => updateProfile(updatedProfile),
    onSuccess: (data) => {
      if (data) {
        // Invalidate specific detail query and all lists
        queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
      }
    },
  });
};

export const useUpdateMemberStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, newStatus }: { profileId: string, newStatus: Profile['status'] }) => updateMemberStatus(profileId, newStatus),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
      }
    },
  });
};

export const useUpdateMemberRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ profileId, newRole }: { profileId: string, newRole: Profile['role'] }) => updateMemberRole(profileId, newRole),
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(data.id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
                // Note: Role change might affect dashboard metrics if roles determine access/visibility, 
                // but for now, we only invalidate profiles.
            }
        },
    });
};

export const useRenewMemberPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, planId }: { profileId: string, planId: string }) => renewMemberPlan(profileId, planId),
    onSuccess: (result) => {
      if (result?.profile) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(result.profile.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
      }
    },
  });
};

export const useProcessCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, currentCheckIns }: { profileId: string, currentCheckIns: number }) => processCheckIn(profileId, currentCheckIns),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
      }
    },
  });
};