import { useState } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import {
  useSASettings,
  useUpdateSASetting,
} from '@/hooks/use-super-admin';
import {
  SAPageHeader, SACard, SAButton, SA_TOKENS,
} from '@/components/super-admin/ui';
import {
  Plug, Globe, Key, CheckCircle2, XCircle, Eye, EyeOff,
  Copy, ExternalLink, RefreshCw, Loader2, ShieldCheck,
  AlertTriangle, FileCode2, Save, MessageCircle, Facebook, Instagram,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

/* ── Portal definitions ─────────────────────────────── */

interface PortalDef {
  key: string;          // sa_settings key prefix
  label: string;
  description: string;
  icon: typeof Globe;
  color: string;
  bgColor: string;
  docsUrl: string;
  fields: { name: string; label: string; type: 'text' | 'password'; placeholder: string }[];
}

const PORTALS: PortalDef[] = [
  {
    key: 'portal.viva_real',
    label: 'Viva Real',
    description: 'Integração com o portal Viva Real (Grupo OLX). Envie imóveis automaticamente.',
    icon: Globe,
    color: '#c8590a',
    bgColor: 'rgba(200,89,10,0.12)',
    docsUrl: 'https://www.vivareal.com.br/para-corretores/',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'vr_api_xxxxxxxx...' },
      { name: 'client_id', label: 'Client ID', type: 'text', placeholder: 'ID do parceiro' },
      { name: 'endpoint', label: 'Endpoint', type: 'text', placeholder: 'https://api.vivareal.com.br/v1' },
    ],
  },
  {
    key: 'portal.zap_imoveis',
    label: 'ZAP Imóveis',
    description: 'Integração com ZAP Imóveis (Grupo OLX). Sincronize seu catálogo.',
    icon: Globe,
    color: '#0a6ed2',
    bgColor: 'rgba(10,110,210,0.12)',
    docsUrl: 'https://www.zapimoveis.com.br/para-corretores/',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'zap_api_xxxxxxxx...' },
      { name: 'client_id', label: 'Client ID', type: 'text', placeholder: 'ID do parceiro' },
      { name: 'endpoint', label: 'Endpoint', type: 'text', placeholder: 'https://api.zapimoveis.com.br/v1' },
    ],
  },
  {
    key: 'portal.olx',
    label: 'OLX Imóveis',
    description: 'Publicação direta de imóveis na OLX via API oficial.',
    icon: Globe,
    color: '#6e0ad6',
    bgColor: 'rgba(110,10,214,0.12)',
    docsUrl: 'https://developers.olx.com.br/',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'olx_api_xxxxxxxx...' },
      { name: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'secreto...' },
      { name: 'endpoint', label: 'Endpoint', type: 'text', placeholder: 'https://api.olx.com.br/v2' },
    ],
  },
  {
    key: 'portal.facebook',
    label: 'Facebook Marketplace',
    description: 'Integração com Facebook Marketplace para anúncios de imóveis.',
    icon: Globe,
    color: '#1877f2',
    bgColor: 'rgba(24,119,242,0.12)',
    docsUrl: 'https://developers.facebook.com/docs/marketplace/',
    fields: [
      { name: 'app_id', label: 'App ID', type: 'text', placeholder: '123456789...' },
      { name: 'app_secret', label: 'App Secret', type: 'password', placeholder: 'secreto...' },
      { name: 'access_token', label: 'Access Token', type: 'password', placeholder: 'EAAG...' },
    ],
  },
  {
    key: 'whatsapp.baileys',
    label: 'WhatsApp (Baileys)',
    description: 'Conexão WhatsApp via Baileys para atendimento multi-tenant. Configure o broker.',
    icon: MessageCircle,
    color: '#25d366',
    bgColor: 'rgba(37,211,102,0.12)',
    docsUrl: 'https://github.com/WhiskeySockets/Baileys',
    fields: [
      { name: 'broker_url', label: 'Broker URL', type: 'text', placeholder: 'wss://seu-servidor.com/whatsapp' },
      { name: 'webhook_secret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...' },
    ],
  },
  {
    key: 'marketing.facebook',
    label: 'Facebook Marketing',
    description: 'API de publicação e anúncios no Facebook para as imobiliárias.',
    icon: Facebook,
    color: '#1877f2',
    bgColor: 'rgba(24,119,242,0.12)',
    docsUrl: 'https://developers.facebook.com/docs/graph-api/',
    fields: [
      { name: 'app_id', label: 'App ID', type: 'text', placeholder: '123456789...' },
      { name: 'app_secret', label: 'App Secret', type: 'password', placeholder: 'secreto...' },
      { name: 'api_version', label: 'Versão API', type: 'text', placeholder: 'v18.0' },
    ],
  },
  {
    key: 'marketing.instagram',
    label: 'Instagram Marketing',
    description: 'API do Instagram para publicação de conteúdo e análise de engajamento.',
    icon: Instagram,
    color: '#e1306c',
    bgColor: 'rgba(225,48,108,0.12)',
    docsUrl: 'https://developers.facebook.com/docs/instagram-api/',
    fields: [
      { name: 'access_token', label: 'Access Token', type: 'password', placeholder: 'EAAG...' },
      { name: 'account_id', label: 'Account ID', type: 'text', placeholder: '178414...' },
    ],
  },
];

