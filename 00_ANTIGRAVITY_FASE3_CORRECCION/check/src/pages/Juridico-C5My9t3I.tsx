/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Juridico-C5My9t3I.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r as u } from "@/components/vendor-Jm1Lk";
import { I as R, B as m, u as Le, c as _, t as x, A as xe, d as pe, s as he } from "@/components/index-C9";
import { L as f } from "@/components/label";
import { T as Fe } from "@/components/ui/textarea";
import { D as ze, a as Me, b as Te, c as Ie } from "@/components/ui/dialog";
import { S as G, a as H, b as q, c as K, d as v } from "@/components/ui/select";
import { u as $e } from "@/hooks/useProperties";
import { u as Be } from "@/hooks/useLeads";
import { aF as X, F as ve, G as Oe, l as be, aC as Ue, z as ge, u as je, r as F, D as Je, S as Ge, L as se, a as He, A as qe, aG as Ke, ak as Xe, i as Ze, o as Qe, af as We, Z as Ye, _ as es, am as ss, X as as } from "@/components/ui";
import { u as ts, a as rs, b as ns, c as ls, d as is, e as cs, f as os } from "@/hooks/useProposals";
import { u as ds, a as ms } from "@/hooks/useSales";
import { S as us, M as xs, H as ps } from "@/components/Header";
import { B as I } from "@/components/ui/badge";
import "@/lib/supabase";
import "@/components/index";
import "@/components/index";
import "@/components/logo-estate";
const fe = {
  contract_type: "compra_venda",
  property_id: "",
  buyer_name: "",
  buyer_cpf: "",
  buyer_phone: "",
  seller_name: "",
  seller_cpf: "",
  value: "",
  lead_id: "",
  responsible_lawyer: "",
  priority: "normal",
  notes: ""
};
function hs({
  open: d,
  onOpenChange: b,
  onConfirm: Z
}) {
  var T;
  const [l, V] = u.useState(fe),
    [p, C] = u.useState(1),
    {
      data: N = []
    } = $e(),
    {
      data: S = []
    } = Be({});
  u.useEffect(() => {
    d || (V(fe), C(1));
  }, [d]), u.useEffect(() => {
    if (l.lead_id) {
      const a = S.find(c => c.id === l.lead_id);
      a && !l.buyer_name && V(c => ({
        ...c,
        buyer_name: a.name,
        buyer_phone: a.phone || ""
      }));
    }
  }, [l.lead_id, S]), u.useEffect(() => {
    if (l.property_id) {
      const a = N.find(c => c.id === l.property_id);
      a && V(c => ({
        ...c,
        seller_name: c.seller_name || a.owner_name || "",
        value: c.value || String(a.price)
      }));
    }
  }, [l.property_id, N]);
  const g = (a, c) => {
      V(D => ({
        ...D,
        [a]: c
      }));
    },
    $ = () => {
      Z(l), b(!1);
    },
    k = l.contract_type.length > 0,
    B = l.buyer_name.trim().length > 0,
    L = 3,
    M = a => a.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }),
    O = a => {
      switch (a) {
        case "compra_venda":
          return "Compra e Venda";
        case "locacao":
          return "Locação";
        case "permuta":
          return "Permuta";
        case "cessao":
          return "Cessão de Direitos";
        case "distrato":
          return "Distrato";
        default:
          return a;
      }
    };
  return <ze open={d} onOpenChange={b}><Me className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"><div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5"><Te><Ie className="text-xl font-semibold flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><X className="h-5 w-5 text-accent" /></div><div><span>Novo Processo Jurídico</span><p className="text-sm font-normal text-muted-foreground mt-0.5">Etapa {p} de {L}</p></div></Ie></Te><div className="flex gap-2 mt-4">{Array.from({
            length: L
          }).map((a, c) => <div className={`flex-1 h-1.5 rounded-full transition-colors ${c < p ? "bg-accent" : "bg-muted"}`} />)}</div></div><div className="px-6 py-5 space-y-6">{p === 1 && <e.Fragment><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><ve className="h-4 w-4 text-accent" /><span>Tipo de Contrato e Imóvel</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><f>Tipo de Contrato *</f><G value={l.contract_type} onValueChange={a => g("contract_type", a)}><H><q /></H><K><v value="compra_venda">Compra e Venda</v><v value="locacao">Locação</v><v value="permuta">Permuta</v><v value="cessao">Cessão de Direitos</v><v value="distrato">Distrato</v></K></G></div><div className="space-y-2"><f>Prioridade</f><G value={l.priority} onValueChange={a => g("priority", a)}><H><q /></H><K><v value="baixa">Baixa</v><v value="normal">Normal</v><v value="alta">Alta</v><v value="urgente">Urgente</v></K></G></div></div><div className="space-y-2"><f>Imóvel</f><G value={l.property_id} onValueChange={a => g("property_id", a)}><H><q placeholder="Selecione o imóvel" /></H><K>{N.map(a => <v value={a.id}>{a.code} — {a.title} ({M(a.price)})</v>)}</K></G></div>{l.property_id && (() => {
                const a = N.find(c => c.id === l.property_id);
                return a ? <div className="bg-card rounded-lg p-4 border border-border"><p className="font-semibold text-foreground">{a.title}</p><p className="text-sm text-muted-foreground">{a.address || a.location}</p><p className="text-lg font-bold text-accent mt-1">{M(a.price)}</p></div> : null;
              })()}<div className="space-y-2"><f>Valor do Contrato (R$)</f><R placeholder="Ex: 1250000" value={l.value} onChange={a => g("value", a.target.value)} /></div></div></div></e.Fragment>}{p === 2 && <e.Fragment><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><Oe className="h-4 w-4 text-accent" /><span>Comprador / Locatário</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="space-y-2"><f>Vincular a Lead</f><G value={l.lead_id} onValueChange={a => g("lead_id", a)}><H><q placeholder="Selecione um lead (opcional)" /></H><K>{S.map(a => <v value={a.id}>{a.name} — {a.email}</v>)}</K></G></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><f>Nome Completo *</f><R placeholder="Ex: João Silva" value={l.buyer_name} onChange={a => g("buyer_name", a.target.value)} /></div><div className="space-y-2"><f>CPF</f><R placeholder="Ex: 000.000.000-00" value={l.buyer_cpf} onChange={a => g("buyer_cpf", a.target.value)} /></div><div className="space-y-2 md:col-span-2"><f>Telefone</f><R placeholder="Ex: 11999998888" value={l.buyer_phone} onChange={a => g("buyer_phone", a.target.value)} /></div></div></div></div><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><be className="h-4 w-4 text-accent" /><span>Vendedor / Locador</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><f>Nome Completo</f><R placeholder="Ex: Maria Santos" value={l.seller_name} onChange={a => g("seller_name", a.target.value)} /></div><div className="space-y-2"><f>CPF</f><R placeholder="Ex: 000.000.000-00" value={l.seller_cpf} onChange={a => g("seller_cpf", a.target.value)} /></div></div></div></div></e.Fragment>}{p === 3 && <e.Fragment><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><Ue className="h-4 w-4 text-accent" /><span>Revisão e Responsável</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50"><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-muted-foreground">Tipo de Contrato</p><p className="font-medium text-foreground">{O(l.contract_type)}</p></div><div><p className="text-xs text-muted-foreground">Prioridade</p><p className="font-medium text-foreground capitalize">{l.priority}</p></div><div><p className="text-xs text-muted-foreground">Comprador</p><p className="font-medium text-foreground">{l.buyer_name || "—"}</p></div><div><p className="text-xs text-muted-foreground">Vendedor</p><p className="font-medium text-foreground">{l.seller_name || "—"}</p></div><div><p className="text-xs text-muted-foreground">Valor</p><p className="font-medium text-accent">{l.value ? parseFloat(l.value).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0
                    }) : "—"}</p></div><div><p className="text-xs text-muted-foreground">Imóvel</p><p className="font-medium text-foreground">{l.property_id ? ((T = N.find(a => a.id === l.property_id)) == null ? void 0 : T.title) || "—" : "Nenhum vinculado"}</p></div></div></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="space-y-2"><f>Advogado Responsável</f><R placeholder="Ex: Dr. Silvio Santos" value={l.responsible_lawyer} onChange={a => g("responsible_lawyer", a.target.value)} /></div><div className="space-y-2"><f>Observações</f><Fe placeholder="Notas adicionais sobre o processo..." value={l.notes} onChange={a => g("notes", a.target.value)} rows={4} /></div></div></div></e.Fragment>}</div><div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between gap-3"><div>{p > 1 && <m variant="outline" onClick={() => C(p - 1)}>Voltar</m>}</div><div className="flex gap-3"><m variant="outline" onClick={() => b(!1)}>Cancelar</m>{p < L ? <m variant="cta" onClick={() => C(p + 1)} disabled={p === 1 ? !k : p === 2 ? !B : !1}>Próximo</m> : <m variant="cta" onClick={$} disabled={!B}>Criar Processo</m>}</div></div></Me></ze>;
}
const ae = [{
    id: "doc_comprador",
    title: "Documentos do Comprador",
    description: "RG, CPF, comprovante de renda e endereço"
  }, {
    id: "certidoes",
    title: "Certidões Negativas",
    description: "Certidões cíveis, trabalhistas e fiscais"
  }, {
    id: "matricula",
    title: "Matrícula Atualizada do Imóvel",
    description: "Matrícula do cartório de registro"
  }, {
    id: "minuta",
    title: "Aprovação da Minuta do Contrato",
    description: "Revisão e aprovação jurídica"
  }, {
    id: "assinatura",
    title: "Assinatura Digital",
    description: "Assinatura eletrônica das partes"
  }],
  te = [{
    id: "proposta",
    label: "Proposta"
  }, {
    id: "documentacao",
    label: "Documentação"
  }, {
    id: "juridico",
    label: "Jurídico"
  }, {
    id: "assinatura",
    label: "Assinatura"
  }, {
    id: "entrega",
    label: "Entrega"
  }],
  gs = (d, b) => d < b ? "complete" : d === b ? "current" : "pending",
  z = d => d.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }),
  js = d => d ? new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short"
  }) : "-",
  fs = d => {
    switch (d) {
      case "Proposta Comprador":
        return {
          label: "Proposta",
          color: "bg-primary/10 text-primary"
        };
      case "Proposta Vendedor":
        return {
          label: "Proposta Vendedor",
          color: "bg-warning/10 text-warning"
        };
      case "Docs Enviados":
        return {
          label: "Documentação",
          color: "bg-accent/10 text-accent"
        };
      case "Em Análise":
        return {
          label: "Análise Jurídica",
          color: "bg-primary/10 text-primary"
        };
      case "Finalizada":
        return {
          label: "Finalizado",
          color: "bg-success/10 text-success"
        };
      default:
        return {
          label: d,
          color: "bg-muted text-muted-foreground"
        };
    }
  };
