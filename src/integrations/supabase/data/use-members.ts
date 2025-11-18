import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { queryKeys } from './query-keys.ts';
import { addMember, updateProfile, updateMemberStatus, renewMemberPlan, NewMemberInput, processCheckIn } from '@/utils/member-utils';

// Re-export NewMemberInput to allow components to import it
export { NewMemberInput };

// --- Fetch Hooks ---

export const useMembers = (searchTerm: string = '') => {
  const search = searchTerm.toLowerCase();
  
  return useQuery({
    queryKey: queryKeys.profiles.list(search),
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

      const { data, error } = await query;

      if (error) {
        console.error("Supabase fetch members error:", error);
        throw new Error("Failed to fetch members.");
      }
      return data as Profile[];
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
      return data as Profile;
    },
    enabled: !!id,
  });
};

// --- Mutation Hooks ---

export const useAddMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newMemberData: NewMemberInput) => addMember(newMemberData),
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

export const useRenewMemberPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, planId }: { profileId: string, planId: string }) => renewMemberPlan(profileId, planId),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(data.id) });
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