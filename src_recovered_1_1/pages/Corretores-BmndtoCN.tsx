/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Corretores-BmndtoCN.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r as c } from "@/components/vendor-Jm1Lk";
import { B as p, t as N, A as M, g as z, d as E, c as q } from "@/components/index-C9";
import { a as I, u as B } from "@/hooks/useAgents";
import { D as F, a as V, b as $, c as O } from "@/components/ui/dialog";
import { G, W as A, d as H, P as S, aO as K, L as W, z as P, aP as J, U as k, x as T, aD as X, m as _, F as R, k as Y } from "@/components/ui";
import { S as Q, M as Z, H as ee } from "@/components/Header";
import { B as m } from "@/components/ui/badge";
import { A as se } from "@/components/AvatarUpload";
import { R as te, C as re, X as ae, Y as de, T as le } from "@/components/generateCategoricalChart";
import { L as oe, a as D } from "@/components/LineChart";
import "@/lib/supabase";
import "@/components/index";
import "@/components/index";
import "@/components/logo-estate";
function ne({
  open: v,
  onOpenChange: f
}) {
  const [x, g] = c.useState(""),
    [j, u] = c.useState(""),
    [i, y] = c.useState(""),
    [a, w] = c.useState(""),
    [t, b] = c.useState(""),
    h = I(),
    o = async r => {
      if (r.preventDefault(), !x.trim() || !j.trim() || !i.trim()) {
        N({
          title: "Erro",
          description: "Preencha nome, email e senha.",
          variant: "destructive"
        });
        return;
      }
      if (i.length < 6) {
        N({
          title: "Erro",
          description: "A senha deve ter no mínimo 6 caracteres.",
          variant: "destructive"
        });
        return;
      }
      try {
        await h.mutateAsync({
          full_name: x.trim(),
          email: j.trim().toLowerCase(),
          password: i,
          phone: a.trim() || void 0,
          creci: t.trim() || void 0
        }), N({
          title: "Corretor cadastrado!",
          description: `${x} foi adicionado à equipe com sucesso.`
        }), g(""), u(""), y(""), w(""), b(""), f(!1);
      } catch (n) {
        const d = (n == null ? void 0 : n.message) || "Erro ao cadastrar corretor.";
        d.includes("duplicate key") || d.includes("already exists") ? N({
          title: "Erro",
          description: "Já existe um usuário com este email.",
          variant: "destructive"
        }) : N({
          title: "Erro",
          description: d,
          variant: "destructive"
        });
      }
    };
  return <F open={v} onOpenChange={f}>{<V className="sm:max-w-md">{<$>{<O>Novo Corretor</O>}</$>}{<form onSubmit={o} className="space-y-4 mt-2">{<div>{<label className="text-sm font-medium text-foreground mb-1.5 block">Nome Completo *</label>}{<div className="relative">{<G className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}{<input type="text" value={x} onChange={r => g(r.target.value)} placeholder="Ex: João da Silva" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" required={!0} />}</div>}</div>}{<div>{<label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>}{<div className="relative">{<A className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}{<input type="email" value={j} onChange={r => u(r.target.value)} placeholder="corretor@email.com" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" required={!0} />}</div>}</div>}{<div>{<label className="text-sm font-medium text-foreground mb-1.5 block">Senha *</label>}{<div className="relative">{<H className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}{<input type="password" value={i} onChange={r => y(r.target.value)} placeholder="Mínimo 6 caracteres" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" required={!0} minLength={6} />}</div>}</div>}{<div className="grid grid-cols-2 gap-3">{<div>{<label className="text-sm font-medium text-foreground mb-1.5 block">Telefone</label>}{<div className="relative">{<S className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}{<input type="tel" value={a} onChange={r => w(r.target.value)} placeholder="(11) 99999-0000" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />}</div>}</div>}{<div>{<label className="text-sm font-medium text-foreground mb-1.5 block">CRECI</label>}{<div className="relative">{<K className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}{<input type="text" value={t} onChange={r => b(r.target.value)} placeholder="Ex: 123456-F" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />}</div>}</div>}</div>}{<div className="flex gap-3 pt-2">{<p type="button" variant="outline" className="flex-1" onClick={() => f(!1)}>Cancelar</p>}{<p type="submit" variant="cta" className="flex-1 gap-2" disabled={h.isPending}>{h.isPending && <W className="h-4 w-4 animate-spin" />}Cadastrar</p>}</div>}</form>}</V>}</F>;
}
const ce = [{
  day: "",
  realizado: 120,
  meta: 130
}, {
  day: "",
  realizado: 125,
  meta: 135
}, {
  day: "",
  realizado: 135,
  meta: 138
}, {
  day: "",
  realizado: 140,
  meta: 142
}, {
  day: "",
  realizado: 145,
  meta: 145
}, {
  day: "",
  realizado: 150,
  meta: 148
}, {
  day: "",
  realizado: 155,
  meta: 152
}, {
  day: "",
  realizado: 160,
  meta: 158
}, {
  day: "",
  realizado: 165,
  meta: 162
}, {
  day: "",
  realizado: 168,
  meta: 165
}];
function ke() {
  const [v, f] = c.useState(!1),
    [x, g] = c.useState(!1),
    [j, u] = c.useState(!1),
    [i, y] = c.useState(null),
    {
      data: a = [],
      isLoading: w
    } = B(),
    t = a.find(s => s.id === i) || null,
    b = s => s.split(" ").map(l => l[0]).join("").slice(0, 2).toUpperCase(),
    h = s => {
      switch (s) {
        case "admin":
          return "Administrador";
        case "manager":
          return "Gestor";
        case "agent":
          return "Corretor";
        default:
          return s;
      }
    },
    o = a.reduce((s, l) => s + (l.leads_count || 0), 0),
    r = a.reduce((s, l) => s + (l.visits_count || 0), 0),
    n = a.reduce((s, l) => s + (l.proposals_count || 0), 0),
    d = a.length > 0 ? [...a].sort((s, l) => (l.leads_count || 0) - (s.leads_count || 0))[0] : null,
    C = a.filter(s => s.role === "agent").length,
    L = o > 0 ? Math.round(n / o * 100) : 0,
    U = C > 0 ? Math.round(o / C) : 0;
  return <div className="min-h-screen bg-background">{<Q activeModule="corretores" onModuleChange={() => {}} collapsed={v} onCollapsedChange={f} />}{<Z activeModule="corretores" onModuleChange={() => {}} open={x} onOpenChange={g} />}{<div className={q("transition-all duration-300", v ? "lg:pl-[72px]" : "lg:pl-64")}>{<ee title="Performance de Corretores" subtitle="Ranking, metas e gestão da equipe" actionButton={<p variant="cta" className="gap-2" onClick={() => u(!0)}>{<P className="h-4 w-4" />}Novo Corretor</p>} onMobileMenuClick={() => g(!0)} />}{<main className="space-y-6 p-4 lg:p-6">{<section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">{<div className="grid gap-6 p-5 lg:grid-cols-[1fr_auto] lg:items-center">{<div className="flex items-start gap-4">{<div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:flex">{<J className="h-6 w-6" />}</div>}{<div>{<div className="flex flex-wrap items-center gap-2">{<h2 className="text-xl font-semibold text-foreground">Operacao comercial</h2>}{<m variant="outline">{a.length} membros</m>}</div>}{<p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Acompanhe distribuicao de leads, agenda e propostas para equilibrar a carteira da equipe e identificar gargalos antes que virem perda de atendimento.</p>}</div>}</div>}{<div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background/70 p-2 text-center">{<div className="min-w-24 rounded-md px-3 py-2">{<p className="text-lg font-bold text-foreground">{U}</p>}{<p className="text-xs text-muted-foreground">leads/corretor</p>}</div>}{<div className="min-w-24 rounded-md px-3 py-2">{<p className="text-lg font-bold text-foreground">{L}%</p>}{<p className="text-xs text-muted-foreground">conversao</p>}</div>}{<div className="min-w-24 rounded-md px-3 py-2">{<p className="text-lg font-bold text-foreground">{r}</p>}{<p className="text-xs text-muted-foreground">visitas</p>}</div>}</div>}</div>}</section>}{<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{<div className="bg-card rounded-lg border border-border p-5 shadow-sm">{<div className="flex items-center justify-between">{<div>{<p className="text-sm text-muted-foreground">Total de Corretores</p>}{<p className="text-2xl font-bold text-foreground mt-1">{a.length}</p>}</div>}{<div className="h-11 w-11 rounded-lg bg-accent/10 flex items-center justify-center">{<k className="h-6 w-6 text-accent" />}</div>}</div>}{<p className="text-sm text-muted-foreground mt-3">{C} corretores ativos</p>}</div>}{<div className="bg-card rounded-lg border border-border p-5 shadow-sm">{<div className="flex items-center justify-between">{<div>{<p className="text-sm text-muted-foreground">Leads Atribuídos</p>}{<p className="text-2xl font-bold text-foreground mt-1">{o}</p>}</div>}{<div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">{<T className="h-6 w-6 text-primary" />}</div>}</div>}{<p className="text-sm text-success flex items-center gap-1 mt-3">{<X className="h-3 w-3" />}Total distribuído</p>}</div>}{<div className="bg-card rounded-lg border border-border p-5 shadow-sm">{<div className="flex items-center justify-between">{<div>{<p className="text-sm text-muted-foreground">Visitas Realizadas</p>}{<p className="text-2xl font-bold text-foreground mt-1">{r}</p>}</div>}{<div className="h-11 w-11 rounded-lg bg-warning/10 flex items-center justify-center">{<_ className="h-6 w-6 text-warning" />}</div>}</div>}{<p className="text-sm text-muted-foreground mt-3">{n} propostas geradas</p>}</div>}{d && <div className="bg-accent rounded-lg border border-accent/20 p-5 shadow-sm text-accent-foreground relative overflow-hidden">{<m className="bg-white/20 text-white hover:bg-white/20">Top performer</m>}{<div className="flex items-center gap-3 mt-4">{<M className="h-14 w-14 border-2 border-white/20">{d.avatar_url && <z src={d.avatar_url} alt={d.full_name} className="object-cover" />}{<E className="bg-white/20 text-accent-foreground text-lg">{b(d.full_name)}</E>}</M>}{<div>{<p className="text-xl font-bold">{d.full_name}</p>}{<p className="text-sm opacity-90">{d.leads_count} leads atribuídos</p>}</div>}</div>}</div>}</div>}{<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{<div className="lg:col-span-2 space-y-6">{<div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">{<div className="flex items-center justify-between mb-6">{<div className="px-6 pt-6">{<h3 className="text-lg font-semibold text-foreground">Equipe</h3>}{<p className="mt-1 text-sm text-muted-foreground">Clique em um membro para ver perfil, contato e indicadores.</p>}</div>}{<m variant="outline" className="mr-6 mt-6">{a.length} membros</m>}</div>}{w ? <div className="py-8 text-center text-muted-foreground text-sm">Carregando...</div> : a.length === 0 ? <div className="mx-6 mb-6 rounded-lg border border-dashed border-border bg-background/70 px-6 py-10 text-center text-muted-foreground">{<k className="h-10 w-10 mx-auto mb-3 opacity-40" />}{<p className="font-medium text-foreground">Nenhum corretor cadastrado</p>}{<p className="mx-auto mt-1 max-w-md text-sm">Cadastre o primeiro membro da equipe para distribuir leads, visitas e propostas.</p>}{<p className="mt-4 gap-2" variant="outline" onClick={() => u(!0)}>{<P className="h-4 w-4" />}Novo corretor</p>}</div> : <div className="overflow-x-auto">{<table className="w-full">{<thead className="bg-background/70">{<tr className="border-y border-border">{<th className="text-left px-6 py-3 text-xs font-semibold uppercase text-muted-foreground">#</th>}{<th className="text-left px-2 py-3 text-xs font-semibold uppercase text-muted-foreground">Corretor</th>}{<th className="text-center px-2 py-3 text-xs font-semibold uppercase text-muted-foreground">Leads</th>}{<th className="text-center px-2 py-3 text-xs font-semibold uppercase text-muted-foreground">Visitas</th>}{<th className="text-center px-2 py-3 text-xs font-semibold uppercase text-muted-foreground">Propostas</th>}{<th className="text-center px-6 py-3 text-xs font-semibold uppercase text-muted-foreground">Contato</th>}</tr>}</thead>}{<tbody>{a.map((s, l) => <tr className={q("border-b border-border last:border-0 cursor-pointer hover:bg-muted/40 transition-colors", i === s.id && "bg-accent/5")} onClick={() => y(s.id)}>{<td className="px-6 py-4 text-foreground font-medium">{l + 1}</td>}{<td className="px-2 py-4">{<div className="flex items-center gap-3">{<div className="relative">{<M className="h-10 w-10">{s.avatar_url && <z src={s.avatar_url} alt={s.full_name} className="object-cover" />}{<E className="bg-primary text-primary-foreground">{b(s.full_name)}</E>}</M>}{(d == null ? void 0 : d.id) === s.id && <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success flex items-center justify-center">{<span className="text-[10px] text-success-foreground">★</span>}</div>}</div>}{<div>{<p className="font-medium text-foreground">{s.full_name}</p>}{<p className="text-sm text-muted-foreground">{h(s.role)}{s.creci ? ` • ${s.creci}` : ""}</p>}</div>}</div>}</td>}{<td className="px-2 py-4 text-center">{<m className="bg-accent/10 text-accent border-accent/20">{s.leads_count || 0}</m>}</td>}{<td className="px-2 py-4 text-center">{<m variant="outline">{s.visits_count || 0}</m>}</td>}{<td className="px-2 py-4 text-center">{<m variant="outline">{s.proposals_count || 0}</m>}</td>}{<td className="px-6 py-4 text-center">{<div className="flex items-center justify-center gap-1">{s.email && <p variant="ghost" size="icon" className="h-8 w-8" title={s.email}>{<A className="h-3.5 w-3.5" />}</p>}{s.phone && <p variant="ghost" size="icon" className="h-8 w-8" title={s.phone}>{<S className="h-3.5 w-3.5" />}</p>}</div>}</td>}</tr>)}</tbody>}</table>}</div>}</div>}{<div className="bg-card rounded-lg border border-border p-6 shadow-sm">{<div className="flex items-center justify-between mb-6">{<div>{<h3 className="text-lg font-semibold text-foreground">Evolução de Metas</h3>}{<p className="text-sm text-muted-foreground">Comparativo realizado vs meta estipulada</p>}</div>}{<div className="flex items-center gap-4">{<div className="flex items-center gap-2">{<div className="h-3 w-3 rounded-full bg-accent" />}{<span className="text-sm text-muted-foreground">Realizado</span>}</div>}{<div className="flex items-center gap-2">{<div className="h-3 w-3 rounded-full bg-muted" />}{<span className="text-sm text-muted-foreground">Meta</span>}</div>}</div>}</div>}{<te width="100%" height={250}>{<oe data={ce}>{<re strokeDasharray="3 3" vertical={!1} stroke="hsl(var(--border))" />}{<ae dataKey="day" axisLine={!1} tickLine={!1} />}{<de axisLine={!1} tickLine={!1} domain={[110, 170]} />}{<le contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} />}{<D type="monotone" dataKey="realizado" stroke="hsl(var(--accent))" strokeWidth={2} dot={!1} />}{<D type="monotone" dataKey="meta" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={!1} />}</oe>}</te>}</div>}</div>}{<div className="space-y-6">{<div className="bg-card rounded-lg border border-border p-6 shadow-sm">{<h3 className="font-semibold text-foreground mb-4">Resumo da Equipe</h3>}{<div className="space-y-4">{<div className="flex items-center justify-between">{<div className="flex items-center gap-2">{<T className="h-4 w-4 text-accent" />}{<span className="text-sm text-muted-foreground">Total Leads</span>}</div>}{<span className="font-semibold text-foreground">{o}</span>}</div>}{<div className="flex items-center justify-between">{<div className="flex items-center gap-2">{<_ className="h-4 w-4 text-primary" />}{<span className="text-sm text-muted-foreground">Total Visitas</span>}</div>}{<span className="font-semibold text-foreground">{r}</span>}</div>}{<div className="flex items-center justify-between">{<div className="flex items-center gap-2">{<R className="h-4 w-4 text-success" />}{<span className="text-sm text-muted-foreground">Total Propostas</span>}</div>}{<span className="font-semibold text-foreground">{n}</span>}</div>}{<div className="flex items-center justify-between pt-3 border-t border-border">{<div className="flex items-center gap-2">{<Y className="h-4 w-4 text-warning" />}{<span className="text-sm text-muted-foreground">Conversão</span>}</div>}{<span className="font-semibold text-foreground">{L}%</span>}</div>}</div>}</div>}{<div className="bg-card rounded-lg border border-border p-6 shadow-sm">{<h3 className="font-semibold text-foreground mb-1">Detalhes do corretor</h3>}{<p className="mb-4 text-sm text-muted-foreground">Selecione alguem para acompanhar dados e editar a foto.</p>}{t ? <div className="space-y-5">{<div className="text-center">{<div className="flex justify-center mb-3">{<se profileId={t.id} currentAvatarUrl={t.avatar_url} fullName={t.full_name} size="lg" />}</div>}{<p className="font-semibold text-foreground text-lg">{t.full_name}</p>}{<m className="mt-1">{h(t.role)}</m>}{<p className="text-xs text-muted-foreground mt-1">Clique na camera para alterar foto</p>}</div>}{<div className="space-y-3 pt-3 border-t border-border">{t.creci && <div className="flex items-center gap-3">{<R className="h-4 w-4 text-muted-foreground" />}{<div>{<p className="text-xs text-muted-foreground">CRECI</p>}{<p className="text-sm font-medium text-foreground">{t.creci}</p>}</div>}</div>}{t.email && <div className="flex items-center gap-3">{<A className="h-4 w-4 text-muted-foreground" />}{<div>{<p className="text-xs text-muted-foreground">Email</p>}{<p className="text-sm font-medium text-foreground truncate">{t.email}</p>}</div>}</div>}{t.phone && <div className="flex items-center gap-3">{<S className="h-4 w-4 text-muted-foreground" />}{<div>{<p className="text-xs text-muted-foreground">Telefone</p>}{<p className="text-sm font-medium text-foreground">{t.phone}</p>}</div>}</div>}{t.created_at && <div className="flex items-center gap-3">{<_ className="h-4 w-4 text-muted-foreground" />}{<div>{<p className="text-xs text-muted-foreground">Membro desde</p>}{<p className="text-sm font-medium text-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric"
                        })}</p>}</div>}</div>}</div>}{<div className="pt-3 border-t border-border space-y-3">{<p className="text-sm font-semibold text-foreground">Performance</p>}{<div className="space-y-2">{<div>{<div className="flex justify-between text-sm mb-1">{<span className="text-muted-foreground">Leads</span>}{<span className="font-semibold text-foreground">{t.leads_count || 0}</span>}</div>}{<div className="w-full h-2 bg-muted rounded-full overflow-hidden">{<div className="h-full bg-accent rounded-full" style={{
                          width: `${o > 0 ? (t.leads_count || 0) / o * 100 : 0}%`
                        }} />}</div>}</div>}{<div>{<div className="flex justify-between text-sm mb-1">{<span className="text-muted-foreground">Visitas</span>}{<span className="font-semibold text-foreground">{t.visits_count || 0}</span>}</div>}{<div className="w-full h-2 bg-muted rounded-full overflow-hidden">{<div className="h-full bg-primary rounded-full" style={{
                          width: `${r > 0 ? (t.visits_count || 0) / r * 100 : 0}%`
                        }} />}</div>}</div>}{<div>{<div className="flex justify-between text-sm mb-1">{<span className="text-muted-foreground">Propostas</span>}{<span className="font-semibold text-foreground">{t.proposals_count || 0}</span>}</div>}{<div className="w-full h-2 bg-muted rounded-full overflow-hidden">{<div className="h-full bg-success rounded-full" style={{
                          width: `${n > 0 ? (t.proposals_count || 0) / n * 100 : 0}%`
                        }} />}</div>}</div>}</div>}{<div className="pt-3 border-t border-border flex justify-between">{<span className="text-sm text-muted-foreground">Taxa de Conversão</span>}{<span className="text-sm font-bold text-foreground">{(t.leads_count || 0) > 0 ? Math.round((t.proposals_count || 0) / (t.leads_count || 1) * 100) : 0}%</span>}</div>}</div>}</div> : <div className="rounded-lg border border-dashed border-border bg-background/70 px-4 py-8 text-center">{<k className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />}{<p className="text-sm font-medium text-foreground">Nenhum corretor selecionado</p>}{<p className="mt-1 text-sm text-muted-foreground">Clique em uma linha da equipe para abrir os detalhes aqui.</p>}</div>}</div>}</div>}</div>}</main>}</div>}{<ne open={j} onOpenChange={u} />}</div>;
}
export { ke as default };