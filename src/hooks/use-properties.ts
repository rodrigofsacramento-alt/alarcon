import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

export type Property = Tables<'properties'> & {
  agent?: Tables<'profiles'> | null;
};

export function useProperties(filters?: {
  type?: string;
  status?: string;
  search?: string;
}) {
  const { user, profile } = useAuth();
  const isAgent = profile?.role === 'agent';

  return useQuery({
    queryKey: ['properties', filters, user?.id, isAgent],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*, agent:profiles!properties_agent_id_fkey(*)')
        .order('created_at', { ascending: false });

      // Democratização (09/09): corretores e agentes veem a TOTALIDADE de
      // imóveis do seu tenant (não apenas os "atribuídos" a eles), e podem
      // criar. A RLS de properties (tenant_id = get_my_tenant_id()) já limita
      // cada usuário ao seu próprio tenant; ver todos é seguro e desejado.

      if (filters?.type && filters.type !== 'Todos') {
        const typeMap: Record<string, string> = {
          'Residencial': 'residential',
          'Comercial': 'commercial',
          'Terrenos': 'land',
        };
        if (typeMap[filters.type]) {
          query = query.eq('type', typeMap[filters.type]);
        }
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,code.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Property[];
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (property: TablesInsert<'properties'>) => {
      const { data, error } = await supabase
        .from('properties')
        .insert(property)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'properties'> & { id: string }) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
