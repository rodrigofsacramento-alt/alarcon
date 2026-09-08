/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminFinancial-5rOYwX9U.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r as n } from "@/components/vendor-Jm1Lk";
import { y as We, b as Ye, a as ea, z as aa, A as sa, B as ta, C as la, D as ra, E as he, F as be, S as na } from "@/components/SuperAdminLayout";
import { c as y, U as ia, E as ca, P as H, x as se, y as oa, D as da, b as ma, B as D, I as _ } from "@/components/index-C9";
import { t as te } from "@/components/error-messages";
import { C as xa } from "@/components/confirm-dialog";
import { L as v } from "@/components/label";
import { S as I, a as F, b as P, c as V, d as f } from "@/components/ui/select";
import { D as pe, a as je, b as Ne, c as ge, d as fe, e as ve } from "@/components/ui/dialog";
import { R as ua, I as ha, f as Ee, D as ba, a as pa, b as ja, d as ye } from "@/components/ui/dropdown-menu";
import { C as R, a as q, b as G, d as S } from "@/components/ui/card";
import { u as Na } from "@/components/index";
import { B as U } from "@/components/ui/badge";
import { b5 as E, bn as we, bo as Ce, bp as ga, aI as le, bq as re, br as ne, k as fa, T as va, D as Te, aP as ya, m as wa, ai as Ca, L as z, l as Ta, b1 as Da, Z as Ea, am as _a, _ as Ra } from "@/components/ui";
import { p as Sa } from "@/components/pt-BR";
import "@/components/logo-estate";
import "@/lib/supabase";
import "@/components/index";
const ce = n.forwardRef(({
  className: s,
  ...t
}, r) => <div className="relative w-full overflow-auto">{<table ref={r} className={y("w-full caption-bottom text-sm", s)} />}</div>);
ce.displayName = "Table";
const oe = n.forwardRef(({
  className: s,
  ...t
}, r) => <thead ref={r} className={y("[&_tr]:border-b", s)} />);
oe.displayName = "TableHeader";
const de = n.forwardRef(({
  className: s,
  ...t
}, r) => <tbody ref={r} className={y("[&_tr:last-child]:border-0", s)} />);
de.displayName = "TableBody";
const Ma = n.forwardRef(({
  className: s,
  ...t
}, r) => <tfoot ref={r} className={y("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", s)} />);
Ma.displayName = "TableFooter";
const k = n.forwardRef(({
  className: s,
  ...t
}, r) => <tr ref={r} className={y("border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50", s)} />);
k.displayName = "TableRow";
const b = n.forwardRef(({
  className: s,
  ...t
}, r) => <th ref={r} className={y("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", s)} />);
b.displayName = "TableHead";
const p = n.forwardRef(({
  className: s,
  ...t
}, r) => <td ref={r} className={y("p-4 align-middle [&:has([role=checkbox])]:pr-0", s)} />);
p.displayName = "TableCell";
const Aa = n.forwardRef(({
  className: s,
  ...t
}, r) => <caption ref={r} className={y("mt-4 text-sm text-muted-foreground", s)} />);
Aa.displayName = "TableCaption";
var K = "Tabs",
  [Ia] = oa(K, [Ee]),
  _e = Ee(),
  [Fa, me] = Ia(K),
  Re = n.forwardRef((s, t) => {
    const {
        __scopeTabs: r,
        value: d,
        onValueChange: c,
        defaultValue: u,
        orientation: o = "horizontal",
        dir: l,
        activationMode: m = "automatic",
        ...j
      } = s,
      g = ia(l),
      [x, w] = ca({
        prop: d,
        onChange: c,
        defaultProp: u ?? "",
        caller: K
      });
    return <Fa scope={r} baseId={Na()} value={x} onValueChange={w} orientation={o} dir={g} activationMode={m}>{<H.div dir={g} data-orientation={o} ref={t} />}</Fa>;
  });
Re.displayName = K;
var Se = "TabsList",
  Me = n.forwardRef((s, t) => {
    const {
        __scopeTabs: r,
        loop: d = !0,
        ...c
      } = s,
      u = me(Se, r),
      o = _e(r);
    return <ua asChild={!0} orientation={u.orientation} dir={u.dir} loop={d}>{<H.div role="tablist" aria-orientation={u.orientation} ref={t} />}</ua>;
  });
