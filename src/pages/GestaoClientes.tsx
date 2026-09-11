import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import {
  Users,
  Search,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  ClipboardList,
  Eye,
  ChevronRight,
  Loader2,
  UserCheck,
  UserX,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarUpload } from "@/components/shared/AvatarUpload";

type ClientProfile = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
  conversations_count?: number;
  proposals_count?: number;
};

function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('full_name');
      if (error) throw error;

      const clientIds = (profiles || []).map(p => p.id);
      if (clientIds.length === 0) return [] as ClientProfile[];

      // Fetch conversation counts
      const { data: convos } = await supabase
        .from('conversations')
        .select('client_id');

      const convoMap: Record<string, number> = {};

      (convos || []).forEach((c) => {
        if (c.client_id) convoMap[c.client_id] = (convoMap[c.client_id] || 0) + 1;
      });

      return (profiles || []).map(p => ({
        ...p,
        conversations_count: convoMap[p.id] || 0,
        proposals_count: 0,
      })) as ClientProfile[];
    },
  });
}

export default function GestaoClientes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { data: clients = [], isLoading } = useClients();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleViewPortal = (client: ClientProfile) => {
    // Navigate to Atendimento to see client conversations (admin can't access client portal directly)
    navigate('/atendimento');
    toast({
      title: `Portal de ${client.full_name}`,
      description: "Redirecionando para o atendimento onde você pode visualizar as conversas deste cliente.",
    });
  };

  const handleStartConversation = async (client: ClientProfile) => {
    if (!profile) return;
    setActionLoading('conversa');
    try {
      // Check if conversation already exists
      const { data: existing } = await (supabase
        .from('conversations' as any)
        .select('id')
        .eq('client_id', client.id)
        .limit(1) as any);

      if (existing && existing.length > 0) {
        toast({ title: "Conversa existente", description: `Redirecionando para o atendimento com ${client.full_name}.` });
        navigate('/atendimento');
        return;
      }

      // Create new conversation
      const { error } = await (supabase
        .from('conversations' as any)
        .insert({
          client_id: client.id,
          agent_id: profile.id,
          subject: `Atendimento - ${client.full_name}`,
          status: 'open',
          last_message_at: new Date().toISOString(),
        }) as any);

      if (error) throw error;

      toast({ title: "Conversa criada!", description: `Nova conversa com ${client.full_name} iniciada.` });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigate('/atendimento');
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Erro ao criar conversa.", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleScheduleVisit = async (client: ClientProfile) => {
    if (!profile) return;
    setActionLoading('visita');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const { error } = await supabase
        .from('visits')
        .insert({
          agent_id: profile.id,
          scheduled_at: tomorrow.toISOString(),
          status: 'scheduled',
          notes: `Visita agendada via painel de clientes para ${client.full_name}`,
          created_by: profile.id,
        });

      if (error) throw error;

      toast({ title: "Visita agendada!", description: `Visita com ${client.full_name} agendada para amanhã às 10:00.` });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      navigate('/agenda');
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Erro ao agendar visita.", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredClients = clients.filter(c =>
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const activeClients = clients.filter(c => c.is_active !== false).length;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="clientes"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="clientes"
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
          title="Gestão de Clientes"
          subtitle="Visualize e gerencie os clientes da imobiliária"
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Clientes</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{clients.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{activeClients}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-success" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversas Ativas</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{clients.reduce((s, c) => s + (c.conversations_count || 0), 0)}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client List */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl shadow-sm">
                {/* Search */}
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, email ou telefone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                {/* List */}
                <div className="divide-y divide-border">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    </div>
                  ) : filteredClients.length === 0 ? (
                    <div className="py-12 text-center">
                      <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                      </p>
                    </div>
                  ) : (
                    filteredClients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors",
                          selectedClient?.id === client.id && "bg-accent/5"
                        )}
                      >
                        <Avatar className="h-11 w-11 shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(client.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">{client.full_name}</p>
                            <Badge className={cn("text-xs", client.is_active !== false ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                              {client.is_active !== false ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{client.email || 'Sem email'}</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-muted-foreground">
                          {client.conversations_count ? (
                            <div className="flex items-center gap-1" title="Conversas">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span className="text-xs">{client.conversations_count}</span>
                            </div>
                          ) : null}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Client Detail Panel */}
            <div>
              {selectedClient ? (
                <div className="bg-card rounded-xl shadow-sm p-6 space-y-6 sticky top-24">
                  {/* Client Header */}
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <AvatarUpload
                        profileId={selectedClient.id}
                        currentAvatarUrl={selectedClient.avatar_url}
                        fullName={selectedClient.full_name}
                        size="lg"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedClient.full_name}</h3>
                    <Badge className={cn("mt-1", selectedClient.is_active !== false ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                      {selectedClient.is_active !== false ? 'Cliente Ativo' : 'Cliente Inativo'}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Informações de Contato</h4>
                    {selectedClient.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedClient.email}</span>
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedClient.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Cliente desde {selectedClient.created_at ? new Date(selectedClient.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Activity Summary */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Atividade</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <MessageSquare className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <p className="text-lg font-bold text-foreground">{selectedClient.conversations_count || 0}</p>
                        <p className="text-xs text-muted-foreground">Conversas</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <ClipboardList className="h-4 w-4 mx-auto mb-1 text-success" />
                        <p className="text-lg font-bold text-foreground">{selectedClient.proposals_count || 0}</p>
                        <p className="text-xs text-muted-foreground">Propostas</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Ações</h4>
                    <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => handleViewPortal(selectedClient)}>
                      <Eye className="h-4 w-4" />
                      Ver Portal do Cliente
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => handleStartConversation(selectedClient)} disabled={actionLoading === 'conversa'}>
                      <MessageSquare className="h-4 w-4" />
                      {actionLoading === 'conversa' ? 'Criando...' : 'Iniciar Conversa'}
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => handleScheduleVisit(selectedClient)} disabled={actionLoading === 'visita'}>
                      <Calendar className="h-4 w-4" />
                      {actionLoading === 'visita' ? 'Agendando...' : 'Agendar Visita'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-xl shadow-sm p-12 text-center sticky top-24">
                  <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground">Selecione um cliente para ver os detalhes.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
