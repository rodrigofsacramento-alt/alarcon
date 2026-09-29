import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type WhatsAppSession = {
  id: string;
  tenant_id: string;
  session_name: string;
  phone_number: string | null;
  ai_enabled?: boolean | null;
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'error';
  qr_code: string | null;
  qr_expires_at: string | null;
  pairing_code: string | null;
  last_connected_at: string | null;
  last_error: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export function useWhatsAppSession() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['whatsapp-session'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('whatsapp_sessions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return (data ?? null) as WhatsAppSession | null;
    },
    // Polling leve: a sessão muda fora do app (bridge gera QR, gateway cai/cai conexão).
    // staleTime de 5min + refetchOnMount false escondia o QR gerado até 5min no mobile.
    refetchInterval: (q) => {
      const s: any = q.state.data;
      return s && s.status === 'connected' ? 15000 : 3000;
    },
  });

  // PADRONIZAÇÃO: a tela deve refletir a conexão no INSTANTE em que o bridge
  // muda o status no banco — sem esperar o próximo tick de polling.
  // 1) Realtime: qualquer UPDATE em whatsapp_sessions dispara refetch imediato.
  useEffect(() => {
    // Nome único por instância: este hook é montado em vários lugares (Atendimento,
    // WhatsAppConnect, drawer). Com nome fixo, a segunda chamada .channel() devolve o
    // canal já inscrito e o .on() seguinte lança
    // "cannot add postgres_changes callbacks ... after subscribe()".
    const ch = (supabase as any)
      .channel(`whatsapp-session-status-${crypto.randomUUID()}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_sessions' },
        () => { qc.invalidateQueries({ queryKey: ['whatsapp-session'] }); })
      .subscribe();
    return () => { try { (supabase as any).removeChannel(ch); } catch { /* noop */ } };
  }, [qc]);

  // 2) Refoco na aba/janela: refetch imediato (mobile costuma congelar timers).
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') qc.invalidateQueries({ queryKey: ['whatsapp-session'] }); };
    window.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onVis);
    return () => {
      window.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onVis);
    };
  }, [qc]);

  return query;
}

export function useStartWhatsAppSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ phone_number }: { phone_number?: string } = {}) => {
      const { data, error } = await (supabase as any).rpc('start_whatsapp_session', {
        p_session_name: 'default',
        p_phone_number: phone_number || null,
      });
      if (error) throw error;
      return data as { success: boolean; session_id: string; status: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-session'] });
    },
  });
}

export function useDisconnectWhatsAppSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ session_name }: { session_name?: string } = {}) => {
      const { data, error } = await (supabase as any).rpc('disconnect_whatsapp_session', {
        p_session_name: session_name || 'default',
      });
      if (error) throw error;
      return data as { success: boolean; message: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-session'] });
    },
  });
}

export function useSetWhatsAppAIEnabled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ enabled }: { enabled: boolean }) => {
      const { data, error } = await (supabase as any).rpc('set_whatsapp_ai_enabled', {
        p_session_name: 'default',
        p_enabled: enabled,
      });
      if (error) throw error;
      if (data && data.success === false) throw new Error(data.error || 'Erro ao atualizar IA');
      return data as { success: boolean; ai_enabled: boolean; session_id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-session'] });
    },
  });
}

export type WhatsAppMessage = {
  id: string;
  tenant_id: string;
  remote_jid: string;
  from_me: boolean;
  message_type: string;
  content: string | null;
  media_url: string | null;
  status: string;
  created_at: string | null;
};

export function useWhatsAppMessages(remoteJid?: string) {
  return useQuery({
    queryKey: ['whatsapp-messages', remoteJid],
    queryFn: async () => {
      let query = (supabase as any)
        .from('whatsapp_messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (remoteJid) {
        query = query.eq('remote_jid', remoteJid);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as WhatsAppMessage[];
    },
    enabled: !!remoteJid,
  });
}

export function useSendWhatsAppMessage() {
  const qc = useQueryClient();
  return useMutation({
    // Padronização outbound (29/09): texto segue pela outbox (bridge sendText);
    // mídia passa mediaUrl/mime/fileName/size preenchidos — o RPC grava os campos
    // media_* na whatsapp_messages (outbox) e o bridge envia via sendMedia da Evolution.
    mutationFn: async ({
      conversationId,
      content,
      messageType = 'text',
      mediaUrl = null,
      mediaMimeType = null,
      mediaFileName = null,
      mediaSize = null,
    }: {
      conversationId: string;
      content: string;
      messageType?: 'text' | 'image' | 'video' | 'audio' | 'document';
      mediaUrl?: string | null;
      mediaMimeType?: string | null;
      mediaFileName?: string | null;
      mediaSize?: number | null;
    }) => {
      const { data, error } = await (supabase as any).rpc('send_whatsapp_message', {
        p_conversation_id: conversationId,
        p_content: content,
        p_message_type: messageType,
        p_media_url: mediaUrl,
        p_media_mime_type: mediaMimeType,
        p_media_file_name: mediaFileName,
        p_media_size: mediaSize,
      });
      if (error) throw error;
      if (data && data.success === false) throw new Error(data.error || 'Erro ao enviar WhatsApp');
      return data as { success: boolean; message: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      qc.invalidateQueries({ queryKey: ['messages'] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
