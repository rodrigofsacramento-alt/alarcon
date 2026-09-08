import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';
export type MarketingPost = Tables<'marketing_posts'> & {
  asset?: Tables<'marketing_assets'> & {
    publicUrl?: string;
  } | null;
  author?: Tables<'profiles'> | null;
};
export function useMarketingPosts() {
  return useQuery({
    queryKey: ['marketing-posts'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('marketing_posts').select(`
          *,
          asset:marketing_assets!marketing_posts_asset_id_fkey(*),
          author:profiles!marketing_posts_author_id_fkey(id, full_name, avatar_url)
        `).order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // Adiciona publicUrl aos assets para renderização
      const postsWithPublicUrl = (data || []).map(post => {
        const asset = post.asset as any;
        if (asset?.file_path) {
          const {
            data: urlData
          } = supabase.storage.from('marketing_assets').getPublicUrl(asset.file_path);
          asset.publicUrl = urlData.publicUrl;
        }
        return post;
      });
      return postsWithPublicUrl as MarketingPost[];
    }
  });
}
export function useCreateMarketingPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: Omit<TablesInsert<'marketing_posts'>, 'tenant_id'>) => {
      const {
        data: tenantId,
        error: tenantError
      } = await supabase.rpc('get_my_tenant_id');
      if (tenantError) throw tenantError;
      const {
        data,
        error
      } = await supabase.from('marketing_posts').insert({
        ...post,
        tenant_id: tenantId
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['marketing-posts']
      });
      queryClient.invalidateQueries({
        queryKey: ['marketing-dashboard']
      });
    }
  });
}
export function useUpdateMarketingPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: TablesUpdate<'marketing_posts'> & {
      id: string;
    }) => {
      const {
        data,
        error
      } = await supabase.from('marketing_posts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['marketing-posts']
      });
      queryClient.invalidateQueries({
        queryKey: ['marketing-dashboard']
      });
    }
  });
}
export function useDeleteMarketingPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const {
        error
      } = await supabase.from('marketing_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['marketing-posts']
      });
      queryClient.invalidateQueries({
        queryKey: ['marketing-dashboard']
      });
    }
  });
}