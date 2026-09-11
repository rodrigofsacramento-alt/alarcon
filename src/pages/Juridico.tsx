import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CreateProcessoModal, type ProcessoFormData } from "@/components/juridico/CreateProcessoModal";
import {
  useProposals, useCreateProposal, useUpdateProposal,
  useProposalDocuments, useCreateProposalDocument,
  useUpdateProposalDocument, useDeleteProposalDocument,
  type Proposal,
} from "@/hooks/use-proposals";
import { useCreateSaleRecord, useSales } from "@/hooks/use-sales";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileText,
  Upload,
  MoreVertical,
  Clock,
  Pencil,
  Scale,
  Calendar,
  User,
  Phone,
  Mail,
  Filter,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Building2,
  DollarSign,
  Eye,
  Trash2,
  MessageSquare,
  ExternalLink,
  X,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Checklist items config ───
const CHECKLIST_ITEMS = [
  { id: "doc_comprador", title: "Documentos do Comprador", description: "RG, CPF, comprovante de renda e endereço" },
  { id: "certidoes", title: "Certidões Negativas", description: "Certidões cíveis, trabalhistas e fiscais" },
  { id: "matricula", title: "Matrícula Atualizada do Imóvel", description: "Matrícula do cartório de registro" },
  { id: "minuta", title: "Aprovação da Minuta do Contrato", description: "Revisão e aprovação jurídica" },
  { id: "assinatura", title: "Assinatura Digital", description: "Assinatura eletrônica das partes" },
];

// ─── Stage mapping based on current_stage field ───
const stageConfig = [
  { id: "proposta", label: "Proposta" },
  { id: "documentacao", label: "Documentação" },
  { id: "juridico", label: "Jurídico" },
  { id: "assinatura", label: "Assinatura" },
  { id: "entrega", label: "Entrega" },
];

const getStageStatus = (stageIndex: number, currentStage: number) => {
  if (stageIndex < currentStage) return "complete";
  if (stageIndex === currentStage) return "current";
  return "pending";
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Proposta Comprador": return { label: "Proposta", color: "bg-primary/10 text-primary" };
    case "Proposta Vendedor": return { label: "Proposta Vendedor", color: "bg-warning/10 text-warning" };
    case "Docs Enviados": return { label: "Documentação", color: "bg-accent/10 text-accent" };
    case "Em Análise": return { label: "Análise Jurídica", color: "bg-primary/10 text-primary" };
    case "Finalizada": return { label: "Finalizado", color: "bg-success/10 text-success" };
    default: return { label: status, color: "bg-muted text-muted-foreground" };
  }
};

