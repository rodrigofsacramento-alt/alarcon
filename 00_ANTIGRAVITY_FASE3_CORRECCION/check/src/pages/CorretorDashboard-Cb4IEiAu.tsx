/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/CorretorDashboard-Cb4IEiAu.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { u as I, r as M } from "@/components/vendor-Jm1Lk";
import { u as E, h as T, B as h, A as g, d as p, c as i } from "@/components/index-C9";
import { a as O } from "@/hooks/useVisits";
import { u as U } from "@/hooks/useProposals";
import { u as Q } from "@/hooks/useLeads";
import { u as q } from "@/hooks/useProperties";
import { B as r } from "@/components/ui/badge";
import { p as H, x as j, m as l, l as k, aC as L, o as S, b as $, aQ as G, S as J, u as K, y as W } from "@/components/ui";
import "@/lib/supabase";
function ie() {
  const n = I(),
    {
      user: N,
      profile: f,
      signOut: _
    } = E(),
    [c, o] = M.useState("inicio"),
    [b, A] = M.useState(""),
    {
      data: R = []
    } = Q(),
    {
      data: D = []
    } = O(),
    {
      data: v = []
    } = U(),
    {
      data: w = []
    } = q(),
    {
      data: m = []
    } = T(N == null ? void 0 : N.id, "agent"),
    V = async () => {
      await _(), n("/login");
    },
    y = (f == null ? void 0 : f.full_name) || "Corretor",
    z = y.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase(),
    d = R.filter(s => {
      if (!b) return !0;
      const t = b.toLowerCase();
      return s.name && s.name.toLowerCase().includes(t) || s.phone && s.phone.toLowerCase().includes(t);
    }).sort((s, t) => new Date(t.created_at || 0).getTime() - new Date(s.created_at || 0).getTime()),
    C = D.filter(s => s.status !== "cancelled"),
    x = C.filter(s => s.status === "scheduled" || s.status === "confirmed"),
    P = v.filter(s => s.status !== "Cancelada" && s.status !== "Finalizada"),
    F = [{
      id: "inicio",
      label: "Início",
      icon: <H className="h-4 w-4" />
    }, {
      id: "leads",
      label: "Meus Leads",
      icon: <j className="h-4 w-4" />,
      count: d.length
    }, {
      id: "visitas",
      label: "Visitas",
      icon: <l className="h-4 w-4" />,
      count: x.length
    }, {
      id: "imoveis",
      label: "Imóveis",
      icon: <k className="h-4 w-4" />,
      count: w.length
    }, {
      id: "propostas",
      label: "Propostas",
      icon: <L className="h-4 w-4" />,
      count: P.length
    }, {
      id: "atendimento",
      label: "Mensagens",
      icon: <S className="h-4 w-4" />,
      count: m.length
    }];
  return <div className="min-h-screen bg-background"><header className="sticky top-0 z-50 bg-sidebar text-sidebar-foreground"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-16"><div className="flex items-center gap-3"><k className="h-6 w-6" /><span className="font-bold text-lg">Estate.ia</span><span className="text-sm opacity-75 hidden sm:inline">| Painel do Corretor</span></div><div className="flex items-center gap-2"><h variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent"><$ className="h-5 w-5" /></h><div className="flex items-center gap-2 ml-2"><g className="h-8 w-8"><p className="bg-accent text-accent-foreground text-xs">{z}</p></g><span className="text-sm font-medium hidden sm:inline">{y}</span></div><h variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent" onClick={V}><G className="h-5 w-5" /></h></div></div></div></header><nav className="bg-card border-b border-border sticky top-16 z-40"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex gap-1 overflow-x-auto">{F.map(s => <button onClick={() => o(s.id)} className={i("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", c === s.id ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground")}>{s.icon}{s.label}{s.count ? <r variant="outline" className="text-xs ml-1">{s.count}</r> : null}</button>)}</div></div></nav><main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{c === "inicio" && <e.Fragment><div className="mb-6"><h1 className="text-2xl font-bold text-foreground">Olá, {y.split(" ")[0]}!</h1><p className="text-muted-foreground">Aqui está o resumo das suas atividades.</p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md" onClick={() => o("leads")}><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Meus Leads</p><p className="text-2xl font-bold text-foreground mt-1">{d.length}</p></div><div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center"><j className="h-6 w-6 text-accent" /></div></div></div><div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md" onClick={() => o("visitas")}><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Visitas Pendentes</p><p className="text-2xl font-bold text-foreground mt-1">{x.length}</p></div><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><l className="h-6 w-6 text-primary" /></div></div></div><div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md" onClick={() => o("propostas")}><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Propostas Ativas</p><p className="text-2xl font-bold text-foreground mt-1">{P.length}</p></div><div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center"><L className="h-6 w-6 text-success" /></div></div></div><div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md" onClick={() => o("atendimento")}><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Conversas</p><p className="text-2xl font-bold text-foreground mt-1">{m.length}</p></div><div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center"><S className="h-6 w-6 text-warning" /></div></div></div></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-card rounded-xl p-6 shadow-sm"><h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><l className="h-5 w-5 text-accent" />Próximas Visitas</h3>{x.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma visita agendada.</p> : <div className="space-y-3">{x.slice(0, 5).map(s => {
                var t;
                return <div className="flex items-center gap-3 p-3 rounded-lg border border-border"><l className="h-5 w-5 text-accent shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{((t = s.property) == null ? void 0 : t.title) || "Imóvel"}</p><p className="text-xs text-muted-foreground">{new Date(s.scheduled_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}</p></div><r className={i(s.status === "confirmed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{s.status === "confirmed" ? "Confirmada" : "Pendente"}</r></div>;
              })}</div>}</div><div className="bg-card rounded-xl p-6 shadow-sm"><h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><j className="h-5 w-5 text-accent" />Leads Recentes</h3>{d.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">Nenhum lead atribuído.</p> : <div className="space-y-3">{d.slice(0, 5).map(s => {
                var t;
                return <div className="flex items-center gap-3 p-3 rounded-lg border border-border"><g className="h-8 w-8"><p className="bg-primary text-primary-foreground text-xs">{(t = s.name) == null ? void 0 : t.split(" ").map(a => a[0]).join("").slice(0, 2).toUpperCase()}</p></g><div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{s.name}</p><p className="text-xs text-muted-foreground">{s.stage} • {s.source || "N/A"}</p></div>{s.score && <r variant="outline" className="text-xs">Score: {s.score}</r>}<h variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors shrink-0" onClick={a => {
                    a.stopPropagation(), n("/atendimento", {
                      state: {
                        leadToMessage: s
                      }
                    });
                  }} title="Enviar Mensagem"><span className="text-base">💬</span></h></div>;
              })}</div>}</div></div></e.Fragment>}{c === "leads" && <div className="space-y-4"><h2 className="text-xl font-bold text-foreground">Meus Leads</h2><div className="relative mb-4"><J className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Buscar por nome ou telefone..." value={b} onChange={s => A(s.target.value)} className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all" /></div>{d.length === 0 ? <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm"><j className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Nenhum lead atribuído.</p></div> : <div className="grid gap-3">{d.map(s => {
            var t;
            return <div className="bg-card rounded-xl p-5 shadow-sm flex items-center gap-4"><g className="h-10 w-10"><p className="bg-primary text-primary-foreground text-sm">{(t = s.name) == null ? void 0 : t.split(" ").map(a => a[0]).join("").slice(0, 2).toUpperCase()}</p></g><div className="flex-1"><p className="font-semibold text-foreground">{s.name}</p><p className="text-sm text-muted-foreground">{s.email || s.phone || "Sem contato"}</p></div><r variant="outline">{s.stage}</r>{s.score && <r className="bg-accent/10 text-accent">Score: {s.score}</r>}<h variant="ghost" size="icon" className="ml-1 h-8 w-8 text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors" onClick={a => {
                a.stopPropagation(), n("/atendimento", {
                  state: {
                    leadToMessage: s
                  }
                });
              }} title="Enviar Mensagem"><span className="text-lg">💬</span></h></div>;
          })}</div>}</div>}{c === "visitas" && <div className="space-y-4"><h2 className="text-xl font-bold text-foreground">Minhas Visitas</h2>{C.length === 0 ? <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm"><l className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Nenhuma visita agendada.</p></div> : <div className="grid gap-3">{C.map(s => {
            var t;
            return <div className="bg-card rounded-xl p-5 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all" onClick={() => n("/agenda")}><div className={i("h-12 w-12 rounded-xl flex items-center justify-center", s.status === "confirmed" ? "bg-success/10" : s.status === "completed" ? "bg-primary/10" : "bg-warning/10")}><l className={i("h-6 w-6", s.status === "confirmed" ? "text-success" : s.status === "completed" ? "text-primary" : "text-warning")} /></div><div className="flex-1"><p className="font-semibold text-foreground">{((t = s.property) == null ? void 0 : t.title) || "Imóvel"}</p><p className="text-sm text-muted-foreground flex items-center gap-2"><K className="h-3 w-3" />{new Date(s.scheduled_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</p></div><r className={i(s.status === "confirmed" ? "bg-success/10 text-success" : s.status === "completed" ? "bg-primary/10 text-primary" : s.status === "scheduled" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground")}>{s.status === "confirmed" ? "Confirmada" : s.status === "completed" ? "Concluída" : s.status === "scheduled" ? "Pendente" : s.status}</r></div>;
          })}</div>}</div>}{c === "imoveis" && <div className="space-y-4"><h2 className="text-xl font-bold text-foreground">Imóveis Disponíveis</h2>{w.length === 0 ? <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm"><k className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Nenhum imóvel cadastrado.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{w.map(s => <div className="bg-card rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all" onClick={() => n("/imoveis")}>{s.image_url && <img src={s.image_url} alt={s.title} className="w-full h-40 object-cover" />}<div className="p-4"><div className="flex items-center justify-between mb-2"><r variant="outline" className="text-xs">{s.code}</r><r className={i(s.status === "available" ? "bg-success/10 text-success" : s.status === "reserved" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground")}>{s.status === "available" ? "Disponível" : s.status === "reserved" ? "Reservado" : "Vendido"}</r></div><h4 className="font-semibold text-foreground">{s.title}</h4><p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><W className="h-3 w-3" />{s.location}</p><p className="text-lg font-bold text-accent mt-2">{s.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0
                })}</p></div></div>)}</div>}</div>}{c === "propostas" && <div className="space-y-4"><h2 className="text-xl font-bold text-foreground">Minhas Propostas</h2>{v.length === 0 ? <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm"><L className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Nenhuma proposta encontrada.</p></div> : <div className="grid gap-3">{v.map(s => <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => n("/propostas")}><div className="flex items-center justify-between mb-2"><div><p className="font-semibold text-foreground">{s.proposal_number}</p><p className="text-sm text-muted-foreground">{s.client_name}</p></div><r className={i(s.status === "Finalizada" ? "bg-success/10 text-success" : s.status === "Cancelada" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>{s.status}</r></div><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Valor:</span><span className="font-semibold">{s.value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0
                })}</span></div></div>)}</div>}</div>}{c === "atendimento" && <div className="space-y-4"><h2 className="text-xl font-bold text-foreground">Conversas com Clientes</h2>{m.length === 0 ? <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm"><S className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Nenhuma conversa ativa.</p></div> : <div className="grid gap-3">{m.map(s => {
            var t, a, B;
            return <div className="bg-card rounded-xl p-5 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all" onClick={() => {
              var u;
              return n(`/atendimento?search=${encodeURIComponent(((u = s.client) == null ? void 0 : u.full_name) || "")}`);
            }}><g className="h-10 w-10"><p className="bg-primary text-primary-foreground text-sm">{((a = (t = s.client) == null ? void 0 : t.full_name) == null ? void 0 : a.split(" ").map(u => u[0]).join("").slice(0, 2)) || "?"}</p></g><div className="flex-1"><p className="font-semibold text-foreground">{((B = s.client) == null ? void 0 : B.full_name) || "Cliente"}</p><p className="text-sm text-muted-foreground">{s.subject || "Conversa"}</p></div><r variant="outline">{s.status === "open" ? "Aberta" : s.status === "waiting" ? "Aguardando" : "Fechada"}</r></div>;
          })}</div>}</div>}</main></div>;
}
export { ie as default };