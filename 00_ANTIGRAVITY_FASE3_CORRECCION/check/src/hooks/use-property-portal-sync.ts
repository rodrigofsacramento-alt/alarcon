import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
export type PortalType = 'viva_real' | 'zap_imoveis' | 'olx' | 'facebook_marketplace';
export interface PortalSync {
  id: string;
  property_id: string;
  portal: PortalType;
  external_id: string | null;
  status: 'pending' | 'published' | 'error' | 'unpublished';
  last_sync_at: string | null;
  sync_errors: string | null;
  url: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}
export const portalLabels: Record<PortalType, string> = {
  viva_real: 'Viva Real',
  zap_imoveis: 'ZAP Imóveis',
  olx: 'OLX',
  facebook_marketplace: 'Facebook Marketplace'
};
export const portalStatusLabels: Record<string, {
  label: string;
  color: string;
}> = {
  pending: {
    label: 'Pendente',
    color: 'bg-amber-100 text-amber-700'
  },
  published: {
    label: 'Publicado',
    color: 'bg-emerald-100 text-emerald-700'
  },
  error: {
    label: 'Erro',
    color: 'bg-red-100 text-red-700'
  },
  unpublished: {
    label: 'Despublicado',
    color: 'bg-slate-100 text-slate-700'
  }
};
export function usePropertyPortalSyncs(propertyId?: string) {
  const {
    user
  } = useAuth();
  return useQuery({
    queryKey: ['property-portal-syncs', propertyId, user?.id],
    enabled: !!propertyId,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('property_portal_syncs').select('*').eq('property_id', propertyId!).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data as PortalSync[];
    }
  });
}
export function useAllPortalSyncs() {
  return useQuery({
    queryKey: ['property-portal-syncs-all'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('property_portal_syncs').select(`
          *,
          property:properties!property_portal_syncs_property_id_fkey(id, title, code, status, price)
        `).order('updated_at', {
        ascending: false
      });
      if (error) throw error;
      return data as (PortalSync & {
        property?: {
          id: string;
          title: string;
          code: string;
          status: string;
          price: number;
        } | null;
      })[];
    }
  });
}
export function useSyncPropertyToPortal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      propertyId,
      portal
    }: {
      propertyId: string;
      portal: PortalType;
    }) => {
      // Upsert: se já existe, atualiza para pending; senão, cria
      const {
        data,
        error
      } = await supabase.from('property_portal_syncs').upsert({
        property_id: propertyId,
        portal,
        status: 'pending',
        last_sync_at: new Date().toISOString()
      }, {
        onConflict: 'property_id,portal'
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['property-portal-syncs', vars.propertyId]
      });
      queryClient.invalidateQueries({
        queryKey: ['property-portal-syncs-all']
      });
    }
  });
}
export function useUnpublishFromPortal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      propertyId,
      portal
    }: {
      propertyId: string;
      portal: PortalType;
    }) => {
      const {
        data,
        error
      } = await supabase.from('property_portal_syncs').update({
        status: 'unpublished',
        last_sync_at: new Date().toISOString()
      }).eq('property_id', propertyId).eq('portal', portal).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['property-portal-syncs', vars.propertyId]
      });
      queryClient.invalidateQueries({
        queryKey: ['property-portal-syncs-all']
      });
    }
  });
}