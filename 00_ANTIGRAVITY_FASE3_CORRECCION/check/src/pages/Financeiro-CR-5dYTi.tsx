/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Financeiro-CR-5dYTi.js | AST | sanitizado | Fase 3 ==*/
import { j as e, u as ae, b as re, a as ne } from "@/components/query";
import { r as F, u as ie } from "@/components/vendor-Jm1Lk";
import { I as Y, B as v, s as B, u as oe, t as g, c as C } from "@/components/index-C9";
import { L as S } from "@/components/label";
import { T as le } from "@/components/ui/textarea";
import { D as ce, a as de, b as me, c as xe } from "@/components/ui/dialog";
import { S as _, a as q, b as V, c as K, d as h } from "@/components/ui/select";
import { D as I, J as ue, F as he, m as pe, U as z, z as ge, ai as fe, aH as je, L as ve, aD as J, aE as Q, v as Ne, aI as be, aJ as ye, aK as we } from "@/components/ui";
import { e as Ce, a as Se } from "@/components/export-utils";
import { S as Fe, M as De, H as Ee } from "@/components/Header";
import { B as G } from "@/components/ui/badge";
import { R as H, C as $e, X as ke, Y as Me, T as U, B as X, a as Te } from "@/components/generateCategoricalChart";
import { B as Re } from "@/components/BarChart";
import { P as Ae, a as Be } from "@/components/PieChart";
import "@/lib/supabase";
import "@/components/index";
import "@/components/index";
import "@/components/xlsx";
import "@/components/logo-estate";
const W = {
  description: "",
  type: "income",
  category: "venda",
  value: "",
  date: new Date().toISOString().split("T")[0],
  status: "completed",
  notes: ""
};
function Ie({
  open: r,
  onOpenChange: n,
  onConfirm: c
}) {
  const [i, x] = F.useState(W);
  F.useEffect(() => {
    r || x(W);
  }, [r]);
  const u = (l, p) => {
      x(t => ({
        ...t,
        [l]: p
      }));
    },
    N = () => {
      c(i), n(!1);
    },
    b = i.description.trim() && i.value.trim();
  return <ce open={r} onOpenChange={n}><de className="max-w-lg max-h-[90vh] overflow-y-auto p-0"><div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5"><me><xe className="text-xl font-semibold flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><I className="h-5 w-5 text-accent" /></div><div><span>Nova Transação</span><p className="text-sm font-normal text-muted-foreground mt-0.5">Registre uma entrada ou saída financeira</p></div></xe></me></div><div className="px-6 py-5 space-y-6"><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><ue className="h-4 w-4 text-accent" /><span>Tipo de Transação</span></div><div className="bg-muted/30 rounded-xl p-4 border border-border/50"><div className="flex gap-3"><label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 p-3 transition-all ${i.type === "income" ? "border-success bg-success/10 text-success" : "border-border hover:border-success/50"}`}><input type="radio" name="type" checked={i.type === "income"} onChange={() => u("type", "income")} className="sr-only" /><I className="h-4 w-4" /><span className="text-sm font-medium">Entrada</span></label><label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 p-3 transition-all ${i.type === "expense" ? "border-destructive bg-destructive/10 text-destructive" : "border-border hover:border-destructive/50"}`}><input type="radio" name="type" checked={i.type === "expense"} onChange={() => u("type", "expense")} className="sr-only" /><I className="h-4 w-4" /><span className="text-sm font-medium">Saída</span></label></div></div></div><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><he className="h-4 w-4 text-accent" /><span>Dados da Transação</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="space-y-2"><S>Descrição *</S><Y placeholder="Ex: Venda Apto. Jardins" value={i.description} onChange={l => u("description", l.target.value)} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><S>Valor (R$) *</S><Y placeholder="Ex: 18500" value={i.value} onChange={l => u("value", l.target.value)} /></div><div className="space-y-2"><S>Categoria</S><_ value={i.category} onValueChange={l => u("category", l)}><q><V /></q><K><h value="venda">Venda</h><h value="aluguel">Aluguel</h><h value="comissao">Comissão</h><h value="consultoria">Consultoria</h><h value="despesa_operacional">Despesa Operacional</h><h value="marketing">Marketing</h><h value="imposto">Imposto</h><h value="outro">Outro</h></K></_></div></div></div></div><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><pe className="h-4 w-4 text-accent" /><span>Data e Status</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><S>Data</S><input type="date" value={i.date} onChange={l => u("date", l.target.value)} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm" /></div><div className="space-y-2"><S>Status</S><_ value={i.status} onValueChange={l => u("status", l)}><q><V /></q><K><h value="completed">Concluída</h><h value="processing">Em Processamento</h><h value="pending">Pendente</h></K></_></div></div><div className="space-y-2"><S>Observações</S><le placeholder="Notas adicionais..." value={i.notes} onChange={l => u("notes", l.target.value)} rows={3} /></div></div></div></div><div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3"><v variant="outline" onClick={() => n(!1)}>Cancelar</v><v variant="cta" onClick={N} disabled={!b}>Registrar Transação</v></div></de></ce>;
}
function Oe(r = "month") {
  return ne({
    queryKey: ["financial_stats", r],
    queryFn: async () => {
      const n = new Date();
      let c, i, x;
      if (r === "month") {
        c = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`;
        const a = new Date(n.getFullYear(), n.getMonth() - 1, 1);
        i = `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-01`, x = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`;
      } else if (r === "quarter") {
        const a = new Date(n.getFullYear(), Math.floor(n.getMonth() / 3) * 3, 1);
        c = `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-01`;
        const o = new Date(a.getFullYear(), a.getMonth() - 3, 1);
        i = `${o.getFullYear()}-${String(o.getMonth() + 1).padStart(2, "0")}-01`, x = c;
      } else c = `${n.getFullYear()}-01-01`, i = `${n.getFullYear() - 1}-01-01`, x = c;
      const {
        data: u,
        error: N
      } = await B.from("financial_transactions").select("*, agent:profiles!financial_transactions_agent_id_fkey(id, full_name, role)").gte("date", c).order("date", {
        ascending: !1
      });
      if (N) throw N;
      const {
        data: b,
        error: l
      } = await B.from("financial_transactions").select("type, amount").gte("date", i).lt("date", x);
      if (l) throw l;
      const p = new Date(n.getFullYear(), n.getMonth() - 11, 1),
        t = `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, "0")}-01`,
        {
          data: O,
          error: D
        } = await B.from("financial_transactions").select("type, amount, date").gte("date", t).order("date", {
          ascending: !0
        });
      if (D) throw D;
      const T = u || [],
        L = b || [];
      let E = 0,
        R = 0,
        f = 0,
        y = 0;
      const j = {},
        w = {};
      T.forEach(a => {
        const o = Number(a.amount) || 0;
        a.type === "income" ? (E += o, j[a.category] = (j[a.category] || 0) + o) : (R += o, w[a.category] = (w[a.category] || 0) + o, a.category === "commission" && (f += o), a.category === "operational" && (y += o));
      });
      let $ = 0,
        s = 0;
      L.forEach(a => {
        const o = Number(a.amount) || 0;
        a.type === "income" ? $ += o : s += o;
      });
      const d = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        m = {};
      for (let a = 0; a < 12; a++) {
        const o = new Date(p.getFullYear(), p.getMonth() + a, 1),
          k = `${o.getFullYear()}-${String(o.getMonth() + 1).padStart(2, "0")}`;
        m[k] = {
          income: 0,
          expense: 0
        };
      }
      (O || []).forEach(a => {
        const o = a.date.substring(0, 7);
        if (m[o]) {
          const k = Number(a.amount) || 0;
          a.type === "income" ? m[o].income += k : m[o].expense += k;
        }
      });
      const se = Object.entries(m).map(([a, o]) => {
        const [k, te] = a.split("-");
        return {
          month: d[parseInt(te) - 1],
          ...o
        };
      });
      return {
        totalIncome: E,
        totalExpense: R,
        totalCommissions: f,
        totalOperational: y,
        incomeByCategory: j,
        expenseByCategory: w,
        monthlyData: se,
        recentTransactions: T.slice(0, 10),
        previousPeriodIncome: $,
        previousPeriodExpense: s
      };
    }
  });
}
function Le() {
  const r = ae();
  return re({
    mutationFn: async n => {
      const {
        data: c,
        error: i
      } = await B.from("financial_transactions").insert(n).select().single();
      if (i) throw i;
      return c;
    },
    onSuccess: () => {
      r.invalidateQueries({
        queryKey: ["financial_transactions"]
      }), r.invalidateQueries({
        queryKey: ["financial_stats"]
      }), r.invalidateQueries({
        queryKey: ["dashboard-stats"]
      });
    }
  });
}
const P = {
    sale: "Vendas",
    rental: "Locações",
    consulting: "Consultoria",
    commission: "Comissões",
    operational: "Operacional",
    marketing: "Marketing",
    tax: "Impostos",
    other: "Outros"
  },
  Z = ["#d96909", "#223152", "#9ca3af", "#16a34a", "#dc2626"],
  Pe = [{
    label: "Este Mês",
    value: "month"
  }, {
    label: "Trimestre",
    value: "quarter"
  }, {
    label: "Ano",
    value: "year"
  }];