/* ── helpers ─────────────────────────────────────────── */

function getPortalConfig(settings: Array<{ key: string; value: unknown }>, portalKey: string) {
  const prefix = `${portalKey}.`;
  const map: Record<string, string> = {};
  const enabledSetting = settings.find(s => s.key === `${portalKey}.enabled`);
  const enabled = enabledSetting?.value === true || enabledSetting?.value === 'true';

  for (const s of settings) {
    if (s.key.startsWith(prefix)) {
      map[s.key.replace(prefix, '')] = String(s.value ?? '');
    }
  }
  return { map, enabled };
}

function isConfigured(map: Record<string, string>, fields: PortalDef['fields']) {
  return fields.some(f => !!map[f.name]?.trim());
}

/* ── component ───────────────────────────────────────── */

export default function SuperAdminPortalIntegrations() {
  const { toast } = useToast();
  const { data: settings = [], isLoading } = useSASettings();
  const updateMutation = useUpdateSASetting();

  const [activePortal, setActivePortal] = useState<PortalDef | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const openModal = (portal: PortalDef) => {
    setActivePortal(portal);
    const { map } = getPortalConfig(settings, portal.key);
    const initial: Record<string, string> = {};
    for (const f of portal.fields) {
      initial[f.name] = map[f.name] || '';
    }
    setDraftValues(initial);
  };

  const closeModal = () => {
    setActivePortal(null);
    setDraftValues({});
    setShowPassword({});
  };

  const handleSave = async () => {
    if (!activePortal) return;
    try {
      for (const [fieldName, value] of Object.entries(draftValues)) {
        await updateMutation.mutateAsync({
          key: `${activePortal.key}.${fieldName}`,
          value,
        });
      }
      toast({ title: `${activePortal.label} salvo`, description: 'Configurações de API atualizadas.' });
      closeModal();
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e?.message || 'Tente novamente.', variant: 'destructive' });
    }
  };

  const handleToggleEnabled = async (portal: PortalDef, checked: boolean) => {
    try {
      await updateMutation.mutateAsync({
        key: `${portal.key}.enabled`,
        value: checked,
      });
      toast({
        title: checked ? `${portal.label} ativado` : `${portal.label} desativado`,
      });
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message, variant: 'destructive' });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado para área de transferência' });
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <SAPageHeader
          title="Integrações"
          description="Configure portais imobiliários, APIs de marketing e comunicação"
          icon={Plug}
        />

        {/* Info banner */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(10,110,210,0.08)', border: '1px solid rgba(10,110,210,0.2)' }}
        >
          <FileCode2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#0a6ed2' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: SA_TOKENS.textPrimary }}>
              XML Feed como alternativa imediata
            </p>
            <p className="text-xs mt-1" style={{ color: SA_TOKENS.textMuted }}>
              Enquanto aguarda credenciais de API, cada imobiliária pode baixar o XML Feed dos imóveis
              diretamente no painel de imóveis e enviar para o suporte dos portais. As credenciais aqui
              habilitarão a sincronização automática no futuro.
            </p>
          </div>
        </div>

        {/* Portal cards */}
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: SA_TOKENS.accent }} />
            <p className="text-sm mt-3" style={{ color: SA_TOKENS.textMuted }}>Carregando integrações...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {PORTALS.map((portal) => {
              const { map, enabled } = getPortalConfig(settings, portal.key);
              const configured = isConfigured(map, portal.fields);
              const Icon = portal.icon;

              return (
                <SACard key={portal.key}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: portal.bgColor }}
                    >
                      <Icon className="w-6 h-6" style={{ color: portal.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold" style={{ color: SA_TOKENS.textPrimary }}>
                          {portal.label}
                        </h3>
                        {configured ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Configurado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/20">
                            <XCircle className="w-3 h-3" /> Não configurado
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: SA_TOKENS.textMuted }}>
                        {portal.description}
                      </p>

                      {/* Status + Actions */}
                      <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${SA_TOKENS.borderSubtle}` }}>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={enabled}
                            onCheckedChange={(v) => handleToggleEnabled(portal, v)}
                          />
                          <span className="text-xs" style={{ color: SA_TOKENS.textMuted }}>
                            {enabled ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <SAButton
                            size="sm"
                            variant="ghost"
                            icon={ExternalLink}
                            onClick={() => window.open(portal.docsUrl, '_blank')}
                          >
                            Docs
                          </SAButton>
                          <SAButton
                            size="sm"
                            icon={Key}
                            onClick={() => openModal(portal)}
                          >
                            Configurar
                          </SAButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </SACard>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Configuration Modal ─────────────────────────── */}
      <Dialog open={!!activePortal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md" style={{ background: '#0f1829', border: '1px solid rgba(255,255,255,0.08)' }}>
          {activePortal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: activePortal.bgColor }}
                  >
                    <activePortal.icon className="w-5 h-5" style={{ color: activePortal.color }} />
                  </div>
                  <div>
                    <DialogTitle className="text-base" style={{ color: SA_TOKENS.textPrimary }}>
                      {activePortal.label}
                    </DialogTitle>
                    <DialogDescription className="text-xs" style={{ color: SA_TOKENS.textMuted }}>
                      Cole as credenciais de API fornecidas pelo portal
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {activePortal.fields.map((field) => {
                  const inputKey = `${activePortal.key}.${field.name}`;
                  const isPw = field.type === 'password';
                  const show = showPassword[inputKey] || false;

                  return (
                    <div key={field.name} className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: SA_TOKENS.textMuted }}>
                        {field.label}
                      </Label>
                      <div className="relative">
                        <Input
                          type={isPw && !show ? 'password' : 'text'}
                          value={draftValues[field.name] || ''}
                          onChange={(e) =>
                            setDraftValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                          }
                          placeholder={field.placeholder}
                          className="h-10 pr-20 bg-transparent border-white/10 text-sm"
                          style={{ color: SA_TOKENS.textPrimary }}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {isPw && (
                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword((prev) => ({ ...prev, [inputKey]: !prev[inputKey] }))
                              }
                              className="p-1 rounded hover:bg-white/5"
                              style={{ color: SA_TOKENS.textMuted }}
                            >
                              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          {draftValues[field.name] && (
                            <button
                              type="button"
                              onClick={() => handleCopy(draftValues[field.name])}
                              className="p-1 rounded hover:bg-white/5"
                              style={{ color: SA_TOKENS.textMuted }}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: `1px solid ${SA_TOKENS.borderSubtle}` }}>
                <SAButton size="sm" variant="ghost" onClick={closeModal}>
                  Cancelar
                </SAButton>
                <SAButton
                  size="sm"
                  icon={Save}
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...
                    </>
                  ) : (
                    'Salvar credenciais'
                  )}
                </SAButton>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
}
