import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAgents } from "@/hooks/use-agents";
import { CreateCorretorModal } from "@/components/corretores/CreateCorretorModal";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import {
  Plus,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Users,
  Filter,
  MoreVertical,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  Mail,
  Phone,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarUpload } from "@/components/shared/AvatarUpload";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const evolutionData = [
  { day: "", realizado: 120, meta: 130 },
  { day: "", realizado: 125, meta: 135 },
  { day: "", realizado: 135, meta: 138 },
  { day: "", realizado: 140, meta: 142 },
  { day: "", realizado: 145, meta: 145 },
  { day: "", realizado: 150, meta: 148 },
  { day: "", realizado: 155, meta: 152 },
  { day: "", realizado: 160, meta: 158 },
  { day: "", realizado: 165, meta: 162 },
  { day: "", realizado: 168, meta: 165 },
];

export default function Corretores() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const { data: agents = [], isLoading } = useAgents();

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || null;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gestor';
      case 'agent': return 'Corretor';
      default: return role;
    }
  };

  const totalLeads = agents.reduce((sum, a) => sum + (a.leads_count || 0), 0);
  const totalVisits = agents.reduce((sum, a) => sum + (a.visits_count || 0), 0);
  const totalProposals = agents.reduce((sum, a) => sum + (a.proposals_count || 0), 0);
  const topAgent = agents.length > 0 ? [...agents].sort((a, b) => (b.leads_count || 0) - (a.leads_count || 0))[0] : null;
  const activeAgents = agents.filter(a => a.role === 'agent').length;
  const conversionRate = totalLeads > 0 ? Math.round((totalProposals / totalLeads) * 100) : 0;
  const avgLeads = activeAgents > 0 ? Math.round(totalLeads / activeAgents) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="corretores"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="corretores"
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
          title="Performance de Corretores"
          subtitle="Ranking, metas e gestão da equipe"
          actionButton={
            <Button variant="cta" className="gap-2" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Novo Corretor
            </Button>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="space-y-6 p-4 lg:p-6">
          <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="grid gap-6 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-start gap-4">
                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:flex">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-foreground">Operacao comercial</h2>
                    <Badge variant="outline">{agents.length} membros</Badge>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Acompanhe distribuicao de leads, agenda e propostas para equilibrar a carteira da equipe e identificar gargalos antes que virem perda de atendimento.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background/70 p-2 text-center">
                <div className="min-w-24 rounded-md px-3 py-2">
                  <p className="text-lg font-bold text-foreground">{avgLeads}</p>
                  <p className="text-xs text-muted-foreground">leads/corretor</p>
                </div>
                <div className="min-w-24 rounded-md px-3 py-2">
                  <p className="text-lg font-bold text-foreground">{conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">conversao</p>
                </div>
                <div className="min-w-24 rounded-md px-3 py-2">
                  <p className="text-lg font-bold text-foreground">{totalVisits}</p>
                  <p className="text-xs text-muted-foreground">visitas</p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Corretores</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{agents.length}</p>
                </div>
                <div className="h-11 w-11 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {activeAgents} corretores ativos
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Leads Atribuídos</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalLeads}</p>
                </div>
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-success flex items-center gap-1 mt-3">
                <ArrowUpRight className="h-3 w-3" />
                Total distribuído
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Visitas Realizadas</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalVisits}</p>
                </div>
                <div className="h-11 w-11 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-warning" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {totalProposals} propostas geradas
              </p>
            </div>

            {/* Top Performer Card */}
            {topAgent && (
              <div className="bg-accent rounded-lg border border-accent/20 p-5 shadow-sm text-accent-foreground relative overflow-hidden">
                <Badge className="bg-white/20 text-white hover:bg-white/20">
                  Top performer
                </Badge>
                <div className="flex items-center gap-3 mt-4">
                  <Avatar className="h-14 w-14 border-2 border-white/20">
                    {topAgent.avatar_url && <AvatarImage src={topAgent.avatar_url} alt={topAgent.full_name} className="object-cover" />}
                    <AvatarFallback className="bg-white/20 text-accent-foreground text-lg">{getInitials(topAgent.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xl font-bold">{topAgent.full_name}</p>
                    <p className="text-sm opacity-90">{topAgent.leads_count} leads atribuídos</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Ranking & Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Team Ranking */}
              <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="px-6 pt-6">
                    <h3 className="text-lg font-semibold text-foreground">Equipe</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Clique em um membro para ver perfil, contato e indicadores.</p>
                  </div>
                  <Badge variant="outline" className="mr-6 mt-6">{agents.length} membros</Badge>
                </div>

                {isLoading ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">Carregando...</div>
                ) : agents.length === 0 ? (
                  <div className="mx-6 mb-6 rounded-lg border border-dashed border-border bg-background/70 px-6 py-10 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium text-foreground">Nenhum corretor cadastrado</p>
                    <p className="mx-auto mt-1 max-w-md text-sm">Cadastre o primeiro membro da equipe para distribuir leads, visitas e propostas.</p>
                    <Button className="mt-4 gap-2" variant="outline" onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4" />
                      Novo corretor
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-background/70">
                        <tr className="border-y border-border">
                          <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-muted-foreground">#</th>
                          <th className="text-left px-2 py-3 text-xs font-semibold uppercase text-muted-foreground">Corretor</th>
                          <th className="text-center px-2 py-3 text-xs font-semibold uppercase text-muted-foreground">Leads</th>
                          <th className="text-center px-2 py-3 text-xs font-semibold uppercase text-muted-foreground">Visitas</th>
                          <th className="text-center px-2 py-3 text-xs font-semibold uppercase text-muted-foreground">Propostas</th>
                          <th className="text-center px-6 py-3 text-xs font-semibold uppercase text-muted-foreground">Contato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agents.map((agent, index) => (
                          <tr key={agent.id} className={cn("border-b border-border last:border-0 cursor-pointer hover:bg-muted/40 transition-colors", selectedAgentId === agent.id && "bg-accent/5")} onClick={() => setSelectedAgentId(agent.id)}>
                            <td className="px-6 py-4 text-foreground font-medium">{index + 1}</td>
                            <td className="px-2 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="h-10 w-10">
                                    {agent.avatar_url && <AvatarImage src={agent.avatar_url} alt={agent.full_name} className="object-cover" />}
                                    <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(agent.full_name)}</AvatarFallback>
                                  </Avatar>
                                  {topAgent?.id === agent.id && (
                                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success flex items-center justify-center">
                                      <span className="text-[10px] text-success-foreground">★</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{agent.full_name}</p>
                                  <p className="text-sm text-muted-foreground">{getRoleLabel(agent.role)}{agent.creci ? ` • ${agent.creci}` : ''}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-4 text-center">
                              <Badge className="bg-accent/10 text-accent border-accent/20">{agent.leads_count || 0}</Badge>
                            </td>
                            <td className="px-2 py-4 text-center">
                              <Badge variant="outline">{agent.visits_count || 0}</Badge>
                            </td>
                            <td className="px-2 py-4 text-center">
                              <Badge variant="outline">{agent.proposals_count || 0}</Badge>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {agent.email && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8" title={agent.email}>
                                    <Mail className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {agent.phone && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8" title={agent.phone}>
                                    <Phone className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Goals Evolution Chart */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Evolução de Metas</h3>
                    <p className="text-sm text-muted-foreground">
                      Comparativo realizado vs meta estipulada
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-accent" />
                      <span className="text-sm text-muted-foreground">Realizado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-muted" />
                      <span className="text-sm text-muted-foreground">Meta</span>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} domain={[110, 170]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="realizado" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="meta" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Column - Summary & Info */}
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">Resumo da Equipe</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Total Leads</span>
                    </div>
                    <span className="font-semibold text-foreground">{totalLeads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Total Visitas</span>
                    </div>
                    <span className="font-semibold text-foreground">{totalVisits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-success" />
                      <span className="text-sm text-muted-foreground">Total Propostas</span>
                    </div>
                    <span className="font-semibold text-foreground">{totalProposals}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-warning" />
                      <span className="text-sm text-muted-foreground">Conversão</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {conversionRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Agent Detail Panel */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-1">Detalhes do corretor</h3>
                <p className="mb-4 text-sm text-muted-foreground">Selecione alguem para acompanhar dados e editar a foto.</p>
                {selectedAgent ? (
                  <div className="space-y-5">
                    {/* Profile */}
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        <AvatarUpload
                          profileId={selectedAgent.id}
                          currentAvatarUrl={selectedAgent.avatar_url}
                          fullName={selectedAgent.full_name}
                          size="lg"
                        />
                      </div>
                      <p className="font-semibold text-foreground text-lg">{selectedAgent.full_name}</p>
                      <Badge className="mt-1">{getRoleLabel(selectedAgent.role)}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Clique na camera para alterar foto</p>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 pt-3 border-t border-border">
                      {selectedAgent.creci && (
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">CRECI</p>
                            <p className="text-sm font-medium text-foreground">{selectedAgent.creci}</p>
                          </div>
                        </div>
                      )}
                      {selectedAgent.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium text-foreground truncate">{selectedAgent.email}</p>
                          </div>
                        </div>
                      )}
                      {selectedAgent.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Telefone</p>
                            <p className="text-sm font-medium text-foreground">{selectedAgent.phone}</p>
                          </div>
                        </div>
                      )}
                      {selectedAgent.created_at && (
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Membro desde</p>
                            <p className="text-sm font-medium text-foreground">{new Date(selectedAgent.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Performance stats */}
                    <div className="pt-3 border-t border-border space-y-3">
                      <p className="text-sm font-semibold text-foreground">Performance</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Leads</span>
                            <span className="font-semibold text-foreground">{selectedAgent.leads_count || 0}</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${totalLeads > 0 ? ((selectedAgent.leads_count || 0) / totalLeads) * 100 : 0}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Visitas</span>
                            <span className="font-semibold text-foreground">{selectedAgent.visits_count || 0}</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${totalVisits > 0 ? ((selectedAgent.visits_count || 0) / totalVisits) * 100 : 0}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Propostas</span>
                            <span className="font-semibold text-foreground">{selectedAgent.proposals_count || 0}</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-success rounded-full" style={{ width: `${totalProposals > 0 ? ((selectedAgent.proposals_count || 0) / totalProposals) * 100 : 0}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border flex justify-between">
                        <span className="text-sm text-muted-foreground">Taxa de Conversão</span>
                        <span className="text-sm font-bold text-foreground">
                          {(selectedAgent.leads_count || 0) > 0 ? Math.round(((selectedAgent.proposals_count || 0) / (selectedAgent.leads_count || 1)) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-background/70 px-4 py-8 text-center">
                    <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="text-sm font-medium text-foreground">Nenhum corretor selecionado</p>
                    <p className="mt-1 text-sm text-muted-foreground">Clique em uma linha da equipe para abrir os detalhes aqui.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <CreateCorretorModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
}
