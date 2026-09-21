import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ---- Tipos ----
export type EsfuerzoRow = { agent_id: string; agente: string; tenant_id: string; dia: string; interacciones: number };
export type FunilRow = { tenant_id: string; stage: string; conversas: number };
export type SlaRow = { tenant_id: string; agent_id: string; agente: string; sla_segundos: number; n_respuestas: number };
export type RankingRow = {
  agent_id: string; agente: string; tenant_id: string;
  interacciones: number; vendas: number; propuestas: number; score: number;
};
export type RankingMetricasRow = {
  agent_id: string; agente: string;
  interacciones: number; conversas: number; leads: number;
  agendamientos: number; propuestas: number; vendas: number;
  sla_segundos: number;
};
export type LineaRow = { bucket: string; agente: string; stage: string; total: number };

// ---- Metas de ações por corretor (configurable na página) ----
export type CorretorMetaRow = {
  id?: string;
  tenant_id?: string;
  agent_id: string;
  meta_leads: number;
  meta_reunioes: number;      // reuniões = agendamento/visitas
  meta_propostas: number;
  meta_fechamentos: number;   // fechamento = vendas
  updated_at?: string;
};
export type MetasValores = Omit<CorretorMetaRow, "id" | "tenant_id" | "agent_id" | "updated_at">;
// Meta GLOBAL padrão por indicador (vale para todos os corretores do tenant).
export type MetasGlobalRow = {
  id?: string;
  tenant_id?: string;
  meta_leads: number;
  meta_reunioes: number;
  meta_propostas: number;
  meta_fechamentos: number;
  updated_at?: string;
};
export const META_DEFAULTS: MetasValores = {
  meta_leads: 0, meta_reunioes: 0, meta_propostas: 0, meta_fechamentos: 0,
};

export type PerformanceDashboardData = {
  esfuerzo: EsfuerzoRow[];
  funil: FunilRow[];
  sla: SlaRow[];
  ranking: RankingRow[];
};

export type LoadingState = "idle" | "loading" | "error";

const TENANT_FALLBACK = "fa440b34-5eb7-417d-b836-1184d229e427";

export function usePerformanceDashboard() {
  const [data, setData] = useState<PerformanceDashboardData>({
    esfuerzo: [],
    funil: [],
    sla: [],
    ranking: [],
  });
  const [state, setState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const [esfuerzo, funil, sla, ranking] = await Promise.all([
        supabase.from("v_dashboard_esfuerzo").select("*").order("dia", { ascending: false }).limit(500),
        supabase.from("v_dashboard_funil").select("*"),
        supabase.from("v_dashboard_sla").select("*"),
        supabase.from("v_dashboard_ranking").select("*").order("score", { ascending: false }).limit(50),
      ]);

      if (esfuerzo.error) throw esfuerzo.error;
      if (funil.error) throw funil.error;
      if (sla.error) throw sla.error;
      if (ranking.error) throw ranking.error;

      setData({
        esfuerzo: (esfuerzo.data as EsfuerzoRow[]) ?? [],
        funil: (funil.data as FunilRow[]) ?? [],
        sla: (sla.data as SlaRow[]) ?? [],
        ranking: (ranking.data as RankingRow[]) ?? [],
      });
      setState("idle");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Consulta dinámica del motor para el gráfico de línea comparativo (3 corretores x 3 stages)
  const fetchLinea = useCallback(
    async (agentes: string[], stages: string[], inicio: Date, fin: Date) => {
      if (!agentes.length || !stages.length) return [] as LineaRow[];
      const { data, error } = await supabase.rpc("dashboard_linea", {
        p_tenant: TENANT_FALLBACK,
        p_agentes: agentes,
        p_stages: stages,
        p_inicio: inicio.toISOString(),
        p_fin: fin.toISOString(),
      });
      if (error) throw error;
      return (data as LineaRow[]) ?? [];
    },
    [],
  );

  // Ranking dinámico: 7 métricas por corretor, filtrado por período
  const fetchRankingMetricas = useCallback(
    async (inicio: Date, fin: Date) => {
      const { data, error } = await supabase.rpc("dashboard_ranking_metricas", {
        p_tenant: TENANT_FALLBACK,
        p_inicio: inicio.toISOString(),
        p_fin: fin.toISOString(),
      });
      if (error) throw error;
      return (data as RankingMetricasRow[]) ?? [];
    },
    [],
  );

  return { data, state, error, refresh, fetchLinea, fetchRankingMetricas, fetchMetaGlobal, upsertMetaGlobal, fetchMetas, upsertMeta };

  // ---- Metas GLOBAL padron por indicador (nova tabla corretor_metas_global) ----
  async function fetchMetaGlobal(): Promise<MetasGlobalRow> {
    const { data, error } = await supabase
      .from("corretor_metas_global")
      .select("*")
      .limit(1);
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return (row as MetasGlobalRow) ?? { meta_leads: 0, meta_reunioes: 0, meta_propostas: 0, meta_fechamentos: 0 };
  }

  // Upsert da meta global (uma por tenant, PK UNIQUE tenant_id).
  async function upsertMetaGlobal(tenant_id: string, m: MetasValores): Promise<void> {
    const { error } = await supabase
      .from("corretor_metas_global")
      .upsert(
        { tenant_id, ...m, updated_at: new Date().toISOString() },
        { onConflict: "tenant_id" },
      );
    if (error) throw error;
  }

  // ---- Exceções por corretor (nova tabla corretor_metas) ----
  async function fetchMetas(): Promise<CorretorMetaRow[]> {
    const { data, error } = await supabase
      .from("corretor_metas")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as CorretorMetaRow[]) ?? [];
  }

  // Upsert de uma exceção por corretor (UNIQUE tenant_id+agent_id). Null remove a exceção.
  async function upsertMeta(agent_id: string, tenant_id: string, m: MetasValores | null): Promise<void> {
    if (m === null) {
      const { error } = await supabase
        .from("corretor_metas")
        .delete()
        .eq("tenant_id", tenant_id)
        .eq("agent_id", agent_id);
      if (error) throw error;
      return;
    }
    const { error } = await supabase
      .from("corretor_metas")
      .upsert(
        { agent_id, tenant_id, ...m, updated_at: new Date().toISOString() },
        { onConflict: "tenant_id,agent_id" },
      );
    if (error) throw error;
  }
}