/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminSubscriptions-ChrjN0Kb.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { u as ue, r as i } from "@/components/vendor-Jm1Lk";
import { f as he, p as pe, q as ye, e as je, S as ge } from "@/components/SuperAdminLayout";
import { S as be, b as E, c as t, h as Ne, a as o, e as ve, d as fe, f as we, g as Ce } from "@/components/index";
import { b as Se, I as V } from "@/components/index-C9";
import { L as p } from "@/components/label";
import { S as y, a as j, b as g, c as b, d as n } from "@/components/ui/select";
import { D as Me, a as _e, b as Ae, d as k } from "@/components/ui/dropdown-menu";
import { D as B, a as R, b as F, c as I, d as L, e as O } from "@/components/ui/dialog";
import { t as $ } from "@/components/error-messages";
import { b as Ee, c as ke } from "@/components/export-utils";
import { aI as z, r as De, s as Pe, bf as Te, ai as le, S as Ve, O as Be, l as Re, b5 as d, b1 as Fe, Z as U, a3 as q, i as Ie, bj as H } from "@/components/ui";
import { p as N } from "@/components/pt-BR";
import "@/components/logo-estate";
import "@/lib/supabase";
import "@/components/index";
import "@/components/index";
import "@/components/xlsx";
const G = D => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(D),
  Le = {
    active: "success",
    trial: "warning",
    cancelled: "danger",
    expired: "danger",
    past_due: "warning",
    paused: "neutral"
  },
  Oe = {
    active: "Ativa",
    trial: "Trial",
    cancelled: "Cancelada",
    expired: "Expirada",
    past_due: "Em atraso",
    paused: "Pausada"
  };
