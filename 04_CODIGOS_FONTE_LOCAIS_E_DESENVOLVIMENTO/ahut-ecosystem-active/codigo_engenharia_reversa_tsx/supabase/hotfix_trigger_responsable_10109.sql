-- ============================================================================
-- HOTFIX 10/09 — HERENCIA DEL RESPONSABLE en trigger ensure_lead_from_conversation
-- El lead creado/actualizado por el gatilho DEBE heredar responsible_id =
-- conversations.agent_id (mismo atendente del contato original en Atendimento).
-- Aplicado en PROD 10/09 ~03:34 (backup: _snap_funil_prod/trigger_...BEFORE_hotfix...).
-- Bloqueo anti-múltiplos (ERR_MULTIPLIDAD) y supresión notif admin conservados.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.ensure_lead_from_conversation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_client_name  TEXT;
  v_client_phone TEXT;
  v_phone_norm   TEXT;
  v_lead_id      UUID;
  v_dup_count    INT;
  v_resp_id      UUID;
BEGIN
  -- TRAVA ESTÁGIO 3: fuera de 'Qualificado' NO se toca la tabla leads.
  IF NEW.stage IS DISTINCT FROM 'Qualificado' THEN
    RETURN NEW;
  END IF;

  -- HERRENCIA DEL RESPONSABLE (hotfix 10/09): el responsável del lead =
  -- agente de la conversación (conversations.agent_id), mismo atendente
  -- del contato original en Atendimento.
  v_resp_id := NEW.agent_id;

  SELECT p.full_name, p.phone INTO v_client_name, v_client_phone
    FROM public.profiles p
   WHERE p.id = NEW.client_id;

  v_phone_norm := regexp_replace(COALESCE(v_client_phone, ''), '[^0-9]', '', 'g');

  -- ANTI-DUPLICIDAD (sin notificación admin: directriz Rodrigo 09/09)
  IF v_phone_norm <> '' THEN
    SELECT count(*) INTO v_dup_count
      FROM public.leads l
     WHERE regexp_replace(COALESCE(l.phone,''), '[^0-9]','','g') = v_phone_norm
       AND l.tenant_id IS NOT DISTINCT FROM NEW.tenant_id;
    IF v_dup_count > 1 THEN
      RAISE EXCEPTION 'ERR_MULTIPLIDAD: múltiples leads para este teléfono. Vinculación abortada sin notificar a administración.';
    END IF;
  END IF;

  IF v_phone_norm <> '' THEN
    SELECT l.id INTO v_lead_id
      FROM public.leads l
     WHERE regexp_replace(COALESCE(l.phone,''), '[^0-9]','','g') = v_phone_norm
       AND l.tenant_id IS NOT DISTINCT FROM NEW.tenant_id
     ORDER BY l.created_at LIMIT 1;
  END IF;

  IF v_lead_id IS NULL THEN
    -- CAMINO 1: crear Lead + vincular (hereda responsible_id y created_by del agente)
    INSERT INTO public.leads (
      name, phone, stage, source, notes,
      conversation_id, tenant_id, created_by, responsible_id, created_at, updated_at, current_stage
    ) VALUES (
      COALESCE(v_client_name, 'Cliente ' || substr(NEW.id::text,1,4)),
      COALESCE(v_client_phone, ''),
      'Qualificado',
      'WhatsApp',
      'Lead criado automaticamente pelo funil (estagio Qualificado). conversation_id: ' || NEW.id::text,
      NEW.id, NEW.tenant_id, v_resp_id, v_resp_id, now(), now(), 'INTRO'
    ) RETURNING id INTO v_lead_id;
  ELSIF (SELECT conversation_id FROM public.leads WHERE id = v_lead_id) IS NULL THEN
    -- CAMINO 2: existe sin vinculación -> UPDATE + vincular (hereda responsable)
    UPDATE public.leads
       SET conversation_id = NEW.id,
           stage = 'Qualificado',
           responsible_id = COALESCE(v_resp_id, responsible_id),
           created_by = COALESCE(v_resp_id, created_by),
           updated_at = now()
     WHERE id = v_lead_id;
  ELSE
    -- CAMINO 3: existe CON vinculación -> NO crear.
    NEW.lead_id := v_lead_id;
    RETURN NEW;
  END IF;

  NEW.lead_id := v_lead_id;
  RETURN NEW;
END;
$function$