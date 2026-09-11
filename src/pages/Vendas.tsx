import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSales, useDeleteSaleRecord } from "@/hooks/use-sales";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Trash2,
  Loader2,
  Calendar,
  User,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function Vendas() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; propertyId: string; buyerName: string } | null>(null);

  const { data: sales = [], isLoading } = useSales();
  const deleteSaleMutation = useDeleteSaleRecord();

  const handleCancelSale = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSaleMutation.mutateAsync({ id: deleteTarget.id, property_id: deleteTarget.propertyId });
      toast({
        title: "Registro de Venda Excluído!",
        description: `A venda de ${deleteTarget.buyerName} foi cancelada e o imóvel voltou a ficar disponível.`,
      });
      setDeleteTarget(null);
    } catch (err: any) {
      toast({
        title: "Erro ao cancelar venda",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const formatCurrency = (value: number) =>
    'Gs ' + value.toLocaleString('es-PY', { maximumFractionDigits: 0 });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get unique agents for filter
  const uniqueAgents = Array.from(
    new Map(
      sales
        .filter((s) => s.agent)
        .map((s) => [s.agent!.id, s.agent!])
    ).values()
  );

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.property?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.property?.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAgent = selectedAgentId === "all" || s.agent_id === selectedAgentId;

    return matchesSearch && matchesAgent;
  });

  const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.sale_value), 0);
  const totalSalesCount = filteredSales.length;
  const totalCommissionEstimate = filteredSales.reduce((sum, s) => sum + Number(s.sale_value) * 0.05, 0);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="vendas"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="vendas"
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
          title="Contratos e Vendas"
          subtitle="Acompanhe os contratos assinados e imóveis vendidos"
          actionButton={
            <Button
              variant="outline"
              className="gap-2 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/5 text-foreground font-medium transition-all"
              onClick={() => navigate("/financeiro/comissoes")}
            >
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span>Ver Comissões</span>
            </Button>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6 space-y-6">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border/45 flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1 z-10">
                <p className="text-sm font-medium text-muted-foreground">Volume de Vendas</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center gap-1 text-xs text-success font-medium">
                  <TrendingUp className="h-3 w-3" />
                  <span>Resultado consolidado</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary z-10 shrink-0">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 text-foreground">
                <DollarSign className="h-24 w-24" />
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-sm border border-border/45 flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1 z-10">
                <p className="text-sm font-medium text-muted-foreground">Imóveis Vendidos</p>
                <p className="text-3xl font-bold text-foreground">{totalSalesCount}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <Building2 className="h-3 w-3 text-accent" />
                  <span>Contratos fechados</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent z-10 shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 text-foreground">
                <Building2 className="h-24 w-24" />
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-sm border border-border/45 flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1 z-10">
                <p className="text-sm font-medium text-muted-foreground">Comissão Estimada (5%)</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalCommissionEstimate)}</p>
                <div className="flex items-center gap-1 text-xs text-success font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Comissão global gerada</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center text-success z-10 shrink-0">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 text-foreground">
                <TrendingUp className="h-24 w-24" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-4 rounded-xl shadow-sm border border-border/40">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por comprador, código ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">Todos os Corretores</option>
                {uniqueAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-20 px-4">
                <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <h3 className="font-semibold text-foreground text-lg">Nenhuma venda encontrada</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                  Os registros de vendas aparecem aqui quando os contratos jurídicos correspondentes são assinados e concluídos.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/40 text-muted-foreground font-medium select-none">
                      <th className="p-4 pl-6">Imóvel de Referência</th>
                      <th className="p-4">Cliente Comprador</th>
                      <th className="p-4">Corretor Responsável</th>
                      <th className="p-4">Valor da Venda</th>
                      <th className="p-4">Data do Contrato</th>
                      <th className="p-4 pr-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredSales.map((sale) => (
                      <tr
                        key={sale.id}
                        className="hover:bg-muted/10 transition-colors group"
                      >
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 font-bold text-xs select-none">
                              {sale.property?.code.slice(0, 3) || "REF"}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground truncate max-w-[200px]">
                                {sale.property?.title || "Imóvel sem título"}
                              </p>
                              <span className="font-mono text-xs text-muted-foreground">
                                {sale.property?.code || "REF-000"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-foreground">{sale.buyer_name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {sale.agent ? (
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                                  {getInitials(sale.agent.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-foreground">{sale.agent.full_name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">Sem corretor</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-foreground">
                            {formatCurrency(Number(sale.sale_value))}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDate(sale.contract_signed_at)}</span>
                          </div>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                            title="Estornar/Excluir Venda"
                            disabled={deleteSaleMutation.isPending}
                            onClick={() =>
                              setDeleteTarget({ id: sale.id, propertyId: sale.property_id, buyerName: sale.buyer_name })
                            }
                          >
                            {deleteSaleMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Estornar/Excluir Venda"
        description={deleteTarget ? `Deseja realmente excluir o registro de venda de ${deleteTarget.buyerName}? O imóvel correspondente voltará a ficar Disponível.` : ''}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={deleteSaleMutation.isPending}
        onConfirm={handleCancelSale}
      />
    </div>
  );
}
