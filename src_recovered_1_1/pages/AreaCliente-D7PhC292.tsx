/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/AreaCliente-D7PhC292.js | AST | sanitizado | Fase 3 ==*/
import { a as K, j as e } from "@/components/query";
import { u as Y, r as x } from "@/components/vendor-Jm1Lk";
import { u as P, s as C, h as Z, i as ee, H as se, l as ae, B as w, A as g, d as j, c, t as te } from "@/components/index-C9";
import { B as M } from "@/components/ui/badge";
import { l as ne, b as re, aQ as ce, p as D, o as y, m as f, F as N, r as ie, a as le, P as de, W as oe, n as me, u as xe, G as he, S as ue, aR as pe } from "@/components/ui";
import "@/lib/supabase";
function ge() {
  const {
    profile: t
  } = P();
  return K({
    queryKey: ["client-proposals", t == null ? void 0 : t.full_name],
    enabled: !!(t != null && t.full_name),
    queryFn: async () => {
      const {
        data: a,
        error: r
      } = await C.from("proposals").select("*").ilike("client_name", `%${t == null ? void 0 : t.full_name}%`).order("created_at", {
        ascending: !1
      });
      if (r) throw r;
      return a;
    }
  });
}
function je() {
  const {
    profile: t
  } = P();
  return K({
    queryKey: ["client-visits", t == null ? void 0 : t.email, t == null ? void 0 : t.phone],
    enabled: !!(t != null && t.email || t != null && t.phone),
    queryFn: async () => {
      const {
        data: a,
        error: r
      } = await C.from("leads").select("id").or(`email.eq.${t == null ? void 0 : t.email},phone.eq.${t == null ? void 0 : t.phone}`);
      if (r) throw r;
      if (!a || a.length === 0) return [];
      const v = a.map(o => o.id),
        {
          data: m,
          error: h
        } = await C.from("visits").select(`
          *,
          lead:leads!visits_lead_id_fkey(id, name, email, phone),
          property:properties!visits_property_id_fkey(id, title, code, location),
          agent:profiles!visits_agent_id_fkey(id, full_name)
        `).in("lead_id", v).order("scheduled_at", {
          ascending: !0
        });
      if (h) throw h;
      return m;
    }
  });
}
function _e() {
  var V, F, I, q;
  const t = Y(),
    {
      user: a,
      profile: r,
      signOut: v
    } = P(),
    [m, h] = x.useState(""),
    [o, u] = x.useState("inicio"),
    E = x.useRef(null);
  x.useEffect(() => {
    r && r.role !== "client" && t("/");
  }, [r, t]);
  const {
      data: L = []
    } = Z(a == null ? void 0 : a.id, "client"),
    n = L[0] || null,
    {
      data: l = []
    } = ee((n == null ? void 0 : n.id) || null),
    O = se(),
    T = ae(),
    {
      data: $ = []
    } = je(),
    {
      data: G = []
    } = ge();
  x.useEffect(() => {
    n != null && n.id && a != null && a.id && T.mutate({
      conversationId: n.id,
      userId: a.id
    });
  }, [n == null ? void 0 : n.id, l.length]), x.useEffect(() => {
    var s;
    (s = E.current) == null || s.scrollIntoView({
      behavior: "smooth"
    });
  }, [l]);
  const A = () => {
      !m.trim() || !n || !a || O.mutate({
        conversation_id: n.id,
        sender_id: a.id,
        receiver_id: n.agent_id,
        content: m.trim()
      }, {
        onSuccess: () => h(""),
        onError: s => te({
          title: "Erro",
          description: (s == null ? void 0 : s.message) || "Tente novamente.",
          variant: "destructive"
        })
      });
    },
    H = s => {
      s.key === "Enter" && !s.shiftKey && (s.preventDefault(), A());
    },
    Q = async () => {
      await v(), t("/login");
    },
    _ = (r == null ? void 0 : r.full_name) || "Cliente",
    U = _.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase(),
    b = $.filter(s => s.status !== "cancelled"),
    p = G,
    B = b.length > 0,
    R = p.length > 0,
    W = p.some(s => s.signature_status === "signed"),
    k = [{
      id: "busca",
      label: "Busca",
      status: "complete",
      icon: <ue className="h-4 w-4" />
    }, {
      id: "visitas",
      label: "Visitas",
      status: B ? "complete" : "current",
      icon: <f className="h-4 w-4" />
    }, {
      id: "proposta",
      label: "Proposta",
      status: R ? "complete" : B ? "current" : "pending",
      icon: <N className="h-4 w-4" />
    }, {
      id: "analise",
      label: "Análise",
      status: R ? "current" : "pending",
      icon: <D className="h-4 w-4" />
    }, {
      id: "contrato",
      label: "Contrato",
      status: W ? "current" : "pending",
      icon: <N className="h-4 w-4" />
    }, {
      id: "chaves",
      label: "Chaves",
      status: "pending",
      icon: <pe className="h-4 w-4" />
    }],
    J = k.filter(s => s.status === "complete").length,
    X = Math.round(J / k.length * 100),
    z = s => s ? new Date(s).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    }) : "";
  return <div className="min-h-screen bg-background">{<header className="sticky top-0 z-50 bg-primary text-primary-foreground">{<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{<div className="flex items-center justify-between h-16">{<div className="flex items-center gap-3">{<ne className="h-6 w-6" />}{<span className="font-bold text-lg">Estate.ia</span>}{<span className="text-sm opacity-75 hidden sm:inline">| Portal do Cliente</span>}</div>}{<div className="flex items-center gap-2">{<w variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">{<re className="h-5 w-5" />}</w>}{<div className="flex items-center gap-2 ml-2">{<g className="h-8 w-8">{<j className="bg-white/20 text-primary-foreground text-xs">{U}</j>}</g>}{<span className="text-sm font-medium hidden sm:inline">{_}</span>}</div>}{<w variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10" onClick={Q}>{<ce className="h-5 w-5" />}</w>}</div>}</div>}</div>}</header>}{<nav className="bg-card border-b border-border sticky top-16 z-40">{<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{<div className="flex gap-1 overflow-x-auto">{[{
            id: "inicio",
            label: "Início",
            icon: <D className="h-4 w-4" />
          }, {
            id: "mensagens",
            label: "Mensagens",
            icon: <y className="h-4 w-4" />,
            badge: l.filter(s => !s.is_read && s.sender_id !== (a == null ? void 0 : a.id)).length
          }, {
            id: "visitas",
            label: "Visitas",
            icon: <f className="h-4 w-4" />
          }, {
            id: "propostas",
            label: "Propostas",
            icon: <N className="h-4 w-4" />
          }].map(s => <button onClick={() => u(s.id)} className={c("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", o === s.id ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground")}>{s.icon}{s.label}{s.badge ? <M className="bg-accent text-accent-foreground h-5 min-w-5 text-xs">{s.badge}</M> : null}</button>)}</div>}</div>}</nav>}{<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{o === "inicio" && <e.Fragment>{<div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground mb-6">{<h2 className="text-2xl font-bold mb-2">Olá, {_.split(" ")[0]}!</h2>}{<p className="opacity-90 mb-6">Acompanhe o progresso da sua jornada imobiliária.</p>}{<div className="relative">{<div className="flex items-center justify-between">{k.map(s => <div className="flex flex-col items-center relative z-10">{<div className={c("h-10 w-10 rounded-full flex items-center justify-center", s.status === "complete" ? "bg-success text-success-foreground" : s.status === "current" ? "bg-accent text-accent-foreground" : "bg-white/20 text-white/60")}>{s.status === "complete" ? <ie className="h-5 w-5" /> : s.icon}</div>}{<span className="text-xs sm:text-sm mt-2 opacity-90">{s.label}</span>}</div>)}</div>}{<div className="absolute top-5 left-0 right-0 h-0.5 bg-white/20 -z-0">{<div className="h-full bg-success transition-all" style={{
                width: `${X}%`
              }} />}</div>}</div>}</div>}{<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">{<div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => u("visitas")}>{<div className="flex items-center justify-between">{<div>{<p className="text-sm text-muted-foreground">Visitas Agendadas</p>}{<p className="text-2xl font-bold text-foreground mt-1">{b.filter(s => s.status === "scheduled" || s.status === "confirmed").length}</p>}</div>}{<f className="h-8 w-8 text-accent" />}</div>}</div>}{<div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => u("propostas")}>{<div className="flex items-center justify-between">{<div>{<p className="text-sm text-muted-foreground">Propostas Ativas</p>}{<p className="text-2xl font-bold text-foreground mt-1">{p.filter(s => s.status !== "Cancelada" && s.status !== "Finalizada").length}</p>}</div>}{<N className="h-8 w-8 text-primary" />}</div>}</div>}{<div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => u("mensagens")}>{<div className="flex items-center justify-between">{<div>{<p className="text-sm text-muted-foreground">Mensagens</p>}{<p className="text-2xl font-bold text-foreground mt-1">{l.length}</p>}</div>}{<y className="h-8 w-8 text-success" />}</div>}</div>}</div>}{l.length > 0 && <div className="bg-card rounded-xl p-6 shadow-sm mb-6">{<div className="flex items-center justify-between mb-4">{<h3 className="font-semibold text-foreground flex items-center gap-2">{<y className="h-5 w-5 text-accent" />}Últimas Mensagens</h3>}{<w variant="ghost" size="sm" onClick={() => u("mensagens")} className="text-accent">Ver todas {<le className="h-4 w-4 ml-1" />}</w>}</div>}{<div className="space-y-3">{l.slice(-3).map(s => {
              var i, d;
              return <div className={c("flex gap-3", s.sender_id === (a == null ? void 0 : a.id) && "flex-row-reverse")}>{<g className="h-8 w-8 shrink-0">{<j className={c("text-xs", s.sender_id === (a == null ? void 0 : a.id) ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")}>{((d = (i = s.sender) == null ? void 0 : i.full_name) == null ? void 0 : d.split(" ").map(S => S[0]).join("").slice(0, 2)) || "?"}</j>}</g>}{<div className={c("max-w-[75%] rounded-lg px-3 py-2", s.sender_id === (a == null ? void 0 : a.id) ? "bg-accent text-accent-foreground" : "bg-muted")}>{<p className="text-sm">{s.content}</p>}{<p className="text-xs opacity-60 mt-1">{z(s.created_at)}</p>}</div>}</div>;
            })}</div>}</div>}{(n == null ? void 0 : n.agent) && <div className="bg-primary rounded-xl p-6 text-primary-foreground">{<div className="flex items-center gap-4 mb-4">{<g className="h-16 w-16 border-2 border-white/20">{<j className="bg-white/20 text-primary-foreground text-lg">{(V = n.agent.full_name) == null ? void 0 : V.split(" ").map(s => s[0]).join("").slice(0, 2)}</j>}</g>}{<div>{<h4 className="text-lg font-semibold">{n.agent.full_name}</h4>}{<p className="text-sm opacity-90">Seu Corretor</p>}</div>}</div>}{<div className="space-y-2">{n.agent.phone && <div className="flex items-center gap-2">{<de className="h-4 w-4 opacity-80" />}{<span className="text-sm">{n.agent.phone}</span>}</div>}{n.agent.email && <div className="flex items-center gap-2">{<oe className="h-4 w-4 opacity-80" />}{<span className="text-sm">{n.agent.email}</span>}</div>}</div>}</div>}</e.Fragment>}{o === "mensagens" && <div className="bg-card rounded-xl shadow-sm overflow-hidden" style={{
        height: "calc(100vh - 200px)"
      }}>{<div className="p-4 border-b border-border flex items-center gap-3">{<g className="h-10 w-10">{<j className="bg-primary text-primary-foreground text-sm">{((I = (F = n == null ? void 0 : n.agent) == null ? void 0 : F.full_name) == null ? void 0 : I.split(" ").map(s => s[0]).join("").slice(0, 2)) || "AG"}</j>}</g>}{<div>{<p className="font-semibold text-foreground">{((q = n == null ? void 0 : n.agent) == null ? void 0 : q.full_name) || "Corretor"}</p>}{<p className="text-xs text-muted-foreground">{(n == null ? void 0 : n.subject) || "Conversa"}</p>}</div>}</div>}{<div className="flex-1 overflow-y-auto p-4 space-y-4" style={{
          height: "calc(100% - 140px)"
        }}>{l.length === 0 && <div className="text-center py-12 text-muted-foreground">{<y className="h-12 w-12 mx-auto mb-3 opacity-30" />}{<p>Nenhuma mensagem ainda. Envie a primeira!</p>}</div>}{l.map(s => {
            var i, d;
            return <div className={c("flex gap-3", s.sender_id === (a == null ? void 0 : a.id) && "flex-row-reverse")}>{<g className="h-8 w-8 shrink-0">{<j className={c("text-xs", s.sender_id === (a == null ? void 0 : a.id) ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")}>{((d = (i = s.sender) == null ? void 0 : i.full_name) == null ? void 0 : d.split(" ").map(S => S[0]).join("").slice(0, 2)) || "?"}</j>}</g>}{<div className={c("max-w-[70%] rounded-lg px-4 py-3", s.sender_id === (a == null ? void 0 : a.id) ? "bg-accent text-accent-foreground" : "bg-muted")}>{<p className="text-sm whitespace-pre-line">{s.content}</p>}{<p className="text-xs opacity-60 mt-1">{z(s.created_at)}</p>}</div>}</div>;
          })}{<div ref={E} />}</div>}{<div className="p-4 border-t border-border">{<div className="flex items-center gap-2">{<input type="text" value={m} onChange={s => h(s.target.value)} onKeyDown={H} placeholder="Digite sua mensagem..." className="flex-1 py-3 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />}{<w variant="cta" size="icon" onClick={A} disabled={!m.trim()}>{<me className="h-4 w-4" />}</w>}</div>}</div>}</div>}{o === "visitas" && <div className="space-y-4">{<h2 className="text-xl font-bold text-foreground">Minhas Visitas</h2>}{b.length === 0 && <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm">{<f className="h-12 w-12 mx-auto mb-3 opacity-30" />}{<p>Nenhuma visita agendada.</p>}</div>}{b.map(s => {
          var i, d;
          return <div className="bg-card rounded-xl p-5 shadow-sm flex items-center gap-4">{<div className={c("h-12 w-12 rounded-xl flex items-center justify-center", s.status === "confirmed" ? "bg-success/10" : s.status === "completed" ? "bg-primary/10" : "bg-warning/10")}>{<f className={c("h-6 w-6", s.status === "confirmed" ? "text-success" : s.status === "completed" ? "text-primary" : "text-warning")} />}</div>}{<div className="flex-1">{<p className="font-semibold text-foreground">{((i = s.property) == null ? void 0 : i.title) || "Imóvel"}</p>}{<p className="text-sm text-muted-foreground">{((d = s.property) == null ? void 0 : d.location) || ""}</p>}{<div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">{<span className="flex items-center gap-1">{<xe className="h-3 w-3" />}{new Date(s.scheduled_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</span>}{s.agent && <span className="flex items-center gap-1">{<he className="h-3 w-3" />}{s.agent.full_name}</span>}</div>}</div>}{<M className={c(s.status === "confirmed" ? "bg-success/10 text-success" : s.status === "completed" ? "bg-primary/10 text-primary" : s.status === "scheduled" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground")}>{s.status === "confirmed" ? "Confirmada" : s.status === "completed" ? "Concluída" : s.status === "scheduled" ? "Pendente" : s.status}</M>}</div>;
        })}</div>}{o === "propostas" && <div className="space-y-4">{<h2 className="text-xl font-bold text-foreground">Minhas Propostas</h2>}{p.length === 0 && <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm">{<N className="h-12 w-12 mx-auto mb-3 opacity-30" />}{<p>Nenhuma proposta encontrada.</p>}</div>}{p.map(s => <div className="bg-card rounded-xl p-5 shadow-sm">{<div className="flex items-center justify-between mb-3">{<div>{<p className="font-semibold text-foreground">{s.proposal_number}</p>}{<p className="text-sm text-muted-foreground">{s.client_name}</p>}</div>}{<M className={c(s.status === "Finalizada" ? "bg-success/10 text-success" : s.status === "Cancelada" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>{s.status}</M>}</div>}{<div className="flex items-center justify-between text-sm">{<span className="text-muted-foreground">Valor:</span>}{<span className="font-semibold text-foreground">{s.value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0
              })}</span>}</div>}{s.payment_type && <div className="flex items-center justify-between text-sm mt-1">{<span className="text-muted-foreground">Pagamento:</span>}{<span className="text-foreground">{s.payment_type}</span>}</div>}</div>)}</div>}</main>}</div>;
}
export { _e as default };