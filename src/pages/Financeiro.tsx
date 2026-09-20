import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CreateTransacaoModal, type TransacaoFormData } from "@/components/financeiro/CreateTransacaoModal";
import { useCreateFinancialTransaction, useFinancialStats } from "@/hooks/use-financial";
import { useAuth } from "@/contexts/AuthContext";
import { exportFinanceiroPDF, exportFinanceiroExcel } from "@/lib/export-utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  FileSpreadsheet,
  DollarSign,
  Users,
  AlertTriangle,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDown,
  ArrowUp,
  Filter,
  Calendar,
  Loader2,
  Landmark,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ['#d96909', '#223152', '#9ca3af', '#16a34a', '#dc2626'];

const tabs = [
  { label: "Este Mês", value: "month" as const },
  { label: "Trimestre", value: "quarter" as const },
  { label: "Ano", value: "year" as const },
];

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return `R$ ${value}`;
}

function pctChange(current: number, previous: number): { value: string; positive: boolean } {
  if (previous === 0) return { value: 'N/A', positive: true };
  const pct = ((current - previous) / previous) * 100;
  return { value: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, positive: pct >= 0 };
}

export default function Financeiro() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useAuth();
  const createTransactionMutation = useCreateFinancialTransaction();
  const { data: stats, isLoading } = useFinancialStats(activePeriod);
  const navigate = useNavigate();

  const handleCreateTransacao = (data: TransacaoFormData) => {
    const amount = parseFloat(data.value) || 0;
    createTransactionMutation.mutate(
      {
        type: data.type,
        category_id: data.categoryId || null,
        name: data.description,
        description: data.notes || null,
        amount,
        date: data.date || null,
        agent_id: user?.id || null,
        reference_type: 'manual',
        source: 'manual',
        is_realized: data.status === 'completed',
      },
      {
        onSuccess: () => {
          const formatted = amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
          toast({
            title: "Transação Registrada",
            description: `${data.type === "income" ? "Entrada" : "Saída"}: ${data.description} — ${formatted}`,
          });
        },
        onError: (err: any) => {
          toast({
            title: "Erro ao registrar transação",
            description: err?.message || "Tente novamente.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Compute chart data from stats
  const cashFlowData = (stats?.monthlyData || []).map(m => ({
    month: m.month,
    entrada: m.income,
    saida: m.expense,
  }));

  // Revenue origin pie data
  const incomeCategories = stats?.incomeByCategory || {};
  const totalIncomeForPie = Object.values(incomeCategories).reduce((s, v) => s + v, 0) || 1;
  const revenueOriginData = Object.entries(incomeCategories).map(([cat, val], i) => ({
    name: cat,
    value: Math.round((val / totalIncomeForPie) * 100),
    amount: val,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  // Comparison percentages
  const incomeChange = stats ? pctChange(stats.totalIncome, stats.previousPeriodIncome) : { value: 'N/A', positive: true };
  const expenseChange = stats ? pctChange(stats.totalExpense, stats.previousPeriodExpense) : { value: 'N/A', positive: true };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="financeiro"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="financeiro"
        onModuleChange={() => {}}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />

      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <Header
          title="Painel Financeiro"
          subtitle="Visão geral do fluxo de caixa e comissões"
          actionButton={
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={() => navigate('/financeiro/livro')}>
                <BookOpen className="h-4 w-4" />
                Livro Geral
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/financeiro/contas')}>
                <Landmark className="h-4 w-4" />
                Contas Bancárias
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/financeiro/comissoes')}>
                <Users className="h-4 w-4" />
                Gestão de Comissões
              </Button>
              <Button variant="cta" className="gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            </div>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
          {/* Tabs & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={activePeriod === tab.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePeriod(tab.value)}
                  className={activePeriod === tab.value ? "bg-foreground text-background" : ""}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                if (!stats) { toast({ title: 'Sem dados', description: 'Aguarde o carregamento dos dados.', variant: 'destructive' }); return; }
                try { exportFinanceiroPDF(stats, activePeriod); toast({ title: 'PDF gerado!', description: 'Relatório baixado com sucesso.' }); }
                catch (err: any) { toast({ title: 'Erro ao gerar PDF', description: err?.message, variant: 'destructive' }); }
              }}>
                <Download className="h-4 w-4" />
                Relatório PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                if (!stats) { toast({ title: 'Sem dados', description: 'Aguarde o carregamento dos dados.', variant: 'destructive' }); return; }
                try { exportFinanceiroExcel(stats, activePeriod); toast({ title: 'Excel gerado!', description: 'Planilha baixada com sucesso.' }); }
                catch (err: any) { toast({ title: 'Erro ao gerar Excel', description: err?.message, variant: 'destructive' }); }
              }}>
                <FileSpreadsheet className="h-4 w-4" />
                Exportar Excel
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Receita Total</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{formatCompact(stats?.totalIncome || 0)}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <p className={cn("text-sm flex items-center gap-1 mt-3", incomeChange.positive ? "text-success" : "text-destructive")}>
                    {incomeChange.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {incomeChange.value} vs. período anterior
                  </p>
                </div>

                <div 
                  className="bg-accent rounded-xl p-5 shadow-sm text-accent-foreground cursor-pointer hover:opacity-95 transition-all active:scale-[0.99] select-none"
                  onClick={() => navigate('/financeiro/comissoes')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Comissões</p>
                      <p className="text-2xl font-bold mt-1">{formatCompact(stats?.totalCommissions || 0)}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-sm flex items-center gap-1 mt-3 opacity-90">
                    {stats?.totalIncome ? `${((stats.totalCommissions / stats.totalIncome) * 100).toFixed(1)}% da receita` : 'N/A'}
                  </p>
                </div>

                <div className="bg-card rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Despesas Totais</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{formatCompact(stats?.totalExpense || 0)}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                  </div>
                  <p className={cn("text-sm flex items-center gap-1 mt-3", !expenseChange.positive ? "text-success" : "text-destructive")}>
                    {!expenseChange.positive ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                    {expenseChange.value} vs. período anterior
                  </p>
                </div>

                <div className="bg-card rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{formatCompact((stats?.totalIncome || 0) - (stats?.totalExpense || 0))}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-success" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Margem: {stats?.totalIncome ? `${(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100).toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Cash Flow Chart */}
                <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Fluxo de Caixa</h3>
                      <p className="text-sm text-muted-foreground">Comparativo de Entradas vs Saídas (12 meses)</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-accent" />
                        <span className="text-sm text-muted-foreground">Entradas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <span className="text-sm text-muted-foreground">Saídas</span>
                      </div>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cashFlowData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                      <Tooltip
                        formatter={(value: number) => formatBRL(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="entrada" name="Entradas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="saida" name="Saídas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Revenue Origin */}
                <div className="bg-card rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Origem da Receita</h3>
                      <p className="text-sm text-muted-foreground">Distribuição por tipo de negócio</p>
                    </div>
                  </div>

                  {revenueOriginData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sem receitas no período.</p>
                  ) : (
                    <>
                      <div className="flex justify-center">
                        <ResponsiveContainer width={200} height={200}>
                          <PieChart>
                            <Pie
                              data={revenueOriginData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {revenueOriginData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-3 mt-4">
                        {revenueOriginData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-sm text-foreground">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-foreground">{item.value}%</span>
                              <span className="text-xs text-muted-foreground ml-2">({formatCompact(item.amount)})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <div className="bg-card rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Transações Recentes</h3>
                    <Badge variant="outline">{stats?.recentTransactions?.length || 0} registros</Badge>
                  </div>

                  {!stats?.recentTransactions?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação no período.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left pb-3 text-sm font-medium text-muted-foreground">Descrição</th>
                            <th className="text-left pb-3 text-sm font-medium text-muted-foreground">Data</th>
                            <th className="text-left pb-3 text-sm font-medium text-muted-foreground">Categoria</th>
                            <th className="text-right pb-3 text-sm font-medium text-muted-foreground">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentTransactions.map((tx) => (
                            <tr key={tx.id} className="border-b border-border last:border-0">
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", tx.type === "income" ? "bg-success/10" : "bg-muted")}>
                                    {tx.type === "income" ? <ArrowDown className="h-4 w-4 text-success" /> : <ArrowUp className="h-4 w-4 text-muted-foreground" />}
                                  </div>
                                  <span className="font-medium text-foreground text-sm truncate max-w-[180px]">{tx.description || 'Sem descrição'}</span>
                                </div>
                              </td>
                              <td className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                                {tx.date ? new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—'}
                              </td>
                              <td className="py-3">
                                <Badge variant="outline" className="text-xs">{tx.category?.name || 'Sin categoria'}</Badge>
                              </td>
                              <td className={cn("py-3 text-right font-medium whitespace-nowrap", tx.type === "income" ? "text-success" : "text-foreground")}>
                                {tx.type === 'income' ? '+' : '-'} {formatBRL(Number(tx.amount))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Expense Breakdown */}
                <div className="bg-card rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Detalhamento de Despesas</h3>
                  </div>

                  {!stats?.expenseByCategory || Object.keys(stats.expenseByCategory).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sem despesas no período.</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(stats.expenseByCategory)
                        .sort(([, a], [, b]) => b - a)
                        .map(([cat, val]) => {
                          const pct = stats.totalExpense > 0 ? (val / stats.totalExpense) * 100 : 0;
                          return (
                            <div key={cat}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-foreground">{cat}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">{pct.toFixed(0)}%</span>
                                  <span className="text-sm font-semibold text-foreground">{formatBRL(val)}</span>
                                </div>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full", cat === 'commission' ? 'bg-accent' : cat === 'operational' ? 'bg-primary' : cat === 'marketing' ? 'bg-warning' : 'bg-muted-foreground')}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}

                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">Total Despesas</span>
                        <span className="text-lg font-bold text-foreground">{formatBRL(stats.totalExpense)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <CreateTransacaoModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onConfirm={handleCreateTransacao}
      />
    </div>
  );
}
