import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Kanban de atividades da equipe humana (CC-24/09) — evolui a tabela 'activities'.
// Stages vivem em 'status'; prazo em 'planned_end_time'; deep link em link_type/link_id.

export type ActivityStage = "a_fazer" | "fazendo" | "aguardando" | "concluido";
export type ActivityPriority = "baixa" | "media" | "alta" | "urgente";

export const STAGES: ActivityStage[] = ["a_fazer", "fazendo", "aguardando", "concluido"];

export const STAGE_LABEL: Record<ActivityStage, string> = {
  a_fazer: "A fazer",
  fazendo: "Fazendo",
  aguardando: "Aguardando",
  concluido: "Concluído",
};

export const PRIORITY_LABEL: Record<ActivityPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const PRIORITY_COLOR: Record<ActivityPriority, string> = {
  baixa: "bg-slate-100 text-slate-600",
  media: "bg-sky-100 text-sky-700",
  alta: "bg-orange-100 text-orange-700",
  urgente: "bg-red-100 text-red-700",
};

// Deep link: módulos do menu que aceitam ?id= (Leads/Propostas/Atendimento) ou navegação simples.
export const LINK_MODULES: { type: string; label: string; path: string; withId: boolean }[] = [
  { type: "lead", label: "Lead", path: "/leads", withId: true },
  { type: "imovel", label: "Imóvel", path: "/imoveis", withId: true },
  { type: "proposta", label: "Proposta", path: "/propostas", withId: true },
  { type: "atendimento", label: "Atendimento (conversa)", path: "/atendimento", withId: true },
  { type: "cliente", label: "Cliente", path: "/clientes", withId: true },
  { type: "agenda", label: "Agenda & Visitas", path: "/agenda", withId: false },
  { type: "juridico", label: "Jurídico", path: "/juridico", withId: true },
  { type: "tck", label: "Chamado TCK", path: "/tecnologia", withId: false },
];

export function buildLink(type: string | null | undefined, id: string | null | undefined): string | null {
  const mod = LINK_MODULES.find((m) => m.type === type);
  if (!mod) return null;
  if (mod.withId && id) return `${mod.path}?id=${encodeURIComponent(id)}`;
  return mod.path;
}

export interface TeamActivity {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  assignedName: string;
  lead_id: string | null;
  due: string;
  completed_at: string | null;
  status: ActivityStage;
  priority: ActivityPriority;
  link_type: string | null;
  link_id: string | null;
  notified_at: string | null;
  created_at: string;
}

function rowToActivity(row: any): TeamActivity {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    assigned_to: row.assigned_to,
    assignedName: row.assigned_name || "",
    lead_id: row.lead_id || null,
    due: row.planned_end_time || "",
    completed_at: row.completed_at || null,
    status: (row.status || "a_fazer") as ActivityStage,
    priority: (row.priority || "media") as ActivityPriority,
    link_type: row.link_type || null,
    link_id: row.link_id || null,
    notified_at: row.notified_at || null,
    created_at: row.created_at,
  };
}

function activityToRow(a: Partial<TeamActivity> & { title: string }): any {
  const row: any = {
    title: a.title,
    description: a.description || null,
    assigned_to: a.assigned_to || null,
    status: a.status || "a_fazer",
    priority: a.priority || "media",
    link_type: a.link_type || null,
    link_id: a.link_id || null,
    updated_at: new Date().toISOString(),
  };
  // planned_end_time é timestamptz: omitir quando vazio (senão PostgREST 22007)
  if (a.due && String(a.due).trim()) row.planned_end_time = new Date(a.due).toISOString();
  if (a.id) row.id = a.id;
  if (a.status === "concluido") row.completed_at = new Date().toISOString();
  return row;
}

// Lista atividades do tenant + nomes dos responsáveis (join manual p/ evitar FK inexistente).
export function useTeamActivities() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("team-activities-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "activities" }, () => {
        queryClient.invalidateQueries({ queryKey: ["team-activities"] });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  return useQuery<TeamActivity[]>({
    queryKey: ["team-activities"],
    queryFn: async () => {
      const [actRes, profRes] = await Promise.all([
        supabase.from("activities").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, role").eq("is_active", true),
      ]);
      if (actRes.error) {
        console.warn("[useTeamActivities] Erro ao buscar atividades:", actRes.error.message);
        return [];
      }
      const names = new Map<string, string>((profRes.data || []).map((p: any) => [p.id, p.full_name || p.email || "—"]));
      return (actRes.data || []).map((row: any) => ({ ...row, assigned_name: names.get(row.assigned_to) || "Não atribuído" })).map(rowToActivity);
    },
  });
}

export function useUpsertTeamActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (a: Partial<TeamActivity> & { title: string }) => {
      const { data: tenantId } = await supabase.rpc("get_my_tenant_id");
      const row = activityToRow(a);
      const isNew = !a.id;
      if (isNew) row.start_time = new Date().toISOString();
      const { data, error } = await supabase
        .from("activities")
        .upsert({ ...row, tenant_id: tenantId }, { onConflict: "id" })
        .select()
        .single();
      if (error) throw error;
      // Notificação de prazo: dispara 24h antes e no momento do vencimento (pipeline existente do sino).
      await scheduleDueNotifications(data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-activities"] });
    },
  });
}

// Recria os lembretes 24h-antes e no-vencimento sempre que o prazo é definido/alterado.
async function scheduleDueNotifications(task: any) {
  if (!task?.planned_end_time || !task?.assigned_to) return;
  if (task.status === "concluido") return;
  const due = new Date(task.planned_end_time);
  const now = new Date();
  if (due <= now) return;
  const windows = [
    { offset: 24 * 60 * 60 * 1000, title: "Prazo em 24h", type: "warning" },
    { offset: 0, title: "Prazo vencendo", type: "warning" },
  ];
  const rows = windows.map((w) => ({
      user_id: task.assigned_to,
      tenant_id: task.tenant_id,
      title: `${w.title}: ${task.title}`,
      message: `Atividade com prazo em ${due.toLocaleString("pt-BR")}`,
      type: w.type,
      is_read: false,
      fire_at: new Date(due.getTime() - w.offset).toISOString(),
      link: "/atividades",
    }));
  if (!rows.length) return;
  const { error } = await supabase.from("notifications").insert(rows);
  if (error) console.warn("[scheduleDueNotifications]", error.message);
}

export function useDeleteTeamActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("activities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-activities"] });
    },
  });
}

// SLA textual: quanto falta (ou quanto atrasado) até o prazo.
export function slaLabel(due: string, status: ActivityStage): { text: string; tone: "ok" | "warn" | "late" | "done" | "none" } {
  if (status === "concluido") return { text: "Concluída", tone: "done" };
  if (!due) return { text: "Sem prazo", tone: "none" };
  const ms = new Date(due).getTime() - Date.now();
  const h = Math.abs(ms) / 3600000;
  const fmt = h >= 24 ? `${Math.floor(h / 24)}d ${Math.floor(h % 24)}h` : `${Math.floor(h)}h ${Math.floor((h * 60) % 60)}min`;
  if (ms < 0) return { text: `Atrasada há ${fmt}`, tone: "late" };
  return { text: `Falta ${fmt}`, tone: ms < 24 * 3600000 ? "warn" : "ok" };
}