Me.displayName = Se;
var Ae = "TabsTrigger",
  Ie = n.forwardRef((s, t) => {
    const {
        __scopeTabs: r,
        value: d,
        disabled: c = !1,
        ...u
      } = s,
      o = me(Ae, r),
      l = _e(r),
      m = Ve(o.baseId, d),
      j = Le(o.baseId, d),
      g = d === o.value;
    return <ha asChild={!0} focusable={!c} active={g}>{<H.button type="button" role="tab" aria-selected={g} aria-controls={j} data-state={g ? "active" : "inactive"} data-disabled={c ? "" : void 0} disabled={c} id={m} ref={t} onMouseDown={se(s.onMouseDown, x => {
        !c && x.button === 0 && x.ctrlKey === !1 ? o.onValueChange(d) : x.preventDefault();
      })} onKeyDown={se(s.onKeyDown, x => {
        [" ", "Enter"].includes(x.key) && o.onValueChange(d);
      })} onFocus={se(s.onFocus, () => {
        const x = o.activationMode !== "manual";
        !g && !c && x && o.onValueChange(d);
      })} />}</ha>;
  });
Ie.displayName = Ae;
var Fe = "TabsContent",
  Pe = n.forwardRef((s, t) => {
    const {
        __scopeTabs: r,
        value: d,
        forceMount: c,
        children: u,
        ...o
      } = s,
      l = me(Fe, r),
      m = Ve(l.baseId, d),
      j = Le(l.baseId, d),
      g = d === l.value,
      x = n.useRef(g);
    return n.useEffect(() => {
      const w = requestAnimationFrame(() => x.current = !1);
      return () => cancelAnimationFrame(w);
    }, []), <da present={c || g}>{({
        present: w
      }) => <H.div data-state={g ? "active" : "inactive"} data-orientation={l.orientation} role="tabpanel" aria-labelledby={m} hidden={!w} id={j} tabIndex={0} ref={t} style={{
        ...s.style,
        animationDuration: x.current ? "0s" : void 0
      }}>{w && u}</H.div>}</da>;
  });
Pe.displayName = Fe;
function Ve(s, t) {
  return `${s}-trigger-${t}`;
}
function Le(s, t) {
  return `${s}-content-${t}`;
}
var Pa = Re,
  ke = Me,
  Oe = Ie,
  Be = Pe;
const Va = Pa,
  $e = n.forwardRef(({
    className: s,
    ...t
  }, r) => <ke ref={r} className={y("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", s)} />);
