import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type GoogleWorkspaceStatus = {
  id: string;
  tenant_id: string;
  status: "disconnected" | "connecting" | "connected" | "error" | "revoked";
  display_name: string | null;
  external_account_email: string | null;
  scopes: string[] | null;
  connected_by: string | null;
  connected_by_name: string | null;
  connected_at: string | null;
  calendar_id: string | null;
  calendar_owner_user_id: string | null;
  calendar_owner_name: string | null;
  calendar_owner_email: string | null;
  capabilities: string[] | null;
  data_access_policy: Record<string, unknown> | null;
  last_sync_at: string | null;
  error_message: string | null;
  settings: Record<string, unknown> | null;
  updated_at: string | null;
};

const queryKey = ["tenant-google-workspace"];

export function useTenantGoogleWorkspaceStatus() {
  const { profile } = useAuth();
  const canManage = profile?.role === "admin" || profile?.role === "manager";

  return useQuery({
    queryKey,
    enabled: !!profile?.tenant_id && canManage,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tenant_google_workspace_status")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data ?? null) as GoogleWorkspaceStatus | null;
    },
  });
}

export function usePrepareGoogleWorkspaceConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("google-workspace-oauth", {
        body: { action: "start" },
      });

      if (error) throw error;
      const result = data as { auth_url?: string };
      if (!result.auth_url) {
        throw new Error("Google OAuth URL não retornada.");
      }
      window.location.href = result.auth_url;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDisconnectGoogleWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("disconnect_tenant_google_workspace" as any);

      if (error) throw error;
      return data as { ok: boolean; updated: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
