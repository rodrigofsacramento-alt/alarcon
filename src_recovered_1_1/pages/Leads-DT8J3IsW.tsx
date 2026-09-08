/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Leads-DT8J3IsW.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r as l, u as rs, f as ns, g as os } from "@/components/vendor-Jm1Lk";
import { u as De, a as Te, b as ls, c as is } from "@/hooks/useLeads";
import { u as ds } from "@/hooks/useProperties";
import { u as cs } from "@/hooks/useAgents";
import { I as j, B as m, c as p, a as Ae, u as ms, b as xs, s as oe, A as le, d as ie } from "@/components/index-C9";
import { S as us, M as hs, H as ps } from "@/components/Header";
import { B as A } from "@/components/ui/badge";
import { L as x } from "@/components/label";
import { T as xe } from "@/components/ui/textarea";
import { S as z, a as V, b as R, c as B, d as F } from "@/components/ui/select";
import { D as gs, a as js, b as fs, c as bs } from "@/components/ui/dialog";
import { s as Ns } from "@/components/use-semantic-search";
import { S as Me, y as Oe, z as ue, G as K, l as vs, x as ws, m as ze, F as ys, L as Ve, r as Y, I as Cs, J as Re, K as Ss, a as As, N as Ls, X as Le, O as ks, Q as X, V as ke, o as de, P as ce, W as Ie, Y as Is, Z, _ as Es, v as me, u as Ee } from "@/components/ui";
import { I as Ps } from "@/components/ImportLeadsModal";
import "@/lib/supabase";
import "@/components/logo-estate";
import "@/components/index";
import "@/components/index";
import "@/components/xlsx";
function _s({
  availableProperties: r,
  onPropertySelect: f,
  placeholder: v = "Buscar: código, nome ou localização..."
}) {
  const [N, i] = l.useState(""),
    [y, o] = l.useState([]),
    [w, h] = l.useState(!1),
    d = c => {
      if (i(c), c.trim()) {
        const t = Ns(c, r);
        o(t), h(!0);
      } else o([]), h(!1);
    },
    C = c => {
      f(c), i(c.id), h(!1);
    };
  return <div className="relative">{<div className="relative">{<j placeholder={v} value={N} onChange={c => d(c.target.value)} onFocus={() => N && h(!0)} className="pr-10" />}{<Me className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />}</div>}{w && y.length > 0 && <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">{y.map(c => <button onClick={() => C(c)} className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0">{<div className="font-medium text-foreground">{c.title}</div>}{<div className="flex items-center gap-1 text-sm text-muted-foreground">{<Oe className="h-3 w-3" />}{c.location}</div>}{<div className="text-sm text-accent font-medium">{c.price}</div>}</button>)}</div>}</div>;
}
const Fs = ["Lead Cadastrado", "Primeiro Atendimento", "Follow-up", "Agendamento de Visita", "Visita Agendada", "Imóvel Escolhido", "Em Aprovação de Correspondência", "Proposta Solicitada"],
  Ds = ["Viva Real", "ZAP Imóveis", "OLX", "Facebook Ads", "Instagram Ads", "Google Ads", "Site", "Indicação", "Outros"],
  Ts = ["24h", "48h", "72h", "1 semana"];
