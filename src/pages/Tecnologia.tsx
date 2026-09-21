import { useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  useTechTickets,
  useUpsertTechTicket,
  TechTicketRow,
  TicketAttachment,
  uploadTicketAttachment,
  parseAttachments,
} from "@/hooks/use-tech-tickets";
import {
  useTechSystemLogs,
  useUpsertTechSystemLog,
  useDeleteTechSystemLog,
} from "@/hooks/use-tech-system-logs";
import {
  Plus,
  Search,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  LifeBuoy,
  GitBranch,
  Sparkles,
  Send,
  Printer,
  Paperclip,
  Image as ImageIcon,
  FileText,
  File,
  Mic,
  Camera,
  ChevronLeft,
  ChevronRight,
  History,
  Wand2,
  Bot,
  ExternalLink,
  Target,
  ClipboardList,
  PlayCircle,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  UserRound,
} from "lucide-react";
import { AsyncCombobox } from "@/components/ui/AsyncCombobox";

type Tab = "chamados" | "atualizacoes";

const STATUS_LABEL: Record<string, string> = {
  a_analisar: "Em análise",
  a_executar: "A executar",
  executando: "Executando",
  executado: "Executado",
  atualizado_producao: "Atualizado em produção",
};

const STATUS_ORDER = ["a_analisar", "a_executar", "executando", "executado", "atualizado_producao"];
const STATUS_DOT: Record<string, string> = {
  a_analisar: "bg-amber-500",
  a_executar: "bg-blue-500",
  executando: "bg-violet-500",
  executado: "bg-emerald-500",
  atualizado_producao: "bg-teal-500",
};

const PRIORITY_LABEL: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const PRIORITY_COLOR: Record<string, string> = {
  baixa: "bg-slate-100 text-slate-600",
  media: "bg-sky-100 text-sky-700",
  alta: "bg-orange-100 text-orange-700",
};

const IMPACT_OPTIONS = ["Baixo", "Médio", "Alto", "Crítico (bloqueia operação)"];
const MODULE_OPTIONS = [
  "Atendimento (WhatsApp)",
  "Leads / Funil",
  "Propostas / Financeiro",
  "Relatórios / Performance",
  "Agentes IA / Automação",
  "Cadastro de Imóveis",
  "Login / Segurança",
  "Portal do Cliente",
  "Infraestrutura / Deploy",
  "Outro",
];

const GUIDED_STEPS = [
  { id: "assunto", title: "Assunto" },
  { id: "contexto", title: "O que aconteceu?" },
  { id: "impacto", title: "Impacto e prioridade" },
  { id: "evidencias", title: "Evidências" },
  { id: "revisao", title: "Revisão" },
];

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function fmtBytes(bytes: number) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function isImage(mime?: string) { return !!mime && mime.startsWith("image/"); }
function isAudio(mime?: string) { return !!mime && mime.startsWith("audio/"); }
function isVideo(mime?: string) { return !!mime && mime.startsWith("video/"); }

// Gera uma descrição com cara de desenvolvedor a partir de respostas simples de um leigo.
function buildDescription(f: {
  oQueFazia: string; oQueEsperava: string; oQueAconteceu: string;
  ondeAcontece: string; quandoViu: string; passosReproduzir: string; jaTentou: string;
}) {
  const sections: string[] = [];
  if (f.oQueFazia.trim()) sections.push(`### Contexto\n\n${f.oQueFazia.trim()}`);
  if (f.oQueEsperava.trim()) sections.push(`### Comportamento esperado\n\n${f.oQueEsperava.trim()}`);
  if (f.oQueAconteceu.trim()) sections.push(`### Comportamento observado\n\n${f.oQueAconteceu.trim()}`);
  if (f.ondeAcontece.trim()) sections.push(`### Ambiente / Onde ocorre\n\n${f.ondeAcontece.trim()}`);
  if (f.quandoViu.trim()) sections.push(`### Início do problema\n\n${f.quandoViu.trim()}`);
  if (f.passosReproduzir.trim()) {
    const steps = f.passosReproduzir.split("\n").map((s) => s.trim()).filter(Boolean);
    sections.push(`### Passos para reproduzir\n\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`);
  }
  if (f.jaTentou.trim()) sections.push(`### Tentativas já realizadas\n\n${f.jaTentou.trim()}`);
  const header =
    "> *Chamado aberto pela equipe de operações. Relato preenchido em linguagem de negócio, estruturado para auxiliar o diagnóstico técnico.*";
  return sections.length ? `${header}\n\n${sections.join("\n\n")}` : "";
}

