import { useState, useEffect, useCallback } from 'react';
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

// Como temos apenas um tenant na Nova Indavent, vamos buscar ou criar ele
const fetchDefaultTenant = async () => {
  let { data } = await supabase.from('tenants').select('id').limit(1).maybeSingle();
  if (!data) {
    const { data: newTenant, error } = await supabase.from('tenants').insert({ name: 'Nova Indavent' }).select('id').single();
    if (error) {
      console.error("Erro ao criar tenant fantasma:", error);
      return null;
    }
    return newTenant.id;
  }
  return data.id;
};

export function useWhatsAppSession() {
  const [data, setData] = useState<WhatsAppSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const { data: sessionData, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      setData((sessionData ?? null) as WhatsAppSession | null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
    // Refresh a cada 3 segundos enquanto carrega o QR
    const interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  return { data, isLoading, refetch: fetchSession };
}

export function useStartWhatsAppSession() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async ({ phone_number }: { phone_number?: string } = {}) => {
    setIsPending(true);
    try {
      const tenantId = await fetchDefaultTenant();
      if (!tenantId) throw new Error('Tenant não encontrado');

      // Buscar sessão existente
      const { data: existing } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('session_name', 'default')
        .maybeSingle();

      if (existing) {
        // Atualiza status para connecting para forçar conexão do broker
        await supabase
          .from('whatsapp_sessions')
          .update({ status: 'connecting', phone_number: phone_number || null })
          .eq('id', existing.id);
        return { success: true, session_id: existing.id, status: 'connecting' };
      } else {
        // Cria nova
        const { data, error } = await supabase
          .from('whatsapp_sessions')
          .insert({
            tenant_id: tenantId,
            session_name: 'default',
            phone_number: phone_number || null,
            status: 'connecting'
          })
          .select()
          .single();
        if (error) throw error;
        return { success: true, session_id: data.id, status: 'connecting' };
      }
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}

export function useDisconnectWhatsAppSession() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async () => {
    setIsPending(true);
    try {
      const tenantId = await fetchDefaultTenant();
      const { error } = await supabase
        .from('whatsapp_sessions')
        .update({ status: 'disconnected', last_error: 'Desconectado manualmente' })
        .eq('tenant_id', tenantId)
        .eq('session_name', 'default');
      if (error) throw error;
      return { success: true, message: 'Sessão desconectada' };
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
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
