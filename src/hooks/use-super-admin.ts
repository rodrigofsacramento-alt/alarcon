import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Cliente Supabase já tipado com Database (inclui tenants, plans, subscriptions, etc.)
const db = supabase;

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  cnpj: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  plan_id: string | null;
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  trial_ends_at: string | null;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_user_id: string | null;
  max_agents: number | null;
  max_properties: number | null;
  settings: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
  plan?: Plan | null;
};

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_agents: number;
  max_properties: number;
  max_leads: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type Subscription = {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: string;
  amount: number;
  billing_cycle: string;
  started_at: string;
  ends_at: string | null;
  cancelled_at: string | null;
  created_at: string | null;
  tenant?: Pick<Tenant, 'id' | 'name' | 'slug'> | null;
  plan?: Pick<Plan, 'id' | 'name'> | null;
};

export type AuditLog = {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  user_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string | null;
  tenant?: Pick<Tenant, 'id' | 'name'> | null;
};

// ── TENANTS ──────────────────────────────────────────────

export function useTenants(page = 1, pageSize = 20, filters?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['sa-tenants', page, pageSize, filters],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = db
        .from('tenants')
        .select('*, plan:plans(id, name, price_monthly)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;
      return { data: data as Tenant[], count: count ?? 0 };
    },
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Tenant>) => {
      const { data, error } = await db
        .from('tenants')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-tenants'] }),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Tenant> & { id: string }) => {
      const { data, error } = await db
        .from('tenants')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-tenants'] }),
  });
}

// ── PLANS ──────────────────────────────────────────────

export function usePlans() {
  return useQuery({
    queryKey: ['sa-plans'],
    queryFn: async () => {
      const { data, error } = await db
        .from('plans')
        .select('*')
        .order('price_monthly', { ascending: true });
      if (error) throw error;
      return data as Plan[];
    },
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Plan>) => {
      const { data, error } = await db
        .from('plans')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-plans'] }),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Plan> & { id: string }) => {
      const { data, error } = await db
        .from('plans')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-plans'] }),
  });
}

// ── SUBSCRIPTIONS ─────────────────────────────────────

export function useSubscriptions(page = 1, pageSize = 20, filters?: { status?: string; cycle?: string }) {
  return useQuery({
    queryKey: ['sa-subscriptions', page, pageSize, filters],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = db
        .from('subscriptions')
        .select('*, tenant:tenants(id, name, slug), plan:plans(id, name)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.cycle && filters.cycle !== 'all') {
        query = query.eq('billing_cycle', filters.cycle);
      }

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;
      return { data: data as Subscription[], count: count ?? 0 };
    },
  });
}

// ── AUDIT LOGS ────────────────────────────────────────

export function useAuditLogs(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['sa-audit-logs', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await db
        .from('audit_logs')
        .select('*, tenant:tenants(id, name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data: data as AuditLog[], count: count ?? 0 };
    },
  });
}

// ── TENANT DETAIL ────────────────────────────────────

export function useTenantDetail(tenantId: string | null) {
  return useQuery({
    queryKey: ['sa-tenant-detail', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await db
        .from('tenants')
        .select('*, plan:plans(*)')
        .eq('id', tenantId)
        .single();
      if (error) throw error;
      return data as Tenant;
    },
  });
}

export function useTenantUsers(tenantId: string | null) {
  return useQuery({
    queryKey: ['sa-tenant-users', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await db
        .from('profiles')
        .select('id, full_name, email, role, is_active, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Array<{
        id: string;
        full_name: string;
        email: string | null;
        role: string;
        is_active: boolean | null;
        created_at: string | null;
      }>;
    },
  });
}

export function useTenantSubscriptions(tenantId: string | null) {
  return useQuery({
    queryKey: ['sa-tenant-subs', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await db
        .from('subscriptions')
        .select('*, plan:plans(id, name, price_monthly)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Subscription[];
    },
  });
}

export function useProvisionTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      tenant_id: string;
      admin_email: string;
      admin_name: string;
      admin_password: string;
    }) => {
      const { data, error } = await db.rpc('provision_tenant', {
        p_tenant_id:       payload.tenant_id,
        p_admin_email:     payload.admin_email,
        p_admin_name:      payload.admin_name,
        p_admin_password:  payload.admin_password,
      });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Erro ao provisionar tenant');
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['sa-tenants'] });
      qc.invalidateQueries({ queryKey: ['sa-tenant-detail', vars.tenant_id] });
      qc.invalidateQueries({ queryKey: ['sa-tenant-users', vars.tenant_id] });
      qc.invalidateQueries({ queryKey: ['sa-metrics'] });
    },
  });
}

