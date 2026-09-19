import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useFinancialBanks,
  useBankSaldo,
  useBankTransactions,
  useCreateFinancialBank,
  useToggleBankActive,
  type BankSaldo,
} from "@/hooks/use-financial-banks";
import {
  Landmark,
  ArrowLeft,
  Plus,
  Building2,
  Wallet,
  ArrowDown,
  ArrowUp,
  Loader2,
  ArrowRight,
  Banknote,
  Power,
  PowerOff,
} from "lucide-react";

/** Moeda padrão del cuaderno real: guaraníes (Gs) con formato agrupado. */
function formatGs(value: number) {
  return `Gs ${value.toLocaleString("es-PY", { maximumFractionDigits: 0 })}`;
}

function formatCompactGs(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `Gs ${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `Gs ${(value / 1_000).toFixed(0)}k`;
  return `Gs ${value}`;
}

export default function Contas() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const { tenantId } = useAuth();
  const navigate = useNavigate();

  const { data: banks, isLoading } = useFinancialBanks(tenantId);
  const { data: saldos } = useBankSaldo(banks);
  const { data: selectedTx } = useBankTransactions(selectedBankId);
  const createBankMutation = useCreateFinancialBank();
  const toggleActiveMutation = useToggleBankActive();

  const totalSaldo = (saldos || []).reduce((s, r) => s + r.saldo, 0);
  const saldoPorBanco: Record<string, BankSaldo> = Object.fromEntries(
    (saldos || []).map((r) => [r.bank_id, r])
  );
  const selectedBank = banks?.find((b) => b.id === selectedBankId);
  const selectedSaldo = selectedBankId ? saldoPorBanco[selectedBankId] : null;

  const toggleActive = (bankId: string, isActive: boolean) => {
    toggleActiveMutation.mutate(
      { id: bankId, is_active: !isActive },
      {
        onSuccess: () =>
          toast({
            title: "Estado actualizado",
            description: `Sucursal ${isActive ? "desactivada" : "activada"} correctamente.`,
          }),
        onError: (err: any) =>
          toast({
            title: "Error",
            description: err?.message || "Intente nuevamente.",
            variant: "destructive",
          }),
      }
    );
  };

  const handleCreateBank = () => {
    if (!newBankName.trim()) return;
    if (!tenantId) {
      toast({ title: "Error", description: "Tenant no identificado.", variant: "destructive" });
      return;
    }
    createBankMutation.mutate(
      { name: newBankName.trim(), tenant_id: tenantId, is_active: true },
      {
        onSuccess: () => {
          toast({ title: "Cuenta creada", description: `${newBankName.trim()} añadida al listado.` });
          setNewBankName("");
          setIsCreateOpen(false);
        },
        onError: (err: any) =>
          toast({ title: "Error", description: err?.message || "No se pudo crear.", variant: "destructive" }),
      }
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

      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <Header
          title="Contas Bancárias"
          subtitle="Saldos y movimientos de todas las cuentas"
          actionButton={
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={() => navigate("/financeiro")}>
                <ArrowLeft className="h-4 w-4" />
                Volver al Financeiro
              </Button>
              <Button variant="cta" className="gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Nueva Cuenta
              </Button>
            </div>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <>
              {/* Banner resumen */}
              <div className="bg-accent rounded-xl p-6 shadow-sm text-accent-foreground mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Saldo Total Consolidado (todas las cuentas)</p>
                    <p className="text-3xl font-bold mt-0.5">{formatCompactGs(totalSaldo)}</p>
                  </div>
                </div>
                <p className="text-sm mt-3 flex items-center gap-1 opacity-90">
                  <Landmark className="h-4 w-4" />
                  {saldos?.filter((s) => s.saldo !== 0).length || 0} cuentas con movimiento ·{" "}
                  {banks?.length || 0} registradas
                </p>
              </div>

              {/* Detalle de cuenta seleccionada */}
              {selectedBankId && (
                <div className="bg-card rounded-xl p-6 shadow-sm mb-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-accent" />
                        {selectedBank?.name || "Cuenta"}
                        {selectedBank?.is_active === false && (
                          <Badge variant="outline">Inactiva</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Saldo actual:{" "}
                        <span className="font-semibold text-foreground">{formatGs(selectedSaldo?.saldo || 0)}</span>
                        {" "}· {selectedSaldo?.n_transacciones || 0} transacciones realizadas
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedBankId(null)}>
                      Cerrar detalle
                    </Button>
                  </div>

                  {selectedTx && selectedTx.length > 0 ? (
                    <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left pb-3 text-sm font-medium text-muted-foreground">Descripción</th>
                            <th className="text-left pb-3 text-sm font-medium text-muted-foreground">Fecha</th>
                            <th className="text-left pb-3 text-sm font-medium text-muted-foreground">Categoría</th>
                            <th className="text-right pb-3 text-sm font-medium text-muted-foreground">Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedTx || []).slice(0, 40).map((tx) => (
                            <tr key={tx.id} className="border-b border-border last:border-0">
                              <td className="py-3">
                                <span className="font-medium text-foreground text-sm truncate max-w-[220px]">
                                  {tx.description || "Sin descripción"}
                                </span>
                              </td>
                              <td className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                                {tx.date
                                  ? new Date(tx.date + "T00:00:00").toLocaleDateString("es-PY", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </td>
                              <td className="py-3">
                                <Badge variant="outline" className="text-xs">
                                  {(tx as any).category?.name || "Sin categoría"}
                                </Badge>
                              </td>
                              <td className={cn("py-3 text-right font-medium whitespace-nowrap", tx.type === "income" ? "text-success" : "text-foreground")}>
                                {tx.type === "income" ? "+" : "-"} {formatCompactGs(Number(tx.amount))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Sin transacciones registradas en esta cuenta.
                    </p>
                  )}
                </div>
              )}

              {/* Listado de cuentas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(banks || []).map((bank) => {
                  const saldo = saldoPorBanco[bank.id];
                  const isActive = bank.is_active !== false;
                  return (
                    <div
                      key={bank.id}
                      className={cn(
                        "bg-card rounded-xl p-5 shadow-sm border transition-all hover:border-accent/40 cursor-pointer",
                        !isActive && "opacity-70"
                      )}
                      onClick={() => setSelectedBankId(bank.id === selectedBankId ? null : bank.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", isActive ? "bg-accent/10" : "bg-muted")}>
                            <Banknote className={cn("h-5 w-5", isActive ? "text-accent" : "text-muted-foreground")} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{bank.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {saldo?.n_transacciones || 0} movimientos
                            </p>
                          </div>
                        </div>
                        <button
                          className="p-1.5 rounded-md hover:bg-muted transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActive(bank.id, isActive);
                          }}
                          title={isActive ? "Desactivar" : "Activar"}
                        >
                          {isActive ? (
                            <Power className="h-4 w-4 text-success" />
                          ) : (
                            <PowerOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>

                      <p className={cn("text-xl font-bold mt-1", !saldo || saldo.saldo === 0 ? "text-muted-foreground" : saldo.saldo > 0 ? "text-foreground" : "text-destructive")}>
                        {formatCompactGs(saldo?.saldo || 0)}
                      </p>

                      <div className="flex items-center justify-between mt-3 text-xs">
                        <span className={cn("flex items-center gap-1", saldo?.entradas ? "text-success" : "text-muted-foreground")}>
                          <ArrowDown className="h-3 w-3" /> {formatCompactGs(saldo?.entradas || 0)}
                        </span>
                        <span className={cn("flex items-center gap-1", saldo?.saidas ? "text-destructive" : "text-muted-foreground")}>
                          <ArrowUp className="h-3 w-3" /> {formatCompactGs(saldo?.saidas || 0)}
                        </span>
                        <ArrowRight className={cn("h-4 w-4", selectedBankId === bank.id ? "text-accent" : "text-muted-foreground")} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {(banks || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No hay cuentas bancarias registradas para este tenant.
                </p>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal de creación */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md p-0">
          <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Banknote className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <span>Nueva Cuenta Bancaria</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    Registre un banco / billetera en el tenancy
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              <Label>Nombre de la cuenta *</Label>
              <Input
                placeholder="Ej: Banco Continental"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newBankName.trim()) handleCreateBank();
                }}
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button variant="cta" onClick={handleCreateBank} disabled={!newBankName.trim()}>
              Crear Cuenta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}