function Ms({
  open: r,
  onOpenChange: f,
  onConfirm: v,
  availableProperties: N = []
}) {
  const i = new Date(),
    y = `${i.toLocaleDateString("pt-BR")} ${i.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })}`,
    [o, w] = l.useState({
      name: "",
      phone: "",
      email: "",
      source: "",
      propertyCode: "",
      propertyLocation: "",
      propertyId: void 0,
      createdAt: y,
      stage: "Lead Cadastrado",
      budget: "",
      history: "",
      interest: "",
      sla: "48h"
    }),
    h = (t, g) => {
      w(L => ({
        ...L,
        [t]: g
      }));
    },
    d = t => {
      w(g => ({
        ...g,
        propertyCode: t.id,
        propertyLocation: t.location,
        propertyId: t.id
      }));
    },
    C = () => {
      v(o), w({
        name: "",
        phone: "",
        email: "",
        source: "",
        propertyCode: "",
        propertyLocation: "",
        propertyId: void 0,
        createdAt: y,
        stage: "Lead Cadastrado",
        budget: "",
        history: "",
        interest: "",
        sla: "48h"
      }), f(!1);
    },
    c = o.name && o.phone && o.email;
  return <gs open={r} onOpenChange={f}>{<js className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">{<div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5">{<fs>{<bs className="text-xl font-semibold flex items-center gap-3">{<div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">{<ue className="h-5 w-5 text-accent" />}</div>}{<div>{<span>Cadastrar Lead</span>}{<p className="text-sm font-normal text-muted-foreground mt-0.5">Preencha os dados do novo lead</p>}</div>}</bs>}</fs>}</div>}{<div className="px-6 py-5 space-y-6">{<div className="space-y-4">{<div className="flex items-center gap-2 text-sm font-medium text-foreground">{<K className="h-4 w-4 text-accent" />}{<span>Dados Pessoais</span>}</div>}{<div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">{<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{<div className="space-y-2">{<x htmlFor="name">Nome Completo *</x>}{<j id="name" placeholder="Ex: Rodrigo Sacramento" value={o.name} onChange={t => h("name", t.target.value)} />}</div>}{<div className="space-y-2">{<x htmlFor="phone">Telefone / WhatsApp *</x>}{<j id="phone" placeholder="Ex: 5511988192658" value={o.phone} onChange={t => h("phone", t.target.value)} />}</div>}{<div className="space-y-2">{<x htmlFor="email">Email *</x>}{<j id="email" type="email" placeholder="Ex: rodrigosacramento@gmail.com" value={o.email} onChange={t => h("email", t.target.value)} />}</div>}{<div className="space-y-2">{<x htmlFor="source">Origem do Lead</x>}{<z value={o.source} onValueChange={t => h("source", t)}>{<V>{<R placeholder="Selecione a origem" />}</V>}{<B>{Ds.map(t => <F value={t}>{t}</F>)}</B>}</z>}</div>}</div>}</div>}</div>}{<div className="space-y-4">{<div className="flex items-center gap-2 text-sm font-medium text-foreground">{<vs className="h-4 w-4 text-accent" />}{<span>Imóvel de Interesse</span>}</div>}{<div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">{<div className="space-y-2">{<x htmlFor="propertyCode">Imóvel de Interesse</x>}{N.length > 0 ? <e.Fragment>{<_s availableProperties={N} onPropertySelect={d} placeholder="Buscar: código, nome ou localização..." />}{o.propertyCode && <p className="text-xs text-success">✓ Imóvel selecionado: {o.propertyCode}</p>}</e.Fragment> : <j id="propertyCode" placeholder="Ex: AP8736" value={o.propertyCode} onChange={t => h("propertyCode", t.target.value)} />}</div>}{<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{<div className="space-y-2">{<x htmlFor="propertyLocation">Localização do Imóvel</x>}{<j id="propertyLocation" placeholder="Ex: São Bernardo do Campo" value={o.propertyLocation} onChange={t => h("propertyLocation", t.target.value)} readOnly={!!o.propertyId} className={o.propertyId ? "bg-muted" : ""} />}</div>}{<div className="space-y-2">{<x htmlFor="budget">Orçamento</x>}{<j id="budget" placeholder="Ex: 1.5M – 2.2M" value={o.budget} onChange={t => h("budget", t.target.value)} />}</div>}</div>}{<div className="space-y-2">{<x htmlFor="interest">Interesse</x>}{<j id="interest" placeholder="Ex: Imóvel 3 dorm no centro de SBC" value={o.interest} onChange={t => h("interest", t.target.value)} />}</div>}</div>}</div>}{<div className="space-y-4">{<div className="flex items-center gap-2 text-sm font-medium text-foreground">{<ws className="h-4 w-4 text-accent" />}{<span>Gestão do Lead</span>}</div>}{<div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">{<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{<div className="space-y-2">{<x htmlFor="createdAt">Data e Hora de Cadastro</x>}{<div className="relative">{<j id="createdAt" value={o.createdAt} readOnly={!0} className="bg-muted pr-10" />}{<ze className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}</div>}</div>}{<div className="space-y-2">{<x htmlFor="stage">Estágio de Venda</x>}{<z value={o.stage} onValueChange={t => h("stage", t)}>{<V>{<R placeholder="Selecione o estágio" />}</V>}{<B>{Fs.map(t => <F value={t}>{t}</F>)}</B>}</z>}</div>}{<div className="space-y-2">{<x htmlFor="sla">SLA</x>}{<z value={o.sla} onValueChange={t => h("sla", t)}>{<V>{<R placeholder="Selecione o SLA" />}</V>}{<B>{Ts.map(t => <F value={t}>{t}</F>)}</B>}</z>}</div>}</div>}</div>}</div>}{<div className="space-y-4">{<div className="flex items-center gap-2 text-sm font-medium text-foreground">{<ys className="h-4 w-4 text-accent" />}{<span>Histórico</span>}</div>}{<div className="bg-muted/30 rounded-xl p-4 border border-border/50">{<div className="space-y-2">{<x htmlFor="history">Histórico de Atendimento</x>}{<xe id="history" placeholder="Descreva o histórico de atendimento..." value={o.history} onChange={t => h("history", t.target.value)} rows={4} />}</div>}</div>}</div>}</div>}{<div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">{<m variant="outline" onClick={() => f(!1)}>Cancelar</m>}{<m variant="cta" onClick={C} disabled={!c}>Confirmar Cadastro</m>}</div>}</js>}</gs>;
}
const _ = ["Lead Cadastrado", "Primeiro Atendimento", "Follow-up", "Agendamento de Visita", "Visita Agendada", "Imóvel Escolhido", "Em Aprovação de Correspondência", "Proposta Solicitada"],
  Os = {
    "Lead Cadastrado": "bg-slate-100 border-slate-300",
    "Primeiro Atendimento": "bg-blue-50 border-blue-300",
    "Follow-up": "bg-amber-50 border-amber-300",
    "Agendamento de Visita": "bg-purple-50 border-purple-300",
    "Visita Agendada": "bg-indigo-50 border-indigo-300",
    "Imóvel Escolhido": "bg-cyan-50 border-cyan-300",
    "Em Aprovação de Correspondência": "bg-orange-50 border-orange-300",
    "Proposta Solicitada": "bg-emerald-50 border-emerald-300"
  },
  zs = {
    "Lead Cadastrado": "bg-slate-100 text-slate-700",
    "Primeiro Atendimento": "bg-blue-100 text-blue-700",
    "Follow-up": "bg-amber-100 text-amber-700",
    "Agendamento de Visita": "bg-purple-100 text-purple-700",
    "Visita Agendada": "bg-indigo-100 text-indigo-700",
    "Imóvel Escolhido": "bg-cyan-100 text-cyan-700",
    "Em Aprovação de Correspondência": "bg-orange-100 text-orange-700",
    "Proposta Solicitada": "bg-emerald-100 text-emerald-700"
  };
function Vs({
  lead: r,
  onMoveForward: f,
  onMoveBackward: v,
  canMoveForward: N,
  canMoveBackward: i,
  onClick: y
}) {
  return <div className="bg-card rounded-lg border border-border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={y}>{<div className="flex flex-col gap-1 min-w-0">{<p className="text-sm font-medium truncate flex items-center flex-wrap gap-1">{r.name || "Sem nome"}{r.phone && <span className="text-[10px] font-normal text-muted-foreground opacity-80 mt-0.5">({r.phone})</span>}</p>}{<p className="text-xs text-muted-foreground truncate">{r.source || "Sem fonte"}</p>}{r.tags && Array.isArray(r.tags) && r.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{r.tags.map((o, w) => <A variant="default" className="rounded-md px-1.5 py-0 text-[9px] bg-accent/90 text-white border-transparent">{<Re className="mr-0.5 h-2 w-2" />}{o}</A>)}</div>}{r.whatsapp_group && <div className="mt-1">{<A variant="outline" className="rounded-md px-1.5 py-0 text-[10px] border-[#25D366] text-[#25D366] bg-[#25D366]/10">{r.whatsapp_group}</A>}</div>}</div>}{<div className="flex items-center justify-between mt-2">{<div className="flex items-center gap-1 ml-auto">{<button onClick={o => {
          o.stopPropagation(), v();
        }} disabled={!i} className={p("p-1 rounded hover:bg-muted transition-colors", !i && "opacity-30 cursor-not-allowed")}>{<Ss className="h-3.5 w-3.5" />}</button>}{<button onClick={o => {
          o.stopPropagation(), f();
        }} disabled={!N} className={p("p-1 rounded hover:bg-muted transition-colors", !N && "opacity-30 cursor-not-allowed")}>{<As className="h-3.5 w-3.5" />}</button>}</div>}</div>}</div>;
}
function Rs({
  onSelectLead: r,
  filters: f
}) {
  const {
      data: v = [],
      isLoading: N
    } = De(f),
    i = Te(),
    [y, o] = l.useState(null),
    w = (d, C) => {
      const c = _.indexOf(d.stage);
      if (c === -1) return;
      const t = C === "forward" ? c + 1 : c - 1;
      if (t < 0 || t >= _.length) return;
      const g = _[t];
      i.mutate({
        id: d.id,
        stage: g
      }, {
        onSuccess: () => {
          Ae.success(`Lead movido para "${g}"`);
        },
        onError: L => {
          Ae.error("Erro ao mover lead", {
            description: L == null ? void 0 : L.message
          });
        }
      });
    };
  if (N) return <div className="flex items-center justify-center py-20">{<Ve className="h-8 w-8 animate-spin text-accent" />}</div>;
  const h = v.filter(d => d.stage !== "Convertido" && d.stage !== "Perdido");
  try {
    return <div className="space-y-4">{<div className="flex items-center gap-4 mb-2">{<div className="flex items-center gap-2 text-sm">{<Y className="h-4 w-4 text-success" />}{<span className="text-muted-foreground">Convertidos:</span>}{<span className="font-semibold">{v.filter(d => d.stage === "Convertido").length}</span>}</div>}{<div className="flex items-center gap-2 text-sm">{<Cs className="h-4 w-4 text-muted-foreground rotate-45" />}{<span className="text-muted-foreground">Perdidos:</span>}{<span className="font-semibold">{v.filter(d => d.stage === "Perdido").length}</span>}</div>}{<div className="flex items-center gap-2 text-sm ml-auto">{<ze className="h-4 w-4 text-accent" />}{<span className="text-muted-foreground">Ativos no funil:</span>}{<span className="font-semibold">{h.length}</span>}</div>}</div>}{<div className="overflow-x-auto pb-4">{<div className="flex gap-4 min-w-max">{_.map(d => {
            const C = h.filter(g => g.stage === d),
              c = Os[d] || "bg-muted border-border",
              t = zs[d] || "bg-muted text-muted-foreground";
            return <div className={p("w-72 rounded-xl border p-3 flex flex-col max-h-[calc(100vh-280px)]", c)}>{<div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">{<div className="flex items-center gap-2">{<A className={p("text-[10px] h-5", t)}>{C.length}</A>}{<span className="text-sm font-medium truncate">{d}</span>}</div>}</div>}{<div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">{C.length === 0 ? <div className="text-center py-6 text-xs text-muted-foreground italic">Nenhum lead</div> : C.map(g => {
                  try {
                    return <Vs lead={g} canMoveForward={_.indexOf(d) < _.length - 1} canMoveBackward={_.indexOf(d) > 0} onMoveForward={() => w(g, "forward")} onMoveBackward={() => w(g, "backward")} onClick={() => r == null ? void 0 : r(g.id)} />;
                  } catch (L) {
                    return <div className="text-red-500 text-xs">Erro card: {L.message}</div>;
                  }
                })}</div>}</div>;
          })}</div>}</div>}</div>;
  } catch (d) {
    return <div className="p-10 text-red-500 font-bold">Erro no Pipeline: {d.message}</div>;
  }
}
const J = r => r <= 10 ? 1 : r <= 20 ? 2 : r <= 30 ? 3 : r <= 40 ? 4 : r <= 50 ? 5 : r <= 60 ? 6 : r <= 70 ? 7 : r <= 80 ? 8 : r <= 90 ? 9 : 10,
  Bs = r => {
    switch (r) {
      case "ok":
        return "No prazo";
      case "warning":
        return "Atenção";
      case "critical":
        return "Crítico";
      case "expired":
        return "Expirado";
      default:
        return "No prazo";
    }
  },
  Pe = r => {
    if (!r) return "-";
    const f = new Date(r),
      i = (new Date().getTime() - f.getTime()) / (1e3 * 60 * 60);
    return i < 1 ? "Agora" : i < 24 ? "Hoje" : i < 48 ? "Ontem" : f.toLocaleDateString("pt-BR");
  },
  Gs = r => r ? new Date(r).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }) : "",
  _e = ["Todos", "Lead Cadastrado", "Primeiro Atendimento", "Follow-up", "Agendamento de Visita", "Visita Agendada", "Imóvel Escolhido", "Em Aprovação de Correspondência", "Proposta Solicitada"],
  Fe = ["Viva Real", "ZAP Imóveis", "OLX", "Facebook Ads", "Instagram Ads", "Google Ads", "WhatsApp", "Site", "Indicação", "Outros"];
