import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { useProposals, useCreateProposal, useUpdateProposal, type Proposal } from "@/hooks/use-proposals";
import { useAuth } from "@/contexts/AuthContext";
import { CreateProposalModal, type ProposalFormData } from "@/components/propostas/CreateProposalModal";
import { ProposalDetailModal } from "@/components/propostas/ProposalDetailModal";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Filter,
  Download,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Clock,
  CheckCircle2,
  Eye,
  Pencil,
  MoreVertical,
  ClipboardList,
  Users,
  Loader2,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const formatValue = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const proposalStageLabels = [
  "Docs Enviados",
  "Proposta Comprador",
  "Finalizada Comprador",
  "Proposta Vendedor",
  "Finalizada",
];

const getStagesArray = (currentStage: number): ("complete" | "current" | "pending")[] => {
  return proposalStageLabels.map((_, i) => {
    if (i < currentStage) return "complete";
    if (i === currentStage) return "current";
    return "pending";
  });
};

const getProgressFromStage = (stage: number): number => {
  return Math.min(100, Math.round(((stage + 1) / 5) * 100));
};

const getStatusColor = (status: string): "blue" | "green" | "orange" | "gray" => {
  if (status === 'Finalizada' || status === 'Finalizada Comprador') return 'green';
  if (status === 'Proposta Comprador' || status === 'Proposta Vendedor') return 'blue';
  if (status === 'Cancelada') return 'gray';
  return 'orange';
};

const tabs = [
  { label: "Todas" },
  { label: "Docs Enviados" },
  { label: "Em Negociação" },
  { label: "Finalizadas" },
];

