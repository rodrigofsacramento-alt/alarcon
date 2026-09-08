import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/types/database';

export type ClientProposal = Tables<'proposals'>;
export type ClientVisit = Tables<'visits'> & {
  lead?: Tables<'leads'> | null;
  property?: Tables<'properties'> | null;
  agent?: Tables<'profiles'> | null;
};

export function useClientProposals() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['client-proposals', profile?.full_name],
    enabled: !!profile?.full_name,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .ilike('client_name', `%${profile?.full_name}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClientProposal[];
    },
  });
}

export function useClientVisits() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['client-visits', profile?.email, profile?.phone],
    enabled: !!(profile?.email || profile?.phone),
    queryFn: async () => {
      // Busca leads do cliente baseado em email ou telefone
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id')
        .or(`email.eq.${profile?.email},phone.eq.${profile?.phone}`);

      if (leadsError) throw leadsError;
      if (!leads || leads.length === 0) return [] as ClientVisit[];

      const leadIds = leads.map(l => l.id);

      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          lead:leads!visits_lead_id_fkey(id, name, email, phone),
          property:properties!visits_property_id_fkey(id, title, code, location),
          agent:profiles!visits_agent_id_fkey(id, full_name)
        `)
        .in('lead_id', leadIds)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data as ClientVisit[];
    },
  });
}
