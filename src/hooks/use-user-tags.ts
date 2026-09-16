import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// NOTA (Jarvis/ATOM): tabela `user_tags` ainda NÃO existe no `database.ts` gerado
// (será criada por migration depois, RLS fará `user_id = auth.uid()`). Por isso
// definimos tipos LOCAIS e acessamos via `supabase.from('user_tags' as never)`
// para o tsc --noEmit passar. O front apenas lista/insere/exclui — a RLS garante
// que só o próprio usuário enxergue suas tags.

export interface UserTag {
  id: string;
  user_id: string;
  label: string;
  color: string;
  created_at: string | null;
}

export interface CreateUserTagInput {
  label: string;
  color: string;
}

const USER_TAGS_KEY = ['user-tags'] as const;

// Catálogo de tags personalizadas do usuário autenticado (RLS filtra user_id).
export function useUserTags() {
  return useQuery({
    queryKey: USER_TAGS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_tags' as any)
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as UserTag[];
    },
  });
}

// Criar tag no catálogo do usuário.
export function useCreateUserTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserTagInput) => {
      const { data, error } = await supabase
        .from('user_tags' as any)
        .insert({
          label: input.label,
          color: input.color,
        })
        .select()
        .single();
      if (error) throw error;
      return data as UserTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_TAGS_KEY });
    },
  });
}

// Excluir tag do catálogo do usuário.
export function useDeleteUserTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_tags' as any).delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_TAGS_KEY });
    },
  });
}