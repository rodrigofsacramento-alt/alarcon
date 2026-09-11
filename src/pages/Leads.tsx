import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useLeads, useCreateLead, useUpdateLead, useLeadTimeline } from "@/hooks/use-leads";
import { useProperties } from "@/hooks/use-properties";
import { useAgents } from "@/hooks/use-agents";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Filter,
  Calendar,
  ExternalLink,
  Link2,
  X,
  Phone,
  MessageSquare,
  MoreHorizontal,
  ThumbsUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  MapPin,
  ChevronDown,
  Upload,
  Tag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateLeadModal, LeadFormData } from "@/components/leads/CreateLeadModal";
import { ImportLeadsModal } from "@/components/leads/ImportLeadsModal";
import LeadPipeline from "@/components/leads/LeadPipeline";
import { Loader2 } from "lucide-react";

// Convert internal score (0-100) to SDR (1-10)
const scoreToSDR = (score: number): number => {
  if (score <= 10) return 1;
  if (score <= 20) return 2;
  if (score <= 30) return 3;
  if (score <= 40) return 4;
  if (score <= 50) return 5;
  if (score <= 60) return 6;
  if (score <= 70) return 7;
  if (score <= 80) return 8;
  if (score <= 90) return 9;
  return 10;
};

// Helper to format SLA status text
const getSlaText = (status: string | null): string => {
  switch (status) {
    case 'ok': return 'No prazo';
    case 'warning': return 'Atenção';
    case 'critical': return 'Crítico';
    case 'expired': return 'Expirado';
    default: return 'No prazo';
  }
};

// Helper to format date
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return 'Agora';
  if (diffHours < 24) return 'Hoje';
  if (diffHours < 48) return 'Ontem';
  return date.toLocaleDateString('pt-BR');
};

const formatTime = (dateStr: string | null): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};


const stages = [
  "Todos",
  "Lead Cadastrado",
  "Primeiro Atendimento",
  "Follow-up",
  "Agendamento de Visita",
  "Visita Agendada",
  "Imóvel Escolhido",
  "Em Aprovação de Correspondência",
  "Proposta Solicitada",
];

const sources = [
  "Viva Real",
  "ZAP Imóveis",
  "OLX",
  "Facebook Ads",
  "Instagram Ads",
  "Google Ads",
  "WhatsApp",
  "Site",
  "Indicação",
  "Outros",
];

