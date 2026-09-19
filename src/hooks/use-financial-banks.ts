import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/types/database';
import type { FinancialTransaction } from '@/hooks/use-financial';

export type FinancialBank = Tables<'financial_banks'>;

export type BankSaldo = {
  bank_id: string;
  banco: string;
  saldo: number;
  entradas: number;
  saidas: number;
  n_transacciones: number;
};

/**
 * Lista los bancos del tenant.
 * financial_banks NÃO tiene RLS tenant-scope (policy ALL public), por eso
 * filtra por tenant_id explícito usando el tenantId del usuario autenticado.
 */
export function useFinancialBanks(tenantId: string | null) {
  return useQuery({
    queryKey: ['financial_banks', tenantId],
    queryFn: async () => {
      if (!tenantId) return [] as FinancialBank[];
      const { data, error } = await supabase
        .from('financial_banks')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true });
      if (error) throw error;
      return (data || []) as FinancialBank[];
    },
    enabled: !!tenantId,
  });
}

/**
 * Saldo por banco, agregado desde financial_transactions (RLS tenant-scope).
 * Replica exacto la view financial_saldo: saldo = Σ(income) − Σ(expense) de
 * transacciones realizadas, agrupado por bank_id. NO usa la view (no tipada).
 */
export function useBankSaldo(banks: FinancialBank[] | undefined) {
  return useQuery({
    queryKey: ['financial_bank_saldo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('id, bank_id, type, amount, is_realized')
        .eq('is_realized', true);
      if (error) throw error;

      const txs = (data || []) as Pick<FinancialTransaction, 'bank_id' | 'type' | 'amount' | 'is_realized'>[];
      const saldoMap: Record<string, { saldo: number; entradas: number; saidas: number; n: number }> = {};

      txs.forEach((tx) => {
        if (!tx.bank_id) return;
        const amt = Number(tx.amount) || 0;
        const bucket = saldoMap[tx.bank_id] || (saldoMap[tx.bank_id] = { saldo: 0, entradas: 0, saidas: 0, n: 0 });
        if (tx.type === 'income') {
          bucket.saldo += amt;
          bucket.entradas += amt;
        } else {
          bucket.saldo -= amt;
          bucket.saidas += amt;
        }
        bucket.n += 1;
      });

      const result: BankSaldo[] = (banks || []).map((b) => {
        const r = saldoMap[b.id] || { saldo: 0, entradas: 0, saidas: 0, n: 0 };
        return { bank_id: b.id, banco: b.name, saldo: r.saldo, entradas: r.entradas, saidas: r.saidas, n_transacciones: r.n };
      });
      return result;
    },
    enabled: !!banks && banks.length > 0,
  });
}

/** Movimientos de una cuenta concreta (detalle al hacer click en un banco). */
export function useBankTransactions(bankId: string | null) {
  return useQuery({
    queryKey: ['financial_bank_transactions', bankId],
    queryFn: async () => {
      let query = supabase
        .from('financial_transactions')
        .select(`*, category:financial_categories!financial_transactions_category_id_fkey(id, name, category)`)
        .order('date', { ascending: false });
      if (bankId) query = query.eq('bank_id', bankId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as FinancialTransaction[];
    },
    enabled: !!bankId,
  });
}

/** Crear un banco nuevo. */
export function useCreateFinancialBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bank: Omit<TablesInsert<'financial_banks'>, 'tenant_id'> & { tenant_id: string }) => {
      const { data, error } = await supabase
        .from('financial_banks')
        .insert({ ...bank })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financial_banks'] });
    },
  });
}

/** Activar/desactivar banco (toggle de visibilidade). */
export function useToggleBankActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('financial_banks')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financial_banks'] });
    },
  });
}