import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface TechSystemLog {
  id: string;
  tenant_id: string;
  version: string | null;
  title: string;
  release_notes: string | null;
  author_id: string | null;
  release_date: string;
  created_at: string;
  updated_at: string | null;
}

export interface TechSystemLogInput {
  version?: string;
  title: string;
  release_notes?: string;
  release_date?: string;
}

// Busca os changelogs do tenant (Read-Only para todos autenticados)
export function useTechSystemLogs() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("tech-system-logs-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tech_system_logs" }, () => {
        queryClient.invalidateQueries({ queryKey: ["tech-system-logs"] });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  return useQuery<TechSystemLog[]>({
    queryKey: ["tech-system-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tech_system_logs")
        .select("*")
        .order("release_date", { ascending: false });
      if (error) {
        console.warn("[useTechSystemLogs] Erro ao buscar changelogs:", error.message);
        return [];
      }
      return (data || []) as TechSystemLog[];
    },
  });
}

// Cria/atualiza um changelog (apenas admin — RLS bloqueia o resto)
export function useUpsertTechSystemLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: TechSystemLogInput) => {
      const { data: tenantId } = await supabase.rpc("get_my_tenant_id");
      const { data, error } = await supabase
        .from("tech_system_logs")
        .insert({
          tenant_id: tenantId,
          version: log.version || null,
          title: log.title,
          release_notes: log.release_notes || null,
          release_date: log.release_date || new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tech-system-logs"] });
    },
  });
}

// Deleta um changelog (apenas admin)
export function useDeleteTechSystemLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tech_system_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tech-system-logs"] });
    },
  });
}
