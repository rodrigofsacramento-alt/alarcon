import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { usePerformanceDashboard, PerformanceDashboardData, LineaRow, RankingMetricasRow } from "@/hooks/use-performance-dashboard";
import MetasAcoes from "@/components/dashboard/MetasAcoes";
import { useAuth } from "@/contexts/AuthContext";

// ---- Utilidades de formato ----
const fmtSla = (segundos: number) => {
  if (!segundos || segundos <= 0) return "—";
  if (segundos < 60) return `${Math.round(segundos)}s`;
  if (segundos < 3600) return `${Math.round(segundos / 60)}min`;
  const h = segundos / 3600;
  if (h < 24) return `${Math.round(h * 10) / 10}h`;
  return `${Math.round(h / 24 * 10) / 10}d`;
};
const fmtNum = (n: number | undefined) => (n ?? 0).toLocaleString("es-ES");

// ---- Etapas del funil (13 reales, orden de conversión) ----
const FUNNEL_STAGES = [
  "Contato Cadastrado",
  "Primeiro Atendimento",
  "Qualificado",
  "Follow Up",
  "Buscar Imóveis",
  "Agendamento Visita/Reunião",
  "Visita/Reunião Agendada",
  "Match Pronto",
  "Apresentar Imóveis",
  "Imóvel Escolhido",
  "Proposta Solicitada",
  "Vendido",
];

const STAGE_COLORS = [
  "hsl(218, 70%, 55%)",
  "hsl(200, 70%, 52%)",
  "hsl(190, 85%, 55%)",
  "hsl(170, 80%, 45%)",
  "hsl(150, 70%, 42%)",
  "hsl(45, 90%, 55%)",
  "hsl(35, 90%, 52%)",
  "hsl(25, 95%, 50%)",
  "hsl(15, 90%, 52%)",
  "hsl(350, 85%, 52%)",
  "hsl(320, 85%, 55%)",
  "hsl(280, 80%, 58%)",
];

// ---- Métricas del Ranking dinámico (7) ----
type RankingMetricaKey = keyof Omit<RankingMetricasRow, "agent_id" | "agente">;
const PL_KEY: RankingMetricaKey = "productividad_liquida" as RankingMetricaKey;
const RANKING_METRICAS: { key: RankingMetricaKey; label: string; icono: string; sla?: true; pl?: true }[] = [
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
const PL_PESOS: Record<string, number> = {
  interacciones: 0.08, conversas: 0.07, leads: 0.05,
  agendamientos: 0.15, propuestas: 0.20, vendas: 0.30, sla_segundos: 0.15,
};

// PL normaliza cada métrica pelo mejor do equipo (max for mayor-mejor; min for SLA).
function calcProductividadLiquida(rows: RankingMetricasRow[], r: RankingMetricasRow): number {
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
      // menor SLA → maior puntuación (relativo a la mediana no; relativo al mejor min)
      pl += PL_PESOS[k] * Math.max(0, 1 - (valor / mejor[k])) * 100;
    } else {
      pl += PL_PESOS[k] * (valor / mejor[k]) * 100;
    }
  }
  return Math.round(pl * 10) / 10;
}

const PERIODOS: { dias: number | null; label: string }[] = [
  { dias: 1, label: "Hoy" },
  { dias: 7, label: "7 días" },
  { dias: 30, label: "30 días" },
  { dias: 90, label: "90 días" },
  { dias: null, label: "Todo" },
];

const fmtMetrica = (key: string, v: number) => {
  if (key === "sla_segundos") return fmtSla(v);
  return fmtNum(v);
};