// ── SA FINANCIAL TRANSACTIONS ────────────────────────

export type SAFinancialTransaction = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  subcategory: string | null;
  description: string;
  amount_cents: number;
  currency: string;
  transaction_date: string;
  reference: string | null;
  tenant_id: string | null;
  subscription_id: string | null;
  created_by: string | null;
  metadata: Record<string, unknown>;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string | null;
  updated_at: string | null;
  tenant?: Pick<Tenant, 'id' | 'name'> | null;
};

export const SA_INCOME_CATEGORIES = [
  { value: 'subscription', label: 'Assinatura' },
  { value: 'upgrade', label: 'Upgrade de Plano' },
  { value: 'addon', label: 'Módulo Extra' },
  { value: 'other_income', label: 'Outras Receitas' },
] as const;

export const SA_EXPENSE_CATEGORIES = [
  { value: 'infrastructure', label: 'Infraestrutura' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'payroll', label: 'Folha de Pagamento' },
  { value: 'software', label: 'Licenças/Software' },
  { value: 'taxes', label: 'Impostos' },
  { value: 'other_expense', label: 'Outras Despesas' },
] as const;

export function useSAFinancialTransactions(filters?: {
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['sa-financial', filters],
    queryFn: async () => {
      let query = db
        .from('sa_financial_transactions')
        .select('*, tenant:tenants(id, name)')
        .order('transaction_date', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SAFinancialTransaction[];
    },
  });
}

export function useCreateSAFinancialTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<SAFinancialTransaction>) => {
      const { data, error } = await db
        .from('sa_financial_transactions')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-financial'] });
      qc.invalidateQueries({ queryKey: ['sa-financial-summary'] });
    },
  });
}

export function useUpdateSAFinancialTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<SAFinancialTransaction> & { id: string }) => {
      const { data, error } = await db
        .from('sa_financial_transactions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-financial'] });
      qc.invalidateQueries({ queryKey: ['sa-financial-summary'] });
    },
  });
}

export function useDeleteSAFinancialTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db
        .from('sa_financial_transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-financial'] });
      qc.invalidateQueries({ queryKey: ['sa-financial-summary'] });
    },
  });
}

export function useSAFinancialSummary(period?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['sa-financial-summary', period],
    queryFn: async () => {
      let query = db
        .from('sa_financial_transactions')
        .select('type, amount_cents, status')
        .eq('status', 'confirmed');

      if (period?.startDate) {
        query = query.gte('transaction_date', period.startDate);
      }
      if (period?.endDate) {
        query = query.lte('transaction_date', period.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const transactions = data as Array<{ type: string; amount_cents: number; status: string }>;

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount_cents, 0);

      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount_cents, 0);

      return {
        totalIncome,
        totalExpense,
        netResult: totalIncome - totalExpense,
        transactionCount: transactions.length,
      };
    },
  });
}

// ── SA ANNOUNCEMENTS ─────────────────────────────────

export type SAAnnouncement = {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  target_type: 'all' | 'plan' | 'status' | 'tenant';
  target_value: string | null;
  sent_count: number;
  created_by: string | null;
  sent_at: string | null;
  scheduled_at: string | null;
  is_sent: boolean;
  created_at: string | null;
};

export function useAnnouncements() {
  return useQuery({
    queryKey: ['sa-announcements'],
    queryFn: async () => {
      const { data, error } = await db
        .from('sa_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SAAnnouncement[];
    },
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<SAAnnouncement>) => {
      const { data, error } = await db.from('sa_announcements').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-announcements'] }),
  });
}

export function useBroadcastAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<{ success: boolean; sent_count?: number; error?: string }> => {
      // Garantir sessão fresca antes da RPC
      const { data: { session } } = await db.auth.getSession();
      if (session?.expires_at && session.expires_at * 1000 - Date.now() < 5 * 60 * 1000) {
        await db.auth.refreshSession();
      }
      const { data, error } = await db.rpc('broadcast_announcement', { p_announcement_id: id });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Erro ao enviar');
      return data as { success: boolean; sent_count?: number; error?: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-announcements'] }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from('sa_announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-announcements'] }),
  });
}

