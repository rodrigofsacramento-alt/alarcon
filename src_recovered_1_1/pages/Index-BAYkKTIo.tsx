/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Index-BAYkKTIo.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { u as d, r as h } from "@/components/vendor-Jm1Lk";
import { u as M, S as R, H as S, M as L } from "@/components/Header";
import { c as r, u as $ } from "@/components/index-C9";
import { j as E, T as P, k as f, e as V, l as N, m, F as w, n as T, P as I, D as y, o as F, p as O, q as D, r as C, s as z, u as U, v as G, w as k, x as p, U as q } from "@/components/ui";
import { R as K, C as W, X as B, Y as v, T as H } from "@/components/generateCategoricalChart";
import { A as X, a as b } from "@/components/AreaChart";
import "@/components/logo-estate";
import "@/components/index";
import "@/components/index";
import "@/lib/supabase";
function c({
  title: a,
  value: s,
  change: i,
  icon: n,
  variant: l = "default",
  subtitle: x
}) {
  const u = () => {
      if (!i) return null;
      switch (i.type) {
        case "increase":
          return <f className="h-3.5 w-3.5" />;
        case "decrease":
          return <P className="h-3.5 w-3.5" />;
        default:
          return <E className="h-3.5 w-3.5" />;
      }
    },
    o = () => {
      if (!i) return "";
      switch (i.type) {
        case "increase":
          return l === "default" ? "text-success" : "text-success-foreground bg-success/20";
        case "decrease":
          return l === "default" ? "text-destructive" : "text-destructive-foreground bg-destructive/20";
        default:
          return l === "default" ? "text-muted-foreground" : "text-muted-foreground bg-muted/20";
      }
    };
  return <div className={r("stat-card p-4 lg:p-6", l === "accent" && "stat-card-accent", l === "primary" && "stat-card-primary")}>{<div className="flex items-start justify-between">{<div className="space-y-0.5 lg:space-y-1 min-w-0 flex-1">{<p className={r("text-xs lg:text-sm font-medium truncate", l === "default" ? "text-muted-foreground" : "opacity-80")}>{a}</p>}{<p className={r("text-xl lg:text-2xl font-bold tracking-tight truncate", l === "default" && "text-foreground")}>{s}</p>}{x && <p className={r("text-[10px] lg:text-xs truncate", l === "default" ? "text-muted-foreground" : "opacity-70")}>{x}</p>}</div>}{n && <div className={r("flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-lg shrink-0 ml-2", l === "default" ? "bg-secondary text-primary" : "bg-white/20")}>{n}</div>}</div>}{i && <div className="mt-2 lg:mt-3 flex items-center gap-1 lg:gap-1.5 flex-wrap">{<span className={r("inline-flex items-center gap-0.5 lg:gap-1 rounded-full px-1.5 lg:px-2 py-0.5 text-[10px] lg:text-xs font-medium", o())}>{u()}{Math.abs(i.value)}%</span>}{<span className={r("text-[10px] lg:text-xs hidden sm:inline", l === "default" ? "text-muted-foreground" : "opacity-70")}>vs. mês anterior</span>}</div>}</div>;
}
const g = [{
  label: "Novos Leads",
  count: 248,
  value: "R$ 186M",
  conversion: 100,
  color: "bg-chart-1"
}, {
  label: "Qualificados",
  count: 186,
  value: "R$ 142M",
  conversion: 75,
  color: "bg-chart-2"
}, {
  label: "Em Atendimento",
  count: 124,
  value: "R$ 98M",
  conversion: 67,
  color: "bg-chart-3"
}, {
  label: "Visita Agendada",
  count: 68,
  value: "R$ 54M",
  conversion: 55,
  color: "bg-chart-4"
}, {
  label: "Proposta Enviada",
  count: 42,
  value: "R$ 38M",
  conversion: 62,
  color: "bg-chart-5"
}, {
  label: "Em Negociação",
  count: 28,
  value: "R$ 24M",
  conversion: 67,
  color: "bg-success"
}, {
  label: "Fechados",
  count: 18,
  value: "R$ 16.2M",
  conversion: 64,
  color: "bg-accent"
}];
function J() {
  const a = g[0].count;
  return <div className="rounded-xl bg-card p-6 shadow-md">{<div className="flex items-center justify-between mb-6">{<div>{<h3 className="text-lg font-semibold text-foreground">Funil de Vendas</h3>}{<p className="text-sm text-muted-foreground">Conversão por etapa</p>}</div>}{<select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent">{<option>Este mês</option>}{<option>Últimos 7 dias</option>}{<option>Últimos 30 dias</option>}{<option>Este trimestre</option>}</select>}</div>}{<div className="space-y-3">{g.map((s, i) => {
        const n = s.count / a * 100;
        return <div className="group relative">{<div className="funnel-stage">{<div className="flex items-center gap-3 z-10 relative">{<div className={r("h-2.5 w-2.5 rounded-full", s.color)} />}{<span className="text-sm font-medium text-foreground">{s.label}</span>}</div>}{<div className="flex items-center gap-4 z-10 relative">{<span className="text-sm font-semibold text-foreground">{s.count}</span>}{<span className="text-sm text-muted-foreground min-w-[80px] text-right">{s.value}</span>}{s.conversion !== void 0 && i > 0 && <span className={r("text-xs font-medium min-w-[48px] text-right", s.conversion >= 60 ? "text-success" : s.conversion >= 40 ? "text-warning" : "text-destructive")}>{s.conversion}%</span>}</div>}{<div className={r("absolute left-0 top-0 h-full rounded-lg opacity-10 transition-all duration-300 group-hover:opacity-20", s.color)} style={{
              width: `${n}%`
            }} />}</div>}{i < g.length - 1 && <div className="ml-[18px] h-2 w-px bg-border" />}</div>;
      })}</div>}{<div className="mt-6 pt-4 border-t border-border flex items-center justify-between">{<div>{<p className="text-sm text-muted-foreground">Taxa de conversão geral</p>}{<p className="text-xl font-bold text-foreground">7.3%</p>}</div>}{<div className="text-right">{<p className="text-sm text-muted-foreground">Ticket médio</p>}{<p className="text-xl font-bold text-accent">R$ 900.000</p>}</div>}</div>}</div>;
}
const Q = [{
  icon: <V className="h-5 w-5" />,
  label: "Novo Lead",
  description: "Cadastrar lead manualmente",
  color: "bg-accent text-accent-foreground",
  path: "/leads?action=new"
}, {
  icon: <N className="h-5 w-5" />,
  label: "Novo Imóvel",
  description: "Cadastrar imóvel para captação",
  color: "bg-primary text-primary-foreground",
  path: "/imoveis?action=new"
}, {
  icon: <m className="h-5 w-5" />,
  label: "Agendar Visita",
  description: "Criar agendamento de visita",
  color: "bg-info text-info-foreground",
  path: "/agenda?action=new"
}, {
  icon: <w className="h-5 w-5" />,
  label: "Nova Proposta",
  description: "Gerar proposta comercial",
  color: "bg-success text-success-foreground",
  path: "/propostas?action=new"
}, {
  icon: <T className="h-5 w-5" />,
  label: "Enviar Imóveis",
  description: "Enviar sugestões ao cliente",
  color: "bg-chart-4 text-info-foreground",
  path: "/imoveis"
}, {
  icon: <I className="h-5 w-5" />,
  label: "Registrar Contato",
  description: "Registrar interação com cliente",
  color: "bg-warning text-warning-foreground",
  path: "/atendimento"
}];
function Y() {
  const a = d();
  return <div className="rounded-xl bg-card p-6 shadow-md">{<h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>}{<div className="grid grid-cols-2 gap-3">{Q.map(s => <button onClick={() => a(s.path)} className="action-card text-left">{<div className={r("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", s.color)}>{s.icon}</div>}{<div className="min-w-0">{<p className="text-sm font-medium text-foreground truncate">{s.label}</p>}{<p className="text-xs text-muted-foreground truncate">{s.description}</p>}</div>}</button>)}</div>}</div>;
}
const _ = [{
    id: "1",
    type: "lead",
    title: "Novo lead qualificado",
    description: "Maria Silva - Apt 3 quartos Jardins",
    time: "2 min",
    user: {
      name: "Carlos"
    }
  }, {
    id: "2",
    type: "visit",
    title: "Visita confirmada",
    description: "Casa Alphaville - João Pedro",
    time: "15 min",
    user: {
      name: "Ana"
    }
  }, {
    id: "3",
    type: "proposal",
    title: "Proposta enviada",
    description: "Cobertura Moema - R$ 2.8M",
    time: "32 min",
    user: {
      name: "Roberto"
    }
  }, {
    id: "4",
    type: "sale",
    title: "Venda fechada!",
    description: "Apt Itaim - R$ 1.4M",
    time: "1h",
    user: {
      name: "Patricia"
    }
  }, {
    id: "5",
    type: "property",
    title: "Novo imóvel captado",
    description: "Casa 4 suítes - Morumbi",
    time: "2h",
    user: {
      name: "Lucas"
    }
  }, {
    id: "6",
    type: "message",
    title: "Follow-up realizado",
    description: "Cliente retornou interesse",
    time: "3h",
    user: {
      name: "Fernanda"
    }
  }],
  Z = a => {
    switch (a) {
      case "lead":
        return <D className="h-4 w-4" />;
      case "property":
        return <O className="h-4 w-4" />;
      case "proposal":
        return <w className="h-4 w-4" />;
      case "visit":
        return <m className="h-4 w-4" />;
      case "message":
        return <F className="h-4 w-4" />;
      case "sale":
        return <y className="h-4 w-4" />;
    }
  },
  ee = a => {
    switch (a) {
      case "lead":
        return "bg-info/10 text-info";
      case "property":
        return "bg-primary/10 text-primary";
      case "proposal":
        return "bg-accent/10 text-accent";
      case "visit":
        return "bg-chart-4/10 text-chart-4";
      case "message":
        return "bg-muted text-muted-foreground";
      case "sale":
        return "bg-success/10 text-success";
    }
  };
