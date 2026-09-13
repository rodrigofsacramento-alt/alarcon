import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type RoutingLogRow = {
  id: string;
  tenant_id: string;
  conversation_id: string;
  client_id: string | null;
  kard_contact_id: string | null;
  kard_nombre: string | null;
  kard_phone: string | null;
  kard_avatar: string | null;
  deep_link: string;
  agent_id: string | null;
  corretor_destino: string | null;
  actor_id: string | null;
  corretor_actor: string | null;
  previous_agent_id: string | null;
  corretor_anterior: string | null;
  source: string;
  assigned_at: string;
  assigned_at_asuncion: string;
  dia_asuncion: string;
  semana_asuncion: string;
  mes_asuncion: string;
};

export type GrupoPeriodo = "dia" | "semana" | "mes";
export type RangoPeriodo = { etiqueta: string; desde: Date | null; hasta: Date };

const PERIODOS: { etiqueta: string; dias: number | null }[] = [
  { etiqueta: "Hoy", dias: 0 },
  { etiqueta: "7 días", dias: 7 },
  { etiqueta: "30 días", dias: 30 },
  { etiqueta: "90 días", dias: 90 },
  { etiqueta: "Todo", dias: null },
];

export function getPeriodos() {
  return PERIODOS;
}

export function calcularRango(dias: number | null): RangoPeriodo {
  if (dias === null)
    return { etiqueta: "Todo", desde: null, hasta: new Date() };
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(dias === 0 ? 0 : -(dias - 1));
  return { etiqueta: `${dias === 0 ? "Hoy" : dias + " días"}`, desde, hasta };
}

export function useRoutingLog(desde: Date | null, hasta: Date | null, enabled: boolean) {
  return useQuery({
    queryKey: ["routing-log", desde?.toISOString(), hasta?.toISOString()],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_routing_log", {
        p_desde: desde ? desde.toISOString() : null,
        p_hasta: hasta ? hasta.toISOString() : null,
      });
      if (error) throw error;
      return (data as RoutingLogRow[]) || [];
    },
  });
}