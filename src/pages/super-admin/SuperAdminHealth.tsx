import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import {
  useSAHealth, useSAWhatsappHealth, useTenants, useSubscriptions,
} from '@/hooks/use-super-admin';
import {
  SAPageHeader, SAStatCard, SACard, SABadge, SAEmptyState, SAButton, SA_TOKENS,
} from '@/components/super-admin/ui';
import {
  Activity, AlertTriangle, Clock, ShieldAlert, TrendingDown,
  Building2, ChevronRight, Calendar, AlertOctagon,
  CheckCircle2, Banknote, BellRing, Loader2,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);

export default function SuperAdminHealth() {
  const navigate = useNavigate();
  const { data: health, isLoading: isHealthLoading, error: healthError } = useSAHealth();
  const { data: whatsappHealth = [] } = useSAWhatsappHealth();
  const { data: tenantsData } = useTenants();
  const tenants = tenantsData?.data ?? [];
  const { data: subsData } = useSubscriptions();
  const subs = subsData?.data ?? [];

  // Trials expirando em 7 dias
  const expiringTrials = useMemo(() => {
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + 7);
    return tenants
      .filter(t => t.status === 'trial' && t.trial_ends_at && new Date(t.trial_ends_at) >= now && new Date(t.trial_ends_at) <= limit)
      .sort((a, b) => new Date(a.trial_ends_at!).getTime() - new Date(b.trial_ends_at!).getTime());
  }, [tenants]);

  // Suspensos
  const suspended = useMemo(() => tenants.filter(t => t.status === 'suspended'), [tenants]);

  // Inativos (sem login recente — proxy: usar created_at como aproximação)
  const inactiveTenants = useMemo(() => {
    const now = new Date();
    return tenants.filter(t => {
      if (t.status !== 'active') return false;
      if (!t.updated_at) return false;
      return differenceInDays(now, new Date(t.updated_at)) > 30;
    });
  }, [tenants]);

  // Subs vencendo
  const expiringSubs = useMemo(() => {
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + 30);
    return subs
      .filter(s => s.status === 'active' && s.ends_at && new Date(s.ends_at) >= now && new Date(s.ends_at) <= limit)
      .sort((a, b) => new Date(a.ends_at!).getTime() - new Date(b.ends_at!).getTime());
  }, [subs]);

  // Fallback client-side caso a RPC falhe (403, etc.)
  const clientHealth = useMemo(() => {
    const now = new Date();
    const limit7 = new Date();
    limit7.setDate(limit7.getDate() + 7);
    const limit30 = new Date();
    limit30.setDate(limit30.getDate() + 30);

    const trialsExpiring7d = tenants.filter(
      t => t.status === 'trial' && t.trial_ends_at &&
        new Date(t.trial_ends_at) >= now && new Date(t.trial_ends_at) <= limit7
    ).length;

    const trialsExpired = tenants.filter(
      t => t.status === 'trial' && t.trial_ends_at && new Date(t.trial_ends_at) < now
    ).length;

    const churnAtRisk = tenants.filter(t => t.status === 'suspended').length;

    const subsEnding30d = subs.filter(
      s => s.status === 'active' && s.ends_at &&
        new Date(s.ends_at) >= now && new Date(s.ends_at) <= limit30
    ).length;

    const mrrAtRisk = subs
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    return {
      trials_expiring_7d: trialsExpiring7d,
      trials_expired: trialsExpired,
      churn_at_risk: churnAtRisk,
      subs_ending_30d: subsEnding30d,
      mrr_at_risk: mrrAtRisk,
    };
  }, [tenants, subs]);

  const effectiveHealth = health ?? clientHealth;

  const allOk = (
    effectiveHealth.trials_expiring_7d === 0 &&
    effectiveHealth.trials_expired === 0 &&
    effectiveHealth.churn_at_risk === 0 &&
    effectiveHealth.subs_ending_30d === 0
  );

  const whatsappTotals = useMemo(() => {
    return whatsappHealth.reduce((acc, row) => {
      acc.connected += row.session_status === 'connected' ? 1 : 0;
      acc.pending += Number(row.pending_outgoing || 0);
      acc.failed += Number(row.failed_24h || 0);
      acc.mediaFailed += Number(row.media_failed_24h || 0);
      return acc;
    }, { connected: 0, pending: 0, failed: 0, mediaFailed: 0 });
  }, [whatsappHealth]);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <SAPageHeader
          title="Saúde do SaaS"
          description="Monitoramento operacional do negócio em tempo real"
          icon={Activity}
        />

        {/* Loading state */}
        {isHealthLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: SA_TOKENS.accent }} />
            <span className="ml-3 text-sm" style={{ color: SA_TOKENS.textMuted }}>Carregando métricas...</span>
          </div>
        )}

        {/* Error state */}
        {healthError && (
          <SACard>
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.12)' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#f87171' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: SA_TOKENS.textPrimary }}>Erro ao carregar métricas</p>
                <p className="text-sm" style={{ color: SA_TOKENS.textMuted }}>
                  {healthError instanceof Error ? healthError.message : 'Verifique se você está logado como super admin.'}
                </p>
              </div>
            </div>
          </SACard>
        )}

        {/* Visão geral de saúde */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SAStatCard
            label="Trials a vencer (7d)"
            value={effectiveHealth.trials_expiring_7d}
            icon={Clock}
            iconColor="#f59e0b"
            subtext="Convertem ou cancelam"
          />
          <SAStatCard
            label="Trials expirados"
            value={effectiveHealth.trials_expired}
            icon={AlertTriangle}
            iconColor="#f87171"
            subtext="Precisam de ação"
          />
          <SAStatCard
            label="Churn em risco"
            value={effectiveHealth.churn_at_risk}
            icon={ShieldAlert}
            iconColor="#f87171"
            subtext="Empresas suspensas"
          />
          <SAStatCard
            label="MRR em risco"
            value={fmtCurrency(effectiveHealth.mrr_at_risk)}
            icon={TrendingDown}
            iconColor="#f59e0b"
            subtext="Subs em status de risco"
          />
        </div>

        {allOk && (
          <SACard>
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: SA_TOKENS.textPrimary }}>Tudo em ordem</p>
                <p className="text-sm" style={{ color: SA_TOKENS.textMuted }}>Nenhum alerta operacional crítico no momento</p>
              </div>
            </div>
          </SACard>
        )}

        <SACard
          title="WhatsApp operacional"
          description="Visao exclusiva do Super Admin para sessoes, filas e falhas do broker"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-xl" style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}>
              <p className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Conectadas</p>
              <p className="text-xl font-semibold" style={{ color: SA_TOKENS.textPrimary }}>{whatsappTotals.connected}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}>
              <p className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Pendentes</p>
              <p className="text-xl font-semibold" style={{ color: SA_TOKENS.textPrimary }}>{whatsappTotals.pending}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}>
              <p className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Falhas 24h</p>
              <p className="text-xl font-semibold" style={{ color: whatsappTotals.failed > 0 ? '#f87171' : SA_TOKENS.textPrimary }}>{whatsappTotals.failed}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}>
              <p className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Midias falhas</p>
              <p className="text-xl font-semibold" style={{ color: whatsappTotals.mediaFailed > 0 ? '#f59e0b' : SA_TOKENS.textPrimary }}>{whatsappTotals.mediaFailed}</p>
            </div>
          </div>

          {whatsappHealth.length === 0 ? (
            <SAEmptyState icon={Activity} title="Nenhuma sessao WhatsApp encontrada" />
          ) : (
            <div className="space-y-2">
              {whatsappHealth.slice(0, 8).map(row => {
                const hasRisk = row.session_status !== 'connected' || row.pending_outgoing > 0 || row.failed_24h > 0 || row.media_failed_24h > 0;
                return (
                  <div
                    key={row.session_id}
                    className="flex flex-col gap-3 p-3 rounded-xl md:flex-row md:items-center md:justify-between"
                    style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate" style={{ color: SA_TOKENS.textPrimary }}>
                          {row.tenant_name || row.tenant_id}
                        </p>
                        <SABadge tone={row.session_status === 'connected' ? 'success' : hasRisk ? 'warning' : 'info'}>
                          {row.session_status}
                        </SABadge>
                      </div>
                      <p className="text-xs truncate" style={{ color: SA_TOKENS.textMuted }}>
                        {row.phone_number || 'Sem telefone'} · {row.session_name}
                      </p>
                      {(row.broker_last_error || row.session_last_error) && (
                        <p className="text-xs truncate mt-1" style={{ color: '#f59e0b' }}>
                          {row.broker_last_error || row.session_last_error}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs md:w-[360px]">
                      <div>
                        <p style={{ color: SA_TOKENS.textMuted }}>Pend.</p>
                        <p className="font-semibold" style={{ color: SA_TOKENS.textPrimary }}>{row.pending_outgoing}</p>
                      </div>
                      <div>
                        <p style={{ color: SA_TOKENS.textMuted }}>Falhas</p>
                        <p className="font-semibold" style={{ color: row.failed_24h > 0 ? '#f87171' : SA_TOKENS.textPrimary }}>{row.failed_24h}</p>
                      </div>
                      <div>
                        <p style={{ color: SA_TOKENS.textMuted }}>Dup.</p>
                        <p className="font-semibold" style={{ color: SA_TOKENS.textPrimary }}>{row.duplicates_24h}</p>
                      </div>
                      <div>
                        <p style={{ color: SA_TOKENS.textMuted }}>Midia</p>
                        <p className="font-semibold" style={{ color: row.media_failed_24h > 0 ? '#f59e0b' : SA_TOKENS.textPrimary }}>{row.media_failed_24h}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SACard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trials expirando */}
          <SACard
            title="Trials expirando em 7 dias"
            description={`${expiringTrials.length} empresas`}
            action={
              expiringTrials.length > 0 && (
                <SAButton size="sm" variant="ghost" icon={ChevronRight} onClick={() => navigate('/super-admin/tenants')}>
                  Ver todas
                </SAButton>
              )
            }
          >
            {expiringTrials.length === 0 ? (
              <SAEmptyState icon={Clock} title="Nenhum trial expirando" description="Tudo tranquilo nos próximos 7 dias" />
            ) : (
              <div className="space-y-2">
                {expiringTrials.slice(0, 6).map(t => {
                  const days = differenceInDays(new Date(t.trial_ends_at!), new Date());
                  return (
                    <button
                      key={t.id}
                      onClick={() => navigate('/super-admin/tenants')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5"
                      style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}
                    >
                      <Building2 className="w-4 h-4 shrink-0" style={{ color: SA_TOKENS.textMuted }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: SA_TOKENS.textPrimary }}>{t.name}</p>
                        <p className="text-xs truncate" style={{ color: SA_TOKENS.textMuted }}>{t.owner_email || 'Sem admin'}</p>
                      </div>
                      <SABadge tone={days <= 2 ? 'danger' : days <= 5 ? 'warning' : 'info'}>
                        {days === 0 ? 'Hoje' : `${days}d`}
                      </SABadge>
                    </button>
                  );
                })}
              </div>
            )}
          </SACard>

          {/* Empresas suspensas */}
          <SACard
            title="Empresas suspensas"
            description={`${suspended.length} empresas precisam de atenção`}
          >
            {suspended.length === 0 ? (
              <SAEmptyState icon={ShieldAlert} title="Nenhuma empresa suspensa" />
            ) : (
              <div className="space-y-2">
                {suspended.slice(0, 6).map(t => (
                  <button
                    key={t.id}
                    onClick={() => navigate('/super-admin/tenants')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5"
                    style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}
                  >
                    <Building2 className="w-4 h-4 shrink-0" style={{ color: '#f87171' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: SA_TOKENS.textPrimary }}>{t.name}</p>
                      <p className="text-xs truncate" style={{ color: SA_TOKENS.textMuted }}>{t.owner_email || 'Sem admin'}</p>
                    </div>
                    <SABadge tone="danger">Suspenso</SABadge>
                  </button>
                ))}
              </div>
            )}
          </SACard>

          {/* Assinaturas vencendo */}
          <SACard
            title="Assinaturas vencendo (30d)"
            description={`${expiringSubs.length} assinaturas`}
            action={
              expiringSubs.length > 0 && (
                <SAButton size="sm" variant="ghost" icon={ChevronRight} onClick={() => navigate('/super-admin/subscriptions')}>
                  Ver todas
                </SAButton>
              )
            }
          >
            {expiringSubs.length === 0 ? (
              <SAEmptyState icon={Calendar} title="Nenhuma assinatura vencendo" description="Próximos 30 dias estão tranquilos" />
            ) : (
              <div className="space-y-2">
                {expiringSubs.slice(0, 6).map(s => {
                  const days = differenceInDays(new Date(s.ends_at!), new Date());
                  return (
                    <button
                      key={s.id}
                      onClick={() => navigate('/super-admin/subscriptions')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5"
                      style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}
                    >
                      <Banknote className="w-4 h-4 shrink-0" style={{ color: SA_TOKENS.accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: SA_TOKENS.textPrimary }}>
                          {s.tenant?.name || '—'}
                        </p>
                        <p className="text-xs truncate" style={{ color: SA_TOKENS.textMuted }}>
                          {fmtCurrency(s.amount || 0)} · {s.plan?.name || ''}
                        </p>
                      </div>
                      <SABadge tone={days <= 7 ? 'warning' : 'info'}>
                        {days}d
                      </SABadge>
                    </button>
                  );
                })}
              </div>
            )}
          </SACard>

          {/* Empresas inativas */}
          <SACard
            title="Empresas pouco ativas"
            description={`${inactiveTenants.length} empresas sem atividade recente (30d+)`}
          >
            {inactiveTenants.length === 0 ? (
              <SAEmptyState icon={Activity} title="Tudo ativo" description="Todas as empresas tiveram atividade recente" />
            ) : (
              <div className="space-y-2">
                {inactiveTenants.slice(0, 6).map(t => {
                  const days = t.updated_at ? differenceInDays(new Date(), new Date(t.updated_at)) : 0;
                  return (
                    <button
                      key={t.id}
                      onClick={() => navigate('/super-admin/tenants')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5"
                      style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}
                    >
                      <AlertOctagon className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: SA_TOKENS.textPrimary }}>{t.name}</p>
                        <p className="text-xs truncate" style={{ color: SA_TOKENS.textMuted }}>
                          Última atualização há {days} dias
                        </p>
                      </div>
                      <BellRing className="w-3.5 h-3.5" style={{ color: SA_TOKENS.textMuted }} />
                    </button>
                  );
                })}
              </div>
            )}
          </SACard>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
