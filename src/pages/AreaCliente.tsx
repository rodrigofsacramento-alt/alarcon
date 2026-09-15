import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useMessages, useSendMessage, useMarkMessagesRead } from "@/hooks/use-messages";
import { useClientProposals, useClientVisits } from "@/hooks/use-client-data";
import { toast } from "@/hooks/use-toast";
import {
  Calendar,
  FileText,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  Search,
  Home,
  Key,
  MessageSquare,
  LogOut,
  Building2,
  Clock,
  Bell,
  User,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AreaCliente() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [activeSection, setActiveSection] = useState<"inicio" | "mensagens" | "visitas" | "propostas">("inicio");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect non-clients
  useEffect(() => {
    if (profile && profile.role !== 'client') {
      navigate('/');
    }
  }, [profile, navigate]);

  // Data hooks
  const { data: conversations = [] } = useConversations(user?.id, 'client');
  const activeConversation = conversations[0] || null;
  const { data: messages = [] } = useMessages(activeConversation?.id || null);
  const sendMessageMutation = useSendMessage();
  const markReadMutation = useMarkMessagesRead();
  const { data: visits = [] } = useClientVisits();
  const { data: proposals = [] } = useClientProposals();

  // Mark messages as read when viewing
  useEffect(() => {
    if (activeConversation?.id && user?.id) {
      markReadMutation.mutate({ conversationId: activeConversation.id, userId: user.id });
    }
  }, [activeConversation?.id, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation || !user) return;
    sendMessageMutation.mutate(
      {
        conversation_id: activeConversation.id,
        sender_id: user.id,
        receiver_id: activeConversation.agent_id,
        content: messageInput.trim(),
      },
      {
        onSuccess: () => setMessageInput(""),
        onError: (err: any) => toast({ title: "Erro", description: err?.message || "Tente novamente.", variant: "destructive" }),
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const clientName = profile?.full_name || 'Cliente';
  const initials = clientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const myVisits = visits.filter(v => v.status !== 'cancelled');
  const myProposals = proposals;

  // Journey stages based on real data
  const hasVisits = myVisits.length > 0;
  const hasProposals = myProposals.length > 0;
  const hasSignedProposal = myProposals.some(p => p.signature_status === 'signed');

  const journeyStages = [
    { id: "busca", label: "Busca", status: "complete" as const, icon: <Search className="h-4 w-4" /> },
    { id: "visitas", label: "Visitas", status: hasVisits ? "complete" as const : "current" as const, icon: <Calendar className="h-4 w-4" /> },
    { id: "proposta", label: "Proposta", status: hasProposals ? "complete" as const : hasVisits ? "current" as const : "pending" as const, icon: <FileText className="h-4 w-4" /> },
    { id: "analise", label: "Análise", status: hasProposals ? "current" as const : "pending" as const, icon: <Home className="h-4 w-4" /> },
    { id: "contrato", label: "Contrato", status: hasSignedProposal ? "current" as const : "pending" as const, icon: <FileText className="h-4 w-4" /> },
    { id: "chaves", label: "Chaves", status: "pending" as const, icon: <Key className="h-4 w-4" /> },
  ];

  const completedStages = journeyStages.filter(s => s.status === 'complete').length;
  const progressPercent = Math.round((completedStages / journeyStages.length) * 100);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Client Top Bar */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6" />
              <span className="font-bold text-lg">Estate.AI</span>
              <span className="text-sm opacity-75 hidden sm:inline">| Portal do Cliente</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 ml-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-white/20 text-primary-foreground text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">{clientName}</span>
              </div>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Client Navigation */}
      <nav className="bg-card border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "inicio" as const, label: "Início", icon: <Home className="h-4 w-4" /> },
              { id: "mensagens" as const, label: "Mensagens", icon: <MessageSquare className="h-4 w-4" />, badge: messages.filter(m => !m.is_read && m.sender_id !== user?.id).length },
              { id: "visitas" as const, label: "Visitas", icon: <Calendar className="h-4 w-4" /> },
              { id: "propostas" as const, label: "Propostas", icon: <FileText className="h-4 w-4" /> },
            ].map(tab => (
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
                {tab.badge ? (
                  <Badge className="bg-accent text-accent-foreground h-5 min-w-5 text-xs">{tab.badge}</Badge>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome + Journey (always visible on inicio) */}
        {activeSection === "inicio" && (
          <>
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground mb-6">
              <h2 className="text-2xl font-bold mb-2">Olá, {clientName.split(' ')[0]}!</h2>
              <p className="opacity-90 mb-6">Acompanhe o progresso da sua jornada imobiliária.</p>
              <div className="relative">
                <div className="flex items-center justify-between">
                  {journeyStages.map((stage) => (
                    <div key={stage.id} className="flex flex-col items-center relative z-10">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        stage.status === "complete" ? "bg-success text-success-foreground"
                          : stage.status === "current" ? "bg-accent text-accent-foreground"
                          : "bg-white/20 text-white/60"
                      )}>
                        {stage.status === "complete" ? <CheckCircle2 className="h-5 w-5" /> : stage.icon}
                      </div>
                      <span className="text-xs sm:text-sm mt-2 opacity-90">{stage.label}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/20 -z-0">
                  <div className="h-full bg-success transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection("visitas")}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Visitas Agendadas</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{myVisits.filter(v => v.status === 'scheduled' || v.status === 'confirmed').length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-accent" />
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection("propostas")}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Propostas Ativas</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{myProposals.filter(p => p.status !== 'Cancelada' && p.status !== 'Finalizada').length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection("mensagens")}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mensagens</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{messages.length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-success" />
                </div>
              </div>
            </div>

            {/* Recent Messages Preview */}
            {messages.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-accent" />
                    Últimas Mensagens
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveSection("mensagens")} className="text-accent">
                    Ver todas <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {messages.slice(-3).map((msg) => (
                    <div key={msg.id} className={cn("flex gap-3", msg.sender_id === user?.id && "flex-row-reverse")}>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={cn("text-xs", msg.sender_id === user?.id ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")}>
                          {msg.sender?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn("max-w-[75%] rounded-lg px-3 py-2", msg.sender_id === user?.id ? "bg-accent text-accent-foreground" : "bg-muted")}>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-60 mt-1">{formatTime(msg.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Card */}
            {activeConversation?.agent && (
              <div className="bg-primary rounded-xl p-6 text-primary-foreground">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarFallback className="bg-white/20 text-primary-foreground text-lg">
                      {activeConversation.agent.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-lg font-semibold">{activeConversation.agent.full_name}</h4>
                    <p className="text-sm opacity-90">Seu Corretor</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {activeConversation.agent.phone && (
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 opacity-80" /><span className="text-sm">{activeConversation.agent.phone}</span></div>
                  )}
                  {activeConversation.agent.email && (
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 opacity-80" /><span className="text-sm">{activeConversation.agent.email}</span></div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Messages Section */}
        {activeSection === "mensagens" && (
          <div className="bg-card rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {activeConversation?.agent?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'AG'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{activeConversation?.agent?.full_name || 'Corretor'}</p>
                <p className="text-xs text-muted-foreground">{activeConversation?.subject || 'Conversa'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma mensagem ainda. Envie a primeira!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3", msg.sender_id === user?.id && "flex-row-reverse")}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={cn("text-xs", msg.sender_id === user?.id ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")}>
                      {msg.sender?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("max-w-[70%] rounded-lg px-4 py-3", msg.sender_id === user?.id ? "bg-accent text-accent-foreground" : "bg-muted")}>
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                    <p className="text-xs opacity-60 mt-1">{formatTime(msg.created_at)}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 py-3 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <Button variant="cta" size="icon" onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Visits Section */}
        {activeSection === "visitas" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Minhas Visitas</h2>
            {myVisits.length === 0 && (
              <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma visita agendada.</p>
              </div>
            )}
            {myVisits.map((visit) => (
              <div key={visit.id} className="bg-card rounded-xl p-5 shadow-sm flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center",
                  visit.status === 'confirmed' ? "bg-success/10" : visit.status === 'completed' ? "bg-primary/10" : "bg-warning/10"
                )}>
                  <Calendar className={cn("h-6 w-6", visit.status === 'confirmed' ? "text-success" : visit.status === 'completed' ? "text-primary" : "text-warning")} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{visit.property?.title || 'Imóvel'}</p>
                  <p className="text-sm text-muted-foreground">{visit.property?.location || ''}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(visit.scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    {visit.agent && <span className="flex items-center gap-1"><User className="h-3 w-3" />{visit.agent.full_name}</span>}
                  </div>
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

        {/* Proposals Section */}
        {activeSection === "propostas" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Minhas Propostas</h2>
            {myProposals.length === 0 && (
              <div className="bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma proposta encontrada.</p>
              </div>
            )}
            {myProposals.map((proposal) => (
              <div key={proposal.id} className="bg-card rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
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
                  <span className="font-semibold text-foreground">
                    {proposal.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </span>
                </div>
                {proposal.payment_type && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Pagamento:</span>
                    <span className="text-foreground">{proposal.payment_type}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