export default function DashboardPerformance() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data, state, error, refresh, fetchLinea, fetchRankingMetricas, fetchMetas, upsertMeta } = usePerformanceDashboard();
  const { profile } = useAuth();
  const [linIni, setLinIni] = useState<Date>(() => new Date(Date.now() - 30 * 86400000));
  const [selectedLíneaAgentes, setSelectedLíneaAgentes] = useState<string[]>([]);
  const [selectedLíneaStages, setSelectedLíneaStages] = useState<string[]>(["Agendamento Visita/Reunião", "Proposta Solicitada", "Vendido"]);
  const [lineaData, setLineaData] = useState<LineaRow[]>([]);

  // ---- Ranking dinámico ----
  const [rankingMetrica, setRankingMetrica] = useState<RankingMetricaKey>("interacciones");
  const [rankingPeriodo, setRankingPeriodo] = useState<number | null>(30);
  const [rankingData, setRankingData] = useState<RankingMetricasRow[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  useEffect(() => {
    setRankingLoading(true);
    const fIni = rankingPeriodo === null ? new Date(Date.now() - 3650 * 86400000) : new Date(Date.now() - rankingPeriodo * 86400000);
    void fetchRankingMetricas(fIni, new Date())
      .then((rows) => setRankingData(rows.sort((a, b) => (b.interacciones ?? 0) - (a.interacciones ?? 0))))
      .catch(() => setRankingData([]))
      .finally(() => setRankingLoading(false));
  }, [rankingPeriodo, fetchRankingMetricas]);

  const rankingOrdenado = [...rankingData].sort((a, b) => {
    // Produtividade Líquida: própria pontuación compilada (mayor = mejor)
    if (rankingMetrica === PL_KEY) {
      return calcProductividadLiquida(rankingData, b) - calcProductividadLiquida(rankingData, a);
    }
    const av = a[rankingMetrica] ?? 0;
    const bv = b[rankingMetrica] ?? 0;
    // SLA: menor = mejor
    if (rankingMetrica === "sla_segundos") return (av === 0 ? 1e15 : av) - (bv === 0 ? 1e15 : bv);
    return (bv ?? 0) - (av ?? 0);
  });

  // Cargar gráfico de línea cuando haya agentes seleccionados
  useEffect(() => {
    if (!selectedLíneaAgentes.length) {
      setLineaData([]);
      return;
    }
    void fetchLinea(selectedLíneaAgentes, selectedLíneaStages, linIni, new Date()).then(setLineaData).catch(() => setLineaData([]));
  }, [selectedLíneaAgentes, selectedLíneaStages, linIni, fetchLinea]);

  // Agentes disponibles (desde el esforço)
  const agentes = [...new Set(data.esfuerzo.map((e) => e.agente))].filter(Boolean).sort();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="dashboard"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="dashboard"
        onModuleChange={() => {}}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />

      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <Header
          title="Dashboard de Performance"
          subtitle="Ranking e eficiencia de corretores · esforço, funil e SLA en tempo real"
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
      {state === "error" && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive-foreground">
          Erro ao cargar dados: {error}
          <button onClick={() => void refresh()} className="ml-2 underline">Reintentar</button>
        </div>
      )}

      {/* ---- PROTÓCOLO 3: RANKING / LEADERBOARD DINÁMICO ---- */}
      <section className="mt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">🏆 Ranking de Corretores</h2>
        </div>

        {/* Selector de período */}
        <div className="mt-2 flex flex-wrap gap-1.5 rounded-xl bg-muted/40 p-1">
          {PERIODOS.map((p) => (
            <button
              key={p.label}
              onClick={() => setRankingPeriodo(p.dias)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                rankingPeriodo === p.dias ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Selector de métrica (7 alternantes) */}
        <div className="mt-2 flex flex-wrap gap-1.5 rounded-xl bg-muted/40 p-1">
          {RANKING_METRICAS.map((m) => (
            <button
              key={m.key}
              onClick={() => setRankingMetrica(m.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                rankingMetrica === m.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              <span className="mr-1">{m.icono}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* Leaderboard ordenado por la métrica activa */}
        <div className="mt-3 grid gap-3">
          {rankingLoading && rankingData.length === 0 && (
            <div className="rounded-xl border border-border/40 bg-card/60 p-6 text-muted-foreground">Cargando ranking…</div>
          )}
          {!rankingLoading && rankingOrdenado.length === 0 && (
            <div className="rounded-xl border border-border/40 bg-card/60 p-6 text-muted-foreground">Sem datos no período seleccionado.</div>
          )}
          {rankingOrdenado.slice(0, 8).map((r, i) => {
            const esPL = rankingMetrica === PL_KEY;
            const valor = esPL ? calcProductividadLiquida(rankingData, r) : (r[rankingMetrica] ?? 0);
            const maxV = esPL
              ? rankingOrdenado.slice(0, 8).reduce((mx, x) => Math.max(mx, calcProductividadLiquida(rankingData, x)), 0)
              : rankingOrdenado.slice(0, 8).reduce((mx, x) => {
              const v = x[rankingMetrica] ?? 0;
              return rankingMetrica === "sla_segundos" ? (v > 0 && (mx === 0 || v < mx) ? v : mx) : Math.max(mx, v);
            }, 0);
            const pct = rankingMetrica === "sla_segundos"
              ? (valor > 0 && maxV > 0 ? Math.max(6, 100 - (valor / maxV) * 100) : 6)
              : Math.max(6, maxV > 0 ? (valor / maxV) * 100 : 6);
            const medalla = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`;
            return (
              <div key={r.agent_id} className="rounded-xl border border-border/40 bg-card/60 backdrop-blur p-4 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {medalla}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{r.agente}</p>
                      <p className="text-xs text-muted-foreground">
                        💬 {fmtNum(r.interacciones)} · 🗨️ {fmtNum(r.conversas)} · 🧲 {fmtNum(r.leads)} · 📅 {fmtNum(r.agendamientos)} · 📄 {fmtNum(r.propuestas)} · 💰 {fmtNum(r.vendas)} · ⏱️ {fmtSla(r.sla_segundos ?? 0)}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-lg font-bold text-accent">{fmtMetrica(rankingMetrica, valor)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted/60">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- METAS DE AÇÕES por Corretor (configurable, período del ranking) ---- */}
      <section className="mt-8">
        <MetasAcoes
          corretores={rankingData}
          tenantId={profile?.tenant_id ?? ""}
          loadMetas={fetchMetas}
          saveMeta={upsertMeta}
        />
      </section>

      {/* ---- PROTÓCOLO 2.1: FUNIL + SLA ---- */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">🔻 Funil de Conversión &amp; SLA</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {/* Funil en cascada (con porcen­taje de conversión entre etapas) */}
          <div className="rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur shadow-lg">
            <h3 className="text-sm font-semibold text-muted-foreground">Funil por Etapa</h3>
            <div className="mt-2 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funilData(data)} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(218, 15%, 28%)" />
                  <XAxis type="number" tick={{ fill: "hsl(218, 25%, 70%)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="stage" width={120} tick={{ fill: "hsl(218, 25%, 72%)", fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: "hsl(218, 15%, 22%)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0];
                      const row = funilData(data)[item.index];
                      return (
                        <div className="rounded-lg border border-border/50 bg-background p-2 text-xs shadow-xl">
                          <p className="font-medium">{row?.stage}</p>
                          <p className="font-mono">{fmtNum(row?.conversas)} conversas · %{(row?.pct * 100).toFixed(1)}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="conversas" fill={{ color: "hsl(218, 70%, 55%)", opacity: 0.9 }} radius={4} maxBarSize={18}>
                    <Cell fill={{ color: "hsl(218, 70%, 55%)", opacity: 0.9 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">% = conversão desde el estágio inmediatamente anterior</p>
          </div>

          {/* Panel SLA adyacente (individual y equipo) */}
          <div className="rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur shadow-lg">
            <h3 className="text-sm font-semibold text-muted-foreground">⏱ SLA Médio de Respuesta</h3>
            <p className="text-xs text-muted-foreground">Tempo (lead → resposta do corretor)</p>
            <div className="mt-3 space-y-2">
              {data.sla.slice(0, 10).map((s) => (
                <div key={s.agent_id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-foreground">{s.agente}</span>
                  <span className="font-mono text-sm text-accent">{fmtSla(s.sla_segundos)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-3">
              <p className="text-xs text-muted-foreground">SLA Equipe (promedio)</p>
              <p className="font-mono text-2xl font-bold text-accent">
                {fmtSla(teamSlaSeconds(data.sla))}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- PROTÓCOLO 2.2: LÍNEA TEMPORAL COMPARATIVA ---- */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">📈 Evolución Temporal Comparativa</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground">Corretores:</span>
          {agentes.slice(0, 12).map((a) => (
            <button
              key={a}
              onClick={() => setSelectedLíneaAgentes((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]).slice(0, 3))}
              className={`rounded-full border px-3 py-1 text-xs ${selectedLíneaAgentes.includes(a) ? "bg-primary/25 text-primary" : "border-border text-muted-foreground"}`}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground">Etapas:</span>
          {FUNNEL_STAGES.slice(0, 12).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedLíneaStages((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]).slice(0, 3))}
              className={`rounded-full border px-3 py-1 text-xs ${selectedLíneaStages.includes(s) ? "bg-accent/25 text-accent-foreground" : "border-border text-muted-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur shadow-lg">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={linePoints(lineaData)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(218, 15%, 28%)" />
                <XAxis dataKey="bucket" tick={{ fill: "hsl(218, 25%, 70%)", fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fill: "hsl(218, 25%, 70%)", fontSize: 11 }} />
                <Tooltip cursor={{ stroke: "hsl(218, 40%, 60%)" }} />
                <Legend />
                {lineSeries(lineaData)}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {!selectedLíneaAgentes.length && (
            <p className="mt-2 text-center text-xs text-muted-foreground">Seleciona até 3 corretores para comparar (3º máximo).</p>
          )}
        </div>
      </section>

      {/* ---- PROTÓCOLO 2.3: PIZZA / DONUT POR ETAPA ---- */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">🍩 Distribución de Esforço por Etapa</h2>
        <DonutSection data={data} />
      </section>
        </main>
      </div>
    </div>
  );
}

// ---- helpers gráficos ----
function funilData(data: PerformanceDashboardData) {
  // Orden del funil de abajo-arriba (cascada vertical: base abajo, tope arriba)
  const rows = FUNNEL_STAGES
    .map((stage) => ({
      stage,
      conversas: data.funil.filter((f) => f.stage === stage).reduce((acc, f) => acc + f.conversas, 0),
      pct: 0,
    }))
    .filter((r) => r.conversas > 0)
    .reverse();
  for (let i = 0; i < rows.length; i++) {
    if (i === 0) rows[i].pct = 1;
    else if (rows[i - 1].conversas > 0) rows[i].pct = Math.min(1, rows[i].conversas / rows[i - 1].conversas);
  }
  return rows;
}

function teamSlaSeconds(sla: { sla_segundos: number; n_respuestas: number }[]) {
  const tot = sla.reduce((a, s) => ({ w: a.w + s.sla_segundos * s.n_respuestas, n: a.n + s.n_respuestas }), { w: 0, n: 0 });
  return tot.n ? tot.w / tot.n : 0;
}

function linePoints(rows: LineaRow[]) {
  const buckets = [...new Set(rows.map((r) => r.bucket))].sort();
  const series: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const key = `${r.agente} · ${r.stage}`;
    series[key] ??= {};
    series[key][r.bucket] = r.total;
  }
  return buckets.map((b) => {
    const point: Record<string, string | number> = { bucket: b.slice(5) };
    for (const key of Object.keys(series)) point[key] = series[key][b] ?? 0;
    return point;
  });
}

function lineSeries(rows: LineaRow[]) {
  const keys = [...new Set(rows.map((r) => `${r.agente} · ${r.stage}`))].slice(0, 9);
  return keys.map((k, i) => (
    <Line
      key={k}
      type="monotone"
      dataKey={k}
      name={k}
      stroke={`hsl(${(i * 47 + 218) % 360}, 75%, 55%)`}
      strokeWidth={2}
      dot={false}
    />
  ));
}

function DonutSection({ data }: { data: PerformanceDashboardData }) {
  const [stage, setStage] = useState<string>("Proposta Solicitada");
  // esforço por agente dentro del estágio seleccionado (desde ranking de interações)
  const interactPorAgente = new Map<string, number>();
  for (const e of data.esfuerzo) {
    interactPorAgente.set(e.agente, (interactPorAgente.get(e.agente) ?? 0) + e.interacciones);
  }
  const sorted = [...interactPorAgente.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = sorted.reduce((a, x) => a + x[1], 0);

  return (
    <div className="mt-4 rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur shadow-lg">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Etapa:</span>
        {FUNNEL_STAGES.map((s) => (
          <button key={s} onClick={() => setStage(s)} className={`rounded-full border px-3 py-1 text-xs ${stage === s ? "bg-accent/25 text-accent-foreground" : "border-border text-muted-foreground"}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sorted.map(([name, value], i) => ({ name, value, color: STAGE_COLORS[i % STAGE_COLORS.length] }))}
                dataKey="value"
                nameKey="name"
                label={({ name, value, percent }) => `${name} ${percent}%`}
                labelLine={{ stroke: "hsl(218, 15%, 45%)", strokeWidth: 1 }}
                innerRadius="58%"
                outerRadius="85%"
              >
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  return (
                    <div className="rounded-lg border border-border/50 bg-background p-2 text-xs shadow-xl">
                      <p className="font-medium">{item.name}</p>
                      <p className="font-mono">{fmtNum(item.value)} interações · %{(item.percent * 100).toFixed(1)}</p>
                    </div>
                  );
                }} />
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Esforço total en «{stage}»: <span className="font-mono text-foreground">{fmtNum(total)}</span> interações</p>
          {sorted.map(([name, value], i) => {
            const color = STAGE_COLORS[i % STAGE_COLORS.length];
            const pct = total ? (value / total) * 100 : 0;
            return (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
                  <span className="text-sm text-foreground">{name}</span>
                </div>
                <span className="font-mono text-sm text-foreground">{fmtNum(value)} · %{pct.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}