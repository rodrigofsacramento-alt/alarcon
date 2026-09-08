/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Agenda-DW6P8p1e.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r as c, u as xs, g as hs } from "@/components/vendor-Jm1Lk";
import { I as Te, A as Ee, d as Ge, B as h, u as ps, c as F, t as R } from "@/components/index-C9";
import { S as gs, M as fs, H as js } from "@/components/Header";
import { B as T } from "@/components/ui/badge";
import { L as b } from "@/components/label";
import { D as $e, a as Be, b as Ye, c as Qe } from "@/components/ui/dialog";
import { S as _e, a as De, b as Ve, c as Me, d as ze } from "@/components/ui/select";
import { a as bs, s as vs } from "@/components/use-semantic-search";
import { S as Ue, y as He, z as qe, v as Z, G as Ns, m as Pe, r as Le, ap as ys, K as ws, a as Cs, u as Re, aq as se, ar as Ae, a0 as te, _ as K, a3 as Ie, X as Oe, P as Ss, W as ks, as as Fs } from "@/components/ui";
import { T as J } from "@/components/ui/textarea";
import { a as _s, u as Ds, b as Vs, c as Ms, d as zs, e as Ps } from "@/hooks/useVisits";
import { u as Ls } from "@/hooks/useLeads";
import { u as Rs } from "@/hooks/useProperties";
import "@/lib/supabase";
import "@/components/logo-estate";
import "@/components/index";
import "@/components/index";
function As({
  availableLeads: u,
  onLeadSelect: m,
  placeholder: N = "Buscar: nome, email ou telefone...",
  excludeLeadIds: j = []
}) {
  const [n, f] = c.useState(""),
    [t, o] = c.useState([]),
    [C, r] = c.useState(!1),
    v = i => {
      if (f(i), i.trim()) {
        let y = bs(i, u);
        j.length > 0 && (y = y.filter(A => !j.includes(A.id))), o(y), r(!0);
      } else o([]), r(!1);
    },
    x = i => {
      m(i), f(i.name), r(!1);
    },
    _ = i => i >= 8 ? "text-success" : i >= 5 ? "text-warning" : "text-muted-foreground";
  return <div className="relative"><div className="relative"><Te placeholder={N} value={n} onChange={i => v(i.target.value)} onFocus={() => n && r(!0)} className="pr-10" /><Ue className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" /></div>{C && t.length > 0 && <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">{t.map(i => <button onClick={() => x(i)} className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 flex items-center gap-3"><Ee className="h-8 w-8"><Ge className="bg-muted text-muted-foreground text-xs">{i.name.split(" ").map(y => y[0]).join("")}</Ge></Ee><div className="flex-1 min-w-0"><div className="font-medium text-foreground truncate">{i.name}</div><div className="text-sm text-muted-foreground truncate">{i.email}</div></div><div className={`text-sm font-semibold ${_(Math.ceil(i.score / 10))}`}>SDR {Math.ceil(i.score / 10)}</div></button>)}</div>}</div>;
}
function Is({
  availableProperties: u,
  onPropertySelect: m,
  placeholder: N = "Buscar: código, nome ou localização..."
}) {
  const [j, n] = c.useState(""),
    [f, t] = c.useState([]),
    [o, C] = c.useState(!1),
    r = x => {
      if (n(x), x.trim()) {
        const _ = vs(x, u);
        t(_), C(!0);
      } else t([]), C(!1);
    },
    v = x => {
      m(x), n(x.title), C(!1);
    };
  return <div className="relative"><div className="relative"><Te placeholder={N} value={j} onChange={x => r(x.target.value)} onFocus={() => j && C(!0)} className="pr-10" /><Ue className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" /></div>{o && f.length > 0 && <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">{f.map(x => <button onClick={() => v(x)} className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"><div className="font-medium text-foreground">{x.title}</div><div className="flex items-center gap-1 text-sm text-muted-foreground"><He className="h-3 w-3" />{x.location}</div><div className="text-sm text-accent font-medium">{x.price}</div></button>)}</div>}</div>;
}
const Os = ["24h", "48h", "72h"],
  Ts = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
function Es({
  open: u,
  onOpenChange: m,
  onConfirm: N,
  visitsPerDay: j,
  availableLeads: n = [],
  availableProperties: f = []
}) {
  const [t, o] = c.useState({
      leadName: "",
      leadId: "",
      propertyCode: "",
      date: "",
      time: "",
      confirmed: !1,
      sla: "48h"
    }),
    [C, r] = c.useState(!1),
    v = d => {
      const w = j[d] || 0;
      r(w >= 2), o(P => ({
        ...P,
        date: d
      }));
    },
    x = d => {
      o(w => ({
        ...w,
        time: d
      }));
    },
    _ = d => {
      o(w => ({
        ...w,
        sla: d
      }));
    },
    i = d => {
      o(w => ({
        ...w,
        confirmed: d
      }));
    },
    y = d => {
      o(w => ({
        ...w,
        leadName: d.name,
        leadId: d.id
      }));
    },
    A = d => {
      o(w => ({
        ...w,
        propertyCode: d.id
      }));
    },
    Q = () => {
      N(t), o({
        leadName: "",
        leadId: "",
        propertyCode: "",
        date: "",
        time: "",
        confirmed: !1,
        sla: "48h"
      }), r(!1), m(!1);
    },
    ee = t.leadName && t.propertyCode && t.date && t.time,
    z = new Date(),
    U = new Date(z);
  U.setFullYear(z.getFullYear() - 1);
  const E = new Date(z);
  E.setFullYear(z.getFullYear() + 5);
  const D = d => d.toISOString().split("T")[0];
  return <$e open={u} onOpenChange={m}><Be className="max-w-lg max-h-[90vh] overflow-y-auto p-0"><div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5"><Ye><Qe className="text-xl font-semibold flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><qe className="h-5 w-5 text-accent" /></div><div><span>Criar Visita</span><p className="text-sm font-normal text-muted-foreground mt-0.5">Agende uma nova visita ao imóvel</p></div></Qe></Ye></div><div className="px-6 py-5 space-y-6">{C && <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 text-sm text-warning flex items-center gap-2"><Z className="h-4 w-4 flex-shrink-0" /><span>Este corretor já possui 2 ou mais visitas neste dia. A visita será cadastrada, mas um alerta será gerado.</span></div>}<div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><Ns className="h-4 w-4 text-accent" /><span>Lead & Imóvel</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="space-y-2"><b>Lead *</b>{n.length > 0 ? <e.Fragment><As availableLeads={n} onLeadSelect={y} placeholder="Buscar lead pelo nome, email ou telefone..." />{t.leadName && <p className="text-xs text-success">✓ Lead selecionado: {t.leadName}</p>}</e.Fragment> : <p className="text-xs text-muted-foreground">Nenhum lead disponível para seleção</p>}<p className="text-xs text-muted-foreground">O lead será clicável no card da visita</p></div><div className="space-y-2"><b>Imóvel *</b>{f.length > 0 ? <e.Fragment><Is availableProperties={f} onPropertySelect={A} placeholder="Buscar imóvel: código, nome ou localização..." />{t.propertyCode && <p className="text-xs text-success">✓ Imóvel selecionado: {t.propertyCode}</p>}</e.Fragment> : <p className="text-xs text-muted-foreground">Nenhum imóvel disponível para seleção</p>}</div></div></div><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><Pe className="h-4 w-4 text-accent" /><span>Agendamento</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><b htmlFor="date">Data *</b><div className="relative"><input id="date" type="date" value={t.date} onChange={d => v(d.target.value)} min={D(U)} max={D(E)} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10" /><Pe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" /></div></div><div className="space-y-2"><b htmlFor="time">Horário *</b><_e value={t.time} onValueChange={x}><De><Ve placeholder="Selecione" /></De><Me>{Ts.map(d => <ze value={d}>{d}</ze>)}</Me></_e></div></div><div className="space-y-2"><b htmlFor="sla">SLA</b><_e value={t.sla} onValueChange={_}><De><Ve placeholder="Selecione o SLA" /></De><Me>{Os.map(d => <ze value={d}>{d}</ze>)}</Me></_e></div></div></div><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><Le className="h-4 w-4 text-accent" /><span>Confirmação</span></div><div className="bg-muted/30 rounded-xl p-4 border border-border/50"><div className="space-y-3"><b>Confirmado *</b><div className="flex gap-3"><label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 p-3 transition-all ${t.confirmed ? "border-success bg-success/10 text-success" : "border-border hover:border-success/50"}`}><input type="radio" name="confirmed" checked={t.confirmed === !0} onChange={() => i(!0)} className="sr-only" /><Le className="h-4 w-4" /><span className="text-sm font-medium">Sim, confirmada</span></label><label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 p-3 transition-all ${t.confirmed ? "border-border hover:border-destructive/50" : "border-destructive bg-destructive/10 text-destructive"}`}><input type="radio" name="confirmed" checked={t.confirmed === !1} onChange={() => i(!1)} className="sr-only" /><Z className="h-4 w-4" /><span className="text-sm font-medium">Pendente</span></label></div><p className="text-xs text-muted-foreground">{t.confirmed ? "✓ Evento aparecerá em verde no calendário" : "⚠ Evento aparecerá em vermelho (pendência)"}</p></div></div></div></div><div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3"><h variant="outline" onClick={() => m(!1)}>Cancelar</h><h variant="cta" onClick={Q} disabled={!ee}>Criar Visita</h></div></Be></$e>;
}
function Gs({
  open: u,
  onOpenChange: m,
  onConfirm: N,
  visitInfo: j
}) {
  const [n, f] = c.useState({
      clientAttended: !0,
      interestLevel: "medium",
      positivePoints: "",
      objections: "",
      nextStep: "followup",
      willFormalize: !1,
      noFormalizeReason: ""
    }),
    t = (r, v) => {
      f(x => ({
        ...x,
        [r]: v
      }));
    },
    o = () => {
      N(n), m(!1);
    },
    C = n.clientAttended !== void 0 && (n.willFormalize || n.noFormalizeReason);
  return <$e open={u} onOpenChange={m}><Be className="max-w-lg max-h-[90vh] overflow-y-auto"><Ye><Qe className="text-xl font-semibold flex items-center gap-2"><ys className="h-5 w-5 text-accent" />Registro de Visita</Qe></Ye><div className="bg-muted/50 rounded-lg p-3 mb-4"><p className="text-sm text-muted-foreground">Cliente: <span className="font-medium text-foreground">{j.clientName}</span></p><p className="text-sm text-muted-foreground">Imóvel: <span className="font-medium text-foreground">{j.property}</span></p></div><div className="space-y-5"><div className="space-y-2"><b>Cliente compareceu? *</b><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="clientAttended" checked={n.clientAttended === !0} onChange={() => t("clientAttended", !0)} className="w-4 h-4 accent-success" /><span className="text-sm">Sim</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="clientAttended" checked={n.clientAttended === !1} onChange={() => t("clientAttended", !1)} className="w-4 h-4 accent-destructive" /><span className="text-sm">Não</span></label></div></div>{n.clientAttended && <e.Fragment><div className="space-y-2"><b>Interesse percebido *</b><div className="flex gap-4">{[{
                value: "low",
                label: "Baixo",
                color: "text-destructive"
              }, {
                value: "medium",
                label: "Médio",
                color: "text-warning"
              }, {
                value: "high",
                label: "Alto",
                color: "text-success"
              }].map(r => <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="interestLevel" checked={n.interestLevel === r.value} onChange={() => t("interestLevel", r.value)} className="w-4 h-4" /><span className={`text-sm ${r.color}`}>{r.label}</span></label>)}</div></div><div className="space-y-2"><b htmlFor="positivePoints">Pontos positivos</b><J id="positivePoints" placeholder="O que o cliente gostou..." value={n.positivePoints} onChange={r => t("positivePoints", r.target.value)} rows={2} /></div><div className="space-y-2"><b htmlFor="objections">Objeções</b><J id="objections" placeholder="Dúvidas ou objeções levantadas..." value={n.objections} onChange={r => t("objections", r.target.value)} rows={2} /></div><div className="space-y-2"><b>Próximo passo *</b><div className="flex flex-wrap gap-3">{[{
                value: "followup",
                label: "Follow-up"
              }, {
                value: "new_visit",
                label: "Nova visita"
              }, {
                value: "proposal",
                label: "Proposta"
              }].map(r => <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-colors ${n.nextStep === r.value ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50"}`}><input type="radio" name="nextStep" checked={n.nextStep === r.value} onChange={() => t("nextStep", r.value)} className="sr-only" /><span className="text-sm font-medium">{r.label}</span></label>)}</div></div><div className="space-y-2 p-4 bg-accent/5 border border-accent/20 rounded-lg"><b className="text-accent font-medium">Cliente vai formalizar proposta? *</b><div className="flex gap-4 mt-2"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="willFormalize" checked={n.willFormalize === !0} onChange={() => t("willFormalize", !0)} className="w-4 h-4 accent-success" /><span className="text-sm font-medium text-success">Sim → Criar proposta</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="willFormalize" checked={n.willFormalize === !1} onChange={() => t("willFormalize", !1)} className="w-4 h-4 accent-destructive" /><span className="text-sm">Não</span></label></div>{n.willFormalize === !1 && <div className="mt-3"><b htmlFor="noFormalizeReason" className="text-destructive">Motivo (obrigatório) *</b><J id="noFormalizeReason" placeholder="Por que o cliente não vai formalizar proposta?" value={n.noFormalizeReason} onChange={r => t("noFormalizeReason", r.target.value)} rows={2} className="mt-1" /></div>}</div></e.Fragment>}{!n.clientAttended && <div className="space-y-2"><b htmlFor="noFormalizeReason" className="text-destructive">Motivo da ausência *</b><J id="noFormalizeReason" placeholder="Por que o cliente não compareceu?" value={n.noFormalizeReason} onChange={r => t("noFormalizeReason", r.target.value)} rows={2} /></div>}</div><div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border"><h variant="outline" onClick={() => m(!1)}>Cancelar</h><h variant="cta" onClick={o} disabled={!C}>Registrar Visita</h></div></Be></$e>;
}
const $s = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"],
  Bs = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
function Ys(u, m) {
  const N = new Date(u, m, 1).getDay(),
    j = new Date(u, m + 1, 0).getDate(),
    n = new Date(u, m, 0).getDate(),
    f = [];
  for (let o = N - 1; o >= 0; o--) f.push({
    day: n - o,
    month: m - 1,
    year: m === 0 ? u - 1 : u,
    isCurrentMonth: !1
  });
  for (let o = 1; o <= j; o++) f.push({
    day: o,
    month: m,
    year: u,
    isCurrentMonth: !0
  });
  const t = 7 - f.length % 7;
  if (t < 7) for (let o = 1; o <= t; o++) f.push({
    day: o,
    month: m + 1,
    year: m === 11 ? u + 1 : u,
    isCurrentMonth: !1
  });
  return f;
}
function W(u) {
  return new Date(u).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
function X(u, m, N) {
  return `${u}-${String(m + 1).padStart(2, "0")}-${String(N).padStart(2, "0")}`;
}
function ae(u) {
  const m = encodeURIComponent(u);
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${m}`, "_blank");
}
function mt() {
  var fe, je, be, ve, Ne, ye, we, Ce, Se, ke;
  const u = xs(),
    [m, N] = hs(),
    {
      user: j
    } = ps(),
    [n, f] = c.useState(!1),
    [t, o] = c.useState(!1),
    [C, r] = c.useState("mes"),
    v = new Date(),
    [x, _] = c.useState(v.getFullYear()),
    [i, y] = c.useState(v.getMonth()),
    [A, Q] = c.useState(X(v.getFullYear(), v.getMonth(), v.getDate())),
    [ee, z] = c.useState(!1),
    [U, E] = c.useState(!1),
    [D, d] = c.useState(null),
    [w, P] = c.useState(!1),
    [l, Ke] = c.useState(null),
    [p, re] = c.useState(null),
    {
      data: G = [],
      isLoading: Qs
    } = _s({
      month: i,
      year: x
    }),
    {
      data: ne = []
    } = Ls(),
    {
      data: le = []
    } = Rs(),
    Je = Ds(),
    We = Vs(),
    Xe = Ms(),
    $ = zs(),
    Ze = c.useMemo(() => ne.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email || "",
      phone: s.phone || "",
      score: s.score || 0,
      stage: s.stage,
      propertyCode: ""
    })), [ne]),
    es = c.useMemo(() => le.map(s => ({
      id: s.id,
      title: `${s.code ? s.code + " - " : ""}${s.title}`,
      location: s.location,
      price: s.price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0
      })
    })), [le]);
  c.useEffect(() => {
    m.get("action") === "new" && (z(!0), N({}, {
      replace: !0
    }));
  }, [m, N]);
  const H = c.useMemo(() => {
      const s = {};
      return G.forEach(a => {
        const g = a.scheduled_at.split("T")[0];
        s[g] || (s[g] = []), s[g].push(a);
      }), s;
    }, [G]),
    oe = c.useMemo(() => {
      const s = {};
      return Object.entries(H).forEach(([a, g]) => {
        s[a] = g.length;
      }), s;
    }, [H]),
    ss = c.useMemo(() => Ys(x, i), [x, i]),
    ie = H[A] || [],
    ce = G.filter(s => s.status === "scheduled"),
    L = c.useMemo(() => {
      const s = Date.now();
      return G.filter(a => a.status !== "completed" && a.status !== "cancelled" && new Date(a.scheduled_at).getTime() > s).sort((a, g) => new Date(a.scheduled_at).getTime() - new Date(g.scheduled_at).getTime())[0] || null;
    }, [G]),
    ts = () => {
      i === 0 ? (y(11), _(s => s - 1)) : y(s => s - 1);
    },
    as = () => {
      i === 11 ? (y(0), _(s => s + 1)) : y(s => s + 1);
    },
    rs = () => {
      const s = new Date();
      _(s.getFullYear()), y(s.getMonth()), Q(X(s.getFullYear(), s.getMonth(), s.getDate()));
    },
    ns = s => s.status === "completed" || s.status === "confirmed" ? "bg-success/20 text-success border-l-2 border-success" : s.status === "cancelled" ? "bg-muted text-muted-foreground border-l-2 border-muted" : "bg-destructive/20 text-destructive border-l-2 border-destructive",
    ls = s => {
      switch (s) {
        case "completed":
          return "Concluída";
        case "confirmed":
          return "Confirmada";
        case "cancelled":
          return "Cancelada";
        default:
          return "Pendente";
      }
    },
    de = s => {
      switch (s) {
        case "completed":
          return "bg-success text-success-foreground";
        case "confirmed":
          return "bg-success/20 text-success border border-success";
        case "cancelled":
          return "bg-muted text-muted-foreground";
        default:
          return "bg-destructive text-destructive-foreground";
      }
    },
    me = s => {
      switch (s.google_sync_status) {
        case "synced":
          return "Google ok";
        case "error":
          return "Google erro";
        case "skipped":
          return "Google off";
        default:
          return "Google pendente";
      }
    },
    ue = s => {
      switch (s.google_sync_status) {
        case "synced":
          return "bg-success/10 text-success border-success/20";
        case "error":
          return "bg-destructive/10 text-destructive border-destructive/20";
        case "skipped":
          return "bg-muted text-muted-foreground border-border";
        default:
          return "bg-warning/10 text-warning border-warning/20";
      }
    },
    xe = async s => {
      try {
        await $.mutateAsync({
          visitId: s.id,
          action: s.status === "cancelled" ? "delete" : "upsert"
        }), R({
          title: "Google atualizado",
          description: "A visita foi reenviada para o Google Calendar."
        });
      } catch (a) {
        R({
          title: "Erro no Google",
          description: (a == null ? void 0 : a.message) || "Não foi possível sincronizar.",
          variant: "destructive"
        });
      }
    },
    os = async s => {
      if (!j) return;
      const a = s.leadId || null,
        g = s.propertyCode || null,
        V = `${s.date}T${s.time}:00`;
      try {
        await Je.mutateAsync({
          lead_id: a,
          property_id: g,
          agent_id: j.id,
          created_by: j.id,
          scheduled_at: V,
          status: s.confirmed ? "confirmed" : "scheduled",
          duration_minutes: 90
        }), R({
          title: "Visita Criada",
          description: `Visita agendada para ${s.date} às ${s.time}.`
        });
        const S = (oe[s.date] || 0) + 1;
        S >= 3 && (await Ps(j.id, s.date, S));
      } catch (S) {
        console.error("Erro ao criar visita:", S), R({
          title: "Erro ao criar visita",
          description: (S == null ? void 0 : S.message) || "Tente novamente.",
          variant: "destructive"
        });
      }
    },
    he = async s => {
      try {
        await We.mutateAsync(s), R({
          title: "Visita Confirmada",
          description: "Status atualizado com sucesso."
        });
      } catch (a) {
        console.error("Erro ao confirmar visita:", a), R({
          title: "Erro ao confirmar",
          description: (a == null ? void 0 : a.message) || "Tente novamente.",
          variant: "destructive"
        });
      }
    },
    pe = s => {
      d(s), E(!0);
    },
    is = async s => {
      if (D) {
        try {
          await Xe.mutateAsync({
            id: D.id,
            feedback: `Interesse: ${s.interestLevel}. Pontos positivos: ${s.positivePoints}. Objeções: ${s.objections}. Próximo passo: ${s.nextStep}`,
            rating: s.interestLevel === "high" ? 5 : s.interestLevel === "medium" ? 3 : 1,
            notes: s.willFormalize ? "Cliente vai formalizar proposta" : s.noFormalizeReason || ""
          }), R({
            title: "Visita Registrada",
            description: "Feedback salvo com sucesso."
          });
        } catch (a) {
          console.error("Erro ao registrar visita:", a), R({
            title: "Erro ao registrar",
            description: (a == null ? void 0 : a.message) || "Tente novamente.",
            variant: "destructive"
          });
        }
        d(null);
      }
    },
    cs = s => {
      Ke(s), P(!0);
    },
    ds = s => {
      re(s);
    },
    ge = c.useCallback(s => {
      s ? u("/leads", {
        state: {
          selectedLeadId: s
        }
      }) : u("/leads");
    }, [u]),
    ms = X(v.getFullYear(), v.getMonth(), v.getDate()),
    us = new Date(A + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      weekday: "short"
    });
  return <div className="min-h-screen bg-background"><gs activeModule="agenda" onModuleChange={() => {}} collapsed={n} onCollapsedChange={f} /><fs activeModule="agenda" onModuleChange={() => {}} open={t} onOpenChange={o} /><div className={F("transition-all duration-300", n ? "lg:pl-[72px]" : "lg:pl-64")}><js title="Agenda e Visitas" subtitle="Gestão de compromissos e visitas aos imóveis" actionButton=<div className="flex gap-2"><h variant="cta" className="gap-2" onClick={() => z(!0)}><qe className="h-4 w-4" />Criar Visita</h></div> onMobileMenuClick={() => o(!0)} /><main className="p-4 lg:p-6">{ce.length > 0 && <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3"><Z className="h-5 w-5 text-destructive" /><div><p className="font-medium text-destructive">{ce.length} visita(s) pendente(s) de confirmação</p><p className="text-sm text-muted-foreground">Visitas não confirmadas aparecem em vermelho no calendário</p></div></div>}<div className="flex gap-6"><div className="flex-1"><div className="bg-card rounded-xl shadow-sm p-6"><div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><h variant="ghost" size="icon" onClick={ts}><ws className="h-4 w-4" /></h><h2 className="text-lg font-semibold text-foreground">{Bs[i]} {x}</h2><h variant="ghost" size="icon" onClick={as}><Cs className="h-4 w-4" /></h><h variant="cta" size="sm" onClick={rs}>Hoje</h></div><div className="flex border border-border rounded-lg overflow-hidden">{["mes", "semana", "dia"].map(s => <button onClick={() => r(s)} className={F("px-4 py-2 text-sm font-medium transition-colors", C === s ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50")}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}</div></div><div className="flex items-center gap-4 mb-4 text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success" /><span className="text-muted-foreground">Confirmada</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive" /><span className="text-muted-foreground">Não Confirmada</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent" /><span className="text-muted-foreground">Reunião/Chamada</span></div></div><div className="border border-border rounded-lg overflow-hidden"><div className="grid grid-cols-7 bg-muted/50">{$s.map(s => <div className="py-3 text-center text-sm font-medium text-muted-foreground border-b border-border">{s}</div>)}</div><div className="grid grid-cols-7">{ss.map((s, a) => {
                    const g = X(s.year, s.month, s.day),
                      V = H[g] || [],
                      S = V.length > 2,
                      I = g === A,
                      O = g === ms;
                    return <div onClick={() => Q(g)} className={F("min-h-[100px] p-2 border-b border-r border-border cursor-pointer transition-colors hover:bg-muted/30", I && "bg-accent/5", !s.isCurrentMonth && "opacity-40", a % 7 === 6 && "border-r-0")}><div className="flex items-center justify-between"><span className={F("inline-flex items-center justify-center h-7 w-7 rounded-full text-sm", O && "bg-primary text-primary-foreground font-bold", I && !O && "bg-accent text-accent-foreground font-semibold", !I && !O && "text-foreground")}>{s.day}</span>{S && <Z className="h-4 w-4 text-warning" />}</div><div className="mt-1 space-y-1">{V.slice(0, 3).map(M => {
                          var B, Y, k;
                          return <div onClick={q => {
                            q.stopPropagation(), cs(M);
                          }} className={F("text-xs px-1.5 py-1 rounded truncate cursor-pointer hover:opacity-80", ns(M))}>{W(M.scheduled_at)} - {((Y = (B = M.lead) == null ? void 0 : B.name) == null ? void 0 : Y.split(" ")[0]) || ((k = M.property) == null ? void 0 : k.code) || "Visita"}</div>;
                        })}{V.length > 3 && <div className="text-xs text-muted-foreground px-1.5">+{V.length - 3} mais</div>}</div></div>;
                  })}</div></div></div></div><div className="hidden lg:flex lg:flex-col w-[340px] gap-4"><div className="bg-card rounded-xl shadow-sm overflow-hidden"><div className="p-4 border-b border-border flex items-center justify-between"><h3 className="font-semibold text-foreground">Visitas do Dia</h3><span className="text-sm text-muted-foreground capitalize">{us}</span></div>{L && <div className="p-4"><div className="bg-accent rounded-xl p-4 text-accent-foreground relative overflow-hidden"><T className="bg-accent-foreground/20 text-accent-foreground mb-2">Próxima Visita</T><h4 className="font-semibold text-lg mb-1">{((fe = L.lead) == null ? void 0 : fe.name) || "Visita"}</h4><p className="text-sm opacity-90 mb-2">{((je = L.property) == null ? void 0 : je.title) || ((be = L.property) == null ? void 0 : be.code) || ""}</p><div className="flex items-center gap-1 text-sm opacity-90 mb-4"><Re className="h-4 w-4" />{W(L.scheduled_at)}</div><div className="flex gap-2"><h variant="outline" size="sm" className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => {
                      var a, g;
                      const s = ((a = L.property) == null ? void 0 : a.address) || ((g = L.property) == null ? void 0 : g.location) || "";
                      s && ae(s);
                    }}><se className="h-3 w-3 mr-1" />Iniciar Rota</h><h variant="outline" size="sm" className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => pe(L)}><Ae className="h-3 w-3 mr-1" />Check-in</h></div></div></div>}<div className="border-t border-border">{ie.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">Nenhuma visita agendada para este dia</div>}{ie.map(s => {
                  var a, g, V, S, I, O, M, B, Y;
                  return <div className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"><div className="flex items-start justify-between gap-3"><div className="flex-1 min-w-0"><h5 className="font-medium text-foreground hover:text-accent cursor-pointer truncate" onClick={() => ds(s)}>{((a = s.lead) == null ? void 0 : a.name) || "Visita"}</h5><p className="text-sm text-muted-foreground truncate">{((g = s.property) == null ? void 0 : g.title) || ((V = s.property) == null ? void 0 : V.code) || ""}</p><div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><Re className="h-3 w-3" />{W(s.scheduled_at)}</div>{(((S = s.property) == null ? void 0 : S.address) || ((I = s.property) == null ? void 0 : I.location)) && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><He className="h-3 w-3" />{((O = s.property) == null ? void 0 : O.address) || ((M = s.property) == null ? void 0 : M.location)}</div>}</div><div className="flex flex-col items-end gap-2"><T className={F("text-xs", de(s.status))}>{s.status === "completed" && <e.Fragment><te className="h-3 w-3 mr-1" /> Concluída</e.Fragment>}{s.status === "confirmed" && "Confirmada"}{s.status === "scheduled" && "Pendente"}{s.status === "cancelled" && "Cancelada"}</T><T variant="outline" className={F("text-xs", ue(s))}>{me(s)}</T><div className="flex gap-1">{s.status === "scheduled" && <h size="sm" variant="outline" className="text-xs border-success text-success hover:bg-success/10" onClick={k => {
                            k.stopPropagation(), he(s.id);
                          }}><te className="h-3 w-3 mr-1" />Confirmar</h>}{s.status !== "completed" && s.status !== "cancelled" && <h size="sm" variant="outline" className="text-xs" onClick={k => {
                            k.stopPropagation(), pe(s);
                          }}><Ae className="h-3 w-3 mr-1" />Iniciar</h>}{(((B = s.property) == null ? void 0 : B.address) || ((Y = s.property) == null ? void 0 : Y.location)) && <h size="sm" variant="ghost" className="text-xs" onClick={k => {
                            var q, Fe;
                            k.stopPropagation(), ae(((q = s.property) == null ? void 0 : q.address) || ((Fe = s.property) == null ? void 0 : Fe.location) || "");
                          }}><se className="h-3 w-3" /></h>}{s.google_calendar_link && <h size="sm" variant="ghost" className="text-xs" onClick={k => {
                            k.stopPropagation(), window.open(s.google_calendar_link || "", "_blank");
                          }} title="Abrir no Google Calendar"><K className="h-3 w-3" /></h>}{(s.google_sync_status === "error" || s.google_sync_status === "skipped" || s.google_sync_status === "pending") && <h size="sm" variant="ghost" className="text-xs" onClick={k => {
                            k.stopPropagation(), xe(s);
                          }} disabled={$.isPending} title="Reenviar para Google Calendar"><Ie className={F("h-3 w-3", $.isPending && "animate-spin")} /></h>}</div></div></div></div>;
                })}</div></div>{(p == null ? void 0 : p.lead) && <div className="bg-card rounded-xl shadow-sm overflow-hidden"><div className="p-4 border-b border-border flex items-center justify-between"><h3 className="font-semibold text-foreground text-sm">Detalhes do Lead</h3><button onClick={() => re(null)} className="text-muted-foreground hover:text-foreground"><Oe className="h-4 w-4" /></button></div><div className="p-4 space-y-3"><div className="flex items-center gap-3"><Ee className="h-10 w-10"><Ge className="bg-accent text-accent-foreground text-sm font-semibold">{p.lead.name.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase()}</Ge></Ee><div><p className="font-semibold text-foreground">{p.lead.name}</p><p className="text-xs text-muted-foreground">{p.lead.stage}</p></div></div>{p.lead.phone && <div className="flex items-center gap-2 text-sm"><Ss className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{p.lead.phone}</span></div>}{p.lead.email && <div className="flex items-center gap-2 text-sm"><ks className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{p.lead.email}</span></div>}{p.lead.score !== null && <div className="flex items-center gap-2 text-sm"><Fs className="h-4 w-4 text-accent" /><span className="text-foreground">Score: {p.lead.score}/10</span></div>}{p.lead.source && <div className="text-xs text-muted-foreground">Origem: {p.lead.source}</div>}{p.lead.sla_status && <T className={F("text-xs", p.lead.sla_status === "ok" && "bg-success/20 text-success", p.lead.sla_status === "warning" && "bg-warning/20 text-warning", (p.lead.sla_status === "critical" || p.lead.sla_status === "expired") && "bg-destructive/20 text-destructive")}>SLA: {p.lead.sla_status}</T>}<h variant="outline" size="sm" className="w-full mt-2 gap-2" onClick={() => {
                  var s;
                  return ge((s = p.lead) == null ? void 0 : s.id);
                }}><K className="h-4 w-4" />Ver Lead Completo</h></div></div>}</div></div></main></div><Es open={ee} onOpenChange={z} onConfirm={os} visitsPerDay={oe} availableLeads={Ze} availableProperties={es} />{D && <Gs open={U} onOpenChange={E} onConfirm={is} visitInfo={{
      clientName: ((ve = D.lead) == null ? void 0 : ve.name) || "Visita",
      property: ((Ne = D.property) == null ? void 0 : Ne.title) || ((ye = D.property) == null ? void 0 : ye.code) || ""
    }} />}{l && w && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => P(!1)}><div className="bg-card rounded-xl p-6 max-w-md w-full mx-4" onClick={s => s.stopPropagation()}><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-foreground">{W(l.scheduled_at)} - {((we = l.property) == null ? void 0 : we.title) || ((Ce = l.property) == null ? void 0 : Ce.code) || "Visita"}</h3><button onClick={() => P(!1)} className="text-muted-foreground hover:text-foreground"><Oe className="h-5 w-5" /></button></div><div className="space-y-4">{l.lead && <div><b className="text-muted-foreground">Lead</b><div className="mt-1 p-3 bg-muted rounded-lg flex items-center justify-between"><span className="font-medium text-foreground">{l.lead.name}</span><h size="sm" variant="ghost" onClick={() => {
                var s;
                ge((s = l.lead) == null ? void 0 : s.id), P(!1);
              }}><K className="h-4 w-4" /></h></div></div>}{l.property && <div><b className="text-muted-foreground">Imóvel</b><div className="mt-1 p-3 bg-muted rounded-lg"><p className="font-medium text-foreground">{l.property.title}</p><p className="text-xs text-muted-foreground">{l.property.code} • {l.property.location}</p>{l.property.address && <p className="text-xs text-muted-foreground mt-1">{l.property.address}</p>}</div></div>}<div><b className="text-muted-foreground">Status</b><div className="mt-1 flex flex-wrap gap-2"><T className={F("text-xs", de(l.status))}>{ls(l.status)}</T><T variant="outline" className={F("text-xs", ue(l))}>{me(l)}</T></div>{l.google_sync_error && <p className="mt-2 text-xs text-destructive">{l.google_sync_error}</p>}</div></div><div className="flex gap-2 mt-6 pt-6 border-t border-border"><h variant="outline" onClick={() => P(!1)} className="flex-1">Fechar</h>{l.status === "scheduled" && <h variant="cta" className="flex-1 gap-2" onClick={() => {
            he(l.id), P(!1);
          }}><te className="h-4 w-4" />Confirmar</h>}{(((Se = l.property) == null ? void 0 : Se.address) || ((ke = l.property) == null ? void 0 : ke.location)) && <h variant="outline" className="gap-2" onClick={() => {
            var s, a;
            return ae(((s = l.property) == null ? void 0 : s.address) || ((a = l.property) == null ? void 0 : a.location) || "");
          }}><se className="h-4 w-4" />Rota</h>}{l.google_calendar_link && <h variant="outline" className="gap-2" onClick={() => window.open(l.google_calendar_link || "", "_blank")}><K className="h-4 w-4" />Google</h>}{(l.google_sync_status === "error" || l.google_sync_status === "skipped" || l.google_sync_status === "pending") && <h variant="outline" className="gap-2" onClick={() => xe(l)} disabled={$.isPending}><Ie className={F("h-4 w-4", $.isPending && "animate-spin")} />Sync</h>}</div></div></div>}</div>;
}
export { mt as default };