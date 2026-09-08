/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Propostas-DnXbTxRT.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r as g } from "@/components/vendor-Jm1Lk";
import { I as X, B as l, u as me, t as N, c as k } from "@/components/index-C9";
import { S as xe, M as ue, H as he } from "@/components/Header";
import { u as pe, a as je, b as ge } from "@/hooks/useProposals";
import { L as b } from "@/components/label";
import { T as fe } from "@/components/ui/textarea";
import { D as ve, a as Ne, b as be, c as ye } from "@/components/ui/dialog";
import { S as A, a as R, b as T, c as M, d as c } from "@/components/ui/select";
import { u as Ce } from "@/hooks/useLeads";
import { u as we } from "@/hooks/useProperties";
import { F as $, G as Se, l as Pe, aC as se, z as _e, aD as Fe, aE as Ee, U as Ve, D as ze, O as De, ai as ke, L as Ae, u as Re, r as J, i as q, a as K, af as Te, s as Me } from "@/components/ui";
import { B as z } from "@/components/ui/badge";
import { D as Q, a as W, b as Y, d as S, e as Z } from "@/components/ui/dropdown-menu";
import "@/lib/supabase";
import "@/components/logo-estate";
import "@/components/index";
import "@/components/index";
const ee = {
  client_name: "",
  lead_id: "",
  property_id: "",
  value: "",
  payment_type: "Financiamento",
  status: "Docs Enviados",
  notes: ""
};
function Le({
  open: n,
  onOpenChange: y,
  onConfirm: C
}) {
  var E;
  const [t, f] = g.useState(ee),
    [o, P] = g.useState(1),
    {
      data: v = []
    } = Ce({}),
    {
      data: _ = []
    } = we();
  g.useEffect(() => {
    n || (f(ee), P(1));
  }, [n]), g.useEffect(() => {
    if (t.lead_id) {
      const a = v.find(i => i.id === t.lead_id);
      a && !t.client_name && f(i => ({
        ...i,
        client_name: a.name
      }));
    }
  }, [t.lead_id, v]);
  const h = (a, i) => {
      f(D => ({
        ...D,
        [a]: i
      }));
    },
    w = () => {
      C(t), y(!1);
    },
    F = t.client_name.trim() && t.value.trim(),
    p = 3,
    m = a => a.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    });
  return <ve open={n} onOpenChange={y}><Ne className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"><div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5"><be><ye className="text-xl font-semibold flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><$ className="h-5 w-5 text-accent" /></div><div><span>Nova Proposta</span><p className="text-sm font-normal text-muted-foreground mt-0.5">Etapa {o} de {p}</p></div></ye></be><div className="flex gap-2 mt-4">{Array.from({
            length: p
          }).map((a, i) => <div className={`flex-1 h-1.5 rounded-full transition-colors ${i < o ? "bg-accent" : "bg-muted"}`} />)}</div></div><div className="px-6 py-5 space-y-6">{o === 1 && <e.Fragment><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><Se className="h-4 w-4 text-accent" /><span>Cliente e Valor</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="space-y-2"><b>Lead Vinculado</b><A value={t.lead_id} onValueChange={a => h("lead_id", a)}><R><T placeholder="Selecione um lead (opcional)" /></R><M>{v.map(a => <c value={a.id}>{a.name} — {a.email}</c>)}</M></A></div><div className="space-y-2"><b>Nome do Cliente *</b><X placeholder="Ex: João Silva" value={t.client_name} onChange={a => h("client_name", a.target.value)} /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><b>Valor da Proposta (R$) *</b><X placeholder="Ex: 1250000" value={t.value} onChange={a => h("value", a.target.value)} /></div><div className="space-y-2"><b>Forma de Pagamento</b><A value={t.payment_type} onValueChange={a => h("payment_type", a)}><R><T /></R><M><c value="Financiamento">Financiamento</c><c value="À Vista">À Vista</c><c value="Parcelado Direto">Parcelado Direto</c><c value="FGTS + Financiamento">FGTS + Financiamento</c><c value="Permuta">Permuta</c><c value="Consórcio">Consórcio</c></M></A></div></div></div></div></e.Fragment>}{o === 2 && <e.Fragment><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><Pe className="h-4 w-4 text-accent" /><span>Imóvel Vinculado</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="space-y-2"><b>Selecione o Imóvel</b><A value={t.property_id} onValueChange={a => h("property_id", a)}><R><T placeholder="Selecione um imóvel" /></R><M>{_.map(a => <c value={a.id}>{a.code} — {a.title} ({m(a.price)})</c>)}</M></A></div>{t.property_id && (() => {
                const a = _.find(i => i.id === t.property_id);
                return a ? <div className="bg-card rounded-lg p-4 border border-border"><p className="font-semibold text-foreground">{a.title}</p><p className="text-sm text-muted-foreground">{a.address || a.location}</p><p className="text-lg font-bold text-accent mt-2">{m(a.price)}</p></div> : null;
              })()}<div className="space-y-2"><b>Status Inicial</b><A value={t.status} onValueChange={a => h("status", a)}><R><T /></R><M><c value="Docs Enviados">Docs Enviados</c><c value="Proposta Comprador">Proposta Comprador</c><c value="Finalizada Comprador">Finalizada Comprador</c><c value="Proposta Vendedor">Proposta Vendedor</c><c value="Finalizada">Finalizada</c></M></A></div></div></div></e.Fragment>}{o === 3 && <e.Fragment><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><se className="h-4 w-4 text-accent" /><span>Revisão e Observações</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50"><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-muted-foreground">Cliente</p><p className="font-medium text-foreground">{t.client_name || "—"}</p></div><div><p className="text-xs text-muted-foreground">Valor</p><p className="font-medium text-accent">{t.value ? parseFloat(t.value).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0
                    }) : "—"}</p></div><div><p className="text-xs text-muted-foreground">Pagamento</p><p className="font-medium text-foreground">{t.payment_type}</p></div><div><p className="text-xs text-muted-foreground">Status</p><p className="font-medium text-foreground">{t.status}</p></div><div className="col-span-2"><p className="text-xs text-muted-foreground">Imóvel</p><p className="font-medium text-foreground">{t.property_id ? ((E = _.find(a => a.id === t.property_id)) == null ? void 0 : E.title) || "—" : "Nenhum vinculado"}</p></div></div></div><div className="space-y-2"><b>Observações</b><fe placeholder="Notas adicionais sobre a proposta..." value={t.notes} onChange={a => h("notes", a.target.value)} rows={4} /></div></div></e.Fragment>}</div><div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between gap-3"><div>{o > 1 && <l variant="outline" onClick={() => P(o - 1)}>Voltar</l>}</div><div className="flex gap-3"><l variant="outline" onClick={() => y(!1)}>Cancelar</l>{o < p ? <l variant="cta" onClick={() => P(o + 1)} disabled={o === 1 && !F}>Próximo</l> : <l variant="cta" onClick={w} disabled={!F}>Criar Proposta</l>}</div></div></Ne></ve>;
}
const I = n => n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }),
  L = ["Docs Enviados", "Proposta Comprador", "Finalizada Comprador", "Proposta Vendedor", "Finalizada"],
  Oe = n => L.map((y, C) => C < n ? "complete" : C === n ? "current" : "pending"),
  Ie = n => Math.min(100, Math.round((n + 1) / 5 * 100)),
  $e = n => n === "Finalizada" || n === "Finalizada Comprador" ? "green" : n === "Proposta Comprador" || n === "Proposta Vendedor" ? "blue" : n === "Cancelada" ? "gray" : "orange",
  Be = [{
    label: "Todas"
  }, {
    label: "Docs Enviados"
  }, {
    label: "Em Negociação"
  }, {
    label: "Finalizadas"
  }];
