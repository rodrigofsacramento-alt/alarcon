import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Pencil, ExternalLink, ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTeamActivities,
  useUpsertTeamActivity,
  useDeleteTeamActivity,
  slaLabel,
  buildLink,
  STAGES,
  STAGE_LABEL,
  PRIORITY_LABEL,
  PRIORITY_COLOR,
  LINK_MODULES,
  TeamActivity,
  ActivityStage,
  ActivityPriority,
} from "@/hooks/use-team-activities";
import { toast } from "@/hooks/use-toast";

interface Member { id: string; full_name: string; role: string }

const PRIORITY_OPTIONS: ActivityPriority[] = ["baixa", "media", "alta", "urgente"];

const STAGE_DOT: Record<ActivityStage, string> = {
  a_fazer: "bg-slate-400",
  fazendo: "bg-violet-500",
  aguardando: "bg-amber-500",
  concluido: "bg-emerald-500",
};

interface FormState {
  id?: string;
  title: string;
  description: string;
  assigned_to: string;
  due: string;
  priority: ActivityPriority;
  status: ActivityStage;
  link_type: string;
  link_id: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  assigned_to: "",
  due: "",
  priority: "media",
  status: "a_fazer",
  link_type: "",
  link_id: "",
};

// datetime-local → value local (sem tz) para o input
function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const SLA_TONE: Record<string, string> = {
  ok: "text-emerald-600",
  warn: "text-amber-600",
  late: "text-red-600 font-semibold",
  done: "text-emerald-600",
  none: "text-muted-foreground",
};

