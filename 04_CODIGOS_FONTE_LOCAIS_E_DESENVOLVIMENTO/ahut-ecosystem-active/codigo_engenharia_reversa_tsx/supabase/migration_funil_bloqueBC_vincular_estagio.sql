-- ============================================================================
-- MIGRACIÓN PROD 10/09 — BLOQUE B (visits.tipo) + BLOQUE C (ranking) + VINCULACIÓN
-- DE ESTÁGIO EN TODO EL FUNIL (visits, proposals, sales_records) en TIEMPO REAL.
-- Dirigido por: JARVIS/ATOM — aplicado 10/09 vía migracao_bloqueBC_vincular_prod.py
-- FONTE: leads.stage (canónica). Régua de 13 estágios = leads_stage_check.
-- PROD: ptochsyoyatsydfysacc. Backup: /opt/data/_snap_funil_prod/bloqueBC_vincular_before_*.sql
-- ============================================================================

-- ============ BLOQUE B: tipo en visits + índices ============
ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'visita'
  CONSTRAINT visits_tipo_check CHECK (tipo IN ('reunion','visita'));
CREATE INDEX IF NOT EXISTS visits_lead_id_idx  ON public.visits (lead_id);
CREATE INDEX IF NOT EXISTS visits_agent_id_idx ON public.visits (agent_id);
CREATE INDEX IF NOT EXISTS visits_tenant_id_idx ON public.visits (tenant_id);
CREATE INDEX IF NOT EXISTS visits_tipo_idx ON public.visits (tipo);

-- ============ VINCULACIÓN: stage en visits/proposals/sales_records ============
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='visits' AND column_name='stage') THEN
    ALTER TABLE public.visits ADD COLUMN stage text NOT NULL DEFAULT 'Contato Cadastrado';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='proposals' AND column_name='stage') THEN
    ALTER TABLE public.proposals ADD COLUMN stage text NOT NULL DEFAULT 'Contato Cadastrado';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='sales_records' AND column_name='stage') THEN
    ALTER TABLE public.sales_records ADD COLUMN stage text NOT NULL DEFAULT 'Contato Cadastrado';
  END IF;
END $$;

ALTER TABLE public.visits        DROP CONSTRAINT IF EXISTS visits_stage_check;
ALTER TABLE public.visits        ADD  CONSTRAINT visits_stage_check        CHECK (stage IN ('Contato Cadastrado','Primeiro Atendimento / Qualificação','Qualificado','Follow Up','Buscar Imóveis','Agendamento Visita/Reunião','Visita/Reunião Agendada','Match Pronto','Apresentar Imóveis','Imóvel Escolhido','Proposta Solicitada','Vendido','A Selecionar'));
ALTER TABLE public.proposals     DROP CONSTRAINT IF EXISTS proposals_stage_check;
ALTER TABLE public.proposals     ADD  CONSTRAINT proposals_stage_check     CHECK (stage IN ('Contato Cadastrado','Primeiro Atendimento / Qualificação','Qualificado','Follow Up','Buscar Imóveis','Agendamento Visita/Reunião','Visita/Reunião Agendada','Match Pronto','Apresentar Imóveis','Imóvel Escolhido','Proposta Solicitada','Vendido','A Selecionar'));
ALTER TABLE public.sales_records DROP CONSTRAINT IF EXISTS sales_records_stage_check;
ALTER TABLE public.sales_records ADD  CONSTRAINT sales_records_stage_check CHECK (stage IN ('Contato Cadastrado','Primeiro Atendimento / Qualificação','Qualificado','Follow Up','Buscar Imóveis','Agendamento Visita/Reunião','Visita/Reunião Agendada','Match Pronto','Apresentar Imóveis','Imóvel Escolhido','Proposta Solicitada','Vendido','A Selecionar'));
CREATE INDEX IF NOT EXISTS visits_stage_idx        ON public.visits (stage);
CREATE INDEX IF NOT EXISTS proposals_stage_idx     ON public.proposals (stage);
CREATE INDEX IF NOT EXISTS sales_records_stage_idx ON public.sales_records (stage);

-- BACKFILL: deriva el stage actual desde el lead vinculado (fuente canónica)
UPDATE public.visits v SET stage = COALESCE(l.stage, 'Contato Cadastrado')
  FROM public.leads l WHERE l.id = v.lead_id AND v.stage IS DISTINCT FROM COALESCE(l.stage,'Contato Cadastrado');
