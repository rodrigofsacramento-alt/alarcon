/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminTenants-C9wQSj7r.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { u as le, r as x } from "@/components/vendor-Jm1Lk";
import { e as me, h as xe, i as pe, a as ue, S as be, j as he, k as ge, l as je, m as ye } from "@/components/SuperAdminLayout";
import { g as ve } from "@/components/index";
import { b as te } from "@/components/index-C9";
import { t as J } from "@/components/error-messages";
import { b as Ne, c as fe } from "@/components/export-utils";
import { ai as W, z as we, S as ke, L as B, l as q, s as Y, v as z, u as G, bh as Ce, b5 as w, i as re, af as _e, b2 as ie, bi as ne, bj as oe, X as ce, _ as Q, W as Se, P as Ee, y as Te, m as Z, a5 as ee, U as Pe, k as Ae, aI as Me, I as Re, aR as Le, aU as se, E as $e } from "@/components/ui";
import { p as $ } from "@/components/pt-BR";
import "@/components/logo-estate";
import "@/lib/supabase";
import "@/components/xlsx";
const X = {
    active: {
      label: "Ativo",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      icon: Ce
    },
    trial: {
      label: "Trial",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      icon: G
    },
    suspended: {
      label: "Suspenso",
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      icon: z
    },
    cancelled: {
      label: "Cancelado",
      color: "text-slate-400",
      bg: "bg-slate-500/10 border-slate-500/20",
      icon: Y
    }
  },
  ae = {
    name: "",
    slug: "",
    email: "",
    phone: "",
    cnpj: "",
    city: "",
    state: "",
    owner_name: "",
    owner_email: "",
    plan_id: "",
    status: "trial"
  },
  Fe = {
    admin: "Admin",
    manager: "Gerente",
    agent: "Corretor",
    client: "Cliente"
  },
  H = "w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-all",
  O = {
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.1)"
  };
