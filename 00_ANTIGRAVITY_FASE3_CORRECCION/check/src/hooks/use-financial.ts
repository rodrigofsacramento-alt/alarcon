import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/types/database';
export type FinancialTransaction = Tables<'financial_transactions'> & {
  agent?: Tables<'profiles'> | null;
};
export function useFinancialTransactions(filters?: {
  type?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ['financial_transactions', filters],
    queryFn: async () => {
      let query = supabase.from('financial_transactions').select('*, agent:profiles!financial_transactions_agent_id_fkey(id, full_name, role)').order('date', {
        ascending: false
      });
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return data as FinancialTransaction[];
    }
  });
}
export type FinancialStats = {
  totalIncome: number;
  totalExpense: number;
  totalCommissions: number;
  totalOperational: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  monthlyData: {
    month: string;
    income: number;
    expense: number;
  }[];
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
      const {
        data: current,
        error: e1
      } = await supabase.from('financial_transactions').select('*, agent:profiles!financial_transactions_agent_id_fkey(id, full_name, role)').gte('date', dateFrom).order('date', {
        ascending: false
      });
      if (e1) throw e1;

      // Previous period (for comparison)
      const {
        data: previous,
        error: e2
      } = await supabase.from('financial_transactions').select('type, amount').gte('date', prevFrom).lt('date', prevTo);
      if (e2) throw e2;

      // Last 12 months for chart
      const chartFrom = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const chartFromStr = `${chartFrom.getFullYear()}-${String(chartFrom.getMonth() + 1).padStart(2, '0')}-01`;
      const {
        data: chartData,
        error: e3
      } = await supabase.from('financial_transactions').select('type, amount, date').gte('date', chartFromStr).order('date', {
        ascending: true
      });
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
        if (tx.type === 'income') {
          totalIncome += amt;
          incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + amt;
        } else {
          totalExpense += amt;
          expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + amt;
          if (tx.category === 'commission') totalCommissions += amt;
          if (tx.category === 'operational') totalOperational += amt;
        }
      });
      let previousPeriodIncome = 0;
      let previousPeriodExpense = 0;
      prevTxs.forEach(tx => {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income') previousPeriodIncome += amt;else previousPeriodExpense += amt;
      });

      // Build monthly chart data
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyMap: Record<string, {
        income: number;
        expense: number;
      }> = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date(chartFrom.getFullYear(), chartFrom.getMonth() + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = {
          income: 0,
          expense: 0
        };
      }
      (chartData || []).forEach(tx => {
        const key = (tx.date as string).substring(0, 7);
        if (monthlyMap[key]) {
          const amt = Number(tx.amount) || 0;
          if (tx.type === 'income') monthlyMap[key].income += amt;else monthlyMap[key].expense += amt;
        }
      });
      const monthlyData = Object.entries(monthlyMap).map(([key, val]) => {
        const [y, m] = key.split('-');
        return {
          month: monthNames[parseInt(m) - 1],
          ...val
        };
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
        previousPeriodExpense
      } as FinancialStats;
    }
  });
}
export function useCreateFinancialTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: TablesInsert<'financial_transactions'>) => {
      const {
        data,
        error
      } = await supabase.from('financial_transactions').insert(transaction).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['financial_transactions']
      });
      queryClient.invalidateQueries({
        queryKey: ['financial_stats']
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard-stats']
      });
    }
  });
}