$e.displayName = ke.displayName;
const O = n.forwardRef(({
  className: s,
  ...t
}, r) => <Oe ref={r} className={y("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", s)} />);
O.displayName = Oe.displayName;
const La = n.forwardRef(({
  className: s,
  ...t
}, r) => <Be ref={r} className={y("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", s)} />);
La.displayName = Be.displayName;
function L(s) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(s / 100);
}
function De(s) {
  return E(new Date(s), "dd/MM/yyyy", {
    locale: Sa
  });
}
const ie = {
  type: "income",
  category: "",
  subcategory: "",
  description: "",
  amount: "",
  transaction_date: E(new Date(), "yyyy-MM-dd"),
  reference: "",
  tenant_id: "",
  status: "confirmed"
};
function ss() {
  const {
      toast: s
    } = ma(),
    [t, r] = n.useState("all"),
    [d, c] = n.useState(!1),
    [u, o] = n.useState(null),
    [l, m] = n.useState(ie),
    [j, g] = n.useState("current"),
    [x, w] = n.useState(null),
    [qe, B] = n.useState(!1),
    [N, M] = n.useState({
      tenant_id: "",
      value: "",
      billing_type: "BOLETO",
      due_date: E(new Date(), "yyyy-MM-dd"),
      description: ""
    }),
    X = n.useMemo(() => {
      const a = new Date();
      if (j === "current") return {
        startDate: E(Ce(a), "yyyy-MM-dd"),
        endDate: E(we(a), "yyyy-MM-dd")
      };
      if (j === "last") {
        const i = ga(a);
        return {
          startDate: E(Ce(i), "yyyy-MM-dd"),
          endDate: E(we(i), "yyyy-MM-dd")
        };
      }
      return {};
    }, [j]),
    Ge = n.useMemo(() => ({
      type: t === "all" || t === "asaas" ? void 0 : t,
      ...X
    }), [t, X]),
    {
      data: Q = [],
      isLoading: Ue
    } = We(Ge),
    {
      data: h
    } = Ye(X),
    {
      data: Z
    } = ea(),
    ze = (Z == null ? void 0 : Z.data) ?? [],
    J = aa(),
    W = sa(),
    xe = ta(),
    Y = la(),
    ee = ra(),
    He = l.type === "income" ? he : be,
    ue = a => {
      o(null), m({
        ...ie,
        type: a
      }), c(!0);
    },
    Ke = a => {
      o(a), m({
        type: a.type,
        category: a.category,
        subcategory: a.subcategory || "",
        description: a.description,
        amount: (a.amount_cents / 100).toFixed(2),
        transaction_date: a.transaction_date,
        reference: a.reference || "",
        tenant_id: a.tenant_id || "",
        status: a.status
      }), c(!0);
    },
    Xe = async () => {
      if (x) try {
        await xe.mutateAsync(x), s({
          title: "Transação excluída com sucesso"
        }), w(null);
      } catch (a) {
        s({
          title: "Erro ao excluir",
          description: te(a),
          variant: "destructive"
        });
      }
    },
    Qe = async a => {
      a.preventDefault();
      const i = Math.round(parseFloat(l.amount.replace(",", ".")) * 100);
      if (isNaN(i) || i <= 0) {
        s({
          title: "Valor inválido",
          description: "Informe um valor maior que zero.",
          variant: "destructive"
        });
        return;
      }
      const T = {
        type: l.type,
        category: l.category,
        subcategory: l.subcategory || null,
        description: l.description,
        amount_cents: i,
        transaction_date: l.transaction_date,
        reference: l.reference || null,
        tenant_id: l.tenant_id || null,
        status: l.status
      };
      try {
        u ? (await W.mutateAsync({
          id: u.id,
          ...T
        }), s({
          title: "Transação atualizada com sucesso"
        })) : (await J.mutateAsync(T), s({
          title: "Transação criada com sucesso"
        })), c(!1), m(ie);
      } catch (A) {
        s({
          title: "Erro ao salvar",
          description: te(A),
          variant: "destructive"
        });
      }
    },
    Ze = () => {
      const a = ["Data", "Tipo", "Categoria", "Descrição", "Valor", "Empresa", "Status", "Referência"],
        i = Q.map(C => {
          var $;
          return [C.transaction_date, C.type === "income" ? "Receita" : "Despesa", C.category, C.description, (C.amount_cents / 100).toFixed(2), (($ = C.tenant) == null ? void 0 : $.name) || "", C.status, C.reference || ""];
        }),
        T = [a, ...i].map(C => C.map($ => `"${$}"`).join(",")).join(`
`),
        A = new Blob([T], {
          type: "text/csv;charset=utf-8;"
        }),
        Je = URL.createObjectURL(A),
        ae = <a />;
      ae.href = Je, ae.download = `financeiro-${E(new Date(), "yyyy-MM-dd")}.csv`, ae.click();
    };
  return <na>{<div className="space-y-6">{<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">{<div>{<h1 className="text-2xl font-bold text-white">Painel Financeiro</h1>}{<p className="text-slate-400 text-sm">Controle de receitas e despesas do SaaS</p>}</div>}{<div className="flex gap-2">{<D onClick={() => B(!0)} className="bg-blue-600 hover:bg-blue-700 text-white">{<le className="h-4 w-4 mr-2" />}Cobrança Asaas</D>}{<D onClick={() => ue("income")} className="bg-emerald-600 hover:bg-emerald-700 text-white">{<re className="h-4 w-4 mr-2" />}Nova Receita</D>}{<D onClick={() => ue("expense")} className="bg-rose-600 hover:bg-rose-700 text-white">{<ne className="h-4 w-4 mr-2" />}Nova Despesa</D>}</div>}</div>}{<div className="grid gap-4 md:grid-cols-4">{<R className="bg-slate-800/50 border-slate-700">{<q className="flex flex-row items-center justify-between space-y-0 pb-2">{<G className="text-sm font-medium text-slate-300">Receitas</G>}{<fa className="h-4 w-4 text-emerald-500" />}</q>}{<S>{<div className="text-2xl font-bold text-emerald-400">{L((h == null ? void 0 : h.totalIncome) || 0)}</div>}{<p className="text-xs text-slate-500">{j === "current" ? "Este mês" : j === "last" ? "Mês passado" : "Total"}</p>}</S>}</R>}{<R className="bg-slate-800/50 border-slate-700">{<q className="flex flex-row items-center justify-between space-y-0 pb-2">{<G className="text-sm font-medium text-slate-300">Despesas</G>}{<va className="h-4 w-4 text-rose-500" />}</q>}{<S>{<div className="text-2xl font-bold text-rose-400">{L((h == null ? void 0 : h.totalExpense) || 0)}</div>}{<p className="text-xs text-slate-500">{j === "current" ? "Este mês" : j === "last" ? "Mês passado" : "Total"}</p>}</S>}</R>}{<R className="bg-slate-800/50 border-slate-700">{<q className="flex flex-row items-center justify-between space-y-0 pb-2">{<G className="text-sm font-medium text-slate-300">Resultado Líquido</G>}{<Te className="h-4 w-4 text-blue-500" />}</q>}{<S>{<div className={`text-2xl font-bold ${((h == null ? void 0 : h.netResult) || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{L((h == null ? void 0 : h.netResult) || 0)}</div>}{<p className="text-xs text-slate-500">Receitas - Despesas</p>}</S>}</R>}{<R className="bg-slate-800/50 border-slate-700">{<q className="flex flex-row items-center justify-between space-y-0 pb-2">{<G className="text-sm font-medium text-slate-300">Transações</G>}{<ya className="h-4 w-4 text-violet-500" />}</q>}{<S>{<div className="text-2xl font-bold text-white">{(h == null ? void 0 : h.transactionCount) || 0}</div>}{<p className="text-xs text-slate-500">Lançamentos confirmados</p>}</S>}</R>}</div>}{<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">{<Va value={t} onValueChange={a => r(a)}>{<$e className="bg-slate-800 border border-slate-700">{<O value="all" className="data-[state=active]:bg-slate-700">Todas</O>}{<O value="income" className="data-[state=active]:bg-emerald-600">Receitas</O>}{<O value="expense" className="data-[state=active]:bg-rose-600">Despesas</O>}{<O value="asaas" className="data-[state=active]:bg-blue-600">Asaas</O>}</$e>}</Va>}{<div className="flex gap-2">{<I value={j} onValueChange={a => g(a)}>{<F className="w-[160px] bg-slate-800 border-slate-700 text-white">{<wa className="h-4 w-4 mr-2" />}{<P />}</F>}{<V className="bg-slate-800 border-slate-700">{<f value="current">Este mês</f>}{<f value="last">Mês passado</f>}{<f value="all">Todo período</f>}</V>}</I>}{<D variant="outline" onClick={Ze} className="border-slate-700 text-slate-300 hover:bg-slate-800">{<Ca className="h-4 w-4 mr-2" />}Exportar</D>}</div>}</div>}{<R className="bg-slate-800/50 border-slate-700">{<S className="p-0">{Ue ? <div className="flex items-center justify-center py-12">{<z className="h-6 w-6 animate-spin text-slate-400" />}</div> : Q.length === 0 ? <div className="text-center py-12 text-slate-400">{<Te className="h-12 w-12 mx-auto mb-4 opacity-50" />}{<p>Nenhuma transação encontrada</p>}{<p className="text-sm">Clique em "Nova Receita" ou "Nova Despesa" para começar</p>}</div> : <ce>{<oe>{<k className="border-slate-700 hover:bg-transparent">{<b className="text-slate-400">Data</b>}{<b className="text-slate-400">Tipo</b>}{<b className="text-slate-400">Categoria</b>}{<b className="text-slate-400">Descrição</b>}{<b className="text-slate-400">Empresa</b>}{<b className="text-slate-400 text-right">Valor</b>}{<b className="text-slate-400">Status</b>}{<b className="text-slate-400 w-[50px]" />}</k>}</oe>}{<de>{Q.map(a => {
                var i, T;
                return <k className="border-slate-700 hover:bg-slate-700/50">{<p className="text-slate-300">{De(a.transaction_date)}</p>}{<p>{a.type === "income" ? <U className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">{<re className="h-3 w-3 mr-1" />}Receita</U> : <U className="bg-rose-600/20 text-rose-400 border-rose-600/30">{<ne className="h-3 w-3 mr-1" />}Despesa</U>}</p>}{<p className="text-slate-300">{((i = [...he, ...be].find(A => A.value === a.category)) == null ? void 0 : i.label) || a.category}</p>}{<p className="text-slate-300 max-w-[200px] truncate">{a.description}</p>}{<p className="text-slate-400">{(T = a.tenant) != null && T.name ? <span className="flex items-center gap-1">{<Ta className="h-3 w-3" />}{a.tenant.name}</span> : <span className="text-slate-500">—</span>}</p>}{<p className={`text-right font-medium ${a.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>{a.type === "income" ? "+" : "-"}{L(a.amount_cents)}</p>}{<p>{<U variant="outline" className={a.status === "confirmed" ? "border-emerald-600/50 text-emerald-400" : a.status === "pending" ? "border-amber-600/50 text-amber-400" : "border-slate-600 text-slate-400"}>{a.status === "confirmed" ? "Confirmado" : a.status === "pending" ? "Pendente" : "Cancelado"}</U>}</p>}{<p>{<ba>{<pa asChild={!0}>{<D variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">{<Da className="h-4 w-4" />}</D>}</pa>}{<ja align="end" className="bg-slate-800 border-slate-700">{<ye onClick={() => Ke(a)} className="text-slate-300 focus:bg-slate-700">{<Ea className="h-4 w-4 mr-2" />}Editar</ye>}{<ye onClick={() => w(a.id)} className="text-rose-400 focus:bg-slate-700 focus:text-rose-400">{<_a className="h-4 w-4 mr-2" />}Excluir</ye>}</ja>}</ba>}</p>}</k>;
              })}</de>}</ce>}</S>}</R>}{t === "asaas" && <R className="bg-slate-800/50 border-slate-700">{<S className="p-0">{Y.isLoading ? <div className="flex items-center justify-center py-12">{<z className="h-6 w-6 animate-spin text-slate-400" />}</div> : (Y.data ?? []).length === 0 ? <div className="text-center py-12 text-slate-400">{<le className="h-12 w-12 mx-auto mb-4 opacity-50" />}{<p>Nenhuma cobrança Asaas encontrada</p>}{<p className="text-sm">Clique em "Cobrança Asaas" para gerar uma nova cobrança</p>}</div> : <ce>{<oe>{<k className="border-slate-700 hover:bg-transparent">{<b className="text-slate-400">Empresa</b>}{<b className="text-slate-400">Tipo</b>}{<b className="text-slate-400">Vencimento</b>}{<b className="text-slate-400 text-right">Valor</b>}{<b className="text-slate-400">Status</b>}{<b className="text-slate-400">Link</b>}</k>}</oe>}{<de>{(Y.data ?? []).map(a => {
                var i;
                return <k className="border-slate-700 hover:bg-slate-700/50">{<p className="text-slate-300">{((i = a.tenants) == null ? void 0 : i.name) || "—"}</p>}{<p className="text-slate-300">{a.billing_type}</p>}{<p className="text-slate-300">{a.due_date ? De(a.due_date) : "—"}</p>}{<p className="text-right font-medium text-white">{L(a.value_cents)}</p>}{<p>{<U variant="outline" className={a.status === "RECEIVED" ? "border-emerald-600/50 text-emerald-400" : a.status === "PENDING" ? "border-amber-600/50 text-amber-400" : a.status === "OVERDUE" ? "border-rose-600/50 text-rose-400" : "border-slate-600 text-slate-400"}>{a.status === "RECEIVED" ? "Recebido" : a.status === "PENDING" ? "Pendente" : a.status === "OVERDUE" ? "Vencido" : a.status}</U>}</p>}{<p>{a.invoice_url && <a href={a.invoice_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-400 hover:text-blue-300">{<Ra className="h-4 w-4 mr-1" />}Fatura</a>}</p>}</k>;
              })}</de>}</ce>}</S>}</R>}{<pe open={d} onOpenChange={c}>{<je className="bg-slate-900 border-slate-700 text-white max-w-lg">{<Ne>{<ge className="flex items-center gap-2">{l.type === "income" ? <e.Fragment>{<re className="h-5 w-5 text-emerald-500" />}{u ? "Editar Receita" : "Nova Receita"}</e.Fragment> : <e.Fragment>{<ne className="h-5 w-5 text-rose-500" />}{u ? "Editar Despesa" : "Nova Despesa"}</e.Fragment>}</ge>}{<fe className="text-slate-400">Preencha os dados da transação financeira</fe>}</Ne>}{<form onSubmit={Qe} className="space-y-4">{<div className="grid grid-cols-2 gap-4">{<div className="space-y-2">{<v className="text-slate-300">Categoria *</v>}{<I value={l.category || void 0} onValueChange={a => m({
                  ...l,
                  category: a
                })}>{<F className="bg-slate-800 border-slate-700 text-white">{<P placeholder="Selecione" className="text-white" />}</F>}{<V className="bg-slate-800 border-slate-700">{He.map(a => <f value={a.value} className="text-white focus:bg-slate-700 focus:text-white">{a.label}</f>)}</V>}</I>}</div>}{<div className="space-y-2">{<v className="text-slate-300">Valor (R$) *</v>}{<_ type="text" placeholder="0,00" value={l.amount} onChange={a => m({
                  ...l,
                  amount: a.target.value
                })} className="bg-slate-800 border-slate-700" required={!0} />}</div>}</div>}{<div className="space-y-2">{<v className="text-slate-300">Descrição *</v>}{<_ placeholder="Descreva a transação" value={l.description} onChange={a => m({
                ...l,
                description: a.target.value
              })} className="bg-slate-800 border-slate-700" required={!0} />}</div>}{<div className="grid grid-cols-2 gap-4">{<div className="space-y-2">{<v className="text-slate-300">Data *</v>}{<_ type="date" value={l.transaction_date} onChange={a => m({
                  ...l,
                  transaction_date: a.target.value
                })} className="bg-slate-800 border-slate-700" required={!0} />}</div>}{<div className="space-y-2">{<v className="text-slate-300">Status</v>}{<I value={l.status} onValueChange={a => m({
                  ...l,
                  status: a
                })}>{<F className="bg-slate-800 border-slate-700 text-white">{<P className="text-white" />}</F>}{<V className="bg-slate-800 border-slate-700">{<f value="confirmed" className="text-white focus:bg-slate-700 focus:text-white">Confirmado</f>}{<f value="pending" className="text-white focus:bg-slate-700 focus:text-white">Pendente</f>}{<f value="cancelled" className="text-white focus:bg-slate-700 focus:text-white">Cancelado</f>}</V>}</I>}</div>}</div>}{l.type === "income" && <div className="space-y-2">{<v className="text-slate-300">Empresa relacionada</v>}{<I value={l.tenant_id || void 0} onValueChange={a => m({
                ...l,
                tenant_id: a
              })}>{<F className="bg-slate-800 border-slate-700 text-white">{<P placeholder="Nenhuma (opcional)" className="text-white" />}</F>}{<V className="bg-slate-800 border-slate-700">{ze.map(a => <f value={a.id} className="text-white focus:bg-slate-700 focus:text-white">{a.name}</f>)}</V>}</I>}</div>}{<div className="space-y-2">{<v className="text-slate-300">Referência</v>}{<_ placeholder="Nº nota fiscal, ID do pagamento, etc." value={l.reference} onChange={a => m({
                ...l,
                reference: a.target.value
              })} className="bg-slate-800 border-slate-700" />}</div>}{<ve className="pt-4">{<D type="button" variant="outline" onClick={() => c(!1)} className="border-slate-700 text-slate-300">Cancelar</D>}{<D type="submit" disabled={J.isPending || W.isPending} className={l.type === "income" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}>{(J.isPending || W.isPending) && <z className="h-4 w-4 mr-2 animate-spin" />}{u ? "Salvar Alterações" : "Criar Transação"}</D>}</ve>}</form>}</je>}</pe>}{<pe open={qe} onOpenChange={B}>{<je className="bg-slate-900 border-slate-700 text-white max-w-lg">{<Ne>{<ge className="flex items-center gap-2">{<le className="h-5 w-5 text-blue-500" />}Gerar Cobrança Asaas</ge>}{<fe className="text-slate-400">Crie uma cobrança no Asaas para o tenant selecionado</fe>}</Ne>}{<form onSubmit={async a => {
            a.preventDefault();
            const i = parseFloat(N.value.replace(",", "."));
            if (isNaN(i) || i <= 0) {
              s({
                title: "Valor inválido",
                description: "Informe um valor maior que zero.",
                variant: "destructive"
              });
              return;
            }
            if (!N.tenant_id) {
              s({
                title: "Empresa obrigatória",
                description: "Selecione uma empresa.",
                variant: "destructive"
              });
              return;
            }
            try {
              await ee.mutateAsync({
                tenant_id: N.tenant_id,
                value: i,
                billing_type: N.billing_type,
                due_date: N.due_date,
                description: N.description || void 0
              }), s({
                title: "Cobrança gerada com sucesso"
              }), B(!1), M({
                tenant_id: "",
                value: "",
                billing_type: "BOLETO",
                due_date: E(new Date(), "yyyy-MM-dd"),
                description: ""
              });
            } catch (T) {
              s({
                title: "Erro ao gerar cobrança",
                description: te(T),
                variant: "destructive"
              });
            }
          }} className="space-y-4">{<div className="space-y-2">{<v className="text-slate-300">Valor (R$) * {<span className="text-xs text-slate-500">(mín. R$ 5,00)</span>}</v>}{<_ type="text" placeholder="0,00" value={N.value} onChange={a => M({
                ...N,
                value: a.target.value
              })} className="bg-slate-800 border-slate-700" required={!0} />}</div>}{<div className="space-y-2">{<v className="text-slate-300">Tipo *</v>}{<I value={N.billing_type} onValueChange={a => M({
                ...N,
                billing_type: a
              })}>{<F className="bg-slate-800 border-slate-700 text-white">{<P className="text-white" />}</F>}{<V className="bg-slate-800 border-slate-700">{<f value="BOLETO" className="text-white focus:bg-slate-700 focus:text-white">Boleto</f>}{<f value="PIX" className="text-white focus:bg-slate-700 focus:text-white">PIX</f>}{<f value="CREDIT_CARD" className="text-white focus:bg-slate-700 focus:text-white">Cartão de Crédito</f>}{<f value="UNDEFINED" className="text-white focus:bg-slate-700 focus:text-white">Indefinido</f>}</V>}</I>}</div>}{<div className="space-y-2">{<v className="text-slate-300">Vencimento *</v>}{<_ type="date" value={N.due_date} onChange={a => M({
                ...N,
                due_date: a.target.value
              })} className="bg-slate-800 border-slate-700" required={!0} />}</div>}{<div className="space-y-2">{<v className="text-slate-300">Descrição</v>}{<_ placeholder="Descrição da cobrança" value={N.description} onChange={a => M({
                ...N,
                description: a.target.value
              })} className="bg-slate-800 border-slate-700" />}</div>}{<ve className="pt-4">{<D type="button" variant="outline" onClick={() => B(!1)} className="border-slate-700 text-slate-300">Cancelar</D>}{<D type="submit" disabled={ee.isPending} className="bg-blue-600 hover:bg-blue-700">{ee.isPending && <z className="h-4 w-4 mr-2 animate-spin" />}Gerar Cobrança</D>}</ve>}</form>}</je>}</pe>}</div>}{<xa open={!!x} onOpenChange={a => !a && w(null)} title="Excluir transação" description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita." confirmLabel="Excluir" cancelLabel="Cancelar" variant="destructive" isLoading={xe.isPending} onConfirm={Xe} />}</na>;
}
export { ss as default };