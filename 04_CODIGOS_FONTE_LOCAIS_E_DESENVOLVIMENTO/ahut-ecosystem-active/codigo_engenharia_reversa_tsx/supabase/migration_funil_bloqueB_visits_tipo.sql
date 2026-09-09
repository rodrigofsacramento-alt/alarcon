-- ============================================================================
-- BLOQUE B — DEEP LINKS + CAMPO TIPO EN VISITS (check reunión/visita)
-- Dirigido por: ATOM (DB/Backend) — artefacto versionado, NO aplicado.
-- ============================================================================
-- Visits debe ser la ÚNICA tabla de agendamentos. Se AÑADE un campo `tipo`
-- para distinguir 'reunion' | 'visita' en la misma fila (check de una opción).
-- La columna vertebral lead_id ya existe → deep link entre visits ⇄ leads ⇄
-- conversations (atendimento) listo. Aquí solo se agrega el tipo + un índice
-- para el agregado por agente del ranking (Bloque C).
-- ============================================================================

-- 1) Columna `tipo` con check (reunion | visita), default 'visita'
ALTER TABLE public.visits
  ADD COLUMN tipo text NOT NULL DEFAULT 'visita'
  CONSTRAINT visits_tipo_check CHECK (tipo IN ('reunion','visita'));

-- 2) Índice para el conteo rápido por agente en el ranking (Bloque C)
--    y para el deep link visits ⇄ lead
CREATE INDEX IF NOT EXISTS visits_lead_id_idx      ON public.visits (lead_id);
CREATE INDEX IF NOT EXISTS visits_agent_id_idx     ON public.visits (agent_id);
CREATE INDEX IF NOT EXISTS visits_tenant_id_idx    ON public.visits (tenant_id);
CREATE INDEX IF NOT EXISTS visits_tipo_idx         ON public.visits (tipo);

-- 3) Backfill: los registros existentes quedan como 'visita' por defecto.
--    (No hay columna previa de tipo → no hay dato que migrar. OK.)

-- ============================================================================
-- NOTA: los deep links de UI (leads⇄atendimento⇄agenda⇄propostas⇄vendas) son
-- capa de aplicación (ADA). Este SQL solo prepara el esquema. El campo
-- `tipo` es consumido por el ranking de corretores (Bloque C) y por el form
-- de agendamento.
-- ============================================================================