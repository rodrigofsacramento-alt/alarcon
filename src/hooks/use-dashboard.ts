import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type DashboardSlaStatus = 'ok' | 'warning' | 'critical' | 'expired';

export type DashboardSlaAlert = {
  id: string;
  type: string;
  client: string;
  agent: string;
  deadline: string;
  status: DashboardSlaStatus;
};

export type DashboardPerformancePoint = {
  month: string;
  leads: number;
  vendas: number;
};

const stageSlaHours: Record<string, number> = {
  'Lead Cadastrado': 1,
  'Primeiro Atendimento': 4,
  'Follow-up': 24,
  'Agendamento de Visita': 12,
  'Visita Agendada': 24,
  'Imóvel Escolhido': 24,
  'ImÃ³vel Escolhido': 24,
  'Em Aprovação de Correspondência': 48,
  'Em AprovaÃ§Ã£o de CorrespondÃªncia': 48,
  'Proposta Solicitada': 24,
};

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getLeadReferenceDate(lead: any) {
  return new Date(lead.updated_at || lead.created_at || Date.now());
}

function getLeadSlaDeadline(lead: any) {
  if (lead.sla_deadline) return new Date(lead.sla_deadline);
  const reference = getLeadReferenceDate(lead);
  const hours = stageSlaHours[lead.stage] ?? 24;
  return new Date(reference.getTime() + hours * 60 * 60 * 1000);
}

export function resolveLeadSla(lead: any): DashboardSlaStatus {
  if (lead.stage === 'Convertido' || lead.stage === 'Perdido') return 'ok';
  if (lead.sla_deadline || lead.sla_status !== 'ok') {
    if (lead.sla_status === 'warning' || lead.sla_status === 'critical' || lead.sla_status === 'expired') {
      return lead.sla_status;
    }
  }

  const deadline = getLeadSlaDeadline(lead);
  const remainingMs = deadline.getTime() - Date.now();
  if (remainingMs <= 0) return 'expired';
  if (remainingMs <= 60 * 60 * 1000) return 'critical';
  if (remainingMs <= 4 * 60 * 60 * 1000) return 'warning';
  return 'ok';
}

function formatSlaDeadline(lead: any) {
  const deadline = getLeadSlaDeadline(lead);
  const diffMs = deadline.getTime() - Date.now();
  const absMinutes = Math.max(1, Math.round(Math.abs(diffMs) / 60000));
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  const text = hours > 0 ? `${hours}h${minutes ? ` ${minutes}min` : ''}` : `${minutes}min`;
  return diffMs < 0 ? `Expirado ha ${text}` : `${text} restantes`;
}

