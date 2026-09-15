import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTechTickets, useUpsertTechTicket, TechTicketRow } from "@/hooks/use-tech-tickets";
import {
  useTechSystemLogs,
  useUpsertTechSystemLog,
  useDeleteTechSystemLog,
} from "@/hooks/use-tech-system-logs";
import {
  Monitor,
  Plus,
  Search,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LifeBuoy,
  GitBranch,
  Sparkles,
  Send,
} from "lucide-react";

type Tab = "chamados" | "atualizacoes";

const STATUS_LABEL: Record<string, string> = {
  a_analisar: "Em análise",
  a_executar: "A executar",
  executando: "Executando",
  executado: "Executado",
  atualizado_producao: "Atualizado em produção",
};

const PRIORITY_LABEL: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

const PRIORITY_COLOR: Record<string, string> = {
  baixa: "bg-slate-100 text-slate-600",
  media: "bg-sky-100 text-sky-700",
  alta: "bg-orange-100 text-orange-700",
  critica: "bg-red-100 text-red-700",
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

export default function Tecnologia() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("chamados");
  const [search, setSearch] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showNewLog, setShowNewLog] = useState(false);

  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin" || profile?.role === "manager";

  // Chamados
  const { data: tickets, isLoading: loadingTickets } = useTechTickets();
  const upsertTicket = useUpsertTechTicket();

  // Changelogs
  const { data: logs, isLoading: loadingLogs } = useTechSystemLogs();
  const upsertLog = useUpsertTechSystemLog();
  const deleteLog = useDeleteTechSystemLog();

  // ---- Formulário de novo chamado ----
  const [tSubject, setTSubject] = useState("");
  const [tDesc, setTDesc] = useState("");
  const [tPriority, setTPriority] = useState("media");

  const submitTicket = async () => {
    if (!tSubject.trim()) return;
    const now = new Date().toISOString();
    const ticket: TechTicketRow = {
      id: `ticket-${Date.now()}`,
      code: `TCK-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      title: tSubject.trim(),
      description: tDesc.trim(),
      module: "Geral",
      requesterName: profile?.full_name || "Equipe Interna",
      requesterRole: profile?.role || "",
      requesterDepartment: "Operações",
      priority: tPriority,
      main_status: "a_analisar",
      subcategory: "nao_especificado",
      delivery_forecast: "",
      assigned_to: "Squad Ahut Tech (CTO)",
      impact_level: "Médio",
      is_ai_triaged: false,
      created_at: now,
      updated_at: now,
    };
    await upsertTicket.mutateAsync(ticket);
    setTSubject(""); setTDesc(""); setTPriority("media"); setShowNewTicket(false);
  };

  // ---- Formulário de novo changelog (admin) ----
  const [lVersion, setLVersion] = useState("");
  const [lTitle, setLTitle] = useState("");
  const [lNotes, setLNotes] = useState("");

  const submitLog = async () => {
    if (!lTitle.trim()) return;
    await upsertLog.mutateAsync({
      version: lVersion.trim() || undefined,
      title: lTitle.trim(),
      release_notes: lNotes.trim() || undefined,
    });
    setLVersion(""); setLTitle(""); setLNotes(""); setShowNewLog(false);
  };

  const filteredTickets = (tickets || []).filter((t) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (t.title || "").toLowerCase().includes(q)
      || (t.code || "").toLowerCase().includes(q)
      || (t.requesterName || "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="tecnologia"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} activeModule="tecnologia" />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <Header
          title="Tecnologia"
          subtitle="Chamados de suporte interno e atualizações do sistema"
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 md:p-6 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-border">
            <button
              onClick={() => setTab("chamados")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                tab === "chamados"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <LifeBuoy className="h-4 w-4" /> Gestão de Chamados
            </button>
            <button
              onClick={() => setTab("atualizacoes")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                tab === "atualizacoes"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <GitBranch className="h-4 w-4" /> Atualizações do Sistema
            </button>
          </div>

          {/* ── ABA 1: CHAMADOS ── */}
          {tab === "chamados" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar chamado..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <button
                  onClick={() => setShowNewTicket(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90"
                >
                  <Plus className="h-4 w-4" /> Novo Chamado
                </button>
              </div>

              {loadingTickets ? (
                <div className="text-sm text-muted-foreground">Carregando chamados...</div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  Nenhum chamado encontrado. Abra o primeiro chamado de suporte.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                  {(["a_analisar", "a_executar", "executando", "executado"] as const).map((status) => {
                    const colTickets = filteredTickets.filter((t) => t.main_status === status);
                    return (
                      <div key={status} className="rounded-xl border bg-muted/40 p-3 space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2.5 w-2.5 rounded-full", {
                              "bg-amber-500": status === "a_analisar",
                              "bg-blue-500": status === "a_executar",
                              "bg-violet-500": status === "executando",
                              "bg-emerald-500": status === "executado",
                            })} />
                            <span className="text-sm font-medium">{STATUS_LABEL[status]}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{colTickets.length}</span>
                        </div>
                        <div className="space-y-3">
                          {colTickets.length === 0 ? (
                            <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                              Sem chamados
                            </div>
                          ) : (
                            colTickets.map((t) => (
                              <div key={t.id} className="rounded-lg border bg-card p-3 space-y-2 shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-[11px] font-mono text-muted-foreground">{t.code}</p>
                                    <h3 className="font-medium text-sm leading-snug">{t.title}</h3>
                                  </div>
                                </div>
                                {t.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                                )}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", PRIORITY_COLOR[t.priority] || "bg-slate-100 text-slate-600")}>
                                    {PRIORITY_LABEL[t.priority] || t.priority}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] text-muted-foreground truncate">{t.requesterName}</span>
                                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                                    <Clock className="h-3 w-3" /> {fmtDate(t.created_at)}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ABA 2: ATUALIZAÇÕES DO SISTEMA ── */}
          {tab === "atualizacoes" && (
            <div className="space-y-4">
              {isAdmin && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowNewLog(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" /> Nova Atualização
                  </button>
                </div>
              )}

              {loadingLogs ? (
                <div className="text-sm text-muted-foreground">Carregando atualizações...</div>
              ) : (logs || []).length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  Nenhuma atualização publicada ainda.
                </div>
              ) : (
                <div className="space-y-4">
                  {(logs || []).map((log) => (
                    <div key={log.id} className="rounded-xl border bg-card p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {log.version && (
                                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-mono font-medium">
                                  {log.version}
                                </span>
                              )}
                              <h3 className="font-medium text-sm">{log.title}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />
                              {fmtDate(log.release_date)}
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => deleteLog.mutate(log.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {log.release_notes && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{log.release_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Modal Novo Chamado ── */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-accent" /> Novo Chamado
              </h2>
              <button onClick={() => setShowNewTicket(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Assunto *</label>
                <input
                  value={tSubject}
                  onChange={(e) => setTSubject(e.target.value)}
                  placeholder="Ex: Erro ao enviar áudio no WhatsApp"
                  className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                <textarea
                  value={tDesc}
                  onChange={(e) => setTDesc(e.target.value)}
                  rows={4}
                  placeholder="Detalhe o problema encontrado..."
                  className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
                <select
                  value={tPriority}
                  onChange={(e) => setTPriority(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowNewTicket(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">
                Cancelar
              </button>
              <button
                onClick={submitTicket}
                disabled={!tSubject.trim() || upsertTicket.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> Abrir Chamado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Nova Atualização (admin) ── */}
      {showNewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-accent" /> Nova Atualização
              </h2>
              <button onClick={() => setShowNewLog(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Versão</label>
                <input
                  value={lVersion}
                  onChange={(e) => setLVersion(e.target.value)}
                  placeholder="Ex: v1.2.0"
                  className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Título *</label>
                <input
                  value={lTitle}
                  onChange={(e) => setLTitle(e.target.value)}
                  placeholder="Ex: Novo ranking de corretores"
                  className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notas de versão (Markdown)</label>
                <textarea
                  value={lNotes}
                  onChange={(e) => setLNotes(e.target.value)}
                  rows={5}
                  placeholder={"## Novidades\n- ...\n\n## Correções\n- ..."}
                  className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowNewLog(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">
                Cancelar
              </button>
              <button
                onClick={submitLog}
                disabled={!lTitle.trim() || upsertLog.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