function A(r) {
  return r.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  });
}
function M(r) {
  return r >= 1e6 ? `R$ ${(r / 1e6).toFixed(1)}M` : r >= 1e3 ? `R$ ${(r / 1e3).toFixed(0)}k` : `R$ ${r}`;
}
function ee(r, n) {
  if (n === 0) return {
    value: "N/A",
    positive: !0
  };
  const c = (r - n) / n * 100;
  return {
    value: `${c >= 0 ? "+" : ""}${c.toFixed(1)}%`,
    positive: c >= 0
  };
}
function ns() {
  var w, $;
  const [r, n] = F.useState(!1),
    [c, i] = F.useState(!1),
    [x, u] = F.useState("month"),
    [N, b] = F.useState(!1),
    {
      user: l
    } = oe(),
    p = Le(),
    {
      data: t,
      isLoading: O
    } = Oe(x),
    D = ie(),
    T = s => {
      const d = parseFloat(s.value) || 0;
      p.mutate({
        type: s.type,
        category: s.category,
        description: s.description || null,
        amount: d,
        date: s.date,
        agent_id: (l == null ? void 0 : l.id) || null,
        reference_type: "other"
      }, {
        onSuccess: () => {
          const m = d.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          });
          g({
            title: "Transação Registrada",
            description: `${s.type === "income" ? "Entrada" : "Saída"}: ${s.description} — ${m}`
          });
        },
        onError: m => {
          g({
            title: "Erro ao registrar transação",
            description: (m == null ? void 0 : m.message) || "Tente novamente.",
            variant: "destructive"
          });
        }
      });
    },
    L = ((t == null ? void 0 : t.monthlyData) || []).map(s => ({
      month: s.month,
      entrada: s.income,
      saida: s.expense
    })),
    E = (t == null ? void 0 : t.incomeByCategory) || {},
    R = Object.values(E).reduce((s, d) => s + d, 0) || 1,
    f = Object.entries(E).map(([s, d], m) => ({
      name: P[s] || s,
      value: Math.round(d / R * 100),
      amount: d,
      color: Z[m % Z.length]
    })),
    y = t ? ee(t.totalIncome, t.previousPeriodIncome) : {
      value: "N/A",
      positive: !0
    },
    j = t ? ee(t.totalExpense, t.previousPeriodExpense) : {
      value: "N/A",
      positive: !0
    };
  return <div className="min-h-screen bg-background"><Fe activeModule="financeiro" onModuleChange={() => {}} collapsed={r} onCollapsedChange={n} /><De activeModule="financeiro" onModuleChange={() => {}} open={c} onOpenChange={i} /><div className={C("transition-all duration-300", r ? "lg:pl-[72px]" : "lg:pl-64")}><Ee title="Painel Financeiro" subtitle="Visão geral do fluxo de caixa e comissões" actionButton=<div className="flex items-center gap-2"><v variant="outline" className="gap-2" onClick={() => D("/financeiro/comissoes")}><z className="h-4 w-4" />Gestão de Comissões</v><v variant="cta" className="gap-2" onClick={() => b(!0)}><ge className="h-4 w-4" />Nova Transação</v></div> onMobileMenuClick={() => i(!0)} /><main className="p-4 lg:p-6"><div className="flex flex-wrap items-center justify-between gap-4 mb-6"><div className="flex items-center gap-2">{Pe.map(s => <v variant={x === s.value ? "default" : "outline"} size="sm" onClick={() => u(s.value)} className={x === s.value ? "bg-foreground text-background" : ""}>{s.label}</v>)}</div><div className="flex items-center gap-2"><v variant="outline" size="sm" className="gap-2" onClick={() => {
              if (!t) {
                g({
                  title: "Sem dados",
                  description: "Aguarde o carregamento dos dados.",
                  variant: "destructive"
                });
                return;
              }
              try {
                Ce(t, x), g({
                  title: "PDF gerado!",
                  description: "Relatório baixado com sucesso."
                });
              } catch (s) {
                g({
                  title: "Erro ao gerar PDF",
                  description: s == null ? void 0 : s.message,
                  variant: "destructive"
                });
              }
            }}><fe className="h-4 w-4" />Relatório PDF</v><v variant="outline" size="sm" className="gap-2" onClick={() => {
              if (!t) {
                g({
                  title: "Sem dados",
                  description: "Aguarde o carregamento dos dados.",
                  variant: "destructive"
                });
                return;
              }
              try {
                Se(t, x), g({
                  title: "Excel gerado!",
                  description: "Planilha baixada com sucesso."
                });
              } catch (s) {
                g({
                  title: "Erro ao gerar Excel",
                  description: s == null ? void 0 : s.message,
                  variant: "destructive"
                });
              }
            }}><je className="h-4 w-4" />Exportar Excel</v></div></div>{O ? <div className="flex items-center justify-center py-20"><ve className="h-8 w-8 animate-spin text-accent" /></div> : <e.Fragment><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><div className="bg-card rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Receita Total</p><p className="text-2xl font-bold text-foreground mt-1">{M((t == null ? void 0 : t.totalIncome) || 0)}</p></div><div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center"><I className="h-6 w-6 text-accent" /></div></div><p className={C("text-sm flex items-center gap-1 mt-3", y.positive ? "text-success" : "text-destructive")}>{y.positive ? <J className="h-3 w-3" /> : <Q className="h-3 w-3" />}{y.value} vs. período anterior</p></div><div className="bg-accent rounded-xl p-5 shadow-sm text-accent-foreground cursor-pointer hover:opacity-95 transition-all active:scale-[0.99] select-none" onClick={() => D("/financeiro/comissoes")}><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Comissões</p><p className="text-2xl font-bold mt-1">{M((t == null ? void 0 : t.totalCommissions) || 0)}</p></div><div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center"><z className="h-6 w-6" /></div></div><p className="text-sm flex items-center gap-1 mt-3 opacity-90">{t != null && t.totalIncome ? `${(t.totalCommissions / t.totalIncome * 100).toFixed(1)}% da receita` : "N/A"}</p></div><div className="bg-card rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Despesas Totais</p><p className="text-2xl font-bold text-foreground mt-1">{M((t == null ? void 0 : t.totalExpense) || 0)}</p></div><div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center"><Ne className="h-6 w-6 text-destructive" /></div></div><p className={C("text-sm flex items-center gap-1 mt-3", j.positive ? "text-destructive" : "text-success")}>{j.positive ? <J className="h-3 w-3" /> : <Q className="h-3 w-3" />}{j.value} vs. período anterior</p></div><div className="bg-card rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Lucro Líquido</p><p className="text-2xl font-bold text-foreground mt-1">{M(((t == null ? void 0 : t.totalIncome) || 0) - ((t == null ? void 0 : t.totalExpense) || 0))}</p></div><div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center"><be className="h-6 w-6 text-success" /></div></div><p className="text-sm text-muted-foreground mt-3">Margem: {t != null && t.totalIncome ? `${((t.totalIncome - t.totalExpense) / t.totalIncome * 100).toFixed(1)}%` : "0%"}</p></div></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"><div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-sm"><div className="flex items-center justify-between mb-6"><div><h3 className="text-lg font-semibold text-foreground">Fluxo de Caixa</h3><p className="text-sm text-muted-foreground">Comparativo de Entradas vs Saídas (12 meses)</p></div><div className="flex items-center gap-4"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-accent" /><span className="text-sm text-muted-foreground">Entradas</span></div><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-primary" /><span className="text-sm text-muted-foreground">Saídas</span></div></div></div><H width="100%" height={300}><Re data={L} barGap={4}><$e strokeDasharray="3 3" vertical={!1} stroke="hsl(var(--border))" /><ke dataKey="month" axisLine={!1} tickLine={!1} /><Me axisLine={!1} tickLine={!1} tickFormatter={s => `${s >= 1e3 ? `${(s / 1e3).toFixed(0)}k` : s}`} /><U formatter={s => A(s)} contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} /><X dataKey="entrada" name="Entradas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} /><X dataKey="saida" name="Saídas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></Re></H></div><div className="bg-card rounded-xl p-6 shadow-sm"><div className="flex items-center justify-between mb-4"><div><h3 className="text-lg font-semibold text-foreground">Origem da Receita</h3><p className="text-sm text-muted-foreground">Distribuição por tipo de negócio</p></div></div>{f.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Sem receitas no período.</p> : <e.Fragment><div className="flex justify-center"><H width={200} height={200}><Ae><Be data={f} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">{f.map((s, d) => <Te fill={s.color} />)}</Be><U formatter={s => `${s}%`} /></Ae></H></div><div className="space-y-3 mt-4">{f.map(s => <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{
                        backgroundColor: s.color
                      }} /><span className="text-sm text-foreground">{s.name}</span></div><div className="text-right"><span className="text-sm font-medium text-foreground">{s.value}%</span><span className="text-xs text-muted-foreground ml-2">({M(s.amount)})</span></div></div>)}</div></e.Fragment>}</div></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-card rounded-xl p-6 shadow-sm"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-foreground">Transações Recentes</h3><G variant="outline">{((w = t == null ? void 0 : t.recentTransactions) == null ? void 0 : w.length) || 0} registros</G></div>{($ = t == null ? void 0 : t.recentTransactions) != null && $.length ? <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border"><th className="text-left pb-3 text-sm font-medium text-muted-foreground">Descrição</th><th className="text-left pb-3 text-sm font-medium text-muted-foreground">Data</th><th className="text-left pb-3 text-sm font-medium text-muted-foreground">Categoria</th><th className="text-right pb-3 text-sm font-medium text-muted-foreground">Valor</th></tr></thead><tbody>{t.recentTransactions.map(s => <tr className="border-b border-border last:border-0"><td className="py-3"><div className="flex items-center gap-2"><div className={C("h-8 w-8 rounded-full flex items-center justify-center", s.type === "income" ? "bg-success/10" : "bg-muted")}>{s.type === "income" ? <ye className="h-4 w-4 text-success" /> : <we className="h-4 w-4 text-muted-foreground" />}</div><span className="font-medium text-foreground text-sm truncate max-w-[180px]">{s.description || "Sem descrição"}</span></div></td><td className="py-3 text-sm text-muted-foreground whitespace-nowrap">{new Date(s.date + "T00:00:00").toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit"
                        })}</td><td className="py-3"><G variant="outline" className="text-xs">{P[s.category] || s.category}</G></td><td className={C("py-3 text-right font-medium whitespace-nowrap", s.type === "income" ? "text-success" : "text-foreground")}>{s.type === "income" ? "+" : "-"} {A(Number(s.amount))}</td></tr>)}</tbody></table></div> : <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação no período.</p>}</div><div className="bg-card rounded-xl p-6 shadow-sm"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-foreground">Detalhamento de Despesas</h3></div>{!(t != null && t.expenseByCategory) || Object.keys(t.expenseByCategory).length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Sem despesas no período.</p> : <div className="space-y-4">{Object.entries(t.expenseByCategory).sort(([, s], [, d]) => d - s).map(([s, d]) => {
                  const m = t.totalExpense > 0 ? d / t.totalExpense * 100 : 0;
                  return <div><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-foreground">{P[s] || s}</span><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">{m.toFixed(0)}%</span><span className="text-sm font-semibold text-foreground">{A(d)}</span></div></div><div className="w-full h-2 bg-muted rounded-full overflow-hidden"><div className={C("h-full rounded-full", s === "commission" ? "bg-accent" : s === "operational" ? "bg-primary" : s === "marketing" ? "bg-warning" : "bg-muted-foreground")} style={{
                        width: `${m}%`
                      }} /></div></div>;
                })}<div className="pt-4 border-t border-border flex items-center justify-between"><span className="text-sm font-semibold text-foreground">Total Despesas</span><span className="text-lg font-bold text-foreground">{A(t.totalExpense)}</span></div></div>}</div></div></e.Fragment>}</main></div><Ie open={N} onOpenChange={b} onConfirm={T} /></div>;
}
export { ns as default };