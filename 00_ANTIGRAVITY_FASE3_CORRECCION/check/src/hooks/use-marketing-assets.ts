import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
export interface MarketingAsset {
  id: string;
  tenant_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  category: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  publicUrl?: string;
}
export function useMarketingAssets() {
  return useQuery({
    queryKey: ['marketing-assets'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('marketing_assets').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // Mapeia para adicionar publicUrl se for renderizar direto
      return data.map(asset => {
        const {
          data: publicUrl
        } = supabase.storage.from('marketing_assets').getPublicUrl(asset.file_path);
        return {
          ...asset,
          publicUrl: publicUrl.publicUrl
        };
      });
    }
  });
}
export function useUploadMarketingAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      name,
      category
    }: {
      file: File;
      name: string;
      category: string;
    }) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileType = file.type.startsWith('video') ? 'video' : 'image';
      // Gera um path único, idealmente o bucket poderia estar organizado por tenant
      const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      // 1. Upload para o Storage
      const {
        error: uploadError
      } = await supabase.storage.from('marketing_assets').upload(path, file);
      if (uploadError) throw uploadError;

      // 2. Busca tenant_id automaticamente
      const {
        data: tenantId,
        error: tenantError
      } = await supabase.rpc('get_my_tenant_id');
      if (tenantError) throw tenantError;

      // 3. Insere no Banco de Dados
      const {
        data,
        error: dbError
      } = await supabase.from('marketing_assets').insert([{
        tenant_id: tenantId,
        file_name: name || file.name,
        file_path: path,
        file_type: fileType,
        category: category,
        file_size: file.size
      }]).select().single();
      if (dbError) {
        // Fallback: se falhar de inserir no banco, a gente idealmente apagaria do bucket
        await supabase.storage.from('marketing_assets').remove([path]);
        throw dbError;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['marketing-assets']
      });
      toast.success('Mídia enviada com sucesso!');
    },
    onError: error => {
      console.error(error);
      toast.error('Erro ao fazer upload da mídia.');
    }
  });
}
export function useDeleteMarketingAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (asset: MarketingAsset) => {
      // 1. Deleta do Storage
      const {
        error: storageError
      } = await supabase.storage.from('marketing_assets').remove([asset.file_path]);
      if (storageError) throw storageError;

      // 2. Deleta do DB
      const {
        error: dbError
      } = await supabase.from('marketing_assets').delete().eq('id', asset.id);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['marketing-assets']
      });
      toast.success('Mídia removida com sucesso!');
    },
    onError: error => {
      console.error(error);
      toast.error('Erro ao deletar mídia.');
    }
  });
}
export function useUpdateMarketingAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      category
    }: {
      id: string;
      name: string;
      category: string;
    }) => {
      const {
        data,
        error
      } = await supabase.from('marketing_assets').update({
        file_name: name,
        category
      }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['marketing-assets']
      });
      toast.success('Informações atualizadas com sucesso!');
    },
    onError: error => {
      console.error(error);
      toast.error('Erro ao atualizar informações.');
    }
  });
}