import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

/** Venda de imigración = transação income migrada (P2: source='import_imigracao'). */
export type VendaImigracao = Tables<'financial_transactions'>;

export type SalesSummary = {
  totalVendas: number;
  totalValor: number;
  media: number;
  maiorValor: number;
  vendas: VendaImigracao[];
};

/** Extrai o nome do comprador do nome composto "COMPRADOR — residência…". */
export function parseBuyerName(nome: string): string {
  const idx = nome.indexOf('—');
  if (idx > 0) return nome.slice(0, idx).trim();
  const sep = nome.indexOf('-');
  if (sep > 0) return nome.slice(0, sep).trim();
  return nome.trim();
}

/**
 * Vendas & Imigración. Fonte: financial_transactions WHERE source='import_imigracao'
 * (as 7 vendas migradas do P2). Não usa sales_records (vazio no tenant).
 * RLS tenant-scope nativo (financial_transactions) — sem filtro explícito.
 */
export function useFinancialSales() {
  return useQuery({
    queryKey: ['financial_vendas_imigracao'],
    queryFn: async (): Promise<SalesSummary> => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('source', 'import_imigracao')
        .order('date', { ascending: false })
        .order('amount', { ascending: false });
      if (error) throw error;
      const vendas = (data || []) as VendaImigracao[];
      const totalValor = vendas.reduce((s, v) => s + (Number(v.amount) || 0), 0);
      return {
        totalVendas: vendas.length,
        totalValor,
        media: vendas.length ? totalValor / vendas.length : 0,
        maiorValor: vendas.length ? Math.max(...vendas.map((v) => Number(v.amount) || 0)) : 0,
        vendas,
      };
    },
  });
}