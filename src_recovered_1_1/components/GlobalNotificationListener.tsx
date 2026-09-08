import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export function GlobalNotificationListener() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notifiedConversations = useRef<Set<string>>(new Set());
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Carrega o cache inicial de conversas atribuídas ao corretor para evitar toasts duplicados ao iniciar a sessão
    const initCache = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('id')
          .eq('agent_id', user.id);
        
        if (error) throw error;
        if (data) {
          data.forEach((c) => notifiedConversations.current.add(c.id));
        }
      } catch (err) {
        console.error("Erro ao carregar cache de conversas no listener global:", err);
      }
    };

    initCache();

    // Inscreve no canal de atualizações em tempo real da tabela conversations
    const channel = supabase
      .channel('global-conversations-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        async (payload) => {
          const currentUser = userRef.current;
          if (!currentUser) return;

          const newRow = payload.new as { id: string; agent_id: string | null; client_id: string } | null;
          if (!newRow) return;

          // Se a conversa foi atribuída a este usuário (corretor ou admin)
          if (newRow.agent_id === currentUser.id) {
            // E não foi notificada ainda nesta sessão
            if (!notifiedConversations.current.has(newRow.id)) {
              notifiedConversations.current.add(newRow.id);

              // Busca o nome do cliente associado para exibir no toast
              let clientName = 'Cliente';
              try {
                const { data } = await supabase
                  .from('profiles')
                  .select('full_name')
                  .eq('id', newRow.client_id)
                  .single();
                if (data?.full_name) {
                  clientName = data.full_name;
                }
              } catch (e) {
                console.error("Erro ao obter perfil do cliente para notificação:", e);
              }

              // Dispara o toast global notificando o corretor
              toast({
                title: "Novo atendimento recebido!",
                description: `Você foi designado para atender o cliente: ${clientName}`,
                action: (
                  <ToastAction
                    altText="Visualizar"
                    onClick={() => navigate('/atendimento')}
                  >
                    Visualizar
                  </ToastAction>
                ),
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, navigate]);

  return null;
}