export default function Propostas() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Todas");
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);

  const { user } = useAuth();
  const { data: proposals = [], isLoading } = useProposals();
  const createProposalMutation = useCreateProposal();
  const updateProposalMutation = useUpdateProposal();

  const handleAdvanceStage = (proposal: Proposal) => {
    const currentStage = proposal.current_stage || 0;
    if (currentStage >= 4) return;
    const nextStage = currentStage + 1;
    const nextStatus = proposalStageLabels[nextStage] || proposal.status;
    updateProposalMutation.mutate(
      { id: proposal.id, current_stage: nextStage, status: nextStatus },
      {
        onSuccess: () => toast({ title: "Proposta Atualizada", description: `Avançada para: ${nextStatus}` }),
        onError: (err: any) => toast({ title: "Erro", description: err?.message || "Tente novamente.", variant: "destructive" }),
      }
    );
  };

  const handleCancelProposal = (proposal: Proposal) => {
    updateProposalMutation.mutate(
      { id: proposal.id, status: "Cancelada" },
      {
        onSuccess: () => toast({ title: "Proposta Cancelada", description: `Proposta ${proposal.proposal_number} foi cancelada.` }),
        onError: (err: any) => toast({ title: "Erro", description: err?.message || "Tente novamente.", variant: "destructive" }),
      }
    );
  };

  const handleUpdateProposalFields = (id: string, data: Record<string, unknown>) => {
    updateProposalMutation.mutate(
      { id, ...data } as Parameters<typeof updateProposalMutation.mutate>[0],
      {
        onSuccess: () => {
          toast({ title: "Proposta Atualizada", description: "Alterações salvas com sucesso." });
          setSelectedProposalId(null);
        },
        onError: (err: any) => toast({ title: "Erro", description: err?.message || "Tente novamente.", variant: "destructive" }),
      }
    );
  };

  const handleSignProposal = (proposal: Proposal) => {
    updateProposalMutation.mutate(
      { id: proposal.id, signature_status: "signed" },
      {
        onSuccess: () => toast({ title: "Assinatura Registrada", description: `Proposta ${proposal.proposal_number} marcada como assinada.` }),
        onError: (err: any) => toast({ title: "Erro", description: err?.message || "Tente novamente.", variant: "destructive" }),
      }
    );
  };

  const handleCreateProposal = (formData: ProposalFormData) => {
    const nextNum = proposals.length + 1;
    const proposalNumber = `PROP-${String(nextNum).padStart(3, '0')}`;
    createProposalMutation.mutate(
      {
        client_name: formData.client_name,
        proposal_number: proposalNumber,
        value: parseFloat(formData.value) || 0,
        payment_type: formData.payment_type || null,
        status: formData.status || 'Docs Enviados',
        property_id: formData.property_id || null,
        lead_id: formData.lead_id || null,
        notes: formData.notes || null,
        agent_id: user?.id || null,
        created_by: user?.id || null,
        current_stage: 0,
        signature_status: 'pending',
      },
      {
        onSuccess: () => {
          toast({ title: "Proposta Criada", description: `Proposta ${proposalNumber} para ${formData.client_name} criada com sucesso.` });
        },
        onError: (err: any) => {
          toast({ title: "Erro ao criar proposta", description: err?.message || "Tente novamente.", variant: "destructive" });
        },
      }
    );
  };
  const selectedProposal = proposals.find(p => p.id === selectedProposalId) || null;

  const filteredProposals = proposals.filter(p => {
    // Tab filter
    if (activeTab === 'Docs Enviados' && p.status !== 'Docs Enviados') return false;
    if (activeTab === 'Em Negociação' && !['Proposta Comprador', 'Finalizada Comprador', 'Proposta Vendedor'].includes(p.status)) return false;
    if (activeTab === 'Finalizadas' && p.status !== 'Finalizada') return false;
    // Payment filter
    if (paymentFilter && p.payment_type !== paymentFilter) return false;
    return true;
  });

  const totalValue = proposals.reduce((s, p) => s + (p.value || 0), 0);
  const docsCount = proposals.filter(p => p.status === 'Docs Enviados').length;
  const pendingSigCount = proposals.filter(p => p.signature_status === 'pending').length;

  const getStatusColorClass = (color: "blue" | "green" | "orange" | "gray") => {
    switch (color) {
      case "blue": return "text-primary";
      case "green": return "text-success";
      case "orange": return "text-accent";
      case "gray": return "text-muted-foreground";
    }
  };

  const getProgressColorClass = (color: "blue" | "green" | "orange" | "gray") => {
    switch (color) {
      case "blue": return "bg-primary";
      case "green": return "bg-success";
      case "orange": return "bg-accent";
      case "gray": return "bg-muted-foreground";
    }
  };

  const getStageColorClass = (stage: "complete" | "current" | "pending") => {
    if (stage === "complete") return "bg-success";
    if (stage === "current") return "bg-accent";
    return "bg-muted";
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="propostas"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="propostas"
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
          title="Gestão de Propostas"
          subtitle="Gerencie negociações e aprovações em tempo real"
          actionButton={
            <Button variant="cta" className="gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nova Proposta
            </Button>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Propostas Ativas</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{proposals.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
              </div>
              <p className="text-sm text-success flex items-center gap-1 mt-3">
                <ArrowUpRight className="h-3 w-3" />
                12% vs. mês anterior
              </p>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aguardando Docs</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{docsCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-warning" />
                </div>
              </div>
              <p className="text-sm text-destructive flex items-center gap-1 mt-3">
                <ArrowDownRight className="h-3 w-3" />
                5% vs. mês anterior
              </p>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aguardando Assinatura</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{pendingSigCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                →0% vs. mês anterior
              </p>
            </div>

            <div className="bg-accent rounded-xl p-5 shadow-sm text-accent-foreground relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-sm opacity-90">Valor Total em Proposta</p>
                <p className="text-3xl font-bold mt-1">{formatValue(totalValue)}</p>
                <Badge className="mt-3 bg-white/20 text-white">
                  + R$ 2.1M essa semana
                </Badge>
              </div>
              <DollarSign className="absolute right-4 top-4 h-10 w-10 opacity-20" />
            </div>
          </div>

          {/* Stages Legend */}
          <div className="bg-card rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">ESTÁGIOS DA PROPOSTA</p>
            <div className="flex flex-wrap gap-6">
              {proposalStageLabels.map((label, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.label}
                  variant={activeTab === tab.label ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.label)}
                  className={activeTab === tab.label ? "bg-foreground text-background" : ""}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={paymentFilter ? "default" : "outline"} size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {paymentFilter || "Filtrar"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPaymentFilter(null)}>
                    Todos os pagamentos
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {["Financiamento", "À Vista", "Parcelado Direto", "FGTS + Financiamento", "Permuta", "Consórcio"].map((pt) => (
                    <DropdownMenuItem key={pt} onClick={() => setPaymentFilter(pt)}>
                      {pt}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                const csv = ["Número,Cliente,Valor,Status,Pagamento", ...filteredProposals.map(p => `${p.proposal_number},${p.client_name},${p.value},${p.status},${p.payment_type || '-'}`)].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "propostas.csv"; a.click();
                URL.revokeObjectURL(url);
                toast({ title: "Exportado", description: `${filteredProposals.length} propostas exportadas.` });
              }}>
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Proposals Table */}
          <div className="bg-card rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      IMÓVEL & CLIENTE
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      VALOR PROPOSTO
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      ESTÁGIO & PROGRESSO
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      ASSINATURA
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr><td colSpan={5} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-accent" />
                      <p className="text-sm text-muted-foreground mt-2">Carregando propostas...</p>
                    </td></tr>
                  )}
                  {!isLoading && filteredProposals.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center">
                      <p className="text-muted-foreground">Nenhuma proposta encontrada.</p>
                    </td></tr>
                  )}
                  {filteredProposals.map((proposal) => {
                    const color = getStatusColor(proposal.status);
                    const stage = proposal.current_stage || 0;
                    const progress = getProgressFromStage(stage);
                    const stages = getStagesArray(stage);
                    return (
                    <tr 
                      key={proposal.id} 
                      className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedProposalId(proposal.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{proposal.property?.title || 'Imóvel não vinculado'}</p>
                            <p className="text-sm text-muted-foreground">Cliente: {proposal.client_name}</p>
                            <p className="text-xs text-accent">{proposal.proposal_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-foreground">{formatValue(proposal.value)}</p>
                        <p className="text-sm text-accent">{proposal.payment_type || '-'}</p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={cn("text-sm font-medium", getStatusColorClass(color))}>
                              {proposal.status}
                            </span>
                            <span className="text-sm text-muted-foreground">{progress}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", getProgressColorClass(color))}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {stages.map((s, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  getStageColorClass(s)
                                )}
                                title={proposalStageLabels[i]}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {proposal.signature_status === "pending" && (
                          <Badge variant="outline" className="text-warning border-warning">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                        {proposal.signature_status === "signed" && (
                          <Badge variant="outline" className="text-success border-success">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Assinado
                          </Badge>
                        )}
                        {proposal.signature_status === "na" && (
                          <Badge variant="outline" className="text-muted-foreground">
                            N/A
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {progress === 100 ? (
                            <Button variant="cta" size="sm" onClick={() => setSelectedProposalId(proposal.id)}>
                              Ver Contrato
                            </Button>
                          ) : (
                            <>
                              <Button variant="ghost" size="icon" title="Ver detalhes" onClick={() => setSelectedProposalId(proposal.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Avançar etapa" onClick={() => handleAdvanceStage(proposal)}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedProposalId(proposal.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              {(proposal.current_stage || 0) < 4 && (
                                <DropdownMenuItem onClick={() => handleAdvanceStage(proposal)}>
                                  <ChevronRight className="h-4 w-4 mr-2" />
                                  Avançar Etapa
                                </DropdownMenuItem>
                              )}
                              {proposal.signature_status === "pending" && (
                                <DropdownMenuItem onClick={() => handleSignProposal(proposal)}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Marcar como Assinada
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleCancelProposal(proposal)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar Proposta
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Mostrando {filteredProposals.length} de {proposals.length} resultados
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="default" size="sm" className="min-w-8">
                  1
                </Button>
                <Button variant="outline" size="sm" className="min-w-8">
                  2
                </Button>
                <Button variant="outline" size="sm" className="min-w-8">
                  3
                </Button>
                <span className="px-2 text-muted-foreground">...</span>
                <Button variant="outline" size="sm">
                  Próxima
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground mt-8">
            © 2024 ApeXy CRM. Todos os direitos reservados.
          </div>
        </main>
      </div>

      {/* Proposal Detail Modal — editável + deeplinks */}
      {selectedProposal && (
        <ProposalDetailModal
          proposal={selectedProposal}
          onClose={() => setSelectedProposalId(null)}
          onSave={handleUpdateProposalFields}
          isSaving={updateProposalMutation.isPending}
        />
      )}

      {/* Create Proposal Modal */}
      <CreateProposalModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onConfirm={handleCreateProposal}
      />
    </div>
  );
}
