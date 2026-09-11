import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import {
  useSubscriptions,
  useCancelSubscription,
  useUpdateSubscription,
  usePlans,
  type Subscription,
} from '@/hooks/use-super-admin';
import {
  SAPageHeader, SAStatCard, SACard, SABadge, SAEmptyState, SAButton,
  SAFilterBar, SAPagination, SA_TOKENS,
} from '@/components/super-admin/ui';
import {
  CreditCard, Filter, CheckCircle2, XCircle, Clock, Building2,
  Banknote, MoreHorizontal, Ban, Search, Download, Pencil, RefreshCw,
  Eye, CalendarDays, ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { translateError } from '@/lib/error-messages';
import { exportToCSV, exportToPDF } from '@/lib/export-utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  active: 'success', trial: 'warning', cancelled: 'danger', expired: 'danger', past_due: 'warning', paused: 'neutral',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa', trial: 'Trial', cancelled: 'Cancelada', expired: 'Expirada', past_due: 'Em atraso', paused: 'Pausada',
};

export default function SuperAdminSubscriptions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cycleFilter, setCycleFilter] = useState<string>('all');
  const [confirmCancel, setConfirmCancel] = useState<Subscription | null>(null);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [renewSub, setRenewSub] = useState<Subscription | null>(null);

  const { data: subsData, isLoading } = useSubscriptions(page, pageSize, { status: statusFilter, cycle: cycleFilter });
  const subs = subsData?.data ?? [];
  const totalCount = subsData?.count ?? 0;
  const cancelMutation = useCancelSubscription();
  const updateMutation = useUpdateSubscription();
  const { data: plans = [] } = usePlans();

  useEffect(() => {
    setPage(1);
  }, [statusFilter, cycleFilter]);

  const filtered = useMemo(() => {
    if (!search) return subs;
    const q = search.toLowerCase();
    return subs.filter(s =>
      s.tenant?.name?.toLowerCase().includes(q) || s.plan?.name?.toLowerCase().includes(q)
    );
  }, [subs, search]);

  const stats = useMemo(() => {
    const active = subs.filter(s => s.status === 'active');
    const mrr = active.reduce((acc, s) => acc + (s.amount || 0), 0);
    return {
      total: totalCount,
      active: active.length,
      cancelled: subs.filter(s => s.status === 'cancelled').length,
      mrr,
    };
  }, [subs]);

  const handleCancel = async () => {
    if (!confirmCancel) return;
    try {
      await cancelMutation.mutateAsync({ id: confirmCancel.id });
      toast({ title: 'Assinatura cancelada' });
      setConfirmCancel(null);
    } catch (e) {
      toast({ title: 'Erro ao cancelar', description: translateError(e), variant: 'destructive' });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editSub) return;
    const fd = new FormData(e.currentTarget);
    try {
      await updateMutation.mutateAsync({
        id: editSub.id,
        plan_id: fd.get('plan_id') as string,
        amount: Number(fd.get('amount')),
        billing_cycle: fd.get('billing_cycle') as string,
        status: fd.get('status') as string,
        ends_at: fd.get('ends_at') as string || null,
      });
      toast({ title: 'Assinatura atualizada' });
      setEditSub(null);
    } catch (e) {
      toast({ title: 'Erro ao salvar', description: translateError(e), variant: 'destructive' });
    }
  };

  const handleRenew = async () => {
    if (!renewSub || !renewSub.ends_at) return;
    try {
      const currentEnd = new Date(renewSub.ends_at);
      const monthsToAdd = renewSub.billing_cycle === 'yearly' ? 12 : 1;
      currentEnd.setMonth(currentEnd.getMonth() + monthsToAdd);
      await updateMutation.mutateAsync({
        id: renewSub.id,
        ends_at: currentEnd.toISOString().slice(0, 10),
        status: renewSub.status === 'expired' || renewSub.status === 'cancelled' ? 'active' : renewSub.status,
      });
      toast({ title: 'Assinatura renovada', description: `Novo vencimento: ${format(currentEnd, 'dd/MM/yyyy', { locale: ptBR })}` });
      setRenewSub(null);
    } catch (e) {
      toast({ title: 'Erro ao renovar', description: translateError(e), variant: 'destructive' });
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <SAPageHeader
          title="Assinaturas"
          description="Gestão de planos contratados pelas empresas"
          icon={CreditCard}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SAStatCard label="Total" value={stats.total} icon={CreditCard} iconColor="#60a5fa" />
          <SAStatCard label="Ativas" value={stats.active} icon={CheckCircle2} iconColor="#10b981" />
          <SAStatCard label="Canceladas" value={stats.cancelled} icon={XCircle} iconColor="#f87171" />
          <SAStatCard label="MRR" value={fmtCurrency(stats.mrr)} icon={Banknote} iconColor={SA_TOKENS.accent} />
        </div>

        <SAFilterBar>
          <SAButton
            variant="secondary"
            icon={Download}
            size="sm"
            onClick={() => exportToCSV(filtered, [
              { key: 'tenant', label: 'Empresa' },
              { key: 'plan', label: 'Plano' },
              { key: 'status', label: 'Status' },
              { key: 'billing_cycle', label: 'Ciclo' },
              { key: 'amount', label: 'Valor' },
              { key: 'started_at', label: 'Início' },
              { key: 'ends_at', label: 'Vencimento' },
            ], 'assinaturas')}
          >
            CSV
          </SAButton>
          <SAButton
            variant="secondary"
            icon={Download}
            size="sm"
            onClick={() => exportToPDF('Relatório de Assinaturas', filtered, [
              { key: 'tenant', label: 'Empresa' },
              { key: 'plan', label: 'Plano' },
              { key: 'status', label: 'Status' },
              { key: 'billing_cycle', label: 'Ciclo' },
              { key: 'amount', label: 'Valor', format: (v) => fmtCurrency(Number(v)) },
              { key: 'started_at', label: 'Início', format: (v) => v ? format(new Date(String(v)), 'dd/MM/yyyy') : '-' },
              { key: 'ends_at', label: 'Vencimento', format: (v) => v ? format(new Date(String(v)), 'dd/MM/yyyy') : '-' },
            ], 'assinaturas')}
          >
            PDF
          </SAButton>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: SA_TOKENS.textMuted }} />
            <Input
              placeholder="Buscar empresa ou plano..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 bg-transparent border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 bg-transparent border-white/10 text-white">
              <Filter className="w-3.5 h-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="active">Ativa</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
              <SelectItem value="past_due">Em atraso</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cycleFilter} onValueChange={setCycleFilter}>
            <SelectTrigger className="w-[140px] h-9 bg-transparent border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">Todos ciclos</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
        </SAFilterBar>

        <SACard noPadding>
          {isLoading ? (
            <div className="p-8 text-center text-sm" style={{ color: SA_TOKENS.textMuted }}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <SAEmptyState icon={CreditCard} title="Nenhuma assinatura" description="Não há registros para os filtros aplicados" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${SA_TOKENS.border}` }}>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: SA_TOKENS.textMuted }}>Empresa</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: SA_TOKENS.textMuted }}>Plano</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: SA_TOKENS.textMuted }}>Ciclo</th>
                    <th className="text-right px-5 py-3 font-medium" style={{ color: SA_TOKENS.textMuted }}>Valor</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: SA_TOKENS.textMuted }}>Início</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: SA_TOKENS.textMuted }}>Fim</th>
                    <th className="text-left px-5 py-3 font-medium" style={{ color: SA_TOKENS.textMuted }}>Status</th>
                    <th className="px-5 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: `1px solid ${SA_TOKENS.borderSubtle}` }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5" style={{ color: SA_TOKENS.textMuted }} />
                          <span style={{ color: SA_TOKENS.textPrimary }}>{s.tenant?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: SA_TOKENS.textSecondary }}>{s.plan?.name || '—'}</td>
                      <td className="px-5 py-3" style={{ color: SA_TOKENS.textSecondary }}>
                        {s.billing_cycle === 'yearly' ? 'Anual' : 'Mensal'}
                      </td>
                      <td className="px-5 py-3 text-right font-medium" style={{ color: SA_TOKENS.textPrimary }}>
                        {fmtCurrency(s.amount || 0)}
                      </td>
                      <td className="px-5 py-3" style={{ color: SA_TOKENS.textSecondary }}>
                        {s.started_at ? format(new Date(s.started_at), 'dd/MM/yy', { locale: ptBR }) : '—'}
                      </td>
                      <td className="px-5 py-3" style={{ color: SA_TOKENS.textSecondary }}>
                        {s.ends_at ? format(new Date(s.ends_at), 'dd/MM/yy', { locale: ptBR }) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <SABadge tone={STATUS_TONE[s.status] || 'neutral'}>
                          {STATUS_LABEL[s.status] || s.status}
                        </SABadge>
                      </td>
                      <td className="px-2 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded hover:bg-white/5">
                              <MoreHorizontal className="w-4 h-4" style={{ color: SA_TOKENS.textMuted }} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem
                              onClick={() => setEditSub(s)}
                              className="focus:bg-slate-700"
                              style={{ color: SA_TOKENS.textPrimary }}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar assinatura
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRenewSub(s)}
                              disabled={s.status === 'cancelled'}
                              className="focus:bg-slate-700"
                              style={{ color: SA_TOKENS.textPrimary }}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Renovar assinatura
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/super-admin/tenants?id=${s.tenant_id}`)}
                              className="focus:bg-slate-700"
                              style={{ color: SA_TOKENS.textPrimary }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver empresa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setConfirmCancel(s)}
                              disabled={s.status === 'cancelled'}
                              className="text-rose-400 focus:bg-slate-700 focus:text-rose-400"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Cancelar assinatura
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <SAPagination page={page} pageSize={pageSize} total={totalCount} onPageChange={setPage} />
        </SACard>

        {/* Confirmação de cancelamento */}
        <Dialog open={!!confirmCancel} onOpenChange={() => setConfirmCancel(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-500" />
                Cancelar assinatura
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Esta ação cancela a assinatura de <strong className="text-white">{confirmCancel?.tenant?.name}</strong> e marca a empresa como cancelada.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <SAButton variant="secondary" onClick={() => setConfirmCancel(null)}>Voltar</SAButton>
              <SAButton variant="danger" icon={Ban} onClick={handleCancel} disabled={cancelMutation.isPending}>
                Confirmar cancelamento
              </SAButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de edição */}
        <Dialog open={!!editSub} onOpenChange={() => setEditSub(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5" style={{ color: SA_TOKENS.accent }} />
                Editar assinatura
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {editSub?.tenant?.name} — {editSub?.plan?.name}
              </DialogDescription>
            </DialogHeader>
            {editSub && (
              <form id="edit-sub-form" onSubmit={handleSaveEdit} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Plano</Label>
                  <Select name="plan_id" defaultValue={editSub.plan_id}>
                    <SelectTrigger className="bg-transparent border-white/10 text-white h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {plans.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Valor (R$)</Label>
                  <Input name="amount" type="number" step="0.01" defaultValue={editSub.amount} className="bg-transparent border-white/10 text-white h-9" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Ciclo</Label>
                    <Select name="billing_cycle" defaultValue={editSub.billing_cycle}>
                      <SelectTrigger className="bg-transparent border-white/10 text-white h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Status</Label>
                    <Select name="status" defaultValue={editSub.status}>
                      <SelectTrigger className="bg-transparent border-white/10 text-white h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="active">Ativa</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="expired">Expirada</SelectItem>
                        <SelectItem value="past_due">Em atraso</SelectItem>
                        <SelectItem value="paused">Pausada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs" style={{ color: SA_TOKENS.textMuted }}>Data de vencimento</Label>
                  <Input name="ends_at" type="date" defaultValue={editSub.ends_at ? editSub.ends_at.slice(0, 10) : ''} className="bg-transparent border-white/10 text-white h-9" />
                </div>
              </form>
            )}
            <DialogFooter className="mt-4">
              <SAButton variant="secondary" onClick={() => setEditSub(null)}>Cancelar</SAButton>
              <SAButton variant="primary" icon={Pencil} onClick={() => document.getElementById('edit-sub-form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))} disabled={updateMutation.isPending}>
                Salvar alterações
              </SAButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de renovação */}
        <Dialog open={!!renewSub} onOpenChange={() => setRenewSub(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" style={{ color: '#10b981' }} />
                Renovar assinatura
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {renewSub?.tenant?.name} — vencimento atual: {renewSub?.ends_at ? format(new Date(renewSub.ends_at), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
              </DialogDescription>
            </DialogHeader>
            {renewSub && (
              <div className="mt-2 space-y-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-emerald-400">
                    O vencimento será estendido em <strong>{renewSub.billing_cycle === 'yearly' ? '12 meses' : '1 mês'}</strong> a partir da data atual de vencimento.
                  </p>
                </div>
                <div className="text-sm" style={{ color: SA_TOKENS.textSecondary }}>
                  Novo vencimento previsto: <strong style={{ color: SA_TOKENS.textPrimary }}>
                    {(() => {
                      const d = new Date(renewSub.ends_at || Date.now());
                      d.setMonth(d.getMonth() + (renewSub.billing_cycle === 'yearly' ? 12 : 1));
                      return format(d, 'dd/MM/yyyy', { locale: ptBR });
                    })()}
                  </strong>
                </div>
              </div>
            )}
            <DialogFooter className="mt-4">
              <SAButton variant="secondary" onClick={() => setRenewSub(null)}>Cancelar</SAButton>
              <SAButton variant="primary" icon={RefreshCw} onClick={handleRenew} disabled={updateMutation.isPending}>
                Confirmar renovação
              </SAButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}
