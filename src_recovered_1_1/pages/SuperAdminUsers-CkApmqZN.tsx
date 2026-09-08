/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminUsers-CkApmqZN.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r } from "@/components/vendor-Jm1Lk";
import { r as q, a as G, s as R, S as I } from "@/components/SuperAdminLayout";
import { S as z, b as c, c as t, h as $, a as k, e as H, d as K, f as j, g as J } from "@/components/index";
import { b as Q, I as W } from "@/components/index-C9";
import { S as g, a as b, b as y, c as f, d as a } from "@/components/ui/select";
import { D as X, a as Y, b as Z, d as ee } from "@/components/ui/dropdown-menu";
import { t as se } from "@/components/error-messages";
import { b as te, c as ae } from "@/components/export-utils";
import { U as v, r as A, bk as le, b8 as re, ai as E, S as oe, O as ie, l as ne, d as M, b1 as ce, bl as de, b5 as me } from "@/components/ui";
import "@/components/logo-estate";
import "@/lib/supabase";
import "@/components/index";
import "@/components/xlsx";
const _ = {
    admin: "Admin",
    manager: "Gestor",
    agent: "Consultor",
    client: "Cliente"
  },
  xe = {
    admin: "accent",
    manager: "info",
    agent: "success",
    client: "neutral"
  };