// ── SA SETTINGS ──────────────────────────────────────

export type SASetting = {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string | null;
};

export function useSASettings() {
  return useQuery({
    queryKey: ['sa-settings'],
    queryFn: async () => {
      const { data, error } = await db.from('sa_settings').select('*').order('key');
      if (error) throw error;
      return data as SASetting[];
    },
  });
}

export function useUpdateSASetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { data, error } = await db
        .from('sa_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-settings'] }),
  });
}

// ── SUPER ADMINS MGMT ────────────────────────────────

export function useSuperAdminsList() {
  return useQuery({
    queryKey: ['sa-super-admins-list'],
    queryFn: async () => {
      const { data, error } = await db
        .from('super_admins')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Array<{ id: string; user_id: string; email: string; full_name: string | null; is_active: boolean; created_at: string }>;
    },
  });
}

// ── SA HEALTH ────────────────────────────────────────

export function useSAHealth() {
  return useQuery({
    queryKey: ['sa-health'],
    queryFn: async () => {
      const { data, error } = await db.rpc('sa_health_metrics');
      if (error) throw error;
      return data as {
        trials_expiring_7d: number;
        trials_expired: number;
        inactive_tenants_30d: number;
        churn_at_risk: number;
        subs_ending_30d: number;
        mrr_at_risk: number;
      };
    },
  });
}

// ── SUBSCRIPTION ACTIONS ─────────────────────────────

export type SAWhatsappHealthRow = {
  session_id: string;
  tenant_id: string;
  tenant_name: string | null;
  session_name: string;
  session_status: string;
  phone_number: string | null;
  session_last_error: string | null;
  session_updated_at: string | null;
  broker_status: string | null;
  last_event_at: string | null;
  last_success_at: string | null;
  last_error_at: string | null;
  broker_last_error: string | null;
  pending_outgoing: number;
  failed_24h: number;
  duplicates_24h: number;
  media_failed_24h: number;
};

export function useSAWhatsappHealth() {
  return useQuery({
    queryKey: ['sa-whatsapp-health'],
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await db.rpc('sa_whatsapp_health');
      if (error) throw error;
      return (Array.isArray(data) ? data : []) as SAWhatsappHealthRow[];
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data, error } = await db.rpc('cancel_subscription', {
        p_subscription_id: id,
        p_reason: reason ?? null,
      });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-subscriptions'] });
      qc.invalidateQueries({ queryKey: ['sa-tenants'] });
    },
  });
}

export function useUpdateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Subscription> & { id: string }) => {
      const { data, error } = await db
        .from('subscriptions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Subscription;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-subscriptions'] });
      qc.invalidateQueries({ queryKey: ['sa-tenants'] });
      qc.invalidateQueries({ queryKey: ['sa-metrics'] });
    },
  });
}

// ── USER ACTIONS ─────────────────────────────────────

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      const { data, error } = await db.rpc('toggle_user_active', {
        p_user_id: userId,
        p_active: active,
      });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-users-global'] });
      qc.invalidateQueries({ queryKey: ['sa-tenant-users'] });
    },
  });
}

export function useGlobalUsers(
  page = 1,
  pageSize = 20,
  filters?: { search?: string; role?: string; tenant_id?: string; status?: string }
) {
  return useQuery({
    queryKey: ['sa-users-global', page, pageSize, filters],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = db
        .from('profiles')
        .select('id, full_name, email, role, is_active, tenant_id, created_at, tenant:tenants(id, name)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.ilike('full_name', `%${filters.search}%`);
      }
      if (filters?.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }
      if (filters?.tenant_id && filters.tenant_id !== 'all') {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      if (filters?.status === 'active') {
        query = query.eq('is_active', true);
      } else if (filters?.status === 'inactive') {
        query = query.eq('is_active', false);
      }

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;
      return {
        data: data as Array<{
          id: string;
          full_name: string;
          email: string | null;
          role: string;
          is_active: boolean | null;
          tenant_id: string | null;
          created_at: string | null;
          tenant: { id: string; name: string } | null;
        }>,
        count: count ?? 0,
      };
    },
  });
}

