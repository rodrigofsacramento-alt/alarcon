import { useMemo, useState } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useBroadcastAnnouncement,
  useDeleteAnnouncement,
  useTenants,
  usePlans,
  type SAAnnouncement,
} from '@/hooks/use-super-admin';
import {
  SAPageHeader, SAStatCard, SACard, SABadge, SAEmptyState, SAButton, SA_TOKENS,
} from '@/components/super-admin/ui';
import {
  Megaphone, Plus, Send, Trash2, Info, AlertTriangle,
  CheckCircle2, AlertOctagon, Users, Bell, Calendar,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { translateError } from '@/lib/error-messages';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SEVERITY_META = {
  info:     { label: 'Informativo', tone: 'info'    as const, icon: Info },
  success:  { label: 'Sucesso',     tone: 'success' as const, icon: CheckCircle2 },
  warning:  { label: 'Atenção',     tone: 'warning' as const, icon: AlertTriangle },
  critical: { label: 'Crítico',     tone: 'danger'  as const, icon: AlertOctagon },
};

const TARGET_LABEL = {
  all:    'Todas as empresas',
  plan:   'Plano específico',
  status: 'Status específico',
  tenant: 'Empresa específica',
};

type FormState = {
  title: string;
  message: string;
  severity: keyof typeof SEVERITY_META;
  target_type: keyof typeof TARGET_LABEL;
  target_value: string;
  scheduled_at: string;
  send_now: boolean;
};

const defaultForm: FormState = {
  title: '',
  message: '',
  severity: 'info',
  target_type: 'all',
  target_value: '',
  scheduled_at: '',
  send_now: true,
};

export default function SuperAdminCommunications() {
  const { toast } = useToast();
  const { data: announcements = [], isLoading } = useAnnouncements();
  const { data: tenantsData } = useTenants();
  const tenants = tenantsData?.data ?? [];
  const { data: plans = [] } = usePlans();
  const createMutation = useCreateAnnouncement();
  const broadcastMutation = useBroadcastAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [confirmSend, setConfirmSend] = useState<SAAnnouncement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const stats = useMemo(() => {
    const sent = announcements.filter(a => a.sent_at);
    const scheduled = announcements.filter(a => a.scheduled_at && !a.is_sent && !a.sent_at);
    const totalReached = announcements.reduce((acc, a) => acc + a.sent_count, 0);
    return {
      total: announcements.length,
      sent: sent.length,
      scheduled: scheduled.length,
      drafts: announcements.filter(a => !a.sent_at && !a.scheduled_at).length,
      reach: totalReached,
    };
  }, [announcements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast({ title: 'Preencha título e mensagem', variant: 'destructive' });
      return;
    }
    if (form.target_type !== 'all' && !form.target_value) {
      toast({ title: 'Selecione o alvo da comunicação', variant: 'destructive' });
      return;
    }
    try {
      const payload: Partial<SAAnnouncement> = {
        title: form.title,
        message: form.message,
        severity: form.severity,
        target_type: form.target_type,
        target_value: form.target_type === 'all' ? null : form.target_value,
      };

      if (!form.send_now && form.scheduled_at) {
        payload.scheduled_at = new Date(form.scheduled_at).toISOString();
      }

      await createMutation.mutateAsync(payload);
      toast({ title: form.send_now ? 'Anúncio criado como rascunho' : 'Anúncio agendado' });
      setShowModal(false);
      setForm(defaultForm);
    } catch (e) {
      toast({ title: 'Erro ao criar', description: translateError(e), variant: 'destructive' });
    }
  };

  const handleBroadcast = async () => {
    if (!confirmSend) return;
    try {
      const result = await broadcastMutation.mutateAsync(confirmSend.id);
      toast({ title: 'Comunicação enviada', description: `${result.sent_count} usuários alcançados` });
      setConfirmSend(null);
    } catch (e) {
      toast({ title: 'Erro ao enviar', description: translateError(e), variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      toast({ title: 'Anúncio excluído' });
      setDeleteTarget(null);
    } catch (e) {
      toast({ title: 'Erro', description: translateError(e), variant: 'destructive' });
    }
  };

  const renderTargetLabel = (a: SAAnnouncement) => {
    if (a.target_type === 'all') return 'Todas';
    if (a.target_type === 'plan') {
      const p = plans.find(x => x.id === a.target_value);
      return p ? `Plano: ${p.name}` : 'Plano';
    }
    if (a.target_type === 'tenant') {
      const t = tenants.find(x => x.id === a.target_value);
      return t ? t.name : 'Empresa';
    }
    if (a.target_type === 'status') return `Status: ${a.target_value}`;
    return '—';
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <SAPageHeader
          title="Comunicações"
          description="Anúncios e notificações enviadas para os tenants"
          icon={Megaphone}
          actions={
            <SAButton icon={Plus} onClick={() => setShowModal(true)}>Novo anúncio</SAButton>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SAStatCard label="Total" value={stats.total} icon={Megaphone} iconColor="#60a5fa" />
          <SAStatCard label="Enviados" value={stats.sent} icon={Send} iconColor="#10b981" />
          <SAStatCard label="Agendados" value={stats.scheduled} icon={Calendar} iconColor="#f59e0b" />
          <SAStatCard label="Rascunhos" value={stats.drafts} icon={Bell} iconColor={SA_TOKENS.accent} />
          <SAStatCard label="Usuários alcançados" value={stats.reach} icon={Users} iconColor="#8b5cf6" />
        </div>

        <SACard noPadding>
          {isLoading ? (
            <div className="p-8 text-center text-sm" style={{ color: SA_TOKENS.textMuted }}>Carregando...</div>
          ) : announcements.length === 0 ? (
            <SAEmptyState
              icon={Megaphone}
              title="Nenhuma comunicação ainda"
              description="Crie um anúncio para enviar a empresas, planos ou status específicos"
              action={<SAButton icon={Plus} onClick={() => setShowModal(true)}>Criar primeiro anúncio</SAButton>}
            />
          ) : (
            <div className="divide-y" style={{ borderColor: SA_TOKENS.borderSubtle }}>
              {announcements.map(a => {
                const meta = SEVERITY_META[a.severity];
                const Icon = meta.icon;
                return (
                  <div key={a.id} className="p-5 hover:bg-white/[0.02] transition-colors"
                       style={{ borderColor: SA_TOKENS.borderSubtle }}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                           style={{
                             background: meta.tone === 'danger' ? 'rgba(239,68,68,0.12)' :
                                         meta.tone === 'warning' ? 'rgba(245,158,11,0.12)' :
                                         meta.tone === 'success' ? 'rgba(16,185,129,0.12)' :
                                         'rgba(59,130,246,0.12)'
                           }}>
                        <Icon className="w-4 h-4" style={{
                          color: meta.tone === 'danger' ? '#f87171' :
                                 meta.tone === 'warning' ? '#f59e0b' :
                                 meta.tone === 'success' ? '#10b981' :
                                 '#60a5fa'
                        }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="font-semibold" style={{ color: SA_TOKENS.textPrimary }}>{a.title}</h3>
                          <div className="flex items-center gap-2 shrink-0">
                            <SABadge tone={meta.tone}>{meta.label}</SABadge>
                            {a.sent_at ? (
                              <SABadge tone="success" icon={CheckCircle2}>Enviado</SABadge>
                            ) : a.scheduled_at ? (
                              <SABadge tone="warning" icon={Calendar}>Agendado</SABadge>
                            ) : (
                              <SABadge tone="neutral">Rascunho</SABadge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mb-3" style={{ color: SA_TOKENS.textSecondary }}>{a.message}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: SA_TOKENS.textMuted }}>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {renderTargetLabel(a)}
                          </span>
                          {a.sent_at && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Send className="w-3 h-3" />
                                {a.sent_count} usuários alcançados
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(a.sent_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </>
                          )}
                          {a.scheduled_at && !a.sent_at && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Agendado para {format(new Date(a.scheduled_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        {!a.sent_at && !a.scheduled_at && (
                          <SAButton size="sm" icon={Send} onClick={() => setConfirmSend(a)}>
                            Enviar
                          </SAButton>
                        )}
                        <SAButton size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteTarget(a.id)}>
                          Excluir
                        </SAButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SACard>

        {/* Modal de criação */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" style={{ color: SA_TOKENS.accent }} />
                Novo anúncio
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Envie imediatamente ou agende para uma data futura.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Título *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Manutenção programada"
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Mensagem *</Label>
                <Textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Detalhes da comunicação"
                  className="bg-slate-800 border-slate-700 min-h-[100px]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-300">Severidade</Label>
                  <Select value={form.severity} onValueChange={v => setForm({ ...form, severity: v as FormState['severity'] })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue className="text-white" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.entries(SEVERITY_META).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-white focus:bg-slate-700 focus:text-white">{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Alvo</Label>
                  <Select value={form.target_type} onValueChange={v => setForm({ ...form, target_type: v as FormState['target_type'], target_value: '' })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue className="text-white" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.entries(TARGET_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-white focus:bg-slate-700 focus:text-white">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.target_type === 'plan' && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Plano</Label>
                  <Select value={form.target_value} onValueChange={v => setForm({ ...form, target_value: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Selecione" className="text-white" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {plans.map(p => <SelectItem key={p.id} value={p.id} className="text-white focus:bg-slate-700 focus:text-white">{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.target_type === 'tenant' && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Empresa</Label>
                  <Select value={form.target_value} onValueChange={v => setForm({ ...form, target_value: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Selecione" className="text-white" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {tenants.map(t => <SelectItem key={t.id} value={t.id} className="text-white focus:bg-slate-700 focus:text-white">{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.target_type === 'status' && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Status</Label>
                  <Select value={form.target_value} onValueChange={v => setForm({ ...form, target_value: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Selecione" className="text-white" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="active" className="text-white focus:bg-slate-700 focus:text-white">Ativo</SelectItem>
                      <SelectItem value="trial" className="text-white focus:bg-slate-700 focus:text-white">Trial</SelectItem>
                      <SelectItem value="suspended" className="text-white focus:bg-slate-700 focus:text-white">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: SA_TOKENS.textSecondary }}>
                  <input
                    type="checkbox"
                    checked={form.send_now}
                    onChange={e => setForm({ ...form, send_now: e.target.checked })}
                    className="rounded border-slate-600 bg-slate-800 accent-orange-500"
                  />
                  Enviar agora
                </label>
              </div>

              {!form.send_now && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Data e hora do envio</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required={!form.send_now}
                  />
                </div>
              )}

              <DialogFooter className="pt-2">
                <SAButton variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancelar</SAButton>
                <SAButton type="submit" icon={Plus} disabled={createMutation.isPending}>
                  {form.send_now ? 'Criar rascunho' : 'Agendar'}
                </SAButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirmar envio */}
        <Dialog open={!!confirmSend} onOpenChange={() => setConfirmSend(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" style={{ color: SA_TOKENS.accent }} />
                Enviar anúncio
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Esta ação cria notificações para todos os usuários do alvo selecionado e é irreversível.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <SAButton variant="secondary" onClick={() => setConfirmSend(null)}>Cancelar</SAButton>
              <SAButton icon={Send} onClick={handleBroadcast} disabled={broadcastMutation.isPending}>
                Confirmar envio
              </SAButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir anúncio"
        description="Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </SuperAdminLayout>
  );
}
