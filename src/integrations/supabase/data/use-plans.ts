import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MembershipPlan } from '@/types/supabase';
import { queryKeys } from './query-keys.ts';
import { addMembershipPlan, updateMembershipPlan } from '@/utils/plan-utils';
import { NewPlanInput } from '@/types/pos';

// --- Fetch Hooks ---

export const usePlans = (searchTerm: string = '') => {
  const search = searchTerm.toLowerCase();
  
  return useQuery({
    queryKey: queryKeys.plans.list(search),
    queryFn: async () => {
      let query = supabase
        .from('membership_plans')
        .select('*')
        .order('duration_days', { ascending: true });

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase fetch plans error:", error);
        throw new Error("Failed to fetch membership plans.");
      }
      return data as MembershipPlan[];
    },
  });
};

// --- Mutation Hooks ---

export const useAddPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPlanData: NewPlanInput) => addMembershipPlan(newPlanData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedPlan: Partial<MembershipPlan> & { id: string }) => updateMembershipPlan(updatedPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
    },
  });
};