function Ae() {
  const {
      toast: N
    } = Q(),
    [S, w] = r.useState(1),
    C = 20,
    [d, T] = r.useState(""),
    [m, B] = r.useState("all"),
    [x, P] = r.useState("all"),
    [h, U] = r.useState("all"),
    {
      data: o,
      isLoading: F
    } = q(S, C, {
      search: d,
      role: m,
      tenant_id: x,
      status: h
    }),
    l = (o == null ? void 0 : o.data) ?? [],
    u = (o == null ? void 0 : o.count) ?? 0,
    {
      data: p
    } = G(),
    L = (p == null ? void 0 : p.data) ?? [],
    D = R();
  r.useEffect(() => {
    w(1);
  }, [d, m, x, h]);
  const n = r.useMemo(() => ({
      total: u,
      active: l.filter(s => s.is_active).length,
      admins: l.filter(s => s.role === "admin" || s.role === "manager").length,
      agents: l.filter(s => s.role === "agent").length
    }), [l, u]),
    O = async (s, i) => {
      try {
        await D.mutateAsync({
          userId: s,
          active: !i
        }), N({
          title: i ? "Usuário bloqueado" : "Usuário ativado"
        });
      } catch (V) {
        N({
          title: "Erro",
          description: se(V),
          variant: "destructive"
        });
      }
    };
  return <I>{<div className="space-y-6">{<z title="Usuários Globais" description="Todos os usuários cadastrados no sistema, em todas as empresas" icon={v} />}{<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{<c label="Total" value={n.total} icon={v} iconColor="#60a5fa" />}{<c label="Ativos" value={n.active} icon={A} iconColor="#10b981" />}{<c label="Gestores" value={n.admins} icon={le} iconColor={t.accent} />}{<c label="Consultores" value={n.agents} icon={re} iconColor="#8b5cf6" />}</div>}{<$>{<k variant="secondary" icon={E} size="sm" onClick={() => te(l, [{
          key: "full_name",
          label: "Nome"
        }, {
          key: "email",
          label: "Email"
        }, {
          key: "role",
          label: "Papel"
        }, {
          key: "is_active",
          label: "Ativo"
        }, {
          key: "tenant",
          label: "Empresa"
        }, {
          key: "created_at",
          label: "Criado em"
        }], "usuarios")}>CSV</k>}{<k variant="secondary" icon={E} size="sm" onClick={() => ae("Relatório de Usuários", l, [{
          key: "full_name",
          label: "Nome"
        }, {
          key: "email",
          label: "Email"
        }, {
          key: "role",
          label: "Papel",
          format: s => _[String(s)] || String(s)
        }, {
          key: "is_active",
          label: "Ativo",
          format: s => s ? "Sim" : "Não"
        }, {
          key: "tenant",
          label: "Empresa",
          format: s => s && typeof s == "object" && "name" in s ? String(s.name) : "-"
        }, {
          key: "created_at",
          label: "Criado em",
          format: s => s ? me(new Date(String(s)), "dd/MM/yyyy") : "-"
        }], "usuarios")}>PDF</k>}{<div className="relative flex-1 min-w-[200px]">{<oe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{
            color: t.textMuted
          }} />}{<W placeholder="Buscar por nome ou email..." value={d} onChange={s => T(s.target.value)} className="pl-9 h-9 bg-transparent border-white/10 text-white placeholder:text-white/30" />}</div>}{<g value={m} onValueChange={B}>{<b className="w-[140px] h-9 bg-transparent border-white/10 text-white">{<ie className="w-3.5 h-3.5 mr-1" />}{<y placeholder="Papel" />}</b>}{<f className="bg-slate-800 border-slate-700 text-white">{<a value="all">Todos papéis</a>}{<a value="admin">Admin</a>}{<a value="manager">Gestor</a>}{<a value="agent">Consultor</a>}{<a value="client">Cliente</a>}</f>}</g>}{<g value={x} onValueChange={P}>{<b className="w-[180px] h-9 bg-transparent border-white/10 text-white">{<ne className="w-3.5 h-3.5 mr-1" />}{<y placeholder="Empresa" />}</b>}{<f className="bg-slate-800 border-slate-700 text-white">{<a value="all">Todas empresas</a>}{L.map(s => <a value={s.id}>{s.name}</a>)}</f>}</g>}{<g value={h} onValueChange={U}>{<b className="w-[130px] h-9 bg-transparent border-white/10 text-white">{<y />}</b>}{<f className="bg-slate-800 border-slate-700 text-white">{<a value="all">Todos status</a>}{<a value="active">Ativos</a>}{<a value="inactive">Bloqueados</a>}</f>}</g>}</$>}{<H noPadding={!0}>{F ? <div className="p-8 text-center text-sm" style={{
          color: t.textMuted
        }}>Carregando...</div> : l.length === 0 ? <K icon={v} title="Nenhum usuário" description="Não há usuários para os filtros aplicados" /> : <div className="overflow-x-auto">{<table className="w-full text-sm">{<thead>{<tr style={{
                borderBottom: `1px solid ${t.border}`
              }}>{<th className="text-left px-5 py-3 font-medium" style={{
                  color: t.textMuted
                }}>Usuário</th>}{<th className="text-left px-5 py-3 font-medium" style={{
                  color: t.textMuted
                }}>Empresa</th>}{<th className="text-left px-5 py-3 font-medium" style={{
                  color: t.textMuted
                }}>Papel</th>}{<th className="text-left px-5 py-3 font-medium" style={{
                  color: t.textMuted
                }}>Status</th>}{<th className="px-5 py-3 w-12" />}</tr>}</thead>}{<tbody>{l.map(s => {
                var i;
                return <tr className="hover:bg-white/[0.02] transition-colors" style={{
                  borderBottom: `1px solid ${t.borderSubtle}`
                }}>{<td className="px-5 py-3">{<div className="flex items-center gap-3">{<div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0" style={{
                        background: t.accentBg,
                        color: t.accentLight
                      }}>{(s.full_name || "?").slice(0, 2).toUpperCase()}</div>}{<div className="min-w-0">{<p className="font-medium truncate" style={{
                          color: t.textPrimary
                        }}>{s.full_name}</p>}{<p className="text-xs truncate" style={{
                          color: t.textMuted
                        }}>{s.email}</p>}</div>}</div>}</td>}{<td className="px-5 py-3" style={{
                    color: t.textSecondary
                  }}>{((i = s.tenant) == null ? void 0 : i.name) || <span style={{
                      color: t.textMuted
                    }}>—</span>}</td>}{<td className="px-5 py-3">{<j tone={xe[s.role] || "neutral"}>{_[s.role] || s.role}</j>}</td>}{<td className="px-5 py-3">{s.is_active ? <j tone="success" icon={A}>Ativo</j> : <j tone="danger" icon={M}>Bloqueado</j>}</td>}{<td className="px-2 py-3">{<X>{<Y asChild={!0}>{<button className="p-1.5 rounded hover:bg-white/5">{<ce className="w-4 h-4" style={{
                            color: t.textMuted
                          }} />}</button>}</Y>}{<Z align="end" className="bg-slate-800 border-slate-700">{<ee onClick={() => O(s.id, !!s.is_active)} className="text-slate-300 focus:bg-slate-700">{s.is_active ? <M className="w-4 h-4 mr-2" /> : <de className="w-4 h-4 mr-2" />}{s.is_active ? "Bloquear" : "Desbloquear"}</ee>}</Z>}</X>}</td>}</tr>;
              })}</tbody>}</table>}</div>}{<J page={S} pageSize={C} total={u} onPageChange={w} />}</H>}</div>}</I>;
}
export { Ae as default };