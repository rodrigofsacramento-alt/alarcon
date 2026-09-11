import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/types/database';

export type SaleRecord = Tables<'sales_records'> & {
  property?: Tables<'properties'> | null;
  proposal?: Tables<'proposals'> | null;
  agent?: Tables<'profiles'> | null;
};

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_records')
        .select(`
          *,
          property:properties!sales_records_property_id_fkey(*),
          proposal:proposals!sales_records_proposal_id_fkey(*),
          agent:profiles!sales_records_agent_id_fkey(*)
        `)
        .order('contract_signed_at', { ascending: false });

      if (error) throw error;
      return data as SaleRecord[];
    },
  });
}

export function useCreateSaleRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sale: TablesInsert<'sales_records'>) => {
      const { data, error } = await supabase
        .from('sales_records')
        .insert(sale)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
    },
  });
}

export function useDeleteSaleRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, property_id }: { id: string; property_id: string }) => {
      // Deletar o registro de venda
      const { error: deleteError } = await supabase
        .from('sales_records')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Reverter o status do imóvel para 'available'
      const { error: propertyError } = await supabase
        .from('properties')
        .update({ status: 'available', updated_at: new Date().toISOString() })
        .eq('id', property_id);

      if (propertyError) throw propertyError;

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
    },
  });
}