export default function Leads() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isPhoneRestricted } = useAuth();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [mainView, setMainView] = useState<"lista" | "pipeline">("lista");
  const [activeTab, setActiveTab] = useState<"timeline" | "dados" | "notas">("timeline");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("Todos");
  const [sourceFilter, setSourceFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [groupFilter, setGroupFilter] = useState("");
  const [uniqueGroups, setUniqueGroups] = useState<string[]>([]);

  // Real data hooks
  const { data: leads = [], isLoading, error: leadsError } = useLeads({
    search: searchQuery || undefined,
    stage: stageFilter !== "Todos" ? stageFilter : undefined,
    source: sourceFilter || undefined,
    agent: agentFilter !== "all" ? agentFilter : undefined,
    group: groupFilter || undefined,
  });

  useEffect(() => {
    supabase.from('leads').select('tags').not('tags', 'is', null).then(({ data }) => {
      if (data) {
        const allTags = data.flatMap(d => Array.isArray(d.tags) ? d.tags : []);
        const groups = Array.from(new Set(allTags.filter(Boolean)));
        setUniqueGroups(groups as string[]);
      }
    });
  }, []);

  const clearFilters = () => {
    setStageFilter("Todos");
    setSourceFilter("");
    setAgentFilter("all");
    setSearchQuery("");
    setGroupFilter("");
  };

  const hasActiveFilters = stageFilter !== "Todos" || !!sourceFilter || !!searchQuery || agentFilter !== "all" || !!groupFilter;
  const { data: timeline = [] } = useLeadTimeline(selectedLeadId);
  const { data: propertiesRaw = [] } = useProperties();
  const { data: agents = [] } = useAgents();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();

  const availableProperties = propertiesRaw.map(p => ({
    id: p.code || p.id,
    title: p.title,
    location: p.location,
    price: p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
  }));

  // Open create modal when navigating with ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsCreateModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const state = location.state as { selectedLeadId?: string } | null;
    if (state?.selectedLeadId) {
      setSelectedLeadId(state.selectedLeadId);
    }
  }, [location.state]);

  const selectedLead = leads.find(l => l.id === selectedLeadId) || null;

  const getSlaStyles = (status: string | null) => {
    switch (status) {
      case "ok":
        return { bg: "bg-success/10", text: "text-success", icon: <CheckCircle2 className="h-3 w-3" /> };
      case "warning":
        return { bg: "bg-warning/10", text: "text-warning", icon: <Clock className="h-3 w-3" /> };
      case "critical":
        return { bg: "bg-destructive/10", text: "text-destructive", icon: <AlertTriangle className="h-3 w-3" /> };
      case "expired":
        return { bg: "bg-destructive/10", text: "text-destructive", icon: <AlertTriangle className="h-3 w-3" /> };
      default:
        return { bg: "bg-success/10", text: "text-success", icon: <CheckCircle2 className="h-3 w-3" /> };
    }
  };

  const getSDRColor = (sdr: number) => {
    if (sdr >= 8) return "border-success text-success";
    if (sdr >= 5) return "border-warning text-warning";
    return "border-muted-foreground text-muted-foreground";
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4 text-primary" />;
      case "status":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "lead_created":
        return <User className="h-4 w-4 text-accent" />;
      case "edit":
        return <Pencil className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleCreateLead = (formData: LeadFormData) => {
    createLeadMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      stage: formData.stage,
      source: formData.source,
      budget: formData.budget,
      interest: formData.interest,
      location: formData.propertyLocation,
      notes: formData.history,
      created_by: user?.id,
    }, {
      onSuccess: (data) => {
        setSelectedLeadId(data.id);
      },
    });
  };

  const assumirLead = (lead: typeof leads[number]) => {
    updateLeadMutation.mutate({
      id: lead.id,
      responsible_id: user?.id,
    }, {
      onSuccess: () => {
        supabase.from('lead_timeline').insert({
          lead_id: lead.id,
          type: 'status',
          title: 'Lead Assumido',
          description: `Lead assumido pelo corretor.`,
          user_id: user?.id,
        }).then(() => {});
      }
    });
  };

  const handleEditLead = () => {
    if (!selectedLead || !editFormData) return;
    const isTransfer = selectedLead.responsible_id !== editFormData.responsible_id && editFormData.responsible_id !== undefined;
    const newAgent = agents.find(a => a.id === editFormData.responsible_id)?.full_name || 'Nenhum';

    updateLeadMutation.mutate({
      id: selectedLead.id,
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      stage: editFormData.stage,
      source: editFormData.source,
      budget: editFormData.budget,
      interest: editFormData.interest,
      location: editFormData.location,
      notes: editFormData.notes,
      responsible_id: editFormData.responsible_id,
    }, {
      onSuccess: () => {
        if (isTransfer) {
          supabase.from('lead_timeline').insert({
            lead_id: selectedLead.id,
            type: 'status',
            title: 'Lead Transferido',
            description: `Lead transferido para ${newAgent} pelo Administrador.`,
            user_id: user?.id,
          }).then(() => {});
        }
        setIsEditing(false);
        setEditFormData({});
        toast({
          title: "Sucesso",
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Lead atualizado com sucesso.</span>
            </div>
          ),
        });
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar",
          description: err.message || "Ocorreu um erro ao atualizar o lead.",
        });
      }
    });
  };

  const startEditing = () => {
    if (selectedLead) {
      setEditFormData({
        name: selectedLead.name,
        email: selectedLead.email,
        phone: selectedLead.phone,
        stage: selectedLead.stage,
        budget: selectedLead.budget,
        interest: selectedLead.interest,
        location: selectedLead.location,
        source: selectedLead.source,
        whatsapp_group: selectedLead.whatsapp_group,
        notes: selectedLead.notes,
        responsible_id: selectedLead.responsible_id,
      });
      setIsEditing(true);
      setActiveTab("dados");
    }
  };

  const startEditingLead = (lead: typeof leads[number]) => {
    setSelectedLeadId(lead.id);
    setEditFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      stage: lead.stage,
      budget: lead.budget,
      interest: lead.interest,
      location: lead.location,
      source: lead.source,
      whatsapp_group: lead.whatsapp_group,
      notes: lead.notes,
      responsible_id: lead.responsible_id,
    });
    setIsEditing(true);
    setActiveTab("dados");
  };

  const openAtendimentoForLead = (lead: typeof leads[number]) => {
    const search = lead.phone || lead.email || lead.name;
    navigate(`/atendimento?search=${encodeURIComponent(search || '')}`, {
      state: { leadId: lead.id, leadName: lead.name, leadPhone: lead.phone, leadEmail: lead.email },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="leads"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="leads"
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
          title="Leads"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Gerenciamento" },
          ]}
          actionButton={
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="h-4 w-4" />
                Importar
              </Button>
              <Button variant="cta" className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Cadastrar Lead
              </Button>
            </div>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
          <div className="flex gap-6">
            {/* Main Content */}
            <div className={cn("flex-1 transition-all", selectedLead && "lg:pr-[380px]")}>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {/* Stage Filter */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => { setShowStageDropdown(!showStageDropdown); setShowSourceDropdown(false); setShowAgentDropdown(false); }}
                  >
                    <Filter className="h-4 w-4" />
                    Status: {stageFilter}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  {showStageDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                      {stages.map((stage) => (
                        <button
                          key={stage}
                          onClick={() => { setStageFilter(stage); setShowStageDropdown(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors",
                            stageFilter === stage && "bg-accent/10 text-accent font-medium"
                          )}
                        >
                          {stage}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Source Filter */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => { setShowSourceDropdown(!showSourceDropdown); setShowStageDropdown(false); setShowAgentDropdown(false); }}
                  >
                    <Link2 className="h-4 w-4" />
                    {sourceFilter ? `Fonte: ${sourceFilter}` : 'Fonte'}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  {showSourceDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                      <button
                        onClick={() => { setSourceFilter(""); setShowSourceDropdown(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors",
                          !sourceFilter && "bg-accent/10 text-accent font-medium"
                        )}
                      >
                        Todas
                      </button>
                      {sources.map((source) => (
                        <button
                          key={source}
                          onClick={() => { setSourceFilter(source); setShowSourceDropdown(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors",
                            sourceFilter === source && "bg-accent/10 text-accent font-medium"
                          )}
                        >
                          {source}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Agent Filter */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => { setShowAgentDropdown(!showAgentDropdown); setShowStageDropdown(false); setShowSourceDropdown(false); setShowGroupDropdown(false); }}
                  >
                    <User className="h-4 w-4" />
                    {agentFilter !== "all" ? `Corretor: ${agents.find(a => a.id === agentFilter)?.full_name || 'Desconhecido'}` : 'Corretor'}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  {showAgentDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                      <button
                        onClick={() => { setAgentFilter("all"); setShowAgentDropdown(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors",
                          agentFilter === "all" && "bg-accent/10 text-accent font-medium"
                        )}
                      >
                        Todos
                      </button>
                      {agents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => { setAgentFilter(agent.id); setShowAgentDropdown(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors",
                            agentFilter === agent.id && "bg-accent/10 text-accent font-medium"
                          )}
                        >
                          {agent.full_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Group Filter */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => { setShowGroupDropdown(!showGroupDropdown); setShowAgentDropdown(false); setShowStageDropdown(false); setShowSourceDropdown(false); }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {groupFilter ? `Grupo: ${groupFilter}` : 'Grupo'}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  {showGroupDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                      <button
                        onClick={() => { setGroupFilter(""); setShowGroupDropdown(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors",
                          !groupFilter && "bg-accent/10 text-accent font-medium"
                        )}
                      >
                        Todos
                      </button>
                      {uniqueGroups.map((group) => (
                        <button
                          key={group}
                          onClick={() => { setGroupFilter(group); setShowGroupDropdown(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors",
                            groupFilter === group && "bg-accent/10 text-accent font-medium"
                          )}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-accent hover:underline">
                    Limpar filtros
                  </button>
                )}
              </div>

              {/* View Tabs */}
              <div className="flex border-b border-border mb-4">
                {(["lista", "pipeline"] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setMainView(view)}
                    className={cn(
                      "px-6 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                      mainView === view
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {view === "lista" ? "Lista" : "Pipeline"}
                  </button>
                ))}
              </div>

              {mainView === "pipeline" ? (
                <LeadPipeline 
                  onSelectLead={(id) => setSelectedLeadId(id)} 
                  filters={{
                    search: searchQuery || undefined,
                    stage: stageFilter !== "Todos" ? stageFilter : undefined,
                    source: sourceFilter || undefined,
                    agent: agentFilter !== "all" ? agentFilter : undefined,
                  }}
                />
              ) : (
              /* Leads Table */
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="w-10 p-4">
                          <input type="checkbox" className="rounded border-border" />
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          LEAD / CONTATO
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          SDR
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          STATUS / SLA
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          RESPONSÁVEL
                        </th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                          AÇÕES
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading && (
                        <tr><td colSpan={6} className="p-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-accent" />
                          <p className="text-sm text-muted-foreground mt-2">Carregando leads...</p>
                        </td></tr>
                      )}
                      {!isLoading && leads.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center">
                          <p className="text-muted-foreground">Nenhum lead encontrado.</p>
                          <Button variant="cta" className="mt-3 gap-2" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="h-4 w-4" /> Cadastrar Primeiro Lead
                          </Button>
                        </td></tr>
                      )}
                      {leads.map((lead) => {
                        const slaStyles = getSlaStyles(lead.sla_status);
                        const sdr = scoreToSDR(lead.score || 50);
                        return (
                          <tr
                            key={lead.id}
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setIsEditing(false);
                            }}
                            className={cn(
                              "border-b border-border cursor-pointer transition-colors hover:bg-muted/50",
                              selectedLead?.id === lead.id && "bg-accent/5"
                            )}
                          >
                            <td className="p-4">
                              <input
                                type="checkbox"
                                className="rounded border-border"
                                checked={selectedLead?.id === lead.id}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => {}}
                              />
                            </td>
                            <td className="p-4 min-w-[420px]">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-11 w-11 shrink-0">
                                  <AvatarFallback className="bg-muted text-muted-foreground">
                                    {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-foreground leading-tight">{lead.name}</p>
                                    {lead.source && (
                                      <Badge variant="outline" className="h-5 rounded-full bg-muted/40 px-2 text-[11px] font-medium text-muted-foreground">
                                        <Link2 className="mr-1 h-3 w-3" />
                                        {lead.source}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    {isPhoneRestricted ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        [Oculto]
                                      </span>
                                    ) : lead.phone ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {lead.phone}
                                      </span>
                                    ) : null}
                                    {lead.email && (
                                      <span className="inline-flex items-center gap-1 truncate">
                                        <Mail className="h-3 w-3" />
                                        {lead.email}
                                      </span>
                                    )}
                                    {lead.location && (
                                      <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {lead.location}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {lead.tags && Array.isArray(lead.tags) && lead.tags.map((tag: string, idx: number) => (
                                      <Badge key={`tag-${idx}`} variant="default" className="rounded-full px-2 py-0 text-[11px] bg-accent/90 hover:bg-accent text-white border-transparent">
                                        <Tag className="mr-1 h-3 w-3" />
                                        {tag}
                                      </Badge>
                                    ))}
                                    {lead.interest && (
                                      <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">
                                        {lead.interest}
                                      </Badge>
                                    )}
                                    {lead.budget && (
                                      <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">
                                        {lead.budget}
                                      </Badge>
                                    )}
                                    {lead.whatsapp_group && (
                                      <Badge variant="outline" className="rounded-full px-2 py-0 text-[11px] border-[#25D366] text-[#25D366] bg-[#25D366]/10">
                                        Grupo: {lead.whatsapp_group}
                                      </Badge>
                                    )}
                                    <span className="text-[11px] text-muted-foreground">
                                      Criado {formatDate(lead.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div
                                className={cn(
                                  "inline-flex items-center justify-center h-10 w-10 rounded-full border-2 font-semibold text-sm",
                                  getSDRColor(sdr)
                                )}
                              >
                                {sdr >= 8 && <ThumbsUp className="h-3 w-3 mr-0.5" />}
                                {sdr}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                                  {lead.stage}
                                </Badge>
                                <div className={cn("flex items-center gap-1 text-xs", slaStyles.text)}>
                                  {slaStyles.icon}
                                  {getSlaText(lead.sla_status)}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              {lead.responsible ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="h-7 bg-primary/10 text-primary border-primary/20 gap-1.5 pl-1 pr-2.5 rounded-full hover:bg-primary/20 transition-colors cursor-default">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                                        {lead.responsible.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-bold">{lead.responsible.full_name}</span>
                                  </Badge>
                                </div>
                              ) : (
                                <Badge variant="outline" className="h-7 text-muted-foreground border-dashed bg-muted/30">
                                  Sem responsável
                                </Badge>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openAtendimentoForLead(lead);
                                  }}
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  Atendimento
                                </Button>
                                {!isPhoneRestricted && lead.phone && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      window.location.href = `tel:${lead.phone}`;
                                    }}
                                    title="Ligar"
                                  >
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    startEditingLead(lead);
                                  }}
                                  title="Editar lead"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedLeadId(lead.id);
                                    setIsEditing(false);
                                  }}
                                  title="Abrir detalhes"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
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
                    Mostrando <strong>1-{leads.length}</strong> de <strong>{leads.length}</strong> leads
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" disabled>
                      Anterior
                    </Button>
                    <Button variant="default" size="sm" className="min-w-8">
                      1
                    </Button>
                    <Button variant="outline" size="sm">
                      Próximo
                    </Button>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Lead Detail Panel - Overlay on mobile, fixed on desktop */}
            {selectedLead && (
              <>
                {/* Backdrop for mobile/tablet */}
                <div
                  className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                  onClick={() => setSelectedLeadId(null)}
                />
                <div className="fixed right-0 top-0 h-screen w-[min(380px,90vw)] bg-card border-l border-border shadow-xl overflow-y-auto z-50 animate-in slide-in-from-right duration-300">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-muted text-lg">
                          {selectedLead.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {selectedLead.name}
                        </h3>
                        {selectedLead.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <span className="text-accent">●</span>
                            {selectedLead.location}
                          </p>
                        )}
                        <div className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium mt-1 px-2 py-0.5 rounded",
                          getSDRColor(scoreToSDR(selectedLead.score || 50))
                        )}>
                          SDR: {scoreToSDR(selectedLead.score || 50)}/10
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedLeadId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-6">
                    {(!selectedLead.responsible_id && profile?.role === 'agent') && (
                      <Button className="flex-1 gap-2" variant="cta" onClick={() => assumirLead(selectedLead)}>
                        <User className="h-4 w-4" />
                        Assumir Lead
                      </Button>
                    )}
                    <Button className="flex-1 gap-2" variant="outline" onClick={() => openAtendimentoForLead(selectedLead)}>
                      <MessageSquare className="h-4 w-4" />
                      Atendimento
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      variant="outline"
                      disabled={!selectedLead.phone}
                      onClick={() => {
                        if (selectedLead.phone) window.location.href = `tel:${selectedLead.phone}`;
                      }}
                    >
                      <Phone className="h-4 w-4" />
                      Ligar
                    </Button>
                    <Button variant="outline" size="icon" onClick={startEditing}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-border mb-4">
                    {(["timeline", "dados", "notas"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                          activeTab === tab
                            ? "border-accent text-accent"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Timeline Tab */}
                  {activeTab === "timeline" && (
                    <div className="space-y-4">
                      {timeline.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento registrado.</p>
                      )}
                      {timeline.map((event, index) => (
                        <div key={event.id} className="relative pl-6">
                          {index < timeline.length - 1 && (
                            <div className="absolute left-[7px] top-6 bottom-0 w-px bg-border" />
                          )}
                          <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-muted flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-border" />
                          </div>
                          
                          <div className="pb-4">
                            <p className="text-xs text-muted-foreground mb-1">
                              {formatDate(event.created_at)}, {formatTime(event.created_at)}
                            </p>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                {getTimelineIcon(event.type)}
                                <span className="font-medium text-sm text-foreground">
                                  {event.title}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {event.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dados Tab */}
                  {activeTab === "dados" && (
                    <div className="space-y-4">
                      {isEditing ? (
                        <>
                          <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input
                              value={editFormData.name || ""}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              value={editFormData.email || ""}
                              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input
                              value={editFormData.phone || ""}
                              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Estágio</Label>
                            <Select
                              value={editFormData.stage}
                              onValueChange={(v) => setEditFormData({ ...editFormData, stage: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {stages.slice(1).map((stage) => (
                                  <SelectItem key={stage} value={stage}>
                                    {stage}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Origem</Label>
                            <Select
                              value={editFormData.source}
                              onValueChange={(v) => setEditFormData({ ...editFormData, source: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sources.map((source) => (
                                  <SelectItem key={source} value={source}>
                                    {source}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Grupo WhatsApp</Label>
                            <Input
                              value={editFormData.whatsapp_group || ""}
                              onChange={(e) => setEditFormData({ ...editFormData, whatsapp_group: e.target.value })}
                              placeholder="Ex: Bloco A (Vermelho)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Orçamento</Label>
                            <Input
                              value={editFormData.budget || ""}
                              onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Interesse</Label>
                            <Input
                              value={editFormData.interest || ""}
                              onChange={(e) => setEditFormData({ ...editFormData, interest: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Imóvel de Interesse</Label>
                            <Input
                              value={editFormData.propertyCode || ""}
                              onChange={(e) => setEditFormData({ ...editFormData, propertyCode: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Localização</Label>
                            <Input
                              value={editFormData.location || ""}
                              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Histórico</Label>
                            <Textarea
                              value={editFormData.history || ""}
                              onChange={(e) => setEditFormData({ ...editFormData, history: e.target.value })}
                              rows={3}
                            />
                          </div>
                          {(profile?.role === "admin" || profile?.role === "manager") && (
                            <div className="space-y-2 border-t pt-2 mt-2 border-border/50">
                              <Label className="text-primary font-medium">Transferir Lead (Apenas Admin/Gerente)</Label>
                              <Select
                                value={editFormData.responsible_id || "unassigned"}
                                onValueChange={(v) => setEditFormData({ ...editFormData, responsible_id: v === "unassigned" ? null : v })}
                              >
                                <SelectTrigger className="bg-muted/30">
                                  <SelectValue placeholder="Selecione o Corretor" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">Nenhum (Livre)</SelectItem>
                                  {agents.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                      {agent.full_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                              Cancelar
                            </Button>
                            <Button variant="cta" onClick={handleEditLead} className="flex-1">
                              Salvar
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Email</p>
                              <p className="text-sm font-medium">{selectedLead.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Telefone</p>
                              <p className="text-sm font-medium">{selectedLead.phone || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Origem</p>
                              <p className="text-sm font-medium">{selectedLead.source}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Estágio</p>
                              <p className="text-sm font-medium">{selectedLead.stage}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Orçamento</p>
                              <p className="text-sm font-medium">{selectedLead.budget || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Grupo</p>
                              <p className="text-sm font-medium text-[#25D366]">{selectedLead.tags && Array.isArray(selectedLead.tags) && selectedLead.tags.length > 0 ? selectedLead.tags.join(', ') : "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">SDR</p>
                              <p className="text-sm font-medium">{scoreToSDR(selectedLead.score || 50)}/10</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Imóvel</p>
                              <p className="text-sm font-medium">{selectedLead.property_id || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Data Cadastro</p>
                              <p className="text-sm font-medium">{selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString('pt-BR') : '-'}</p>
                            </div>
                          </div>
                          {selectedLead.interest && (
                            <div className="pt-4 border-t border-border">
                              <p className="text-xs text-muted-foreground">Interesse</p>
                              <p className="text-sm font-medium">{selectedLead.interest}</p>
                            </div>
                          )}
                          {selectedLead.notes && (
                            <div className="pt-4 border-t border-border">
                              <p className="text-xs text-muted-foreground">Notas</p>
                              <p className="text-sm">{selectedLead.notes}</p>
                            </div>
                          )}
                          <Button variant="outline" className="w-full mt-4" onClick={startEditing}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar Dados
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Notas Tab */}
                  {activeTab === "notas" && (
                    <div className="space-y-4">
                      <Textarea placeholder="Adicionar nota..." rows={4} />
                      <Button variant="cta" className="w-full">
                        Salvar Nota
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create Lead Modal */}
      <CreateLeadModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onConfirm={handleCreateLead}
        availableProperties={availableProperties}
      />

      <ImportLeadsModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} />
    </div>
  );
}
