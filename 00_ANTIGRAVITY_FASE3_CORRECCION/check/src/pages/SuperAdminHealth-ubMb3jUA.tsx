/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminHealth-ubMb3jUA.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { u as O, r as x } from "@/components/vendor-Jm1Lk";
import { d as W, K as I, a as K, f as Z, S as G } from "@/components/SuperAdminLayout";
import { S as J, c as t, e as o, b as j, d as p, f as b, a as k } from "@/components/index";
import { bx as _, aP as S, L as Q, v as M, u as C, g as E, T as U, r as X, l as A, a as P, m as Y, bf as ee, aZ as se, by as te } from "@/components/ui";
import "@/components/index-C9";
import "@/lib/supabase";
import "@/components/logo-estate";
const T = i => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0
}).format(i);
function me() {
  const i = O(),
    {
      data: $,
      isLoading: R,
      error: y
    } = W(),
    {
      data: h = []
    } = I(),
    {
      data: N
    } = K(),
    r = (N == null ? void 0 : N.data) ?? [],
    {
      data: v
    } = Z(),
    u = (v == null ? void 0 : v.data) ?? [],
    f = x.useMemo(() => {
      const s = new Date(),
        a = new Date();
      return a.setDate(a.getDate() + 7), r.filter(n => n.status === "trial" && n.trial_ends_at && new Date(n.trial_ends_at) >= s && new Date(n.trial_ends_at) <= a).sort((n, c) => new Date(n.trial_ends_at).getTime() - new Date(c.trial_ends_at).getTime());
    }, [r]),
    w = x.useMemo(() => r.filter(s => s.status === "suspended"), [r]),
    D = x.useMemo(() => {
      const s = new Date();
      return r.filter(a => a.status !== "active" || !a.updated_at ? !1 : _(s, new Date(a.updated_at)) > 30);
    }, [r]),
    g = x.useMemo(() => {
      const s = new Date(),
        a = new Date();
      return a.setDate(a.getDate() + 30), u.filter(n => n.status === "active" && n.ends_at && new Date(n.ends_at) >= s && new Date(n.ends_at) <= a).sort((n, c) => new Date(n.ends_at).getTime() - new Date(c.ends_at).getTime());
    }, [u]),
    H = x.useMemo(() => {
      const s = new Date(),
        a = new Date();
      a.setDate(a.getDate() + 7);
      const n = new Date();
      n.setDate(n.getDate() + 30);
      const c = r.filter(l => l.status === "trial" && l.trial_ends_at && new Date(l.trial_ends_at) >= s && new Date(l.trial_ends_at) <= a).length,
        B = r.filter(l => l.status === "trial" && l.trial_ends_at && new Date(l.trial_ends_at) < s).length,
        L = r.filter(l => l.status === "suspended").length,
        V = u.filter(l => l.status === "active" && l.ends_at && new Date(l.ends_at) >= s && new Date(l.ends_at) <= n).length,
        q = u.filter(l => l.status === "active").reduce((l, z) => l + (z.amount || 0), 0);
      return {
        trials_expiring_7d: c,
        trials_expired: B,
        churn_at_risk: L,
        subs_ending_30d: V,
        mrr_at_risk: q
      };
    }, [r, u]),
    d = $ ?? H,
    F = d.trials_expiring_7d === 0 && d.trials_expired === 0 && d.churn_at_risk === 0 && d.subs_ending_30d === 0,
    m = x.useMemo(() => h.reduce((s, a) => (s.connected += a.session_status === "connected" ? 1 : 0, s.pending += Number(a.pending_outgoing || 0), s.failed += Number(a.failed_24h || 0), s.mediaFailed += Number(a.media_failed_24h || 0), s), {
      connected: 0,
      pending: 0,
      failed: 0,
      mediaFailed: 0
    }), [h]);
  return <G><div className="space-y-6"><J title="Saúde do SaaS" description="Monitoramento operacional do negócio em tempo real" icon={S} />{R && <div className="flex items-center justify-center py-12"><Q className="w-8 h-8 animate-spin" style={{
          color: t.accent
        }} /><span className="ml-3 text-sm" style={{
          color: t.textMuted
        }}>Carregando métricas...</span></div>}{y && <o><div className="flex items-center gap-3 p-2"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: "rgba(248,113,113,0.12)"
          }}><M className="w-5 h-5" style={{
              color: "#f87171"
            }} /></div><div><p className="font-semibold" style={{
              color: t.textPrimary
            }}>Erro ao carregar métricas</p><p className="text-sm" style={{
              color: t.textMuted
            }}>{y instanceof Error ? y.message : "Verifique se você está logado como super admin."}</p></div></div></o>}<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><j label="Trials a vencer (7d)" value={d.trials_expiring_7d} icon={C} iconColor="#f59e0b" subtext="Convertem ou cancelam" /><j label="Trials expirados" value={d.trials_expired} icon={M} iconColor="#f87171" subtext="Precisam de ação" /><j label="Churn em risco" value={d.churn_at_risk} icon={E} iconColor="#f87171" subtext="Empresas suspensas" /><j label="MRR em risco" value={T(d.mrr_at_risk)} icon={U} iconColor="#f59e0b" subtext="Subs em status de risco" /></div>{F && <o><div className="flex items-center gap-3 p-2"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: "rgba(16,185,129,0.12)"
          }}><X className="w-5 h-5" style={{
              color: "#10b981"
            }} /></div><div><p className="font-semibold" style={{
              color: t.textPrimary
            }}>Tudo em ordem</p><p className="text-sm" style={{
              color: t.textMuted
            }}>Nenhum alerta operacional crítico no momento</p></div></div></o>}<o title="WhatsApp operacional" description="Visao exclusiva do Super Admin para sessoes, filas e falhas do broker"><div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4"><div className="p-3 rounded-xl" style={{
            background: t.surfaceElevated,
            border: `1px solid ${t.borderSubtle}`
          }}><p className="text-xs" style={{
              color: t.textMuted
            }}>Conectadas</p><p className="text-xl font-semibold" style={{
              color: t.textPrimary
            }}>{m.connected}</p></div><div className="p-3 rounded-xl" style={{
            background: t.surfaceElevated,
            border: `1px solid ${t.borderSubtle}`
          }}><p className="text-xs" style={{
              color: t.textMuted
            }}>Pendentes</p><p className="text-xl font-semibold" style={{
              color: t.textPrimary
            }}>{m.pending}</p></div><div className="p-3 rounded-xl" style={{
            background: t.surfaceElevated,
            border: `1px solid ${t.borderSubtle}`
          }}><p className="text-xs" style={{
              color: t.textMuted
            }}>Falhas 24h</p><p className="text-xl font-semibold" style={{
              color: m.failed > 0 ? "#f87171" : t.textPrimary
            }}>{m.failed}</p></div><div className="p-3 rounded-xl" style={{
            background: t.surfaceElevated,
            border: `1px solid ${t.borderSubtle}`
          }}><p className="text-xs" style={{
              color: t.textMuted
            }}>Midias falhas</p><p className="text-xl font-semibold" style={{
              color: m.mediaFailed > 0 ? "#f59e0b" : t.textPrimary
            }}>{m.mediaFailed}</p></div></div>{h.length === 0 ? <p icon={S} title="Nenhuma sessao WhatsApp encontrada" /> : <div className="space-y-2">{h.slice(0, 8).map(s => {
            const a = s.session_status !== "connected" || s.pending_outgoing > 0 || s.failed_24h > 0 || s.media_failed_24h > 0;
            return <div className="flex flex-col gap-3 p-3 rounded-xl md:flex-row md:items-center md:justify-between" style={{
              background: t.surfaceElevated,
              border: `1px solid ${t.borderSubtle}`
            }}><div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><p className="text-sm font-medium truncate" style={{
                    color: t.textPrimary
                  }}>{s.tenant_name || s.tenant_id}</p><b tone={s.session_status === "connected" ? "success" : a ? "warning" : "info"}>{s.session_status}</b></div><p className="text-xs truncate" style={{
                  color: t.textMuted
                }}>{s.phone_number || "Sem telefone"} · {s.session_name}</p>{(s.broker_last_error || s.session_last_error) && <p className="text-xs truncate mt-1" style={{
                  color: "#f59e0b"
                }}>{s.broker_last_error || s.session_last_error}</p>}</div><div className="grid grid-cols-4 gap-2 text-center text-xs md:w-[360px]"><div><p style={{
                    color: t.textMuted
                  }}>Pend.</p><p className="font-semibold" style={{
                    color: t.textPrimary
                  }}>{s.pending_outgoing}</p></div><div><p style={{
                    color: t.textMuted
                  }}>Falhas</p><p className="font-semibold" style={{
                    color: s.failed_24h > 0 ? "#f87171" : t.textPrimary
                  }}>{s.failed_24h}</p></div><div><p style={{
                    color: t.textMuted
                  }}>Dup.</p><p className="font-semibold" style={{
                    color: t.textPrimary
                  }}>{s.duplicates_24h}</p></div><div><p style={{
                    color: t.textMuted
                  }}>Midia</p><p className="font-semibold" style={{
                    color: s.media_failed_24h > 0 ? "#f59e0b" : t.textPrimary
                  }}>{s.media_failed_24h}</p></div></div></div>;
          })}</div>}</o><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><o title="Trials expirando em 7 dias" description={`${f.length} empresas`} action={f.length > 0 && <k size="sm" variant="ghost" icon={P} onClick={() => i("/super-admin/tenants")}>Ver todas</k>}>{f.length === 0 ? <p icon={C} title="Nenhum trial expirando" description="Tudo tranquilo nos próximos 7 dias" /> : <div className="space-y-2">{f.slice(0, 6).map(s => {
              const a = _(new Date(s.trial_ends_at), new Date());
              return <button onClick={() => i("/super-admin/tenants")} className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5" style={{
                background: t.surfaceElevated,
                border: `1px solid ${t.borderSubtle}`
              }}><A className="w-4 h-4 shrink-0" style={{
                  color: t.textMuted
                }} /><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{
                    color: t.textPrimary
                  }}>{s.name}</p><p className="text-xs truncate" style={{
                    color: t.textMuted
                  }}>{s.owner_email || "Sem admin"}</p></div><b tone={a <= 2 ? "danger" : a <= 5 ? "warning" : "info"}>{a === 0 ? "Hoje" : `${a}d`}</b></button>;
            })}</div>}</o><o title="Empresas suspensas" description={`${w.length} empresas precisam de atenção`}>{w.length === 0 ? <p icon={E} title="Nenhuma empresa suspensa" /> : <div className="space-y-2">{w.slice(0, 6).map(s => <button onClick={() => i("/super-admin/tenants")} className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5" style={{
              background: t.surfaceElevated,
              border: `1px solid ${t.borderSubtle}`
            }}><A className="w-4 h-4 shrink-0" style={{
                color: "#f87171"
              }} /><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{
                  color: t.textPrimary
                }}>{s.name}</p><p className="text-xs truncate" style={{
                  color: t.textMuted
                }}>{s.owner_email || "Sem admin"}</p></div><b tone="danger">Suspenso</b></button>)}</div>}</o><o title="Assinaturas vencendo (30d)" description={`${g.length} assinaturas`} action={g.length > 0 && <k size="sm" variant="ghost" icon={P} onClick={() => i("/super-admin/subscriptions")}>Ver todas</k>}>{g.length === 0 ? <p icon={Y} title="Nenhuma assinatura vencendo" description="Próximos 30 dias estão tranquilos" /> : <div className="space-y-2">{g.slice(0, 6).map(s => {
              var n, c;
              const a = _(new Date(s.ends_at), new Date());
              return <button onClick={() => i("/super-admin/subscriptions")} className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5" style={{
                background: t.surfaceElevated,
                border: `1px solid ${t.borderSubtle}`
              }}><ee className="w-4 h-4 shrink-0" style={{
                  color: t.accent
                }} /><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{
                    color: t.textPrimary
                  }}>{((n = s.tenant) == null ? void 0 : n.name) || "—"}</p><p className="text-xs truncate" style={{
                    color: t.textMuted
                  }}>{T(s.amount || 0)} · {((c = s.plan) == null ? void 0 : c.name) || ""}</p></div><b tone={a <= 7 ? "warning" : "info"}>{a}d</b></button>;
            })}</div>}</o><o title="Empresas pouco ativas" description={`${D.length} empresas sem atividade recente (30d+)`}>{D.length === 0 ? <p icon={S} title="Tudo ativo" description="Todas as empresas tiveram atividade recente" /> : <div className="space-y-2">{D.slice(0, 6).map(s => {
              const a = s.updated_at ? _(new Date(), new Date(s.updated_at)) : 0;
              return <button onClick={() => i("/super-admin/tenants")} className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5" style={{
                background: t.surfaceElevated,
                border: `1px solid ${t.borderSubtle}`
              }}><se className="w-4 h-4 shrink-0" style={{
                  color: "#f59e0b"
                }} /><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{
                    color: t.textPrimary
                  }}>{s.name}</p><p className="text-xs truncate" style={{
                    color: t.textMuted
                  }}>Última atualização há {a} dias</p></div><te className="w-3.5 h-3.5" style={{
                  color: t.textMuted
                }} /></button>;
            })}</div>}</o></div></div></G>;
}
export { me as default };