function TechAttachment({ att, compact }: { att: TicketAttachment; compact?: boolean }) {
  if (isImage(att.mime)) {
    return (
      <a href={att.url} target="_blank" rel="noreferrer" className="relative group block overflow-hidden rounded-lg border">
        <img src={att.url} alt={att.name} className="w-full h-24 object-cover" />
        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <ExternalLink className="h-5 w-5 text-white" />
        </span>
      </a>
    );
  }
  if (isAudio(att.mime)) {
    return (
      <div className="rounded-lg border bg-muted/40 p-2 space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Mic className="h-3.5 w-3.5" /> <span className="truncate max-w-[140px]">{att.name}</span>
        </div>
        <audio controls src={att.url} className="h-8 w-full" />
      </div>
    );
  }
  if (isVideo(att.mime)) {
    return (
      <div className="rounded-lg border bg-muted/40 p-2 space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <PlayCircle className="h-3.5 w-3.5" /> <span className="truncate max-w-[140px]">{att.name}</span>
        </div>
        <video controls src={att.url} className="w-full h-24 object-cover rounded-md" />
      </div>
    );
  }
  const isPdf = att.mime === "application/pdf" || att.name.toLowerCase().endsWith(".pdf");
  return (
    <a href={att.url} target="_blank" rel="noreferrer" className="rounded-lg border bg-muted/40 p-2 flex items-center gap-2 hover:bg-muted/70 transition-colors">
      {isPdf ? <FileText className="h-4 w-4 text-red-500 shrink-0" /> : <File className="h-4 w-4 text-sky-500 shrink-0" />}
      <div className="min-w-0">
        <p className="text-[11px] font-medium truncate">{att.name}</p>
        <p className="text-[10px] text-muted-foreground">{fmtBytes(att.size)}{compact ? "" : " • clique para abrir"}</p>
      </div>
    </a>
  );
}