export default function Atividades() {
  const { profile } = useAuth();
  const { data: activities = [], isLoading } = useTeamActivities();
  const upsert = useUpsertTeamActivity();
  const remove = useDeleteTeamActivity();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filterOwner, setFilterOwner] = useState("todos");
  const [members, setMembers] = useState<Member[]>([]);

  // Responsáveis disponíveis (membros ativos do tenant)
  useEffect(() => {
    (async () => {
      const res = await supabase.from("profiles").select("id, full_name, role").eq("is_active", true).order("full_name");
      if (!res.error) setMembers((res.data || []) as Member[]);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activities.filter((a) => {
      if (filterOwner !== "todos" && a.assigned_to !== filterOwner) return false;
      if (!q) return true;
      return (a.title || "").toLowerCase().includes(q) || (a.description || "").toLowerCase().includes(q);
    });
  }, [activities, search, filterOwner]);

  const byStage = useMemo(() => {
    const map: Record<ActivityStage, TeamActivity[]> = { a_fazer: [], fazendo: [], aguardando: [], concluido: [] };
    filtered.forEach((a) => map[a.status]?.push(a));
    return map;
  }, [filtered]);

  const openNew = (stage: ActivityStage = "a_fazer") => {
    setForm({ ...EMPTY_FORM, status: stage });
    setDialogOpen(true);
  };

  const openEdit = (a: TeamActivity) => {
    setForm({
      id: a.id,
      title: a.title,
      description: a.description || "",
      assigned_to: a.assigned_to || "",
      due: toLocalInput(a.due),
      priority: a.priority,
      status: a.status,
      link_type: a.link_type || "",
      link_id: a.link_id || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Informe um título", variant: "destructive" });
      return;
    }
    try {
      await upsert.mutateAsync({
        id: form.id,
        title: form.title.trim(),
        description: form.description.trim(),
        assigned_to: form.assigned_to || (profile?.id ?? ""),
        due: form.due,
        priority: form.priority,
        status: form.status,
        link_type: form.link_type || null,
        link_id: form.link_id.trim() || null,
      });
      setDialogOpen(false);
      toast({ title: form.id ? "Atividade atualizada" : "Atividade criada" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro ao salvar atividade", description: e?.message, variant: "destructive" });
    }
  };

  const moveStage = async (a: TeamActivity, dir: -1 | 1) => {
    const idx = STAGES.indexOf(a.status);
    const next = STAGES[Math.min(STAGES.length - 1, Math.max(0, idx + dir))];
    if (next === a.status) return;
    try {
      await upsert.mutateAsync({ ...a, status: next });
    } catch (e: any) {
      toast({ title: "Erro ao mover", description: e?.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast({ title: "Atividade excluída" });
    } catch (e: any) {
      toast({ title: "Sem permissão para excluir", description: e?.message, variant: "destructive" });
    }
  };

  const linkOf = (a: TeamActivity) => buildLink(a.link_type, a.link_id);
  const ownerName = (id: string) => members.find((m) => m.id === id)?.full_name || "Não atribuído";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeModule="atividades" onModuleChange={() => {}} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <MobileSidebar activeModule="atividades" onModuleChange={() => {}} open={mobileOpen} onOpenChange={setMobileOpen} />
      <div className="lg:pl-64">
        <Header title="Atividades da Equipe" subtitle="Acompanhamento de atividades humanas com prazo, prioridade e SLA" onMobileMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 lg:p-6 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar atividade..." className="pl-8" />
            </div>
            <Select value={filterOwner} onValueChange={setFilterOwner}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Responsável" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os responsáveis</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.full_name || m.role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => openNew("a_fazer")} className="ml-auto">
              <Plus className="h-4 w-4 mr-1" /> Nova atividade
            </Button>
          </div>

          {/* Board */}
          {isLoading ? (
            <div className="text-sm text-muted-foreground py-10 text-center">Carregando atividades...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {STAGES.map((stage) => (
                <div key={stage} className="rounded-xl border bg-muted/40 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", STAGE_DOT[stage])} />
                      <span className="font-semibold text-sm">{STAGE_LABEL[stage]}</span>
                    </div>
                    <Badge variant="secondary">{byStage[stage].length}</Badge>
                  </div>

                  {byStage[stage].map((a) => {
                    const sla = slaLabel(a.due, a.status);
                    const link = linkOf(a);
                    return (
                      <Card key={a.id} className="shadow-sm">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <button className="text-sm font-medium text-left hover:underline" onClick={() => openEdit(a)}>
                              {a.title}
                            </button>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button className="p-1 rounded hover:bg-muted" title="Mover para trás" onClick={() => moveStage(a, -1)}>
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                              <button className="p-1 rounded hover:bg-muted" title="Mover para frente" onClick={() => moveStage(a, 1)}>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                              <button className="p-1 rounded hover:bg-muted" title="Editar" onClick={() => openEdit(a)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button className="p-1 rounded hover:bg-red-50 text-red-500" title="Excluir" onClick={() => handleDelete(a.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {a.description && <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>}

                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge className={cn("text-[10px] px-1.5 py-0", PRIORITY_COLOR[a.priority])}>{PRIORITY_LABEL[a.priority]}</Badge>
                            {a.due && (
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(a.due).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>

                          <div className={cn("text-[11px]", SLA_TONE[sla.tone])}>{sla.text}</div>

                          <div className="flex items-center justify-between pt-1 border-t">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground min-w-0">
                              <UserRound className="h-3 w-3 shrink-0" />
                              <span className="truncate">{a.assignedName || ownerName(a.assigned_to)}</span>
                            </span>
                            {link && (
                              <a href={link} className="flex items-center gap-1 text-[11px] text-primary hover:underline shrink-0" title={LINK_MODULES.find((m) => m.type === a.link_type)?.label}>
                                <ExternalLink className="h-3 w-3" /> Abrir
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  <button onClick={() => openNew(stage)} className="w-full text-xs text-muted-foreground hover:text-foreground border border-dashed rounded-lg py-1.5 hover:bg-background transition-colors">
                    + Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Dialog nova/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar atividade" : "Nova atividade"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Contratar revisão de contrato" />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Responsável</Label>
                <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.full_name || m.role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as ActivityPriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Prazo</Label>
                <Input type="datetime-local" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ActivityStage })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{STAGE_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Vínculo (deep link)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.link_type} onValueChange={(v) => setForm({ ...form, link_type: v === "__none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Módulo do sistema" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Nenhum</SelectItem>
                    {LINK_MODULES.map((m) => (
                      <SelectItem key={m.type} value={m.type}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input value={form.link_id} onChange={(e) => setForm({ ...form, link_id: e.target.value })} placeholder="ID do registro (opcional)" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={upsert.isPending}>{upsert.isPending ? "Salvando..." : "Salvar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
