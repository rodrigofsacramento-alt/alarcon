-- ============================================================================
-- BLOQUE A — FUNIL ANTI-DUPLICIDAD + TRAVA ESTÁGIO 3 + NOTIFICACIÓN ADMIN
-- Dirigido por: ATOM (DB/Backend) — validado por AVIS
-- Destino: TESTE/DEV primero → PROD SOLO tras OK de Rodrigo (backup obligatorio)
-- Regla (Rodrigo, 09/09):
--   * Motor solo se dispara cuando conversations.stage = 'Qualificado' (est.3).
--   * Estágios 1-2 NO tocan la tabla leads (bloqueo).
--   * Busca en `leads` por el TELÉFONO del contacto de WhatsApp gatillado.
--   * 3 caminos:
--       1) teléfono NO existe en leads  -> crea Lead + vincula -> 'cadastrado_vinculado'
--       2) teléfono existe SIN atendim. -> UPDATE + vincula    -> 'vinculado'
--       3) teléfono existe CON atendim. -> NO crea, devuelve lead existente -> 'ya_vinculado'
--   * COUNT(*) por teléfono (y nombre) > 1 -> ABORTA + alerta + notifica admin
--   * Notificación hardcoded SOLO a sacramento@apexfyhub.com.br (b3c9240b-...)
--   * Frontend SOLO llama RPC; NO busca duplicidad (sin gasto de tokens de IA).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) CREAR/REEMPLAZAR función de gatillo principal (anti-duplo + trava est.3)
--    Sustituye a ensure_lead_from_conversation: busca por teléfono (no solo conversation_id)
-- ----------------------------------------------------------------------------
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
  v_notif        TEXT;
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
  -- REFINAMIENTO ANTI-DUPLICIDAD (Missión 2): COUNT por teléfono (y nombre)
  -- ------------------------------------------------------------------------
  IF v_phone_norm <> '' THEN
    SELECT count(*) INTO v_dup_count
      FROM public.leads l
     WHERE regexp_replace(COALESCE(l.phone,''), '[^0-9]','','g') = v_phone_norm
       AND l.tenant_id IS NOT DISTINCT FROM NEW.tenant_id;

    IF v_dup_count > 1 THEN
      -- ABORTA vinculación automática. Alerta visual corre el frontend (estado 'multiplicidad').
      -- NOTIFICACIÓN ADMIN (Missión 3) — hardcoded a Sacramento; el frontend/trigger la invoca.
      NEW.lead_id := NULL;
      PERFORM public.notify_admin_lead_dup(
        NEW.id,
        v_client_name,
        v_client_phone,
        v_phone_norm,
        NEW.agent_id,
        NEW.tenant_id
      );
      RAISE EXCEPTION 'ERR_MULTIPLIDAD: múltiples leads para este teléfono. Vinculación abortada. NOTIFICADO a administración.';
    END IF;
  END IF;

  -- ------------------------------------------------------------------------
  -- LÓGICA DE LOS 3 CAMINOS (busca por teléfono en `leads`)
  -- ------------------------------------------------------------------------
  -- ¿Ya existe un lead con ESTE teléfono (mismo tenant)?
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
    -- Devolvemos el lead existente (status ya_vinculado) para que el front muestre
    -- el cartão del lead y NO cree un chat nuevo.
    NEW.lead_id := v_lead_id; -- vincula al existente, no crea segundo
    RETURN NEW;
  END IF;

  NEW.lead_id := v_lead_id;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2) FUNCIÓN: notificación privada a ADMIN (Missión 3) — hardcoded Sacramento
--    Inserta en `notifications` (user_id = sacramento), payload estructurado.
--    Llega solo al Sino de Sacramento (useNotifications filtra user_id).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_admin_lead_dup(
  p_conversation_id UUID,
  p_client_name    TEXT,
  p_client_phone   TEXT,
  p_phone_norm     TEXT,
  p_agent_id       UUID,
  p_tenant_id      UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID := 'b3c9240b-bff8-4188-af02-d5e7c6b7501a'; -- sacramento@apexfyhub.com.br (admin)
  v_agent    TEXT;
  v_nombres  TEXT;
  v_ids      TEXT;
  v_msg      TEXT;
  v_ph       TEXT;
BEGIN
  -- Corretor/usuario que disparó la acción
  SELECT full_name INTO v_agent FROM public.profiles WHERE id = p_agent_id;

  -- Reporte estructurado: nombres + teléfonos + UUIDs de los leads duplicados
  SELECT
    string_agg(l.name, ' | '),
    string_agg(l.id::text, ' | '),
    string_agg(COALESCE(l.phone,''), ' | ')
  INTO v_nombres, v_ids, v_ph
  FROM public.leads l
  WHERE regexp_replace(COALESCE(l.phone,''), '[^0-9]','','g') = p_phone_norm
    AND l.tenant_id IS NOT DISTINCT FROM p_tenant_id;

  v_msg := format(
    'CORRETOR: %s%sCONVERSACION: %s%sCONTACTO (WhatsApp): %s / %s%sLEADS DUPLICADOS:%s  Nombres: %s%s  Telefonos: %s%s  UUIDs: %s',
    COALESCE(v_agent,'N/D'),
    E'\n',
    p_conversation_id::text,
    E'\n',
    COALESCE(p_client_name,'n/d'), COALESCE(p_client_phone,'n/d'),
    E'\n', COALESCE(v_nombres,'-'), E'\n', COALESCE(v_ph,'-'), E'\n', COALESCE(v_ids,'-')
  );

  INSERT INTO public.notifications (
    user_id, tenant_id, title, message, link, type, is_read, created_at
  ) VALUES (
    v_admin_id,
    p_tenant_id,
    '⚠️ Erro de Integridad: Múltiples Leads (unificar datos)',
    v_msg,
    '/leads',
    'integrity_alert',
    false,
    now()
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 3) Trigger ya existente apunta a ensure_lead_from_conversation (BEFORE INSERT/UPDATE OF stage)
--    La función reemplazada mantiene la trava: solo dispara queries a leads en 'Qualificado'.
--    NOTA: tras aplicar, VERIFICAR con SELECT que el trigger usa la NUEVA función.
-- ----------------------------------------------------------------------------
-- (No se toca el trigger; solo se reemplaza su función, que conserva el mismo nombre.)

-- ============================================================================
-- NOTA PARA APLICACIÓN:
--   * Destino inicial: TESTE/DEV (xmsulduzvufdzkfktovk). NO PROD aún.
--   * Antes de PROD: backup obligatorio + OK de Rodrigo.
--   * El frontend (ADA) llamará al RPC y pintará status lego por cada camino.
-- ============================================================================