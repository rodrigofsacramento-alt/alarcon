import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { resolveLeadSla } from '@/hooks/use-dashboard';

export interface SidebarBadges {
  leads: number;
  atendimento: number;
  agenda: number;
  propostas: number;
  juridico: number;
}

export function useSidebarBadges() {
  const { user, profile } = useAuth();
  const isAgent = profile?.role === 'agent';

  return useQuery({
    queryKey: ['sidebar-badges', user?.id, isAgent],
    queryFn: async (): Promise<SidebarBadges> => {
      // Base queries
      let leadsQuery = supabase
        .from('leads')
        .select('id, stage, sla_status', { count: 'exact', head: true })
        .not('stage', 'in', '(Convertido,Perdido)');
      let proposalsQuery = supabase
        .from('proposals')
        .select('id, status', { count: 'exact', head: true })
        .not('status', 'in', '(Finalizada,Cancelada)');
      let visitsQuery = supabase
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .in('status', ['scheduled', 'confirmed']);
      let slaQuery = supabase
        .from('leads')
        .select('id, stage, sla_status, sla_deadline, created_at, updated_at, responsible_id')
        .not('stage', 'in', '(Convertido,Perdido)');
      let juridicoQuery = supabase
        .from('proposals')
        .select('id', { count: 'exact', head: true })
        .in('status', ['Docs Enviados', 'Docs Conferidos']);

      // Filtra por corretor se o usuário for agente
      if (isAgent && user?.id) {
        leadsQuery = leadsQuery.eq('responsible_id', user.id);
        proposalsQuery = proposalsQuery.eq('agent_id', user.id);
        visitsQuery = visitsQuery.eq('agent_id', user.id);
        slaQuery = slaQuery.eq('responsible_id', user.id);
        juridicoQuery = juridicoQuery.eq('agent_id', user.id);
      }

      const [leadsRes, proposalsRes, visitsRes, slaRes, juridicoRes] = await Promise.all([
        leadsQuery,
        proposalsQuery,
        visitsQuery,
        slaQuery,
        juridicoQuery,
      ]);

      const atendimentoCount = (slaRes.data || []).filter((lead) => resolveLeadSla(lead) !== 'ok').length;

      return {
        leads: leadsRes.count ?? 0,
        atendimento: atendimentoCount ?? 0,
        agenda: visitsRes.count ?? 0,
        propostas: proposalsRes.count ?? 0,
        juridico: juridicoRes.count ?? 0,
      };
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
