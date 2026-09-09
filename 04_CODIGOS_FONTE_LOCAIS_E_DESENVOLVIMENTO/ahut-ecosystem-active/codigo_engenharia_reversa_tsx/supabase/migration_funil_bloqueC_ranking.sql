-- ============================================================================
-- BLOQUE C — RANKING DE CORRETORES (5 MÉTRICAS) POR AGENTE
-- Dirigido por: ATOM (DB/Backend) — artefacto versionado, NO aplicado.
-- ============================================================================
-- Métricas por agent_id (responsable VIGENTE en el período):
--   1) conversas = conversaciones donde se intercambiaron mensajes (>=0)
--   2) leads     = conversaciones en estágio 3+ ('Qualificado' o posterior)
--                  -> la col. conversations.stage es la fuente (12 estágios).
--                  Espejando el modelo Igor: filtrar por agent_id y contar.
--   3) agendamentos = count de visits por agent_id (tabla única; campo tipo)
--   4) propostas    = count de proposals por agent_id
--   5) vendas       = count de sales_records por agent_id
-- DEVUELVE las 5 métricas + filtro por tenant y período (desde/hasta).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_agent_ranking(
  p_tenant_id uuid,
  p_from      timestamptz DEFAULT NULL,
  p_to        timestamptz DEFAULT NULL
)
RETURNS TABLE (
  agent_id      uuid,
  full_name     text,
  total_leads   bigint,
  total_agenda  bigint,
  total_propuestas bigint,
  total_vendas  bigint,
  total_conv_mensaje bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH p AS (
    SELECT * FROM public.profiles
    WHERE tenant_id IS NOT DISTINCT FROM p_tenant_id
  ),
  convs AS (
    SELECT c.agent_id, c.stage, c.id
    FROM public.conversations c
    WHERE c.tenant_id IS NOT DISTINCT FROM p_tenant_id
      AND (p_from IS NULL OR c.created_at >= p_from)
      AND (p_to   IS NULL OR c.created_at <= p_to)
      AND c.agent_id IS NOT NULL
  ),
  with_msgs AS (
    SELECT DISTINCT m.conversation_id
    FROM public.messages m
  )
  SELECT
    p.id AS agent_id,
    COALESCE(p.full_name, p.email, p.id::text) AS full_name,
    -- LEADS = conversas en estágio 3+ (Qualificado o posterior, no 'INTRO'/'Contato Cadastrado')
    (SELECT count(*) FROM convs c
      WHERE c.agent_id = p.id
        AND c.stage IS NOT NULL
        AND c.stage NOT IN ('INTRO','Contato Cadastrado')) AS total_leads,
    -- AGENDAMIENTOS
    (SELECT count(*) FROM public.visits v WHERE v.agent_id = p.id
      AND v.tenant_id IS NOT DISTINCT FROM p_tenant_id) AS total_agenda,
    -- PROPUESTAS
    (SELECT count(*) FROM public.proposals pr WHERE pr.agent_id = p.id
      AND pr.tenant_id IS NOT DISTINCT FROM p_tenant_id) AS total_propuestas,
    -- VENDAS
    (SELECT count(*) FROM public.sales_records sr WHERE sr.agent_id = p.id
      AND sr.tenant_id IS NOT DISTINCT FROM p_tenant_id) AS total_vendas,
    -- CONVERSAS CON MENSAJES (>=0: registradas; espejo modelo Igor): 
    --   conversas del agente que tienen al menos 1 mensaje
    (SELECT count(DISTINCT c.id) FROM convs c
      JOIN with_msgs w ON w.conversation_id = c.id
     WHERE c.agent_id = p.id) AS total_conv_mensaje
  FROM p
  ORDER BY total_leads DESC;
END;
$$;

-- NOTA: La métrica "conversas con mensaje" usa count(DISTINCT c.id) con JOIN a
-- mensajes -> "conversaciones con mensajes >=0" (se registra si tuvo actividad).
-- PERÍODO: p_from/p_to filtran por created_at de la conversación (responsable
-- VIGENTE = el agent_id actual de la conversación en ese período).
-- ============================================================================