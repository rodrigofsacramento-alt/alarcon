import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CorretorMetaRow,
  RankingMetricasRow,
} from "@/hooks/use-performance-dashboard";

// Metas de ações: apenas os 4 campos definidos pelo Comandante.
type MetaKey = "meta_leads" | "meta_reunioes" | "meta_propostas" | "meta_fechamentos";
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

export default function MetasAcoes({
  corretores,
  tenantId,
  loadMetas,
  saveMeta,
}: {
  corretores: RankingMetricasRow[];
  tenantId: string;
  loadMetas: () => Promise<CorretorMetaRow[]>;
  saveMeta: (agent_id: string, tenant_id: string, m: Omit<CorretorMetaRow, "agent_id" | "tenant_id">) => Promise<void>;
}) {
  const [metas, setMetas] = useState<Record<string, Partial<CorretorMetaRow>>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<CorretorMetaRow>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadMetas()
      .then((rows) => {
        if (!active) return;
        const map: Record<string, Partial<CorretorMetaRow>> = {};
        for (const r of rows) map[r.agent_id] = r;
        setMetas(map);
      })
      .catch(() => setError("Não foi possível carregar as metas."));
    return () => { active = false; };
  }, [loadMetas]);

  const metasPorAgente = useMemo(() => metas, [metas]);

  const metaDe = (agent_id: string, key: MetaKey) =>
    (metasPorAgente[agent_id]?.[key] ?? 0) as number;

  // Porcentagem de atingimento: real/meta. Se meta=0 → null (sem meta definida).
  const pct = (byAgent: RankingMetricasRow, key: MetaKey) => {
    const m = metaDe(byAgent.agent_id, key);
    if (m <= 0) return null;
    const real = (byAgent[METAS_CFG.find((c) => c.key === key)!.metricKey] ?? 0) as number;
    return Math.round((real / m) * 1000) / 10;
  };

  const totalAtingidas = () => {
    let ok = 0, def = 0;
    for (const c of corretores) {
      for (const cfg of METAS_CFG) {
        const m = metaDe(c.agent_id, cfg.key);
        if (m <= 0) continue;
        def++;
        const real = (c[cfg.metricKey] ?? 0) as number;
        if (real >= m) ok++;
      }
    }
    return def ? { ok, def } : null;
  };

  const iniciarEdicao = (agent_id: string) => {
    setEditId(agent_id);
    setDraft({
      meta_leads: metaDe(agent_id, "meta_leads"),
      meta_reunioes: metaDe(agent_id, "meta_reunioes"),
      meta_propostas: metaDe(agent_id, "meta_propostas"),
      meta_fechamentos: metaDe(agent_id, "meta_fechamentos"),
    });
    setError(null);
  };

  const salvar = async (agent_id: string) => {
    setSaving(true); setError(null);
    try {
      await saveMeta(agent_id, tenantId, {
        meta_leads: Math.max(0, Number(draft.meta_leads) || 0),
        meta_reunioes: Math.max(0, Number(draft.meta_reunioes) || 0),
        meta_propostas: Math.max(0, Number(draft.meta_propostas) || 0),
        meta_fechamentos: Math.max(0, Number(draft.meta_fechamentos) || 0),
      });
      setMetas((prev) => ({ ...prev, [agent_id]: { ...draft } }));
      setEditId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const tot = totalAtingidas();

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">🎯 Metas de Ações por Corretor</h3>
        {tot && (
          <span className="text-xs text-muted-foreground">
            <span className="font-mono font-bold text-accent">{tot.ok}</span>/{tot.def} metas atingidas
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Defina a meta de cada corretor nos 4 campos (leads, reuniões=agendamento/visitas, propostas, fechamentos=vendas).
        O % mostra quanto o corretor atingiu da sua meta no período selecionado.
      </p>

      {error && <p className="mt-2 rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">{error}</p>}

      <div className="mt-3 space-y-2">
        {corretores.length === 0 && (
          <p className="text-xs text-muted-foreground">Sem corretores no período selecionado.</p>
        )}
        {corretores.map((c) => {
          const editando = editId === c.agent_id;
          return (
            <div key={c.agent_id} className="rounded-lg border border-border/40 bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{c.agente}</span>
                <button
                  onClick={() => (editando ? salvar(c.agent_id) : iniciarEdicao(c.agent_id))}
                  disabled={saving}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {editando ? (saving ? "Salvando…" : "Salvar") : "Definir meta"}
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
                {METAS_CFG.map((cfg) => {
                  const m = metaDe(c.agent_id, cfg.key);
                  const real = (c[cfg.metricKey] ?? 0) as number;
                  const p = pct(c, cfg.key);
                  const width = p === null ? 0 : Math.min(100, p);
                  return (
                    <div key={cfg.key} className="rounded-lg bg-card/60 p-2.5 border border-border/30">
                      <p className="text-[11px] font-medium text-muted-foreground">{cfg.icono} {cfg.label}</p>
                      {editando ? (
                        <input
                          type="number"
                          min={0}
                          value={draft[cfg.key] as number ?? 0}
                          onChange={(e) => setDraft((d) => ({ ...d, [cfg.key]: Number(e.target.value) }))}
                          className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      ) : (
                        <p className="mt-1 font-mono text-sm text-foreground">
                          <span className="text-accent">{real === 0 ? "0" : fmt(real)}</span>
                          <span className="text-muted-foreground"> / {m > 0 ? fmt(m) : "—"}</span>
                        </p>
                      )}
                      {!editando && p !== null && (
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted/60">
                          <div
                            className={cn("h-1.5 rounded-full", p >= 100 ? "bg-emerald-500" : p >= 70 ? "bg-amber-500" : "bg-destructive")}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      )}
                      {!editando && (
                        <p className={cn("mt-1 text-right text-[11px] font-semibold font-mono", estadoCor(p))}>
                          {p === null ? "—" : `${fmt(p)}%`}
                        </p>
                      )}
                      {!editando && <p className="text-[10px] text-muted-foreground">({cfg.hint})</p>}
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