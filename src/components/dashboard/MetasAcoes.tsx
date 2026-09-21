import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CorretorMetaRow,
  MetasGlobalRow,
  MetasValores,
  RankingMetricasRow,
  META_DEFAULTS,
} from "@/hooks/use-performance-dashboard";

// Metas de ações: apenas os 4 campos definidos pelo Comandante.
type MetaKey = keyof MetasValores;
const METAS_CFG: { key: MetaKey; label: string; metricKey: keyof RankingMetricasRow; icono: string; hint: string }[] = [
  { key: "meta_leads", label: "Leads", metricKey: "leads", icono: "🧲", hint: "captação de leads" },
  { key: "meta_reunioes", label: "Reuniões", metricKey: "agendamientos", icono: "📅", hint: "agendamento/visitas" },
  { key: "meta_propostas", label: "Propostas", metricKey: "propuestas", icono: "📄", hint: "propostas enviadas" },
  { key: "meta_fechamentos", label: "Fechamentos", metricKey: "vendas", icono: "💰", hint: "vendas concluídas" },
];

const fmt = (n: number) => Math.round(n).toLocaleString("es-ES");
const estadoCor = (pct: number | null) =>
  pct === null
    ? "text-muted-foreground"
    : pct >= 100
      ? "text-emerald-500"
      : pct >= 70
        ? "text-amber-500"
        : "text-destructive";

// Card editável reutilizável (clicar valor entra em edição, Salvar persiste).
function MetaCard({
  label, icono, hint, meta, onChange, onSave, excl,
}: {
  label: string; icono: string; hint: string;
  meta: number; onChange: (v: number) => void; onSave: () => void;
  excl: boolean;
}) {
  return (
    <div className={cn("rounded-lg border bg-card/60 p-2.5", excl ? "border-accent/50" : "border-border/30")}>
      <p className="text-[11px] font-medium text-muted-foreground">{icono} {label} {excl && <span className="text-accent" title="exceção deste corretor">*</span>}</p>
      <input
        type="number"
        min={0}
        value={meta}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        onBlur={onSave}
        onKeyDown={(e) => (e.key === "Enter" ? (e.target as HTMLInputElement).blur() : null)}
        className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <p className="mt-0.5 text-[10px] text-muted-foreground">({hint})</p>
    </div>
  );
}

