-- 2026-09-29 — Padronização outbound texto+mídia (Evolution bridge)
-- Extende send_whatsapp_message (overload por conversa) com parâmetros de mídia.
-- - Sessão: prefere provider='evolution' (bridge) entre as conectadas.
-- - Mídia: whatsapp_messages recebe media_url/mime/name/size preenchidos + status pending
--   (bridge pollOutbox baixa do storage e envia via POST /message/sendMedia multipart).
-- Compat: chamadas sem p_media_url continuam funcionando (texto → outbox sendText).

CREATE OR REPLACE FUNCTION public.send_whatsapp_message(
  p_conversation_id uuid,
  p_content text,
  p_message_type text DEFAULT 'text',
  p_media_url text DEFAULT NULL,
  p_media_mime_type text DEFAULT NULL,
  p_media_file_name text DEFAULT NULL,
  p_media_size integer DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_tenant_id uuid := public.get_my_tenant_id();
  v_sender_id uuid := auth.uid();
  v_session public.whatsapp_sessions%ROWTYPE;
  v_conversation public.conversations%ROWTYPE;
  v_client public.profiles%ROWTYPE;
  v_message_id uuid;
  v_remote_jid text;
  v_contact_jid text;
  v_profile_phone text;
  v_message_table_type text;
  v_has_media boolean := p_media_url IS NOT NULL AND length(trim(p_media_url)) > 0;
BEGIN
  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Usuario nao autenticado';
  END IF;

  -- Sessão para envio: prefere a sessão do bridge Evolution (provider='evolution').
  SELECT * INTO v_session
  FROM public.whatsapp_sessions
  WHERE tenant_id = v_tenant_id AND status = 'connected'
  ORDER BY (provider = 'evolution') DESC NULLS LAST, updated_at DESC NULLS LAST
  LIMIT 1;

  IF v_session.id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma sessao WhatsApp conectada';
  END IF;

  SELECT * INTO v_conversation
  FROM public.conversations
  WHERE id = p_conversation_id AND tenant_id = v_tenant_id
  LIMIT 1;

  IF v_conversation.id IS NULL THEN
    RAISE EXCEPTION 'Conversa nao encontrada';
  END IF;

  SELECT * INTO v_client
  FROM public.profiles
  WHERE id = v_conversation.client_id AND tenant_id = v_tenant_id
  LIMIT 1;

  SELECT remote_jid INTO v_contact_jid
  FROM public.whatsapp_contacts
  WHERE tenant_id = v_tenant_id
    AND conversation_id = p_conversation_id
  ORDER BY last_message_at DESC NULLS LAST, updated_at DESC NULLS LAST
  LIMIT 1;

  v_profile_phone := regexp_replace(coalesce(v_client.phone, ''), '\D', '', 'g');

  IF coalesce(v_contact_jid, '') <> '' THEN
    v_remote_jid := v_contact_jid;
  ELSE
    IF coalesce(v_profile_phone, '') = '' THEN
      RAISE EXCEPTION 'Cliente sem telefone para envio via WhatsApp';
    END IF;
    v_remote_jid := v_profile_phone || '@s.whatsapp.net';
  END IF;

  v_message_table_type := CASE
    WHEN p_message_type IN ('system', 'internal_note') THEN p_message_type
    ELSE 'text'
  END;
  -- Mídia: `messages` só aceita text/system/internal_note (constraint messages_message_type_check).
  -- A mídia é sinalizada pelo content "[Imagem]/[Video]/[Audio]/[Arquivo] nome\nURL" (renderMessageContent detecta).

  INSERT INTO public.messages (
    conversation_id, sender_id, receiver_id, content, message_type
  ) VALUES (
    p_conversation_id, v_sender_id, v_conversation.client_id, p_content, v_message_table_type
  )
  RETURNING id INTO v_message_id;

  IF v_has_media THEN
    INSERT INTO public.whatsapp_messages (
      tenant_id, whatsapp_session_id, conversation_id, remote_jid, from_me,
      message_type, content, media_url, media_mime_type, media_file_name, media_size,
      whatsapp_message_id, status
    ) VALUES (
      v_tenant_id, v_session.id, p_conversation_id, v_remote_jid, true,
      p_message_type, p_content, p_media_url, p_media_mime_type, p_media_file_name, p_media_size,
      'estate:' || v_message_id::text, 'pending'
    );
  ELSE
    INSERT INTO public.whatsapp_messages (
      tenant_id, whatsapp_session_id, conversation_id, remote_jid, from_me, message_type, content, whatsapp_message_id, status
    ) VALUES (
      v_tenant_id, v_session.id, p_conversation_id, v_remote_jid, true, p_message_type, p_content, 'estate:' || v_message_id::text, 'pending'
    );
  END IF;

  UPDATE public.conversations
  SET last_message_at = now(), updated_at = now()
  WHERE id = p_conversation_id;

  RETURN jsonb_build_object('success', true, 'message_id', v_message_id, 'message', 'Mensagem enfileirada para envio');
END;
$function$;