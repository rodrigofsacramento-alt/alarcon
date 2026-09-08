import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';
export type SocialIntegration = Tables<'social_integrations'>;
export function useSocialIntegrations() {
  return useQuery({
    queryKey: ['social-integrations'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('social_integrations').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data as SocialIntegration[];
    }
  });
}
export function useCreateSocialIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (integration: Omit<TablesInsert<'social_integrations'>, 'tenant_id'>) => {
      const {
        data: tenantId,
        error: tenantError
      } = await supabase.rpc('get_my_tenant_id');
      if (tenantError) throw tenantError;
      const {
        data,
        error
      } = await supabase.from('social_integrations').insert({
        ...integration,
        tenant_id: tenantId
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['social-integrations']
      });
    }
  });
}
export function useUpdateSocialIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: TablesUpdate<'social_integrations'> & {
      id: string;
    }) => {
      const {
        data,
        error
      } = await supabase.from('social_integrations').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['social-integrations']
      });
    }
  });
}
export function useDeleteSocialIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const {
        error
      } = await supabase.from('social_integrations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['social-integrations']
      });
    }
  });
}