function xt() {
  var Se;
  const r = rs(),
    f = ns(),
    [v, N] = os(),
    {
      user: i,
      profile: y
    } = ms(),
    {
      toast: o
    } = xs(),
    [w, h] = l.useState(!1),
    [d, C] = l.useState(!1),
    [c, t] = l.useState(null),
    [g, L] = l.useState("lista"),
    [U, ee] = l.useState("timeline"),
    [$s, Hs] = l.useState(1),
    [Be, Q] = l.useState(!1),
    [Ge, he] = l.useState(!1),
    [$e, D] = l.useState(!1),
    [n, b] = l.useState({}),
    [G, se] = l.useState(""),
    [E, pe] = l.useState("Todos"),
    [P, te] = l.useState(""),
    [k, ae] = l.useState("all"),
    [ge, $] = l.useState(!1),
    [je, T] = l.useState(!1),
    [fe, M] = l.useState(!1),
    [be, q] = l.useState(!1),
    [O, re] = l.useState(""),
    [He, Ue] = l.useState([]),
    {
      data: H = [],
      isLoading: Ne,
      error: Us
    } = De({
      search: G || void 0,
      stage: E !== "Todos" ? E : void 0,
      source: P || void 0,
      agent: k !== "all" ? k : void 0,
      group: O || void 0
    });
  l.useEffect(() => {
    oe.from("leads").select("tags").not("tags", "is", null).then(({
      data: s
    }) => {
      if (s) {
        const S = s.flatMap(u => Array.isArray(u.tags) ? u.tags : []),
          I = Array.from(new Set(S.filter(Boolean)));
        Ue(I);
      }
    });
  }, []);
  const Qe = () => {
      pe("Todos"), te(""), ae("all"), se(""), re("");
    },
    qe = E !== "Todos" || !!P || !!G || k !== "all" || !!O,
    {
      data: ne = []
    } = ls(c),
    {
      data: We = []
    } = ds(),
    {
      data: W = []
    } = cs(),
    Xe = is(),
    ve = Te(),
    Ze = We.map(s => ({
      id: s.code || s.id,
      title: s.title,
      location: s.location,
      price: s.price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0
      })
    }));
  l.useEffect(() => {
    v.get("action") === "new" && (Q(!0), N({}, {
      replace: !0
    }));
  }, [v, N]), l.useEffect(() => {
    const s = f.state;
    s != null && s.selectedLeadId && t(s.selectedLeadId);
  }, [f.state]);
  const a = H.find(s => s.id === c) || null,
    Je = s => {
      switch (s) {
        case "ok":
          return {
            bg: "bg-success/10",
            text: "text-success",
            icon: <Y className="h-3 w-3" />
          };
        case "warning":
          return {
            bg: "bg-warning/10",
            text: "text-warning",
            icon: <Ee className="h-3 w-3" />
          };
        case "critical":
          return {
            bg: "bg-destructive/10",
            text: "text-destructive",
            icon: <me className="h-3 w-3" />
          };
        case "expired":
          return {
            bg: "bg-destructive/10",
            text: "text-destructive",
            icon: <me className="h-3 w-3" />
          };
        default:
          return {
            bg: "bg-success/10",
            text: "text-success",
            icon: <Y className="h-3 w-3" />
          };
      }
    },
    we = s => s >= 8 ? "border-success text-success" : s >= 5 ? "border-warning text-warning" : "border-muted-foreground text-muted-foreground",
    Ke = s => {
      switch (s) {
        case "email":
          return <Ie className="h-4 w-4 text-primary" />;
        case "status":
          return <me className="h-4 w-4 text-warning" />;
        case "lead_created":
          return <K className="h-4 w-4 text-accent" />;
        case "edit":
          return <Z className="h-4 w-4 text-primary" />;
        default:
          return <Ee className="h-4 w-4 text-muted-foreground" />;
      }
    },
    Ye = s => {
      Xe.mutate({
        name: s.name,
        email: s.email,
        phone: s.phone,
        stage: s.stage,
        source: s.source,
        budget: s.budget,
        interest: s.interest,
        location: s.propertyLocation,
        notes: s.history,
        created_by: i == null ? void 0 : i.id
      }, {
        onSuccess: S => {
          t(S.id);
        }
      });
    },
    es = s => {
      ve.mutate({
        id: s.id,
        responsible_id: i == null ? void 0 : i.id
      }, {
        onSuccess: () => {
          oe.from("lead_timeline").insert({
            lead_id: s.id,
            type: "status",
            title: "Lead Assumido",
            description: "Lead assumido pelo corretor.",
            user_id: i == null ? void 0 : i.id
          }).then(() => {});
        }
      });
    },
    ss = () => {
      var I;
      if (!a || !n) return;
      const s = a.responsible_id !== n.responsible_id && n.responsible_id !== void 0,
        S = ((I = W.find(u => u.id === n.responsible_id)) == null ? void 0 : I.full_name) || "Nenhum";
      ve.mutate({
        id: a.id,
        name: n.name,
        email: n.email,
        phone: n.phone,
        stage: n.stage,
        source: n.source,
        budget: n.budget,
        interest: n.interest,
        location: n.location,
        notes: n.notes,
        responsible_id: n.responsible_id
      }, {
        onSuccess: () => {
          s && oe.from("lead_timeline").insert({
            lead_id: a.id,
            type: "status",
            title: "Lead Transferido",
            description: `Lead transferido para ${S} pelo Administrador.`,
            user_id: i == null ? void 0 : i.id
          }).then(() => {}), D(!1), b({}), o({
            title: "Sucesso",
            description: <div className="flex items-center gap-2">{<Y className="h-4 w-4 text-green-500" />}{<span>Lead atualizado com sucesso.</span>}</div>
          });
        },
        onError: u => {
          o({
            variant: "destructive",
            title: "Erro ao atualizar",
            description: u.message || "Ocorreu um erro ao atualizar o lead."
          });
        }
      });
    },
    ye = () => {
      a && (b({
        name: a.name,
        email: a.email,
        phone: a.phone,
        stage: a.stage,
        budget: a.budget,
        interest: a.interest,
        location: a.location,
        source: a.source,
        whatsapp_group: a.whatsapp_group,
        notes: a.notes,
        responsible_id: a.responsible_id
      }), D(!0), ee("dados"));
    },
    ts = s => {
      t(s.id), b({
        name: s.name,
        email: s.email,
        phone: s.phone,
        stage: s.stage,
        budget: s.budget,
        interest: s.interest,
        location: s.location,
        source: s.source,
        whatsapp_group: s.whatsapp_group,
        notes: s.notes,
        responsible_id: s.responsible_id
      }), D(!0), ee("dados");
    },
    Ce = s => {
      const S = s.phone || s.email || s.name;
      r(`/atendimento?search=${encodeURIComponent(S || "")}`, {
        state: {
          leadId: s.id,
          leadName: s.name,
          leadPhone: s.phone,
          leadEmail: s.email
        }
      });
    };
  return <div className="min-h-screen bg-background">{<us activeModule="leads" onModuleChange={() => {}} collapsed={w} onCollapsedChange={h} />}{<hs activeModule="leads" onModuleChange={() => {}} open={d} onOpenChange={C} />}{<div className={p("transition-all duration-300", w ? "lg:pl-[72px]" : "lg:pl-64")}>{<ps title="Leads" breadcrumbs={[{
        label: "Dashboard",
        href: "/"
      }, {
        label: "Gerenciamento"
      }]} actionButton={<div className="flex items-center gap-2">{<m variant="outline" className="gap-2" onClick={() => he(!0)}>{<Ls className="h-4 w-4" />}Importar</m>}{<m variant="cta" className="gap-2" onClick={() => Q(!0)}>{<ue className="h-4 w-4" />}Cadastrar Lead</m>}</div>} onMobileMenuClick={() => C(!0)} />}{<main className="p-4 lg:p-6">{<div className="flex gap-6">{<div className={p("flex-1 transition-all", a && "lg:pr-[380px]")}>{<div className="relative mb-4">{<Me className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}{<input type="text" placeholder="Buscar por nome, email ou telefone..." value={G} onChange={s => se(s.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />}{G && <button onClick={() => se("")} className="absolute right-3 top-1/2 -translate-y-1/2">{<Le className="h-4 w-4 text-muted-foreground hover:text-foreground" />}</button>}</div>}{<div className="flex flex-wrap items-center gap-3 mb-6">{<div className="relative">{<m variant="outline" className="gap-2" onClick={() => {
                  $(!ge), T(!1), M(!1);
                }}>{<ks className="h-4 w-4" />}Status: {E}{<X className="h-3 w-3" />}</m>}{ge && <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">{_e.map(s => <button onClick={() => {
                    pe(s), $(!1);
                  }} className={p("w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors", E === s && "bg-accent/10 text-accent font-medium")}>{s}</button>)}</div>}</div>}{<div className="relative">{<m variant="outline" className="gap-2" onClick={() => {
                  T(!je), $(!1), M(!1);
                }}>{<ke className="h-4 w-4" />}{P ? `Fonte: ${P}` : "Fonte"}{<X className="h-3 w-3" />}</m>}{je && <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">{<button onClick={() => {
                    te(""), T(!1);
                  }} className={p("w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors", !P && "bg-accent/10 text-accent font-medium")}>Todas</button>}{Fe.map(s => <button onClick={() => {
                    te(s), T(!1);
                  }} className={p("w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors", P === s && "bg-accent/10 text-accent font-medium")}>{s}</button>)}</div>}</div>}{<div className="relative">{<m variant="outline" className="gap-2" onClick={() => {
                  M(!fe), $(!1), T(!1), q(!1);
                }}>{<K className="h-4 w-4" />}{k !== "all" ? `Corretor: ${((Se = W.find(s => s.id === k)) == null ? void 0 : Se.full_name) || "Desconhecido"}` : "Corretor"}{<X className="h-3 w-3" />}</m>}{fe && <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">{<button onClick={() => {
                    ae("all"), M(!1);
                  }} className={p("w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors", k === "all" && "bg-accent/10 text-accent font-medium")}>Todos</button>}{W.map(s => <button onClick={() => {
                    ae(s.id), M(!1);
                  }} className={p("w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors", k === s.id && "bg-accent/10 text-accent font-medium")}>{s.full_name}</button>)}</div>}</div>}{<div className="relative">{<m variant="outline" className="gap-2" onClick={() => {
                  q(!be), M(!1), $(!1), T(!1);
                }}>{<de className="h-4 w-4" />}{O ? `Grupo: ${O}` : "Grupo"}{<X className="h-3 w-3" />}</m>}{be && <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">{<button onClick={() => {
                    re(""), q(!1);
                  }} className={p("w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors", !O && "bg-accent/10 text-accent font-medium")}>Todos</button>}{He.map(s => <button onClick={() => {
                    re(s), q(!1);
                  }} className={p("w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors", O === s && "bg-accent/10 text-accent font-medium")}>{s}</button>)}</div>}</div>}{qe && <button onClick={Qe} className="text-sm text-accent hover:underline">Limpar filtros</button>}</div>}{<div className="flex border-b border-border mb-4">{["lista", "pipeline"].map(s => <button onClick={() => L(s)} className={p("px-6 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px", g === s ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground")}>{s === "lista" ? "Lista" : "Pipeline"}</button>)}</div>}{g === "pipeline" ? <Rs onSelectLead={s => t(s)} filters={{
              search: G || void 0,
              stage: E !== "Todos" ? E : void 0,
              source: P || void 0,
              agent: k !== "all" ? k : void 0
            }} /> : <div className="bg-card rounded-xl shadow-sm overflow-hidden">{<div className="overflow-x-auto">{<table className="w-full">{<thead>{<tr className="border-b border-border">{<th className="w-10 p-4">{<input type="checkbox" className="rounded border-border" />}</th>}{<th className="text-left p-4 text-sm font-medium text-muted-foreground">LEAD / CONTATO</th>}{<th className="text-center p-4 text-sm font-medium text-muted-foreground">SDR</th>}{<th className="text-left p-4 text-sm font-medium text-muted-foreground">STATUS / SLA</th>}{<th className="text-left p-4 text-sm font-medium text-muted-foreground">RESPONSÁVEL</th>}{<th className="text-right p-4 text-sm font-medium text-muted-foreground">AÇÕES</th>}</tr>}</thead>}{<tbody>{Ne && <tr>{<td colSpan={6} className="p-8 text-center">{<Ve className="h-6 w-6 animate-spin mx-auto text-accent" />}{<p className="text-sm text-muted-foreground mt-2">Carregando leads...</p>}</td>}</tr>}{!Ne && H.length === 0 && <tr>{<td colSpan={6} className="p-8 text-center">{<p className="text-muted-foreground">Nenhum lead encontrado.</p>}{<m variant="cta" className="mt-3 gap-2" onClick={() => Q(!0)}>{<ue className="h-4 w-4" />} Cadastrar Primeiro Lead</m>}</td>}</tr>}{H.map(s => {
                      const S = Je(s.sla_status),
                        I = J(s.score || 50);
                      return <tr onClick={() => {
                        t(s.id), D(!1);
                      }} className={p("border-b border-border cursor-pointer transition-colors hover:bg-muted/50", (a == null ? void 0 : a.id) === s.id && "bg-accent/5")}>{<td className="p-4">{<input type="checkbox" className="rounded border-border" checked={(a == null ? void 0 : a.id) === s.id} onClick={u => u.stopPropagation()} onChange={() => {}} />}</td>}{<td className="p-4 min-w-[420px]">{<div className="flex items-start gap-3">{<le className="h-11 w-11 shrink-0">{<ie className="bg-muted text-muted-foreground">{s.name.split(" ").map(u => u[0]).join("").slice(0, 2)}</ie>}</le>}{<div className="min-w-0 space-y-1.5">{<div className="flex flex-wrap items-center gap-2">{<p className="font-semibold text-foreground leading-tight flex items-center flex-wrap gap-1">{s.name}{s.phone && <span className="text-[11px] font-normal text-muted-foreground opacity-80">({s.phone})</span>}</p>}{s.source && <A variant="outline" className="h-5 rounded-full bg-muted/40 px-2 text-[11px] font-medium text-muted-foreground">{<ke className="mr-1 h-3 w-3" />}{s.source}</A>}</div>}{<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">{s.phone && <span className="inline-flex items-center gap-1">{<ce className="h-3 w-3" />}{s.phone}</span>}{s.email && <span className="inline-flex items-center gap-1 truncate">{<Ie className="h-3 w-3" />}{s.email}</span>}{s.location && <span className="inline-flex items-center gap-1">{<Oe className="h-3 w-3" />}{s.location}</span>}</div>}{<div className="flex flex-wrap items-center gap-1.5">{s.tags && Array.isArray(s.tags) && s.tags.map((u, as) => <A variant="default" className="rounded-full px-2 py-0 text-[11px] bg-accent/90 hover:bg-accent text-white border-transparent">{<Re className="mr-1 h-3 w-3" />}{u}</A>)}{s.interest && <A variant="secondary" className="rounded-full px-2 py-0 text-[11px]">{s.interest}</A>}{s.budget && <A variant="secondary" className="rounded-full px-2 py-0 text-[11px]">{s.budget}</A>}{s.whatsapp_group && <A variant="outline" className="rounded-full px-2 py-0 text-[11px] border-[#25D366] text-[#25D366] bg-[#25D366]/10">Grupo: {s.whatsapp_group}</A>}{<span className="text-[11px] text-muted-foreground">Criado {Pe(s.created_at)}</span>}</div>}</div>}</div>}</td>}{<td className="p-4 text-center">{<div className={p("inline-flex items-center justify-center h-10 w-10 rounded-full border-2 font-semibold text-sm", we(I))}>{I >= 8 && <Is className="h-3 w-3 mr-0.5" />}{I}</div>}</td>}{<td className="p-4">{<div className="space-y-1">{<A variant="outline" className="bg-accent/10 text-accent border-accent/20">{s.stage}</A>}{<div className={p("flex items-center gap-1 text-xs", S.text)}>{S.icon}{Bs(s.sla_status)}</div>}</div>}</td>}{<td className="p-4">{s.responsible ? <div className="flex flex-col gap-1">{<span className="text-[10px] text-muted-foreground uppercase font-semibold">Responsável</span>}{<div className="flex items-center gap-2">{<A variant="outline" className="h-7 bg-primary/10 text-primary border-primary/20 gap-1.5 pl-1 pr-2.5 rounded-full hover:bg-primary/20 transition-colors cursor-default">{<le className="h-5 w-5">{<ie className="bg-primary text-primary-foreground text-[10px]">{s.responsible.full_name.split(" ").map(u => u[0]).join("").slice(0, 2)}</ie>}</le>}{<span className="text-xs font-bold">{s.responsible.full_name}</span>}</A>}</div>}</div> : <A variant="outline" className="h-7 text-muted-foreground border-dashed bg-muted/30">Sem responsável</A>}</td>}{<td className="p-4">{<div className="flex items-center justify-end gap-1.5">{<m variant="outline" size="sm" className="h-8 gap-1.5" onClick={u => {
                              u.stopPropagation(), Ce(s);
                            }}>{<de className="h-3.5 w-3.5" />}Atendimento</m>}{s.phone && <m variant="ghost" size="icon" className="h-8 w-8" onClick={u => {
                              u.stopPropagation(), window.location.href = `tel:${s.phone}`;
                            }} title="Ligar">{<ce className="h-4 w-4" />}</m>}{<m variant="ghost" size="icon" className="h-8 w-8" onClick={u => {
                              u.stopPropagation(), ts(s);
                            }} title="Editar lead">{<Z className="h-4 w-4" />}</m>}{<m variant="ghost" size="icon" className="h-8 w-8" onClick={u => {
                              u.stopPropagation(), t(s.id), D(!1);
                            }} title="Abrir detalhes">{<Es className="h-4 w-4" />}</m>}</div>}</td>}</tr>;
                    })}</tbody>}</table>}</div>}{<div className="flex items-center justify-between p-4 border-t border-border">{<span className="text-sm text-muted-foreground">Mostrando {<strong>1-{H.length}</strong>} de {<strong>{H.length}</strong>} leads</span>}{<div className="flex items-center gap-1">{<m variant="outline" size="sm" disabled={!0}>Anterior</m>}{<m variant="default" size="sm" className="min-w-8">1</m>}{<m variant="outline" size="sm">Próximo</m>}</div>}</div>}</div>}</div>}{a && <e.Fragment>{<div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => t(null)} />}{<div className="fixed right-0 top-0 h-screen w-[min(380px,90vw)] bg-card border-l border-border shadow-xl overflow-y-auto z-50 animate-in slide-in-from-right duration-300">{<div className="p-6">{<div className="flex items-start justify-between mb-6">{<div className="flex items-center gap-4">{<le className="h-14 w-14">{<ie className="bg-muted text-lg">{a.name.split(" ").map(s => s[0]).join("")}</ie>}</le>}{<div>{<h3 className="text-lg font-semibold text-foreground flex items-center flex-wrap gap-1">{a.name}{a.phone && <span className="text-[12px] font-normal text-muted-foreground opacity-80 mt-1">({a.phone})</span>}</h3>}{a.location && <p className="text-sm text-muted-foreground flex items-center gap-1">{<span className="text-accent">●</span>}{a.location}</p>}{<div className={p("inline-flex items-center gap-1 text-xs font-medium mt-1 px-2 py-0.5 rounded", we(J(a.score || 50)))}>SDR: {J(a.score || 50)}/10</div>}</div>}</div>}{<m variant="ghost" size="icon" onClick={() => t(null)}>{<Le className="h-4 w-4" />}</m>}</div>}{<div className="flex gap-2 mb-6">{!a.responsible_id && (y == null ? void 0 : y.role) === "agent" && <m className="flex-1 gap-2" variant="cta" onClick={() => es(a)}>{<K className="h-4 w-4" />}Assumir Lead</m>}{<m className="flex-1 gap-2" variant="outline" onClick={() => Ce(a)}>{<de className="h-4 w-4" />}Atendimento</m>}{<m className="flex-1 gap-2" variant="outline" disabled={!a.phone} onClick={() => {
                    a.phone && (window.location.href = `tel:${a.phone}`);
                  }}>{<ce className="h-4 w-4" />}Ligar</m>}{<m variant="outline" size="icon" onClick={ye}>{<Z className="h-4 w-4" />}</m>}</div>}{<div className="flex border-b border-border mb-4">{["timeline", "dados", "notas"].map(s => <button onClick={() => ee(s)} className={p("flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px", U === s ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground")}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}</div>}{U === "timeline" && <div className="space-y-4">{ne.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento registrado.</p>}{ne.map((s, S) => <div className="relative pl-6">{S < ne.length - 1 && <div className="absolute left-[7px] top-6 bottom-0 w-px bg-border" />}{<div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-muted flex items-center justify-center">{<div className="h-2 w-2 rounded-full bg-border" />}</div>}{<div className="pb-4">{<p className="text-xs text-muted-foreground mb-1">{Pe(s.created_at)}, {Gs(s.created_at)}</p>}{<div className="bg-muted/50 rounded-lg p-3">{<div className="flex items-center gap-2 mb-1">{Ke(s.type)}{<span className="font-medium text-sm text-foreground">{s.title}</span>}</div>}{<p className="text-sm text-muted-foreground">{s.description}</p>}</div>}</div>}</div>)}</div>}{U === "dados" && <div className="space-y-4">{$e ? <e.Fragment>{<div className="space-y-2">{<x>Nome</x>}{<j value={n.name || ""} onChange={s => b({
                        ...n,
                        name: s.target.value
                      })} />}</div>}{<div className="space-y-2">{<x>Email</x>}{<j value={n.email || ""} onChange={s => b({
                        ...n,
                        email: s.target.value
                      })} />}</div>}{<div className="space-y-2">{<x>Telefone</x>}{<j value={n.phone || ""} onChange={s => b({
                        ...n,
                        phone: s.target.value
                      })} />}</div>}{<div className="space-y-2">{<x>Estágio</x>}{<z value={n.stage} onValueChange={s => b({
                        ...n,
                        stage: s
                      })}>{<V>{<R />}</V>}{<B>{_e.slice(1).map(s => <F value={s}>{s}</F>)}</B>}</z>}</div>}{<div className="space-y-2">{<x>Origem</x>}{<z value={n.source} onValueChange={s => b({
                        ...n,
                        source: s
                      })}>{<V>{<R />}</V>}{<B>{Fe.map(s => <F value={s}>{s}</F>)}</B>}</z>}</div>}{<div className="space-y-2">{<x>Grupo WhatsApp</x>}{<j value={n.whatsapp_group || ""} onChange={s => b({
                        ...n,
                        whatsapp_group: s.target.value
                      })} placeholder="Ex: Bloco A (Vermelho)" />}</div>}{<div className="space-y-2">{<x>Orçamento</x>}{<j value={n.budget || ""} onChange={s => b({
                        ...n,
                        budget: s.target.value
                      })} />}</div>}{<div className="space-y-2">{<x>Interesse</x>}{<j value={n.interest || ""} onChange={s => b({
                        ...n,
                        interest: s.target.value
                      })} />}</div>}{<div className="space-y-2">{<x>Imóvel de Interesse</x>}{<j value={n.propertyCode || ""} onChange={s => b({
                        ...n,
                        propertyCode: s.target.value
                      })} />}</div>}{<div className="space-y-2">{<x>Localização</x>}{<j value={n.location || ""} onChange={s => b({
                        ...n,
                        location: s.target.value
                      })} />}</div>}{<div className="space-y-2">{<x>Histórico</x>}{<xe value={n.history || ""} onChange={s => b({
                        ...n,
                        history: s.target.value
                      })} rows={3} />}</div>}{<div className="space-y-2 border-t pt-2 mt-2 border-border/50">{<x className="text-primary font-medium">Transferir Responsabilidade (Qualquer Agente)</x>}{<z value={n.responsible_id || "unassigned"} onValueChange={s => b({
                        ...n,
                        responsible_id: s === "unassigned" ? null : s
                      })}>{<V className="bg-muted/30">{<R placeholder="Selecione o Corretor" />}</V>}{<B>{<F value="unassigned">Nenhum (Livre)</F>}{W.map(s => <F value={s.id}>{s.full_name}</F>)}</B>}</z>}</div>}{<div className="flex gap-2 pt-4">{<m variant="outline" onClick={() => D(!1)} className="flex-1">Cancelar</m>}{<m variant="cta" onClick={ss} className="flex-1">Salvar</m>}</div>}</e.Fragment> : <e.Fragment>{<div className="grid grid-cols-2 gap-4">{<div>{<p className="text-xs text-muted-foreground">Email</p>}{<p className="text-sm font-medium">{a.email}</p>}</div>}{<div>{<p className="text-xs text-muted-foreground">Telefone</p>}{<p className="text-sm font-medium">{a.phone || "-"}</p>}</div>}{<div>{<p className="text-xs text-muted-foreground">Origem</p>}{<p className="text-sm font-medium">{a.source}</p>}</div>}{<div>{<p className="text-xs text-muted-foreground">Estágio</p>}{<p className="text-sm font-medium">{a.stage}</p>}</div>}{<div>{<p className="text-xs text-muted-foreground">Orçamento</p>}{<p className="text-sm font-medium">{a.budget || "-"}</p>}</div>}{<div>{<p className="text-xs text-muted-foreground">Grupo</p>}{<p className="text-sm font-medium text-[#25D366]">{a.tags && Array.isArray(a.tags) && a.tags.length > 0 ? a.tags.join(", ") : "-"}</p>}</div>}{<div>{<p className="text-xs text-muted-foreground">SDR</p>}{<p className="text-sm font-medium">{J(a.score || 50)}/10</p>}</div>}{<div>{<p className="text-xs text-muted-foreground">Imóvel</p>}{<p className="text-sm font-medium">{a.property_id || "-"}</p>}</div>}{<div>{<p className="text-xs text-muted-foreground">Data Cadastro</p>}{<p className="text-sm font-medium">{a.created_at ? new Date(a.created_at).toLocaleDateString("pt-BR") : "-"}</p>}</div>}</div>}{a.interest && <div className="pt-4 border-t border-border">{<p className="text-xs text-muted-foreground">Interesse</p>}{<p className="text-sm font-medium">{a.interest}</p>}</div>}{a.notes && <div className="pt-4 border-t border-border">{<p className="text-xs text-muted-foreground">Notas</p>}{<p className="text-sm">{a.notes}</p>}</div>}{<m variant="outline" className="w-full mt-4" onClick={ye}>{<Z className="h-4 w-4 mr-2" />}Editar Dados</m>}</e.Fragment>}</div>}{U === "notas" && <div className="space-y-4">{<xe placeholder="Adicionar nota..." rows={4} />}{<m variant="cta" className="w-full">Salvar Nota</m>}</div>}</div>}</div>}</e.Fragment>}</div>}</main>}</div>}{<Ms open={Be} onOpenChange={Q} onConfirm={Ye} availableProperties={Ze} />}{<Ps open={Ge} onOpenChange={he} />}</div>;
}
export { xt as default };