import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// Helper local: buscar ou criar tenant
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

// Funcao global para tocar som sem precisar baixar mp3
function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch(e) {
    console.error("Audio playback failed", e);
  }
}

export type Conversation = {
  id: string;
  conversation_id: string | null;
  profile_id: string | null;
  remote_jid: string;
  phone_number: string;
  name: string | null;
  profile_pic_url: string | null;
  last_message_at: string | null;
  unread_count?: number;
  conversations?: { agent_id: string | null, status?: string };
};

export function useConversations() {
  const [data, setData] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchConversations = useCallback(async (tenantId: string) => {
    try {
      const { data: convs, error } = await supabase
        .from('whatsapp_contacts')
        .select('*, conversations(agent_id, status, unread_count)')
        .eq('tenant_id', tenantId)
        .order('last_message_at', { ascending: false, nullsFirst: false });
      
      if (error) throw error;

      let filtered = convs || [];
      if (user?.id) {
        filtered = filtered.filter(c => {
          // conversations pode vir como array em algumas versoes do postgrest, pegamos o primeiro item se for.
          let agentId = null;
          if (c.conversations) {
            agentId = Array.isArray(c.conversations) ? c.conversations[0]?.agent_id : (c.conversations as any).agent_id;
          }
          // Se for undefined (por ausência da propriedade), tratamos como null
          if (agentId === undefined) agentId = null;
          
          return agentId === null || agentId === user.id || user.role === 'admin';
        });
      }

      setData((filtered ?? []) as Conversation[]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      const tenantId = await fetchDefaultTenant();
      if (!tenantId || !mounted) return;
      
      await fetchConversations(tenantId);

      // Iniciar assinatura realtime para 'whatsapp_contacts'
      channel = supabase
        .channel('whatsapp_contacts_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'whatsapp_contacts',
          },
          (payload) => {
            // Se for uma nova mensagem (UPDATE da ultima mensagem ou INSERT)
            playNotificationSound();
            // Em vez de mesclar no estado, re-buscamos para ter o JOIN atualizado com conversations
            fetchConversations(tenantId);
          }
        )
        .subscribe();
    }

    init();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchConversations]);

  return { data, isLoading };
}
