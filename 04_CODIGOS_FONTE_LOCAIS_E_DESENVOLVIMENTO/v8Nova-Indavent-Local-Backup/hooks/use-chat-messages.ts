import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string | null;
  content: string | null;
  message_type: string;
  is_read: boolean;
  created_at: string;
};

export function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let subscription: ReturnType<typeof supabase.channel> | null = null;

    async function loadMessages() {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        if (mounted) {
          setMessages((data ?? []) as Message[]);
        }

        // Setup realtime subscription
        subscription = supabase
          .channel(`messages_${conversationId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
              if (mounted) {
                setMessages((prev) => {
                  // Prevent duplicates if we already have it
                  if (prev.some((m) => m.id === payload.new.id)) return prev;
                  return [...prev, payload.new as Message];
                });
              }
            }
          )
          .subscribe();

      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadMessages();

    return () => {
      mounted = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [conversationId]);

  return { messages, isLoading, setMessages };
}