UPDATE public.proposals pr SET stage = COALESCE(l.stage, 'Contato Cadastrado')
  FROM public.leads l WHERE l.id = pr.lead_id AND pr.stage IS DISTINCT FROM COALESCE(l.stage,'Contato Cadastrado');
UPDATE public.sales_records sr SET stage = COALESCE(l.stage, 'Contato Cadastrado')
  FROM public.proposals pr JOIN public.leads l ON l.id = pr.lead_id
  WHERE pr.id = sr.proposal_id AND sr.stage IS DISTINCT FROM COALESCE(l.stage,'Contato Cadastrado');

-- ============ Trigger de sincronización en tiempo real (lead → filhas) ============
CREATE OR REPLACE FUNCTION public.sync_funil_stage_from_lead()
 RETURNS trigger
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.stage IS NOT DISTINCT FROM OLD.stage THEN RETURN NEW; END IF;
  IF NEW.stage IN ('Contato Cadastrado','Primeiro Atendimento / Qualificação','Qualificado','Follow Up','Buscar Imóveis','Agendamento Visita/Reunião','Visita/Reunião Agendada','Match Pronto','Apresentar Imóveis','Imóvel Escolhido','Proposta Solicitada','Vendido','A Selecionar') THEN
    UPDATE public.visits       SET stage = NEW.stage, updated_at = now()
      WHERE lead_id = NEW.id AND stage IS DISTINCT FROM NEW.stage;
    UPDATE public.proposals    SET stage = NEW.stage, updated_at = now()
      WHERE lead_id = NEW.id AND stage IS DISTINCT FROM NEW.stage;
    UPDATE public.sales_records SET stage = NEW.stage, updated_at = now()
      WHERE proposal_id IN (SELECT id FROM public.proposals WHERE lead_id = NEW.id)
        AND stage IS DISTINCT FROM NEW.stage;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_sync_funil_stage ON public.leads;
CREATE TRIGGER trg_sync_funil_stage AFTER UPDATE OF stage ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.sync_funil_stage_from_lead();

-- ============ BLOQUE C: ranking de corredores (5 métricas, vocabulario 13 real) ============
CREATE OR REPLACE FUNCTION public.get_agent_ranking(
  p_tenant_id uuid, p_from timestamptz DEFAULT NULL, p_to timestamptz DEFAULT NULL
)
RETURNS TABLE (agent_id uuid, full_name text,
  total_leads bigint, total_agenda bigint, total_propuestas bigint,
  total_vendas bigint, total_conv_mensaje bigint)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH p AS (SELECT * FROM public.profiles WHERE tenant_id IS NOT DISTINCT FROM p_tenant_id),
  convs AS (SELECT c.agent_id, c.stage, c.id FROM public.conversations c
    WHERE c.tenant_id IS NOT DISTINCT FROM p_tenant_id
      AND (p_from IS NULL OR c.created_at >= p_from)
      AND (p_to   IS NULL OR c.created_at <= p_to)
      AND c.agent_id IS NOT NULL),
  with_msgs AS (SELECT DISTINCT m.conversation_id FROM public.messages m)
  SELECT p.id AS agent_id, COALESCE(p.full_name, p.email, p.id::text) AS full_name,
    (SELECT count(*) FROM convs c WHERE c.agent_id = p.id
      AND c.stage IS NOT NULL
      AND c.stage NOT IN ('Contato Cadastrado','Primeiro Atendimento / Qualificação','A Selecionar')) AS total_leads,
    (SELECT count(*) FROM public.visits v WHERE v.agent_id = p.id
      AND v.tenant_id IS NOT DISTINCT FROM p_tenant_id) AS total_agenda,
    (SELECT count(*) FROM public.proposals pr WHERE pr.agent_id = p.id
      AND pr.tenant_id IS NOT DISTINCT FROM p_tenant_id) AS total_propuestas,
    (SELECT count(*) FROM public.sales_records sr WHERE sr.agent_id = p.id
      AND sr.tenant_id IS NOT DISTINCT FROM p_tenant_id) AS total_vendas,
    (SELECT count(DISTINCT c.id) FROM convs c JOIN with_msgs w ON w.conversation_id = c.id
     WHERE c.agent_id = p.id) AS total_conv_mensaje
  FROM p ORDER BY total_leads DESC;
END;
$$;
-- ================================================================