function buildPerformance(leads: any[], proposals: any[]): DashboardPerformancePoint[] {
  const now = new Date();
  const points: DashboardPerformancePoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    points.push({
      month: monthLabels[month],
      leads: leads.filter((lead) => {
        const created = new Date(lead.created_at || 0);
        return created.getFullYear() === year && created.getMonth() === month;
      }).length,
      vendas: proposals.filter((proposal) => {
        const created = new Date(proposal.created_at || 0);
        return proposal.status === 'Finalizada' && created.getFullYear() === year && created.getMonth() === month;
      }).length,
    });
  }

  return points;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [leadsRes, propertiesRes, proposalsRes, visitsRes, nextActionsRes] = await Promise.all([
        supabase.from('leads').select('id, name, stage, sla_status, sla_deadline, score, created_at, updated_at, responsible:profiles!leads_responsible_id_fkey(full_name)').eq('is_active', true),
        supabase.from('properties').select('id, status, price, created_at'),
        supabase.from('proposals').select('id, status, value, created_at'),
        supabase.from('visits').select('id, status, scheduled_at'),
        (supabase as any)
          .from('lead_next_actions')
          .select('lead_id, name, next_action, action_priority, recommended_property_title, recommended_property_score, has_strong_property_match')
          .in('next_action', ['indicar_imovel', 'follow_up_atrasado', 'priorizar_corretor'])
          .order('action_priority', { ascending: false })
          .limit(6),
      ]);

      const leads = leadsRes.data || [];
      const properties = propertiesRes.data || [];
      const proposals = proposalsRes.data || [];
      const visits = visitsRes.data || [];
      const nextActions = nextActionsRes.data || [];

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const leadsThisMonth = leads.filter(l => new Date(l.created_at!) >= thisMonth);
      const visitsThisMonth = visits.filter(v => new Date(v.scheduled_at) >= thisMonth);
      const proposalsActive = proposals.filter(p => p.status !== 'Cancelada' && p.status !== 'Finalizada');
      const salesThisMonth = proposals.filter(p => p.status === 'Finalizada' && new Date(p.created_at!) >= thisMonth);
      const revenueThisMonth = salesThisMonth.reduce((sum, p) => sum + (p.value || 0), 0);

      const activeProperties = properties.filter(p => p.status === 'available' || p.status === 'reserved');

      // SLA alerts
      const slaAlerts: DashboardSlaAlert[] = leads
        .filter(l => l.stage !== 'Perdido' && l.stage !== 'Convertido')
        .map((lead: any) => ({
          id: lead.id,
          type: lead.stage || 'Lead',
          client: lead.name || 'Lead sem nome',
          agent: lead.responsible?.full_name || 'Sem responsavel',
          deadline: formatSlaDeadline(lead),
          status: resolveLeadSla(lead),
        }))
        .filter(alert => alert.status !== 'ok')
        .sort((a, b) => {
          const rank = { expired: 0, critical: 1, warning: 2, ok: 3 };
          return rank[a.status] - rank[b.status];
        })
        .slice(0, 6);

      const automationAlerts: DashboardSlaAlert[] = nextActions.map((action: any) => {
        const isFollowUp = action.next_action === 'follow_up_atrasado';
        const isPriority = action.next_action === 'priorizar_corretor';
        const isMatch = action.next_action === 'indicar_imovel' || action.has_strong_property_match;
        return {
          id: `automation-${action.lead_id}`,
          type: isFollowUp
            ? 'Follow-up vencido'
            : isPriority
              ? 'Lead urgente'
              : 'Match forte de imovel',
          client: action.name || 'Lead sem nome',
          agent: isMatch && action.recommended_property_title
            ? `${action.recommended_property_title}${action.recommended_property_score ? ` (${action.recommended_property_score})` : ''}`
            : 'Atendimento IA',
          deadline: isFollowUp ? 'Cobrar agora' : isPriority ? 'Assumir agora' : 'Enviar opcoes',
          status: isFollowUp || isPriority ? 'critical' : 'warning',
        } as DashboardSlaAlert;
      });

      const combinedAlerts = [...automationAlerts, ...slaAlerts].slice(0, 6);

      const slaWarning = combinedAlerts.filter(l => l.status === 'warning').length;
      const slaCritical = combinedAlerts.filter(l => l.status === 'critical' || l.status === 'expired').length;

      // Lead funnel
      const stages = [
        'Lead Cadastrado', 'Primeiro Atendimento', 'Follow-up',
        'Agendamento de Visita', 'Visita Agendada', 'Imóvel Escolhido',
        'Em Aprovação de Correspondência', 'Proposta Solicitada', 'Convertido',
      ];
      const funnel = stages.map(stage => ({
        stage,
        count: leads.filter(l => l.stage === stage).length,
      }));

      return {
        leadsAtivos: leads.filter(l => l.stage !== 'Perdido' && l.stage !== 'Convertido').length,
        leadsThisMonth: leadsThisMonth.length,
        imoveisAtivos: activeProperties.length,
        visitasMes: visitsThisMonth.length,
        propostas: proposalsActive.length,
        vendasMes: salesThisMonth.length,
        receitaMes: revenueThisMonth,
        slaWarning,
        slaCritical,
        slaAlerts: combinedAlerts,
        funnel,
        performance: buildPerformance(leads, proposals),
      };
    },
    refetchInterval: 30000, // refresh every 30s
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_timeline')
        .select('*, lead:leads!lead_timeline_lead_id_fkey(name), user:profiles!lead_timeline_user_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

export function useAgentStats() {
  return useQuery({
    queryKey: ['agent-stats'],
    queryFn: async () => {
      const { data: agents, error: agentsErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent')
        .eq('is_active', true);
      if (agentsErr) throw agentsErr;

      const agentStats = await Promise.all(
        (agents || []).map(async (agent) => {
          const [leadsRes, proposalsRes] = await Promise.all([
            supabase.from('leads').select('id').eq('responsible_id', agent.id).eq('is_active', true),
            supabase.from('proposals').select('id, value, status').eq('agent_id', agent.id),
          ]);

          const leads = leadsRes.data?.length || 0;
          const proposals = proposalsRes.data || [];
          const vgv = proposals
            .filter(p => p.status === 'Finalizada')
            .reduce((sum, p) => sum + (p.value || 0), 0);

          return {
            id: agent.id,
            name: agent.full_name,
            initials: agent.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            role: agent.role,
            leads,
            vgv,
            proposals: proposals.length,
          };
        })
      );

      return agentStats.sort((a, b) => b.vgv - a.vgv);
    },
  });
}
