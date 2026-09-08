import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
export type CommissionRuleType = 'venda' | 'assessoria' | 'bonus' | 'salario_fixo';
export interface CommissionRule {
  id: string;
  rule_type: CommissionRuleType;
  min_value: number;
  max_value: number | null;
  percentage_agent: number | null;
  percentage_supervisor: number | null;
  percentage_manager: number | null;
  fixed_bonus_amount: number | null;
  currency: string;
}
export interface AgentCommission {
  id: string;
  agent_id: string;
  property_id?: string;
  client_id?: string;
  sale_value: number;
  sale_currency: string;
  property_type: string;
  commission_base_usd: number;
  gross_commission_pyg: number;
  net_commission_agent_pyg: number;
  supervisor_id?: string;
  supervisor_commission_pyg?: number;
  manager_id?: string;
  manager_commission_pyg?: number;
  has_assessoria: boolean;
  assessoria_base_pyg: number;
  assessoria_agent_pyg: number;
  assessoria_supervisor_pyg: number;
  assessoria_manager_pyg: number;
  status: string;
  month_reference: string;
  created_at?: string;
  updated_at?: string;
  agent?: any; // Para expandir o perfil
  property?: {
    id: string;
    code: string;
    title: string;
  }; // Join com imóvel
}

// Fetch rules
export function useCommissionRules() {
  return useQuery({
    queryKey: ['commission_rules'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('commission_rules').select('*').order('min_value', {
        ascending: true
      });
      if (error) throw error;
      return data as CommissionRule[];
    }
  });
}

// Fetch commissions
export function useAgentCommissions(filters?: {
  agentId?: string;
  month?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['agent_commissions', filters],
    queryFn: async () => {
      let query = supabase.from('agent_commissions').select('*, agent:profiles!agent_commissions_agent_id_fkey(id, full_name, role), property:properties(id, code, title)').order('created_at', {
        ascending: false
      });
      if (filters?.agentId) query = query.eq('agent_id', filters.agentId);
      if (filters?.month) query = query.eq('month_reference', filters.month);
      if (filters?.status) query = query.eq('status', filters.status);
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return data as AgentCommission[];
    }
  });
}

// Insert commission
export function useCreateCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commission: Partial<AgentCommission>) => {
      const {
        data,
        error
      } = await supabase.from('agent_commissions').insert(commission).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['agent_commissions']
      });
    }
  });
}

// Helper de cálculo no lado do cliente
export function calculateProgressiveCommission(saleValueUSD: number, accumulatedSalesUSD: number, rules: CommissionRule[], propertyType: string, assessoriaBasePYG: number = 0, exchangeRateUSDToPYG: number = 7500 // Exemplo de conversão se necessário fixar, ideal vir do banco
) {
  const vendaRules = rules.filter(r => r.rule_type === 'venda');
  const assessoriaRules = rules.filter(r => r.rule_type === 'assessoria');

  // 1. Encontrar a faixa da Venda (baseado no ACUMULADO + Venda atual)
  const totalSales = accumulatedSalesUSD + saleValueUSD;
  let vendaRule = vendaRules.find(r => totalSales >= r.min_value && (!r.max_value || totalSales <= r.max_value));
  if (!vendaRule) vendaRule = vendaRules[vendaRules.length - 1]; // fallback para teto

  // Cálculo da venda (Comissão PYG = Valor USD * Conversao * Percentual)
  const basePYG = saleValueUSD * exchangeRateUSDToPYG;
  const netCommissionAgent = basePYG * ((vendaRule?.percentage_agent || 0) / 100);
  const supervisorCommission = basePYG * ((vendaRule?.percentage_supervisor || 0) / 100);
  const managerCommission = basePYG * ((vendaRule?.percentage_manager || 0) / 100);
  const grossCommission = netCommissionAgent + supervisorCommission + managerCommission;

  // 2. Assessoria (apenas lote aberto)
  let assessoriaAgent = 0;
  let assessoriaSupervisor = 0;
  let assessoriaManager = 0;
  if ((propertyType === 'lote' || propertyType === 'loteamento_aberto') && assessoriaBasePYG > 0) {
    let assessoriaRule = assessoriaRules.find(r => assessoriaBasePYG >= r.min_value && (!r.max_value || assessoriaBasePYG <= r.max_value));
    if (!assessoriaRule) assessoriaRule = assessoriaRules[assessoriaRules.length - 1];
    assessoriaAgent = assessoriaBasePYG * ((assessoriaRule?.percentage_agent || 0) / 100);
    assessoriaSupervisor = assessoriaBasePYG * ((assessoriaRule?.percentage_supervisor || 0) / 100);
    assessoriaManager = assessoriaBasePYG * ((assessoriaRule?.percentage_manager || 0) / 100);
  }
  return {
    gross_commission_pyg: grossCommission,
    net_commission_agent_pyg: netCommissionAgent,
    supervisor_commission_pyg: supervisorCommission,
    manager_commission_pyg: managerCommission,
    assessoria_agent_pyg: assessoriaAgent,
    assessoria_supervisor_pyg: assessoriaSupervisor,
    assessoria_manager_pyg: assessoriaManager,
    appliedVendaRule: vendaRule
  };
}