function is() {
  var B, U;
  const [n, y] = g.useState(!1),
    [C, t] = g.useState(!1),
    [f, o] = g.useState("Todas"),
    [P, v] = g.useState(null),
    [_, h] = g.useState(!1),
    [w, F] = g.useState(null),
    {
      user: p
    } = me(),
    {
      data: m = [],
      isLoading: E
    } = pe(),
    a = je(),
    i = ge(),
    D = s => {
      const r = s.current_stage || 0;
      if (r >= 4) return;
      const x = r + 1,
        d = L[x] || s.status;
      i.mutate({
        id: s.id,
        current_stage: x,
        status: d
      }, {
        onSuccess: () => N({
          title: "Proposta Atualizada",
          description: `Avançada para: ${d}`
        }),
        onError: u => N({
          title: "Erro",
          description: (u == null ? void 0 : u.message) || "Tente novamente.",
          variant: "destructive"
        })
      });
    },
    ae = s => {
      i.mutate({
        id: s.id,
        status: "Cancelada"
      }, {
        onSuccess: () => N({
          title: "Proposta Cancelada",
          description: `Proposta ${s.proposal_number} foi cancelada.`
        }),
        onError: r => N({
          title: "Erro",
          description: (r == null ? void 0 : r.message) || "Tente novamente.",
          variant: "destructive"
        })
      });
    },
    te = s => {
      i.mutate({
        id: s.id,
        signature_status: "signed"
      }, {
        onSuccess: () => N({
          title: "Assinatura Registrada",
          description: `Proposta ${s.proposal_number} marcada como assinada.`
        }),
        onError: r => N({
          title: "Erro",
          description: (r == null ? void 0 : r.message) || "Tente novamente.",
          variant: "destructive"
        })
      });
    },
    re = s => {
      const r = m.length + 1,
        x = `PROP-${String(r).padStart(3, "0")}`;
      a.mutate({
        client_name: s.client_name,
        proposal_number: x,
        value: parseFloat(s.value) || 0,
        payment_type: s.payment_type || null,
        status: s.status || "Docs Enviados",
        property_id: s.property_id || null,
        lead_id: s.lead_id || null,
        notes: s.notes || null,
        agent_id: (p == null ? void 0 : p.id) || null,
        created_by: (p == null ? void 0 : p.id) || null,
        current_stage: 0,
        signature_status: "pending"
      }, {
        onSuccess: () => {
          N({
            title: "Proposta Criada",
            description: `Proposta ${x} para ${s.client_name} criada com sucesso.`
          });
        },
        onError: d => {
          N({
            title: "Erro ao criar proposta",
            description: (d == null ? void 0 : d.message) || "Tente novamente.",
            variant: "destructive"
          });
        }
      });
    },
    j = m.find(s => s.id === P) || null,
    V = m.filter(s => !(f === "Docs Enviados" && s.status !== "Docs Enviados" || f === "Em Negociação" && !["Proposta Comprador", "Finalizada Comprador", "Proposta Vendedor"].includes(s.status) || f === "Finalizadas" && s.status !== "Finalizada" || w && s.payment_type !== w)),
    ne = m.reduce((s, r) => s + (r.value || 0), 0),
    le = m.filter(s => s.status === "Docs Enviados").length,
    ie = m.filter(s => s.signature_status === "pending").length,
    de = s => {
      switch (s) {
        case "blue":
          return "text-primary";
        case "green":
          return "text-success";
        case "orange":
          return "text-accent";
        case "gray":
          return "text-muted-foreground";
      }
    },
    ce = s => {
      switch (s) {
        case "blue":
          return "bg-primary";
        case "green":
          return "bg-success";
        case "orange":
          return "bg-accent";
        case "gray":
          return "bg-muted-foreground";
      }
    },
    oe = s => s === "complete" ? "bg-success" : s === "current" ? "bg-accent" : "bg-muted";
  return <div className="min-h-screen bg-background"><xe activeModule="propostas" onModuleChange={() => {}} collapsed={n} onCollapsedChange={y} /><ue activeModule="propostas" onModuleChange={() => {}} open={C} onOpenChange={t} /><div className={k("transition-all duration-300", n ? "lg:pl-[72px]" : "lg:pl-64")}><he title="Gestão de Propostas" subtitle="Gerencie negociações e aprovações em tempo real" actionButton=<l variant="cta" className="gap-2" onClick={() => h(!0)}><_e className="h-4 w-4" />Nova Proposta</l> onMobileMenuClick={() => t(!0)} /><main className="p-4 lg:p-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><div className="bg-card rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Propostas Ativas</p><p className="text-3xl font-bold text-foreground mt-1">{m.length}</p></div><div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center"><$ className="h-6 w-6 text-accent" /></div></div><p className="text-sm text-success flex items-center gap-1 mt-3"><Fe className="h-3 w-3" />12% vs. mês anterior</p></div><div className="bg-card rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Aguardando Docs</p><p className="text-3xl font-bold text-foreground mt-1">{le}</p></div><div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center"><se className="h-6 w-6 text-warning" /></div></div><p className="text-sm text-destructive flex items-center gap-1 mt-3"><Ee className="h-3 w-3" />5% vs. mês anterior</p></div><div className="bg-card rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Aguardando Assinatura</p><p className="text-3xl font-bold text-foreground mt-1">{ie}</p></div><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Ve className="h-6 w-6 text-primary" /></div></div><p className="text-sm text-muted-foreground mt-3">→0% vs. mês anterior</p></div><div className="bg-accent rounded-xl p-5 shadow-sm text-accent-foreground relative overflow-hidden"><div className="relative z-10"><p className="text-sm opacity-90">Valor Total em Proposta</p><p className="text-3xl font-bold mt-1">{I(ne)}</p><z className="mt-3 bg-white/20 text-white">+ R$ 2.1M essa semana</z></div><ze className="absolute right-4 top-4 h-10 w-10 opacity-20" /></div></div><div className="bg-card rounded-xl p-4 mb-6"><p className="text-sm font-medium text-muted-foreground mb-3">ESTÁGIOS DA PROPOSTA</p><div className="flex flex-wrap gap-6">{L.map((s, r) => <div className="flex items-center gap-2"><div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium">{r + 1}</div><span className="text-sm text-foreground">{s}</span></div>)}</div></div><div className="flex flex-wrap items-center justify-between gap-4 mb-6"><div className="flex items-center gap-2">{Be.map(s => <l variant={f === s.label ? "default" : "outline"} size="sm" onClick={() => o(s.label)} className={f === s.label ? "bg-foreground text-background" : ""}>{s.label}</l>)}</div><div className="flex items-center gap-2"><Q><W asChild={!0}><l variant={w ? "default" : "outline"} size="sm" className="gap-2"><De className="h-4 w-4" />{w || "Filtrar"}</l></W><Y align="end"><S onClick={() => F(null)}>Todos os pagamentos</S><Z />{["Financiamento", "À Vista", "Parcelado Direto", "FGTS + Financiamento", "Permuta", "Consórcio"].map(s => <S onClick={() => F(s)}>{s}</S>)}</Y></Q><l variant="outline" size="sm" className="gap-2" onClick={() => {
              const s = ["Número,Cliente,Valor,Status,Pagamento", ...V.map(u => `${u.proposal_number},${u.client_name},${u.value},${u.status},${u.payment_type || "-"}`)].join(`
`),
                r = new Blob([s], {
                  type: "text/csv"
                }),
                x = URL.createObjectURL(r),
                d = <a />;
              d.href = x, d.download = "propostas.csv", d.click(), URL.revokeObjectURL(x), N({
                title: "Exportado",
                description: `${V.length} propostas exportadas.`
              });
            }}><ke className="h-4 w-4" />Exportar</l></div></div><div className="bg-card rounded-xl shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border"><th className="text-left p-4 text-sm font-medium text-muted-foreground">IMÓVEL & CLIENTE</th><th className="text-left p-4 text-sm font-medium text-muted-foreground">VALOR PROPOSTO</th><th className="text-left p-4 text-sm font-medium text-muted-foreground">ESTÁGIO & PROGRESSO</th><th className="text-left p-4 text-sm font-medium text-muted-foreground">ASSINATURA</th><th className="text-left p-4 text-sm font-medium text-muted-foreground">AÇÕES</th></tr></thead><tbody>{E && <tr><td colSpan={5} className="p-8 text-center"><Ae className="h-6 w-6 animate-spin mx-auto text-accent" /><p className="text-sm text-muted-foreground mt-2">Carregando propostas...</p></td></tr>}{!E && V.length === 0 && <tr><td colSpan={5} className="p-8 text-center"><p className="text-muted-foreground">Nenhuma proposta encontrada.</p></td></tr>}{V.map(s => {
                  var G;
                  const r = $e(s.status),
                    x = s.current_stage || 0,
                    d = Ie(x),
                    u = Oe(x);
                  return <tr className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => v(s.id)}><td className="p-4"><div className="flex items-center gap-3"><div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><$ className="h-5 w-5 text-muted-foreground" /></div><div><p className="font-medium text-foreground">{((G = s.property) == null ? void 0 : G.title) || "Imóvel não vinculado"}</p><p className="text-sm text-muted-foreground">Cliente: {s.client_name}</p><p className="text-xs text-accent">{s.proposal_number}</p></div></div></td><td className="p-4"><p className="font-semibold text-foreground">{I(s.value)}</p><p className="text-sm text-accent">{s.payment_type || "-"}</p></td><td className="p-4"><div className="space-y-2"><div className="flex items-center justify-between"><span className={k("text-sm font-medium", de(r))}>{s.status}</span><span className="text-sm text-muted-foreground">{d}%</span></div><div className="flex items-center gap-1"><div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className={k("h-full rounded-full", ce(r))} style={{
                              width: `${d}%`
                            }} /></div></div><div className="flex items-center gap-2">{u.map((O, H) => <div className={k("h-2 w-2 rounded-full", oe(O))} title={L[H]} />)}</div></div></td><td className="p-4">{s.signature_status === "pending" && <z variant="outline" className="text-warning border-warning"><Re className="h-3 w-3 mr-1" />Pendente</z>}{s.signature_status === "signed" && <z variant="outline" className="text-success border-success"><J className="h-3 w-3 mr-1" />Assinado</z>}{s.signature_status === "na" && <z variant="outline" className="text-muted-foreground">N/A</z>}</td><td className="p-4"><div className="flex items-center gap-1" onClick={O => O.stopPropagation()}>{d === 100 ? <l variant="cta" size="sm" onClick={() => v(s.id)}>Ver Contrato</l> : <e.Fragment><l variant="ghost" size="icon" title="Ver detalhes" onClick={() => v(s.id)}><q className="h-4 w-4" /></l><l variant="ghost" size="icon" title="Avançar etapa" onClick={() => D(s)}><K className="h-4 w-4" /></l></e.Fragment>}<Q><W asChild={!0}><l variant="ghost" size="icon"><Te className="h-4 w-4" /></l></W><Y align="end"><S onClick={() => v(s.id)}><q className="h-4 w-4 mr-2" />Ver Detalhes</S>{(s.current_stage || 0) < 4 && <S onClick={() => D(s)}><K className="h-4 w-4 mr-2" />Avançar Etapa</S>}{s.signature_status === "pending" && <S onClick={() => te(s)}><J className="h-4 w-4 mr-2" />Marcar como Assinada</S>}<Z /><S className="text-destructive" onClick={() => ae(s)}><Me className="h-4 w-4 mr-2" />Cancelar Proposta</S></Y></Q></div></td></tr>;
                })}</tbody></table></div><div className="flex items-center justify-between p-4 border-t border-border"><span className="text-sm text-muted-foreground">Mostrando {V.length} de {m.length} resultados</span><div className="flex items-center gap-1"><l variant="outline" size="sm" disabled={!0}>Anterior</l><l variant="default" size="sm" className="min-w-8">1</l><l variant="outline" size="sm" className="min-w-8">2</l><l variant="outline" size="sm" className="min-w-8">3</l><span className="px-2 text-muted-foreground">...</span><l variant="outline" size="sm">Próxima</l></div></div></div><div className="text-center text-sm text-muted-foreground mt-8">© 2024 ApeXy CRM. Todos os direitos reservados.</div></main></div>{j && <div className="fixed right-0 top-0 h-screen w-[400px] bg-card border-l border-border shadow-lg overflow-y-auto z-50 p-6"><div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold">{j.proposal_number}</h3><l variant="ghost" size="sm" onClick={() => v(null)}>Fechar</l></div><div className="space-y-4"><div><p className="text-xs text-muted-foreground">Imóvel</p><p className="font-medium">{((B = j.property) == null ? void 0 : B.title) || "-"}</p></div><div><p className="text-xs text-muted-foreground">Cliente</p><p className="font-medium">{j.client_name}</p></div><div><p className="text-xs text-muted-foreground">Valor</p><p className="font-medium">{I(j.value)}</p></div><div><p className="text-xs text-muted-foreground">Status</p><z variant="outline">{j.status}</z></div><div><p className="text-xs text-muted-foreground">Pagamento</p><p className="font-medium">{j.payment_type || "-"}</p></div><div><p className="text-xs text-muted-foreground">Corretor</p><p className="font-medium">{((U = j.agent) == null ? void 0 : U.full_name) || "-"}</p></div>{j.notes && <div><p className="text-xs text-muted-foreground">Notas</p><p className="text-sm">{j.notes}</p></div>}</div></div>}<Le open={_} onOpenChange={h} onConfirm={re} /></div>;
}
export { is as default };