function Ue({
  tenantId: k,
  onClose: A,
  onEdit: C,
  onStatusChange: u
}) {
  var D;
  const M = le(),
    {
      toast: y
    } = te(),
    {
      data: l,
      isLoading: V
    } = he(k),
    {
      data: R = []
    } = ge(k),
    {
      data: b = []
    } = je(k),
    h = ye(),
    [v, r] = x.useState("info"),
    [o, _] = x.useState(!1),
    [S, N] = x.useState(!1),
    [c, f] = x.useState({
      admin_email: "",
      admin_name: "",
      admin_password: "Mudar@123"
    }),
    d = b.find(a => a.status === "active" || a.status === "trialing"),
    F = async () => {
      if (!c.admin_email || !c.admin_name) {
        y({
          title: "Preencha email e nome do admin",
          variant: "destructive"
        });
        return;
      }
      try {
        await h.mutateAsync({
          tenant_id: k,
          admin_email: c.admin_email,
          admin_name: c.admin_name,
          admin_password: c.admin_password
        }), y({
          title: "Empresa provisionada com sucesso!",
          description: `Usuário admin criado: ${c.admin_email}`
        }), _(!1);
      } catch (a) {
        y({
          title: "Erro ao provisionar empresa",
          description: J(a),
          variant: "destructive"
        });
      }
    },
    g = () => {
      if (!(l != null && l.owner_email)) {
        y({
          title: "Empresa não provisionada",
          description: "Provisione primeiro para criar o usuário admin.",
          variant: "destructive"
        });
        return;
      }
      M("/login"), y({
        title: `Acessando ${l.name}`,
        description: `Use o usuário administrador ${l.owner_email} para entrar no CRM.`
      });
    },
    U = (a, i) => {
      navigator.clipboard.writeText(a), y({
        title: `${i} copiado!`
      });
    };
  if (V || !l) return <div className="flex items-center justify-center h-full">{<B className="w-6 h-6 animate-spin" style={{
      color: "#c8590a"
    }} />}</div>;
  const n = X[l.status],
    E = (n == null ? void 0 : n.icon) ?? G;
  return <div className="flex flex-col h-full overflow-hidden">{<div className="px-6 py-5 shrink-0" style={{
      borderBottom: "1px solid rgba(255,255,255,0.08)"
    }}>{<div className="flex items-start justify-between gap-3">{<div className="flex items-center gap-3">{<div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{
            background: "rgba(200,89,10,0.12)",
            border: "1px solid rgba(200,89,10,0.2)"
          }}>{<q className="w-5 h-5" style={{
              color: "#c8590a"
            }} />}</div>}{<div>{<h2 className="text-base font-semibold text-white leading-tight">{l.name}</h2>}{<p className="text-xs mt-0.5" style={{
              color: "rgba(255,255,255,0.35)"
            }}>{l.slug}</p>}</div>}</div>}{<button onClick={A} className="text-slate-400 hover:text-white transition-colors mt-0.5">{<ce className="w-5 h-5" />}</button>}</div>}{<div className="flex items-center gap-2 mt-4 flex-wrap">{<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${n == null ? void 0 : n.bg} ${n == null ? void 0 : n.color}`}>{<E className="w-3 h-3" />}{n == null ? void 0 : n.label}</span>}{<button onClick={g} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white transition-all" style={{
          background: "linear-gradient(135deg,#c8590a,#e07a3a)",
          boxShadow: "0 2px 10px rgba(200,89,10,0.3)"
        }}>{<Q className="w-3 h-3" />} Acessar Empresa</button>}{<button onClick={() => C(l)} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all" style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.7)"
        }}>{<ie className="w-3 h-3" />} Editar</button>}</div>}{<div className="flex gap-1 mt-4">{["info", "users", "subscription", "access"].map(a => <button onClick={() => r(a)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={v === a ? {
          background: "rgba(200,89,10,0.15)",
          color: "#e07a3a",
          border: "1px solid rgba(200,89,10,0.25)"
        } : {
          color: "rgba(255,255,255,0.4)",
          border: "1px solid transparent"
        }}>{a === "info" ? "Informações" : a === "users" ? `Usuários (${R.length})` : a === "subscription" ? "Assinatura" : "Acesso"}</button>)}</div>}</div>}{<div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">{v === "info" && <div className="space-y-3">{[{
          icon: Se,
          label: "Email",
          value: l.email
        }, {
          icon: Ee,
          label: "Telefone",
          value: l.phone ?? "—"
        }, {
          icon: Te,
          label: "Cidade/UF",
          value: [l.city, l.state].filter(Boolean).join(" / ") || "—"
        }, {
          icon: Z,
          label: "Criado em",
          value: l.created_at ? w(new Date(l.created_at), "dd/MM/yyyy 'às' HH:mm", {
            locale: $
          }) : "—"
        }, {
          icon: Z,
          label: "Trial até",
          value: l.trial_ends_at ? w(new Date(l.trial_ends_at), "dd/MM/yyyy", {
            locale: $
          }) : "—"
        }].map(({
          icon: a,
          label: i,
          value: T
        }) => <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)"
        }}>{<a className="w-4 h-4 shrink-0" style={{
            color: "rgba(255,255,255,0.3)"
          }} />}{<div className="flex-1 min-w-0">{<p className="text-[10px] uppercase tracking-wider" style={{
              color: "rgba(255,255,255,0.3)"
            }}>{i}</p>}{<p className="text-sm text-white truncate">{T}</p>}</div>}</div>)}{<div className="pt-2" style={{
          borderTop: "1px solid rgba(255,255,255,0.06)"
        }}>{<p className="text-[10px] uppercase tracking-wider mb-2" style={{
            color: "rgba(255,255,255,0.3)"
          }}>Responsável</p>}{<div className="flex items-center gap-3 py-2.5 px-3 rounded-lg" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}>{<div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{
              background: "rgba(200,89,10,0.15)",
              color: "#c8590a"
            }}>{(l.owner_name ?? "?").charAt(0).toUpperCase()}</div>}{<div className="flex-1 min-w-0">{<p className="text-sm text-white">{l.owner_name ?? "—"}</p>}{<p className="text-xs truncate" style={{
                color: "rgba(255,255,255,0.4)"
              }}>{l.owner_email ?? "—"}</p>}</div>}{l.owner_email && <button onClick={() => U(l.owner_email, "Email")} className="text-slate-500 hover:text-slate-300 transition-colors">{<ee className="w-3.5 h-3.5" />}</button>}</div>}</div>}{<div className="pt-2" style={{
          borderTop: "1px solid rgba(255,255,255,0.06)"
        }}>{<p className="text-[10px] uppercase tracking-wider mb-2" style={{
            color: "rgba(255,255,255,0.3)"
          }}>Limites</p>}{<div className="grid grid-cols-2 gap-2">{[{
              label: "Corretores",
              value: l.max_agents ?? "—"
            }, {
              label: "Imóveis",
              value: l.max_properties ?? "—"
            }].map(({
              label: a,
              value: i
            }) => <div className="text-center py-3 rounded-lg" style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)"
            }}>{<p className="text-lg font-bold text-white">{i}</p>}{<p className="text-[10px] mt-0.5" style={{
                color: "rgba(255,255,255,0.35)"
              }}>{a}</p>}</div>)}</div>}</div>}{<div className="pt-2 flex gap-2 flex-wrap" style={{
          borderTop: "1px solid rgba(255,255,255,0.06)"
        }}>{l.status !== "active" && <button onClick={() => u(l, "active")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-emerald-400 transition-all hover:bg-emerald-500/10">{<ne className="w-3.5 h-3.5" />} Ativar</button>}{l.status !== "suspended" && <button onClick={() => u(l, "suspended")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-amber-400 transition-all hover:bg-amber-500/10">{<oe className="w-3.5 h-3.5" />} Suspender</button>}{l.status !== "cancelled" && <button onClick={() => u(l, "cancelled")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-400 transition-all hover:bg-red-500/10">{<Y className="w-3.5 h-3.5" />} Cancelar</button>}</div>}</div>}{v === "users" && <div className="space-y-3">{R.length === 0 ? <div className="text-center py-10">{<Pe className="w-8 h-8 mx-auto mb-2 opacity-20 text-white" />}{<p className="text-sm" style={{
            color: "rgba(255,255,255,0.3)"
          }}>Nenhum usuário ainda</p>}{<p className="text-xs mt-1" style={{
            color: "rgba(255,255,255,0.2)"
          }}>Provisione a empresa para criar o admin</p>}</div> : R.map(a => <div className="flex items-center gap-3 py-3 px-3 rounded-lg" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)"
        }}>{<div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{
            background: "rgba(200,89,10,0.15)",
            color: "#c8590a"
          }}>{a.full_name.charAt(0).toUpperCase()}</div>}{<div className="flex-1 min-w-0">{<p className="text-sm text-white truncate">{a.full_name}</p>}{<p className="text-xs truncate" style={{
              color: "rgba(255,255,255,0.4)"
            }}>{a.email ?? "—"}</p>}</div>}{<div className="text-right shrink-0">{<span className="text-[10px] px-2 py-0.5 rounded-full" style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.5)"
            }}>{Fe[a.role] ?? a.role}</span>}{<p className="text-[10px] mt-0.5" style={{
              color: a.is_active ? "#34d399" : "#f87171"
            }}>{a.is_active ? "Ativo" : "Inativo"}</p>}</div>}</div>)}</div>}{v === "subscription" && <div className="space-y-3">{d ? <e.Fragment>{<div className="p-4 rounded-xl" style={{
            background: "rgba(200,89,10,0.08)",
            border: "1px solid rgba(200,89,10,0.2)"
          }}>{<div className="flex items-center justify-between mb-3">{<p className="text-sm font-semibold text-white">{((D = d.plan) == null ? void 0 : D.name) ?? "Plano"}</p>}{<span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{
                background: d.status === "active" ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)",
                color: d.status === "active" ? "#34d399" : "#fbbf24"
              }}>{d.status === "active" ? "Ativa" : "Trial"}</span>}</div>}{<div className="grid grid-cols-2 gap-3">{[{
                label: "Valor mensal",
                value: `R$ ${Number(d.amount).toFixed(2).replace(".", ",")}`
              }, {
                label: "Ciclo",
                value: d.billing_cycle === "yearly" ? "Anual" : "Mensal"
              }, {
                label: "Início",
                value: w(new Date(d.started_at), "dd/MM/yyyy", {
                  locale: $
                })
              }, {
                label: "Vence em",
                value: d.ends_at ? w(new Date(d.ends_at), "dd/MM/yyyy", {
                  locale: $
                }) : "—"
              }].map(({
                label: a,
                value: i
              }) => <div>{<p className="text-[10px] uppercase" style={{
                  color: "rgba(255,255,255,0.35)"
                }}>{a}</p>}{<p className="text-sm text-white font-medium">{i}</p>}</div>)}</div>}</div>}{<div className="flex items-center gap-2 p-3 rounded-lg" style={{
            background: "rgba(52,211,153,0.05)",
            border: "1px solid rgba(52,211,153,0.15)"
          }}>{<Ae className="w-4 h-4 text-emerald-400 shrink-0" />}{<p className="text-xs text-emerald-400">MRR desta empresa: {<strong>R$ {Number(d.amount).toFixed(2).replace(".", ",")}</strong>}</p>}</div>}</e.Fragment> : <div className="text-center py-10">{<Me className="w-8 h-8 mx-auto mb-2 opacity-20 text-white" />}{<p className="text-sm" style={{
            color: "rgba(255,255,255,0.3)"
          }}>Nenhuma assinatura ativa</p>}{<p className="text-xs mt-1" style={{
            color: "rgba(255,255,255,0.2)"
          }}>Provisione e associe um plano</p>}</div>}{b.length > 1 && <div className="pt-2" style={{
          borderTop: "1px solid rgba(255,255,255,0.06)"
        }}>{<p className="text-[10px] uppercase tracking-wider mb-2" style={{
            color: "rgba(255,255,255,0.3)"
          }}>Histórico</p>}{b.slice(1).map(a => {
            var i;
            return <div className="flex justify-between items-center py-2 text-xs" style={{
              color: "rgba(255,255,255,0.4)"
            }}>{<span>{(i = a.plan) == null ? void 0 : i.name}</span>}{<span>{a.cancelled_at ? w(new Date(a.cancelled_at), "dd/MM/yyyy") : a.status}</span>}</div>;
          })}</div>}</div>}{v === "access" && <div className="space-y-4">{<div className="p-4 rounded-xl" style={{
          background: "rgba(200,89,10,0.08)",
          border: "1px solid rgba(200,89,10,0.2)"
        }}>{<div className="flex items-center gap-2 mb-2">{<Q className="w-4 h-4" style={{
              color: "#c8590a"
            }} />}{<p className="text-sm font-semibold" style={{
              color: "#e07a3a"
            }}>Acessar como Admin da Empresa</p>}</div>}{<p className="text-xs mb-3" style={{
            color: "rgba(255,255,255,0.4)"
          }}>Abre o CRM da empresa. Faça login com as credenciais do admin do tenant.</p>}{l.owner_email ? <div className="space-y-2 mb-3">{<div className="flex items-center justify-between py-2 px-3 rounded-lg" style={{
              background: "rgba(0,0,0,0.2)"
            }}>{<div>{<p className="text-[10px] uppercase" style={{
                  color: "rgba(255,255,255,0.3)"
                }}>Email do Admin</p>}{<p className="text-sm text-white font-mono">{l.owner_email}</p>}</div>}{<button onClick={() => U(l.owner_email, "Email")} className="text-slate-500 hover:text-slate-300 transition-colors ml-2">{<ee className="w-3.5 h-3.5" />}</button>}</div>}</div> : <div className="flex items-center gap-2 mb-3 text-xs text-amber-400">{<z className="w-3.5 h-3.5" />}{<span>Empresa não provisionada — crie o usuário admin abaixo</span>}</div>}{<button onClick={g} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all" style={{
            background: "linear-gradient(135deg,#c8590a,#e07a3a)",
            boxShadow: "0 2px 12px rgba(200,89,10,0.3)"
          }}>Acessar Empresa {<Re className="w-4 h-4" />}</button>}</div>}{<div className="p-4 rounded-xl" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)"
        }}>{<div className="flex items-center gap-2 mb-1">{<Le className="w-4 h-4" style={{
              color: "rgba(255,255,255,0.4)"
            }} />}{<p className="text-sm font-semibold text-white">{l.owner_user_id ? "Reprovisionar Admin" : "Provisionar Empresa"}</p>}</div>}{<p className="text-xs mb-3" style={{
            color: "rgba(255,255,255,0.35)"
          }}>{l.owner_user_id ? "Recria ou atualiza o usuário admin desta empresa." : "Cria o usuário admin, vincula ao tenant e gera a assinatura trial."}</p>}{o ? <div className="space-y-3">{<div>{<label className="text-[10px] uppercase tracking-wider block mb-1" style={{
                color: "rgba(255,255,255,0.4)"
              }}>Nome do Admin</label>}{<input value={c.admin_name} onChange={a => f(i => ({
                ...i,
                admin_name: a.target.value
              }))} className={H} style={O} placeholder="João Silva" />}</div>}{<div>{<label className="text-[10px] uppercase tracking-wider block mb-1" style={{
                color: "rgba(255,255,255,0.4)"
              }}>Email do Admin</label>}{<input value={c.admin_email} onChange={a => f(i => ({
                ...i,
                admin_email: a.target.value
              }))} className={H} style={O} placeholder="admin@empresa.com" type="email" />}</div>}{<div>{<label className="text-[10px] uppercase tracking-wider block mb-1" style={{
                color: "rgba(255,255,255,0.4)"
              }}>Senha inicial</label>}{<div className="relative">{<input value={c.admin_password} onChange={a => f(i => ({
                  ...i,
                  admin_password: a.target.value
                }))} type={S ? "text" : "password"} className={H + " pr-10"} style={O} />}{<button type="button" onClick={() => N(a => !a)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">{S ? <$e className="w-4 h-4" /> : <re className="w-4 h-4" />}</button>}</div>}{<p className="text-[10px] mt-1" style={{
                color: "rgba(255,255,255,0.25)"
              }}>O admin deve alterar a senha no primeiro acesso</p>}</div>}{<div className="flex gap-2">{<button onClick={() => _(!1)} className="flex-1 py-2 rounded-lg text-sm transition-all" style={{
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)"
              }}>Cancelar</button>}{<button onClick={F} disabled={h.isPending} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2" style={{
                background: "linear-gradient(135deg,#c8590a,#e07a3a)"
              }}>{h.isPending ? <B className="w-4 h-4 animate-spin" /> : <se className="w-4 h-4" />}Confirmar</button>}</div>}</div> : <button onClick={() => {
            f(a => ({
              ...a,
              admin_email: l.owner_email ?? l.email,
              admin_name: l.owner_name ?? ""
            })), _(!0);
          }} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all" style={{
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)"
          }}>{<se className="w-4 h-4" />}{l.owner_user_id ? "Reprovisionar" : "Provisionar Agora"}</button>}</div>}{<div className="flex items-start gap-2 text-xs p-3 rounded-lg" style={{
          background: "rgba(59,130,246,0.06)",
          border: "1px solid rgba(59,130,246,0.15)",
          color: "rgba(147,197,253,0.8)"
        }}>{<z className="w-3.5 h-3.5 shrink-0 mt-0.5" />}{<span>O acesso como empresa abre a tela de login do CRM. Use as credenciais do admin do tenant para entrar.</span>}</div>}</div>}</div>}</div>;
}
function Ke() {
  le();
  const {
      data: k = []
    } = me(),
    A = xe(),
    C = pe(),
    {
      toast: u
    } = te(),
    [M, y] = x.useState(""),
    [l, V] = x.useState("all"),
    [R, b] = x.useState(!1),
    [h, v] = x.useState(null),
    [r, o] = x.useState(ae),
    [_, S] = x.useState(null),
    [N, c] = x.useState(null),
    [f, d] = x.useState(1),
    F = 20,
    {
      data: g,
      isLoading: U
    } = ue(f, F, {
      search: M,
      status: l
    }),
    n = (g == null ? void 0 : g.data) ?? [],
    E = (g == null ? void 0 : g.count) ?? 0;
  x.useEffect(() => {
    d(1);
  }, [M, l]);
  const D = () => {
      v(null), o(ae), b(!0);
    },
    a = s => {
      v(s), o({
        name: s.name,
        slug: s.slug,
        email: s.email,
        phone: s.phone ?? "",
        cnpj: s.cnpj ?? "",
        city: s.city ?? "",
        state: s.state ?? "",
        owner_name: s.owner_name ?? "",
        owner_email: s.owner_email ?? "",
        plan_id: s.plan_id ?? "",
        status: s.status
      }), b(!0), S(null), c(null);
    },
    i = async () => {
      if (!r.name || !r.email) {
        u({
          title: "Preencha nome e email",
          variant: "destructive"
        });
        return;
      }
      try {
        h ? (await C.mutateAsync({
          id: h.id,
          ...r,
          status: r.status
        }), u({
          title: "Empresa atualizada com sucesso"
        })) : (await A.mutateAsync({
          ...r,
          plan_id: r.plan_id || null
        }), u({
          title: "Empresa criada!",
          description: "Abra os detalhes e clique em Provisionar para configurar o acesso."
        })), b(!1);
      } catch (s) {
        u({
          title: "Erro ao salvar empresa",
          description: J(s),
          variant: "destructive"
        });
      }
    },
    T = async (s, t) => {
      var P;
      try {
        await C.mutateAsync({
          id: s.id,
          status: t
        }), u({
          title: `Status alterado para ${((P = X[t]) == null ? void 0 : P.label) ?? t}`
        }), S(null);
      } catch (j) {
        u({
          title: "Erro ao alterar status",
          description: J(j),
          variant: "destructive"
        });
      }
    },
    de = s => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    p = "w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-all",
    m = {
      background: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(255,255,255,0.1)"
    },
    I = n.reduce((s, t) => (s[t.status] = (s[t.status] ?? 0) + 1, s), {});
  return <be>{<div className={`flex gap-5 transition-all ${N ? "items-start" : ""}`}>{<div className={`flex-1 min-w-0 space-y-5 transition-all ${N ? "max-w-[calc(100%-380px)]" : ""}`}>{<div className="flex items-center justify-between">{<div>{<h1 className="text-2xl font-bold text-white">Empresas</h1>}{<p className="text-sm mt-0.5" style={{
              color: "rgba(255,255,255,0.35)"
            }}>{E} empresa{E !== 1 ? "s" : ""} cadastrada{E !== 1 ? "s" : ""}</p>}</div>}{<div className="flex items-center gap-2">{<button onClick={() => Ne(n, [{
              key: "name",
              label: "Empresa"
            }, {
              key: "email",
              label: "Email"
            }, {
              key: "owner_name",
              label: "Responsável"
            }, {
              key: "owner_email",
              label: "Email Responsável"
            }, {
              key: "status",
              label: "Status"
            }, {
              key: "created_at",
              label: "Criado em"
            }], "empresas")} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all" style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)"
            }} title="Exportar CSV">{<W className="w-4 h-4" />} CSV</button>}{<button onClick={() => fe("Relatório de Empresas", n, [{
              key: "name",
              label: "Empresa"
            }, {
              key: "email",
              label: "Email"
            }, {
              key: "owner_name",
              label: "Responsável"
            }, {
              key: "owner_email",
              label: "Email Responsável"
            }, {
              key: "status",
              label: "Status"
            }, {
              key: "created_at",
              label: "Criado em",
              format: s => s ? w(new Date(String(s)), "dd/MM/yyyy") : "-"
            }], "empresas")} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all" style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)"
            }} title="Exportar PDF">{<W className="w-4 h-4" />} PDF</button>}{<button onClick={D} className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all" style={{
              background: "linear-gradient(135deg,#c8590a,#e07a3a)",
              boxShadow: "0 4px 14px rgba(200,89,10,0.3)"
            }}>{<we className="w-4 h-4" />} Nova Empresa</button>}</div>}</div>}{<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[{
            label: "Ativas",
            value: I.active ?? 0,
            color: "#34d399"
          }, {
            label: "Trial",
            value: I.trial ?? 0,
            color: "#fbbf24"
          }, {
            label: "Suspensas",
            value: I.suspended ?? 0,
            color: "#f87171"
          }, {
            label: "Canceladas",
            value: I.cancelled ?? 0,
            color: "rgba(255,255,255,0.3)"
          }].map(({
            label: s,
            value: t,
            color: P
          }) => <div className="p-3 rounded-xl text-center" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)"
          }}>{<p className="text-xl font-bold" style={{
              color: P
            }}>{t}</p>}{<p className="text-[11px] mt-0.5" style={{
              color: "rgba(255,255,255,0.35)"
            }}>{s}</p>}</div>)}</div>}{<div className="flex flex-col sm:flex-row gap-3">{<div className="relative flex-1">{<ke className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />}{<input value={M} onChange={s => y(s.target.value)} placeholder="Buscar por nome, email ou responsável..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all" style={m} />}</div>}{<select value={l} onChange={s => V(s.target.value)} className="px-3 py-2.5 rounded-xl text-sm text-slate-300 focus:outline-none transition-all" style={m}>{<option value="all">Todos os status</option>}{<option value="active">Ativo</option>}{<option value="trial">Trial</option>}{<option value="suspended">Suspenso</option>}{<option value="cancelled">Cancelado</option>}</select>}</div>}{<div className="rounded-xl overflow-hidden" style={{
          border: "1px solid rgba(255,255,255,0.07)"
        }}>{U ? <div className="flex items-center justify-center py-20">{<B className="w-6 h-6 animate-spin" style={{
              color: "#c8590a"
            }} />}</div> : n.length === 0 ? <div className="text-center py-20">{<q className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" />}{<p className="text-sm" style={{
              color: "rgba(255,255,255,0.3)"
            }}>Nenhuma empresa encontrada</p>}</div> : <div className="overflow-x-auto">{<table className="w-full text-sm">{<thead>{<tr style={{
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.02)"
                }}>{<th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{
                    color: "rgba(255,255,255,0.35)"
                  }}>Empresa</th>}{<th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hidden md:table-cell" style={{
                    color: "rgba(255,255,255,0.35)"
                  }}>Responsável</th>}{<th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hidden lg:table-cell" style={{
                    color: "rgba(255,255,255,0.35)"
                  }}>Plano</th>}{<th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{
                    color: "rgba(255,255,255,0.35)"
                  }}>Status</th>}{<th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hidden xl:table-cell" style={{
                    color: "rgba(255,255,255,0.35)"
                  }}>Criado em</th>}{<th className="w-16 px-4 py-3" />}</tr>}</thead>}{<tbody>{n.map(s => {
                  var K;
                  const t = X[s.status],
                    P = (t == null ? void 0 : t.icon) ?? G,
                    j = N === s.id;
                  return <tr onClick={() => c(j ? null : s.id)} className="cursor-pointer transition-all" style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: j ? "rgba(200,89,10,0.08)" : void 0,
                    borderLeft: j ? "2px solid #c8590a" : "2px solid transparent"
                  }} onMouseEnter={L => {
                    j || (L.currentTarget.style.background = "rgba(255,255,255,0.03)");
                  }} onMouseLeave={L => {
                    j || (L.currentTarget.style.background = "transparent");
                  }}>{<td className="px-5 py-4">{<div className="flex items-center gap-3">{<div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm" style={{
                          background: "rgba(200,89,10,0.12)",
                          border: "1px solid rgba(200,89,10,0.2)",
                          color: "#c8590a"
                        }}>{s.name.charAt(0).toUpperCase()}</div>}{<div>{<p className="font-medium text-white">{s.name}</p>}{<p className="text-xs" style={{
                            color: "rgba(255,255,255,0.35)"
                          }}>{s.email}</p>}</div>}</div>}</td>}{<td className="px-4 py-4 hidden md:table-cell">{<p style={{
                        color: "rgba(255,255,255,0.7)"
                      }}>{s.owner_name ?? "—"}</p>}{<p className="text-xs" style={{
                        color: "rgba(255,255,255,0.35)"
                      }}>{s.owner_email ?? ""}</p>}</td>}{<td className="px-4 py-4 hidden lg:table-cell">{<span style={{
                        color: "rgba(255,255,255,0.6)"
                      }}>{((K = s.plan) == null ? void 0 : K.name) ?? "Sem plano"}</span>}</td>}{<td className="px-4 py-4">{<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${t == null ? void 0 : t.bg} ${t == null ? void 0 : t.color}`}>{<P className="w-3 h-3" />}{t == null ? void 0 : t.label}</span>}{!s.owner_user_id && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded text-amber-400" style={{
                        background: "rgba(251,191,36,0.1)",
                        border: "1px solid rgba(251,191,36,0.2)"
                      }}>Não provisionado</span>}</td>}{<td className="px-4 py-4 hidden xl:table-cell text-xs" style={{
                      color: "rgba(255,255,255,0.35)"
                    }}>{s.created_at ? w(new Date(s.created_at), "dd/MM/yyyy", {
                        locale: $
                      }) : "—"}</td>}{<td className="px-4 py-4" onClick={L => L.stopPropagation()}>{<div className="flex items-center gap-1">{<button onClick={() => c(j ? null : s.id)} className="p-1.5 rounded-lg transition-colors text-xs font-medium" style={j ? {
                          background: "rgba(200,89,10,0.15)",
                          color: "#e07a3a"
                        } : {
                          color: "rgba(255,255,255,0.3)"
                        }} title="Ver detalhes">{<re className="w-4 h-4" />}</button>}{<div className="relative">{<button onClick={() => S(_ === s.id ? null : s.id)} className="p-1.5 rounded-lg transition-colors" style={{
                            color: "rgba(255,255,255,0.3)"
                          }}>{<_e className="w-4 h-4" />}</button>}{_ === s.id && <div className="absolute right-0 top-8 z-50 w-44 rounded-xl shadow-xl overflow-hidden" style={{
                            background: "#1a2744",
                            border: "1px solid rgba(255,255,255,0.1)"
                          }}>{<button onClick={() => a(s)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors text-left hover:bg-white/5" style={{
                              color: "rgba(255,255,255,0.7)"
                            }}>{<ie className="w-3.5 h-3.5" />} Editar</button>}{s.status !== "active" && <button onClick={() => T(s, "active")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-400 transition-colors hover:bg-white/5">{<ne className="w-3.5 h-3.5" />} Ativar</button>}{s.status !== "suspended" && <button onClick={() => T(s, "suspended")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-400 transition-colors hover:bg-white/5">{<oe className="w-3.5 h-3.5" />} Suspender</button>}{s.status !== "cancelled" && <button onClick={() => T(s, "cancelled")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/5">{<Y className="w-3.5 h-3.5" />} Cancelar</button>}</div>}</div>}</div>}</td>}</tr>;
                })}</tbody>}</table>}</div>}{<ve page={f} pageSize={F} total={E} onPageChange={d} />}</div>}</div>}{N && <div className="w-[370px] shrink-0 rounded-2xl sticky top-4 overflow-hidden" style={{
        background: "#0f1829",
        border: "1px solid rgba(200,89,10,0.25)",
        boxShadow: "0 0 40px rgba(200,89,10,0.08)",
        maxHeight: "calc(100vh - 5rem)"
      }}>{<Ue tenantId={N} onClose={() => c(null)} onEdit={a} onStatusChange={T} />}</div>}</div>}{R && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">{<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => b(!1)} />}{<div className="relative rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto" style={{
        background: "#0f1829",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>{<div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10" style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "#0f1829"
        }}>{<div className="flex items-center gap-2">{<q className="w-4 h-4" style={{
              color: "#c8590a"
            }} />}{<h2 className="text-base font-semibold text-white">{h ? "Editar Empresa" : "Nova Empresa"}</h2>}</div>}{<button onClick={() => b(!1)} className="text-slate-400 hover:text-white transition-colors">{<ce className="w-5 h-5" />}</button>}</div>}{<div className="p-6 space-y-5">{<div>{<p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{
              color: "rgba(255,255,255,0.3)"
            }}>Dados da Empresa</p>}{<div className="grid grid-cols-2 gap-3">{<div className="col-span-2">{<label className="block text-xs font-medium mb-1.5" style={{
                  color: "rgba(255,255,255,0.5)"
                }}>Nome da Empresa *</label>}{<input value={r.name} onChange={s => o(t => ({
                  ...t,
                  name: s.target.value,
                  slug: de(s.target.value)
                }))} className={p} style={m} placeholder="Ex: Imobiliária Central" />}</div>}{<div>{<label className="block text-xs font-medium mb-1.5" style={{
                  color: "rgba(255,255,255,0.5)"
                }}>Slug (URL)</label>}{<input value={r.slug} onChange={s => o(t => ({
                  ...t,
                  slug: s.target.value
                }))} className={p} style={m} placeholder="imobiliaria-central" />}</div>}{<div>{<label className="block text-xs font-medium mb-1.5" style={{
                  color: "rgba(255,255,255,0.5)"
                }}>CNPJ</label>}{<input value={r.cnpj} onChange={s => o(t => ({
                  ...t,
                  cnpj: s.target.value
                }))} className={p} style={m} placeholder="00.000.000/0001-00" />}</div>}{<div>{<label className="block text-xs font-medium mb-1.5" style={{
                  color: "rgba(255,255,255,0.5)"
                }}>Email *</label>}{<input value={r.email} onChange={s => o(t => ({
                  ...t,
                  email: s.target.value
                }))} type="email" className={p} style={m} placeholder="contato@empresa.com" />}</div>}{<div>{<label className="block text-xs font-medium mb-1.5" style={{
                  color: "rgba(255,255,255,0.5)"
                }}>Telefone</label>}{<input value={r.phone} onChange={s => o(t => ({
                  ...t,
                  phone: s.target.value
                }))} className={p} style={m} placeholder="(11) 99999-9999" />}</div>}{<div>{<label className="block text-xs font-medium mb-1.5" style={{
                  color: "rgba(255,255,255,0.5)"
                }}>Cidade</label>}{<input value={r.city} onChange={s => o(t => ({
                  ...t,
                  city: s.target.value
                }))} className={p} style={m} placeholder="São Paulo" />}</div>}{<div>{<label className="block text-xs font-medium mb-1.5" style={{
                  color: "rgba(255,255,255,0.5)"
                }}>Estado</label>}{<input value={r.state} onChange={s => o(t => ({
                  ...t,
                  state: s.target.value
                }))} className={p} style={m} placeholder="SP" maxLength={2} />}</div>}</div>}</div>}{<div style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: "1rem"
          }}>{<p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{
              color: "rgba(255,255,255,0.3)"
            }}>Responsável</p>}{<div className="grid grid-cols-2 gap-3">{<div>{<label className="block text-xs font-medium mb-1.5" style={{
                  color: "rgba(255,255,255,0.5)"
                }}>Nome</label>}{<input value={r.owner_name} onChange={s => o(t => ({
                  ...t,
                  owner_name: s.target.value
                }))} className={p} style={m} placeholder="João Silva" />}</div>}{<div>{<label className="block text-xs font-medium mb-1.5" style={{
                  color: "rgba(255,255,255,0.5)"
                }}>Email</label>}{<input value={r.owner_email} onChange={s => o(t => ({
                  ...t,
                  owner_email: s.target.value
                }))} type="email" className={p} style={m} placeholder="joao@empresa.com" />}</div>}</div>}</div>}{<div style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: "1rem"
          }}>{<p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{
              color: "rgba(255,255,255,0.3)"
            }}>Plano e Status</p>}{<div className="grid grid-cols-2 gap-3">{<div>{<label className="block text-xs font-medium mb-1.5" style={{
                  color: "rgba(255,255,255,0.5)"
                }}>Plano</label>}{<select value={r.plan_id} onChange={s => o(t => ({
                  ...t,
                  plan_id: s.target.value
                }))} className={p} style={m}>{<option value="">Sem plano</option>}{k.map(s => <option value={s.id}>{s.name} — R${s.price_monthly}/mês</option>)}</select>}</div>}{<div>{<label className="block text-xs font-medium mb-1.5" style={{
                  color: "rgba(255,255,255,0.5)"
                }}>Status</label>}{<select value={r.status} onChange={s => o(t => ({
                  ...t,
                  status: s.target.value
                }))} className={p} style={m}>{<option value="trial">Trial (14 dias)</option>}{<option value="active">Ativo</option>}{<option value="suspended">Suspenso</option>}{<option value="cancelled">Cancelado</option>}</select>}</div>}</div>}</div>}{!h && <div className="flex items-start gap-2 p-3 rounded-lg text-xs" style={{
            background: "rgba(200,89,10,0.08)",
            border: "1px solid rgba(200,89,10,0.2)",
            color: "#e07a3a"
          }}>{<z className="w-3.5 h-3.5 shrink-0 mt-0.5" />}{<span>Após criar, abra os detalhes da empresa e clique em {<strong>"Provisionar"</strong>} para criar o usuário admin e configurar o acesso.</span>}</div>}{<div className="flex gap-3 pt-1">{<button onClick={() => b(!1)} className="flex-1 py-2.5 rounded-xl text-sm transition-all" style={{
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)"
            }}>Cancelar</button>}{<button onClick={i} disabled={A.isPending || C.isPending} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{
              background: "linear-gradient(135deg,#c8590a,#e07a3a)"
            }}>{(A.isPending || C.isPending) && <B className="w-4 h-4 animate-spin" />}{h ? "Salvar alterações" : "Criar empresa"}</button>}</div>}</div>}</div>}</div>}</be>;
}
export { Ke as default };