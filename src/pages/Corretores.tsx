import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAgents } from "@/hooks/use-agents";
import { usePerformanceDashboard, RankingMetricasRow } from "@/hooks/use-performance-dashboard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  calcProductividadLiquida,
  fmtMetrica,
  fmtNum,
  fmtSla,
  PERIODOS,
  PL_KEY,
  RANKING_METRICAS,
  RankingMetricaKey,
} from "@/lib/performance-ranking";

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

export default function Corretores() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { fetchRankingMetricas } = usePerformanceDashboard();

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

  // Fusiona el ranking real del RPC con la lista COMPLETA de corretores do tenant,
  // para que ningún usuário quede fuera (los que están a 0 aparecen igualmente).
  const rowsCompletas: RankingMetricasRow[] = (() => {
    const porId = new Map(rankingData.map((r) => [r.agent_id, r]));
    const completas = agents.map((a) => {
      const existente = porId.get(a.id);
      if (existente) return existente;
      return {
        agent_id: a.id,
        agente: a.full_name,
        interacciones: 0, conversas: 0, leads: 0, agendamientos: 0,
        propuestas: 0, vendas: 0, sla_segundos: 0,
      } as RankingMetricasRow;
    });
    // Agrega posibles filas del RPC que no estén en profiles (fallback safety)
    return completas;
  })();

  const rankingOrdenado = [...rowsCompletas].sort((a, b) => {
    if (rankingMetrica === PL_KEY) {
      return calcProductividadLiquida(rowsCompletas, b) - calcProductividadLiquida(rowsCompletas, a);
    }
    const av = a[rankingMetrica] ?? 0;
    const bv = b[rankingMetrica] ?? 0;
    if (rankingMetrica === "sla_segundos") return (av === 0 ? 1e15 : av) - (bv === 0 ? 1e15 : bv);
    return (bv ?? 0) - (av ?? 0);
  });

  const avatarDe = (id: string) => agents.find((a) => a.id === id);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="corretores"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="corretores"
        onModuleChange={() => {}}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />

      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <Header
          title="Performance de Corretores"
          subtitle="Ranking e eficiência de corretores em tempo real"
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="space-y-6 p-4 lg:p-6">
          <section className="mt-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">🏆 Ranking de Corretores</h2>
              <BadgeCount total={rankingOrdenado.length} />
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

            {/* Selector de métrica */}
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
              {(rankingLoading || agentsLoading) && rankingOrdenado.length === 0 && (
                <div className="rounded-xl border border-border/40 bg-card/60 p-6 text-muted-foreground">Carregando ranking…</div>
              )}
              {!rankingLoading && !agentsLoading && rankingOrdenado.length === 0 && (
                <div className="rounded-xl border border-border/40 bg-card/60 p-6 text-muted-foreground">Sem dados no período selecionado.</div>
              )}
              {rankingOrdenado.map((r, i) => {
                const esPL = rankingMetrica === PL_KEY;
                const valor = esPL ? calcProductividadLiquida(rowsCompletas, r) : (r[rankingMetrica] ?? 0);
                const maxV = esPL
                  ? rankingOrdenado.reduce((mx, x) => Math.max(mx, calcProductividadLiquida(rowsCompletas, x)), 0)
                  : rankingOrdenado.reduce((mx, x) => {
                      const v = x[rankingMetrica] ?? 0;
                      return rankingMetrica === "sla_segundos" ? (v > 0 && (mx === 0 || v < mx) ? v : mx) : Math.max(mx, v);
                    }, 0);
                const pct = rankingMetrica === "sla_segundos"
                  ? (valor > 0 && maxV > 0 ? Math.max(6, 100 - (valor / maxV) * 100) : 6)
                  : Math.max(6, maxV > 0 ? (valor / maxV) * 100 : 6);
                const medalla = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`;
                const avatar = avatarDe(r.agent_id);
                return (
                  <div key={r.agent_id} className="rounded-xl border border-border/40 bg-card/60 backdrop-blur p-4 shadow-lg">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {avatar?.avatar_url ? (
                            <AvatarImage src={avatar.avatar_url} alt={r.agente} className="object-cover" />
                          ) : null}
                          <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(r.agente)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{r.agente}</p>
                          <p className="text-xs text-muted-foreground">
                            💬 {fmtNum(r.interacciones)} · 🗨️ {fmtNum(r.conversas)} · 🧲 {fmtNum(r.leads)} · 📅 {fmtNum(r.agendamientos)} · 📄 {fmtNum(r.propuestas)} · 💰 {fmtNum(r.vendas)} · ⏱️ {fmtSla(r.sla_segundos ?? 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                          {medalla}
                        </span>
                        <span className="font-mono text-lg font-bold text-accent">{fmtMetrica(rankingMetrica, valor)}</span>
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted/60">
                      <div className="h-2 rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function BadgeCount({ total }: { total: number }) {
  return (
    <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs text-muted-foreground">
      {total} corretores
    </span>
  );
}
