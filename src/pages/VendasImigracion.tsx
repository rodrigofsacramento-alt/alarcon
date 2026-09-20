import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  HandCoins,
  TrendingUp,
  Award,
  Loader2,
  FileSpreadsheet,
  FileText,
  Plane,
} from "lucide-react";
import { useFinancialSales, parseBuyerName } from "@/hooks/use-financial-sales";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";

function formatGs(value: number) {
  return value.toLocaleString("es-PY", { maximumFractionDigits: 0 }) + " Gs";
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return dateStr;
}

export default function VendasImigracion() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data, isLoading } = useFinancialSales();
  const vendas = data?.vendas ?? [];

  const buildCsv = () => {
    exportToCSV(
      vendas.map((v) => ({
        comprador: parseBuyerName(v.name || ""),
        descricao: v.name || "",
        data: formatDate(v.date),
        valor: Number(v.amount),
        situacao: v.is_realized ? "Realizada" : "Pendente",
      })),
      [
        { key: "comprador", label: "Comprador" },
        { key: "descricao", label: "Descrição" },
        { key: "data", label: "Data" },
        { key: "valor", label: "Valor" },
        { key: "situacao", label: "Situação" },
      ],
      "vendas-imigracao"
    );
  };

  const buildPdf = () => {
    exportToPDF(
      "Vendas & Imigração",
      vendas.map((v) => ({
        comprador: parseBuyerName(v.name || ""),
        descricao: v.name || "",
        data: formatDate(v.date),
        valor: formatGs(Number(v.amount)),
        situacao: v.is_realized ? "Realizada" : "Pendente",
      })),
      [
        { key: "comprador", label: "Comprador" },
        { key: "descricao", label: "Descrição" },
        { key: "data", label: "Data" },
        { key: "valor", label: "Valor" },
        { key: "situacao", label: "Situação" },
      ],
      "vendas-imigracao"
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
          title="Vendas & Imigração"
          subtitle="Receitas de residência temporária e cédula paraguaia"
          actionButton={
            <Button variant="outline" className="gap-2" onClick={() => navigate("/financeiro")}>
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Financeiro
            </Button>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6 space-y-4">
          {/* ─── KPIs ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Plane className="h-3.5 w-3.5" /> Total vendas
              </p>
              <p className="text-2xl font-bold">
                {isLoading ? "…" : data?.totalVendas.toLocaleString("es-PY") ?? "0"}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <HandCoins className="h-3.5 w-3.5" /> Valor total
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {isLoading ? "…" : formatGs(data?.totalValor ?? 0)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Ticket médio
              </p>
              <p className="text-2xl font-bold">{isLoading ? "…" : formatGs(data?.media ?? 0)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> Maior venda
              </p>
              <p className="text-2xl font-bold">{isLoading ? "…" : formatGs(data?.maiorValor ?? 0)}</p>
            </div>
          </div>

          {/* ─── Export + listado ─── */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Vendas migradas ({vendas.length})
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={buildCsv}>
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={buildPdf}>
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Comprador</th>
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Situação</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                        Carregando…
                      </td>
                    </tr>
                  )}
                  {!isLoading && vendas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhuma venda de imigração migrada.
                      </td>
                    </tr>
                  )}
                  {!isLoading &&
                    vendas.map((v) => (
                      <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {parseBuyerName(v.name || "")}
                        </td>
                        <td className="px-4 py-3 max-w-sm truncate text-muted-foreground">
                          {v.name || ""}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(v.date)}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              v.is_realized
                                ? "border-emerald-500/20 text-emerald-700"
                                : "border-amber-500/30 text-amber-700"
                            }
                          >
                            {v.is_realized ? "Realizada" : "Pendente"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-600 whitespace-nowrap">
                          + {formatGs(Number(v.amount))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}