export default function Juridico() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [showCommentFor, setShowCommentFor] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<{ id: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeChecklistIdRef = useRef<string | null>(null);

  const { user } = useAuth();
  const { data: proposals = [], isLoading } = useProposals();
  const createProposalMutation = useCreateProposal();
  const updateProposalMutation = useUpdateProposal();
  const { data: documents = [] } = useProposalDocuments(selectedProcessId);
  const createDocMutation = useCreateProposalDocument();
  const updateDocMutation = useUpdateProposalDocument();
  const deleteDocMutation = useDeleteProposalDocument();

  const { data: sales = [] } = useSales();
  const createSaleMutation = useCreateSaleRecord();

  const selectedProcess = proposals.find((p) => p.id === selectedProcessId) || null;

  const isSold = selectedProcess?.property?.status === 'sold' || sales.some(s => s.proposal_id === selectedProcess?.id);
  const saleRecord = sales.find(s => s.proposal_id === selectedProcess?.id);

  const handleFinalizeSale = async () => {
    if (!selectedProcess) return;
    try {
      await createSaleMutation.mutateAsync({
        proposal_id: selectedProcess.id,
        property_id: selectedProcess.property_id!,
        agent_id: selectedProcess.agent_id || user?.id || null,
        buyer_name: selectedProcess.client_name,
        sale_value: Number(selectedProcess.value),
        contract_signed_at: new Date().toISOString(),
      });
      toast({
        title: "Venda Registrada com Sucesso!",
        description: `O contrato de ${selectedProcess.client_name} foi assinado e o imóvel foi marcado como vendido.`,
      });
    } catch (err: any) {
      toast({
        title: "Erro ao registrar venda",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const filteredProposals = proposals.filter(
    (p) =>
      p.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.proposal_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get docs for a specific checklist item
  const getDocsForItem = (checklistItemId: string) =>
    documents.filter((d: any) => d.checklist_item_id === checklistItemId);

  // Count completed checklist items (items with at least one approved doc)
  const completedChecklistCount = CHECKLIST_ITEMS.filter(
    (item) => getDocsForItem(item.id).some((d: any) => d.status === 'approved')
  ).length;

  // Calculate the stage based on completed documents
  const getDocBasedStage = () => {
    let stage = 0;
    if (getDocsForItem('doc_comprador').some((d: any) => d.status === 'approved')) stage = 1;
    if (stage >= 1 && getDocsForItem('certidoes').some((d: any) => d.status === 'approved') && getDocsForItem('matricula').some((d: any) => d.status === 'approved')) stage = 2;
    if (stage >= 2 && getDocsForItem('minuta').some((d: any) => d.status === 'approved')) stage = 3;
    if (stage >= 3 && getDocsForItem('assinatura').some((d: any) => d.status === 'approved')) stage = 4;
    return stage;
  };

  const docBasedStage = selectedProcessId ? getDocBasedStage() : 0;

  // Sync proposal stage when docs change
  const syncStage = () => {
    if (!selectedProcess) return;
    const newStage = getDocBasedStage();
    if (newStage !== (selectedProcess.current_stage || 0)) {
      updateProposalMutation.mutate({ id: selectedProcess.id, current_stage: newStage });
    }
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const checklistItemId = activeChecklistIdRef.current;
    if (!file || !selectedProcess || !checklistItemId || !user) return;
    e.target.value = '';

    if (file.size > 25 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 25MB.", variant: "destructive" });
      return;
    }

    setUploadingItemId(checklistItemId);
    try {
      const ext = file.name.split('.').pop();
      const path = `${selectedProcess.id}/${checklistItemId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('legal-documents').upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('legal-documents').getPublicUrl(path);

      await createDocMutation.mutateAsync({
        proposal_id: selectedProcess.id,
        name: file.name,
        file_url: urlData.publicUrl,
        status: 'pending',
        uploaded_by: user.id,
        checklist_item_id: checklistItemId,
      });

      toast({ title: "Documento anexado!", description: `${file.name} enviado com sucesso.` });
      setTimeout(syncStage, 500);
    } catch (err: any) {
      toast({ title: "Erro ao enviar", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setUploadingItemId(null);
    }
  };

  // Approve a document
  const handleApproveDoc = async (docId: string) => {
    if (!selectedProcess) return;
    const docToApprove = documents.find((d: any) => d.id === docId);
    const isSignatureDoc = docToApprove?.checklist_item_id === 'assinatura';

    try {
      await updateDocMutation.mutateAsync({ id: docId, proposal_id: selectedProcess.id, status: 'approved' });
      toast({ title: "Documento aprovado!" });

      if (isSignatureDoc) {
        await createSaleMutation.mutateAsync({
          proposal_id: selectedProcess.id,
          property_id: selectedProcess.property_id!,
          agent_id: selectedProcess.agent_id || user?.id || null,
          buyer_name: selectedProcess.client_name,
          sale_value: Number(selectedProcess.value),
          contract_signed_at: new Date().toISOString(),
        });
        toast({
          title: "Venda Registrada com Sucesso!",
          description: `Assinatura digital aprovada. O contrato de ${selectedProcess.client_name} foi finalizado.`,
        });
      }

      setTimeout(syncStage, 500);
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message, variant: "destructive" });
    }
  };

  // Delete a document
  const handleDeleteDoc = async (docId: string) => {
    if (!selectedProcess) return;
    try {
      await deleteDocMutation.mutateAsync({ id: docId, proposal_id: selectedProcess.id });
      toast({ title: "Documento removido" });
      setTimeout(syncStage, 500);
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message, variant: "destructive" });
    }
    setOpenMenuId(null);
  };

  // Save comment on a document
  const handleSaveComment = async (docId: string) => {
    if (!selectedProcess) return;
    const text = commentInput[docId]?.trim();
    try {
      await updateDocMutation.mutateAsync({ id: docId, proposal_id: selectedProcess.id, comment: text || null });
      toast({ title: "Comentário salvo!" });
      setShowCommentFor(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message, variant: "destructive" });
    }
  };

  // Rename document
  const handleRenameDoc = async () => {
    if (!editingDoc || !selectedProcess) return;
    try {
      await updateDocMutation.mutateAsync({ id: editingDoc.id, proposal_id: selectedProcess.id, name: editingDoc.name });
      toast({ title: "Nome atualizado!" });
      setEditingDoc(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message, variant: "destructive" });
    }
    setOpenMenuId(null);
  };

  const handleCreateProcesso = (formData: ProcessoFormData) => {
    const nextNum = proposals.length + 1;
    const proposalNumber = `PROP-${String(nextNum).padStart(3, '0')}`;
    const contractLabel =
      formData.contract_type === "compra_venda" ? "Compra e Venda"
      : formData.contract_type === "locacao" ? "Locação"
      : formData.contract_type === "permuta" ? "Permuta"
      : formData.contract_type;

    createProposalMutation.mutate(
      {
        client_name: formData.buyer_name,
        proposal_number: proposalNumber,
        value: parseFloat(formData.value) || 0,
        payment_type: contractLabel,
        status: "Docs Enviados",
        property_id: formData.property_id || null,
        lead_id: formData.lead_id || null,
        notes: `[Jurídico] ${contractLabel}\nVendedor: ${formData.seller_name}\nAdvogado: ${formData.responsible_lawyer}\nPrioridade: ${formData.priority}\n${formData.notes}`,
        agent_id: user?.id || null,
        created_by: user?.id || null,
        current_stage: 0,
        signature_status: "pending",
      },
      {
        onSuccess: () => {
          toast({ title: "Processo Criado", description: `Contrato de ${contractLabel} para ${formData.buyer_name} criado com sucesso.` });
        },
        onError: (err: any) => {
          toast({ title: "Erro ao criar processo", description: err?.message || "Tente novamente.", variant: "destructive" });
        },
      }
    );
  };

  // ─── PROCESS LIST VIEW ───
  const renderProcessList = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Processos</p>
              <p className="text-2xl font-bold text-foreground mt-1">{proposals.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Scale className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold text-foreground mt-1">{proposals.filter((p) => p.status !== "Finalizada").length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Finalizados</p>
              <p className="text-2xl font-bold text-foreground mt-1">{proposals.filter((p) => p.status === "Finalizada").length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(proposals.reduce((s, p) => s + Number(p.value), 0))}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por cliente ou número do processo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Process Cards */}
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        )}
        {!isLoading && filteredProposals.length === 0 && (
          <div className="bg-card rounded-xl p-12 text-center shadow-sm">
            <Scale className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">Nenhum processo jurídico encontrado.</p>
            <Button variant="cta" className="mt-4 gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Criar Primeiro Processo
            </Button>
          </div>
        )}
        {filteredProposals.map((proposal) => {
          const badge = getStatusBadge(proposal.status);
          const stage = proposal.current_stage || 0;
          const progress = Math.min(((stage + 1) / 5) * 100, 100);
          return (
            <button
              key={proposal.id}
              onClick={() => setSelectedProcessId(proposal.id)}
              className="w-full bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-left border border-transparent hover:border-accent/20"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {proposal.client_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground truncate">{proposal.client_name}</p>
                    <Badge className={cn("text-xs shrink-0", badge.color)}>{badge.label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-mono">{proposal.proposal_number}</span>
                    <span>•</span>
                    <span>{proposal.payment_type || "N/A"}</span>
                    <span>•</span>
                    <span>{formatDate(proposal.created_at)}</span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{stageConfig[stage]?.label}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-foreground">{formatCurrency(Number(proposal.value))}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto mt-1" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── CONTRACT DETAIL VIEW ───
  const renderContractDetail = () => {
    if (!selectedProcess) return null;

    return (
      <div className="space-y-6">
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />

        {/* Rename modal */}
        {editingDoc && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setEditingDoc(null)}>
            <div className="bg-card rounded-xl p-6 w-[400px] shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold text-foreground mb-4">Renomear Documento</h3>
              <input
                type="text"
                value={editingDoc.name}
                onChange={(e) => setEditingDoc({ ...editingDoc, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleRenameDoc()}
              />
              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="outline" size="sm" onClick={() => setEditingDoc(null)}>Cancelar</Button>
                <Button variant="cta" size="sm" onClick={handleRenameDoc}>Salvar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Back button */}
        <Button variant="ghost" className="gap-2 -ml-2" onClick={() => setSelectedProcessId(null)}>
          <ArrowLeft className="h-4 w-4" />
          Voltar para processos
        </Button>

        <div className="flex gap-6">
          <div className="flex-1 space-y-6">
            {/* Contract Progress — synced with documents */}
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Progresso do Contrato</h2>
                <Badge className="bg-primary/10 text-primary border border-primary/20">
                  {stageConfig[docBasedStage]?.label || "Proposta"}
                </Badge>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  {stageConfig.map((stage, index) => {
                    const status = getStageStatus(index, docBasedStage);
                    return (
                      <div key={stage.id} className="flex flex-col items-center relative z-10">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                          status === "complete" ? "bg-success text-success-foreground"
                          : status === "current" ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                        )}>
                          {status === "complete" ? <CheckCircle2 className="h-5 w-5" />
                          : status === "current" ? <Scale className="h-5 w-5" />
                          : <span className="text-sm">◎</span>}
                        </div>
                        <span className={cn("text-sm font-medium mt-2", status === "current" ? "text-accent" : "text-foreground")}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                  <div className="h-full bg-success transition-all" style={{ width: `${(docBasedStage / 4) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Validation Checklist — with document attachment */}
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <h2 className="text-lg font-semibold text-foreground">Checklist de Validação</h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  <strong>{completedChecklistCount}</strong> de {CHECKLIST_ITEMS.length} concluídos
                </span>
              </div>
              <div className="space-y-3">
                {CHECKLIST_ITEMS.map((item) => {
                  const itemDocs = getDocsForItem(item.id);
                  const hasApproved = itemDocs.some((d: any) => d.status === 'approved');
                  const hasPending = itemDocs.some((d: any) => d.status === 'pending');
                  const isUploading = uploadingItemId === item.id;

                  return (
                    <div key={item.id} className={cn(
                      "rounded-lg border transition-colors",
                      hasApproved ? "border-success/30 bg-success/5" : hasPending ? "border-warning/30 bg-warning/5" : "border-border"
                    )}>
                      {/* Card header — clickable to attach */}
                      <div className="flex items-start gap-3 p-4">
                        {hasApproved ? <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                        : hasPending ? <Clock className="h-5 w-5 text-warning mt-0.5" />
                        : <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                          {itemDocs.length > 0 && (
                            <p className="text-xs text-accent mt-1">{itemDocs.length} documento(s) anexado(s)</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 shrink-0"
                          disabled={isUploading}
                          onClick={() => {
                            activeChecklistIdRef.current = item.id;
                            fileInputRef.current?.click();
                          }}
                        >
                          {isUploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Paperclip className="h-3 w-3" />
                          )}
                          {isUploading ? 'Enviando...' : 'Anexar'}
                        </Button>
                      </div>

                      {/* Attached documents for this checklist item */}
                      {itemDocs.length > 0 && (
                        <div className="border-t border-border/50 bg-muted/20">
                          {itemDocs.map((doc: any) => (
                            <div key={doc.id} className="px-4 py-3 border-b border-border/30 last:border-0">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-accent shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Badge className={cn(
                                      "text-[10px] px-1.5 py-0",
                                      doc.status === 'approved' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                    )}>
                                      {doc.status === 'approved' ? 'Aprovado' : 'Pendente'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : ''}
                                    </span>
                                  </div>
                                  {/* Comment display */}
                                  {doc.comment && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">💬 {doc.comment}</p>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                  {doc.status === 'pending' && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Aprovar" onClick={() => handleApproveDoc(doc.id)}>
                                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                    </Button>
                                  )}
                                  {doc.file_url && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Visualizar" onClick={() => window.open(doc.file_url, '_blank')}>
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Comentar"
                                    onClick={() => {
                                      setShowCommentFor(showCommentFor === doc.id ? null : doc.id);
                                      setCommentInput((prev) => ({ ...prev, [doc.id]: doc.comment || '' }));
                                    }}
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                  </Button>

                                  {/* 3-dot menu */}
                                  <div className="relative">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}>
                                      <MoreVertical className="h-3.5 w-3.5" />
                                    </Button>
                                    {openMenuId === doc.id && (
                                      <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                                        <button
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2"
                                          onClick={() => { setEditingDoc({ id: doc.id, name: doc.name }); setOpenMenuId(null); }}
                                        >
                                          <Pencil className="h-3 w-3" /> Renomear
                                        </button>
                                        {doc.file_url && (
                                          <button
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2"
                                            onClick={() => { window.open(doc.file_url, '_blank'); setOpenMenuId(null); }}
                                          >
                                            <ExternalLink className="h-3 w-3" /> Abrir Arquivo
                                          </button>
                                        )}
                                        <button
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2 text-destructive"
                                          onClick={() => handleDeleteDoc(doc.id)}
                                        >
                                          <Trash2 className="h-3 w-3" /> Excluir
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Comment input */}
                              {showCommentFor === doc.id && (
                                <div className="mt-2 flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Adicionar comentário..."
                                    value={commentInput[doc.id] || ''}
                                    onChange={(e) => setCommentInput((prev) => ({ ...prev, [doc.id]: e.target.value }))}
                                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveComment(doc.id)}
                                    autoFocus
                                  />
                                  <Button size="sm" variant="cta" onClick={() => handleSaveComment(doc.id)}>Salvar</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setShowCommentFor(null)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-[340px] space-y-6">
            {/* Transaction Details */}
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">DETALHES DA TRANSAÇÃO</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor do Imóvel</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(Number(selectedProcess.value))}</p>
                </div>
                <div className="flex gap-8">
                  <div>
                    <p className="text-sm text-muted-foreground">Comissão (5%)</p>
                    <p className="text-lg font-semibold text-accent">{formatCurrency(Number(selectedProcess.value) * 0.05)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="text-lg font-semibold text-foreground">{selectedProcess.payment_type || "N/A"}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Cliente</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {selectedProcess.client_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{selectedProcess.client_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedProcess.proposal_number}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Summary */}
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3">RESUMO DOCUMENTOS</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total anexados</span>
                  <span className="font-medium">{documents.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aprovados</span>
                  <span className="font-medium text-success">{documents.filter((d: any) => d.status === 'approved').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pendentes</span>
                  <span className="font-medium text-warning">{documents.filter((d: any) => d.status === 'pending').length}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${documents.length > 0 ? (documents.filter((d: any) => d.status === 'approved').length / documents.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedProcess.notes && (
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3">OBSERVAÇÕES</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedProcess.notes}</p>
              </div>
            )}

            {/* Registro de Venda e Assinatura */}
            <div className={cn(
              "bg-card rounded-xl p-6 shadow-sm border transition-all",
              isSold ? "border-success/30 bg-success/5" : "border-border hover:border-accent/30"
            )}>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Building2 className={cn("h-4 w-4", isSold ? "text-success" : "text-muted-foreground")} />
                REGISTRO DE VENDA
              </h3>
              
              {isSold ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-success/10 text-success hover:bg-success/20 border border-success/30 font-medium">
                      ✓ Venda Finalizada
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este imóvel foi registrado como **Vendido** no catálogo.
                  </p>
                  {saleRecord && (
                    <div className="mt-2 pt-2 border-t border-success/10 space-y-1.5 text-xs text-muted-foreground text-left">
                      <div className="flex justify-between">
                        <span>Data:</span>
                        <span className="font-medium text-foreground">
                          {saleRecord.contract_signed_at ? new Date(saleRecord.contract_signed_at).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor de Venda:</span>
                        <span className="font-medium text-foreground">{formatCurrency(Number(saleRecord.sale_value))}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-warning/10 text-warning border border-warning/30 font-medium">
                      Aguardando Fechamento
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ao assinar o contrato, você pode registrar a venda para atualizar o status do imóvel e gerar o comissionamento.
                  </p>
                  <Button 
                    variant="cta" 
                    className="w-full text-xs font-semibold py-2 h-auto gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/10 hover:shadow-amber-600/20 active:scale-95 transition-all text-white border-0"
                    onClick={handleFinalizeSale}
                    disabled={createSaleMutation.isPending}
                  >
                    {createSaleMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Confirmar Assinatura e Venda
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeModule="juridico" onModuleChange={() => {}} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <MobileSidebar activeModule="juridico" onModuleChange={() => {}} open={mobileOpen} onOpenChange={setMobileOpen} />

      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <Header
          title={selectedProcess ? `${selectedProcess.payment_type || "Contrato"} - ${selectedProcess.proposal_number}` : "Jurídico"}
          subtitle={selectedProcess ? `${selectedProcess.client_name} • ${formatCurrency(Number(selectedProcess.value))}` : "Gerencie processos jurídicos e contratos"}
          actionButton={
            <Button variant="cta" className="gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Processo
            </Button>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
          {selectedProcess ? renderContractDetail() : renderProcessList()}
        </main>
      </div>

      <CreateProcessoModal open={isCreateOpen} onOpenChange={setIsCreateOpen} onConfirm={handleCreateProcesso} />
    </div>
  );
}