// ── REVENUE TIMESERIES ───────────────────────────────

export function useRevenueTimeseries(months: number = 6) {
  return useQuery({
    queryKey: ['sa-revenue-timeseries', months],
    queryFn: async () => {
      const since = new Date();
      since.setMonth(since.getMonth() - months);
      const { data, error } = await db
        .from('sa_financial_transactions')
        .select('type, amount_cents, transaction_date, status')
        .eq('status', 'confirmed')
        .gte('transaction_date', since.toISOString().slice(0, 10))
        .order('transaction_date');
      if (error) throw error;

      const buckets = new Map<string, { income: number; expense: number }>();
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toISOString().slice(0, 7);
        buckets.set(key, { income: 0, expense: 0 });
      }
      (data as Array<{ type: string; amount_cents: number; transaction_date: string }>).forEach(t => {
        const key = t.transaction_date.slice(0, 7);
        const b = buckets.get(key);
        if (!b) return;
        if (t.type === 'income') b.income += t.amount_cents;
        else b.expense += t.amount_cents;
      });
      return Array.from(buckets.entries()).map(([month, v]) => ({
        month,
        income: v.income / 100,
        expense: v.expense / 100,
        net: (v.income - v.expense) / 100,
      }));
    },
  });
}

// ── MRR SNAPSHOTS ───────────────────────────────────

export function useMrrSnapshots(months: number = 12) {
  return useQuery({
    queryKey: ['sa-mrr-snapshots', months],
    queryFn: async () => {
      const { data, error } = await db
        .from('sa_mrr_snapshots')
        .select('*')
        .order('snapshot_month', { ascending: true })
        .limit(months);
      if (error) throw error;
      return data as Array<{
        id: string;
        snapshot_month: string;
        total_mrr: number;
        active_subs_count: number;
        trial_mrr: number;
        details: Array<{ plan_name: string; mrr: number; count: number }>;
        created_at: string;
      }>;
    },
  });
}

// ── ASAAS PAYMENTS ──────────────────────────────────

export type AsaasPayment = {
  id: string;
  tenant_id: string;
  sa_financial_transaction_id: string | null;
  asaas_payment_id: string;
  asaas_customer_id: string;
  billing_type: string;
  status: string;
  value_cents: number;
  due_date: string | null;
  invoice_url: string | null;
  pix_qr_code: string | null;
  pix_payload: string | null;
  boleto_url: string | null;
  boleto_bar_code: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export function useAsaasPayments() {
  return useQuery({
    queryKey: ['asaas-payments'],
    queryFn: async () => {
      const { data, error } = await db
        .from('asaas_payments')
        .select('*, tenants(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (AsaasPayment & { tenants: { name: string } })[];
    },
  });
}

export function useCreateAsaasCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      tenant_id: string;
      value: number;
      billing_type?: string;
      due_date: string;
      description?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('asaas-create-charge', {
        body: payload,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { success: boolean; asaas_payment: Record<string, unknown>; db_payment: AsaasPayment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asaas-payments'] });
      queryClient.invalidateQueries({ queryKey: ['sa-financial-transactions'] });
    },
  });
}

// ── GLOBAL METRICS ────────────────────────────────────

export function useSuperAdminMetrics() {
  return useQuery({
    queryKey: ['sa-metrics'],
    queryFn: async () => {
      const [
        { count: totalTenants },
        { count: activeTenants },
        { count: trialTenants },
        { count: totalUsers },
        { data: revenueData },
      ] = await Promise.all([
        db.from('tenants').select('*', { count: 'exact', head: true }),
        db.from('tenants').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        db.from('tenants').select('*', { count: 'exact', head: true }).eq('status', 'trial'),
        db.from('profiles').select('*', { count: 'exact', head: true }),
        db.from('subscriptions').select('amount').eq('status', 'active'),
      ]);

      const mrr = (revenueData ?? []).reduce((acc, s) => acc + (s.amount || 0), 0);

      return {
        totalTenants: totalTenants ?? 0,
        activeTenants: activeTenants ?? 0,
        trialTenants: trialTenants ?? 0,
        suspendedTenants: (totalTenants ?? 0) - (activeTenants ?? 0) - (trialTenants ?? 0),
        totalUsers: totalUsers ?? 0,
        mrr,
        arr: mrr * 12,
      };
    },
  });
}
