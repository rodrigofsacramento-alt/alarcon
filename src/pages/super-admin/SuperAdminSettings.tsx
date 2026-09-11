import { useState } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import {
  useSASettings,
  useUpdateSASetting,
  useSuperAdminsList,
} from '@/hooks/use-super-admin';
import {
  SAPageHeader, SACard, SABadge, SAEmptyState, SAButton, SA_TOKENS,
} from '@/components/super-admin/ui';
import {
  Settings as SettingsIcon, ShieldCheck, Save, Mail, Globe,
  Calendar, ToggleLeft, CheckCircle2, XCircle, Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { translateError } from '@/lib/error-messages';

const SETTING_META: Record<string, { label: string; description: string; type: 'string' | 'number' | 'boolean'; icon: typeof Globe }> = {
  'saas.name':            { label: 'Nome do produto',  description: 'Nome exibido no sistema',  type: 'string',  icon: Globe },
  'saas.support_email':   { label: 'Email de suporte', description: 'Para contato dos tenants', type: 'string',  icon: Mail },
  'saas.trial_days':      { label: 'Dias de trial',    description: 'Período de avaliação padrão', type: 'number', icon: Calendar },
  'saas.allow_signup':    { label: 'Cadastro público', description: 'Permite signup sem provisionamento', type: 'boolean', icon: ToggleLeft },
};

export default function SuperAdminSettings() {
  const { toast } = useToast();
  const { data: settings = [], isLoading } = useSASettings();
  const { data: superAdmins = [] } = useSuperAdminsList();
  const updateMutation = useUpdateSASetting();
  const [drafts, setDrafts] = useState<Record<string, string | number | boolean>>({});

  const getValue = (key: string) => {
    if (key in drafts) return drafts[key];
    const s = settings.find(x => x.key === key);
    return s?.value as string | number | boolean | undefined;
  };

  const setDraft = (key: string, value: string | number | boolean) => {
    setDrafts(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    const value = drafts[key];
    if (value === undefined) return;
    try {
      await updateMutation.mutateAsync({ key, value });
      toast({ title: 'Configuração salva' });
      setDrafts(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } catch (e) {
      toast({ title: 'Erro ao salvar', description: translateError(e), variant: 'destructive' });
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <SAPageHeader
          title="Configurações"
          description="Parâmetros globais do SaaS e gestão dos super admins"
          icon={SettingsIcon}
        />

        {/* Configurações globais */}
        <SACard title="Configurações Gerais" description="Ajustes que afetam todo o sistema">
          {isLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: SA_TOKENS.textMuted }}>Carregando...</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(SETTING_META).map(([key, meta]) => {
                const Icon = meta.icon;
                const currentValue = getValue(key);
                const isDirty = key in drafts;

                return (
                  <div key={key} className="flex items-center gap-4 p-4 rounded-xl"
                       style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                         style={{ background: SA_TOKENS.accentBg }}>
                      <Icon className="w-4 h-4" style={{ color: SA_TOKENS.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm font-medium" style={{ color: SA_TOKENS.textPrimary }}>
                        {meta.label}
                      </Label>
                      <p className="text-xs" style={{ color: SA_TOKENS.textMuted }}>{meta.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {meta.type === 'boolean' ? (
                        <Switch
                          checked={!!currentValue}
                          onCheckedChange={v => setDraft(key, v)}
                        />
                      ) : (
                        <Input
                          type={meta.type === 'number' ? 'number' : 'text'}
                          value={String(currentValue ?? '')}
                          onChange={e => setDraft(key, meta.type === 'number' ? Number(e.target.value) : e.target.value)}
                          className="w-48 h-9 bg-transparent border-white/10 text-white"
                        />
                      )}
                      {isDirty && (
                        <SAButton size="sm" icon={Save} onClick={() => handleSave(key)} disabled={updateMutation.isPending}>
                          Salvar
                        </SAButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SACard>

        {/* Super Admins */}
        <SACard
          title="Super Administradores"
          description={`${superAdmins.length} usuário${superAdmins.length === 1 ? '' : 's'} com acesso global`}
        >
          {superAdmins.length === 0 ? (
            <SAEmptyState icon={ShieldCheck} title="Nenhum super admin" description="Adicione via banco de dados na tabela super_admins" />
          ) : (
            <div className="space-y-2">
              {superAdmins.map(sa => (
                <div key={sa.id} className="flex items-center gap-3 p-3 rounded-xl"
                     style={{ background: SA_TOKENS.surfaceElevated, border: `1px solid ${SA_TOKENS.borderSubtle}` }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                       style={{ background: SA_TOKENS.accentBg }}>
                    <ShieldCheck className="w-4 h-4" style={{ color: SA_TOKENS.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: SA_TOKENS.textPrimary }}>
                      {sa.full_name || sa.email}
                    </p>
                    <p className="text-xs truncate" style={{ color: SA_TOKENS.textMuted }}>{sa.email}</p>
                  </div>
                  {sa.is_active ? (
                    <SABadge tone="success" icon={CheckCircle2}>Ativo</SABadge>
                  ) : (
                    <SABadge tone="danger" icon={XCircle}>Inativo</SABadge>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs" style={{ color: SA_TOKENS.textMuted }}>
            Para adicionar um novo super admin, insira o usuário na tabela <code className="px-1 py-0.5 rounded" style={{ background: SA_TOKENS.surfaceElevated }}>super_admins</code> via Supabase.
          </p>
        </SACard>
      </div>
    </SuperAdminLayout>
  );
}
