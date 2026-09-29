import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// TCK Imoveis (29/09/2026): Loteadores/Proprietários + Loteamentos
// Tabelas novas com tenant_id + RLS (ver sql/20260929_loteadores_loteamentos.sql)

export type Loteador = {
  id: string;
  tenant_id?: string | null;
  nome: string;
  tipo: 'pessoa' | 'empresa' | string;
  telefone?: string | null;
  whatsapp?: string | null;
  documento?: string | null;
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Loteamento = {
  id: string;
  tenant_id?: string | null;
  nome: string;
  cidade?: string | null;
  estado?: string | null;
  disponibilidade: boolean;
  valor_minimo?: number | null;
  valor_maximo?: number | null;
  loteador_id?: string | null;
  loteador?: { nome: string } | null;
  created_at?: string;
  updated_at?: string;
};

export type LoteadorInput = Omit<Loteador, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;
export type LoteamentoInput = Omit<Loteamento, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'loteador'>;

// ---------- Loteadores ----------
export function useLoteadores() {
  return useQuery({
    queryKey: ['loteadores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loteadores')
        .select('*')
        .order('nome', { ascending: true });
      if (error) throw error;
      return data as Loteador[];
    },
  });
}

export function useCreateLoteador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoteadorInput) => {
      const { data, error } = await supabase.from('loteadores').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loteadores'] }),
  });
}

export function useUpdateLoteador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: LoteadorInput & { id: string }) => {
      const { data, error } = await supabase.from('loteadores').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loteadores'] }),
  });
}

export function useDeleteLoteador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('loteadores').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loteadores'] });
      qc.invalidateQueries({ queryKey: ['loteamentos'] });
    },
  });
}

// ---------- Loteamentos ----------
export function useLoteamentos() {
  return useQuery({
    queryKey: ['loteamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loteamentos')
        .select('*, loteador:loteadores(nome)')
        .order('nome', { ascending: true });
      if (error) throw error;
      return data as Loteamento[];
    },
  });
}

export function useCreateLoteamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoteamentoInput) => {
      const { data, error } = await supabase.from('loteamentos').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loteamentos'] }),
  });
}

export function useUpdateLoteamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: LoteamentoInput & { id: string }) => {
      const { data, error } = await supabase.from('loteamentos').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loteamentos'] }),
  });
}

export function useDeleteLoteamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('loteamentos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loteamentos'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

// Imóveis vinculados a um loteamento (SÓ terreno e lote) — para a ficha com deeplink
export function useLoteamentoImoveis(loteamentoId?: string | null) {
  return useQuery({
    queryKey: ['loteamento-imoveis', loteamentoId],
    enabled: !!loteamentoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, code, type, status, price, currency, amount, loteamento_id, loteador_id')
        .in('type', ['land', 'lote'])
        .eq('loteamento_id', loteamentoId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Array<{
        id: string; title: string; code: string | null; type: string; status: string;
        price: number; currency: string | null; amount: number | null;
      }>;
    },
  });
}