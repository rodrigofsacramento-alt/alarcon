import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Catálogo de tags personalizadas POR USUARIO, agrupadas por CATEGORÍA.
// Tabelas (PROD, migradas 21/09): 
//   user_tag_categories(id, user_id DEFAULT auth.uid(), name, color, created_at)
//   user_tags(id, user_id DEFAULT auth.uid(), label, color, category_id FK cascade, created_at)
// RLS: SELECT/INSERT/UPDATE/DELETE con user_id = auth.uid() → só o dono ve/gere.
// O front NUNCA envia user_id — ve do JWT. Por eso NAO estan en database.ts:
// accedemos via `from('...' as any)` para pasar `tsc --noEmit`.
// ============================================================================

export interface UserTagCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string | null;
}

export interface UserTag {
  id: string;
  user_id: string;
  label: string;
  color: string;
  category_id: string | null;
  created_at: string | null;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
}

export interface CreateUserTagInput {
  label: string;
  color: string;
  category_id?: string | null;
}

const CATEGORIES_KEY = ['user-tag-categories'] as const;
const TAGS_KEY = ['user-tags'] as const;

// --- Categorías ---------------------------------------------------------------
export function useUserTagCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_tag_categories' as never)
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as UserTagCategory[];
    },
  });
}

export function useCreateUserTagCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const { data, error } = await supabase
        .from('user_tag_categories' as never)
        .insert({ name: input.name, color: input.color } as any)
        .select()
        .single();
      if (error) throw error;
      return data as UserTagCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useDeleteUserTagCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // ON DELETE CASCADE borra las tags de la categoría
      const { error } = await supabase
        .from('user_tag_categories' as never)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
    },
  });
}

// --- Tags --------------------------------------------------------------------
export function useUserTags() {
  return useQuery({
    queryKey: TAGS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_tags' as never)
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as UserTag[];
    },
  });
}

export function useCreateUserTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateUserTagInput) => {
      const { data, error } = await supabase
        .from('user_tags' as never)
        .insert({
          label: input.label,
          color: input.color,
          category_id: input.category_id || null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as UserTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
    },
  });
}

export function useDeleteUserTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_tags' as never).delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
    },
  });
}

// Util: devolver tags (todas) e categorías agrupadas para sugerencias.
export function groupTagsByCategory(tags: UserTag[], categories: UserTagCategory[]) {
  const out: { category: UserTagCategory | null; tags: UserTag[] }[] = [];
  const uncategorized = tags.filter((t) => !t.category_id);
  if (uncategorized.length > 0) out.push({ category: null, tags: uncategorized });
  for (const c of categories) {
    const ct = tags.filter((t) => t.category_id === c.id);
    if (ct.length > 0) out.push({ category: c, tags: ct });
  }
  return out;
}