function se() {
  const a = d();
  return <div className="rounded-xl bg-card p-6 shadow-md h-full">{<div className="flex items-center justify-between mb-4">{<h3 className="text-lg font-semibold text-foreground">Atividade Recente</h3>}{<button onClick={() => a("/leads")} className="text-sm text-accent hover:underline">Ver tudo</button>}</div>}{<div className="space-y-4">{_.map(s => <div className="flex items-start gap-3 group">{<div className={r("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110", ee(s.type))}>{Z(s.type)}</div>}{<div className="flex-1 min-w-0">{<p className="text-sm font-medium text-foreground">{s.title}</p>}{<p className="text-xs text-muted-foreground truncate">{s.description}</p>}</div>}{<div className="text-right shrink-0">{<p className="text-xs text-muted-foreground">{s.time}</p>}{<p className="text-xs text-muted-foreground">{s.user.name}</p>}</div>}</div>)}</div>}</div>;
}
const te = a => {
  switch (a) {
    case "critical":
      return {
        bg: "bg-destructive/10",
        text: "text-destructive",
        icon: <G className="h-4 w-4" />,
        badge: "bg-destructive text-destructive-foreground"
      };
    case "warning":
      return {
        bg: "bg-warning/10",
        text: "text-warning",
        icon: <U className="h-4 w-4" />,
        badge: "bg-warning text-warning-foreground"
      };
    case "expired":
      return {
        bg: "bg-destructive/5",
        text: "text-destructive",
        icon: <z className="h-4 w-4" />,
        badge: "bg-destructive/80 text-destructive-foreground"
      };
    case "ok":
      return {
        bg: "bg-success/10",
        text: "text-success",
        icon: <C className="h-4 w-4" />,
        badge: "bg-success text-success-foreground"
      };
  }
};
function ae({
  items: a = []
}) {
  const s = d(),
    i = a.filter(n => n.status === "critical" || n.status === "expired").length;
  return <div className="rounded-xl bg-card p-6 shadow-md">{<div className="flex items-center justify-between mb-4">{<div className="flex items-center gap-2">{<h3 className="text-lg font-semibold text-foreground">Alertas de SLA</h3>}{i > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground px-1.5 animate-pulse-accent">{i}</span>}</div>}{<button onClick={() => s("/leads")} className="text-sm text-accent hover:underline">Gerenciar</button>}</div>}{a.length === 0 ? <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">{<C className="mx-auto h-5 w-5 text-success" />}{<p className="mt-2 text-sm font-medium text-foreground">Nenhum SLA critico</p>}{<p className="text-xs text-muted-foreground">Os leads ativos estao dentro do prazo calculado.</p>}</div> : <div className="space-y-3">{a.map(n => {
        const l = te(n.status);
        return <button onClick={() => s("/leads", {
          state: {
            selectedLeadId: n.id
          }
        })} className={r("flex w-full items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm text-left", l.bg)}>{<div className="flex items-center gap-3 min-w-0">{<div className={r(l.text, "shrink-0")}>{l.icon}</div>}{<div className="min-w-0">{<p className="text-sm font-medium text-foreground truncate">{n.type}</p>}{<p className="text-xs text-muted-foreground truncate">{n.client} - {n.agent}</p>}</div>}</div>}{<span className={r("ml-3 shrink-0 text-xs font-medium px-2 py-1 rounded-full", l.badge)}>{n.deadline}</span>}</button>;
      })}</div>}</div>;
}
function re({
  data: a = []
}) {
  const s = a.length ? a : [{
    month: "-",
    leads: 0,
    vendas: 0
  }];
  return <div className="rounded-xl bg-card p-6 shadow-md">{<div className="flex items-center justify-between mb-6">{<div>{<h3 className="text-lg font-semibold text-foreground">Performance Mensal</h3>}{<p className="text-sm text-muted-foreground">Evolução de leads e vendas</p>}</div>}{<div className="flex items-center gap-4">{<div className="flex items-center gap-2">{<div className="h-3 w-3 rounded-full bg-accent" />}{<span className="text-xs text-muted-foreground">Leads</span>}</div>}{<div className="flex items-center gap-2">{<div className="h-3 w-3 rounded-full bg-primary" />}{<span className="text-xs text-muted-foreground">Vendas</span>}</div>}</div>}</div>}{<div className="h-[280px]">{<K width="100%" height="100%">{<X data={s} margin={{
          top: 10,
          right: 10,
          left: -20,
          bottom: 0
        }}>{<defs>{<linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">{<stop offset="5%" stopColor="hsl(26, 91%, 44%)" stopOpacity={.3} />}{<stop offset="95%" stopColor="hsl(26, 91%, 44%)" stopOpacity={0} />}</linearGradient>}{<linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">{<stop offset="5%" stopColor="hsl(218, 43%, 23%)" stopOpacity={.3} />}{<stop offset="95%" stopColor="hsl(218, 43%, 23%)" stopOpacity={0} />}</linearGradient>}</defs>}{<W strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />}{<B dataKey="month" axisLine={!1} tickLine={!1} tick={{
            fill: "hsl(218, 20%, 46%)",
            fontSize: 12
          }} />}{<v yAxisId="left" axisLine={!1} tickLine={!1} tick={{
            fill: "hsl(218, 20%, 46%)",
            fontSize: 12
          }} />}{<v yAxisId="right" orientation="right" axisLine={!1} tickLine={!1} tick={{
            fill: "hsl(218, 20%, 46%)",
            fontSize: 12
          }} />}{<H contentStyle={{
            backgroundColor: "hsl(0, 0%, 100%)",
            border: "1px solid hsl(220, 15%, 90%)",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
          }} labelStyle={{
            color: "hsl(218, 43%, 15%)",
            fontWeight: 600
          }} />}{<b yAxisId="left" type="monotone" dataKey="leads" stroke="hsl(26, 91%, 44%)" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />}{<b yAxisId="right" type="monotone" dataKey="vendas" stroke="hsl(218, 43%, 23%)" strokeWidth={2} fillOpacity={1} fill="url(#colorVendas)" />}</X>}</K>}</div>}</div>;
}
const ne = [{
    id: "1",
    name: "Patricia Santos",
    initials: "PS",
    sales: 8,
    revenue: "R$ 7.2M",
    conversion: 24,
    rank: 1,
    trend: "up"
  }, {
    id: "2",
    name: "Carlos Mendes",
    initials: "CM",
    sales: 6,
    revenue: "R$ 5.4M",
    conversion: 21,
    rank: 2,
    trend: "up"
  }, {
    id: "3",
    name: "Ana Rodrigues",
    initials: "AR",
    sales: 5,
    revenue: "R$ 4.8M",
    conversion: 18,
    rank: 3,
    trend: "stable"
  }, {
    id: "4",
    name: "Roberto Lima",
    initials: "RL",
    sales: 4,
    revenue: "R$ 3.6M",
    conversion: 16,
    rank: 4,
    trend: "down"
  }, {
    id: "5",
    name: "Fernanda Costa",
    initials: "FC",
    sales: 3,
    revenue: "R$ 2.7M",
    conversion: 14,
    rank: 5,
    trend: "up"
  }],
  le = a => {
    switch (a) {
      case 1:
        return <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground">{<k className="h-3.5 w-3.5" />}</div>;
      case 2:
        return <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-xs">2º</div>;
      case 3:
        return <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-xs">3º</div>;
      default:
        return <div className="flex h-6 w-6 items-center justify-center text-muted-foreground font-medium text-xs">{a}º</div>;
    }
  };
function ie() {
  const a = d();
  return <div className="rounded-xl bg-card p-6 shadow-md">{<div className="flex items-center justify-between mb-4">{<div className="flex items-center gap-2">{<k className="h-5 w-5 text-accent" />}{<h3 className="text-lg font-semibold text-foreground">Ranking Corretores</h3>}</div>}{<select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent">{<option>Este mês</option>}{<option>Este trimestre</option>}{<option>Este ano</option>}</select>}</div>}{<div className="space-y-3">{ne.map(s => <div className={r("flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-secondary", s.rank === 1 && "bg-accent/5 hover:bg-accent/10")}>{le(s.rank)}{<div className={r("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold", s.rank === 1 ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")}>{s.initials}</div>}{<div className="flex-1 min-w-0">{<p className="text-sm font-medium text-foreground truncate">{s.name}</p>}{<div className="flex items-center gap-2 text-xs text-muted-foreground">{<span>{s.sales} vendas</span>}{<span>•</span>}{<span className="text-success flex items-center gap-0.5">{<p className="h-3 w-3" />}{s.conversion}%</span>}</div>}</div>}{<div className="text-right">{<p className="text-sm font-semibold text-foreground">{s.revenue}</p>}{<div className={r("text-xs flex items-center justify-end gap-0.5", s.trend === "up" && "text-success", s.trend === "down" && "text-destructive", s.trend === "stable" && "text-muted-foreground")}>{s.trend === "up" && <f className="h-3 w-3" />}{s.trend === "up" ? "↑ Subindo" : s.trend === "down" ? "↓ Descendo" : "→ Estável"}</div>}</div>}</div>)}</div>}{<button onClick={() => a("/corretores")} className="w-full mt-4 py-2 text-sm font-medium text-accent hover:underline">Ver ranking completo →</button>}</div>;
}
const ce = a => a >= 1e6 ? `R$ ${(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `R$ ${(a / 1e3).toFixed(0)}K` : `R$ ${a}`,
  be = () => {
    var j;
    const a = d(),
      [s, i] = h.useState("dashboard"),
      [n, l] = h.useState(!1),
      [x, u] = h.useState(!1),
      {
        profile: o
      } = $(),
      {
        data: t
      } = M(),
      A = ((j = o == null ? void 0 : o.full_name) == null ? void 0 : j.split(" ")[0]) || "Usuário";
    return <div className="min-h-screen bg-background">{<R activeModule={s} onModuleChange={i} collapsed={n} onCollapsedChange={l} />}{<main className={r("transition-all duration-300", "lg:pl-64", n && "lg:pl-[72px]")}>{<S title="Dashboard Executivo" subtitle="Visão geral da operação imobiliária" mobileMenuTrigger={<L activeModule={s} onModuleChange={i} open={x} onOpenChange={u} />} />}{<div className="p-4 lg:p-6 space-y-4 lg:space-y-6">{<div className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/90 p-4 lg:p-6 text-primary-foreground shadow-lg">{<div className="relative z-10">{<h2 className="text-xl lg:text-2xl font-bold mb-1">Olá, {A}! 👋</h2>}{<p className="text-primary-foreground/80 mb-3 lg:mb-4 text-sm lg:text-base">Você tem {<span className="font-semibold text-accent">{((t == null ? void 0 : t.slaWarning) || 0) + ((t == null ? void 0 : t.slaCritical) || 0)} alertas</span>} de SLA e {<span className="font-semibold text-accent">{(t == null ? void 0 : t.leadsAtivos) || 0} leads</span>} aguardando atendimento.</p>}{<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">{<button onClick={() => a("/leads")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors shadow-accent">{<p className="h-4 w-4" />}Ver Leads Prioritários</button>}{<button onClick={() => a("/agenda")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors">{<m className="h-4 w-4" />}Agenda do Dia</button>}</div>}</div>}{<div className="absolute right-0 top-0 h-full w-1/3 opacity-10 hidden sm:block">{<svg viewBox="0 0 200 200" className="h-full w-full">{<circle cx="150" cy="100" r="80" fill="currentColor" />}{<circle cx="100" cy="150" r="60" fill="currentColor" />}</svg>}</div>}</div>}{<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">{<c title="Leads Ativos" value={String((t == null ? void 0 : t.leadsAtivos) || 0)} change={{
              value: (t == null ? void 0 : t.leadsThisMonth) || 0,
              type: "increase"
            }} icon={<q className="h-4 w-4 lg:h-5 lg:w-5" />} />}{<c title="Imóveis Ativos" value={String((t == null ? void 0 : t.imoveisAtivos) || 0)} change={{
              value: 0,
              type: "increase"
            }} icon={<N className="h-4 w-4 lg:h-5 lg:w-5" />} />}{<c title="Visitas Mês" value={String((t == null ? void 0 : t.visitasMes) || 0)} change={{
              value: 0,
              type: "increase"
            }} icon={<m className="h-4 w-4 lg:h-5 lg:w-5" />} />}{<c title="Propostas" value={String((t == null ? void 0 : t.propostas) || 0)} change={{
              value: 0,
              type: "increase"
            }} icon={<p className="h-4 w-4 lg:h-5 lg:w-5" />} />}{<c title="Vendas Mês" value={String((t == null ? void 0 : t.vendasMes) || 0)} change={{
              value: 0,
              type: "increase"
            }} icon={<f className="h-4 w-4 lg:h-5 lg:w-5" />} />}{<c title="Receita Mês" value={ce((t == null ? void 0 : t.receitaMes) || 0)} change={{
              value: 0,
              type: "increase"
            }} icon={<y className="h-4 w-4 lg:h-5 lg:w-5" />} variant="accent" />}</div>}{<div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">{<div className="xl:col-span-2 space-y-4 lg:space-y-6">{<re data={(t == null ? void 0 : t.performance) || []} />}{<J />}</div>}{<div className="space-y-4 lg:space-y-6">{<ae items={(t == null ? void 0 : t.slaAlerts) || []} />}{<Y />}</div>}</div>}{<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">{<ie />}{<se />}</div>}</div>}</main>}</div>;
  };
export { be as default };