function na() {
  var W, Y, ee, ae;
  const D = ue(),
    {
      toast: x
    } = Se(),
    [K, X] = i.useState(1),
    Z = 20,
    [v, ne] = i.useState(""),
    [P, re] = i.useState("all"),
    [T, ce] = i.useState("all"),
    [m, f] = i.useState(null),
    [l, w] = i.useState(null),
    [s, C] = i.useState(null),
    {
      data: u,
      isLoading: ie
    } = he(K, Z, {
      status: P,
      cycle: T
    }),
    h = (u == null ? void 0 : u.data) ?? [],
    J = (u == null ? void 0 : u.count) ?? 0,
    Q = pe(),
    S = ye(),
    {
      data: oe = []
    } = je();
  i.useEffect(() => {
    X(1);
  }, [P, T]);
  const M = i.useMemo(() => {
      if (!v) return h;
      const a = v.toLowerCase();
      return h.filter(r => {
        var c, A, te, se;
        return ((A = (c = r.tenant) == null ? void 0 : c.name) == null ? void 0 : A.toLowerCase().includes(a)) || ((se = (te = r.plan) == null ? void 0 : te.name) == null ? void 0 : se.toLowerCase().includes(a));
      });
    }, [h, v]),
    _ = i.useMemo(() => {
      const a = h.filter(c => c.status === "active"),
        r = a.reduce((c, A) => c + (A.amount || 0), 0);
      return {
        total: J,
        active: a.length,
        cancelled: h.filter(c => c.status === "cancelled").length,
        mrr: r
      };
    }, [h]),
    de = async () => {
      if (m) try {
        await Q.mutateAsync({
          id: m.id
        }), x({
          title: "Assinatura cancelada"
        }), f(null);
      } catch (a) {
        x({
          title: "Erro ao cancelar",
          description: $(a),
          variant: "destructive"
        });
      }
    },
    xe = async a => {
      if (a.preventDefault(), !l) return;
      const r = new FormData(a.currentTarget);
      try {
        await S.mutateAsync({
          id: l.id,
          plan_id: r.get("plan_id"),
          amount: Number(r.get("amount")),
          billing_cycle: r.get("billing_cycle"),
          status: r.get("status"),
          ends_at: r.get("ends_at") || null
        }), x({
          title: "Assinatura atualizada"
        }), w(null);
      } catch (c) {
        x({
          title: "Erro ao salvar",
          description: $(c),
          variant: "destructive"
        });
      }
    },
    me = async () => {
      if (!(!s || !s.ends_at)) try {
        const a = new Date(s.ends_at),
          r = s.billing_cycle === "yearly" ? 12 : 1;
        a.setMonth(a.getMonth() + r), await S.mutateAsync({
          id: s.id,
          ends_at: a.toISOString().slice(0, 10),
          status: s.status === "expired" || s.status === "cancelled" ? "active" : s.status
        }), x({
          title: "Assinatura renovada",
          description: `Novo vencimento: ${d(a, "dd/MM/yyyy", {
            locale: N
          })}`
        }), C(null);
      } catch (a) {
        x({
          title: "Erro ao renovar",
          description: $(a),
          variant: "destructive"
        });
      }
    };
  return <ge><div className="space-y-6"><be title="Assinaturas" description="Gestão de planos contratados pelas empresas" icon={z} /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><E label="Total" value={_.total} icon={z} iconColor="#60a5fa" /><E label="Ativas" value={_.active} icon={De} iconColor="#10b981" /><E label="Canceladas" value={_.cancelled} icon={Pe} iconColor="#f87171" /><E label="MRR" value={G(_.mrr)} icon={Te} iconColor={t.accent} /></div><Ne><o variant="secondary" icon={le} size="sm" onClick={() => Ee(M, [{
          key: "tenant",
          label: "Empresa"
        }, {
          key: "plan",
          label: "Plano"
        }, {
          key: "status",
          label: "Status"
        }, {
          key: "billing_cycle",
          label: "Ciclo"
        }, {
          key: "amount",
          label: "Valor"
        }, {
          key: "started_at",
          label: "Início"
        }, {
          key: "ends_at",
          label: "Vencimento"
        }], "assinaturas")}>CSV</o><o variant="secondary" icon={le} size="sm" onClick={() => ke("Relatório de Assinaturas", M, [{
          key: "tenant",
          label: "Empresa"
        }, {
          key: "plan",
          label: "Plano"
        }, {
          key: "status",
          label: "Status"
        }, {
          key: "billing_cycle",
          label: "Ciclo"
        }, {
          key: "amount",
          label: "Valor",
          format: a => G(Number(a))
        }, {
          key: "started_at",
          label: "Início",
          format: a => a ? d(new Date(String(a)), "dd/MM/yyyy") : "-"
        }, {
          key: "ends_at",
          label: "Vencimento",
          format: a => a ? d(new Date(String(a)), "dd/MM/yyyy") : "-"
        }], "assinaturas")}>PDF</o><div className="relative flex-1 min-w-[200px]"><Ve className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{
            color: t.textMuted
          }} /><V placeholder="Buscar empresa ou plano..." value={v} onChange={a => ne(a.target.value)} className="pl-9 h-9 bg-transparent border-white/10 text-white placeholder:text-white/30" /></div><y value={P} onValueChange={re}><j className="w-[140px] h-9 bg-transparent border-white/10 text-white"><Be className="w-3.5 h-3.5 mr-1" /><g /></j><b className="bg-slate-800 border-slate-700 text-white"><n value="all">Todos status</n><n value="active">Ativa</n><n value="trial">Trial</n><n value="cancelled">Cancelada</n><n value="past_due">Em atraso</n></b></y><y value={T} onValueChange={ce}><j className="w-[140px] h-9 bg-transparent border-white/10 text-white"><g /></j><b className="bg-slate-800 border-slate-700 text-white"><n value="all">Todos ciclos</n><n value="monthly">Mensal</n><n value="yearly">Anual</n></b></y></Ne><ve noPadding={!0}>{ie ? <div className="p-8 text-center text-sm" style={{
          color: t.textMuted
        }}>Carregando...</div> : M.length === 0 ? <fe icon={z} title="Nenhuma assinatura" description="Não há registros para os filtros aplicados" /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{
                borderBottom: `1px solid ${t.border}`
              }}><th className="text-left px-5 py-3 font-medium" style={{
                  color: t.textMuted
                }}>Empresa</th><th className="text-left px-5 py-3 font-medium" style={{
                  color: t.textMuted
                }}>Plano</th><th className="text-left px-5 py-3 font-medium" style={{
                  color: t.textMuted
                }}>Ciclo</th><th className="text-right px-5 py-3 font-medium" style={{
                  color: t.textMuted
                }}>Valor</th><th className="text-left px-5 py-3 font-medium" style={{
                  color: t.textMuted
                }}>Início</th><th className="text-left px-5 py-3 font-medium" style={{
                  color: t.textMuted
                }}>Fim</th><th className="text-left px-5 py-3 font-medium" style={{
                  color: t.textMuted
                }}>Status</th><th className="px-5 py-3 w-12" /></tr></thead><tbody>{M.map(a => {
                var r, c;
                return <tr className="hover:bg-white/[0.02] transition-colors" style={{
                  borderBottom: `1px solid ${t.borderSubtle}`
                }}><td className="px-5 py-3"><div className="flex items-center gap-2"><Re className="w-3.5 h-3.5" style={{
                        color: t.textMuted
                      }} /><span style={{
                        color: t.textPrimary
                      }}>{((r = a.tenant) == null ? void 0 : r.name) || "—"}</span></div></td><td className="px-5 py-3" style={{
                    color: t.textSecondary
                  }}>{((c = a.plan) == null ? void 0 : c.name) || "—"}</td><td className="px-5 py-3" style={{
                    color: t.textSecondary
                  }}>{a.billing_cycle === "yearly" ? "Anual" : "Mensal"}</td><td className="px-5 py-3 text-right font-medium" style={{
                    color: t.textPrimary
                  }}>{G(a.amount || 0)}</td><td className="px-5 py-3" style={{
                    color: t.textSecondary
                  }}>{a.started_at ? d(new Date(a.started_at), "dd/MM/yy", {
                      locale: N
                    }) : "—"}</td><td className="px-5 py-3" style={{
                    color: t.textSecondary
                  }}>{a.ends_at ? d(new Date(a.ends_at), "dd/MM/yy", {
                      locale: N
                    }) : "—"}</td><td className="px-5 py-3"><we tone={Le[a.status] || "neutral"}>{Oe[a.status] || a.status}</we></td><td className="px-2 py-3"><Me><_e asChild={!0}><button className="p-1.5 rounded hover:bg-white/5"><Fe className="w-4 h-4" style={{
                            color: t.textMuted
                          }} /></button></_e><Ae align="end" className="bg-slate-800 border-slate-700"><k onClick={() => w(a)} className="focus:bg-slate-700" style={{
                          color: t.textPrimary
                        }}><U className="w-4 h-4 mr-2" />Editar assinatura</k><k onClick={() => C(a)} disabled={a.status === "cancelled"} className="focus:bg-slate-700" style={{
                          color: t.textPrimary
                        }}><q className="w-4 h-4 mr-2" />Renovar assinatura</k><k onClick={() => D(`/super-admin/tenants?id=${a.tenant_id}`)} className="focus:bg-slate-700" style={{
                          color: t.textPrimary
                        }}><Ie className="w-4 h-4 mr-2" />Ver empresa</k><k onClick={() => f(a)} disabled={a.status === "cancelled"} className="text-rose-400 focus:bg-slate-700 focus:text-rose-400"><H className="w-4 h-4 mr-2" />Cancelar assinatura</k></Ae></Me></td></tr>;
              })}</tbody></table></div>}<Ce page={K} pageSize={Z} total={J} onPageChange={X} /></ve><B open={!!m} onOpenChange={() => f(null)}><R className="bg-slate-900 border-slate-700 text-white"><F><I className="flex items-center gap-2"><H className="w-5 h-5 text-rose-500" />Cancelar assinatura</I><L className="text-slate-400">Esta ação cancela a assinatura de <strong className="text-white">{(W = m == null ? void 0 : m.tenant) == null ? void 0 : W.name}</strong> e marca a empresa como cancelada.</L></F><O><o variant="secondary" onClick={() => f(null)}>Voltar</o><o variant="danger" icon={H} onClick={de} disabled={Q.isPending}>Confirmar cancelamento</o></O></R></B><B open={!!l} onOpenChange={() => w(null)}><R className="bg-slate-900 border-slate-700 text-white max-w-md"><F><I className="flex items-center gap-2"><U className="w-5 h-5" style={{
                color: t.accent
              }} />Editar assinatura</I><L className="text-slate-400">{(Y = l == null ? void 0 : l.tenant) == null ? void 0 : Y.name} — {(ee = l == null ? void 0 : l.plan) == null ? void 0 : ee.name}</L></F>{l && <form id="edit-sub-form" onSubmit={xe} className="space-y-4 mt-2"><div className="space-y-1.5"><p className="text-xs" style={{
                color: t.textMuted
              }}>Plano</p><y name="plan_id" defaultValue={l.plan_id}><j className="bg-transparent border-white/10 text-white h-9"><g /></j><b className="bg-slate-800 border-slate-700 text-white">{oe.map(a => <n value={a.id}>{a.name}</n>)}</b></y></div><div className="space-y-1.5"><p className="text-xs" style={{
                color: t.textMuted
              }}>Valor (R$)</p><V name="amount" type="number" step="0.01" defaultValue={l.amount} className="bg-transparent border-white/10 text-white h-9" /></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><p className="text-xs" style={{
                  color: t.textMuted
                }}>Ciclo</p><y name="billing_cycle" defaultValue={l.billing_cycle}><j className="bg-transparent border-white/10 text-white h-9"><g /></j><b className="bg-slate-800 border-slate-700 text-white"><n value="monthly">Mensal</n><n value="yearly">Anual</n></b></y></div><div className="space-y-1.5"><p className="text-xs" style={{
                  color: t.textMuted
                }}>Status</p><y name="status" defaultValue={l.status}><j className="bg-transparent border-white/10 text-white h-9"><g /></j><b className="bg-slate-800 border-slate-700 text-white"><n value="active">Ativa</n><n value="trial">Trial</n><n value="expired">Expirada</n><n value="past_due">Em atraso</n><n value="paused">Pausada</n></b></y></div></div><div className="space-y-1.5"><p className="text-xs" style={{
                color: t.textMuted
              }}>Data de vencimento</p><V name="ends_at" type="date" defaultValue={l.ends_at ? l.ends_at.slice(0, 10) : ""} className="bg-transparent border-white/10 text-white h-9" /></div></form>}<O className="mt-4"><o variant="secondary" onClick={() => w(null)}>Cancelar</o><o variant="primary" icon={U} onClick={() => {
              var a;
              return (a = document.getElementById("edit-sub-form")) == null ? void 0 : a.dispatchEvent(new Event("submit", {
                bubbles: !0,
                cancelable: !0
              }));
            }} disabled={S.isPending}>Salvar alterações</o></O></R></B><B open={!!s} onOpenChange={() => C(null)}><R className="bg-slate-900 border-slate-700 text-white max-w-md"><F><I className="flex items-center gap-2"><q className="w-5 h-5" style={{
                color: "#10b981"
              }} />Renovar assinatura</I><L className="text-slate-400">{(ae = s == null ? void 0 : s.tenant) == null ? void 0 : ae.name} — vencimento atual: {s != null && s.ends_at ? d(new Date(s.ends_at), "dd/MM/yyyy", {
                locale: N
              }) : "—"}</L></F>{s && <div className="mt-2 space-y-3"><div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><p className="text-sm text-emerald-400">O vencimento será estendido em <strong>{s.billing_cycle === "yearly" ? "12 meses" : "1 mês"}</strong> a partir da data atual de vencimento.</p></div><div className="text-sm" style={{
              color: t.textSecondary
            }}>Novo vencimento previsto: <strong style={{
                color: t.textPrimary
              }}>{(() => {
                  const a = new Date(s.ends_at || Date.now());
                  return a.setMonth(a.getMonth() + (s.billing_cycle === "yearly" ? 12 : 1)), d(a, "dd/MM/yyyy", {
                    locale: N
                  });
                })()}</strong></div></div>}<O className="mt-4"><o variant="secondary" onClick={() => C(null)}>Cancelar</o><o variant="primary" icon={q} onClick={me} disabled={S.isPending}>Confirmar renovação</o></O></R></B></div></ge>;
}
export { na as default };