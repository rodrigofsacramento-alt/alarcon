import { useState, useMemo, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Loader2,
  Search,
  Download,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useFinancialLedger,
  useFinancialCategories,
} from "@/hooks/use-financial";
import { useFinancialBanks } from "@/hooks/use-financial-banks";
import { useAuth } from "@/contexts/AuthContext";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";

/** Moneda padrão del cuaderno (Gs = guaraníes, datos reales Ahut). */
function formatGs(value: number) {
  return value.toLocaleString("es-PY", { maximumFractionDigits: 0 }) + " Gs";
}

function formatCompactGs(value: number) {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toLocaleString("es-PY");
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return dateStr;
}

const TYPE_COLORS: Record<string, string> = {
  income: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
  expense: "bg-rose-500/15 text-rose-700 border-rose-500/20",
};

const TYPE_LABELS: Record<string, string> = {
  income: "Entrada",
  expense: "Saída",
};

export default function Livro() {
  const navigate = useNavigate();
  const { tenantId } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filtros (declarados explícitamente — Deborah/AXIOM resolverían con useSearchParams,
  // aquí primamos granularidad verificable del Comandante)
  const [type, setType] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [bankId, setBankId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [realizedOnly, setRealizedOnly] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: categories } = useFinancialCategories();
  const { data: banks } = useFinancialBanks(tenantId);

  const result = useFinancialLedger({
    type: type || undefined,
    categoryId: categoryId || undefined,
    bankId: bankId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    realizedOnly: realizedOnly || undefined,
    search: search || undefined,
    page,
    pageSize,
  });

  const transactions = result.data?.transactions ?? [];
  const total = result.data?.total ?? 0;
  const isLoading = result.isLoading || result.isFetching;

  const resetFilters = useCallback(() => {
    setType("");
    setCategoryId("");
    setBankId("");
    setDateFrom("");
    setDateTo("");
    setRealizedOnly(false);
    setSearch("");
    setPage(1);
  }, []);

  // Totals del filtro actual (sobre la página visible; el subtotal global real
  // se podría delegar a una RPC, aquí calculamos sobre los resultados cargados)
  const { incomeVisible, expenseVisible } = useMemo(() => {
    let i = 0;
    let e = 0;
    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === "income") i += amt;
      else e += amt;
    });
    return { incomeVisible: i, expenseVisible: e };
  }, [transactions]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setPage(1);
  };

  const buildCsv = () => {
    exportToCSV(
      transactions.map((tx) => ({
        data: formatDate(tx.date),
        tipo: TYPE_LABELS[tx.type] || tx.type,
        descricao: tx.name || tx.description || "Sem descrição",
        categoria: tx.category?.name || "-",
        banco: tx.bank?.name || "-",
        valor: tx.type === "income" ? Number(tx.amount) : -Number(tx.amount),
        situacao: tx.is_realized ? "Realizada" : "Pendente",
      })),
      [
        { key: "data", label: "Data" },
        { key: "tipo", label: "Tipo" },
        { key: "descricao", label: "Descrição" },
        { key: "categoria", label: "Categoria" },
        { key: "banco", label: "Banco" },
        { key: "valor", label: "Valor" },
        { key: "situacao", label: "Situação" },
      ],
      "livro-geral"
    );
  };

  const buildPdf = () => {
    exportToPDF(
      "Livro Geral Financeiro",
      transactions.map((tx) => ({
        data: formatDate(tx.date),
        tipo: TYPE_LABELS[tx.type] || tx.type,
        descricao: tx.name || tx.description || "Sem descrição",
        categoria: tx.category?.name || "-",
        banco: tx.bank?.name || "-",
        valor: `${tx.type === "income" ? "+" : "-"} ${formatGs(Number(tx.amount))}`,
      })),
      [
        { key: "data", label: "Data" },
        { key: "tipo", label: "Tipo" },
        { key: "descricao", label: "Descrição" },
        { key: "categoria", label: "Categoria" },
        { key: "banco", label: "Banco" },
        { key: "valor", label: "Valor" },
      ],
      "livro-geral"
    );
  };

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
          title="Livro Geral Financeiro"
          subtitle="Todas as transações — filtros, busca e exportação"
          actionButton={
            <Button variant="outline" className="gap-2" onClick={() => navigate("/financeiro")}>
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Financeiro
            </Button>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6 space-y-4">
          {/* ─── Resumen del filtro ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Registros</p>
              <p className="text-2xl font-bold">
                {isLoading ? "…" : total.toLocaleString("es-PY")}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Entradas (página)</p>
              <p className="text-2xl font-bold text-emerald-600">
                {isLoading ? "…" : formatGs(incomeVisible)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Saídas (página)</p>
              <p className="text-2xl font-bold text-rose-600">
                {isLoading ? "…" : formatGs(expenseVisible)}
              </p>
            </div>
          </div>

          {/* ─── Filtros ─── */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">Filtros</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={buildCsv}>
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={buildPdf}>
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Limpar filtros
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="col-span-2 md:col-span-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKey}
                />
              </div>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
              >
                <option value="">Todos tipos</option>
                <option value="income">Entradas</option>
                <option value="expense">Saídas</option>
              </select>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
              >
                <option value="">Todas categorias</option>
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={bankId}
                onChange={(e) => { setBankId(e.target.value); setPage(1); }}
              >
                <option value="">Todos bancos</option>
                {(banks || []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="h-10" />
              </div>
              <div className="flex items-center gap-2">
                <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="h-10" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={realizedOnly}
                onChange={(e) => { setRealizedOnly(e.target.checked); setPage(1); }}
                className="h-4 w-4 rounded border-input"
              />
              Somente transações realizadas
            </label>
          </div>

          {/* ─── Tabela ─── */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium">Banco</th>
                    <th className="px-4 py-3 font-medium">Situação</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                        Carregando…
                      </td>
                    </tr>
                  )}
                  {!isLoading && transactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhuma transação encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                  {!isLoading &&
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(tx.date)}</td>
                        <td className="px-4 py-3">
                          <Badge className={cn("border", TYPE_COLORS[tx.type] || "")} variant="outline">
                            {tx.type === "income" ? (
                              <ArrowUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDown className="h-3 w-3 mr-1" />
                            )}
                            {TYPE_LABELS[tx.type] || tx.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">
                          {tx.name || tx.description || "Sem descrição"}
                        </td>
                        <td className="px-4 py-3">{tx.category?.name || "-"}</td>
                        <td className="px-4 py-3">{tx.bank?.name || "-"}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={tx.is_realized
                              ? "border-emerald-500/20 text-emerald-700"
                              : "border-amber-500/30 text-amber-700"}
                          >
                            {tx.is_realized ? "Realizada" : "Pendente"}
                          </Badge>
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 text-right font-medium whitespace-nowrap",
                            tx.type === "income" ? "text-emerald-600" : "text-rose-600"
                          )}
                        >
                          {tx.type === "income" ? "+" : "-"} {formatGs(Number(tx.amount))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* ─── Paginação ─── */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Página {page} de {totalPages} · {total.toLocaleString("es-PY")} registros
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}