/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminDashboard-D7Euo-CC.js | AST | sanitizado | Fase 3 ==*/
import { u as J, j as e } from "@/components/query";
import { u as ee, r as h } from "@/components/vendor-Jm1Lk";
import { s as w } from "@/components/index-C9";
import { u as se, a as te, b as ae, c as re, d as ne, e as le, f as ie, g as oe, S as ce } from "@/components/SuperAdminLayout";
import { S as de, a as M, b as m, c as t, d as j, e as R, f as q } from "@/components/index";
import { u as ue, v as me, g as xe, aP as G, aU as Q, bd as pe, be as B, bf as he, k as z, l as L, ac as be, aD as fe, D as je, K as ye, a as g, U as ge, b5 as P, bg as ve } from "@/components/ui";
import { R as _, C as I, X as U, Y as W, T as A, a as Ne } from "@/components/generateCategoricalChart";
import { A as V, a as E } from "@/components/AreaChart";
import { P as ke, a as Ce } from "@/components/PieChart";
import { p as D } from "@/components/pt-BR";
import "@/lib/supabase";
import "@/components/logo-estate";
const x = d => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0
  }).format(d),
  X = d => {
    const [a, b] = d.split("-");
    return P(new Date(Number(a), Number(b) - 1, 1), "MMM/yy", {
      locale: D
    });
  },
  v = ["#c8590a", "#1e2d5e", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4"];
function Fe() {
  const d = ee(),
    {
      data: a
    } = se(),
    {
      data: b
    } = te(),
    c = (b == null ? void 0 : b.data) ?? [],
    N = new Date(),
    Y = {
      startDate: new Date(N.getFullYear(), N.getMonth(), 1).toISOString().slice(0, 10),
      endDate: N.toISOString().slice(0, 10)
    },
    {
      data: l
    } = ae(Y),
    {
      data: H = []
    } = re(6),
    {
      data: n
    } = ne(),
    {
      data: Se = []
    } = le(),
    {
      data: k
    } = ie(),
    Z = (k == null ? void 0 : k.data) ?? [],
    {
      data: T = []
    } = oe(12),
    [p, C] = h.useState(0),
    u = J();
  h.useEffect(() => {
    const s = [w.channel("sa-tenants-realtime").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "tenants"
    }, () => {
      u.invalidateQueries({
        queryKey: ["sa-tenants"]
      }), u.invalidateQueries({
        queryKey: ["sa-metrics"]
      }), u.invalidateQueries({
        queryKey: ["sa-health"]
      });
    }).subscribe(), w.channel("sa-subscriptions-realtime").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "subscriptions"
    }, () => {
      u.invalidateQueries({
        queryKey: ["sa-subscriptions"]
      }), u.invalidateQueries({
        queryKey: ["sa-metrics"]
      }), u.invalidateQueries({
        queryKey: ["sa-health"]
      });
    }).subscribe(), w.channel("sa-financial-realtime").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "sa_financial_transactions"
    }, () => {
      u.invalidateQueries({
        queryKey: ["sa-financial"]
      }), u.invalidateQueries({
        queryKey: ["sa-revenue-timeseries"]
      });
    }).subscribe()];
    return () => {
      s.forEach(r => r.unsubscribe());
    };
  }, [u]), ((a == null ? void 0 : a.mrr) ?? 0) * 100, ((a == null ? void 0 : a.arr) ?? 0) * 100;
  const K = h.useMemo(() => {
      const s = (a == null ? void 0 : a.totalTenants) ?? 0;
      if (s === 0) return 0;
      const r = c.filter(i => i.status === "cancelled").length;
      return Number((r / s * 100).toFixed(1));
    }, [c, a]),
    y = h.useMemo(() => {
      const s = new Map();
      return c.forEach(r => {
        var f;
        const i = ((f = r.plan) == null ? void 0 : f.name) || "Sem plano";
        s.set(i, (s.get(i) || 0) + 1);
      }), Array.from(s.entries()).map(([r, i]) => ({
        name: r,
        value: i
      }));
    }, [c]),
    $ = h.useMemo(() => c.slice(0, 5), [c]),
    O = h.useMemo(() => {
      const s = [];
      return n && (n.trials_expiring_7d > 0 && s.push({
        icon: ue,
        tone: "warning",
        label: "Trials expirando em 7 dias",
        count: n.trials_expiring_7d,
        link: "/super-admin/tenants"
      }), n.trials_expired > 0 && s.push({
        icon: me,
        tone: "danger",
        label: "Trials já expirados",
        count: n.trials_expired,
        link: "/super-admin/tenants"
      }), n.churn_at_risk > 0 && s.push({
        icon: xe,
        tone: "danger",
        label: "Empresas suspensas",
        count: n.churn_at_risk,
        link: "/super-admin/tenants"
      }), n.subs_ending_30d > 0 && s.push({
        icon: G,
        tone: "info",
        label: "Assinaturas vencendo em 30 dias",
        count: n.subs_ending_30d,
        link: "/super-admin/subscriptions"
      }), n.mrr_at_risk > 0 && s.push({
        icon: Q,
        tone: "danger",
        label: "MRR em risco",
        count: n.mrr_at_risk,
        link: "/super-admin/subscriptions"
      })), s;
    }, [n]);
  return <ce>{<div className="space-y-6">{<de title="Visão Executiva" description="Indicadores estratégicos do seu SaaS em tempo real" icon={pe} actions={<M variant="secondary" icon={B} onClick={() => d("/super-admin/financial")}>Painel Financeiro</M>} />}{<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{<m label="MRR" value={x((a == null ? void 0 : a.mrr) ?? 0)} icon={he} iconColor="#10b981" subtext="Receita recorrente mensal" />}{<m label="ARR Projetado" value={x((a == null ? void 0 : a.arr) ?? 0)} icon={z} iconColor={t.accent} subtext="MRR x 12 meses" />}{<m label="Empresas Ativas" value={`${(a == null ? void 0 : a.activeTenants) ?? 0}/${(a == null ? void 0 : a.totalTenants) ?? 0}`} icon={L} iconColor="#60a5fa" subtext={`${(a == null ? void 0 : a.trialTenants) ?? 0} em trial`} />}{<m label="Churn Estimado" value={`${K}%`} icon={be} iconColor={K > 5 ? "#f87171" : "#10b981"} subtext="Empresas canceladas / total" />}</div>}{<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{<m label="Receitas (este mês)" value={x(((l == null ? void 0 : l.totalIncome) ?? 0) / 100)} icon={fe} iconColor="#10b981" subtext={`${(l == null ? void 0 : l.transactionCount) ?? 0} transações`} />}{<m label="Despesas (este mês)" value={x(((l == null ? void 0 : l.totalExpense) ?? 0) / 100)} icon={B} iconColor="#f87171" />}{<m label="Resultado líquido" value={x(((l == null ? void 0 : l.netResult) ?? 0) / 100)} icon={je} iconColor={((l == null ? void 0 : l.netResult) ?? 0) >= 0 ? "#10b981" : "#f87171"} />}{<m label="MRR em Risco" value={x((n == null ? void 0 : n.mrr_at_risk) ?? 0)} icon={Q} iconColor={((n == null ? void 0 : n.mrr_at_risk) ?? 0) > 0 ? "#f87171" : "#10b981"} subtext="De tenants suspensas/trial" />}</div>}{<div className="relative overflow-hidden rounded-2xl mb-6" style={{
        background: t.surfaceCard,
        border: `1px solid ${t.borderSubtle}`
      }}>{<div className="flex items-center justify-between px-5 pt-5 pb-2">{<div>{p === 0 && <span className="block">{<h3 className="font-semibold text-sm" style={{
                color: t.textPrimary
              }}>Receita x Despesa</h3>}{<p className="text-xs" style={{
                color: t.textMuted
              }}>Últimos 6 meses</p>}</span>}{p === 1 && <span className="block">{<h3 className="font-semibold text-sm" style={{
                color: t.textPrimary
              }}>Funil de Conversão</h3>}{<p className="text-xs" style={{
                color: t.textMuted
              }}>Ciclo de vida das empresas</p>}</span>}{p === 2 && <span className="block">{<h3 className="font-semibold text-sm" style={{
                color: t.textPrimary
              }}>Evolução do MRR</h3>}{<p className="text-xs" style={{
                color: t.textMuted
              }}>Últimos 12 meses</p>}</span>}</div>}{<div className="flex items-center gap-1">{<button onClick={() => C(Math.max(0, p - 1))} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{
              color: t.textMuted
            }}>{<ye className="w-4 h-4" />}</button>}{<button onClick={() => C(Math.min(2, p + 1))} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{
              color: t.textMuted
            }}>{<g className="w-4 h-4" />}</button>}</div>}</div>}{<div className="flex transition-transform duration-500 ease-out" style={{
          transform: `translateX(-${p * 100}%)`
        }}>{<div className="w-full shrink-0 px-5 pb-5">{<div className="h-72">{<_ width="100%" height="100%">{<V data={H}>{<defs>{<linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">{<stop offset="0%" stopColor="#10b981" stopOpacity={.4} />}{<stop offset="100%" stopColor="#10b981" stopOpacity={0} />}</linearGradient>}{<linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">{<stop offset="0%" stopColor="#f87171" stopOpacity={.3} />}{<stop offset="100%" stopColor="#f87171" stopOpacity={0} />}</linearGradient>}</defs>}{<I strokeDasharray="3 3" stroke={t.border} />}{<U dataKey="month" tickFormatter={X} stroke={t.textMuted} style={{
                    fontSize: 11
                  }} />}{<W stroke={t.textMuted} style={{
                    fontSize: 11
                  }} />}{<A contentStyle={{
                    background: t.surfaceElevated,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    color: t.textPrimary
                  }} labelFormatter={s => X(String(s))} formatter={s => x(s)} />}{<E type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" name="Receita" />}{<E type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} fill="url(#expenseGrad)" name="Despesa" />}</V>}</_>}</div>}</div>}{<div className="w-full shrink-0 px-5 pb-5">{(() => {
              const s = c.length,
                r = c.filter(o => o.status === "trial").length,
                i = c.filter(o => o.status === "active").length,
                f = Z.filter(o => o.status === "active").length,
                S = [{
                  label: "Cadastradas",
                  value: s,
                  color: "#60a5fa",
                  width: 100
                }, {
                  label: "Em Trial",
                  value: r,
                  color: "#f59e0b",
                  width: s ? r / s * 100 : 0
                }, {
                  label: "Ativas",
                  value: i,
                  color: "#10b981",
                  width: s ? i / s * 100 : 0
                }, {
                  label: "Pagantes",
                  value: f,
                  color: t.accent,
                  width: s ? f / s * 100 : 0
                }];
              return s === 0 ? <j icon={ge} title="Sem empresas" description="Cadastre a primeira empresa para visualizar o funil" /> : <div className="space-y-3 py-2 max-w-2xl mx-auto">{S.map((o, F) => <div className="space-y-1">{<div className="flex items-center justify-between text-sm">{<span style={{
                      color: t.textSecondary
                    }}>{o.label}</span>}{<span className="font-medium" style={{
                      color: t.textPrimary
                    }}>{o.value}</span>}</div>}{<div className="h-2.5 rounded-full bg-white/5 overflow-hidden">{<div className="h-full rounded-full transition-all duration-700" style={{
                      width: `${Math.max(o.width, 4)}%`,
                      background: o.color
                    }} />}</div>}{F < S.length - 1 && <div className="flex justify-end text-xs" style={{
                    color: t.textMuted
                  }}>{o.value > 0 ? `${(S[F + 1].value / o.value * 100).toFixed(0)}% conversão` : "0% conversão"}</div>}</div>)}</div>;
            })()}</div>}{<div className="w-full shrink-0 px-5 pb-5">{T.length === 0 ? <j icon={z} title="Sem dados históricos" description="O snapshot do MRR será capturado mensalmente automaticamente." /> : <div className="h-72">{<_ width="100%" height="100%">{<V data={T}>{<defs>{<linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">{<stop offset="0%" stopColor={t.accent} stopOpacity={.4} />}{<stop offset="100%" stopColor={t.accent} stopOpacity={0} />}</linearGradient>}</defs>}{<I strokeDasharray="3 3" stroke={t.border} />}{<U dataKey="snapshot_month" tickFormatter={s => {
                    const [r, i] = String(s).split("-");
                    return P(new Date(Number(r), Number(i) - 1, 1), "MMM/yy", {
                      locale: D
                    });
                  }} stroke={t.textMuted} style={{
                    fontSize: 11
                  }} />}{<W stroke={t.textMuted} style={{
                    fontSize: 11
                  }} />}{<A contentStyle={{
                    background: t.surfaceElevated,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    color: t.textPrimary
                  }} formatter={s => x(s)} labelFormatter={s => {
                    const [r, i] = String(s).split("-");
                    return P(new Date(Number(r), Number(i) - 1, 1), "MMMM yyyy", {
                      locale: D
                    });
                  }} />}{<E type="monotone" dataKey="total_mrr" stroke={t.accent} strokeWidth={2} fill="url(#mrrGrad)" name="MRR" />}</V>}</_>}</div>}</div>}</div>}{<div className="flex justify-center gap-2 pb-4">{[0, 1, 2].map(s => <button onClick={() => C(s)} className="w-2 h-2 rounded-full transition-colors" style={{
            background: s === p ? t.accent : "rgba(255,255,255,0.2)"
          }} />)}</div>}</div>}{<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{<R title="Distribuição por Plano" description={`${c.length} empresas`}>{y.length === 0 ? <j icon={ve} title="Sem dados" description="Cadastre empresas e planos" /> : <div className="h-72 flex flex-col">{<div className="flex-1">{<_ width="100%" height="100%">{<ke>{<Ce data={y} innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={2}>{y.map((s, r) => <Ne fill={v[r % v.length]} stroke="none" />)}</Ce>}{<A contentStyle={{
                    background: t.surfaceElevated,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    color: t.textPrimary
                  }} />}</ke>}</_>}</div>}{<div className="space-y-1.5 pt-2 border-t" style={{
              borderColor: t.borderSubtle
            }}>{y.map((s, r) => <div className="flex items-center justify-between text-xs">{<div className="flex items-center gap-2">{<span className="w-2.5 h-2.5 rounded-full" style={{
                    background: v[r % v.length]
                  }} />}{<span style={{
                    color: t.textSecondary
                  }}>{s.name}</span>}</div>}{<span className="font-medium" style={{
                  color: t.textPrimary
                }}>{s.value}</span>}</div>)}</div>}</div>}</R>}{<R title="Alertas Operacionais" description="Itens que precisam da sua atenção" action={<M variant="ghost" size="sm" icon={g} onClick={() => d("/super-admin/health")}>Ver tudo</M>}>{O.length === 0 ? <j icon={G} title="Tudo em ordem" description="Nenhum alerta operacional no momento" /> : <div className="space-y-2">{O.map((s, r) => <button onClick={() => d(s.link)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/5" style={{
              background: t.surfaceElevated,
              border: `1px solid ${t.borderSubtle}`
            }}>{<q tone={s.tone} icon={s.icon}>{s.count}</q>}{<span className="flex-1 text-sm" style={{
                color: t.textPrimary
              }}>{s.label}</span>}{<g className="w-4 h-4" style={{
                color: t.textMuted
              }} />}</button>)}</div>}</R>}</div>}{<R title="Empresas Recentes" description="Últimas cadastradas" action={<M variant="ghost" size="sm" icon={g} onClick={() => d("/super-admin/tenants")}>Ver todas</M>}>{$.length === 0 ? <j icon={L} title="Nenhuma empresa" description="Cadastre a primeira empresa" /> : <div className="space-y-2">{$.map(s => <button onClick={() => d("/super-admin/tenants")} className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/5" style={{
            background: t.surfaceElevated,
            border: `1px solid ${t.borderSubtle}`
          }}>{<div className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm shrink-0" style={{
              background: t.accentBg,
              color: t.accentLight
            }}>{s.name.slice(0, 2).toUpperCase()}</div>}{<div className="flex-1 min-w-0">{<p className="text-sm font-medium truncate" style={{
                color: t.textPrimary
              }}>{s.name}</p>}{<p className="text-xs truncate" style={{
                color: t.textMuted
              }}>{s.owner_email || "Sem admin provisionado"}</p>}</div>}{<q tone={s.status === "active" ? "success" : s.status === "trial" ? "warning" : s.status === "suspended" ? "danger" : "neutral"}>{s.status === "active" ? "Ativo" : s.status === "trial" ? "Trial" : s.status === "suspended" ? "Suspenso" : "Cancelado"}</q>}</button>)}</div>}</R>}</div>}</ce>;
}
export { Fe as default };