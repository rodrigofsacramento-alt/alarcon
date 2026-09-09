-- ============================================================================
-- PATCH BLOQUE A (directriz Rodrigo 09/09 ~20:02): SUPRIMIR NOTIFICACIÓN ADMIN
-- ============================================================================
-- El bloqueo anti-duplicidad (count>1) SE MANTIENE: aborta la vinculación y NO
-- crea chat duplicado. Pero se ELIMINA la llamada a notify_admin_lead_dup para
-- NO molestar a la administración con los 577 duplicados preexistentes.
-- La función notify_admin_lead_dup queda definida pero NO invocada (reactivable).
-- El frontend (Bloque A2) mostrará el popup leigo del status multiplicidad.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.ensure_lead_from_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_name  TEXT;
  v_client_phone TEXT;
  v_phone_norm   TEXT;
  v_lead_id      UUID;
  v_dup_count    INT;
BEGIN
  -- TRAVA ESTÁGIO 3: fuera de 'Qualificado' NO se toca la tabla leads.
  IF NEW.stage IS DISTINCT FROM 'Qualificado' THEN
    RETURN NEW; -- estágios 1-2 y otros: nada de queries a leads
  END IF;

  -- Resolver datos del contacto WhatsApp asociado a la conversación
  SELECT p.full_name, p.phone INTO v_client_name, v_client_phone
    FROM public.profiles p
   WHERE p.id = NEW.client_id;

  -- Normalización de teléfono (solo dígitos) para la búsqueda de duplicidad
  v_phone_norm := regexp_replace(COALESCE(v_client_phone, ''), '[^0-9]', '', 'g');

  -- ------------------------------------------------------------------------
  -- ANTI-DUPLICIDAD: COUNT por teléfono (mismo tenant). Si count>1 → ABORTA.
  -- (Sin notificación admin: directriz Rodrigo 09/09 — no molestar con los
  --  577 duplicados preexistentes. El frontend muestra el popup multiplicidad.)
  -- ------------------------------------------------------------------------
  IF v_phone_norm <> '' THEN
    SELECT count(*) INTO v_dup_count
      FROM public.leads l
     WHERE regexp_replace(COALESCE(l.phone,''), '[^0-9]','','g') = v_phone_norm
       AND l.tenant_id IS NOT DISTINCT FROM NEW.tenant_id;

    IF v_dup_count > 1 THEN
      -- ABORTA vinculación automática. No se crea chat duplicado.
      -- El frontend (Bloque A2) capturará el estado 'multiplicidad' y mostrará
      -- el popup leigo. NO se llama a notify_admin_lead_dup.
      RAISE EXCEPTION 'ERR_MULTIPLIDAD: múltiples leads para este teléfono. Vinculación abortada sin notificar a administración.';
    END IF;
  END IF;

  -- ------------------------------------------------------------------------
  -- LÓGICA DE LOS 3 CAMINOS (busca por teléfono en `leads`)
  -- ------------------------------------------------------------------------
  IF v_phone_norm <> '' THEN
    SELECT l.id INTO v_lead_id
      FROM public.leads l
     WHERE regexp_replace(COALESCE(l.phone,''), '[^0-9]','','g') = v_phone_norm
       AND l.tenant_id IS NOT DISTINCT FROM NEW.tenant_id
     ORDER BY l.created_at LIMIT 1;
  END IF;

  IF v_lead_id IS NULL THEN
    -- CAMINO 1: teléfono NO existe -> crear Lead + vincular
    INSERT INTO public.leads (
      name, phone, stage, source, notes,
      conversation_id, tenant_id, created_by, created_at, updated_at, current_stage
    ) VALUES (
      COALESCE(v_client_name, 'Cliente ' || substr(NEW.id::text,1,4)),
      COALESCE(v_client_phone, ''),
      'Qualificado',
      'WhatsApp',
      'Lead criado automaticamente pelo funil (estagio Qualificado). conversation_id: ' || NEW.id::text,
      NEW.id, NEW.tenant_id, NEW.agent_id, now(), now(), 'INTRO'
    ) RETURNING id INTO v_lead_id;
  ELSIF (SELECT conversation_id FROM public.leads WHERE id = v_lead_id) IS NULL THEN
    -- CAMINO 2: teléfono existe SIN atendimiento vinculado -> UPDATE + vincular
    UPDATE public.leads
       SET conversation_id = NEW.id,
           stage = 'Qualificado',
           updated_at = now()
     WHERE id = v_lead_id;
  ELSE
    -- CAMINO 3: teléfono existe CON atendimiento ya vinculado -> NO crear.
    NEW.lead_id := v_lead_id; -- vincula al existente, no crea segundo
    RETURN NEW;
  END IF;

  NEW.lead_id := v_lead_id;
  RETURN NEW;
END;
$$;