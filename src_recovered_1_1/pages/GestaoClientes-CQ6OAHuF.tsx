/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/GestaoClientes-CQ6OAHuF.js | AST | sanitizado | Fase 3 ==*/
import { u as V, j as e, a as z } from "@/components/query";
import { r as c, u as B } from "@/components/vendor-Jm1Lk";
import { u as D, A as P, d as U, c as v, B as b, t as r, s as m } from "@/components/index-C9";
import { S as $, M as O, H as Q } from "@/components/Header";
import { B as _ } from "@/components/ui/badge";
import { A as R } from "@/components/AvatarUpload";
import { U as w, q as K, o as j, S as H, L as T, a as F, W as G, P as W, m as S, aC as J, i as X } from "@/components/ui";
import "@/lib/supabase";
import "@/components/logo-estate";
import "@/components/index";
import "@/components/index";
function Y() {
  return z({
    queryKey: ["clients"],
    queryFn: async () => {
      const {
        data: l,
        error: u
      } = await m.from("profiles").select("*").eq("role", "client").order("full_name");
      if (u) throw u;
      if ((l || []).map(i => i.id).length === 0) return [];
      const {
          data: x
        } = await m.from("conversations").select("client_id"),
        n = {};
      return (x || []).forEach(i => {
        i.client_id && (n[i.client_id] = (n[i.client_id] || 0) + 1);
      }), (l || []).map(i => ({
        ...i,
        conversations_count: n[i.id] || 0,
        proposals_count: 0
      }));
    }
  });
}
function ce() {
  const [l, u] = c.useState(!1),
    [y, x] = c.useState(!1),
    [n, i] = c.useState(""),
    [t, A] = c.useState(null),
    [h, f] = c.useState(null),
    {
      data: g = [],
      isLoading: k
    } = Y(),
    {
      profile: o
    } = D(),
    p = B(),
    N = V(),
    M = s => {
      p("/atendimento"), r({
        title: `Portal de ${s.full_name}`,
        description: "Redirecionando para o atendimento onde você pode visualizar as conversas deste cliente."
      });
    },
    L = async s => {
      if (o) {
        f("conversa");
        try {
          const {
            data: a
          } = await m.from("conversations").select("id").eq("client_id", s.id).limit(1);
          if (a && a.length > 0) {
            r({
              title: "Conversa existente",
              description: `Redirecionando para o atendimento com ${s.full_name}.`
            }), p("/atendimento");
            return;
          }
          const {
            error: d
          } = await m.from("conversations").insert({
            client_id: s.id,
            agent_id: o.id,
            subject: `Atendimento - ${s.full_name}`,
            status: "open",
            last_message_at: new Date().toISOString()
          });
          if (d) throw d;
          r({
            title: "Conversa criada!",
            description: `Nova conversa com ${s.full_name} iniciada.`
          }), N.invalidateQueries({
            queryKey: ["clients"]
          }), p("/atendimento");
        } catch (a) {
          r({
            title: "Erro",
            description: (a == null ? void 0 : a.message) || "Erro ao criar conversa.",
            variant: "destructive"
          });
        } finally {
          f(null);
        }
      }
    },
    q = async s => {
      if (o) {
        f("visita");
        try {
          const a = new Date();
          a.setDate(a.getDate() + 1), a.setHours(10, 0, 0, 0);
          const {
            error: d
          } = await m.from("visits").insert({
            agent_id: o.id,
            scheduled_at: a.toISOString(),
            status: "scheduled",
            notes: `Visita agendada via painel de clientes para ${s.full_name}`,
            created_by: o.id
          });
          if (d) throw d;
          r({
            title: "Visita agendada!",
            description: `Visita com ${s.full_name} agendada para amanhã às 10:00.`
          }), N.invalidateQueries({
            queryKey: ["clients"]
          }), N.invalidateQueries({
            queryKey: ["visits"]
          }), p("/agenda");
        } catch (a) {
          r({
            title: "Erro",
            description: (a == null ? void 0 : a.message) || "Erro ao agendar visita.",
            variant: "destructive"
          });
        } finally {
          f(null);
        }
      }
    },
    C = g.filter(s => s.full_name.toLowerCase().includes(n.toLowerCase()) || s.email && s.email.toLowerCase().includes(n.toLowerCase()) || s.phone && s.phone.includes(n)),
    I = s => s.split(" ").map(a => a[0]).join("").slice(0, 2).toUpperCase(),
    E = g.filter(s => s.is_active !== !1).length;
  return <div className="min-h-screen bg-background">{<$ activeModule="clientes" onModuleChange={() => {}} collapsed={l} onCollapsedChange={u} />}{<O activeModule="clientes" onModuleChange={() => {}} open={y} onOpenChange={x} />}{<div className={v("transition-all duration-300", l ? "lg:pl-[72px]" : "lg:pl-64")}>{<Q title="Gestão de Clientes" subtitle="Visualize e gerencie os clientes da imobiliária" onMobileMenuClick={() => x(!0)} />}{<main className="p-4 lg:p-6">{<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{<div className="bg-card rounded-xl p-5 shadow-sm">{<div className="flex items-center justify-between">{<div>{<p className="text-sm text-muted-foreground">Total de Clientes</p>}{<p className="text-2xl font-bold text-foreground mt-1">{g.length}</p>}</div>}{<div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">{<w className="h-6 w-6 text-accent" />}</div>}</div>}</div>}{<div className="bg-card rounded-xl p-5 shadow-sm">{<div className="flex items-center justify-between">{<div>{<p className="text-sm text-muted-foreground">Clientes Ativos</p>}{<p className="text-2xl font-bold text-foreground mt-1">{E}</p>}</div>}{<div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">{<K className="h-6 w-6 text-success" />}</div>}</div>}</div>}{<div className="bg-card rounded-xl p-5 shadow-sm">{<div className="flex items-center justify-between">{<div>{<p className="text-sm text-muted-foreground">Conversas Ativas</p>}{<p className="text-2xl font-bold text-foreground mt-1">{g.reduce((s, a) => s + (a.conversations_count || 0), 0)}</p>}</div>}{<div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">{<j className="h-6 w-6 text-primary" />}</div>}</div>}</div>}</div>}{<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{<div className="lg:col-span-2">{<div className="bg-card rounded-xl shadow-sm">{<div className="p-4 border-b border-border">{<div className="relative">{<H className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}{<input type="text" placeholder="Buscar por nome, email ou telefone..." value={n} onChange={s => i(s.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />}</div>}</div>}{<div className="divide-y divide-border">{k ? <div className="flex items-center justify-center py-12">{<T className="h-6 w-6 animate-spin text-accent" />}</div> : C.length === 0 ? <div className="py-12 text-center">{<w className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />}{<p className="text-sm text-muted-foreground">{n ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}</p>}</div> : C.map(s => <button onClick={() => A(s)} className={v("w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors", (t == null ? void 0 : t.id) === s.id && "bg-accent/5")}>{<P className="h-11 w-11 shrink-0">{<U className="bg-primary text-primary-foreground">{I(s.full_name)}</U>}</P>}{<div className="flex-1 min-w-0">{<div className="flex items-center gap-2">{<p className="font-medium text-foreground truncate">{s.full_name}</p>}{<_ className={v("text-xs", s.is_active !== !1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>{s.is_active !== !1 ? "Ativo" : "Inativo"}</_>}</div>}{<p className="text-sm text-muted-foreground truncate">{s.email || "Sem email"}</p>}</div>}{<div className="hidden sm:flex items-center gap-3 text-muted-foreground">{s.conversations_count ? <div className="flex items-center gap-1" title="Conversas">{<j className="h-3.5 w-3.5" />}{<span className="text-xs">{s.conversations_count}</span>}</div> : null}</div>}{<F className="h-4 w-4 text-muted-foreground shrink-0" />}</button>)}</div>}</div>}</div>}{<div>{t ? <div className="bg-card rounded-xl shadow-sm p-6 space-y-6 sticky top-24">{<div className="text-center">{<div className="flex justify-center mb-3">{<R profileId={t.id} currentAvatarUrl={t.avatar_url} fullName={t.full_name} size="lg" />}</div>}{<h3 className="text-lg font-semibold text-foreground">{t.full_name}</h3>}{<_ className={v("mt-1", t.is_active !== !1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>{t.is_active !== !1 ? "Cliente Ativo" : "Cliente Inativo"}</_>}</div>}{<div className="space-y-3">{<h4 className="text-sm font-semibold text-foreground">Informações de Contato</h4>}{t.email && <div className="flex items-center gap-3 text-sm">{<G className="h-4 w-4 text-muted-foreground" />}{<span className="text-foreground">{t.email}</span>}</div>}{t.phone && <div className="flex items-center gap-3 text-sm">{<W className="h-4 w-4 text-muted-foreground" />}{<span className="text-foreground">{t.phone}</span>}</div>}{<div className="flex items-center gap-3 text-sm">{<S className="h-4 w-4 text-muted-foreground" />}{<span className="text-muted-foreground">Cliente desde {t.created_at ? new Date(t.created_at).toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric"
                    }) : "N/A"}</span>}</div>}</div>}{<div className="space-y-3">{<h4 className="text-sm font-semibold text-foreground">Atividade</h4>}{<div className="grid grid-cols-3 gap-3">{<div className="text-center p-3 rounded-lg bg-muted/50">{<j className="h-4 w-4 mx-auto mb-1 text-primary" />}{<p className="text-lg font-bold text-foreground">{t.conversations_count || 0}</p>}{<p className="text-xs text-muted-foreground">Conversas</p>}</div>}{<div className="text-center p-3 rounded-lg bg-muted/50">{<J className="h-4 w-4 mx-auto mb-1 text-success" />}{<p className="text-lg font-bold text-foreground">{t.proposals_count || 0}</p>}{<p className="text-xs text-muted-foreground">Propostas</p>}</div>}</div>}</div>}{<div className="space-y-2">{<h4 className="text-sm font-semibold text-foreground">Ações</h4>}{<b variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => M(t)}>{<X className="h-4 w-4" />}Ver Portal do Cliente</b>}{<b variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => L(t)} disabled={h === "conversa"}>{<j className="h-4 w-4" />}{h === "conversa" ? "Criando..." : "Iniciar Conversa"}</b>}{<b variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => q(t)} disabled={h === "visita"}>{<S className="h-4 w-4" />}{h === "visita" ? "Agendando..." : "Agendar Visita"}</b>}</div>}</div> : <div className="bg-card rounded-xl shadow-sm p-12 text-center sticky top-24">{<w className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />}{<p className="text-sm text-muted-foreground">Selecione um cliente para ver os detalhes.</p>}</div>}</div>}</div>}</main>}</div>}</div>;
}
export { ce as default };