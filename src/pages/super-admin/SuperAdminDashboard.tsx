import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  useSuperAdminMetrics,
  useTenants,
  useSAFinancialSummary,
  useRevenueTimeseries,
  useSAHealth,
  usePlans,
  useSubscriptions,
  useMrrSnapshots,
} from '@/hooks/use-super-admin';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { SAPageHeader, SAStatCard, SACard, SABadge, SA_TOKENS, SAEmptyState, SAButton } from '@/components/super-admin/ui';
import {
  Building2, Users, DollarSign, TrendingUp, AlertTriangle,
  Clock, BarChart3, Activity, Layers, Zap, ArrowUpRight,
  Wallet, Banknote, ShieldAlert, ChevronRight, ChevronLeft, Shield,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);

const fmtMonth = (key: string) => {
  const [y, m] = key.split('-');
  return format(new Date(Number(y), Number(m) - 1, 1), 'MMM/yy', { locale: ptBR });
};

const PLAN_COLORS = ['#c8590a', '#1e2d5e', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { data: metrics } = useSuperAdminMetrics();
  const { data: tenantsData } = useTenants();
  const tenants = tenantsData?.data ?? [];
  const now = new Date();
  const monthPeriod = {
    startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
  };
  const { data: financialSummary } = useSAFinancialSummary(monthPeriod);
  const { data: revenueData = [] } = useRevenueTimeseries(6);
  const { data: health } = useSAHealth();
  const { data: plans = [] } = usePlans();
  const { data: subsData } = useSubscriptions();
  const subs = subsData?.data ?? [];
  const { data: mrrSnapshots = [] } = useMrrSnapshots(12);
  const [activeSlide, setActiveSlide] = useState(0);
  const qc = useQueryClient();

  useEffect(() => {
    const channels = [
      supabase
        .channel('sa-tenants-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tenants' }, () => {
          qc.invalidateQueries({ queryKey: ['sa-tenants'] });
          qc.invalidateQueries({ queryKey: ['sa-metrics'] });
          qc.invalidateQueries({ queryKey: ['sa-health'] });
        })
        .subscribe(),
      supabase
        .channel('sa-subscriptions-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
          qc.invalidateQueries({ queryKey: ['sa-subscriptions'] });
          qc.invalidateQueries({ queryKey: ['sa-metrics'] });
          qc.invalidateQueries({ queryKey: ['sa-health'] });
        })
        .subscribe(),
      supabase
        .channel('sa-financial-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sa_financial_transactions' }, () => {
          qc.invalidateQueries({ queryKey: ['sa-financial'] });
          qc.invalidateQueries({ queryKey: ['sa-revenue-timeseries'] });
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach(ch => ch.unsubscribe());
    };
  }, [qc]);

  const mrrInCents = (metrics?.mrr ?? 0) * 100;
  const arrInCents = (metrics?.arr ?? 0) * 100;

  const churnEstimate = useMemo(() => {
    const total = metrics?.totalTenants ?? 0;
    if (total === 0) return 0;
    const cancelled = tenants.filter(t => t.status === 'cancelled').length;
    return Number(((cancelled / total) * 100).toFixed(1));
  }, [tenants, metrics]);

  const planDistribution = useMemo(() => {
    const map = new Map<string, number>();
    tenants.forEach(t => {
      const planName = t.plan?.name || 'Sem plano';
      map.set(planName, (map.get(planName) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [tenants]);

  const recentTenants = useMemo(() => tenants.slice(0, 5), [tenants]);

  const alerts = useMemo(() => {
    const list: Array<{ icon: typeof AlertTriangle; tone: 'warning' | 'danger' | 'info'; label: string; count: number; link: string }> = [];
    if (health) {
      if (health.trials_expiring_7d > 0) list.push({ icon: Clock, tone: 'warning', label: 'Trials expirando em 7 dias', count: health.trials_expiring_7d, link: '/super-admin/tenants' });
      if (health.trials_expired > 0) list.push({ icon: AlertTriangle, tone: 'danger', label: 'Trials já expirados', count: health.trials_expired, link: '/super-admin/tenants' });
      if (health.churn_at_risk > 0) list.push({ icon: ShieldAlert, tone: 'danger', label: 'Empresas suspensas', count: health.churn_at_risk, link: '/super-admin/tenants' });
      if (health.subs_ending_30d > 0) list.push({ icon: Activity, tone: 'info', label: 'Assinaturas vencendo em 30 dias', count: health.subs_ending_30d, link: '/super-admin/subscriptions' });
      if (health.mrr_at_risk > 0) list.push({ icon: Shield, tone: 'danger', label: 'MRR em risco', count: health.mrr_at_risk, link: '/super-admin/subscriptions' });
    }
    return list;
  }, [health]);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <SAPageHeader
          title="Visão Executiva"
          description="Indicadores estratégicos do seu SaaS em tempo real"
          icon={BarChart3}
          actions={
            <SAButton variant="secondary" icon={Wallet} onClick={() => navigate('/super-admin/financial')}>
              Painel Financeiro
            </SAButton>
          }
        />

        {/* KPIs principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SAStatCard
            label="MRR"
            value={fmtCurrency(metrics?.mrr ?? 0)}
            icon={Banknote}
            iconColor="#10b981"
            subtext="Receita recorrente mensal"
          />
          <SAStatCard
            label="ARR Projetado"
            value={fmtCurrency(metrics?.arr ?? 0)}
            icon={TrendingUp}
            iconColor={SA_TOKENS.accent}
            subtext="MRR x 12 meses"
          />
          <SAStatCard
            label="Empresas Ativas"
            value={`${metrics?.activeTenants ?? 0}/${metrics?.totalTenants ?? 0}`}
            icon={Building2}
            iconColor="#60a5fa"
            subtext={`${metrics?.trialTenants ?? 0} em trial`}
          />
          <SAStatCard
            label="Churn Estimado"
            value={`${churnEstimate}%`}
            icon={Zap}
            iconColor={churnEstimate > 5 ? '#f87171' : '#10b981'}
            subtext="Empresas canceladas / total"
          />
        </div>

        {/* KPIs financeiros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SAStatCard
            label="Receitas (este mês)"
            value={fmtCurrency((financialSummary?.totalIncome ?? 0) / 100)}
            icon={ArrowUpRight}
            iconColor="#10b981"
            subtext={`${financialSummary?.transactionCount ?? 0} transações`}
          />
          <SAStatCard
            label="Despesas (este mês)"
            value={fmtCurrency((financialSummary?.totalExpense ?? 0) / 100)}
            icon={Wallet}
            iconColor="#f87171"
          />
          <SAStatCard
            label="Resultado líquido"
            value={fmtCurrency((financialSummary?.netResult ?? 0) / 100)}
            icon={DollarSign}
            iconColor={(financialSummary?.netResult ?? 0) >= 0 ? '#10b981' : '#f87171'}
          />
          <SAStatCard
            label="MRR em Risco"
            value={fmtCurrency(health?.mrr_at_risk ?? 0)}
            icon={Shield}
            iconColor={(health?.mrr_at_risk ?? 0) > 0 ? '#f87171' : '#10b981'}
            subtext="De tenants suspensas/trial"
          />
        </div>

        {/* Carrossel de gráficos */}
        <div className="relative overflow-hidden rounded-2xl mb-6" style={{ background: SA_TOKENS.surfaceCard, border: `1px solid ${SA_TOKENS.borderSubtle}` }}>
          {/* Header do carrossel */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <div>
              {activeSlide === 0 && (
                <span className="block">
                  <h3 className="font-semibold text-sm" style={{ color: SA_TOKENS.textPrimary }}>Receita x Despesa</h3>
                  <p className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Últimos 6 meses</p>
                </span>
              )}
              {activeSlide === 1 && (
                <span className="block">
                  <h3 className="font-semibold text-sm" style={{ color: SA_TOKENS.textPrimary }}>Funil de Conversão</h3>
                  <p className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Ciclo de vida das empresas</p>
                </span>
              )}
              {activeSlide === 2 && (
                <span className="block">
                  <h3 className="font-semibold text-sm" style={{ color: SA_TOKENS.textPrimary }}>Evolução do MRR</h3>
                  <p className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Últimos 12 meses</p>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: SA_TOKENS.textMuted }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveSlide(Math.min(2, activeSlide + 1))}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: SA_TOKENS.textMuted }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slides */}
          <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
            {/* Slide 1: Receita x Despesa */}
            <div className="w-full shrink-0 px-5 pb-5">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f87171" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={SA_TOKENS.border} />
                    <XAxis dataKey="month" tickFormatter={fmtMonth} stroke={SA_TOKENS.textMuted} style={{ fontSize: 11 }} />
                    <YAxis stroke={SA_TOKENS.textMuted} style={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.border}`, borderRadius: 8, color: SA_TOKENS.textPrimary }}
                      labelFormatter={(v) => fmtMonth(String(v))}
                      formatter={(val: number) => fmtCurrency(val)}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" name="Receita" />
                    <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} fill="url(#expenseGrad)" name="Despesa" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Slide 2: Funil de Conversão */}
            <div className="w-full shrink-0 px-5 pb-5">
              {(() => {
                const total = tenants.length;
                const trialCount = tenants.filter(t => t.status === 'trial').length;
                const activeCount = tenants.filter(t => t.status === 'active').length;
                const payingCount = subs.filter(s => s.status === 'active').length;
                const steps = [
                  { label: 'Cadastradas', value: total, color: '#60a5fa', width: 100 },
                  { label: 'Em Trial', value: trialCount, color: '#f59e0b', width: total ? (trialCount / total) * 100 : 0 },
                  { label: 'Ativas', value: activeCount, color: '#10b981', width: total ? (activeCount / total) * 100 : 0 },
                  { label: 'Pagantes', value: payingCount, color: SA_TOKENS.accent, width: total ? (payingCount / total) * 100 : 0 },
                ];
                return total === 0 ? (
                  <SAEmptyState icon={Users} title="Sem empresas" description="Cadastre a primeira empresa para visualizar o funil" />
                ) : (
                  <div className="space-y-3 py-2 max-w-2xl mx-auto">
                    {steps.map((s, i) => (
                      <div key={s.label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: SA_TOKENS.textSecondary }}>{s.label}</span>
                          <span className="font-medium" style={{ color: SA_TOKENS.textPrimary }}>{s.value}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(s.width, 4)}%`, background: s.color }} />
                        </div>
                        {i < steps.length - 1 && (
                          <div className="flex justify-end text-xs" style={{ color: SA_TOKENS.textMuted }}>
                            {s.value > 0 ? `${((steps[i + 1].value / s.value) * 100).toFixed(0)}% conversão` : '0% conversão'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Slide 3: Evolução do MRR */}
            <div className="w-full shrink-0 px-5 pb-5">
              {mrrSnapshots.length === 0 ? (
                <SAEmptyState icon={TrendingUp} title="Sem dados históricos" description="O snapshot do MRR será capturado mensalmente automaticamente." />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mrrSnapshots}>
                      <defs>
                        <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={SA_TOKENS.accent} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={SA_TOKENS.accent} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={SA_TOKENS.border} />
                      <XAxis
                        dataKey="snapshot_month"
                        tickFormatter={(v) => {
                          const [y, m] = String(v).split('-');
                          return format(new Date(Number(y), Number(m) - 1, 1), 'MMM/yy', { locale: ptBR });
                        }}
                        stroke={SA_TOKENS.textMuted}
                        style={{ fontSize: 11 }}
                      />
                      <YAxis stroke={SA_TOKENS.textMuted} style={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.border}`, borderRadius: 8, color: SA_TOKENS.textPrimary }}
                        formatter={(val: number) => fmtCurrency(val)}
                        labelFormatter={(v) => {
                          const [y, m] = String(v).split('-');
                          return format(new Date(Number(y), Number(m) - 1, 1), 'MMMM yyyy', { locale: ptBR });
                        }}
                      />
                      <Area type="monotone" dataKey="total_mrr" stroke={SA_TOKENS.accent} strokeWidth={2} fill="url(#mrrGrad)" name="MRR" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Dots de navegação */}
          <div className="flex justify-center gap-2 pb-4">
            {[0, 1, 2].map(i => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className="w-2 h-2 rounded-full transition-colors"
                style={{ background: i === activeSlide ? SA_TOKENS.accent : 'rgba(255,255,255,0.2)' }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição por plano */}
          <SACard title="Distribuição por Plano" description={`${tenants.length} empresas`}>
            {planDistribution.length === 0 ? (
              <SAEmptyState icon={Layers} title="Sem dados" description="Cadastre empresas e planos" />
            ) : (
              <div className="h-72 flex flex-col">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planDistribution}
                        innerRadius={50}
                        outerRadius={85}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {planDistribution.map((_, i) => (
                          <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: SA_TOKENS.surfaceElevated,
                          border: `1px solid ${SA_TOKENS.border}`,
                          borderRadius: 8,
                          color: SA_TOKENS.textPrimary,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: SA_TOKENS.borderSubtle }}>
                  {planDistribution.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: PLAN_COLORS[i % PLAN_COLORS.length] }} />
                        <span style={{ color: SA_TOKENS.textSecondary }}>{p.name}</span>
                      </div>
                      <span className="font-medium" style={{ color: SA_TOKENS.textPrimary }}>{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SACard>

          {/* Alertas operacionais */}
          <SACard title="Alertas Operacionais" description="Itens que precisam da sua atenção"
                  action={
                    <SAButton variant="ghost" size="sm" icon={ChevronRight} onClick={() => navigate('/super-admin/health')}>
                      Ver tudo
                    </SAButton>
                  }>
            {alerts.length === 0 ? (
              <SAEmptyState icon={Activity} title="Tudo em ordem" description="Nenhum alerta operacional no momento" />
            ) : (
              <div className="space-y-2">
                {alerts.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(a.link)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/5"
                    style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}
                  >
                    <SABadge tone={a.tone} icon={a.icon}>{a.count}</SABadge>
                    <span className="flex-1 text-sm" style={{ color: SA_TOKENS.textPrimary }}>{a.label}</span>
                    <ChevronRight className="w-4 h-4" style={{ color: SA_TOKENS.textMuted }} />
                  </button>
                ))}
              </div>
            )}
          </SACard>
        </div>

        {/* Empresas Recentes */}
        <SACard title="Empresas Recentes" description="Últimas cadastradas"
                  action={
                    <SAButton variant="ghost" size="sm" icon={ChevronRight} onClick={() => navigate('/super-admin/tenants')}>
                      Ver todas
                    </SAButton>
                  }>
            {recentTenants.length === 0 ? (
              <SAEmptyState icon={Building2} title="Nenhuma empresa" description="Cadastre a primeira empresa" />
            ) : (
              <div className="space-y-2">
                {recentTenants.map(t => (
                  <button
                    key={t.id}
                    onClick={() => navigate('/super-admin/tenants')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/5"
                    style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm shrink-0"
                         style={{ background: SA_TOKENS.accentBg, color: SA_TOKENS.accentLight }}>
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: SA_TOKENS.textPrimary }}>{t.name}</p>
                      <p className="text-xs truncate" style={{ color: SA_TOKENS.textMuted }}>
                        {t.owner_email || 'Sem admin provisionado'}
                      </p>
                    </div>
                    <SABadge tone={
                      t.status === 'active' ? 'success' :
                      t.status === 'trial' ? 'warning' :
                      t.status === 'suspended' ? 'danger' : 'neutral'
                    }>
                      {t.status === 'active' ? 'Ativo' : t.status === 'trial' ? 'Trial' : t.status === 'suspended' ? 'Suspenso' : 'Cancelado'}
                    </SABadge>
                  </button>
                ))}
              </div>
            )}
          </SACard>
        </div>
    </SuperAdminLayout>
  );
}
