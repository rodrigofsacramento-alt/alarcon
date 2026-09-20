import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/types/database';

export type FinancialCategory = Tables<'financial_categories'>;
export type FinancialBank = Tables<'financial_banks'>;

export type FinancialTransaction = Omit<Tables<'financial_transactions'>, 'category' | 'bank'> & {
  category?: FinancialCategory | null;
  bank?: FinancialBank | null;
};

// Fetch real categories (RLS já filtra por tenant get_my_tenant_id())
export function useFinancialCategories() {
  return useQuery({
    queryKey: ['financial_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_categories')
        .select('id, name, category, ordem, is_active')
        .order('ordem', { ascending: true });
      if (error) throw error;
      return (data || []) as FinancialCategory[];
    },
  });
}

const CATEGORY_SELECT =
  'category:financial_categories!financial_transactions_category_id_fkey(id, name, category)';

const BANK_SELECT =
  'bank:financial_banks!financial_transactions_bank_id_fkey(id, name, is_active)';

export function useFinancialTransactions(filters?: {
  type?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ['financial_transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('financial_transactions')
        .select(`*, ${CATEGORY_SELECT}`)
        .order('date', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as FinancialTransaction[];
    },
  });
}

export type LedgerFilters = {
  type?: string;
  categoryId?: string;
  bankId?: string;
  dateFrom?: string;
  dateTo?: string;
  realizedOnly?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type LedgerResult = {
  transactions: FinancialTransaction[];
  total: number;
  page: number;
  pageSize: number;
};

// Livro Geral / extrato completo com paginação + filtros + contagem exacta
export function useFinancialLedger(filters: LedgerFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useQuery({
    queryKey: ['financial_ledger', filters],
    queryFn: async () => {
      let query = supabase
        .from('financial_transactions')
        .select(`*, ${CATEGORY_SELECT}, ${BANK_SELECT}`, { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to);

      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
      if (filters?.bankId) query = query.eq('bank_id', filters.bankId);
      if (filters?.dateFrom) query = query.gte('date', filters.dateFrom);
      if (filters?.dateTo) query = query.lte('date', filters.dateTo);
      if (filters?.realizedOnly) query = query.eq('is_realized', true);
      if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        transactions: (data || []) as FinancialTransaction[],
        total: count ?? 0,
        page,
        pageSize,
      } as LedgerResult;
    },
  });
}

export type FinancialStats = {
  totalIncome: number;
  totalExpense: number;
  totalCommissions: number;
  totalOperational: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  monthlyData: { month: string; income: number; expense: number }[];
  recentTransactions: FinancialTransaction[];
  previousPeriodIncome: number;
  previousPeriodExpense: number;
};

export function useFinancialStats(period: 'month' | 'quarter' | 'year' = 'month') {
  return useQuery({
    queryKey: ['financial_stats', period],
    queryFn: async () => {
      const now = new Date();
      let dateFrom: string;
      let prevFrom: string;
      let prevTo: string;

      if (period === 'month') {
        dateFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevFrom = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-01`;
        prevTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      } else if (period === 'quarter') {
        const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        dateFrom = `${qStart.getFullYear()}-${String(qStart.getMonth() + 1).padStart(2, '0')}-01`;
        const prevQStart = new Date(qStart.getFullYear(), qStart.getMonth() - 3, 1);
        prevFrom = `${prevQStart.getFullYear()}-${String(prevQStart.getMonth() + 1).padStart(2, '0')}-01`;
        prevTo = dateFrom;
      } else {
        dateFrom = `${now.getFullYear()}-01-01`;
        prevFrom = `${now.getFullYear() - 1}-01-01`;
        prevTo = dateFrom;
      }

      // Current period
      const { data: current, error: e1 } = await supabase
        .from('financial_transactions')
        .select(`*, ${CATEGORY_SELECT}`)
        .gte('date', dateFrom)
        .order('date', { ascending: false });
      if (e1) throw e1;

      // Previous period (for comparison)
      const { data: previous, error: e2 } = await supabase
        .from('financial_transactions')
        .select('type, amount')
        .gte('date', prevFrom)
        .lt('date', prevTo);
      if (e2) throw e2;

      // Last 12 months for chart
      const chartFrom = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const chartFromStr = `${chartFrom.getFullYear()}-${String(chartFrom.getMonth() + 1).padStart(2, '0')}-01`;
      const { data: chartData, error: e3 } = await supabase
        .from('financial_transactions')
        .select('type, amount, date')
        .gte('date', chartFromStr)
        .order('date', { ascending: true });
      if (e3) throw e3;

      const txs = (current || []) as FinancialTransaction[];
      const prevTxs = previous || [];

      let totalIncome = 0;
      let totalExpense = 0;
      let totalCommissions = 0;
      let totalOperational = 0;
      const incomeByCategory: Record<string, number> = {};
      const expenseByCategory: Record<string, number> = {};

      txs.forEach(tx => {
        const amt = Number(tx.amount) || 0;
        const catName = tx.category?.name ?? (tx.category_id || 'sem-categoria');
        if (tx.type === 'income') {
          totalIncome += amt;
          incomeByCategory[catName] = (incomeByCategory[catName] || 0) + amt;
        } else {
          totalExpense += amt;
          expenseByCategory[catName] = (expenseByCategory[catName] || 0) + amt;
          if (tx.category?.category === 'Custo Variável') totalCommissions += amt;
          if (tx.category?.category === 'Custo Fixo') totalOperational += amt;
        }
      });

      let previousPeriodIncome = 0;
      let previousPeriodExpense = 0;
      prevTxs.forEach(tx => {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income') previousPeriodIncome += amt;
        else previousPeriodExpense += amt;
      });

      // Build monthly chart data
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyMap: Record<string, { income: number; expense: number }> = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date(chartFrom.getFullYear(), chartFrom.getMonth() + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = { income: 0, expense: 0 };
      }
      (chartData || []).forEach(tx => {
        const key = (tx.date as string).substring(0, 7);
        if (monthlyMap[key]) {
          const amt = Number(tx.amount) || 0;
          if (tx.type === 'income') monthlyMap[key].income += amt;
          else monthlyMap[key].expense += amt;
        }
      });

      // ─────────────────────────────────────────────────────────────
      // FATURAMENTO AUTORITATIVO (override controlado — decisão 20/09)
      // O faturamento real destes meses NÃO está em `ptoch` (banco que o app
      // lê); vive no projeto Vercel/Supabase `njyckmhocrucqqetexju`. Valores
      // confirmados pelo Comandante (usuário legítimo/admin):
      //   Abr = 9M · Mai = 19M · Jun = 112M · Jul = 122M · Ago = 112M
      // Regra de segurança: só AGE no gráfico (`income`/entrada), NÃO toca
      // `financial_transactions` (dados de clientes). Despesas seguem do banco.
      const faturamentoOverride: Record<string, number> = {
        '2026-04': 9_000_000,
        '2026-05': 19_000_000,
        '2026-06': 112_000_000,
        '2026-07': 122_000_000,
        '2026-08': 112_000_000,
      };
      Object.entries(faturamentoOverride).forEach(([k, v]) => {
        if (monthlyMap[k]) monthlyMap[k].income = v;
      });
      // ─────────────────────────────────────────────────────────────
      const monthlyData = Object.entries(monthlyMap).map(([key, val]) => {
        const [y, m] = key.split('-');
        return { month: monthNames[parseInt(m) - 1], ...val };
      });

      return {
        totalIncome,
        totalExpense,
        totalCommissions,
        totalOperational,
        incomeByCategory,
        expenseByCategory,
        monthlyData,
        recentTransactions: txs.slice(0, 10),
        previousPeriodIncome,
        previousPeriodExpense,
      } as FinancialStats;
    },
  });
}

export function useCreateFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: TablesInsert<'financial_transactions'>) => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert(transaction)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
