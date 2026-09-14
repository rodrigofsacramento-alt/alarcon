import type { RankingMetricasRow } from "@/hooks/use-performance-dashboard";

// ---- Formato ----
export function fmtSla(segundos: number) {
  if (!segundos || segundos <= 0) return "—";
  if (segundos < 60) return `${Math.round(segundos)}s`;
  if (segundos < 3600) return `${Math.round(segundos / 60)}min`;
  const h = segundos / 3600;
  if (h < 24) return `${Math.round(h * 10) / 10}h`;
  return `${Math.round((h / 24) * 10) / 10}d`;
}
export function fmtNum(n: number | undefined) {
  return (n ?? 0).toLocaleString("es-ES");
}

// ---- Métricas del Ranking dinâmico ----
export type RankingMetricaKey = keyof Omit<RankingMetricasRow, "agent_id" | "agente">;
export const PL_KEY: RankingMetricaKey = "productividad_liquida" as RankingMetricaKey;
export const RANKING_METRICAS: { key: RankingMetricaKey; label: string; icono: string; sla?: true; pl?: true }[] = [
  { key: "interacciones", label: "Interações", icono: "💬" },
  { key: "conversas", label: "Conversas", icono: "🗨️" },
  { key: "leads", label: "Leads", icono: "🧲" },
  { key: "agendamientos", label: "Agendamentos", icono: "📅" },
  { key: "propuestas", label: "Propostas", icono: "📄" },
  { key: "vendas", label: "Vendas", icono: "💰" },
  { key: "sla_segundos", label: "SLA Atend.", icono: "⏱️", sla: true },
  { key: PL_KEY, label: "Produtividade Líquida", icono: "🧮", pl: true },
];

// Pesos da Produtividade Líquida (soma = 1.0). SLA invertido: menor valor = más peso.
export const PL_PESOS: Record<string, number> = {
  interacciones: 0.08, conversas: 0.07, leads: 0.05,
  agendamientos: 0.15, propuestas: 0.20, vendas: 0.30, sla_segundos: 0.15,
};

// PL normaliza cada métrica pelo melhor do equipo (max p/ maior-melhor; min p/ SLA).
export function calcProductividadLiquida(rows: RankingMetricasRow[], r: RankingMetricasRow): number {
  const keys = Object.keys(PL_PESOS);
  const mejor: Record<string, number> = {};
  for (const k of keys) {
    if (k === "sla_segundos") {
      const vals = rows.map((x) => (x.sla_segundos ?? 0)).filter((v) => v > 0);
      mejor[k] = vals.length ? Math.min(...vals) : 0;
    } else {
      mejor[k] = rows.reduce((mx, x) => Math.max(mx, (x[k as keyof RankingMetricasRow] ?? 0) as number), 0);
    }
  }
  let pl = 0;
  for (const k of keys) {
    const valor = (r[k as keyof RankingMetricasRow] ?? 0) as number;
    if (mejor[k] <= 0) continue;
    if (k === "sla_segundos") {
      pl += PL_PESOS[k] * Math.max(0, 1 - valor / mejor[k]) * 100;
    } else {
      pl += PL_PESOS[k] * (valor / mejor[k]) * 100;
    }
  }
  return Math.round(pl * 10) / 10;
}

export const PERIODOS: { dias: number | null; label: string }[] = [
  { dias: 1, label: "Hoy" },
  { dias: 7, label: "7 días" },
  { dias: 30, label: "30 días" },
  { dias: 90, label: "90 días" },
  { dias: null, label: "Todo" },
];

export function fmtMetrica(key: RankingMetricaKey, v: number) {
  if (key === "sla_segundos") return fmtSla(v);
  return fmtNum(v);
}
