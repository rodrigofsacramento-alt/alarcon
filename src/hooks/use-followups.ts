import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// NOTA (Jarvis/ATOM): as tabelas `followups` e `user_tags` ainda NÃO existem no
// `database.ts` gerado (serão criadas por migration depois). Por isso definimos
// aqui tipos TypeScript LOCAIS e acessamos a tabela via `supabase.from('followups' as never)`,
// para que o tsc --noEmit passe sem editar o database.ts.

// 'sent' (NÃO 'done') — bate com o CHECK do migration: status IN ('pending','sent','cancelled').
export type FollowupStatus = 'pending' | 'sent' | 'cancelled';

export interface FollowUp {
  id: string;
  tenant_id: string;
  conversation_id: string;
  message: string | null;
  scheduled_at: string;
  status: FollowupStatus;
  created_at: string | null;
  completed_at: string | null;
}

export interface CreateFollowUpInput {
  tenant_id: string;
  conversation_id: string;
  message: string;
  scheduled_at: string;
  agent_id?: string;
}

const FOLLOWUPS_KEY = ['followups'] as const;

// Criar follow-up agendado (status default 'pending'). Reaproveita o padrão de
// useCreateVisit (react-query useMutation + invalidação de queries).
export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateFollowUpInput) => {
      const { data, error } = await supabase
        .from('followups' as any)
        .insert({
          tenant_id: input.tenant_id,
          conversation_id: input.conversation_id,
          agent_id: user?.id ?? input.agent_id,
          message: input.message,
          scheduled_at: input.scheduled_at,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      return data as FollowUp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUPS_KEY });
    },
  });
}

// Follow-ups pendentes de uma conversa, ordenados pelo mais próximo. Usado pelo
// badge-relógio no card da listagem.
export function usePendingFollowupsByConversation(conversationId: string | null) {
  return useQuery({
    queryKey: [...FOLLOWUPS_KEY, 'pending', conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      if (!conversationId) return [] as FollowUp[];
      const { data, error } = await supabase
        .from('followups' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('status', 'pending')
        .order('scheduled_at', { ascending: true });
      if (error) throw error;
      return (data || []) as FollowUp[];
    },
  });
}