export default function MetasAcoes({
  corretores,
  tenantId,
  loadGlobal,
  saveGlobal,
  loadMetas,
  saveMeta,
}: {
  corretores: RankingMetricasRow[];
  tenantId: string;
  loadGlobal: () => Promise<MetasGlobalRow>;
  saveGlobal: (tenant_id: string, m: MetasValores) => Promise<void>;
  loadMetas: () => Promise<CorretorMetaRow[]>;
  saveMeta: (agent_id: string, tenant_id: string, m: MetasValores | null) => Promise<void>;
}) {
  const [global, setGlobal] = useState<MetasGlobalRow>({ meta_leads: 0, meta_reunioes: 0, meta_propostas: 0, meta_fechamentos: 0 });
  const [excecoes, setExcecoes] = useState<Record<string, CorretorMetaRow>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [g, ex] = await Promise.all([loadGlobal(), loadMetas()]);
        if (!active) return;
        setGlobal(g);
        const map: Record<string, CorretorMetaRow> = {};
        for (const r of ex) map[r.agent_id] = r;
        setExcecoes(map);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { active = false; };
  }, [loadGlobal, loadMetas]);

  // Meta efetiva de um corretor: exceção ?? global.
  const metaEfetiva = (agent_id: string) => {
    const ex = excecoes[agent_id];
    return {
      values: {
        meta_leads: ex?.meta_leads ?? global.meta_leads,
        meta_reunioes: ex?.meta_reunioes ?? global.meta_reunioes,
        meta_propostas: ex?.meta_propostas ?? global.meta_propostas,
        meta_fechamentos: ex?.meta_fechamentos ?? global.meta_fechamentos,
      } as MetasValores,
      temExcecao: !!ex,
    };
  };

  const pct = (byAgent: RankingMetricasRow, key: MetaKey) => {
    const m = metaEfetiva(byAgent.agent_id).values[key];
    if (m <= 0) return null;
    const real = (byAgent[METAS_CFG.find((c) => c.key === key)!.metricKey] ?? 0) as number;
    return Math.round((real / m) * 1000) / 10;
  };

  const guardarGlobal = async () => {
    setSaving(true); setError(null);
    try {
      await saveGlobal(tenantId, global);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setSaving(false); }
  };

  const guardarExcecao = async (agent_id: string) => {
    setSaving(true); setError(null);
    try {
      const ex = excecoes[agent_id];
      await saveMeta(agent_id, tenantId, {
        meta_leads: ex?.meta_leads ?? global.meta_leads,
        meta_reunioes: ex?.meta_reunioes ?? global.meta_reunioes,
        meta_propostas: ex?.meta_propostas ?? global.meta_propostas,
        meta_fechamentos: ex?.meta_fechamentos ?? global.meta_fechamentos,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setSaving(false); }
  };

  const removerExcecao = async (agent_id: string) => {
    setSaving(true); setError(null);
    try {
      await saveMeta(agent_id, tenantId, null);
      setExcecoes((p) => {
        const n = { ...p }; delete n[agent_id]; return n;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setSaving(false); }
  };

  // Contador geral de metas atingidas no período considerando a meta efetiva.
  const total = useMemo(() => {
    let ok = 0, def = 0;
    for (const c of corretores) {
      for (const cfg of METAS_CFG) {
        const m = metaEfetiva(c.agent_id).values[cfg.key];
        if (m <= 0) continue;
        def++;
        if ((c[cfg.metricKey] ?? 0) as number >= m) ok++;
      }
    }
    return def ? { ok, def } : null;
  }, [corretores, global, excecoes]);

  const setGlobalV = (key: MetaKey, v: number) =>
    setGlobal((g) => ({ ...g, [key]: v }));
  const setExV = (agent_id: string, key: MetaKey, v: number) =>
    setExcecoes((p) => ({
      ...p,
      [agent_id]: {
        agent_id,
        meta_leads: (p[agent_id]?.meta_leads ?? global.meta_leads),
        meta_reunioes: (p[agent_id]?.meta_reunioes ?? global.meta_reunioes),
        meta_propostas: (p[agent_id]?.meta_propostas ?? global.meta_propostas),
        meta_fechamentos: (p[agent_id]?.meta_fechamentos ?? global.meta_fechamentos),
        [key]: v,
      } as CorretorMetaRow,
    }));

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">🎯 Metas de Ações por Corretor</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {total && (
            <span className="font-mono font-bold text-accent">{total.ok}</span>
          )}
          <span>{total ? `/${total.def}` : ""} metas atingidas</span>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Meta global (vale para todos) com exceção por corretor nos 4 campos
        (leads, reuniões=agendamento/visitas, propostas, fechamentos=vendas).
        O % mostra quanto o corretor atingiu da sua meta no período selecionado.
      </p>

      {error && <p className="mt-2 rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">{error}</p>}

      {/* Meta GLOBAL — padrão para todos */}
      <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">🌍 Meta Global (todos os corretores)</span>
          <button
            onClick={guardarGlobal}
            disabled={saving}
            className="rounded-lg px-2.5 py-1 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar global"}
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {METAS_CFG.map((cfg) => (
            <MetaCard
              key={cfg.key}
              label={cfg.label} icono={cfg.icono} hint={cfg.hint}
              meta={global[cfg.key] ?? 0}
              onChange={(v) => setGlobalV(cfg.key, v)}
              onSave={guardarGlobal}
              excl={false}
            />
          ))}
        </div>
      </div>

      {/* Por corretor — utiliza a meta efetiva (global ou exceção) */}
      <div className="mt-3 space-y-2">
        {corretores.length === 0 && (
          <p className="text-xs text-muted-foreground">Sem corretores no período selecionado.</p>
        )}
        {corretores.map((c) => {
          const ef = metaEfetiva(c.agent_id);
          return (
            <div key={c.agent_id} className="rounded-lg border border-border/40 bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {c.agente}
                  {ef.temExcecao && <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">exceção</span>}
                </span>
                <div className="flex items-center gap-2">
                  {ef.temExcecao && (
                    <button
                      onClick={() => removerExcecao(c.agent_id)}
                      disabled={saving}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive disabled:opacity-50"
                      title="Usar a meta global e remover a exceção"
                    >
                      Usar global
                    </button>
                  )}
                  {!ef.temExcecao && (
                    <button
                      onClick={() => guardarExcecao(c.agent_id)}
                      disabled={saving}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
                      title="Criar exceção de meta só para este corretor"
                    >
                      + Exceção
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
                {METAS_CFG.map((cfg) => {
                  const m = ef.values[cfg.key];
                  const real = (c[cfg.metricKey] ?? 0) as number;
                  const p = pct(c, cfg.key);
                  const width = p === null ? 0 : Math.min(100, p);
                  return (
                    <div key={cfg.key} className="rounded-lg border border-border/30 bg-card/60 p-2.5">
                      <p className="text-[11px] font-medium text-muted-foreground">{cfg.icono} {cfg.label}</p>
                      <p className="mt-1 font-mono text-sm text-foreground">
                        <span className="text-accent">{real === 0 ? "0" : fmt(real)}</span>
                        <span className="text-muted-foreground"> / {m > 0 ? fmt(m) : "—"}</span>
                      </p>
                      {p !== null && (
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted/60">
                          <div
                            className={cn("h-1.5 rounded-full", p >= 100 ? "bg-emerald-500" : p >= 70 ? "bg-amber-500" : "bg-destructive")}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      )}
                      <p className={cn("mt-1 text-right text-[11px] font-semibold font-mono", estadoCor(p))}>
                        {p === null ? "—" : `${fmt(p)}%`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">({cfg.hint})</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}