function Ms() {
  var ue;
  const [d, b] = u.useState(!1),
    [Z, l] = u.useState(!1),
    [V, p] = u.useState(!1),
    [C, N] = u.useState(null),
    [S, g] = u.useState(""),
    [$, k] = u.useState(null),
    [B, L] = u.useState(null),
    [M, O] = u.useState({}),
    [T, a] = u.useState(null),
    [c, D] = u.useState(null),
    re = u.useRef(null),
    ne = u.useRef(null),
    {
      user: j
    } = Le(),
    {
      data: P = [],
      isLoading: le
    } = ts(),
    Ne = rs(),
    ye = ns(),
    {
      data: y = []
    } = ls(C),
    we = is(),
    Q = cs(),
    _e = os(),
    {
      data: ie = []
    } = ds(),
    U = ms(),
    r = P.find(s => s.id === C) || null,
    W = ((ue = r == null ? void 0 : r.property) == null ? void 0 : ue.status) === "sold" || ie.some(s => s.proposal_id === (r == null ? void 0 : r.id)),
    J = ie.find(s => s.proposal_id === (r == null ? void 0 : r.id)),
    Ce = async () => {
      if (r) try {
        await U.mutateAsync({
          proposal_id: r.id,
          property_id: r.property_id,
          agent_id: r.agent_id || (j == null ? void 0 : j.id) || null,
          buyer_name: r.client_name,
          sale_value: Number(r.value),
          contract_signed_at: new Date().toISOString()
        }), x({
          title: "Venda Registrada com Sucesso!",
          description: `O contrato de ${r.client_name} foi assinado e o imóvel foi marcado como vendido.`
        });
      } catch (s) {
        x({
          title: "Erro ao registrar venda",
          description: (s == null ? void 0 : s.message) || "Tente novamente.",
          variant: "destructive"
        });
      }
    },
    ce = P.filter(s => s.client_name.toLowerCase().includes(S.toLowerCase()) || s.proposal_number.toLowerCase().includes(S.toLowerCase())),
    E = s => y.filter(t => t.checklist_item_id === s),
    Se = ae.filter(s => E(s.id).some(t => t.status === "approved")).length,
    oe = () => {
      let s = 0;
      return E("doc_comprador").some(t => t.status === "approved") && (s = 1), s >= 1 && E("certidoes").some(t => t.status === "approved") && E("matricula").some(t => t.status === "approved") && (s = 2), s >= 2 && E("minuta").some(t => t.status === "approved") && (s = 3), s >= 3 && E("assinatura").some(t => t.status === "approved") && (s = 4), s;
    },
    Y = C ? oe() : 0,
    ee = () => {
      if (!r) return;
      const s = oe();
      s !== (r.current_stage || 0) && ye.mutate({
        id: r.id,
        current_stage: s
      });
    },
    ke = async s => {
      var i;
      const t = (i = s.target.files) == null ? void 0 : i[0],
        o = ne.current;
      if (!(!t || !r || !o || !j)) {
        if (s.target.value = "", t.size > 25 * 1024 * 1024) {
          x({
            title: "Arquivo muito grande",
            description: "Máximo 25MB.",
            variant: "destructive"
          });
          return;
        }
        L(o);
        try {
          const h = t.name.split(".").pop(),
            w = `${r.id}/${o}/${Date.now()}.${h}`,
            {
              error: n
            } = await he.storage.from("legal-documents").upload(w, t);
          if (n) throw n;
          const {
            data: A
          } = he.storage.from("legal-documents").getPublicUrl(w);
          await we.mutateAsync({
            proposal_id: r.id,
            name: t.name,
            file_url: A.publicUrl,
            status: "pending",
            uploaded_by: j.id,
            checklist_item_id: o
          }), x({
            title: "Documento anexado!",
            description: `${t.name} enviado com sucesso.`
          }), setTimeout(ee, 500);
        } catch (h) {
          x({
            title: "Erro ao enviar",
            description: (h == null ? void 0 : h.message) || "Tente novamente.",
            variant: "destructive"
          });
        } finally {
          L(null);
        }
      }
    },
    De = async s => {
      if (!r) return;
      const t = y.find(i => i.id === s),
        o = (t == null ? void 0 : t.checklist_item_id) === "assinatura";
      try {
        await Q.mutateAsync({
          id: s,
          proposal_id: r.id,
          status: "approved"
        }), x({
          title: "Documento aprovado!"
        }), o && (await U.mutateAsync({
          proposal_id: r.id,
          property_id: r.property_id,
          agent_id: r.agent_id || (j == null ? void 0 : j.id) || null,
          buyer_name: r.client_name,
          sale_value: Number(r.value),
          contract_signed_at: new Date().toISOString()
        }), x({
          title: "Venda Registrada com Sucesso!",
          description: `Assinatura digital aprovada. O contrato de ${r.client_name} foi finalizado.`
        })), setTimeout(ee, 500);
      } catch (i) {
        x({
          title: "Erro",
          description: i == null ? void 0 : i.message,
          variant: "destructive"
        });
      }
    },
    Pe = async s => {
      if (r) {
        try {
          await _e.mutateAsync({
            id: s,
            proposal_id: r.id
          }), x({
            title: "Documento removido"
          }), setTimeout(ee, 500);
        } catch (t) {
          x({
            title: "Erro",
            description: t == null ? void 0 : t.message,
            variant: "destructive"
          });
        }
        k(null);
      }
    },
    de = async s => {
      var o;
      if (!r) return;
      const t = (o = M[s]) == null ? void 0 : o.trim();
      try {
        await Q.mutateAsync({
          id: s,
          proposal_id: r.id,
          comment: t || null
        }), x({
          title: "Comentário salvo!"
        }), a(null);
      } catch (i) {
        x({
          title: "Erro",
          description: i == null ? void 0 : i.message,
          variant: "destructive"
        });
      }
    },
    me = async () => {
      if (!(!c || !r)) {
        try {
          await Q.mutateAsync({
            id: c.id,
            proposal_id: r.id,
            name: c.name
          }), x({
            title: "Nome atualizado!"
          }), D(null);
        } catch (s) {
          x({
            title: "Erro",
            description: s == null ? void 0 : s.message,
            variant: "destructive"
          });
        }
        k(null);
      }
    },
    Ee = s => {
      const t = P.length + 1,
        o = `PROP-${String(t).padStart(3, "0")}`,
        i = s.contract_type === "compra_venda" ? "Compra e Venda" : s.contract_type === "locacao" ? "Locação" : s.contract_type === "permuta" ? "Permuta" : s.contract_type;
      Ne.mutate({
        client_name: s.buyer_name,
        proposal_number: o,
        value: parseFloat(s.value) || 0,
        payment_type: i,
        status: "Docs Enviados",
        property_id: s.property_id || null,
        lead_id: s.lead_id || null,
        notes: `[Jurídico] ${i}
Vendedor: ${s.seller_name}
Advogado: ${s.responsible_lawyer}
Prioridade: ${s.priority}
${s.notes}`,
        agent_id: (j == null ? void 0 : j.id) || null,
        created_by: (j == null ? void 0 : j.id) || null,
        current_stage: 0,
        signature_status: "pending"
      }, {
        onSuccess: () => {
          x({
            title: "Processo Criado",
            description: `Contrato de ${i} para ${s.buyer_name} criado com sucesso.`
          });
        },
        onError: h => {
          x({
            title: "Erro ao criar processo",
            description: (h == null ? void 0 : h.message) || "Tente novamente.",
            variant: "destructive"
          });
        }
      });
    },
    Ae = () => <div className="space-y-6"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><div className="bg-card rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Processos</p><p className="text-2xl font-bold text-foreground mt-1">{P.length}</p></div><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><X className="h-6 w-6 text-primary" /></div></div></div><div className="bg-card rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Em Andamento</p><p className="text-2xl font-bold text-foreground mt-1">{P.filter(s => s.status !== "Finalizada").length}</p></div><div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center"><je className="h-6 w-6 text-warning" /></div></div></div><div className="bg-card rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Finalizados</p><p className="text-2xl font-bold text-foreground mt-1">{P.filter(s => s.status === "Finalizada").length}</p></div><div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center"><F className="h-6 w-6 text-success" /></div></div></div><div className="bg-card rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Valor Total</p><p className="text-2xl font-bold text-foreground mt-1">{z(P.reduce((s, t) => s + Number(t.value), 0))}</p></div><div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center"><Je className="h-6 w-6 text-accent" /></div></div></div></div><div className="relative"><Ge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Buscar por cliente ou número do processo..." value={S} onChange={s => g(s.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div><div className="space-y-3">{le && <div className="flex items-center justify-center py-12"><se className="h-6 w-6 animate-spin text-accent" /></div>}{!le && ce.length === 0 && <div className="bg-card rounded-xl p-12 text-center shadow-sm"><X className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" /><p className="text-muted-foreground">Nenhum processo jurídico encontrado.</p><m variant="cta" className="mt-4 gap-2" onClick={() => p(!0)}><ge className="h-4 w-4" /> Criar Primeiro Processo</m></div>}{ce.map(s => {
          var h;
          const t = fs(s.status),
            o = s.current_stage || 0,
            i = Math.min((o + 1) / 5 * 100, 100);
          return <button onClick={() => N(s.id)} className="w-full bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-left border border-transparent hover:border-accent/20"><div className="flex items-center gap-4"><xe className="h-12 w-12 shrink-0"><pe className="bg-primary text-primary-foreground">{s.client_name.split(" ").map(w => w[0]).join("").slice(0, 2)}</pe></xe><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><p className="font-semibold text-foreground truncate">{s.client_name}</p><I className={_("text-xs shrink-0", t.color)}>{t.label}</I></div><div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="font-mono">{s.proposal_number}</span><span>•</span><span>{s.payment_type || "N/A"}</span><span>•</span><span>{js(s.created_at)}</span></div><div className="mt-2 flex items-center gap-2"><div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full transition-all" style={{
                      width: `${i}%`
                    }} /></div><span className="text-xs text-muted-foreground">{(h = te[o]) == null ? void 0 : h.label}</span></div></div><div className="text-right shrink-0"><p className="font-bold text-foreground">{z(Number(s.value))}</p><He className="h-4 w-4 text-muted-foreground ml-auto mt-1" /></div></div></button>;
        })}</div></div>,
    Re = () => {
      var s;
      return r ? <div className="space-y-6"><input ref={re} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={ke} />{c && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => D(null)}><div className="bg-card rounded-xl p-6 w-[400px] shadow-xl" onClick={t => t.stopPropagation()}><h3 className="font-semibold text-foreground mb-4">Renomear Documento</h3><input type="text" value={c.name} onChange={t => D({
              ...c,
              name: t.target.value
            })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" autoFocus={!0} onKeyDown={t => t.key === "Enter" && me()} /><div className="flex gap-2 mt-4 justify-end"><m variant="outline" size="sm" onClick={() => D(null)}>Cancelar</m><m variant="cta" size="sm" onClick={me}>Salvar</m></div></div></div>}<m variant="ghost" className="gap-2 -ml-2" onClick={() => N(null)}><qe className="h-4 w-4" />Voltar para processos</m><div className="flex gap-6"><div className="flex-1 space-y-6"><div className="bg-card rounded-xl p-6 shadow-sm"><div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-foreground">Progresso do Contrato</h2><I className="bg-primary/10 text-primary border border-primary/20">{((s = te[Y]) == null ? void 0 : s.label) || "Proposta"}</I></div><div className="relative"><div className="flex items-center justify-between">{te.map((t, o) => {
                    const i = gs(o, Y);
                    return <div className="flex flex-col items-center relative z-10"><div className={_("h-10 w-10 rounded-full flex items-center justify-center transition-colors", i === "complete" ? "bg-success text-success-foreground" : i === "current" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>{i === "complete" ? <F className="h-5 w-5" /> : i === "current" ? <X className="h-5 w-5" /> : <span className="text-sm">◎</span>}</div><span className={_("text-sm font-medium mt-2", i === "current" ? "text-accent" : "text-foreground")}>{t.label}</span></div>;
                  })}</div><div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0"><div className="h-full bg-success transition-all" style={{
                    width: `${Y / 4 * 100}%`
                  }} /></div></div></div><div className="bg-card rounded-xl p-6 shadow-sm"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><F className="h-5 w-5 text-success" /><h2 className="text-lg font-semibold text-foreground">Checklist de Validação</h2></div><span className="text-sm text-muted-foreground"><strong>{Se}</strong> de {ae.length} concluídos</span></div><div className="space-y-3">{ae.map(t => {
                  const o = E(t.id),
                    i = o.some(n => n.status === "approved"),
                    h = o.some(n => n.status === "pending"),
                    w = B === t.id;
                  return <div className={_("rounded-lg border transition-colors", i ? "border-success/30 bg-success/5" : h ? "border-warning/30 bg-warning/5" : "border-border")}><div className="flex items-start gap-3 p-4">{i ? <F className="h-5 w-5 text-success mt-0.5" /> : h ? <je className="h-5 w-5 text-warning mt-0.5" /> : <Ke className="h-5 w-5 text-muted-foreground mt-0.5" />}<div className="flex-1"><p className="font-medium text-foreground">{t.title}</p><p className="text-sm text-muted-foreground mt-0.5">{t.description}</p>{o.length > 0 && <p className="text-xs text-accent mt-1">{o.length} documento(s) anexado(s)</p>}</div><m variant="outline" size="sm" className="gap-1 shrink-0" disabled={w} onClick={() => {
                        var n;
                        ne.current = t.id, (n = re.current) == null || n.click();
                      }}>{w ? <se className="h-3 w-3 animate-spin" /> : <Xe className="h-3 w-3" />}{w ? "Enviando..." : "Anexar"}</m></div>{o.length > 0 && <div className="border-t border-border/50 bg-muted/20">{o.map(n => <div className="px-4 py-3 border-b border-border/30 last:border-0"><div className="flex items-center gap-3"><ve className="h-4 w-4 text-accent shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{n.name}</p><div className="flex items-center gap-2 mt-0.5"><I className={_("text-[10px] px-1.5 py-0", n.status === "approved" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{n.status === "approved" ? "Aprovado" : "Pendente"}</I><span className="text-xs text-muted-foreground">{n.created_at ? new Date(n.created_at).toLocaleDateString("pt-BR") : ""}</span></div>{n.comment && <p className="text-xs text-muted-foreground mt-1 italic">💬 {n.comment}</p>}</div><div className="flex items-center gap-1 shrink-0">{n.status === "pending" && <m variant="ghost" size="icon" className="h-7 w-7" title="Aprovar" onClick={() => De(n.id)}><F className="h-3.5 w-3.5 text-success" /></m>}{n.file_url && <m variant="ghost" size="icon" className="h-7 w-7" title="Visualizar" onClick={() => window.open(n.file_url, "_blank")}><Ze className="h-3.5 w-3.5" /></m>}<m variant="ghost" size="icon" className="h-7 w-7" title="Comentar" onClick={() => {
                              a(T === n.id ? null : n.id), O(A => ({
                                ...A,
                                [n.id]: n.comment || ""
                              }));
                            }}><Qe className="h-3.5 w-3.5" /></m><div className="relative"><m variant="ghost" size="icon" className="h-7 w-7" onClick={() => k($ === n.id ? null : n.id)}><We className="h-3.5 w-3.5" /></m>{$ === n.id && <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-50 py-1"><button className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2" onClick={() => {
                                  D({
                                    id: n.id,
                                    name: n.name
                                  }), k(null);
                                }}><Ye className="h-3 w-3" /> Renomear</button>{n.file_url && <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2" onClick={() => {
                                  window.open(n.file_url, "_blank"), k(null);
                                }}><es className="h-3 w-3" /> Abrir Arquivo</button>}<button className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2 text-destructive" onClick={() => Pe(n.id)}><ss className="h-3 w-3" /> Excluir</button></div>}</div></div></div>{T === n.id && <div className="mt-2 flex gap-2"><input type="text" placeholder="Adicionar comentário..." value={M[n.id] || ""} onChange={A => O(Ve => ({
                            ...Ve,
                            [n.id]: A.target.value
                          }))} className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" onKeyDown={A => A.key === "Enter" && de(n.id)} autoFocus={!0} /><m size="sm" variant="cta" onClick={() => de(n.id)}>Salvar</m><m size="sm" variant="ghost" onClick={() => a(null)}><as className="h-3 w-3" /></m></div>}</div>)}</div>}</div>;
                })}</div></div></div><div className="hidden lg:block w-[340px] space-y-6"><div className="bg-card rounded-xl p-6 shadow-sm"><h3 className="font-semibold text-foreground mb-4">DETALHES DA TRANSAÇÃO</h3><div className="space-y-4"><div><p className="text-sm text-muted-foreground">Valor do Imóvel</p><p className="text-2xl font-bold text-foreground">{z(Number(r.value))}</p></div><div className="flex gap-8"><div><p className="text-sm text-muted-foreground">Comissão (5%)</p><p className="text-lg font-semibold text-accent">{z(Number(r.value) * .05)}</p></div><div><p className="text-sm text-muted-foreground">Tipo</p><p className="text-lg font-semibold text-foreground">{r.payment_type || "N/A"}</p></div></div></div><div className="mt-6 pt-4 border-t border-border"><p className="text-sm text-muted-foreground mb-2">Cliente</p><div className="flex items-center gap-3"><xe className="h-10 w-10"><pe className="bg-primary/20 text-primary">{r.client_name.split(" ").map(t => t[0]).join("").slice(0, 2)}</pe></xe><div><p className="font-medium text-foreground">{r.client_name}</p><p className="text-sm text-muted-foreground">{r.proposal_number}</p></div></div></div></div><div className="bg-card rounded-xl p-6 shadow-sm"><h3 className="font-semibold text-foreground mb-3">RESUMO DOCUMENTOS</h3><div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Total anexados</span><span className="font-medium">{y.length}</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Aprovados</span><span className="font-medium text-success">{y.filter(t => t.status === "approved").length}</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Pendentes</span><span className="font-medium text-warning">{y.filter(t => t.status === "pending").length}</span></div><div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-3"><div className="h-full bg-success rounded-full transition-all" style={{
                    width: `${y.length > 0 ? y.filter(t => t.status === "approved").length / y.length * 100 : 0}%`
                  }} /></div></div></div>{r.notes && <div className="bg-card rounded-xl p-6 shadow-sm"><h3 className="font-semibold text-foreground mb-3">OBSERVAÇÕES</h3><p className="text-sm text-muted-foreground whitespace-pre-line">{r.notes}</p></div>}<div className={_("bg-card rounded-xl p-6 shadow-sm border transition-all", W ? "border-success/30 bg-success/5" : "border-border hover:border-accent/30")}><h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><be className={_("h-4 w-4", W ? "text-success" : "text-muted-foreground")} />REGISTRO DE VENDA</h3>{W ? <div className="space-y-3"><div className="flex items-center gap-2"><I className="bg-success/10 text-success hover:bg-success/20 border border-success/30 font-medium">✓ Venda Finalizada</I></div><p className="text-xs text-muted-foreground">Este imóvel foi registrado como **Vendido** no catálogo.</p>{J && <div className="mt-2 pt-2 border-t border-success/10 space-y-1.5 text-xs text-muted-foreground text-left"><div className="flex justify-between"><span>Data:</span><span className="font-medium text-foreground">{J.contract_signed_at ? new Date(J.contract_signed_at).toLocaleDateString("pt-BR") : "-"}</span></div><div className="flex justify-between"><span>Valor de Venda:</span><span className="font-medium text-foreground">{z(Number(J.sale_value))}</span></div></div>}</div> : <div className="space-y-3"><div className="flex items-center gap-2"><I className="bg-warning/10 text-warning border border-warning/30 font-medium">Aguardando Fechamento</I></div><p className="text-xs text-muted-foreground">Ao assinar o contrato, você pode registrar a venda para atualizar o status do imóvel e gerar o comissionamento.</p><m variant="cta" className="w-full text-xs font-semibold py-2 h-auto gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/10 hover:shadow-amber-600/20 active:scale-95 transition-all text-white border-0" onClick={Ce} disabled={U.isPending}>{U.isPending ? <se className="h-3.5 w-3.5 animate-spin" /> : <F className="h-3.5 w-3.5" />}Confirmar Assinatura e Venda</m></div>}</div></div></div></div> : null;
    };
  return <div className="min-h-screen bg-background"><us activeModule="juridico" onModuleChange={() => {}} collapsed={d} onCollapsedChange={b} /><xs activeModule="juridico" onModuleChange={() => {}} open={Z} onOpenChange={l} /><div className={_("transition-all duration-300", d ? "lg:pl-[72px]" : "lg:pl-64")}><ps title={r ? `${r.payment_type || "Contrato"} - ${r.proposal_number}` : "Jurídico"} subtitle={r ? `${r.client_name} • ${z(Number(r.value))}` : "Gerencie processos jurídicos e contratos"} actionButton=<m variant="cta" className="gap-2" onClick={() => p(!0)}><ge className="h-4 w-4" />Novo Processo</m> onMobileMenuClick={() => l(!0)} /><main className="p-4 lg:p-6">{r ? Re() : Ae()}</main></div><hs open={V} onOpenChange={p} onConfirm={Ee} /></div>;
}
export { Ms as default };