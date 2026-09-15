import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type SdrAnswer = {
  id: string;
  session_id: string;
  step_code: string;
  answer_text: string | null;
  llm_interpretation: Record<string, unknown> | null;
  answered_at: string | null;
  step_order: number | null;
  step_label: string | null;
  question_text: string | null;
};

export type SdrSession = {
  id: string;
  conversation_id: string;
  lead_id: string | null;
  current_step: number | null;
  status: string | null;
  llm: string | null;
  completed_at: string | null;
  error: string | null;
  created_at: string | null;
};

/**
 * Busca a sessão SDR da conversa + as respostas registradas (sdr_answers),
 * juntando com sdr_steps (pergunta/texto/ordem) para renderizar o Q&A
 * do Agente SDR (Ava) com dados reais do banco.
 */
export function useSdrAnswers(enabled: boolean, conversationId: string | null) {
  return useQuery({
    queryKey: ['sdr-answers', conversationId],
    enabled: enabled && !!conversationId,
    queryFn: async (): Promise<{ session: SdrSession | null; answers: SdrAnswer[] }> => {
      if (!conversationId) return { session: null, answers: [] };

      // 1. Sessão SDR da conversa (0 ou 1)
      const { data: sessions, error: sErr } = await (supabase as any)
        .from('sdr_sessions')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (sErr) throw sErr;

      const session: SdrSession | null = sessions?.[0] || null;
      if (!session) return { session: null, answers: [] };

      // 2. Steps do roteiro (pergunta/label), para juntar com as respostas
      const { data: steps, error: stErr } = await (supabase as any)
        .from('sdr_steps')
        .select('code, question_text, label, order')
        .order('order', { ascending: true });
      if (stErr) throw stErr;
      const stepByCode = new Map<string, any>();
      for (const s of steps || []) stepByCode.set(s.code, s);

      // 3. Respostas da sessão
      const { data: answers, error: aErr } = await (supabase as any)
        .from('sdr_answers')
        .select('*')
        .eq('session_id', session.id);
      if (aErr) throw aErr;

      const merged: SdrAnswer[] = (answers || [])
        .map((a: any) => {
          const step = stepByCode.get(a.step_code);
          return {
            id: a.id,
            session_id: a.session_id,
            step_code: a.step_code,
            answer_text: a.answer_text,
            llm_interpretation: a.llm_interpretation,
            answered_at: a.answered_at,
            step_order: step?.order ?? null,
            step_label: step?.label ?? null,
            question_text: step?.question_text ?? null,
          };
        })
        .sort((a, b) => (a.step_order ?? 99) - (b.step_order ?? 99));

      return { session, answers: merged };
    },
    staleTime: 10_000,
  });
}