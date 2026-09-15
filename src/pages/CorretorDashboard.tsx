import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useMessages } from "@/hooks/use-messages";
import { useVisits } from "@/hooks/use-visits";
import { useProposals } from "@/hooks/use-proposals";
import { useLeads } from "@/hooks/use-leads";
import { useProperties } from "@/hooks/use-properties";
import { toast } from "@/hooks/use-toast";
import {
  Calendar,
  FileText,
  MessageSquare,
  LogOut,
  Building2,
  Bell,
  Target,
  ClipboardList,
  Home,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  MapPin,
  DollarSign,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CorretorDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<"inicio" | "leads" | "visitas" | "imoveis" | "propostas" | "atendimento">("inicio");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: leads = [] } = useLeads();
  const { data: visits = [] } = useVisits();
  const { data: proposals = [] } = useProposals();
  const { data: properties = [] } = useProperties();
  const { data: conversations = [] } = useConversations(user?.id, 'agent');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const agentName = profile?.full_name || 'Corretor';
  const initials = agentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const myLeads = leads
    .filter(lead => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (
        (lead.name && lead.name.toLowerCase().includes(term)) ||
        (lead.phone && lead.phone.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  const myVisits = visits.filter(v => v.status !== 'cancelled');
  const scheduledVisits = myVisits.filter(v => v.status === 'scheduled' || v.status === 'confirmed');
  const activeProposals = proposals.filter(p => p.status !== 'Cancelada' && p.status !== 'Finalizada');

  const navItems = [
    { id: "inicio" as const, label: "Início", icon: <Home className="h-4 w-4" /> },
    { id: "leads" as const, label: "Meus Leads", icon: <Target className="h-4 w-4" />, count: myLeads.length },
    { id: "visitas" as const, label: "Visitas", icon: <Calendar className="h-4 w-4" />, count: scheduledVisits.length },
    { id: "imoveis" as const, label: "Imóveis", icon: <Building2 className="h-4 w-4" />, count: properties.length },
    { id: "propostas" as const, label: "Propostas", icon: <ClipboardList className="h-4 w-4" />, count: activeProposals.length },
    { id: "atendimento" as const, label: "Mensagens", icon: <MessageSquare className="h-4 w-4" />, count: conversations.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Agent Top Bar */}
      <header className="sticky top-0 z-50 bg-sidebar text-sidebar-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6" />
              <span className="font-bold text-lg">Estate.AI</span>
              <span className="text-sm opacity-75 hidden sm:inline">| Painel do Corretor</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 ml-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">{agentName}</span>
              </div>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeSection === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.count ? <Badge variant="outline" className="text-xs ml-1">{tab.count}</Badge> : null}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard */}
        {activeSection === "inicio" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Olá, {agentName.split(' ')[0]}!</h1>
              <p className="text-muted-foreground">Aqui está o resumo das suas atividades.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md" onClick={() => setActiveSection("leads")}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Meus Leads</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{myLeads.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md" onClick={() => setActiveSection("visitas")}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Visitas Pendentes</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{scheduledVisits.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md" onClick={() => setActiveSection("propostas")}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Propostas Ativas</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{activeProposals.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-success" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md" onClick={() => setActiveSection("atendimento")}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversas</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{conversations.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Visits */}
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  Próximas Visitas
                </h3>
                {scheduledVisits.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma visita agendada.</p>
                ) : (
                  <div className="space-y-3">
                    {scheduledVisits.slice(0, 5).map(visit => (
                      <div key={visit.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Calendar className="h-5 w-5 text-accent shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{visit.property?.title || 'Imóvel'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(visit.scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Badge className={cn(visit.status === 'confirmed' ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                          {visit.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Leads */}
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Leads Recentes
                </h3>
                {myLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Nenhum lead atribuído.</p>
                ) : (
                  <div className="space-y-3">
                    {myLeads.slice(0, 5).map(lead => (
                      <div key={lead.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {lead.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.stage} • {lead.source || 'N/A'}</p>
                        </div>
                        {lead.score && <Badge variant="outline" className="text-xs">Score: {lead.score}</Badge>}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/atendimento', { state: { leadToMessage: lead } });
                          }}
                          title="Enviar Mensagem"
                        >
                          <span className="text-base">💬</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Leads Section */}
        {activeSection === "leads" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Meus Leads</h2>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>

            {myLeads.length === 0 ? (
              <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum lead atribuído.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {myLeads.map(lead => (
                  <div key={lead.id} className="bg-card rounded-xl p-5 shadow-sm flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {lead.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email || lead.phone || 'Sem contato'}</p>
                    </div>
                    <Badge variant="outline">{lead.stage}</Badge>
                    {lead.score && <Badge className="bg-accent/10 text-accent">Score: {lead.score}</Badge>}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-8 w-8 text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/atendimento', { state: { leadToMessage: lead } });
                      }}
                      title="Enviar Mensagem"
                    >
                      <span className="text-lg">💬</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Visits Section */}
        {activeSection === "visitas" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Minhas Visitas</h2>
            {myVisits.length === 0 ? (
              <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma visita agendada.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {myVisits.map(visit => (
                  <div 
                    key={visit.id} 
                    className="bg-card rounded-xl p-5 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => navigate('/agenda')}
                  >
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center",
                      visit.status === 'confirmed' ? "bg-success/10" : visit.status === 'completed' ? "bg-primary/10" : "bg-warning/10"
                    )}>
                      <Calendar className={cn("h-6 w-6",
                        visit.status === 'confirmed' ? "text-success" : visit.status === 'completed' ? "text-primary" : "text-warning"
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{visit.property?.title || 'Imóvel'}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(visit.scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge className={cn(
                      visit.status === 'confirmed' ? "bg-success/10 text-success" :
                      visit.status === 'completed' ? "bg-primary/10 text-primary" :
                      visit.status === 'scheduled' ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                    )}>
                      {visit.status === 'confirmed' ? 'Confirmada' : visit.status === 'completed' ? 'Concluída' : visit.status === 'scheduled' ? 'Pendente' : visit.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Properties Section */}
        {activeSection === "imoveis" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Imóveis Disponíveis</h2>
            {properties.length === 0 ? (
              <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum imóvel cadastrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map(prop => (
                  <div 
                    key={prop.id} 
                    className="bg-card rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all"
                    onClick={() => navigate('/imoveis')}
                  >
                    {prop.image_url && (
                      <img src={prop.image_url} alt={prop.title} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{prop.code}</Badge>
                        <Badge className={cn(
                          prop.status === 'available' ? "bg-success/10 text-success" :
                          prop.status === 'reserved' ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                        )}>
                          {prop.status === 'available' ? 'Disponível' : prop.status === 'reserved' ? 'Reservado' : 'Vendido'}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground">{prop.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />{prop.location}
                      </p>
                      <p className="text-lg font-bold text-accent mt-2">
                        {prop.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Proposals Section */}
        {activeSection === "propostas" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Minhas Propostas</h2>
            {proposals.length === 0 ? (
              <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma proposta encontrada.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {proposals.map(proposal => (
                  <div 
                    key={proposal.id} 
                    className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-all"
                    onClick={() => navigate('/propostas')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{proposal.proposal_number}</p>
                        <p className="text-sm text-muted-foreground">{proposal.client_name}</p>
                      </div>
                      <Badge className={cn(
                        proposal.status === 'Finalizada' ? "bg-success/10 text-success" :
                        proposal.status === 'Cancelada' ? "bg-destructive/10 text-destructive" :
                        "bg-primary/10 text-primary"
                      )}>
                        {proposal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-semibold">{proposal.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Section */}
        {activeSection === "atendimento" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Conversas com Clientes</h2>
            {conversations.length === 0 ? (
              <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma conversa ativa.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {conversations.map(conv => (
                  <div 
                    key={conv.id} 
                    className="bg-card rounded-xl p-5 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => navigate(`/atendimento?search=${encodeURIComponent(conv.client?.full_name || '')}`)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {conv.client?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{conv.client?.full_name || 'Cliente'}</p>
                      <p className="text-sm text-muted-foreground">{conv.subject || 'Conversa'}</p>
                    </div>
                    <Badge variant="outline">{conv.status === 'open' ? 'Aberta' : conv.status === 'waiting' ? 'Aguardando' : 'Fechada'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
