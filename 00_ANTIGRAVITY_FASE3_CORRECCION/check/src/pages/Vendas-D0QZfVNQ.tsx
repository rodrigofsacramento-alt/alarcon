/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Vendas-D0QZfVNQ.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { u as T, r as n } from "@/components/vendor-Jm1Lk";
import { B as b, A as z, d as O, c as B, t as N } from "@/components/index-C9";
import { u as F, b as P } from "@/hooks/useSales";
import { S as U, M as q, H as G } from "@/components/Header";
import { C as H } from "@/components/confirm-dialog";
import { k as c, D as v, l as h, aD as $, S as Y, O as J, L as w, g as K, G as Q, m as W, am as X } from "@/components/ui";
import "@/lib/supabase";
import "@/components/logo-estate";
import "@/components/index";
import "@/components/index";
import "@/components/ui/dialog";
function me() {
  const y = T(),
    [p, C] = n.useState(!1),
    [S, g] = n.useState(!1),
    [l, k] = n.useState(""),
    [m, A] = n.useState("all"),
    [a, x] = n.useState(null),
    {
      data: f = [],
      isLoading: L
    } = F(),
    d = P(),
    _ = async () => {
      if (a) try {
        await d.mutateAsync({
          id: a.id,
          property_id: a.propertyId
        }), N({
          title: "Registro de Venda Excluído!",
          description: `A venda de ${a.buyerName} foi cancelada e o imóvel voltou a ficar disponível.`
        }), x(null);
      } catch (s) {
        N({
          title: "Erro ao cancelar venda",
          description: (s == null ? void 0 : s.message) || "Tente novamente.",
          variant: "destructive"
        });
      }
    },
    D = s => s.split(" ").map(t => t[0]).join("").slice(0, 2).toUpperCase(),
    u = s => "Gs " + s.toLocaleString("es-PY", {
      maximumFractionDigits: 0
    }),
    E = s => s ? new Date(s).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) : "-",
    M = Array.from(new Map(f.filter(s => s.agent).map(s => [s.agent.id, s.agent])).values()),
    r = f.filter(s => {
      var o, j;
      const t = s.buyer_name.toLowerCase().includes(l.toLowerCase()) || ((o = s.property) == null ? void 0 : o.code.toLowerCase().includes(l.toLowerCase())) || ((j = s.property) == null ? void 0 : j.title.toLowerCase().includes(l.toLowerCase())),
        i = m === "all" || s.agent_id === m;
      return t && i;
    }),
    R = r.reduce((s, t) => s + Number(t.sale_value), 0),
    V = r.length,
    I = r.reduce((s, t) => s + Number(t.sale_value) * .05, 0);
  return <div className="min-h-screen bg-background"><U activeModule="vendas" onModuleChange={() => {}} collapsed={p} onCollapsedChange={C} /><q activeModule="vendas" onModuleChange={() => {}} open={S} onOpenChange={g} /><div className={B("transition-all duration-300", p ? "lg:pl-[72px]" : "lg:pl-64")}><G title="Contratos e Vendas" subtitle="Acompanhe os contratos assinados e imóveis vendidos" actionButton=<b variant="outline" className="gap-2 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/5 text-foreground font-medium transition-all" onClick={() => y("/financeiro/comissoes")}><c className="h-4 w-4 text-amber-500" /><span>Ver Comissões</span></b> onMobileMenuClick={() => g(!0)} /><main className="p-4 lg:p-6 space-y-6"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><div className="bg-card rounded-xl p-5 shadow-sm border border-border/45 flex items-center justify-between relative overflow-hidden"><div className="space-y-1 z-10"><p className="text-sm font-medium text-muted-foreground">Volume de Vendas</p><p className="text-3xl font-bold text-foreground">{u(R)}</p><div className="flex items-center gap-1 text-xs text-success font-medium"><c className="h-3 w-3" /><span>Resultado consolidado</span></div></div><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary z-10 shrink-0"><v className="h-6 w-6" /></div><div className="absolute -right-4 -bottom-4 opacity-5 text-foreground"><v className="h-24 w-24" /></div></div><div className="bg-card rounded-xl p-5 shadow-sm border border-border/45 flex items-center justify-between relative overflow-hidden"><div className="space-y-1 z-10"><p className="text-sm font-medium text-muted-foreground">Imóveis Vendidos</p><p className="text-3xl font-bold text-foreground">{V}</p><div className="flex items-center gap-1 text-xs text-muted-foreground font-medium"><h className="h-3 w-3 text-accent" /><span>Contratos fechados</span></div></div><div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent z-10 shrink-0"><h className="h-6 w-6" /></div><div className="absolute -right-4 -bottom-4 opacity-5 text-foreground"><h className="h-24 w-24" /></div></div><div className="bg-card rounded-xl p-5 shadow-sm border border-border/45 flex items-center justify-between relative overflow-hidden"><div className="space-y-1 z-10"><p className="text-sm font-medium text-muted-foreground">Comissão Estimada (5%)</p><p className="text-3xl font-bold text-foreground">{u(I)}</p><div className="flex items-center gap-1 text-xs text-success font-medium"><$ className="h-3 w-3" /><span>Comissão global gerada</span></div></div><div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center text-success z-10 shrink-0"><c className="h-6 w-6" /></div><div className="absolute -right-4 -bottom-4 opacity-5 text-foreground"><c className="h-24 w-24" /></div></div></div><div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-4 rounded-xl shadow-sm border border-border/40"><div className="relative flex-1 max-w-md"><Y className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Buscar por comprador, código ou título..." value={l} onChange={s => k(s.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div><div className="flex items-center gap-2 shrink-0"><J className="h-4 w-4 text-muted-foreground shrink-0" /><select value={m} onChange={s => A(s.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"><option value="all">Todos os Corretores</option>{M.map(s => <option value={s.id}>{s.full_name}</option>)}</select></div></div><div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">{L ? <div className="flex items-center justify-center py-20"><w className="h-8 w-8 animate-spin text-accent" /></div> : r.length === 0 ? <div className="text-center py-20 px-4"><K className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" /><h3 className="font-semibold text-foreground text-lg">Nenhuma venda encontrada</h3><p className="text-muted-foreground max-w-sm mx-auto mt-1">Os registros de vendas aparecem aqui quando os contratos jurídicos correspondentes são assinados e concluídos.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left border-collapse text-sm"><thead><tr className="border-b border-border/50 bg-muted/40 text-muted-foreground font-medium select-none"><th className="p-4 pl-6">Imóvel de Referência</th><th className="p-4">Cliente Comprador</th><th className="p-4">Corretor Responsável</th><th className="p-4">Valor da Venda</th><th className="p-4">Data do Contrato</th><th className="p-4 pr-6 text-right">Ações</th></tr></thead><tbody className="divide-y divide-border/30">{r.map(s => {
                  var t, i, o;
                  return <tr className="hover:bg-muted/10 transition-colors group"><td className="p-4 pl-6"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 font-bold text-xs select-none">{((t = s.property) == null ? void 0 : t.code.slice(0, 3)) || "REF"}</div><div><p className="font-semibold text-foreground truncate max-w-[200px]">{((i = s.property) == null ? void 0 : i.title) || "Imóvel sem título"}</p><span className="font-mono text-xs text-muted-foreground">{((o = s.property) == null ? void 0 : o.code) || "REF-000"}</span></div></div></td><td className="p-4"><div className="flex items-center gap-2"><Q className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium text-foreground">{s.buyer_name}</span></div></td><td className="p-4">{s.agent ? <div className="flex items-center gap-2.5"><z className="h-7 w-7 shrink-0"><O className="bg-primary text-primary-foreground text-[10px]">{D(s.agent.full_name)}</O></z><span className="font-medium text-foreground">{s.agent.full_name}</span></div> : <span className="text-muted-foreground italic text-xs">Sem corretor</span>}</td><td className="p-4"><span className="font-bold text-foreground">{u(Number(s.sale_value))}</span></td><td className="p-4 text-muted-foreground"><div className="flex items-center gap-1.5"><W className="h-3.5 w-3.5 text-muted-foreground" /><span>{E(s.contract_signed_at)}</span></div></td><td className="p-4 pr-6 text-right"><b variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all" title="Estornar/Excluir Venda" disabled={d.isPending} onClick={() => x({
                        id: s.id,
                        propertyId: s.property_id,
                        buyerName: s.buyer_name
                      })}>{d.isPending ? <w className="h-3.5 w-3.5 animate-spin" /> : <X className="h-4 w-4" />}</b></td></tr>;
                })}</tbody></table></div>}</div></main></div><H open={!!a} onOpenChange={s => !s && x(null)} title="Estornar/Excluir Venda" description={a ? `Deseja realmente excluir o registro de venda de ${a.buyerName}? O imóvel correspondente voltará a ficar Disponível.` : ""} confirmLabel="Excluir" cancelLabel="Cancelar" variant="destructive" isLoading={d.isPending} onConfirm={_} /></div>;
}
export { me as default };