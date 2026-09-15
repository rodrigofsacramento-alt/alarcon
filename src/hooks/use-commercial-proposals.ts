import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Tabela `commercial_proposals` é NOVA (criada pelo Apollo em paralelo),
 * ainda não está no tipo Database gerado. Definimos aqui os tipos locais e
 * usamos `supabase as any` para o insert NÃO quebrar o typecheck de tsc.
 */

export type ProposalCurrency = "Gs" | "BRL" | "USD";

export interface CommercialProposalInsert {
  client_id: string | null;
  agent_id: string | null;
  property_id: string | null;
  client_name?: string | null;
  loteamento?: string | null;
  manzana?: string | null;
  lote?: string | null;
  valor_total: number;
  valor_entrada_percentual: number;
  valor_entrada_calculado: number;
  numero_parcelas: number;
  valor_parcela: number;
  valor_total_inicial: number;
  currency: ProposalCurrency;
  exchange_rate_manual?: number | null;
  prazo_emissao_contrato_dias?: number | null;
  validade_proposta_dias?: number | null;
  observacoes?: string | null;
  status?: string | null;
  created_by?: string | null;
}

export interface CommercialProposal extends CommercialProposalInsert {
  id: string;
  created_at: string;
}

/**
 * Cria uma proposta comercial na tabela `commercial_proposals`.
 * Higienização garantida aqui: valores vêm como NUMBER puro (sem máscara).
 */
export function useCreateCommercialProposal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CommercialProposalInsert) => {
      const payload: CommercialProposalInsert = {
        ...input,
        created_by: input.created_by ?? user?.id ?? null,
      };
      // `as any`: tabela ainda não tipada no Database.
      const { data, error } = await (supabase as any)
        .from("commercial_proposals")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as CommercialProposal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commercial-proposals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}