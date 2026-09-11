import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { SAPagination } from '@/components/super-admin/ui';
import {
  useTenants, useCreateTenant, useUpdateTenant, usePlans,
  useTenantDetail, useTenantUsers, useTenantSubscriptions, useProvisionTenant,
  type Tenant,
} from '@/hooks/use-super-admin';
import {
  Building2, Plus, Search, CheckCircle, Clock, AlertTriangle, XCircle,
  Edit2, Ban, RotateCcw, X, Loader2, Users, CreditCard,
  ExternalLink, Shield, Eye, EyeOff, Copy, Mail, Phone, MapPin,
  Calendar, Key, ArrowRight, TrendingUp, MoreVertical, Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { translateError } from '@/lib/error-messages';
import { exportToCSV, exportToPDF } from '@/lib/export-utils';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  active:    { label: 'Ativo',     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
  trial:     { label: 'Trial',     color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     icon: Clock },
  suspended: { label: 'Suspenso',  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         icon: AlertTriangle },
  cancelled: { label: 'Cancelado', color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',     icon: XCircle },
};

// ── Tipos ──────────────────────────────────────────────────────────
type FormData = {
  name: string; slug: string; email: string; phone: string;
  cnpj: string; city: string; state: string;
  owner_name: string; owner_email: string;
  plan_id: string; status: string;
};

type ProvisionForm = {
  admin_email: string;
  admin_name: string;
  admin_password: string;
};

const emptyForm: FormData = {
  name: '', slug: '', email: '', phone: '', cnpj: '',
  city: '', state: '', owner_name: '', owner_email: '',
  plan_id: '', status: 'trial',
};

const roleLabel: Record<string, string> = {
  admin: 'Admin', manager: 'Gerente', agent: 'Corretor', client: 'Cliente',
};

const INP = 'w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-all';
const INP_STYLE = { background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' };

// ── Componente Drawer de Detalhes ──────────────────────────────────
function TenantDrawer({
  tenantId,
  onClose,
  onEdit,
  onStatusChange,
}: {
  tenantId: string;
  onClose: () => void;
  onEdit: (t: Tenant) => void;
  onStatusChange: (t: Tenant, s: string) => void;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: tenant, isLoading } = useTenantDetail(tenantId);
  const { data: users = [] } = useTenantUsers(tenantId);
  const { data: subs = [] } = useTenantSubscriptions(tenantId);
  const provisionTenant = useProvisionTenant();

  const [tab, setTab] = useState<'info' | 'users' | 'subscription' | 'access'>('info');
  const [showProvision, setShowProvision] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [provForm, setProvForm] = useState<ProvisionForm>({
    admin_email: '', admin_name: '', admin_password: 'Mudar@123',
  });

  const activeSub = subs.find(s => s.status === 'active' || s.status === 'trialing');

  const handleProvision = async () => {
    if (!provForm.admin_email || !provForm.admin_name) {
      toast({ title: 'Preencha email e nome do admin', variant: 'destructive' });
      return;
    }
    try {
      await provisionTenant.mutateAsync({
        tenant_id: tenantId,
        admin_email: provForm.admin_email,
        admin_name: provForm.admin_name,
        admin_password: provForm.admin_password,
      });
      toast({ title: 'Empresa provisionada com sucesso!', description: `Usuário admin criado: ${provForm.admin_email}` });
      setShowProvision(false);
    } catch (e: unknown) {
      toast({ title: 'Erro ao provisionar empresa', description: translateError(e), variant: 'destructive' });
    }
  };

  const handleAccessTenant = () => {
    if (!tenant?.owner_email) {
      toast({ title: 'Empresa não provisionada', description: 'Provisione primeiro para criar o usuário admin.', variant: 'destructive' });
      return;
    }
    navigate('/login');
    toast({ title: `Acessando ${tenant.name}`, description: `Use o usuário administrador ${tenant.owner_email} para entrar no CRM.` });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!` });
  };

  if (isLoading || !tenant) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#c8590a' }} />
      </div>
    );
  }

  const s = statusConfig[tenant.status];
  const StatusIcon = s?.icon ?? Clock;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Drawer Header */}
      <div className="px-6 py-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(200,89,10,0.12)', border: '1px solid rgba(200,89,10,0.2)' }}>
              <Building2 className="w-5 h-5" style={{ color: '#c8590a' }} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white leading-tight">{tenant.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{tenant.slug}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status + ações rápidas */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s?.bg} ${s?.color}`}>
            <StatusIcon className="w-3 h-3" />{s?.label}
          </span>
          <button
            onClick={handleAccessTenant}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#c8590a,#e07a3a)', boxShadow: '0 2px 10px rgba(200,89,10,0.3)' }}
          >
            <ExternalLink className="w-3 h-3" /> Acessar Empresa
          </button>
          <button
            onClick={() => onEdit(tenant)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            <Edit2 className="w-3 h-3" /> Editar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {(['info', 'users', 'subscription', 'access'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={tab === t
                ? { background: 'rgba(200,89,10,0.15)', color: '#e07a3a', border: '1px solid rgba(200,89,10,0.25)' }
                : { color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }
              }
            >
              {t === 'info' ? 'Informações' : t === 'users' ? `Usuários (${users.length})` : t === 'subscription' ? 'Assinatura' : 'Acesso'}
            </button>
          ))}
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

        {/* ── TAB: INFO ── */}
        {tab === 'info' && (
          <div className="space-y-3">
            {[
              { icon: Mail, label: 'Email', value: tenant.email },
              { icon: Phone, label: 'Telefone', value: tenant.phone ?? '—' },
              { icon: MapPin, label: 'Cidade/UF', value: [tenant.city, tenant.state].filter(Boolean).join(' / ') || '—' },
              { icon: Calendar, label: 'Criado em', value: tenant.created_at ? format(new Date(tenant.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '—' },
              { icon: Calendar, label: 'Trial até', value: tenant.trial_ends_at ? format(new Date(tenant.trial_ends_at), 'dd/MM/yyyy', { locale: ptBR }) : '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2.5 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Icon className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                  <p className="text-sm text-white truncate">{value}</p>
                </div>
              </div>
            ))}

            {/* Responsável */}
            <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Responsável</p>
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(200,89,10,0.15)', color: '#c8590a' }}>
                  {(tenant.owner_name ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{tenant.owner_name ?? '—'}</p>
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{tenant.owner_email ?? '—'}</p>
                </div>
                {tenant.owner_email && (
                  <button onClick={() => copyToClipboard(tenant.owner_email!, 'Email')} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Limites do plano */}
            <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Limites</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Corretores', value: tenant.max_agents ?? '—' },
                  { label: 'Imóveis', value: tenant.max_properties ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center py-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-lg font-bold text-white">{value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações de status */}
            <div className="pt-2 flex gap-2 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {tenant.status !== 'active' && (
                <button onClick={() => onStatusChange(tenant, 'active')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-emerald-400 transition-all hover:bg-emerald-500/10">
                  <RotateCcw className="w-3.5 h-3.5" /> Ativar
                </button>
              )}
              {tenant.status !== 'suspended' && (
                <button onClick={() => onStatusChange(tenant, 'suspended')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-amber-400 transition-all hover:bg-amber-500/10">
                  <Ban className="w-3.5 h-3.5" /> Suspender
                </button>
              )}
              {tenant.status !== 'cancelled' && (
                <button onClick={() => onStatusChange(tenant, 'cancelled')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-400 transition-all hover:bg-red-500/10">
                  <XCircle className="w-3.5 h-3.5" /> Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: USERS ── */}
        {tab === 'users' && (
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-20 text-white" />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Nenhum usuário ainda</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Provisione a empresa para criar o admin</p>
              </div>
            ) : (
              users.map(u => (
                <div key={u.id} className="flex items-center gap-3 py-3 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(200,89,10,0.15)', color: '#c8590a' }}>
                    {u.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{u.full_name}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{u.email ?? '—'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                      {roleLabel[u.role] ?? u.role}
                    </span>
                    <p className="text-[10px] mt-0.5" style={{ color: u.is_active ? '#34d399' : '#f87171' }}>
                      {u.is_active ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB: SUBSCRIPTION ── */}
        {tab === 'subscription' && (
          <div className="space-y-3">
            {activeSub ? (
              <>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(200,89,10,0.08)', border: '1px solid rgba(200,89,10,0.2)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-white">{(activeSub as { plan?: { name: string } }).plan?.name ?? 'Plano'}</p>
                    <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: activeSub.status === 'active' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', color: activeSub.status === 'active' ? '#34d399' : '#fbbf24' }}>
                      {activeSub.status === 'active' ? 'Ativa' : 'Trial'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Valor mensal', value: `R$ ${Number(activeSub.amount).toFixed(2).replace('.', ',')}` },
                      { label: 'Ciclo', value: activeSub.billing_cycle === 'yearly' ? 'Anual' : 'Mensal' },
                      { label: 'Início', value: format(new Date(activeSub.started_at), 'dd/MM/yyyy', { locale: ptBR }) },
                      { label: 'Vence em', value: activeSub.ends_at ? format(new Date(activeSub.ends_at), 'dd/MM/yyyy', { locale: ptBR }) : '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                        <p className="text-sm text-white font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-400">MRR desta empresa: <strong>R$ {Number(activeSub.amount).toFixed(2).replace('.', ',')}</strong></p>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20 text-white" />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Nenhuma assinatura ativa</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Provisione e associe um plano</p>
              </div>
            )}

            {subs.length > 1 && (
              <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Histórico</p>
                {subs.slice(1).map(sub => (
                  <div key={sub.id} className="flex justify-between items-center py-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <span>{(sub as { plan?: { name: string } }).plan?.name}</span>
                    <span>{sub.cancelled_at ? format(new Date(sub.cancelled_at), 'dd/MM/yyyy') : sub.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: ACESSO ── */}
        {tab === 'access' && (
          <div className="space-y-4">
            {/* Card Acessar como Admin */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(200,89,10,0.08)', border: '1px solid rgba(200,89,10,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4" style={{ color: '#c8590a' }} />
                <p className="text-sm font-semibold" style={{ color: '#e07a3a' }}>Acessar como Admin da Empresa</p>
              </div>
              <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Abre o CRM da empresa. Faça login com as credenciais do admin do tenant.
              </p>
              {tenant.owner_email ? (
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div>
                      <p className="text-[10px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Email do Admin</p>
                      <p className="text-sm text-white font-mono">{tenant.owner_email}</p>
                    </div>
                    <button onClick={() => copyToClipboard(tenant.owner_email!, 'Email')} className="text-slate-500 hover:text-slate-300 transition-colors ml-2">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-3 text-xs text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Empresa não provisionada — crie o usuário admin abaixo</span>
                </div>
              )}
              <button
                onClick={handleAccessTenant}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#c8590a,#e07a3a)', boxShadow: '0 2px 12px rgba(200,89,10,0.3)' }}
              >
                Acessar Empresa <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card Provisionar */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Key className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <p className="text-sm font-semibold text-white">
                  {tenant.owner_user_id ? 'Reprovisionar Admin' : 'Provisionar Empresa'}
                </p>
              </div>
              <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {tenant.owner_user_id
                  ? 'Recria ou atualiza o usuário admin desta empresa.'
                  : 'Cria o usuário admin, vincula ao tenant e gera a assinatura trial.'}
              </p>

              {!showProvision ? (
                <button
                  onClick={() => {
                    setProvForm(f => ({ ...f, admin_email: tenant.owner_email ?? tenant.email, admin_name: tenant.owner_name ?? '' }));
                    setShowProvision(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
                >
                  <Shield className="w-4 h-4" />
                  {tenant.owner_user_id ? 'Reprovisionar' : 'Provisionar Agora'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Nome do Admin</label>
                    <input
                      value={provForm.admin_name}
                      onChange={e => setProvForm(f => ({ ...f, admin_name: e.target.value }))}
                      className={INP} style={INP_STYLE}
                      placeholder="João Silva"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Email do Admin</label>
                    <input
                      value={provForm.admin_email}
                      onChange={e => setProvForm(f => ({ ...f, admin_email: e.target.value }))}
                      className={INP} style={INP_STYLE}
                      placeholder="admin@empresa.com" type="email"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Senha inicial</label>
                    <div className="relative">
                      <input
                        value={provForm.admin_password}
                        onChange={e => setProvForm(f => ({ ...f, admin_password: e.target.value }))}
                        type={showPwd ? 'text' : 'password'}
                        className={INP + ' pr-10'} style={INP_STYLE}
                      />
                      <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>O admin deve alterar a senha no primeiro acesso</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowProvision(false)} className="flex-1 py-2 rounded-lg text-sm transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                      Cancelar
                    </button>
                    <button
                      onClick={handleProvision}
                      disabled={provisionTenant.isPending}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg,#c8590a,#e07a3a)' }}
                    >
                      {provisionTenant.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info de acesso */}
            <div className="flex items-start gap-2 text-xs p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', color: 'rgba(147,197,253,0.8)' }}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>O acesso como empresa abre a tela de login do CRM. Use as credenciais do admin do tenant para entrar.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente Principal ───────────────────────────────────────────
export default function SuperAdminTenants() {
  const navigate = useNavigate();
  const { data: plans = [] } = usePlans();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: tenantsData, isLoading } = useTenants(page, pageSize, { search, status: filterStatus });
  const tenants = tenantsData?.data ?? [];
  const totalCount = tenantsData?.count ?? 0;

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  const openCreate = () => {
    setEditingTenant(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t: Tenant) => {
    setEditingTenant(t);
    setForm({
      name: t.name, slug: t.slug, email: t.email,
      phone: t.phone ?? '', cnpj: t.cnpj ?? '',
      city: t.city ?? '', state: t.state ?? '',
      owner_name: t.owner_name ?? '', owner_email: t.owner_email ?? '',
      plan_id: t.plan_id ?? '', status: t.status,
    });
    setShowModal(true);
    setOpenMenu(null);
    setSelectedTenantId(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast({ title: 'Preencha nome e email', variant: 'destructive' });
      return;
    }
    try {
      if (editingTenant) {
        await updateTenant.mutateAsync({ id: editingTenant.id, ...form, status: form.status as Tenant['status'] });
        toast({ title: 'Empresa atualizada com sucesso' });
      } else {
        await createTenant.mutateAsync({ ...form, plan_id: form.plan_id || null } as Partial<Tenant>);
        toast({ title: 'Empresa criada!', description: 'Abra os detalhes e clique em Provisionar para configurar o acesso.' });
      }
      setShowModal(false);
    } catch (e: unknown) {
      toast({ title: 'Erro ao salvar empresa', description: translateError(e), variant: 'destructive' });
    }
  };

  const handleStatusChange = async (t: Tenant, status: string) => {
    try {
      await updateTenant.mutateAsync({ id: t.id, status: status as Tenant['status'] });
      toast({ title: `Status alterado para ${statusConfig[status]?.label ?? status}` });
      setOpenMenu(null);
    } catch (e: unknown) {
      toast({ title: 'Erro ao alterar status', description: translateError(e), variant: 'destructive' });
    }
  };

  const slugify = (v: string) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const FIELD = 'w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-all';
  const FIELD_STYLE = { background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' };

  // Contadores por status
  const counts = tenants.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <SuperAdminLayout>
      {/* Layout: lista + drawer lado a lado */}
      <div className={`flex gap-5 transition-all ${selectedTenantId ? 'items-start' : ''}`}>

        {/* ── Coluna principal ── */}
        <div className={`flex-1 min-w-0 space-y-5 transition-all ${selectedTenantId ? 'max-w-[calc(100%-380px)]' : ''}`}>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Empresas</h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {totalCount} empresa{totalCount !== 1 ? 's' : ''} cadastrada{totalCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(tenants, [
                  { key: 'name', label: 'Empresa' },
                  { key: 'email', label: 'Email' },
                  { key: 'owner_name', label: 'Responsável' },
                  { key: 'owner_email', label: 'Email Responsável' },
                  { key: 'status', label: 'Status' },
                  { key: 'created_at', label: 'Criado em' },
                ], 'empresas')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                title="Exportar CSV"
              >
                <Download className="w-4 h-4" /> CSV
              </button>
              <button
                onClick={() => exportToPDF('Relatório de Empresas', tenants, [
                  { key: 'name', label: 'Empresa' },
                  { key: 'email', label: 'Email' },
                  { key: 'owner_name', label: 'Responsável' },
                  { key: 'owner_email', label: 'Email Responsável' },
                  { key: 'status', label: 'Status' },
                  { key: 'created_at', label: 'Criado em', format: (v) => v ? format(new Date(String(v)), 'dd/MM/yyyy') : '-' },
                ], 'empresas')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                title="Exportar PDF"
              >
                <Download className="w-4 h-4" /> PDF
              </button>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all"
                style={{ background: 'linear-gradient(135deg,#c8590a,#e07a3a)', boxShadow: '0 4px 14px rgba(200,89,10,0.3)' }}
              >
                <Plus className="w-4 h-4" /> Nova Empresa
              </button>
            </div>
          </div>

          {/* KPI rápido */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Ativas',     value: counts.active    ?? 0, color: '#34d399' },
              { label: 'Trial',      value: counts.trial     ?? 0, color: '#fbbf24' },
              { label: 'Suspensas',  value: counts.suspended ?? 0, color: '#f87171' },
              { label: 'Canceladas', value: counts.cancelled ?? 0, color: 'rgba(255,255,255,0.3)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou responsável..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                style={FIELD_STYLE}
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm text-slate-300 focus:outline-none transition-all"
              style={FIELD_STYLE}
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspenso</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Tabela */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#c8590a' }} />
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Nenhuma empresa encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Empresa</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.35)' }}>Responsável</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: 'rgba(255,255,255,0.35)' }}>Plano</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Status</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hidden xl:table-cell" style={{ color: 'rgba(255,255,255,0.35)' }}>Criado em</th>
                      <th className="w-16 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(tenant => {
                      const s = statusConfig[tenant.status];
                      const StatusIcon = s?.icon ?? Clock;
                      const isSelected = selectedTenantId === tenant.id;
                      return (
                        <tr
                          key={tenant.id}
                          onClick={() => setSelectedTenantId(isSelected ? null : tenant.id)}
                          className="cursor-pointer transition-all"
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: isSelected ? 'rgba(200,89,10,0.08)' : undefined,
                            borderLeft: isSelected ? '2px solid #c8590a' : '2px solid transparent',
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm"
                                style={{ background: 'rgba(200,89,10,0.12)', border: '1px solid rgba(200,89,10,0.2)', color: '#c8590a' }}>
                                {tenant.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-white">{tenant.name}</p>
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{tenant.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell">
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}>{tenant.owner_name ?? '—'}</p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{tenant.owner_email ?? ''}</p>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                              {(tenant as unknown as { plan?: { name: string } }).plan?.name ?? 'Sem plano'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s?.bg} ${s?.color}`}>
                              <StatusIcon className="w-3 h-3" />{s?.label}
                            </span>
                            {!tenant.owner_user_id && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded text-amber-400" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                                Não provisionado
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 hidden xl:table-cell text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {tenant.created_at ? format(new Date(tenant.created_at), "dd/MM/yyyy", { locale: ptBR }) : '—'}
                          </td>
                          <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedTenantId(isSelected ? null : tenant.id)}
                                className="p-1.5 rounded-lg transition-colors text-xs font-medium"
                                style={isSelected
                                  ? { background: 'rgba(200,89,10,0.15)', color: '#e07a3a' }
                                  : { color: 'rgba(255,255,255,0.3)' }
                                }
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setOpenMenu(openMenu === tenant.id ? null : tenant.id)}
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{ color: 'rgba(255,255,255,0.3)' }}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {openMenu === tenant.id && (
                                  <div className="absolute right-0 top-8 z-50 w-44 rounded-xl shadow-xl overflow-hidden"
                                    style={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <button onClick={() => openEdit(tenant)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors text-left hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                      <Edit2 className="w-3.5 h-3.5" /> Editar
                                    </button>
                                    {tenant.status !== 'active' && (
                                      <button onClick={() => handleStatusChange(tenant, 'active')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-400 transition-colors hover:bg-white/5">
                                        <RotateCcw className="w-3.5 h-3.5" /> Ativar
                                      </button>
                                    )}
                                    {tenant.status !== 'suspended' && (
                                      <button onClick={() => handleStatusChange(tenant, 'suspended')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-400 transition-colors hover:bg-white/5">
                                        <Ban className="w-3.5 h-3.5" /> Suspender
                                      </button>
                                    )}
                                    {tenant.status !== 'cancelled' && (
                                      <button onClick={() => handleStatusChange(tenant, 'cancelled')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/5">
                                        <XCircle className="w-3.5 h-3.5" /> Cancelar
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <SAPagination page={page} pageSize={pageSize} total={totalCount} onPageChange={setPage} />
          </div>
        </div>

        {/* ── Drawer lateral ── */}
        {selectedTenantId && (
          <div
            className="w-[370px] shrink-0 rounded-2xl sticky top-4 overflow-hidden"
            style={{
              background: '#0f1829',
              border: '1px solid rgba(200,89,10,0.25)',
              boxShadow: '0 0 40px rgba(200,89,10,0.08)',
              maxHeight: 'calc(100vh - 5rem)',
            }}
          >
            <TenantDrawer
              tenantId={selectedTenantId}
              onClose={() => setSelectedTenantId(null)}
              onEdit={openEdit}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>

      {/* ── Modal Criar/Editar ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#0f1829', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0f1829' }}>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" style={{ color: '#c8590a' }} />
                <h2 className="text-base font-semibold text-white">
                  {editingTenant ? 'Editar Empresa' : 'Nova Empresa'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Seção: Empresa */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Dados da Empresa</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Nome da Empresa *</label>
                    <input value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                      className={FIELD} style={FIELD_STYLE} placeholder="Ex: Imobiliária Central" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Slug (URL)</label>
                    <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                      className={FIELD} style={FIELD_STYLE} placeholder="imobiliaria-central" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>CNPJ</label>
                    <input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))}
                      className={FIELD} style={FIELD_STYLE} placeholder="00.000.000/0001-00" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email *</label>
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email"
                      className={FIELD} style={FIELD_STYLE} placeholder="contato@empresa.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Telefone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className={FIELD} style={FIELD_STYLE} placeholder="(11) 99999-9999" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Cidade</label>
                    <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className={FIELD} style={FIELD_STYLE} placeholder="São Paulo" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Estado</label>
                    <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                      className={FIELD} style={FIELD_STYLE} placeholder="SP" maxLength={2} />
                  </div>
                </div>
              </div>

              {/* Seção: Responsável */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1rem' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Responsável</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Nome</label>
                    <input value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))}
                      className={FIELD} style={FIELD_STYLE} placeholder="João Silva" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
                    <input value={form.owner_email} onChange={e => setForm(f => ({ ...f, owner_email: e.target.value }))} type="email"
                      className={FIELD} style={FIELD_STYLE} placeholder="joao@empresa.com" />
                  </div>
                </div>
              </div>

              {/* Seção: Plano e Status */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1rem' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Plano e Status</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Plano</label>
                    <select value={form.plan_id} onChange={e => setForm(f => ({ ...f, plan_id: e.target.value }))}
                      className={FIELD} style={FIELD_STYLE}>
                      <option value="">Sem plano</option>
                      {plans.map(p => <option key={p.id} value={p.id}>{p.name} — R${p.price_monthly}/mês</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className={FIELD} style={FIELD_STYLE}>
                      <option value="trial">Trial (14 dias)</option>
                      <option value="active">Ativo</option>
                      <option value="suspended">Suspenso</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>

              {!editingTenant && (
                <div className="flex items-start gap-2 p-3 rounded-lg text-xs"
                  style={{ background: 'rgba(200,89,10,0.08)', border: '1px solid rgba(200,89,10,0.2)', color: '#e07a3a' }}>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Após criar, abra os detalhes da empresa e clique em <strong>"Provisionar"</strong> para criar o usuário admin e configurar o acesso.</span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={createTenant.isPending || updateTenant.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#c8590a,#e07a3a)' }}
                >
                  {(createTenant.isPending || updateTenant.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingTenant ? 'Salvar alterações' : 'Criar empresa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