export default function Tecnologia() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("chamados");
  const [search, setSearch] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showNewLog, setShowNewLog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TechTicketRow | null>(null);

  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin" || profile?.role === "manager";

  const { data: tickets, isLoading: loadingTickets } = useTechTickets();
  const upsertTicket = useUpsertTechTicket();

  const { data: logs, isLoading: loadingLogs } = useTechSystemLogs();
  const upsertLog = useUpsertTechSystemLog();
  const deleteLog = useDeleteTechSystemLog();

  // ── Formulário guiado novo chamado ──
  const [step, setStep] = useState(0);
  const [gAssunto, setGAssunto] = useState("");
  const [gModulo, setGModulo] = useState("Atendimento (WhatsApp)");
  const [gPrioridade, setGPrioridade] = useState("media");
  const [gImpacto, setGImpacto] = useState("Médio");
  const [gPrazo, setGPrazo] = useState("");
  const [gEmpresarial, setGEmpresarial] = useState("");
  const [gOQueFazia, setGOQueFazia] = useState("");
  const [gEsperava, setGEsperava] = useState("");
  const [gAconteceu, setGAconteceu] = useState("");
  const [gOnde, setGOnde] = useState("");
  const [gQuando, setGQuando] = useState("");
  const [gPassos, setGPassos] = useState("");
  const [gTentou, setGTentou] = useState("");
  const [gAnexos, setGAnexos] = useState<TicketAttachment[]>([]);
  // Solicitante: por defecto o usuário logado; seleccionable desde os usuarios com login.
  const [gSolicitante, setGSolicitante] = useState({ id: profile?.id || "", full_name: profile?.full_name || "", role: profile?.role || "" });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [notaLog, setNotaLog] = useState("");

  const gDescription = buildDescription({
    oQueFazia: gOQueFazia, oQueEsperava: gEsperava, oQueAconteceu: gAconteceu,
    ondeAcontece: gOnde, quandoViu: gQuando, passosReproduzir: gPassos, jaTentou: gTentou,
  });

  const canNext = useMemo(() => {
    if (step === 0) return !!gAssunto.trim();
    if (step === 1) return !!gAconteceu.trim(); // mínimo: descrever o problema
    return true;
  }, [step, gAssunto, gAconteceu]);

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const existing = [...gAnexos];
      for (const f of Array.from(files)) {
        if (f.size > 10 * 1024 * 1024) continue; // limite do bucket
        try {
          const att = await uploadTicketAttachment(f);
          existing.push(att);
        } catch (e) {
          console.warn("[Tecnologia] falha upload", e);
        }
      }
      setGAnexos(existing);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submitTicket = async () => {
    if (!gAssunto.trim()) return;
    const now = new Date().toISOString();
    const ticket: TechTicketRow = {
      id: `ticket-${Date.now()}`,
      code: `TCK-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      title: gAssunto.trim(),
      description: gDescription || gAssunto.trim(),
      module: gModulo,
      requesterName: gSolicitante.full_name || profile?.full_name || "Equipe Interna",
      requesterRole: gSolicitante.role || profile?.role || "",
      requesterDepartment: "Operações",
      requester_id: gSolicitante.id || undefined,
      priority: gPrioridade,
      main_status: "a_analisar",
      subcategory: "nao_especificado",
      delivery_forecast: gPrazo || "",
      assigned_to: "Squad Ahut Tech (CTO)",
      impact_level: gImpacto,
      is_ai_triaged: false,
      business_impact: gEmpresarial.trim() || undefined,
      acceptance_criteria: [],
      attachments: gAnexos,
      timeline: [
        {
          at: now,
          from: null,
          to: "a_analisar",
          note: "Chamado aberto pela equipe.",
          actor: gSolicitante.full_name || "Sistema",
        },
      ],
      created_at: now,
      updated_at: now,
    };
    try {
      await upsertTicket.mutateAsync(ticket);
    } catch (err) {
      setNotaLog(`❌ **No se pudo guardar el chamado** (${ticket.code}). Error: ${err instanceof Error ? err.message : String(err)}.`);
      return;
    }
    // reset
    setGAssunto(""); setGModulo("Atendimento (WhatsApp)"); setGPrioridade("media");
    setGImpacto("Médio"); setGPrazo(""); setGEmpresarial("");
    setGOQueFazia(""); setGEsperava(""); setGAconteceu(""); setGOnde(""); setGQuando(""); setGPassos(""); setGTentou("");
    setGAnexos([]); setStep(0); setShowNewTicket(false);
    setNotaLog(
      `✅ **Novo chamado aberto:** ${ticket.code} — *${ticket.title}*\nPrioridade ${PRIORITY_LABEL[ticket.priority]}, impacto ${ticket.impact_level}, módulo **${ticket.module}**.`
    );
  };

  const promoteStatus = async (t: TechTicketRow, nextStatus: string, note?: string) => {
    const now = new Date().toISOString();
    const timeline = Array.isArray(t.timeline) ? t.timeline : [];
    await upsertTicket.mutateAsync({
      ...t,
      main_status: nextStatus,
      updated_at: now,
      timeline: [
        ...timeline,
        {
          at: now,
          from: t.main_status,
          to: nextStatus,
          note: note || STATUS_LABEL[nextStatus],
          actor: profile?.full_name || "Squad",
        },
      ],
    });
  };

  const submitLog = async () => {
    if (!lTitle.trim()) return;
    await upsertLog.mutateAsync({
      version: lVersion.trim() || undefined,
      title: lTitle.trim(),
      release_notes: lNotes.trim() || undefined,
    });
    setLVersion(""); setLTitle(""); setLNotes(""); setShowNewLog(false);
  };

  // changelog form
  const [lVersion, setLVersion] = useState("");
  const [lTitle, setLTitle] = useState("");
  const [lNotes, setLNotes] = useState("");

  const filteredTickets = (tickets || []).filter((t) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (t.title || "").toLowerCase().includes(q)
      || (t.code || "").toLowerCase().includes(q)
      || (t.requesterName || "").toLowerCase().includes(q)
      || (t.module || "").toLowerCase().includes(q);
  });

  const printTicket = (t: TechTicketRow) => {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    const atts = parseAttachments(t.attachments);
    const timeline = Array.isArray(t.timeline) ? t.timeline : [];
    const mdToHtml = (md: string) =>
      md
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^\> (.+)$/gm, "<blockquote>$1</blockquote>")
        .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
        .replace(/\n/g, "<br/>");
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><title>${t.code} — ${t.title}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#1a202c;margin:32px;font-size:13px}
  header{border-bottom:2px solid #e53e3e;padding-bottom:12px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end}
  h1{font-size:20px;margin:0} .code{color:#e53e3e;font-family:monospace;font-weight:700}
  .meta{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
  .meta div{background:#f7fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px}
  .meta span{display:block;font-size:10px;color:#718096;text-transform:uppercase;letter-spacing:.05em}
  .meta b{font-size:13px} .badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px}
  h2{font-size:14px;margin-top:22px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
  .section{white-space:pre-line;line-height:1.5}
  .timeline{border-left:2px solid #e2e8f0;padding-left:14px} .timeline div{margin:8px 0;position:relative}
  .timeline div:before{content:'';position:absolute;left:-19px;top:5px;width:8px;height:8px;border-radius:99px;background:#e53e3e}
  .muted{color:#718096;font-size:11px}
  .attachments{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .attachments a{display:block;border:1px solid #e2e8f0;border-radius:6px;padding:6px;text-decoration:none;color:#2d3748}
  footer{margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px;font-size:10px;color:#718096;text-align:center}
</style></head><body>
  <header>
    <div><div class="code">${t.code || ""}</div><h1>${t.title}</h1></div>
    <span class="badge" style="background:${t.main_status==='executado'?'#c6f6d5;color:#22543d':'#fed7d7;color:#9b2c2c'}">${STATUS_LABEL[t.main_status] || t.main_status}</span>
  </header>
  <div class="meta">
    <div><span>Módulo</span><b>${t.module || "Geral"}</b></div>
    <div><span>Solicitante</span><b>${t.requesterName || "Equipe"}</b></div>
    <div><span>Prioridade</span><b>${PRIORITY_LABEL[t.priority] || t.priority}</b></div>
    <div><span>Impacto</span><b>${t.impact_level || "Médio"}</b></div>
  </div>
  <div class="section">${mdToHtml(t.description || "")}</div>
  ${t.business_impact ? `<h2>Impacto no negócio</h2><div class="section">${t.business_impact}</div>` : ""}
  ${Array.isArray(t.acceptance_criteria) && t.acceptance_criteria.length ? `<h2>Critérios de aceite</h2><ul>${t.acceptance_criteria.map(c=>`<li>${c}</li>`).join("")}</ul>` : ""}
  ${timeline.length ? `<h2>Histórico / Atividades</h2><div class="timeline">${timeline.map(ev=>`<div><b>${STATUS_LABEL[ev.to] || ev.to}:</b> ${ev.note || ""}<br/><span class="muted">${ev.actor || "Squad"} • ${fmtDate(ev.at)}</span></div>`).join("")}</div>` : ""}
  ${atts.length ? `<h2>Anexos (${atts.length})</h2><div class="attachments">${atts.map(a=>`<a href="${a.url}" target="_blank">${a.name}<br/><span class="muted">${fmtBytes(a.size)}</span></a>`).join("")}</div>` : ""}
  <footer>Gerado em ${new Date().toLocaleString("pt-BR")} • ${t.code || ""} • Estate.AI - Agents Ecosystem</footer>
  <script>window.onload=function(){window.print();}</script>
</body></html>`;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeModule="tecnologia" onModuleChange={() => {}} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <MobileSidebar activeModule="tecnologia" onModuleChange={() => {}} open={mobileOpen} onOpenChange={setMobileOpen} />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <Header title="Tecnologia" subtitle="Chamados de suporte interno e atualizações do sistema" onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 md:p-6 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
            <button onClick={() => setTab("chamados")} className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", tab === "chamados" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <LifeBuoy className="h-4 w-4" /> Gestão de Chamados
            </button>
            <button onClick={() => setTab("atualizacoes")} className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", tab === "atualizacoes" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <GitBranch className="h-4 w-4" /> Atualizações do Sistema
            </button>
            {notaLog && (
              <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" /> Último chamado aberto com sucesso
              </div>
            )}
          </div>

          {/* ── ABA CHAMADOS ── */}
          {tab === "chamados" && (
              <div className="space-y-4">
                {notaLog && (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-sm text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                    <div className="whitespace-pre-line flex-1 min-w-0">{notaLog}</div>
                    <button onClick={() => setNotaLog("")} className="text-emerald-600 hover:text-emerald-800 shrink-0"><X className="h-4 w-4" /></button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por código, título, módulo, solicitante..." className="w-full pl-9 pr-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <button onClick={() => setShowNewTicket(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 shadow-sm">
                    <Plus className="h-4 w-4" /> Novo Chamado
                  </button>
                </div>

                {loadingTickets ? (
                  <div className="text-sm text-muted-foreground">Carregando chamados...</div>
                ) : filteredTickets.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-8 text-center">Nenhum chamado encontrado. Abra o primeiro chamado de suporte.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 items-start">
                    {STATUS_ORDER.map((status) => {
                      const colTickets = filteredTickets.filter((t) => (t.main_status || "a_analisar") === status);
                      return (
                        <div key={status} className="rounded-xl border bg-muted/30 p-2.5 space-y-2.5">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                              <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[status])} />
                              <span className="text-xs font-medium">{STATUS_LABEL[status]}</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">{colTickets.length}</span>
                          </div>
                          <div className="space-y-2.5">
                            {colTickets.length === 0 ? (
                              <div className="text-[11px] text-muted-foreground text-center py-3 border border-dashed border-border rounded-lg">Sem chamados</div>
                            ) : (
                              colTickets.map((t) => {
                                const atts = parseAttachments(t.attachments);
                                const nImgs = atts.filter((a) => isImage(a.mime)).length;
                                return (
                                  <div key={t.id} onClick={() => setSelectedTicket(t)} className="rounded-lg border bg-card p-3 space-y-2 shadow-sm cursor-pointer hover:border-accent/60 hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-[10px] font-mono text-muted-foreground">{t.code}</p>
                                      <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-medium", PRIORITY_COLOR[t.priority] || "bg-slate-100 text-slate-600")}>{PRIORITY_LABEL[t.priority] || t.priority}</span>
                                    </div>
                                    <h3 className="font-medium text-sm leading-snug line-clamp-2">{t.title}</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                      <Bot className="h-3 w-3" /> <span className="truncate">{t.module || "Geral"}</span>
                                    </div>
                                    {t.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{t.description.replace(/^> .+\n/,"")}</p>}
                                    <div className="flex items-center justify-between gap-2 pt-0.5">
                                      <div className="flex items-center gap-1.5">
                                        {nImgs > 0 && <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"><ImageIcon className="h-3 w-3" />{nImgs}</span>}
                                        {atts.length - nImgs > 0 && <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"><Paperclip className="h-3 w-3" />{atts.length - nImgs}</span>}
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                                        <Clock className="h-3 w-3" /> {fmtDate(t.created_at)}
                                      </div>
                                    </div>
                                    {isAdmin && t.main_status !== "atualizado_producao" && (
                                      <div className="flex items-center gap-1 pt-1 border-t">
                                        <button onClick={(e) => { e.stopPropagation(); const i = STATUS_ORDER.indexOf(t.main_status || "a_analisar"); if (i < STATUS_ORDER.length - 1) promoteStatus(t, STATUS_ORDER[i + 1]); }} className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-medium text-accent hover:bg-accent/10 rounded-md py-1 transition-colors">
                                          Avançar <ChevronRight className="h-3 w-3" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); printTicket(t); }} className="p-1 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors" title="Imprimir / PDF">
                                          <Printer className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
          )}

          {/* ── ABA ATUALIZAÇÕES ── */}
          {tab === "atualizacoes" && (
            <div className="space-y-4">
              {isAdmin && (
                <div className="flex justify-end">
                  <button onClick={() => setShowNewLog(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90">
                    <Plus className="h-4 w-4" /> Nova Atualização
                  </button>
                </div>
              )}
              {loadingLogs ? (
                <div className="text-sm text-muted-foreground">Carregando atualizações...</div>
              ) : (logs || []).length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">Nenhuma atualização publicada ainda.</div>
              ) : (
                <div className="space-y-4">
                  {(logs || []).map((log) => (
                    <div key={log.id} className="rounded-xl border bg-card p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center"><Sparkles className="h-5 w-5 text-accent" /></div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {log.version && <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-mono font-medium">{log.version}</span>}
                              <h3 className="font-medium text-sm">{log.title}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5"><CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />{fmtDate(log.release_date)}</p>
                          </div>
                        </div>
                        {isAdmin && <button onClick={() => deleteLog.mutate(log.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors" title="Excluir"><Trash2 className="h-4 w-4" /></button>}
                      </div>
                      {log.release_notes && <div className="text-sm text-muted-foreground whitespace-pre-line">{log.release_notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Modal Novo Chamado (guia) ── */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-card shadow-xl my-4">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-accent" /> Abrir Chamado</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Guia em {GUIDED_STEPS.length} passos — responda com suas palavras, a equipe técnica entende.</p>
              </div>
              <button onClick={() => setShowNewTicket(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>

            {/* passo indicators */}
            <div className="flex items-center gap-1 px-6 py-3 bg-muted/20 border-b overflow-x-auto">
              {GUIDED_STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => i < step && setStep(i)}
                    className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors", i === step ? "bg-accent text-accent-foreground" : i < step ? "text-accent hover:bg-accent/10 cursor-pointer" : "text-muted-foreground cursor-default")}
                  >
                    <span className={cn("h-4 w-4 rounded-full inline-flex items-center justify-center text-[9px] font-bold", i < step ? "bg-accent text-accent-foreground" : i === step ? "bg-white/25" : "bg-muted")}>{i < step ? "✓" : i + 1}</span>
                    {s.title}
                  </button>
                  {i < GUIDED_STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
                </div>
              ))}
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* PASS0: assunto */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium"><ClipboardList className="h-4 w-4 text-accent" /> Qual é o assunto? *</label>
                    <p className="text-xs text-muted-foreground mt-1">Resuma em poucas palavras o que precisa ser resolvido ou implementado.</p>
                    <input value={gAssunto} onChange={(e) => setGAssunto(e.target.value)} placeholder="Ex: Erro ao enviar áudio no WhatsApp" className="w-full mt-2 px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                    <datalist id="modulos">
                      {MODULE_OPTIONS.map((m) => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium"><GitBranch className="h-4 w-4 text-accent" /> Qual parte do sistema?</label>
                    <p className="text-xs text-muted-foreground mt-1">Selecione o módulo onde o problema acontece. Se não souber, deixe como está.</p>
                    <input value={gModulo} list="modulos" onChange={(e) => setGModulo(e.target.value)} className="w-full mt-2 px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium"><UserRound className="h-4 w-4 text-accent" /> Solicitante *</label>
                    <p className="text-xs text-muted-foreground mt-1">Quem abre o chamado. Selecione o usuário entre os que têm login e senha no app.</p>
                    <AsyncCombobox
                      table="profiles"
                      searchFields={["full_name", "email"]}
                      selectFields="id,full_name,email,role"
                      labelField="full_name"
                      subtitleField="email"
                      value={gSolicitante.id}
                      onChange={(item) =>
                        setGSolicitante({
                          id: item?.id || profile?.id || "",
                          full_name: item?.full_name || profile?.full_name || "",
                          role: item?.role || profile?.role || "",
                        })
                      }
                      icon={<UserRound className="h-4 w-4" />}
                    />
                  </div>
                </div>
              )}

              {/* PASS1: contexto */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 flex items-start gap-2 text-xs text-amber-800">
                    <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>Conte o que aconteceu com <b>suas palavras</b>. Não precisa ser técnico — descreva o que você estava fazendo e o que viu na tela. A equipe converte isso em um relatório técnico.</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">O que você estava fazendo?</label>
                    <textarea value={gOQueFazia} onChange={(e) => setGOQueFazia(e.target.value)} rows={2} placeholder="Ex: Estava respondendo um cliente no atendimento e anexei uma imagem na resposta..." className="w-full mt-1.5 px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">O que você esperava que acontecesse?</label>
                    <textarea value={gEsperava} onChange={(e) => setGEsperava(e.target.value)} rows={2} placeholder="Ex: Que a imagem aparecesse para o cliente junto com o texto..." className="w-full mt-1.5 px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">O que aconteceu de verdade? *</label>
                    <textarea value={gAconteceu} onChange={(e) => setGAconteceu(e.target.value)} rows={3} placeholder="Ex: A imagem não chegou, apareceu o texto '[midia]' no lugar..." className="w-full mt-1.5 px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>
              )}

              {/* PASS2: impacto/prioridade */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Atrapalha quanto o trabalho?</label>
                      <p className="text-xs text-muted-foreground mt-0.5">Escolha o impacto. Se trava uma operação inteira, é crítico.</p>
                      <select value={gImpacto} onChange={(e) => setGImpacto(e.target.value)} className="w-full mt-1.5 px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                        {IMPACT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Prioridade</label>
                      <p className="text-xs text-muted-foreground mt-0.5">Quão urgente é resolver.</p>
                      <select value={gPrioridade} onChange={(e) => setGPrioridade(e.target.value)} className="w-full mt-1.5 px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                        <option value="baixa">Baixa — pode esperar</option>
                        <option value="media">Média — importante</option>
                        <option value="alta">Alta — atrapalha bastante</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Prazo desejado (opcional)</label>
                      <p className="text-xs text-muted-foreground mt-0.5">Quando você precisa? (só a data)</p>
                      <input type="date" value={gPrazo} onChange={(e) => setGPrazo(e.target.value)} className="w-full mt-1.5 px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Como isso afeta o negócio? (opcional)</label>
                    <p className="text-xs text-muted-foreground mt-0.5">Ex: perde vendas, cliente reclama, corretores não conseguem trabalhar...</p>
                    <textarea value={gEmpresarial} onChange={(e) => setGEmpresarial(e.target.value)} rows={2} placeholder="Ex: está demorando para responder clientes, podemos perder oportunidades..." className="w-full mt-1.5 px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>
              )}

              {/* PASS3: evidencias */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-3 flex items-start gap-2 text-xs text-sky-900">
                    <Wand2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>Anexe <b>prints, fotos, áudios, vídeos ou arquivos</b> que ajudem a entender o problema (máx. 10MB por arquivo). Quanto mais contexto, mais rápido a equipe resolve.</p>
                  </div>
                  <div className="rounded-xl border-2 border-dashed p-4 text-center">
                    <input ref={fileRef} type="file" multiple accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" className="hidden" onChange={(e) => addFiles(e.target.files)} />
                    <button onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 disabled:opacity-50">
                      {uploading ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Paperclip className="h-4 w-4" />} {uploading ? "Enviando..." : "Escolher arquivos"}
                    </button>
                    <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1"><Camera className="h-3.5 w-3.5" /> Fotos</span>
                      <span className="inline-flex items-center gap-1"><Mic className="h-3.5 w-3.5" /> Áudios</span>
                      <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Documentos</span>
                      <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Prints de tela</span>
                    </div>
                  </div>
                  {gAnexos.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">{gAnexos.length} anexo(s)</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {gAnexos.map((a, i) => (
                          <div key={i} className="relative group">
                            <TechAttachment att={a} compact />
                            <button onClick={() => setGAnexos(gAnexos.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 z-10"><X className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASS4: revisao */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-sm"><Bot className="h-4 w-4 text-accent" /><b className="font-medium">{gAssunto}</b></div>
                      <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", PRIORITY_COLOR[gPrioridade])}>{PRIORITY_LABEL[gPrioridade]}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" />{gModulo}</span>
                      <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />Impacto {gImpacto}</span>
                      {gPrazo && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Prazo {gPrazo}</span>}
                    </div>
                    {gEmpresarial && <p className="text-xs text-muted-foreground"><b>Impacto no negócio:</b> {gEmpresarial}</p>}
                    <div className="rounded-lg bg-card border p-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-2"><Wand2 className="h-3.5 w-3.5 text-accent" /> Relatório técnico (gerado automaticamente)</div>
                      <pre className="text-[11px] whitespace-pre-line font-mono text-foreground/80 leading-relaxed max-h-64 overflow-y-auto">{gDescription || "Adicione ao menos o 'o que aconteceu' para gerar o relatório."}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10 rounded-b-2xl">
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              {step < GUIDED_STEPS.length - 1 ? (
                <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40">
                  Continuar <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={submitTicket} disabled={!gAssunto.trim() || upsertTicket.isPending} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40">
                  <Send className="h-4 w-4" /> {upsertTicket.isPending ? "Abrindo..." : "Abrir Chamado"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detalhe do Chamado + Histórico ── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-card shadow-xl my-4">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedTicket(null)} className="p-1.5 rounded-lg hover:bg-muted -ml-1"><ArrowLeft className="h-4 w-4" /></button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{selectedTicket.code}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", PRIORITY_COLOR[selectedTicket.priority])}>{PRIORITY_LABEL[selectedTicket.priority] || selectedTicket.priority}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium"><span className={cn("h-2 w-2 rounded-full", STATUS_DOT[selectedTicket.main_status] || "bg-gray-400")} />{STATUS_LABEL[selectedTicket.main_status] || selectedTicket.main_status}</span>
                  </div>
                  <h2 className="text-lg font-semibold leading-tight mt-1">{selectedTicket.title}</h2>
                </div>
              </div>
              <button onClick={() => printTicket(selectedTicket)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 shrink-0"><Printer className="h-4 w-4" /> Imprimir / PDF</button>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* metro */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border bg-muted/20 p-2.5"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Módulo</p><p className="text-sm font-medium truncate">{selectedTicket.module || "Geral"}</p></div>
                <div className="rounded-lg border bg-muted/20 p-2.5"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Solicitante</p><p className="text-sm font-medium truncate">{selectedTicket.requesterName || "Equipe"}</p></div>
                <div className="rounded-lg border bg-muted/20 p-2.5"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Impacto</p><p className="text-sm font-medium truncate">{selectedTicket.impact_level || "Médio"}</p></div>
                <div className="rounded-lg border bg-muted/20 p-2.5"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Aberto em</p><p className="text-sm font-medium truncate">{fmtDate(selectedTicket.created_at)}</p></div>
              </div>

              {selectedTicket.business_impact && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Impacto no negócio</h3>
                  <p className="text-sm">{selectedTicket.business_impact}</p>
                </div>
              )}

              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5"><FileText className="h-3.5 w-3.5" /> Descrição / Relatório técnico</h3>
                <div className="rounded-lg border bg-muted/10 p-3 text-sm whitespace-pre-line">
                  {(selectedTicket.description || "").split("\n").map((line, i) =>
                    line.startsWith("### ") ? <h4 key={i} className="font-semibold mt-2 first:mt-0">{line.slice(4)}</h4>
                    : line.startsWith("> ") ? <p key={i} className="text-muted-foreground italic text-xs">{line.slice(2)}</p>
                    : /^[0-9]+\./.test(line) ? <p key={i} className="pl-4">• {line.replace(/^[0-9]+\.\s*/, "")}</p>
                    : line ? <p key={i}>{line}</p> : <br key={i} />
                  )}
                </div>
              </div>

              {Array.isArray(selectedTicket.acceptance_criteria) && selectedTicket.acceptance_criteria.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5"><Target className="h-3.5 w-3.5" /> Critérios de aceite</h3>
                  <ul className="space-y-1">
                    {selectedTicket.acceptance_criteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* anexos */}
              {parseAttachments(selectedTicket.attachments).length > 0 && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5"><Paperclip className="h-3.5 w-3.5" /> Evidências ({parseAttachments(selectedTicket.attachments).length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {parseAttachments(selectedTicket.attachments).map((a, i) => <TechAttachment key={i} att={a} />)}
                  </div>
                </div>
              )}

              {/* timeline */}
              {Array.isArray(selectedTicket.timeline) && selectedTicket.timeline.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2"><History className="h-3.5 w-3.5" /> Histórico / Atividades</h3>
                  <div className="space-y-0">
                    {selectedTicket.timeline.map((ev, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className={cn("h-2.5 w-2.5 rounded-full mt-1", STATUS_DOT[ev.to] || "bg-gray-400")} />
                          {i < selectedTicket.timeline.length - 1 && <span className="w-px flex-1 bg-border min-h-6" />}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm"><b>{STATUS_LABEL[ev.to] || ev.to}</b>{ev.from && ev.from !== ev.to ? <span className="text-muted-foreground"> (de {STATUS_LABEL[ev.from] || ev.from})</span> : null}</p>
                          {ev.note && <p className="text-xs text-muted-foreground mt-0.5">{ev.note}</p>}
                          <p className="text-[11px] text-muted-foreground/70 mt-0.5">{ev.actor || "Squad"} • {fmtDate(ev.at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* acoes admin */}
              {isAdmin && selectedTicket.main_status !== "atualizado_producao" && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <button onClick={() => { const i = STATUS_ORDER.indexOf(selectedTicket.main_status || "a_analisar"); if (i < STATUS_ORDER.length - 1) { promoteStatus(selectedTicket, STATUS_ORDER[i + 1]); setSelectedTicket({ ...selectedTicket, main_status: STATUS_ORDER[i + 1] }); } }} className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90">
                    Avançar para "{STATUS_LABEL[STATUS_ORDER[STATUS_ORDER.indexOf(selectedTicket.main_status || "a_analisar") + 1]]}" <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Nova Atualização (admin) ── */}
      {showNewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2"><GitBranch className="h-5 w-5 text-accent" /> Nova Atualização</h2>
              <button onClick={() => setShowNewLog(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Versão</label>
                <input value={lVersion} onChange={(e) => setLVersion(e.target.value)} placeholder="Ex: v1.2.0" className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Título *</label>
                <input value={lTitle} onChange={(e) => setLTitle(e.target.value)} placeholder="Ex: Novo ranking de corretores" className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notas de versão (Markdown)</label>
                <textarea value={lNotes} onChange={(e) => setLNotes(e.target.value)} rows={5} placeholder={"## Novidades\n- ...\n\n## Correções\n- ..."} className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowNewLog(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">Cancelar</button>
              <button onClick={submitLog} disabled={!lTitle.trim() || upsertLog.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"><Send className="h-4 w-4" /> Publicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}