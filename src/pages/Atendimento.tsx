import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CreateAtendimentoModal, type AtendimentoFormData } from "@/components/atendimento/CreateAtendimentoModal";
import { ImportLeadsModal } from "@/components/leads/ImportLeadsModal";
import { useCreateLead } from "@/hooks/use-leads";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useGroupPanelStore } from "@/store/useGroupPanelStore";
import { useCreateVisit } from "@/hooks/use-visits";
import { CreateVisitModal, type VisitFormData } from "@/components/agenda/CreateVisitModal";
import type { Contact } from "@/hooks/use-semantic-search";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useConversations, useMessages, useMarkMessagesRead, useCreateConversation, useUpdateConversationTags, useDeleteConversation, useUpdateConversationSettings, useSetConversationAIEnabled, useLeadNextActions, useLeadPropertyRecommendations, useMarkPropertyRecommended, type Conversation, type LeadNextAction, type LeadPropertyRecommendation, type Message } from "@/hooks/use-messages";
import { useAgents } from "@/hooks/use-agents";
import { useSdrAnswers } from "@/hooks/use-sdr";
import { useSendWhatsAppMessage, useWhatsAppSession } from "@/hooks/use-whatsapp";
import WhatsAppConnect from "@/components/whatsapp/WhatsAppConnect";
import WhatsAppSettingsDrawer from "@/components/whatsapp/WhatsAppSettingsDrawer";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { GroupDetailsPanel } from "@/components/atendimento/GroupDetailsPanel";
import { FollowUpModal } from "@/components/atendimento/FollowUpModal";
import { FollowUpBadge } from "@/components/atendimento/FollowUpBadge";
import { TagsManager } from "@/components/atendimento/TagsManager";
import { usePendingFollowupsByConversation } from "@/hooks/use-followups";
import { useUserTags, useUserTagCategories, useCreateUserTag, groupTagsByCategory } from "@/hooks/use-user-tags";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Phone,
  Mail,
  Send,
  Image,
  Camera,
  Video,
  Paperclip,
  RefreshCcw,
  Calendar,
  FileText,
  FolderOpen,
  Bot,
  MoreVertical,
  CheckCircle2,
  MapPin,
  DollarSign,
  Home,
  Plus,
  X,
  Upload,
  MessageSquare,
  Settings,
  ChevronDown,
  Zap,
  Archive,
  Inbox,
  Users,
  User,
  Tag,
  Clock,
  Info,
  Edit,
  Share2,
  Download,
  Smile,
  Check,
  ArrowLeft,
  ArrowRightLeft,
  AlarmClock,
  UserPlus,
  ExternalLink,
  Mic,
  Trash2,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const extractMediaUrl = (content: string) => content.match(/https?:\/\/[^\s]+/g)?.[0] || null;

const renderMessageContent = (content: string, type?: string) => {
  const normalized = content.trim().toLowerCase();

  // --- Detección robusta de marcador de mídia: busca el marcador en CUALQUIER
  // posición del content (no solo al inicio), para no fallar cuando la mídia es
  // una RESPUESTA (reply) cuyo preludio "↳ Respondendo a …" antecede al marcador.
  const has = (...m: string[]) => m.some((x) => normalized.includes(x));
  const isMidia = has('[midia]', '[mídia]', '[midia indisponivel]', '[mídia indisponível]');
  const isImagem = has('[imagem]', '[image]');
  const isVideo = has('[video]');
  const isAudio = has('[audio]', '[áudio]');
  const isArquivo = has('[arquivo]', '[documento]');

  if (isMidia && !isImagem && !isVideo && !isAudio && !isArquivo) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        <FileText className="h-4 w-4 shrink-0" />
        <span>Mídia recebida, mas o arquivo não ficou disponível.</span>
      </div>
    );
  }

  if (type === 'image' || isImagem) {
    const match = content.match(/https?:\/\/[^\s]+/g);
    if (match) {
      const url = match[0];
      return (
        <div className="rounded-lg overflow-hidden border border-border max-w-[300px] bg-muted/20">
          <img src={url} alt="Imagem" className="w-full h-auto object-contain max-h-[200px] hover:scale-[1.02] transition-transform duration-200" />
        </div>
      );
    }
  }

  if (type === 'video' || isVideo) {
    const match = content.match(/https?:\/\/[^\s]+/g);
    if (match) {
      const url = match[0];
      const filename = content.replace(/\[(Video|Vídeo)\]\s*/i, '').split('\n')[0]?.split('↳')[0]?.trim() || 'Vídeo';
      return (
        <div className="space-y-2">
          <div className="rounded-lg overflow-hidden border border-border max-w-[320px] bg-muted/20">
            <video src={url} controls className="w-full h-auto object-contain max-h-[240px]" />
          </div>
          <span className="text-xs opacity-75 underline block truncate max-w-[200px]">
            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{filename}</a>
          </span>
        </div>
      );
    }
  }

  if (type === 'audio' || isAudio) {
    const url = extractMediaUrl(content);
    if (url) {
      return (
        <div className="space-y-2 py-1 w-[min(280px,70vw)] max-w-full">
          <audio controls preload="metadata" className="w-full h-10 accent-accent">
            <source src={url} type="audio/ogg; codecs=opus" />
            <source src={url} type="audio/ogg" />
            <source src={url} type="audio/mpeg" />
            <source src={url} type="audio/mp4" />
          </audio>
        </div>
      );
    }
  }

  if (type === 'document' || isArquivo) {
    const match = content.match(/https?:\/\/[^\s]+/g);
    if (match) {
      const url = match[0];
      const filename = content.replace(/\[(Arquivo|Documento)\]\s*/i, '').split('\n')[0]?.split('↳')[0]?.trim() || 'Documento';
      return (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors border border-border text-sm font-medium hover:text-accent"
        >
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate max-w-[180px]">{filename}</span>
        </a>
      );
    }
  }

  return <p className="text-sm whitespace-pre-line leading-relaxed break-words [overflow-wrap:anywhere]">{content}</p>;
};

const getTagStyles = (tag: string) => {
  const normalized = tag.toLowerCase().trim();
  if (normalized === 'quente') return 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50';
  if (normalized === 'frio') return 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
  if (normalized === 'visita' || normalized === 'visita agendada') return 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50';
  if (normalized === 'negociação') return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
  if (normalized === 'pendente') return 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
  
  // Default dynamic colors
  const colors = [
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50',
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
    'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-900/50',
    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/50',
  ];
  let sum = 0;
  for (let i = 0; i < tag.length; i++) sum += tag.charCodeAt(i);
  return colors[sum % colors.length];
};

const isPlaceholderEmail = (email: string | null) => {
  if (!email) return true;
  return email.endsWith('@estateia.com') || email.endsWith('.clie') || email.includes('estateia');
};

const normalizePhone = (phone?: string | null) => (phone || '').replace(/\D/g, '');

const getLeadActionLabel = (action?: string | null) => {
  switch (action) {
    case 'follow_up_atrasado':
      return 'Follow-up';
    case 'qualificar_lead':
      return 'Qualificar';
    case 'buscar_imoveis':
      return 'Buscar imóveis';
    case 'indicar_imovel':
      return 'Indicar imóvel';
    case 'agendar_visita':
      return 'Agendar visita';
    case 'confirmar_visita':
      return 'Confirmar visita';
    case 'enviar_opcoes':
      return 'Enviar opcoes';
    case 'match_pronto':
      return 'Match pronto';
    case 'retomar_ia':
      return 'Retomar IA';
    case 'priorizar_corretor':
      return 'Prioridade';
    case 'ia_pausada':
      return 'Manual';
    case 'acompanhar':
      return 'Acompanhar';
    case 'sem_acao':
      return 'Sem ação';
    default:
      return 'Próxima ação';
  }
};

const getLeadActionStyles = (action?: string | null) => {
  switch (action) {
    case 'follow_up_atrasado':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'priorizar_corretor':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'qualificar_lead':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'buscar_imoveis':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'indicar_imovel':
      return 'border-violet-200 bg-violet-50 text-violet-700';
    case 'agendar_visita':
    case 'confirmar_visita':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'match_pronto':
    case 'enviar_opcoes':
      return 'border-violet-200 bg-violet-50 text-violet-700';
    case 'retomar_ia':
      return 'border-cyan-200 bg-cyan-50 text-cyan-700';
    case 'ia_pausada':
      return 'border-slate-200 bg-slate-50 text-slate-700';
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
};

const FUNNEL_STAGES: { value: string; label: string }[] = [
  { value: 'Contato Cadastrado', label: 'Contato Cadastrado' },
  { value: 'Primeiro Atendimento / Qualificação', label: 'Primeiro Atendimento / Qualificação' },
  { value: 'Qualificado', label: 'Qualificado' },
  { value: 'Follow Up', label: 'Follow Up' },
  { value: 'Buscar Imóveis', label: 'Buscar Imóveis' },
  { value: 'Agendamento Visita/Reunião', label: 'Agendamento Visita/Reunião' },
  { value: 'Visita/Reunião Agendada', label: 'Visita/Reunião Agendada' },
  { value: 'Match Pronto', label: 'Match Pronto' },
  { value: 'Apresentar Imóveis', label: 'Apresentar Imóveis' },
  { value: 'Imóvel Escolhido', label: 'Imóvel Escolhido' },
  { value: 'Proposta Solicitada', label: 'Proposta Solicitada' },
  { value: 'Vendido', label: 'Vendido' },
  { value: 'A Selecionar', label: 'A Selecionar' },
];

const QUALIFY_STEPS = [
  'Revisando si este cliente ya está registrado...',
  'Buscando si tiene un lead o atendimento vinculado...',
  'Guardando y vinculando...',
];

const getFunnelStageLabel = (stage?: string | null) => {
  const found = FUNNEL_STAGES.find((s) => s.value === stage);
  return found ? found.label : (stage && stage.trim() ? stage : 'Contato Cadastrado');
};

const getQualifyResultTitle = (status: string) => {
  switch (status) {
    case 'multiplicidad':
    case 'error':
      return 'Erro de Integridade';
    case 'ya_vinculado':
      return 'Lead já cadastrado';
    case 'vinculado':
      return 'Vinculado';
    default:
      return 'Cadastrado e vinculado';
  }
};

const getQualifyResultMessage = (status: string) => {
  switch (status) {
    case 'multiplicidad':
    case 'error':
      return 'Erro de Integridade: foram encontrados múltiplos registros para este contacto. A administração foi notificada para unificar os dados.';
    case 'ya_vinculado':
      return 'Este lead já está cadastrado. Abra o cartão do lead e toque no balão de atendimento para iniciar o chat corretamente.';
    case 'vinculado':
      return 'Vinculado';
    default:
      return 'Cadastrado e vinculado';
  }
};

const getMissingFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    tipo_finalidade: 'Tipo/finalidade',
    tipo: 'Tipo',
    finalidade: 'Finalidade',
    quartos_suites: 'Quartos',
    quartos: 'Quartos',
    suites: 'Suites',
    tamanho: 'Tamanho',
    area_util: 'Area',
    localizacao: 'Localização',
    faixa_valor: 'Valor',
    valor: 'Valor',
    budget_min: 'Valor minimo',
    budget_max: 'Valor maximo',
    bairro: 'Bairro',
    cidade: 'Cidade',
    perfil_familiar: 'Perfil familiar',
    necessidades: 'Necessidades',
    necessidade_especial: 'Necessidade especial',
    urgencia: 'Urgência',
  };
  return labels[field] || field.replace(/_/g, ' ');
};

const formatCurrency = (value?: number | string | null) => {
  const amount = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(amount || NaN)) return 'Valor sob consulta';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(amount as number);
};

const getProfileCompletionPercent = (leadAction?: LeadNextAction | null) => {
  if (!leadAction) return 0;
  if (leadAction.perfil_completo) return 100;
  const missing = leadAction.missing_count ?? (leadAction.missing_fields || []).length;
  return Math.max(0, Math.min(100, Math.round(((8 - missing) / 8) * 100)));
};

const getLeadTemperatureLabel = (score?: number | null) => {
  if (score == null) return 'Sem score';
  if (score >= 80) return 'Quente';
  if (score >= 55) return 'Morno';
  return 'Frio';
};

const getLeadActionDescription = (action?: string | null) => {
  switch (action) {
    case 'follow_up_atrasado':
      return 'Cliente ficou sem retorno recente. Reabra com contexto e uma pergunta simples.';
    case 'qualificar_lead':
      return 'Faltam dados para o agente filtrar bons imoveis sem chute.';
    case 'buscar_imoveis':
      return 'Perfil suficiente para procurar opcoes antes de responder.';
    case 'indicar_imovel':
    case 'match_pronto':
    case 'enviar_opcoes':
      return 'Ha indicacao pronta. Envie a opcao e convide para visita.';
    case 'agendar_visita':
    case 'confirmar_visita':
      return 'Cliente esta pronto para agenda. Confirme dia, horario e nome completo.';
    case 'priorizar_corretor':
      return 'Lead de alta prioridade. Assuma manualmente e avance com cuidado.';
    case 'ia_pausada':
      return 'IA pausada. O corretor precisa conduzir a conversa.';
    case 'retomar_ia':
      return 'A conversa pode voltar para a IA depois da checagem manual.';
    default:
      return 'Monitore a conversa e mantenha o proximo passo claro.';
  }
};

const qualificaStepLabel = (code?: string | null) => {
  switch (code) {
    case 'open': return 'Abertura';
    case 'finance': return 'Orçamento';
    case 'region': return 'Cidade preferida';
    case 'presentation': return 'Apresentação';
    case 'compromise': return 'Compromisso';
    default: return code || 'Etapa';
  }
};

const buildQualificationDraft = (leadAction?: LeadNextAction | null) => {
  const missing = (leadAction?.missing_fields || []).map(getMissingFieldLabel);
  if (!missing.length) {
    return 'Com essas informacoes ja consigo buscar opcoes melhores para voce. Quer priorizar valor, localizacao ou tamanho?';
  }
  return `Para eu te ajudar melhor, posso confirmar rapidinho: ${missing.slice(0, 3).join(', ')}?`;
};

const buildRecommendationDraft = (recommendation?: LeadPropertyRecommendation | null) => {
  if (!recommendation) {
    return 'Estou separando as opcoes que mais combinam com o que voce procura. Se quiser, ja posso te mandar as melhores e vemos uma visita em seguida.';
  }

  return `Encontrei uma opcao que parece combinar com o que voce procurou: ${recommendation.property_title}, em ${recommendation.property_location}, por ${formatCurrency(recommendation.property_price)}. Quer que eu te envie mais detalhes ou prefere agendar uma visita?`;
};

const getPropertyImageUrl = (recommendation?: LeadPropertyRecommendation | null) => {
  if (!recommendation) return null;
  return recommendation.image_url || recommendation.images?.find(Boolean) || null;
};

const getPropertyCrmLink = (propertyId?: string | null) => {
  if (!propertyId || typeof window === 'undefined') return null;
  return `${window.location.origin}/imoveis?property=${propertyId}`;
};

const buildPropertyCardDraft = (recommendation?: LeadPropertyRecommendation | null) => {
  if (!recommendation) return buildRecommendationDraft(null);

  const details = [
    recommendation.bedrooms ? `${recommendation.bedrooms} quarto(s)` : null,
    recommendation.bathrooms ? `${recommendation.bathrooms} banheiro(s)` : null,
    recommendation.parking ? `${recommendation.parking} vaga(s)` : null,
    recommendation.area ? `${recommendation.area}` : null,
  ].filter(Boolean).join(' | ');

  const reasons = (recommendation.match_reasons || []).slice(0, 3).join(', ');
  const imageUrl = getPropertyImageUrl(recommendation);
  const crmLink = getPropertyCrmLink(recommendation.property_id);

  return [
    `Separei este imovel cadastrado que combina com o que voce procura:`,
    ``,
    `*${recommendation.property_title}*${recommendation.property_code ? ` (${recommendation.property_code})` : ''}`,
    `Localizacao: ${recommendation.property_location || recommendation.property_address || 'sob consulta'}`,
    `Valor: ${formatCurrency(recommendation.property_price)}`,
    details ? `Detalhes: ${details}` : null,
    reasons ? `Por que combina: ${reasons}` : null,
    imageUrl ? `Foto: ${imageUrl}` : null,
    crmLink ? `Link: ${crmLink}` : null,
    ``,
    `Quer que eu agende uma visita para voce conhecer?`,
  ].filter((line) => line !== null).join('\n');
};

const buildRecommendationsDraft = (recommendations: LeadPropertyRecommendation[]) => {
  const items = recommendations.slice(0, 3);
  if (!items.length) return buildRecommendationDraft(null);

  return [
    `Encontrei ${items.length} opcao${items.length > 1 ? 'es' : ''} cadastrada${items.length > 1 ? 's' : ''} que combina${items.length > 1 ? 'm' : ''} com o que voce procura:`,
    ``,
    ...items.map((item, index) => {
      const details = [
        item.bedrooms ? `${item.bedrooms} quarto(s)` : null,
        item.parking ? `${item.parking} vaga(s)` : null,
        item.area || null,
      ].filter(Boolean).join(' | ');
      return `${index + 1}. ${item.property_title}${item.property_code ? ` (${item.property_code})` : ''} - ${formatCurrency(item.property_price)} - ${item.property_location}${details ? ` - ${details}` : ''}`;
    }),
    ``,
    `Qual dessas voce quer conhecer melhor ou agendar visita?`,
  ].join('\n');
};

const buildVisitDraft = (recommendation?: LeadPropertyRecommendation | null) => {
  const address = recommendation?.property_address || recommendation?.property_location || 'o imovel';
  return `Consigo agendar uma visita para voce conhecer ${address}. Qual dia e horario funcionam melhor para voce?`;
};

const buildBrokerTransferSummary = (
  conv: Conversation | null,
  leadAction: LeadNextAction | null,
  recommendations: LeadPropertyRecommendation[],
) => {
  const profileLines = [
    leadAction?.tipo_imovel_p1 ? `Tipo/finalidade: ${leadAction.tipo_imovel_p1}` : null,
    leadAction?.p2_quartos_suites ? `Quartos/suites: ${leadAction.p2_quartos_suites}` : null,
    leadAction?.p3_tamanho_imovel ? `Tamanho: ${leadAction.p3_tamanho_imovel}` : null,
    leadAction?.p4_localizacao ? `Localizacao: ${leadAction.p4_localizacao}` : null,
    leadAction?.p5_faixa_valor ? `Faixa de valor: ${leadAction.p5_faixa_valor}` : null,
    leadAction?.p6_perfil_familiar ? `Perfil familiar: ${leadAction.p6_perfil_familiar}` : null,
    leadAction?.p7_necessidades_especiais ? `Necessidades: ${leadAction.p7_necessidades_especiais}` : null,
    leadAction?.p8_urgencia ? `Urgencia: ${leadAction.p8_urgencia}` : null,
  ].filter(Boolean);

  const missing = (leadAction?.missing_fields || []).map(getMissingFieldLabel);
  const propertyLines = recommendations.slice(0, 3).map((item, index) =>
    `${index + 1}. ${item.property_title}${item.property_code ? ` (${item.property_code})` : ''} - ${formatCurrency(item.property_price)} - score ${item.match_score}`
  );

  return [
    'Resumo para corretor',
    `Cliente: ${conv?.client?.full_name || leadAction?.name || 'Cliente'}`,
    `Telefone: ${conv?.client?.phone || leadAction?.phone || 'Nao informado'}`,
    leadAction?.stage ? `Etapa: ${leadAction.stage}` : null,
    leadAction?.next_action ? `Proxima acao: ${getLeadActionLabel(leadAction.next_action)}` : null,
    '',
    'Perfil capturado:',
    profileLines.length ? profileLines.join('\n') : 'Ainda faltam informacoes de perfil.',
    missing.length ? `Campos pendentes: ${missing.join(', ')}` : 'Campos essenciais preenchidos.',
    '',
    'Imoveis sugeridos:',
    propertyLines.length ? propertyLines.join('\n') : 'Nenhum imovel estruturado sugerido ainda.',
    '',
    'Orientacao: assuma a conversa com contexto, valide o interesse no melhor match e avance para visita.',
  ].filter((line) => line !== null).join('\n');
};

import React, { ErrorInfo } from 'react';

class AtendimentoErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null, info: ErrorInfo | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    console.error("Atendimento Crash:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#990000', background: '#ffebee', height: '100vh', width: '100vw', overflow: 'auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>TELA BRANCA - RELATÓRIO DE ERRO</h1>
          <p>Por favor, tire um print desta tela e me envie.</p>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 20, background: '#fff', padding: 20, border: '1px solid #f44336' }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 20, background: '#fff', padding: 20, border: '1px solid #f44336', fontSize: 12 }}>
            {this.state.info?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Componente hijo memoizado (fuera del map) que consulta los follow-ups pendientes
// de una conversa y muestra el badge-reloj (FollowUpBadge) del más próximo.
// Fuera del bucle porque los hooks no pueden llamarse dentro de filteredConversations.map().
const FollowUpBadgeForConversation = ({ conversationId }: { conversationId: string }) => {
  const { data = [] } = usePendingFollowupsByConversation(conversationId);
  const firstPending = data && data.length > 0 ? data[0] : null;
  if (!firstPending || !firstPending.scheduled_at) return null;
  return <FollowUpBadge scheduled_at={firstPending.scheduled_at} />;
};

function AtendimentoContent() {
  const queryClient = useQueryClient();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"meus" | "equipe" | "grupos" | "nao-lidas" | "nao-direcionados" | "arquivadas">(() => {
    try {
      const saved = localStorage.getItem("atendimento_active_tab");
      return saved === "meus" || saved === "equipe" || saved === "grupos" || saved === "nao-lidas" || saved === "nao-direcionados" || saved === "arquivadas" ? saved : "meus";
    } catch {
      return "meus";
    }
  });
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [filtroCorretor, setFiltroCorretor] = useState<string>("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [messageInput, setMessageInput] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const hasAutoOpenedModalRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateVisitModal, setShowCreateVisitModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChatConfig, setShowChatConfig] = useState(false);
  const [contactPanelOpen, setContactPanelOpen] = useState(false);
  const [hideGroups, setHideGroups] = useState(() => {
    try {
      return localStorage.getItem("estate_atendimento_hide_groups") !== "false";
    } catch {
      return true;
    }
  });
  const [selectedStatus, setSelectedStatus] = useState("open");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  // Funil anti-duplicidad (Bloque A2)
  const [qualifyProgress, setQualifyProgress] = useState(0);
  const [qualifyResult, setQualifyResult] = useState<string | null>(null);

  // Tags & Delete States
  const [newTagInput, setNewTagInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [convToDelete, setConvToDelete] = useState<string | null>(null);
  const [transferConversationId, setTransferConversationId] = useState<string | null>(null);
  const [transferAgentId, setTransferAgentId] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Contact Edit States
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Add Contact Modal States
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [isSavingContactNew, setIsSavingContactNew] = useState(false);

  // Camera, Geolocation & Contact Sharing States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactShareName, setContactShareName] = useState("");
  const [contactSharePhone, setContactSharePhone] = useState("");
  const [contactShareEmail, setContactShareEmail] = useState("");
  const [contactShareCompany, setContactShareCompany] = useState("");

  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const imageVideoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Camera Video Recording States
  const [isCameraRecording, setIsCameraRecording] = useState(false);
  const [cameraRecordingTime, setCameraRecordingTime] = useState(0);
  const cameraRecorderRef = useRef<MediaRecorder | null>(null);
  const cameraChunksRef = useRef<BlobPart[]>([]);
  const cameraTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Message quick actions states
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [forwardSearch, setForwardSearch] = useState("");
  const [reactions, setReactions] = useState<{ [msgId: string]: string }>(() => {
    try {
      const saved = localStorage.getItem("crm_chat_reactions");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleAddReaction = (msgId: string, emoji: string) => {
    setReactions(prev => {
      const updated = { ...prev, [msgId]: emoji };
      localStorage.setItem("crm_chat_reactions", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveReaction = (msgId: string) => {
    setReactions(prev => {
      const updated = { ...prev };
      delete updated[msgId];
      localStorage.setItem("crm_chat_reactions", JSON.stringify(updated));
      return updated;
    });
  };

  const { user, profile, isPhoneRestricted } = useAuth();
  const isAgent = profile?.role === 'agent';
  // Definition de "tiene dueño / direcionado": conversations.agent_id es el campo
  // operativo; también se valida agent (join) y lead.responsible (join). No hay
  // responsible_id en conversations ni whatsapp_contacts — ver owner-field-orphan-filter.
  const isDirecionado = (conv: Conversation) =>
    Boolean(conv.agent_id || conv.agent?.id || conv.lead?.responsible?.id);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  // Follow-up & Tags modal states (FollowUpModal / TagsManager)
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [followUpConvId, setFollowUpConvId] = useState<string | null>(null);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const currentTenantId = profile?.tenant_id ?? "";
  const createLeadMutation = useCreateLead();
  const createVisitMutation = useCreateVisit();

  // Real data hooks
  const { data: conversations = [], isLoading: convLoading } = useConversations(user?.id, profile?.role || 'admin');
  const { data: messages = [] } = useMessages(selectedConvId);
  // Contatos de Atendimiento (clientes das conversations) para o modal compartido CreateVisitModal
  const availableContacts: Contact[] = useMemo(
    () =>
      conversations
        .filter((c) => !!c.client)
        .map((c) => ({
          id: c.client!.id,
          conversationId: c.id,
          name: c.client!.full_name || "",
          phone: c.client!.phone || "",
          email: c.client!.email || null,
          avatarUrl: c.client!.avatar_url || null,
        }))
        .filter((c) => c.name.trim().length > 0 || c.phone.trim().length > 0),
    [conversations]
  );
  const { data: leadNextActions = [] } = useLeadNextActions(!!user);
  const { data: leadPropertyRecommendations = [] } = useLeadPropertyRecommendations(!!user);
  const { data: whatsappSession, isLoading: waLoading } = useWhatsAppSession();
  const { data: agents = [] } = useAgents();

  const selectedConv = conversations.find(c => c.id === selectedConvId) || null;
  const { data: sdrData } = useSdrAnswers(!!selectedConvId && !!selectedConv, selectedConvId);
  const sdrSession = sdrData?.session ?? null;
  const sdrAnswers = sdrData?.answers ?? [];

  useEffect(() => {
    const initialSearch = searchParams.get("search");
    if (initialSearch) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const leadActionByPhone = useMemo(() => {
    const map = new Map<string, LeadNextAction>();
    for (const action of leadNextActions) {
      const phone = normalizePhone(action.phone);
      if (!phone) continue;
      const current = map.get(phone);
      if (!current || (action.action_priority || 0) > (current.action_priority || 0)) {
        map.set(phone, action);
      }
    }
    return map;
  }, [leadNextActions]);
  const getConversationLeadAction = (conv: typeof conversations[number]) => {
    const phone = normalizePhone(conv.client?.phone);
    return phone ? leadActionByPhone.get(phone) || null : null;
  };
  const recommendationsByPhone = useMemo(() => {
    const map = new Map<string, LeadPropertyRecommendation[]>();
    for (const recommendation of leadPropertyRecommendations) {
      const phone = normalizePhone(recommendation.lead_phone);
      if (!phone) continue;
      const current = map.get(phone) || [];
      current.push(recommendation);
      map.set(phone, current);
    }
    for (const [phone, items] of map.entries()) {
      map.set(
        phone,
        items
          .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
          .slice(0, 3)
      );
    }
    return map;
  }, [leadPropertyRecommendations]);
  const getConversationRecommendations = (conv: Conversation) => {
    const phone = normalizePhone(conv.client?.phone);
    return phone ? recommendationsByPhone.get(phone) || [] : [];
  };
  const getConversationRecommendation = (conv: Conversation) => getConversationRecommendations(conv)[0] || null;
  const selectedLeadAction = selectedConv ? getConversationLeadAction(selectedConv) : null;
  const selectedPropertyRecommendations = selectedConv ? getConversationRecommendations(selectedConv) : [];
  const selectedPropertyRecommendation = selectedPropertyRecommendations[0] || null;
  const actionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const conv of conversations) {
      if (conv.status === 'deleted' || conv.subject === '[deleted]') continue;
      const action = getConversationLeadAction(conv)?.next_action;
      if (!action || action === 'sem_acao') continue;
      counts[action] = (counts[action] || 0) + 1;
    }
    return counts;
  }, [conversations, leadActionByPhone]);
  const visibleConversationCount = conversations.filter((conv) => {
    if (conv.status === 'deleted' || conv.subject === '[deleted]') return false;
    const isGroup = conv.whatsapp_contact && conv.whatsapp_contact[0]?.is_group;
    return !(hideGroups && isGroup);
  }).length;

  const sendWhatsAppMutation = useSendWhatsAppMessage();
  const markReadMutation = useMarkMessagesRead();
  const updateTagsMutation = useUpdateConversationTags();
  // Catálogo de tags por usuário (TagsManager / persistencia ao criar)
  const { data: userTagsCatalog = [] } = useUserTags();
  const { data: userTagCategories = [] } = useUserTagCategories();
  const createUserTagMutation = useCreateUserTag();
  const deleteConversationMutation = useDeleteConversation();
  const updateSettingsMutation = useUpdateConversationSettings();
  const setConversationAIMutation = useSetConversationAIEnabled();
  const markPropertyRecommendedMutation = useMarkPropertyRecommended();
  const selectedConvAIEnabled = selectedConv?.ai_enabled !== false;
  const selectedPropertyAlreadyRecommended =
    !!selectedLeadAction?.suggested_property_id &&
    selectedLeadAction.suggested_property_id === selectedPropertyRecommendation?.property_id;

  useEffect(() => {
    if (selectedConv) {
      setSelectedStatus(selectedConv.status || "open");
      setSelectedAgentId(selectedConv.agent_id || null);
    }
  }, [selectedConv]);

  useEffect(() => {
    localStorage.setItem("atendimento_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("estate_atendimento_hide_groups", String(hideGroups));
  }, [hideGroups]);

  const handleAddTag = async (tag: string, convId?: string) => {
    const targetId = convId || selectedConvId;
    if (!targetId) return;
    const activeConv = conversations.find(c => c.id === targetId) || null;
    if (!activeConv || !activeConv.id) return;
    const currentTags = activeConv.tags || [];
    const normalizedTag = tag.trim();
    if (!normalizedTag || currentTags.includes(normalizedTag)) return;

    const newTags = [...currentTags, normalizedTag];
    try {
      await updateTagsMutation.mutateAsync({ conversationId: activeConv.id, tags: newTags });
      toast({ title: "Tag adicionada", description: `A tag "${normalizedTag}" foi adicionada com sucesso.` });
      // Persistir no catálogo do usuário (user_tags) quando a tag ainda não existe →
      // fica "na memória" para reaparecer nas próximas conversas sem recriar.
      const already = userTagsCatalog.some(c => c.label.toLowerCase() === normalizedTag.toLowerCase());
      if (!already) {
        await createUserTagMutation.mutateAsync({ label: normalizedTag, color: "#3b82f6" });
      }
    } catch (err) {
      toast({ title: "Erro ao adicionar tag", description: (err as Error).message || "Ocorreu um erro.", variant: "destructive" });
    }
  };

  const handleToggleConversationAI = async (enabled: boolean) => {
    if (!selectedConv?.id) return;
    try {
      await setConversationAIMutation.mutateAsync({ conversationId: selectedConv.id, enabled });
      toast({
        title: enabled ? "IA ativada" : "IA pausada",
        description: enabled
          ? "A IA volta a responder novas mensagens deste atendimento."
          : "Novas mensagens deste atendimento ficarão em modo manual.",
      });
    } catch (err) {
      toast({
        title: "Erro ao atualizar IA",
        description: (err as Error).message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleQualifyConversation = async () => {
    const convId = selectedConv?.id;
    if (!convId) return;
    const hadLeadBefore = !!selectedConv?.lead_id;
    setQualifyResult(null);
    setQualifyProgress(1);
    // Barra de progresso 'leiga': 3 pasos animados mientras corre la chamada única
    const a1 = setTimeout(() => setQualifyProgress(2), 650);
    const a2 = setTimeout(() => setQualifyProgress(3), 1300);
    try {
      const { error } = await supabase.from('conversations').update({ stage: 'Qualificado' }).eq('id', convId);
      clearTimeout(a1);
      clearTimeout(a2);
      setQualifyProgress(0);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (error) {
        const msg = (error && (error.message || '')) || '';
        setQualifyResult(/multipl|integr|multiple/i.test(msg) ? 'multiplicidad' : 'error');
        return;
      }
      const { data: fresh } = await supabase.from('conversations').select('lead_id').eq('id', convId).single();
      setQualifyResult(hadLeadBefore ? 'ya_vinculado' : (fresh?.lead_id ? 'cadastrado_vinculado' : 'vinculado'));
    } catch {
      clearTimeout(a1);
      clearTimeout(a2);
      setQualifyProgress(0);
      setQualifyResult('error');
    }
  };

  const handleStageChange = async (stage: string) => {
    if (!selectedConv?.id) return;
    if (stage === 'Qualificado') {
      await handleQualifyConversation();
      return;
    }
    const convId = selectedConv.id;
    const { error } = await supabase.from('conversations').update({ stage }).eq('id', convId);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    if (error) {
      toast({ title: 'Erro ao atualizar estágio', description: error.message || 'Não foi possível atualizar o estágio.', variant: 'destructive' });
    } else {
      toast({ title: 'Estágio atualizado', description: `Estágio atualizado a "${getFunnelStageLabel(stage)}".` });
    }
  };

  const handleMarkPropertyRecommended = async () => {
    if (!selectedLeadAction?.lead_id || !selectedPropertyRecommendation?.property_id) return;

    try {
      await markPropertyRecommendedMutation.mutateAsync({
        leadId: selectedLeadAction.lead_id,
        propertyId: selectedPropertyRecommendation.property_id,
        matchScore: selectedPropertyRecommendation.match_score,
        notes: `Indicado pelo atendimento em ${new Date().toISOString()}`,
      });

      toast({
        title: "Indicação registrada",
        description: "O lead foi atualizado e essa recomendação saiu da fila de indicações pendentes.",
      });
    } catch (err) {
      toast({
        title: "Erro ao registrar indicação",
        description: (err as Error).message || "Não foi possível salvar a indicação do imóvel.",
        variant: "destructive",
      });
    }
  };

  const handleSendPropertyRecommendation = async (recommendation: LeadPropertyRecommendation) => {
    if (!selectedConv || !user) return;

    try {
      await sendWhatsAppMutation.mutateAsync({
        conversationId: selectedConv.id,
        content: buildPropertyCardDraft(recommendation),
      });

      await markPropertyRecommendedMutation.mutateAsync({
        leadId: recommendation.lead_id,
        propertyId: recommendation.property_id,
        matchScore: recommendation.match_score,
        notes: `Imovel enviado pelo atendimento em ${new Date().toISOString()}`,
      });

      toast({
        title: "Imovel enviado",
        description: "A recomendacao foi enviada no WhatsApp e registrada no lead.",
      });
    } catch (err) {
      toast({
        title: "Erro ao enviar imovel",
        description: (err as Error).message || "Nao foi possivel enviar esta recomendacao.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTag = async (tag: string, convId?: string) => {
    const targetId = convId || selectedConvId;
    if (!targetId) return;
    const activeConv = conversations.find(c => c.id === targetId) || null;
    if (!activeConv || !activeConv.id) return;
    const currentTags = activeConv.tags || [];
    const newTags = currentTags.filter(t => t !== tag);
    try {
      await updateTagsMutation.mutateAsync({ conversationId: activeConv.id, tags: newTags });
      toast({ title: "Tag removida", description: `A tag "${tag}" foi removida com sucesso.` });
    } catch (err) {
      toast({ title: "Erro ao remover tag", description: (err as Error).message || "Ocorreu um erro.", variant: "destructive" });
    }
  };

  const handleAddCustomTag = () => {
    if (!newTagInput.trim()) return;
    handleAddTag(newTagInput.trim());
    setNewTagInput("");
  };

  const handleDeleteConversation = (id: string) => {
    setConvToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!convToDelete) return;
    try {
      await deleteConversationMutation.mutateAsync(convToDelete);
      toast({ title: "Conversa excluída", description: "O atendimento foi excluído com sucesso." });
      
      const remaining = conversations.filter(c => c.id !== convToDelete);
      if (remaining.length > 0) {
        setSelectedConvId(remaining[0].id);
      } else {
        setSelectedConvId(null);
      }
      
      setShowDeleteConfirm(false);
      setConvToDelete(null);
    } catch (err) {
      toast({ title: "Erro ao excluir", description: (err as Error).message || "Ocorreu um erro ao excluir a conversa.", variant: "destructive" });
    }
  };

  const openTransferDialog = (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    setSelectedConvId(conversationId);
    setTransferConversationId(conversationId);
    setTransferAgentId(conv?.agent_id || "");
  };

  const handleConfirmTransfer = async () => {
    if (!transferConversationId || !transferAgentId) {
      toast({ title: "Selecione um corretor", description: "Escolha quem vai assumir este atendimento.", variant: "destructive" });
      return;
    }

    setIsTransferring(true);
    try {
      const transferConv = conversations.find((conv) => conv.id === transferConversationId) || selectedConv || null;
      const transferLeadAction = transferConv ? getConversationLeadAction(transferConv) : null;
      const transferRecommendations = transferConv ? getConversationRecommendations(transferConv) : [];
      const summary = buildBrokerTransferSummary(transferConv, transferLeadAction, transferRecommendations);

      if (user?.id) {
        const { error: summaryError } = await supabase
          .from('messages')
          .insert({
            conversation_id: transferConversationId,
            sender_id: user.id,
            receiver_id: transferAgentId,
            content: summary,
            message_type: 'system',
            is_read: false,
          });
        if (summaryError) throw summaryError;
      }

      const { error } = await supabase.rpc('transfer_conversation', {
        p_conversation_id: transferConversationId,
        p_to_agent_id: transferAgentId,
      });
      if (error) throw error;

      toast({ title: "Atendimento transferido", description: "A conversa foi atribuída ao corretor selecionado." });
      setTransferConversationId(null);
      setTransferAgentId("");
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (err) {
      toast({ title: "Erro ao transferir", description: (err as Error).message || "Não foi possível transferir.", variant: "destructive" });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleSaveContact = async () => {
    if (!selectedConv || !selectedConv.client_id) return;
    setIsSavingContact(true);
    try {
      const cleanPhone = editPhone.trim();
      // Usar a nova função RPC que contorna o bloqueio de segurança (RLS)
      const { error } = await supabase.rpc('update_client_contact', {
        p_profile_id: selectedConv.client_id,
        p_name: editName,
        p_phone: cleanPhone || null,
        p_email: editEmail.trim() || null,
        p_lead_id: selectedConv.lead_id || null
      });

      if (error) {
        console.warn("RPC update_client_contact falhou (ou não existe). Tentando update direto...", error);
        
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({
            full_name: editName,
            email: editEmail.trim() || null,
            phone: cleanPhone || null
          } as any)
          .eq('id', selectedConv.client_id);
          
        if (profileErr) throw new Error("Erro RLS/Perfil: " + profileErr.message);

        const { error: wppErr } = await supabase
          .from('whatsapp_contacts')
          .update({
            name: editName,
            phone_number: cleanPhone ? cleanPhone.replace(/\D/g, '') : null
          })
          .eq('profile_id', selectedConv.client_id);
          
        if (wppErr) throw new Error("Erro RLS/WhatsApp: " + wppErr.message);
      }

      toast({ title: "Contato atualizado", description: "Os dados do contato foram salvos com sucesso." });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConv.id] });
      setIsEditingContact(false);
    } catch (err) {
      toast({ title: "Erro ao salvar contato", description: (err as Error).message || "Ocorreu um erro.", variant: "destructive" });
    } finally {
      setIsSavingContact(false);
    }
  };

  // Filter conversations based on search and tab
  const filteredConversations = conversations.filter((c) => {
    if (c.status === 'deleted' || c.subject === '[deleted]') return false;

    const isGroup = (c.whatsapp_contact && c.whatsapp_contact[0]?.is_group) || (c.client as any)?.is_group;
    if (hideGroups && activeTab !== 'grupos' && isGroup) return false;

    const clientName = c.client?.full_name?.toLowerCase() || '';
    const clientPhone = c.client?.phone?.toLowerCase() || '';
    const clientEmail = c.client?.email?.toLowerCase() || '';
    const subject = c.subject?.toLowerCase() || '';
    const matchesSearch = !searchQuery ||
      clientName.includes(searchQuery.toLowerCase()) ||
      clientPhone.includes(searchQuery.toLowerCase()) ||
      clientEmail.includes(searchQuery.toLowerCase()) ||
      subject.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (actionFilter !== "all") {
      const action = getConversationLeadAction(c)?.next_action;
      if (action !== actionFilter) return false;
    }

    // Filtro por atendente (solo admins/manager) — democratizado, restaurado del bundle v14
    if (filtroCorretor && c.agent_id !== filtroCorretor) return false;

    switch (activeTab) {
      case 'grupos':
        return isGroup === true;
      case 'meus':
        return c.agent_id === user?.id && c.status !== 'pending' && c.status !== 'closed' && !isGroup;
      case 'equipe':
        if (isAgent) return false;
        return c.status !== 'pending' && !isGroup;
      case 'nao-lidas':
        // "Não lidas": solo contatos CON dueño (direcionados) y con mensajes sin leer; no más órfanos
        return isDirecionado(c) && (c.unread_count || 0) > 0 && !isGroup;
      case 'nao-direcionados':
        // "Não Direcionados": contatos SIN dueño (órfanos), solo admin/manager; no incluye grupos
        if (isAgent) return false;
        return !isDirecionado(c) && !isGroup;
      case 'arquivadas':
        return c.status === 'closed' && !isGroup;
      default:
        return true;
    }
  });

  // Auto-open conversation ONLY on deep link (Lead / Dashboard balão). En acceso
  // estándar (menú) selectedConvId se queda null -> se muestra la LISTA en mobile.
  useEffect(() => {
    if (!selectedConvId && conversations.length > 0) {
      const state = location.state as any;

      // If we came from the Dashboard icon with lead info, open the New Message modal
      if (state?.leadToMessage && !isCreateOpen && !hasAutoOpenedModalRef.current) {
        hasAutoOpenedModalRef.current = true;
        setIsCreateOpen(true);
        return; // Don't auto-select a conversation so the modal stays in focus
      }

      // Deep link real: el balón del Lead navega con ?search=<tel/email> (Leads.tsx openAtendimentoForLead).
      // Solo en este caso resolvemos y abrimos la 1ª coincidencia; nunca conversations[0] en acceso libre,
      // para no fuerzar un chat al entrar por el menú mobile.
      if (searchQuery) {
        if (filteredConversations.length > 0) {
          setSelectedConvId(filteredConversations[0].id);
        }
      }
      // else: acceso estándar -> permanecer en lista (selectedConvId = null)
    }
  }, [conversations, filteredConversations, selectedConvId, searchQuery, location.state, isCreateOpen]);

  // Mark messages as read + zerar unread_count na conversa (badge verde estilo WhatsApp)
  useEffect(() => {
    if (selectedConvId && user?.id) {
      markReadMutation.mutate({ conversationId: selectedConvId, userId: user.id });
      supabase.rpc('mark_conversation_read', { p_conversation_id: selectedConvId }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      });
    }
  }, [selectedConvId, messages.length]);

  // Scroll to bottom
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = messagesEndRef.current?.parentElement;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, selectedConvId]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConv || !user) return;
    
    let content = messageInput.trim();
    if (replyingTo) {
      const senderName = replyingTo.sender?.full_name || 'Cliente';
      content = `↳ *Respondendo a ${senderName}:* _"${replyingTo.content.slice(0, 80)}"_\n\n${content}`;
    }

    sendWhatsAppMutation.mutate(
      { conversationId: selectedConv.id, content },
      {
        onSuccess: () => {
          setMessageInput("");
          setReplyingTo(null);
        },
        onError: (err) => toast({ title: "Erro ao enviar", description: (err as Error).message || "Tente novamente.", variant: "destructive" }),
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createConversationMutation = useCreateConversation();

  // ─── QUICK ACTION HANDLERS ───
  const sendSystemMessage = async (content: string) => {
    if (!selectedConv || !user) return;
    await sendWhatsAppMutation.mutateAsync({ conversationId: selectedConv.id, content });
  };

  // Abre o modal compartido de agendamiento (CreateVisitModal).
  const handleQuickScheduleVisit = () => {
    setShowCreateVisitModal(true);
  };

  // Maneja a confirmação do modal compartido CreateVisitModal, mantendo o mesmo flow
  // de criação + mensagem de confirmación que o diálgo original tinha.
  const handleConfirmCreateVisit = async (formData: VisitFormData) => {
    if (!selectedConv || !user) return;
    const time = formData.time || "10:00";
    try {
      const scheduledAt = new Date(`${formData.date}T${time}:00`);

      await createVisitMutation.mutateAsync({
        agent_id: user.id,
        created_by: user.id,
        scheduled_at: scheduledAt.toISOString(),
        status: formData.confirmed ? 'confirmed' : 'scheduled',
        duration_minutes: 90,
        notes: formData.notes || null,
        lead_id: formData.leadId || (formData.contactId ? null : selectedConv?.lead_id) || null,
        property_id: formData.propertyCode || null,
        contact_id: formData.contactId || null,
      });

      const dateFormatted = scheduledAt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
      await sendSystemMessage(
        `📅 Visita agendada para ${dateFormatted} às ${time}. Entraremos em contato para confirmar.`
      );

      toast({ title: "Visita agendada!", description: `Visita com ${selectedConv?.client?.full_name || 'cliente'} em ${dateFormatted} às ${time}.` });
      setShowCreateVisitModal(false);
    } catch (err) {
      toast({ title: "Erro", description: (err as Error).message || "Erro ao agendar visita.", variant: "destructive" });
    }
  };

  const handleQuickSendFicha = async () => {
    if (!selectedConv || !user) return;
    try {
      await sendSystemMessage(
        `Olá ${selectedConv.client?.full_name || ''}! Segue a ficha cadastral para preenchimento. Por favor, preencha todos os campos e nos envie de volta o mais breve possível para darmos continuidade ao processo.`
      );
      toast({ title: "Ficha enviada!", description: "Mensagem com ficha cadastral enviada ao cliente." });
    } catch (err) {
      toast({ title: "Erro", description: (err as Error).message || "Erro ao enviar ficha.", variant: "destructive" });
    }
  };

  const handleQuickSolicitarDocs = async () => {
    if (!selectedConv || !user) return;
    try {
      await sendSystemMessage(
        `Olá ${selectedConv.client?.full_name || ''}! Para avançarmos no processo, precisamos dos seguintes documentos:\n\n• RG e CPF\n• Comprovante de renda (últimos 3 meses)\n• Comprovante de endereço\n• Certidão de estado civil\n\nPor favor, envie as cópias digitalizadas por aqui ou pelo email.`
      );
      toast({ title: "Solicitação enviada!", description: "Mensagem de solicitação de documentos enviada." });
    } catch (err) {
      toast({ title: "Erro", description: (err as Error).message || "Erro ao solicitar docs.", variant: "destructive" });
    }
  };

  const handleQuickCreateProposal = () => {
    if (!selectedConv) return;
    navigate('/propostas');
    toast({ title: "Criar Proposta", description: `Redirecionando para criar proposta para ${selectedConv.client?.full_name || 'cliente'}.` });
  };

  const uploadAndSendFile = async (file: File) => {
    if (!selectedConv || !user) return;
    
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "Arquivo muito grande", description: "O tamanho máximo é 25MB.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${selectedConv.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(path);

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      
      const label = isImage ? '[Imagem]' : isVideo ? '[Video]' : isAudio ? '[Audio]' : '[Arquivo]';

      await sendWhatsAppMutation.mutateAsync({
        conversationId: selectedConv.id,
        content: `${label} ${file.name}\n${urlData.publicUrl}`,
      });

      toast({ title: "Arquivo enviado!", description: `${file.name} enviado com sucesso.` });
    } catch (err) {
      toast({ title: "Erro ao enviar arquivo", description: (err as Error).message || "Tente novamente.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAndSendFile(file);
    e.target.value = '';
  };

  // Camera capture controls
  const openCamera = async (facing: "user" | "environment") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: true });
      // Detener stream anterior si existe (evitar fuga de recursos al alternar cámara)
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({ title: "Erro ao acessar câmera", description: (err as Error).message || "Verifique as permissões de acesso à câmera.", variant: "destructive" });
      if (isCameraOpen) {
        setIsCameraOpen(false);
        setCameraFacing("user");
      }
      throw err;
    }
  };

  const handleTriggerCamera = async () => {
    setCameraFacing("user");
    setIsCameraOpen(true);
    setTimeout(() => {
      openCamera("user").catch(() => {});
    }, 300);
  };

  // Alternar entre cámara frontal (user, selfie) e trasera (environment, o que ve o dispositivo)
  const toggleCameraFacing = () => {
    if (isCameraRecording) return;
    const next = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(next);
    openCamera(next).catch(() => {});
  };

  const handleCapturePhoto = () => {
    if (!cameraVideoRef.current || !cameraStreamRef.current) return;
    
    const video = cameraVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (cameraFacing === "user") {
        // Selfie: el preview ya mostraba espejado; deshacer el espejo para guardar la foto normal
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else {
        // Cámara trasera (environment): capturar tal cual, sin espejo
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          uploadAndSendFile(file);
        }
        handleCloseCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  const handleCloseCamera = () => {
    if (isCameraRecording) cancelCameraVideoRecording();
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Camera video recording (mismo patrón que audio: MediaRecorder sobre stream de cámara)
  const startCameraVideoRecording = () => {
    if (!cameraStreamRef.current || isCameraRecording) return;
    try {
      const recorder = new MediaRecorder(cameraStreamRef.current);
      cameraRecorderRef.current = recorder;
      cameraChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          cameraChunksRef.current.push(event.data);
        }
      };
      recorder.start(200);
      setIsCameraRecording(true);
      setCameraRecordingTime(0);
      if (cameraTimerRef.current) clearInterval(cameraTimerRef.current);
      cameraTimerRef.current = setInterval(() => {
        setCameraRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast({ title: "Erro ao iniciar vídeo", description: (err as Error).message || "Não foi possível grabar vídeo.", variant: "destructive" });
    }
  };

  const stopAndSendCameraVideo = () => {
    if (!cameraRecorderRef.current || !isCameraRecording) return;
    cameraRecorderRef.current.onstop = async () => {
      const videoBlob = new Blob(cameraChunksRef.current);
      setIsCameraRecording(false);
      if (cameraTimerRef.current) clearInterval(cameraTimerRef.current);
      setIsCameraOpen(false);
      cameraStreamRef.current?.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
      if (videoBlob.size === 0) {
        toast({ title: "Erro ao enviar vídeo", description: "A gravação está vazia.", variant: "destructive" });
        return;
      }
      // Extensão .mp4 para que o broker/Evolution use FFMPEG y convierta al formato WhatsApp
      const file = new File([videoBlob], `camera_video_${Date.now()}.mp4`, { type: 'video/mp4' });
      await uploadAndSendFile(file);
    };
    cameraRecorderRef.current.stop();
  };

  const cancelCameraVideoRecording = () => {
    if (cameraRecorderRef.current && isCameraRecording) {
      cameraRecorderRef.current.onstop = null;
      cameraRecorderRef.current.stop();
      cameraRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (cameraTimerRef.current) clearInterval(cameraTimerRef.current);
    setIsCameraRecording(false);
    setCameraRecordingTime(0);
    cameraChunksRef.current = [];
  };

  // Audio Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);
      
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível acessar o microfone. Verifique as permissões.", variant: "destructive" });
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current);
        setIsRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        
        // Salvamos com a extensão .mp3 para forçar o broker/Evolution a usar o FFMPEG
        // e converter corretamente para OGG OPUS (formato nativo do WhatsApp).
        const file = new File([audioBlob], `audio_${Date.now()}.mp3`, { type: 'audio/mpeg' });
        await uploadAndSendFile(file);
      };
      mediaRecorderRef.current.stop();
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Geolocation sharing
  const handleShareLocation = () => {
    if (!selectedConv || !user) return;
    if (!navigator.geolocation) {
      toast({ title: "Geolocalização não suportada", description: "Seu navegador não suporta geolocalização.", variant: "destructive" });
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      const content = `📍 Localização Enviada:\n${mapsUrl}`;
      
      try {
        await sendWhatsAppMutation.mutateAsync({
          conversationId: selectedConv.id,
          content
        });
        toast({ title: "Localização enviada!", description: "Sua localização foi compartilhada no chat." });
      } catch (err) {
        toast({ title: "Erro ao enviar localização", description: (err as Error).message || "Tente novamente.", variant: "destructive" });
      }
    }, (err) => {
      toast({ title: "Erro de geolocalização", description: err.message || "Não foi possível obter sua localização.", variant: "destructive" });
    });
  };

  const openShareContactModal = () => {
    setContactShareName("");
    setContactSharePhone("");
    setContactShareEmail("");
    setContactShareCompany("");
    setIsContactModalOpen(true);
  };

  // Contact sharing
  const handleShareContactConfirm = async () => {
    if (!selectedConv || !user || !contactShareName.trim() || !contactSharePhone.trim()) return;
    
    const cardContent = `👤 Contato Compartilhado:\n• Nome: ${contactShareName.trim()}\n• WhatsApp: ${contactSharePhone.trim()}${contactShareEmail.trim() ? `\n• E-mail: ${contactShareEmail.trim()}` : ''}${contactShareCompany.trim() ? `\n• Empresa: ${contactShareCompany.trim()}` : ''}`;
    
    try {
      await sendWhatsAppMutation.mutateAsync({
        conversationId: selectedConv.id,
        content: cardContent
      });
      toast({ title: "Contato enviado!", description: "O contato foi compartilhado no chat." });
      setIsContactModalOpen(false);
      setContactShareName("");
      setContactSharePhone("");
      setContactShareEmail("");
      setContactShareCompany("");
    } catch (err) {
      toast({ title: "Erro ao enviar contato", description: (err as Error).message || "Tente novamente.", variant: "destructive" });
    }
  };

  const handleCreateAtendimento = async (formData: AtendimentoFormData) => {
    try {
      // 1. Ensure we have a lead
      let currentLeadId = formData.lead_id;
      if (!currentLeadId) {
        const newLead = await createLeadMutation.mutateAsync({
          name: formData.contact_name,
          phone: formData.contact_phone || null,
          email: formData.contact_email || null,
          stage: 'Primeiro Atendimento',
          source: formData.channel === 'whatsapp' ? 'WhatsApp' : formData.channel === 'phone' ? 'Outros' : formData.channel === 'email' ? 'Outros' : 'Site',
          interest: formData.type || null,
          notes: `[${formData.priority?.toUpperCase()}] ${formData.subject}\n${formData.description}`,
          responsible_id: user?.id || null,
          created_by: user?.id || null,
        });
        currentLeadId = newLead.id;
      }

      // 2. Find or create a client profile for the conversation
      let clientId: string | null = null;

      // Primeiro tenta achar pelo telefone (que é o identificador principal do WhatsApp)
      if (formData.contact_phone) {
        const { data: existingByPhone } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', formData.contact_phone)
          .maybeSingle();
        if (existingByPhone) clientId = existingByPhone.id;
      }

      // Se não achou pelo telefone, tenta achar pelo email
      if (!clientId && formData.contact_email) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', formData.contact_email)
          .eq('role', 'client')
          .maybeSingle();
        if (existingProfile) clientId = existingProfile.id;
      }

      if (!clientId) {
        // Create a client profile safely using create_client_profile RPC (satisfies the profiles_id_fkey constraint)
        const { data: newId, error: profileErr } = await supabase.rpc('create_client_profile', {
          p_name: formData.contact_name,
          p_phone: formData.contact_phone || null,
          p_email: formData.contact_email || null,
        });
        
        if (profileErr) throw profileErr;
        clientId = newId as string;
      }

      // 3. Create conversation and auto-select it
      if (clientId && user) {
        const conv = await createConversationMutation.mutateAsync({
          client_id: clientId,
          agent_id: user.id,
          subject: formData.subject || `Atendimento - ${formData.contact_name}`,
        });

        // 4. Send the first message if description is provided
        if (formData.description?.trim() && conv?.id) {
          await sendWhatsAppMutation.mutateAsync({
            conversationId: conv.id,
            content: formData.description.trim(),
          });
        }

        // 5. Auto-select the new conversation
        if (conv?.id) {
          setSelectedConvId(conv.id);
        }
      }

      toast({ title: "Atendimento Criado", description: `Conversa com ${formData.contact_name} aberta com sucesso.` });
    } catch (err) {
      toast({ title: "Erro ao criar atendimento", description: (err as Error).message || "Tente novamente.", variant: "destructive" });
    }
  };

  useEffect(() => {
    const handleEvent = (e: any) => {
      if (e.detail) {
        handleSelectParticipantPrivateChat(e.detail.profileId, e.detail.phone, e.detail.name);
      }
    };
    window.addEventListener('openPrivateChat', handleEvent);
    return () => window.removeEventListener('openPrivateChat', handleEvent);
  }, [conversations, user]); // Must depend on state that handleSelectParticipantPrivateChat uses

  const getRemoteJid = (phoneStr: string) => {
    if (!phoneStr) return '';
    if (phoneStr.includes('@')) {
      return phoneStr.replace(/:\d+@/, '@');
    }
    return `${phoneStr.replace(/\D/g, '')}@s.whatsapp.net`;
  };

  const handleSelectParticipantPrivateChat = async (profileId: string, phone: string, name: string) => {
    const rawRemoteJid = getRemoteJid(phone);
    const cleanPhoneRaw = phone.replace(/\D/g, '');
    
    // Tentar descobrir o número real caso tenhamos apenas o LID (Linked ID)
    let resolvedPhone = cleanPhoneRaw;
    let resolvedProfileId = profileId;
    let resolvedRemoteJid = rawRemoteJid;
    
    const { data: contactMatches } = await supabase
      .from('whatsapp_contacts')
      .select('phone_number, profile_id')
      .or(`remote_jid_alt.eq.${cleanPhoneRaw}@lid,remote_jid_alt.eq.${rawRemoteJid},remote_jid.eq.${rawRemoteJid},phone_number.eq.${cleanPhoneRaw}`)
      .not('phone_number', 'is', null)
      .limit(2); // Pegamos 2 para preferir o que tem número real
      
    let bestMatch = contactMatches?.[0];
    if (contactMatches && contactMatches.length > 1) {
      // Se achou o dummy (7265) e o real (5511), pegamos o real
      bestMatch = contactMatches.find(c => c.phone_number !== cleanPhoneRaw) || contactMatches[0];
    }
      
    if (bestMatch && bestMatch.phone_number) {
      resolvedPhone = bestMatch.phone_number;
      resolvedProfileId = bestMatch.profile_id || profileId;
      resolvedRemoteJid = getRemoteJid(resolvedPhone); // Use the real number's JID
    }

    const cleanPhone = resolvedPhone;

    // 1. Check if there is already a conversation for this client
    const existing = conversations.find(c => 
      c.client_id === resolvedProfileId && 
      !(c.whatsapp_contact && c.whatsapp_contact[0]?.is_group === true)
    );

    if (existing) {
      setActiveTab('meus');
      setSelectedConvId(existing.id);
      toast({
        title: "Conversa selecionada",
        description: `Abrindo conversa privada com ${name || cleanPhone}.`
      });
      
      // Patch para garantir que o remote_jid existe, pois sem ele a API Evolution não envia a mensagem
      supabase.from('whatsapp_contacts')
        .update({ remote_jid: resolvedRemoteJid })
        .eq('conversation_id', existing.id)
        .then();
    } else {
      try {
        toast({
          title: "Iniciando atendimento...",
          description: "Criando ficha do contato..."
        });

        // 1. Garantir que temos um lead
        let leadId: string | null = null;
        
        const { data: existingLead } = await supabase
          .from('leads')
          .select('id')
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (existingLead) {
          leadId = existingLead.id;
        } else {
          const newLead = await createLeadMutation.mutateAsync({
            name: name || `Cliente ${cleanPhone.slice(-4)}`,
            phone: cleanPhone,
            stage: 'Primeiro Atendimento',
            source: 'WhatsApp',
            notes: `Lead criado via grupo a partir de ${selectedConv?.client?.full_name || 'grupo'}.`,
            responsible_id: user?.id || null,
            created_by: user?.id || null,
          });
          leadId = newLead.id;
        }

        // 2. Garantir whatsapp_contact existe para o PV
        const { data: existingContact } = await supabase
          .from('whatsapp_contacts')
          .select('id')
          .eq('phone_number', cleanPhone)
          .eq('is_group', false)
          .maybeSingle();

        // 3. Criar a conversa
        const conv = await createConversationMutation.mutateAsync({
          client_id: profileId,
          agent_id: user?.id || null,
          subject: `WhatsApp - ${name || phone}`,
        });

        if (conv?.id) {
          if (!existingContact) {
            await supabase
              .from('whatsapp_contacts')
              .insert({
                tenant_id: selectedConv?.tenant_id,
                profile_id: profileId,
                conversation_id: conv.id,
                phone_number: cleanPhone,
                remote_jid: resolvedRemoteJid,
                name: name || `Cliente ${cleanPhone.slice(-4)}`,
                is_group: false,
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
          } else {
            await supabase
              .from('whatsapp_contacts')
              .update({
                conversation_id: conv.id,
                remote_jid: resolvedRemoteJid,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingContact.id);
          }

          setActiveTab('meus');
          setSelectedConvId(conv.id);
          toast({
            title: "Atendimento iniciado",
            description: `Conversa privada iniciada com sucesso.`
          });
        }
      } catch (err: any) {
        toast({
          title: "Erro ao iniciar conversa",
          description: err.message || "Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      toast({ title: "Campos obrigatórios", description: "Por favor, informe o nome e o telefone.", variant: "destructive" });
      return;
    }

    setIsSavingContactNew(true);
    try {
      // 1. Create client profile using the RPC
      const { data: newClientId, error: profileErr } = await supabase.rpc('create_client_profile', {
        p_name: newContactName.trim(),
        p_phone: newContactPhone.trim(),
        p_email: newContactEmail.trim() || null,
      });

      if (profileErr) throw profileErr;
      
      // 2. Create a new conversation for this client
      if (newClientId && user) {
        const conv = await createConversationMutation.mutateAsync({
          client_id: newClientId,
          agent_id: user.id,
          subject: `Conversa com ${newContactName.trim()}`,
        });

        // 3. Clear fields and close modal
        setNewContactName("");
        setNewContactPhone("");
        setNewContactEmail("");
        setIsAddContactOpen(false);

        // 4. Auto-select the new conversation
        if (conv?.id) {
          setSelectedConvId(conv.id);
        }
        
        toast({ title: "Contato Adicionado", description: "Contato e canal de atendimento criados com sucesso!" });
      }
    } catch (err) {
      toast({ title: "Erro ao adicionar contato", description: (err as Error).message || "Ocorreu um erro.", variant: "destructive" });
    } finally {
      setIsSavingContactNew(false);
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 24) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (diffHours < 48) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return "Não informado";
    const cleaned = phone.replace(/\D/g, "");
    if (!cleaned) return phone;

    // Se for um LID do WhatsApp (identificador de 15 dígitos), não é um número real
    if (cleaned.length === 15) {
      return "Não informado";
    }

    // Case 2: Brazilian phone with country code (13 digits starting with 55)
    if (cleaned.length === 13 && cleaned.startsWith("55")) {
      const ddd = cleaned.substring(2, 4);
      const prefix = cleaned.substring(4, 9);
      const suffix = cleaned.substring(9);
      return `+55 (${ddd}) ${prefix}-${suffix}`;
    }

    // Case 3: Brazilian phone with country code, old format (12 digits starting with 55)
    if (cleaned.length === 12 && cleaned.startsWith("55")) {
      const ddd = cleaned.substring(2, 4);
      const prefix = cleaned.substring(4, 8);
      const suffix = cleaned.substring(8);
      return `+55 (${ddd}) ${prefix}-${suffix}`;
    }

    // Case 4: Brazilian phone without country code (11 digits)
    if (cleaned.length === 11 && /^[1-9][1-9]9/.test(cleaned)) {
      const ddd = cleaned.substring(0, 2);
      const prefix = cleaned.substring(2, 7);
      const suffix = cleaned.substring(7);
      return `+55 (${ddd}) ${prefix}-${suffix}`;
    }

    // Case 5: Standard fallback - just format if possible or return as-is
    if (cleaned.length === 10) {
      const ddd = cleaned.substring(0, 2);
      const prefix = cleaned.substring(2, 6);
      const suffix = cleaned.substring(6);
      return `(${ddd}) ${prefix}-${suffix}`;
    }

    return phone;
  };

  const getCleanRealPhone = (phone: string | null | undefined): string => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    // Se for LID (15 dígitos), mantemos o campo limpo em branco
    if (cleaned.length === 15) {
      return "";
    }
    return phone;
  };

  const waStatusColor = (status?: string | null) => {
    switch (status) {
      case 'connected': return 'bg-emerald-500';
      case 'connecting':
      case 'qr_ready': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="h-[100dvh] bg-background overflow-hidden flex flex-col">
      <Sidebar activeModule="atendimento" onModuleChange={() => {}} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <MobileSidebar activeModule="atendimento" onModuleChange={() => {}} open={mobileOpen} onOpenChange={setMobileOpen} />

      <div className={cn("flex flex-col h-full transition-all duration-300", sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <Header
          title="Central de Atendimento"
          subtitle="Comunicação com clientes em tempo real"
          actionButton={
            <div className="flex items-center gap-2">
              {!isAgent && (
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={() => setShowSettings(true)}
                  title="Configurações WhatsApp"
                >
                  <Settings className="h-4 w-4" />
                  {!waLoading && (
                    <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background ${waStatusColor(whatsappSession?.status)}`} />
                  )}
                </Button>
              )}
              <Button 
                variant="outline" 
                className="gap-2 border-accent text-accent hover:bg-accent/5 hover:text-accent" 
                onClick={() => setIsAddContactOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Adicionar Contato
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="h-4 w-4" />
                Importar
              </Button>
              <Button variant="cta" className="gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Atendimento
              </Button>
            </div>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 flex flex-col p-0 lg:p-0 min-h-0">
          {waLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-73px)]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : whatsappSession?.status !== 'connected' ? (
            isAgent ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background">
                <div className="max-w-md p-8 rounded-2xl border border-border bg-card shadow-lg space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Info className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">WhatsApp Desconectado</h3>
                  <p className="text-sm text-muted-foreground">
                    O WhatsApp central da imobiliária está temporariamente desconectado. 
                    Por favor, entre em contato com o administrador para restabelecer a conexão.
                  </p>
                </div>
              </div>
            ) : (
              <WhatsAppConnect />
            )
          ) : (
          <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
            {/* Conversations List */}
            <div className={cn(
              "relative w-full lg:w-[35%] min-w-[320px] max-w-[420px] shrink-0 border-r border-border bg-card flex-col",
              selectedConv ? "hidden lg:flex" : "flex"
            )}>
              <div className="p-4 border-b border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Conversas</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setHideGroups(!hideGroups)}
                      title={hideGroups ? "Mostrar Grupos" : "Ocultar Grupos"}
                      className={cn("h-7 w-7 rounded-lg transition-all", !hideGroups ? "text-accent bg-accent/10 hover:bg-accent/20" : "text-muted-foreground opacity-60 hover:opacity-100 hover:bg-muted/50")}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">{filteredConversations.length}/{visibleConversationCount}</span>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                {/* Tabs com contadores estilo AtendeChat */}
                <div className={cn("grid gap-1", isAgent ? "grid-cols-[1fr_1fr_1.2fr_38px]" : "grid-cols-[1fr_1fr_1fr_1fr_1.2fr_38px]")}>
                  <Button
                    variant={activeTab === "meus" ? "cta" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("meus")}
                    className="min-w-0 text-xs relative px-2 gap-1"
                  >
                    <Inbox className="h-3 w-3 shrink-0" />
                    Meus
                    {(() => {
                      const n = conversations.filter((c) => 
                        c.status !== 'deleted' && 
                        c.subject !== '[deleted]' && 
                        c.status !== 'pending' && 
                        c.status !== 'closed' && 
                        (c.client as any)?.is_group !== true && 
                        !(c.whatsapp_contact && c.whatsapp_contact[0]?.is_group === true) && 
                        (profile?.role === 'admin' || profile?.role === 'manager' ? true : c.agent_id === user?.id)
                      ).length;
                      return n > 0 ? (
                        <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white">{n}</span>
                      ) : null;
                    })()}
                  </Button>
                  {!isAgent && (
                    <Button
                      variant={activeTab === "equipe" ? "cta" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("equipe")}
                      className="min-w-0 text-xs px-2 gap-1"
                    >
                      <Users className="h-3 w-3 shrink-0" />
                      Equipe
                    </Button>
                  )}
                  <Button
                    variant={activeTab === "grupos" ? "cta" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("grupos")}
                    className="min-w-0 text-xs relative px-2 gap-1"
                  >
                    <Users className="h-3 w-3 shrink-0" />
                    Grupos
                    {(() => {
                      const n = conversations.filter((c) => {
                        const isG = (c.whatsapp_contact && c.whatsapp_contact[0]?.is_group) || (c.client as any)?.is_group;
                        return isG && (c.unread_count || 0) > 0;
                      }).length;
                      return n > 0 ? (
                        <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white">{n}</span>
                      ) : null;
                    })()}
                  </Button>
                  <Button
                    variant={activeTab === "nao-lidas" ? "cta" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("nao-lidas")}
                    className="min-w-0 text-xs relative px-2 gap-1"
                  >
                    <Zap className="h-3 w-3 shrink-0" />
                    Não lidas
                    {(() => {
                      const n = conversations.filter((c) =>
                        c.status !== 'deleted' &&
                        c.subject !== '[deleted]' &&
                        (c.client as any)?.is_group !== true &&
                        !(c.whatsapp_contact && c.whatsapp_contact[0]?.is_group === true) &&
                        Boolean(c.agent_id || c.agent?.id || c.lead?.responsible?.id) &&
                        (c.unread_count || 0) > 0
                      ).length;
                      return n > 0 ? (
                        <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{n}</span>
                      ) : null;
                    })()}
                  </Button>
                  {!isAgent && (
                    <Button
                      variant={activeTab === "nao-direcionados" ? "cta" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("nao-direcionados")}
                      className="min-w-0 text-xs relative px-2 gap-1"
                    >
                      <UserPlus className="h-3 w-3 shrink-0" />
                      Não direc.
                      {(() => {
                        const n = conversations.filter((c) =>
                          c.status !== 'deleted' &&
                          c.subject !== '[deleted]' &&
                          (c.client as any)?.is_group !== true &&
                          !(c.whatsapp_contact && c.whatsapp_contact[0]?.is_group === true) &&
                          !(c.agent_id || c.agent?.id || c.lead?.responsible?.id)
                        ).length;
                        return n > 0 ? (
                          <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">{n}</span>
                        ) : null;
                      })()}
                    </Button>
                  )}
                  <Button
                    variant={activeTab === "arquivadas" ? "cta" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("arquivadas")}
                    className="min-w-0 px-0"
                    title="Arquivadas"
                  >
                    <Archive className="h-4 w-4" />
                    <span className="sr-only">Arquivadas</span>
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={actionFilter === "all" ? "outline" : "secondary"}
                      size="sm"
                      className="h-8 w-full justify-between gap-2 text-xs"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Filter className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {actionFilter === "all" ? "Todas as próximas ações" : getLeadActionLabel(actionFilter)}
                        </span>
                      </span>
                      {actionFilter === "all" ? (
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                          {Object.values(actionCounts).reduce((sum, count) => sum + count, 0)}
                        </Badge>
                      ) : (
                        <X
                          className="h-3.5 w-3.5 text-muted-foreground"
                          onClick={(event) => {
                            event.stopPropagation();
                            setActionFilter("all");
                          }}
                        />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel>Próxima ação</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setActionFilter("all")}>
                      Todas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {[
                      'agendar_visita',
                      'confirmar_visita',
                      'match_pronto',
                      'enviar_opcoes',
                      'indicar_imovel',
                      'follow_up_atrasado',
                      'qualificar_lead',
                      'buscar_imoveis',
                      'priorizar_corretor',
                      'ia_pausada',
                      'retomar_ia',
                      'acompanhar',
                    ].map((action) => (
                      <DropdownMenuItem key={action} onClick={() => setActionFilter(action)} className="gap-2">
                        <span className={cn("h-2 w-2 rounded-full border", getLeadActionStyles(action))} />
                        <span className="flex-1">{getLeadActionLabel(action)}</span>
                        {(actionCounts[action] || 0) > 0 && (
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                            {actionCounts[action]}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {!isAgent && agents.length > 0 && (
                <div className="px-1.5 pb-1">
                  <select
                    value={filtroCorretor}
                    onChange={(e) => setFiltroCorretor(e.target.value)}
                    className="h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground outline-none w-full mt-1.5 truncate cursor-pointer"
                    title="Filtrar por Atendente"
                  >
                    <option value="">Todos os atendentes</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{agent.full_name || agent.email || agent.id}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex-1 overflow-y-auto pb-20">
                {convLoading && (
                  <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
                )}
                {!convLoading && filteredConversations.length === 0 && (
                  <div className="m-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5 text-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium text-foreground">
                      {searchQuery ? 'Nenhuma conversa encontrada' : visibleConversationCount === 0 ? 'Aguardando primeira mensagem' : 'Nada neste filtro'}
                    </p>
                    <p className="mt-1 text-xs">
                      {searchQuery
                        ? 'Tente outro nome, telefone ou limpe a busca.'
                        : visibleConversationCount === 0
                          ? 'As novas conversas aparecem aqui automaticamente.'
                          : 'Troque de filtro para ver outros atendimentos.'}
                    </p>
                    {(searchQuery || visibleConversationCount > 0) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 h-8 text-xs"
                        onClick={() => {
                          setSearchQuery("");
                          setActionFilter("all");
                          setActiveTab("meus");
                        }}
                      >
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                )}
                {filteredConversations.map((conv) => {
                  const clientName = conv.client?.full_name || 'Cliente';
                  const visibleTags = (conv.tags || []).slice(0, 2);
                  const hiddenTagsCount = Math.max((conv.tags || []).length - visibleTags.length, 0);
                  const leadAction = getConversationLeadAction(conv);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setSelectedConvId(conv.id);
                        const isGroup = (conv.whatsapp_contact && conv.whatsapp_contact[0]?.is_group) || (conv.client as any)?.is_group;
                        if (isGroup) {
                          useGroupPanelStore.getState().openPanel(conv.id);
                        } else {
                          useGroupPanelStore.getState().closePanel();
                        }
                      }}
                      className={cn(
                        "group p-3 border-b border-border cursor-pointer transition-colors hover:bg-muted/50",
                        selectedConvId === conv.id && "bg-accent/5 border-l-2 border-l-accent"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <Avatar className="h-9 w-9">
                          {conv.client?.avatar_url ? (
                            <AvatarImage src={conv.client.avatar_url} alt={clientName} />
                          ) : null}
                          <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(clientName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground truncate flex items-center gap-1">
                              {clientName}
                              {((conv.whatsapp_contact && conv.whatsapp_contact[0]?.is_group) || (conv.client as any)?.is_group) && (
                                <Users className="h-3 w-3 text-muted-foreground shrink-0" title="Grupo" />
                              )}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {(conv.unread_count || 0) > 0 && (
                                <span
                                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-semibold text-white shadow-sm"
                                  title={`${conv.unread_count} mensagem(ns) não lida(s)`}
                                >
                                  {conv.unread_count}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">{formatTime(conv.last_message_at)}</span>
                            </div>
                          </div>
                          {(() => {
                            const stage = getFunnelStageLabel(conv.lead?.stage ?? conv.stage ?? null);
                            // Atendente real da conversa é conv.agent (conversations.agent_id).
                            // Antes lia apenas lead.responsible, mostrando 'Sem atendente' em 1.854
                            // conversas que tinham agent atribuído mas lead sem responsible_id.
                            const responsible =
                              conv.agent?.full_name?.trim() || conv.lead?.responsible?.full_name?.trim();
                            return (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {responsible ? `${stage} • ${responsible}` : `${stage} • Sem atendente`}
                              </p>
                            );
                          })()}

                          {/* Ações rápidas para conversas ÓRFANAS (sem dono) — centralizadas en "Não Direcionados" */}
                          {!isDirecionado(conv) && (
                            <div className="flex gap-1 mt-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                title="Aceitar atendimento"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const { error } = await supabase.rpc('accept_conversation', { p_conversation_id: conv.id });
                                  if (error) {
                                    toast({ title: 'Erro ao aceitar', description: error.message, variant: 'destructive' });
                                  } else {
                                    toast({ title: 'Atendimento aceito' });
                                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                                  }
                                }}
                              >
                                <Check className="h-3 w-3 shrink-0" />
                                <span className="sr-only">Aceitar</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                title="Transferir atendimento"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTransferDialog(conv.id);
                                }}
                              >
                                <ArrowRightLeft className="h-3 w-3 shrink-0" />
                                <span className="sr-only">Transferir</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                title="Ignorar atendimento"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const { error } = await supabase.rpc('ignore_conversation', { p_conversation_id: conv.id });
                                  if (error) {
                                    toast({ title: 'Erro ao ignorar', description: error.message, variant: 'destructive' });
                                  } else {
                                    toast({ title: 'Conversa ignorada' });
                                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                                  }
                                }}
                              >
                                <X className="h-3 w-3 shrink-0" />
                                <span className="sr-only">Ignorar</span>
                              </Button>
                            </div>
                          )}

                           <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                             <Badge variant="outline" className="text-[10px] h-5 px-1.5">{conv.status === 'open' ? 'Aberta' : conv.status === 'pending' ? 'Pendente' : conv.status === 'waiting' ? 'Aguardando' : 'Fechada'}</Badge>
                             <Badge
                               variant={conv.ai_enabled === false ? "outline" : "secondary"}
                               className={cn(
                                 "text-[10px] h-5 px-1.5",
                                 conv.ai_enabled === false && "border-amber-200 bg-amber-50 text-amber-700"
                               )}
                             >
                               {conv.ai_enabled === false ? 'IA pausada' : 'IA ativa'}
                             </Badge>
                             {leadAction?.next_action && leadAction.next_action !== 'sem_acao' && (
                               <Badge
                                 variant="outline"
                                 className={cn("text-[10px] h-5 px-1.5 border", getLeadActionStyles(leadAction.next_action))}
                                 title={(leadAction.missing_fields || []).map(getMissingFieldLabel).join(", ")}
                               >
                                 {getLeadActionLabel(leadAction.next_action)}
                                 {(leadAction.missing_count || 0) > 0 && (
                                   <span className="ml-1 font-semibold">+{leadAction.missing_count}</span>
                                 )}
                               </Badge>
                             )}
                             {visibleTags.map((tag) => (
                               <Badge key={tag} className={cn("text-[10px] h-5 px-1.5 font-medium border", getTagStyles(tag))}>
                                 {tag}
                               </Badge>
                             ))}
                            {hiddenTagsCount > 0 && (
                              <Badge variant="outline" className="text-[10px] h-5 px-1.5">+{hiddenTagsCount}</Badge>
                            )}
                            <FollowUpBadgeForConversation conversationId={conv.id} />

                                                         <Popover>
                                 <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                   <button type="button" className="inline-flex items-center justify-center rounded-full border border-dashed border-input bg-transparent text-[10px] h-5 px-1 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                     <Plus className="h-2.5 w-2.5" />
                                   </button>
                                 </PopoverTrigger>
                                 <PopoverContent align="start" className="w-52 p-2.5 space-y-2.5 bg-card border border-border rounded-xl shadow-lg" onClick={(e) => e.stopPropagation()}>
                                   <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider p-0">Tags da Conversa</p>
                                   
                                   <div className="flex flex-wrap gap-1">
                                     {conv.tags && conv.tags.length > 0 ? (
                                       conv.tags.map((tag) => (
                                         <Badge key={tag} className={cn("text-[9px] font-medium border flex items-center gap-1 pl-1.5 pr-0.5 py-0.2", getTagStyles(tag))}>
                                           {tag}
                                           <button 
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               handleRemoveTag(tag, conv.id);
                                             }}
                                             className="hover:bg-foreground/10 rounded-full p-0.5 transition-colors focus:outline-none"
                                           >
                                             <span className="text-[8px] font-semibold leading-none">×</span>
                                           </button>
                                         </Badge>
                                       ))
                                     ) : (
                                       <span className="text-[10px] text-muted-foreground italic">Sem tags</span>
                                     )}
                                   </div>
                                   
                                   <hr className="border-border opacity-50" />
                                   
                                   <div className="space-y-1">
                                                                       <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Sugestões do catálogo</p>
                                                                       <div className="flex flex-wrap gap-1">
                                                                         {groupTagsByCategory(userTagsCatalog, userTagCategories).map(({ category, tags: catTags }) => (
                                                                           <div key={category?.id ?? "uncat"} className="contents">
                                                                             {category && (
                                                                               <span className="w-full text-[8px] text-muted-foreground font-medium" style={{ color: category.color }}>
                                                                                 {category.name}
                                                                               </span>
                                                                             )}
                                                                             {catTags.map((cattag) => {
                                                                               const isAlreadyAdded = conv.tags?.includes(cattag.label);
                                                                               if (isAlreadyAdded) return null;
                                                                               return (
                                                                                 <Button
                                                                                   key={cattag.id}
                                                                                   variant="outline"
                                                                                   size="sm"
                                                                                   onClick={(e) => {
                                                                                     e.stopPropagation();
                                                                                     handleAddTag(cattag.label, conv.id);
                                                                                   }}
                                                                                   className="text-[9px] h-5 px-1.5 py-0 font-medium border"
                                                                                   style={{ backgroundColor: `${cattag.color}1a`, color: cattag.color, borderColor: `${cattag.color}55` }}
                                                                                 >
                                                                                   + {cattag.label}
                                                                                 </Button>
                                                                               );
                                                                             })}
                                                                           </div>
                                                                         ))}
                                                                       </div>
                                                                     </div>
                                 </PopoverContent>
                              </Popover>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute bottom-4 right-4 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="cta"
                      size="icon"
                      className="pointer-events-auto h-12 w-12 rounded-full shadow-lg shadow-accent/25"
                      title="Ações rápidas"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="top" className="w-64 p-1.5">
                    <DropdownMenuLabel>Ações rápidas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-3 py-2.5" onClick={() => setIsCreateOpen(true)}>
                      <Phone className="h-4 w-4 text-accent" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Chamar novo contato</p>
                        <p className="text-xs text-muted-foreground">Abrir conversa e enviar mensagem</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-3 py-2.5" onClick={() => setIsAddContactOpen(true)}>
                      <UserPlus className="h-4 w-4 text-accent" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Adicionar novo contato</p>
                        <p className="text-xs text-muted-foreground">Criar contato e conversa</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-3 py-2.5" disabled={!selectedConv} onClick={openShareContactModal}>
                      <User className="h-4 w-4 text-accent" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Enviar contato</p>
                        <p className="text-xs text-muted-foreground">Compartilhar no chat atual</p>
                      </div>
                    </DropdownMenuItem>
                    {!isAgent && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-3 py-2.5" onClick={() => setShowSettings(true)}>
                          <Settings className="h-4 w-4 text-accent" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">Conexão WhatsApp</p>
                            <p className="text-xs text-muted-foreground">Status e configurações</p>
                          </div>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Chat Area */}
            <div className={cn(
              "flex-1 min-w-0 flex-col bg-background",
              !selectedConv ? "hidden lg:flex" : "flex"
            )}>
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between gap-3 p-4 border-b border-border bg-card min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden shrink-0 -ml-2 mr-1"
                        onClick={() => {
                          setSelectedConvId(null); // state clear: vuelve a la lista
                          setSearchQuery("");       // limpia deep link para no re-succionar el chat
                          setSearchParams({}, { replace: true });
                        }}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar className="h-10 w-10">
                        {selectedConv.client?.avatar_url ? (
                          <AvatarImage src={selectedConv.client.avatar_url} alt={selectedConv.client?.full_name || 'Cliente'} />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(selectedConv.client?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground truncate">{selectedConv.client?.full_name || 'Cliente'}</span>
                          {selectedConv.tags && selectedConv.tags.map((tag) => (
                            <Badge key={tag} className={cn("text-[10px] h-5 px-1.5 font-medium border", getTagStyles(tag))}>
                              {tag}
                            </Badge>
                          ))}
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <button type="button" className="inline-flex items-center justify-center rounded-full border border-dashed border-input bg-transparent text-[10px] h-5 px-1.5 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex items-center gap-1">
                                <Plus className="h-2.5 w-2.5" /> Tag
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-56 p-3 space-y-3 bg-card border border-border rounded-xl shadow-lg">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider p-0">Gerenciar Tags</p>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedConv.tags && selectedConv.tags.length > 0 ? (
                                  selectedConv.tags.map((tag) => (
                                    <Badge key={tag} className={cn("text-[10px] font-medium border flex items-center gap-1 pl-2 pr-1 py-0.5", getTagStyles(tag))}>
                                      {tag}
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveTag(tag);
                                        }}
                                        className="hover:bg-foreground/10 rounded-full p-0.5 transition-colors focus:outline-none"
                                      >
                                        <span className="text-[9px] font-semibold leading-none">×</span>
                                      </button>
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-muted-foreground italic">Sem tags associadas</span>
                                )}
                              </div>
                              <hr className="border-border opacity-50" />
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Sugestões do catálogo</p>
                                <div className="flex flex-wrap gap-1">
                                  {groupTagsByCategory(userTagsCatalog, userTagCategories).map(({ category, tags: catTags }) => (
                                    <div key={category?.id ?? "uncat"} className="contents">
                                      {category && (
                                        <span className="w-full text-[9px] text-muted-foreground font-medium" style={{ color: category.color }}>
                                          {category.name}
                                        </span>
                                      )}
                                      {catTags.map((cattag) => {
                                        const isAlreadyAdded = selectedConv.tags?.includes(cattag.label);
                                        if (isAlreadyAdded) return null;
                                        return (
                                          <Button
                                            key={cattag.id}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddTag(cattag.label)}
                                            className="text-[10px] h-6 px-2 py-0 font-medium border"
                                            style={{ backgroundColor: `${cattag.color}1a`, color: cattag.color, borderColor: `${cattag.color}55` }}
                                          >
                                            + {cattag.label}
                                          </Button>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <hr className="border-border opacity-50" />
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Nova tag..."
                                  value={newTagInput}
                                  onChange={(e) => setNewTagInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddCustomTag();
                                    }
                                  }}
                                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                                <Button 
                                  size="sm" 
                                  variant="cta"
                                  onClick={handleAddCustomTag}
                                  className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white font-medium px-2 rounded-lg"
                                >
                                  Add
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 min-w-0">
                          <p className="text-sm text-muted-foreground truncate">{selectedConv.subject || 'Conversa'}</p>
                          {selectedLeadAction?.next_action && selectedLeadAction.next_action !== 'sem_acao' && (
                            <Badge
                              variant="outline"
                              className={cn("h-5 shrink-0 border px-1.5 text-[10px]", getLeadActionStyles(selectedLeadAction.next_action))}
                              title={(selectedLeadAction.missing_fields || []).map(getMissingFieldLabel).join(", ")}
                            >
                              {getLeadActionLabel(selectedLeadAction.next_action)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={cn(
                          "hidden sm:flex items-center gap-2 rounded-lg border px-2.5 py-1.5",
                          selectedConvAIEnabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"
                        )}
                        title={selectedConvAIEnabled ? "IA ativa neste atendimento" : "IA pausada neste atendimento"}
                      >
                        <Bot className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">{selectedConvAIEnabled ? "IA" : "Manual"}</span>
                        <Switch
                          checked={selectedConvAIEnabled}
                          onCheckedChange={handleToggleConversationAI}
                          disabled={setConversationAIMutation.isPending}
                          aria-label="Ativar ou pausar IA neste atendimento"
                          className="h-5 w-9 data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                      {isPhoneRestricted ? (
                        <span className="text-xs text-muted-foreground/60 italic cursor-default" title="Número oculto para corretores restringidos">[Oculto]</span>
                      ) : selectedConv.client?.phone ? (
                        <Button variant="ghost" size="icon" title={selectedConv.client.phone}><Phone className="h-4 w-4" /></Button>
                      ) : null}
                      {selectedConv.client?.email && (
                        <Button variant="ghost" size="icon" title={selectedConv.client.email}><Mail className="h-4 w-4" /></Button>
                      )}
                      <Button
                        variant={contactPanelOpen ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setContactPanelOpen((open) => !open)}
                        title={contactPanelOpen ? "Ocultar dados do contato" : "Mostrar dados do contato"}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      {((selectedConv.whatsapp_contact && selectedConv.whatsapp_contact[0]?.is_group) || (selectedConv.client as any)?.is_group) && (
                        <Button
                          variant="cta"
                          size="sm"
                          onClick={() => useGroupPanelStore.getState().openPanel(selectedConv.id)}
                          title="Abrir Painel do Grupo"
                          className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-md flex items-center gap-2 rounded-full px-4 ml-2"
                        >
                          <Users className="h-4 w-4" />
                          <span className="hidden md:inline">Testar Painel de Grupo</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (selectedConv) {
                            setFollowUpConvId(selectedConv.id);
                            setIsFollowUpOpen(true);
                          }
                        }}
                        title="Agendar follow-up"
                        disabled={!selectedConv}
                      >
                        <AlarmClock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsTagsOpen(true)}
                        title="Gestionar tus tags"
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowChatConfig(true)}
                        title="Configurações do Atendimento"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleConversationAI(!selectedConvAIEnabled)} className="cursor-pointer">
                            {selectedConvAIEnabled ? 'Pausar IA' : 'Ativar IA'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            if (selectedConv) {
                              handleDeleteConversation(selectedConv.id);
                            }
                          }} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                            Excluir Conversa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>Nenhuma mensagem. Inicie a conversa!</p>
                      </div>
                    )}
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      const isSystem = msg.message_type === 'system';
                      return (
                        <div key={msg.id} className={cn("flex relative group mb-6 items-end", isSystem ? "justify-center w-full" : isMe ? "justify-end" : "justify-start")}>
                          {!isMe && !isSystem && (
                            <Avatar className="h-8 w-8 mr-2 shrink-0">
                              {msg.sender?.avatar_url ? (
                                <AvatarImage src={msg.sender.avatar_url} alt={msg.sender?.full_name || 'Cliente'} />
                              ) : null}
                              <AvatarFallback className="text-xs bg-muted">{getInitials(msg.sender?.full_name)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className={cn("relative min-w-0 flex flex-col", isSystem ? "w-full max-w-md items-center" : isMe ? "items-end max-w-[82%] sm:max-w-[72%]" : "items-start max-w-[82%] sm:max-w-[72%]")}>
                            {((selectedConv?.whatsapp_contact?.[0]?.is_group) || (selectedConv?.client as any)?.is_group) && !isMe && !isSystem && msg.sender?.full_name && (
                              <span className="text-[10px] font-semibold text-muted-foreground ml-1 mb-0.5 max-w-[200px] truncate">
                                {msg.sender.full_name}
                              </span>
                            )}
                            <div className={cn(
                              "rounded-2xl px-4 py-3 shadow-sm min-w-0 break-words [overflow-wrap:anywhere]",
                              isSystem 
                                ? "bg-muted/50 border border-border text-center mx-auto text-xs font-medium py-1 px-3 rounded-full" 
                                : isMe 
                                  ? "bg-accent text-accent-foreground rounded-br-none" 
                                  : "bg-card border border-border rounded-bl-none text-foreground"
                            )}>
                              {isSystem && (
                                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">
                                  <Bot className="h-3 w-3" /> Sistema
                                </div>
                              )}
                              
                              {renderMessageContent(msg.content, msg.message_type)}
                              
                              <div className="flex items-center justify-end gap-1 mt-1.5 select-none opacity-60">
                                <span className="text-[10px] font-medium">{formatTime(msg.created_at)}</span>
                                {isMe && !isSystem && msg.is_read && <CheckCircle2 className="h-3 w-3 text-accent-foreground/80" />}
                              </div>
                            </div>

                            {/* Active Reaction Badge */}
                            {reactions[msg.id] && (
                              <button 
                                onClick={() => handleRemoveReaction(msg.id)}
                                className={cn(
                                  "absolute -bottom-2.5 flex items-center justify-center bg-card border border-border shadow-sm rounded-full px-1.5 py-0.5 text-[11px] hover:scale-110 active:scale-95 transition-transform select-none z-10 animate-in zoom-in-50 duration-150",
                                  isMe ? "right-3" : "left-3"
                                )}
                                title="Clique para remover reação"
                              >
                                {reactions[msg.id]}
                              </button>
                            )}
                          </div>

                          {/* ChevronDown Popup Trigger */}
                          {!isSystem && (
                            <Popover>
                              <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <button
                                  className={cn(
                                    "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-accent rounded-full hover:bg-muted z-20",
                                    isMe ? "right-full mr-1" : "left-full ml-1"
                                  )}
                                  title="Ações"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                align={isMe ? "end" : "start"}
                                className="w-auto p-1.5 bg-card border border-border shadow-xl rounded-full flex items-center gap-0.5 z-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* React Menu */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="p-2 text-muted-foreground hover:text-accent rounded-full hover:bg-muted transition-colors"
                                      title="Reagir"
                                    >
                                      <Smile className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start" className="p-1 flex gap-1.5 bg-card border border-border shadow-xl rounded-full">
                                    {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                                      <button
                                        key={emoji}
                                        onClick={() => handleAddReaction(msg.id, emoji)}
                                        className="hover:scale-125 active:scale-90 transition-transform p-1 text-base leading-none"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Reply Button */}
                                <button
                                  onClick={() => setReplyingTo(msg)}
                                  className="p-2 text-muted-foreground hover:text-accent rounded-full hover:bg-muted transition-colors"
                                  title="Responder"
                                >
                                  <Share2 className="h-4 w-4 -scale-x-100" />
                                </button>

                                {/* Forward Button */}
                                <button
                                  onClick={() => setForwardingMessage(msg)}
                                  className="p-2 text-muted-foreground hover:text-accent rounded-full hover:bg-muted transition-colors"
                                  title="Encaminhar"
                                >
                                  <Share2 className="h-4 w-4" />
                                </button>

                                {/* Download Button (Only for Media URLs) */}
                                {(msg.message_type === 'image' || msg.message_type === 'video' || msg.message_type === 'audio' || msg.message_type === 'document' || msg.content.match(/https?:\/\/[^\s]+/g)) && (
                                  <button
                                    onClick={() => {
                                      const match = msg.content.match(/https?:\/\/[^\s]+/g);
                                      if (match) {
                                        const url = match[0];
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.target = '_blank';
                                        link.download = 'midia';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }
                                    }}
                                    className="p-2 text-muted-foreground hover:text-accent rounded-full hover:bg-muted transition-colors"
                                    title="Baixar mídia"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                )}
                              </PopoverContent>
                            </Popover>
                          )}

                          {isMe && (
                            <Avatar className="h-8 w-8 ml-2 shrink-0">
                              {profile?.avatar_url ? (
                                <AvatarImage src={profile.avatar_url} alt={profile?.full_name || 'Agente'} />
                              ) : null}
                              <AvatarFallback className="text-xs bg-accent text-accent-foreground">{getInitials(profile?.full_name)}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Actions */}
                  <div className="px-4 py-2 flex gap-2 border-t border-border bg-card overflow-x-auto">
                    <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={handleQuickScheduleVisit} disabled={createVisitMutation.isPending}>
                      <Calendar className="h-3 w-3" />{createVisitMutation.isPending ? 'Agendando...' : 'Agendar Visita'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={handleQuickSendFicha} disabled={sendWhatsAppMutation.isPending}>
                      <FileText className="h-3 w-3" />Enviar Ficha
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={handleQuickSolicitarDocs} disabled={sendWhatsAppMutation.isPending}>
                      <FolderOpen className="h-3 w-3" />Solicitar Docs
                    </Button>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border bg-card">
                    {replyingTo && (
                      <div className="flex items-center justify-between bg-muted/50 border-l-4 border-accent px-3.5 py-2 rounded-lg mb-3 animate-in slide-in-from-bottom-2 duration-150">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold text-accent">Respondendo a {replyingTo.sender?.full_name || 'Cliente'}</p>
                          <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-accent rounded-full shrink-0"
                          onClick={() => setReplyingTo(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        ref={imageVideoInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,video/*,audio/*"
                        onChange={handleFileUpload}
                      />
                      <input
                        ref={documentInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                        onChange={handleFileUpload}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUploading}
                            title="Anexar arquivos"
                          >
                            {isUploading ? (
                              <span className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Paperclip className="h-4 w-4 text-muted-foreground hover:text-accent transition-colors" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-1.5 space-y-1 bg-card border border-border shadow-lg rounded-xl">
                          <DropdownMenuItem onClick={() => imageVideoInputRef.current?.click()} className="flex items-center gap-3 cursor-pointer py-2 rounded-lg hover:bg-accent/10 text-foreground transition-colors">
                            <Image className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Fotos e vídeos</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={handleTriggerCamera} className="flex items-center gap-3 cursor-pointer py-2 rounded-lg hover:bg-accent/10 text-foreground transition-colors">
                            <Camera className="h-4 w-4 text-pink-600" />
                            <span className="text-sm font-medium">Câmera</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => documentInputRef.current?.click()} className="flex items-center gap-3 cursor-pointer py-2 rounded-lg hover:bg-accent/10 text-foreground transition-colors">
                            <FileText className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">Documento</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => {
                            setContactShareName("");
                            setContactSharePhone("");
                            setContactShareEmail("");
                            setContactShareCompany("");
                            setIsContactModalOpen(true);
                          }} className="flex items-center gap-3 cursor-pointer py-2 rounded-lg hover:bg-accent/10 text-foreground transition-colors">
                            <User className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium">Contato</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={handleShareLocation} className="flex items-center gap-3 cursor-pointer py-2 rounded-lg hover:bg-accent/10 text-foreground transition-colors">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-medium">Localização</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* Quick Reply Templates */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" title="Respostas rápidas">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-72">
                          <DropdownMenuLabel>Respostas rápidas</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setMessageInput(`Olá ${selectedConv.client?.full_name || ''}! Sou corretor da imobiliária. Em que posso ajudar?`)}>
                            <span className="text-sm">Saudação inicial</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setMessageInput(`Olá ${selectedConv.client?.full_name || ''}! Segue a ficha cadastral para preenchimento. Por favor, preencha todos os campos e nos envie de volta o mais breve possível para darmos continuidade ao processo.`)}>
                            <span className="text-sm">Solicitar ficha cadastral</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setMessageInput(`Olá ${selectedConv.client?.full_name || ''}! Para avançarmos no processo, precisamos dos seguintes documentos:\n\n• RG e CPF\n• Comprovante de renda (últimos 3 meses)\n• Comprovante de endereço\n• Certidão de estado civil\n\nPor favor, envie as cópias digitalizadas por aqui.`)}>
                            <span className="text-sm">Solicitar documentos</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setMessageInput(buildRecommendationsDraft(selectedPropertyRecommendations))}>
                            <span className="text-sm">Oferecer imóvel</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setMessageInput(`Olá ${selectedConv.client?.full_name || ''}! Agradecemos o contato. Ficamos à disposição para qualquer dúvida.`)}>
                            <span className="text-sm">Agradecimento / Encerramento</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setMessageInput(buildVisitDraft(selectedPropertyRecommendation))}>
                            <span className="text-sm">Agendar visita</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {isRecording ? (
                        <div className="flex-1 flex items-center justify-between py-2 px-4 rounded-lg bg-red-50/50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 animate-in fade-in duration-200">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </div>
                            <span className="text-red-600 dark:text-red-400 font-medium font-mono text-sm">
                              {formatRecordingTime(recordingTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={cancelRecording}
                              className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 transition-colors"
                              title="Cancelar gravação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="cta" 
                              size="sm" 
                              onClick={stopAndSendRecording}
                              className="h-8 gap-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-0"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">Enviar</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Digite sua mensagem..."
                          className="flex-1 py-3 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      )}
                      
                      {!isRecording && (
                        messageInput.trim() ? (
                          <Button variant="cta" size="icon" onClick={handleSendMessage} disabled={sendWhatsAppMutation.isPending || isUploading}>
                            <Send className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            onClick={startRecording} 
                            disabled={sendWhatsAppMutation.isPending || isUploading}
                            className="bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                            title="Gravar áudio"
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        )
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">Pressione Enter para enviar</span>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Selecione uma conversa</p>
                    <p className="text-sm">Escolha uma conversa à esquerda para começar</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Info Panel */}
            {selectedConv && contactPanelOpen && (
              <div className="hidden xl:block w-[280px] border-l border-border bg-card overflow-y-auto">
                {((selectedConv.whatsapp_contact && selectedConv.whatsapp_contact[0]?.is_group) || (selectedConv.client as any)?.is_group) ? (
                  <GroupDetailsPanel conversation={selectedConv} onSelectParticipant={handleSelectParticipantPrivateChat} />
                ) : (
                  <div className="p-6">
                    {/* Client Header */}
                  <div className="text-center mb-6">
                    <Avatar className="h-20 w-20 mx-auto mb-3">
                      {selectedConv.client?.avatar_url ? (
                        <AvatarImage src={selectedConv.client.avatar_url} alt={selectedConv.client?.full_name || 'Cliente'} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{getInitials(selectedConv.client?.full_name)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg text-foreground">{selectedConv.client?.full_name || 'Cliente'}</h3>
                    <p className="text-sm text-muted-foreground">Lead via WhatsApp</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <Badge variant="outline" className="text-[10px]">{selectedConv.status === 'open' ? 'Atendimento em andamento' : 'Atendimento encerrado'}</Badge>
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-3">
                      {!isPhoneRestricted && selectedConv.client?.phone && (
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => window.open(`https://wa.me/${selectedConv.client?.phone?.replace(/\D/g, '')}`, '_blank')}>
                          <Phone className="h-3 w-3" /> WhatsApp
                        </Button>
                      )}
                      {selectedConv.client?.email && (
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => window.open(`mailto:${selectedConv.client.email}`, '_blank')}>
                          <Mail className="h-3 w-3" /> Email
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <h4 className="text-sm font-medium text-foreground flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" /> Dados de contato
                      </span>
                      {!isEditingContact && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-accent rounded-md"
                          title="Editar contato"
                          onClick={() => {
                            setEditName(selectedConv.client?.full_name || '');
                            setEditEmail(isPlaceholderEmail(selectedConv.client?.email) ? '' : (selectedConv.client?.email || ''));
                            setEditPhone(getCleanRealPhone(selectedConv.client?.phone) || '');
                            setIsEditingContact(true);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </h4>

                    {isEditingContact ? (
                      <div className="space-y-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground">Nome Completo</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent text-foreground font-medium"
                            placeholder="Nome do cliente"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground">Email</label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent text-foreground font-medium"
                            placeholder="Sem email"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground">Telefone / WhatsApp</label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent text-foreground font-medium"
                            placeholder="Ex: 5511999999999"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => setIsEditingContact(false)}
                            disabled={isSavingContact}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="cta"
                            size="sm"
                            className="flex-1 h-7 text-xs font-semibold"
                            onClick={handleSaveContact}
                            disabled={isSavingContact || !editName.trim()}
                          >
                            {isSavingContact ? 'Salvando...' : 'Salvar'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Nome</p>
                            <p className="text-sm font-medium">{selectedConv.client?.full_name || 'Cliente'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            {isPlaceholderEmail(selectedConv.client?.email) ? (
                              <p className="text-sm font-medium text-muted-foreground/60 italic">Não informado</p>
                            ) : (
                              <p className="text-sm font-medium">{selectedConv.client?.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Telefone / WhatsApp</p>
                            {isPhoneRestricted ? (
                              <p className="text-sm font-medium text-muted-foreground/60 italic">[Oculto]</p>
                            ) : selectedConv.client?.phone ? (
                              <p className="text-sm font-medium">{formatPhoneNumber(selectedConv.client.phone)}</p>
                            ) : (
                              <p className="text-sm font-medium text-muted-foreground/60 italic">Não informado</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Canal de origem</p>
                            <p className="text-sm font-medium">WhatsApp Business</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Última interação</p>
                            <p className="text-sm font-medium">{formatTime(selectedConv.last_message_at)}</p>
                          </div>
                        </div>
                        {(sdrSession || sdrAnswers.length > 0) && (
                          <div className="border-t pt-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <Bot className="h-3.5 w-3.5 text-accent shrink-0" />
                              <p className="text-xs font-semibold text-foreground">Qualificação SDR (Ava)</p>
                              {sdrSession?.status && (
                                <Badge variant="outline" className="h-4 px-1.5 text-[9px]">{sdrSession.status}</Badge>
                              )}
                            </div>
                            {sdrAnswers.length === 0 && sdrSession ? (
                              <p className="text-xs text-muted-foreground/60 italic">SDR em andamento — aguardando respostas.</p>
                            ) : (
                              sdrAnswers.map((ans) => (
                                <div key={ans.id} className="space-y-0.5 rounded-md border bg-muted/30 px-2.5 py-1.5">
                                  <p className="text-[11px] font-medium text-foreground">
                                    {ans.step_label ?? qualificaStepLabel(ans.step_code)}
                                  </p>
                                  {ans.question_text && (
                                    <p className="text-[11px] text-muted-foreground/70">{ans.question_text}</p>
                                  )}
                                  <p className="text-xs font-semibold text-foreground">
                                    {ans.answer_text || <span className="text-muted-foreground/50 italic">(resposta não registrada)</span>}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>


                  {selectedLeadAction && (
                    <div className="mt-4 rounded-lg border bg-background p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5" /> Próxima ação
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {getLeadActionLabel(selectedLeadAction.next_action)}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                            {getLeadActionDescription(selectedLeadAction.next_action)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("border text-[10px]", getLeadActionStyles(selectedLeadAction.next_action))}
                        >
                          {selectedLeadAction.action_priority || 0}
                        </Badge>
                      </div>

                      {selectedLeadAction.next_action === 'qualificar_lead' && (
                        <Button
                          variant="cta"
                          size="sm"
                          className="h-9 w-full justify-center gap-2 text-sm"
                          onClick={handleQualifyConversation}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Qualificar lead
                        </Button>
                      )}

                      <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                        <div className="rounded-md border bg-muted/20 px-1.5 py-1">
                          <p className="font-semibold text-foreground">{selectedLeadAction.action_priority || 0}</p>
                          <p className="text-muted-foreground">Prior.</p>
                        </div>
                        <div className="rounded-md border bg-muted/20 px-1.5 py-1">
                          <p className="font-semibold text-foreground">{getProfileCompletionPercent(selectedLeadAction)}%</p>
                          <p className="text-muted-foreground">Perfil</p>
                        </div>
                        <div className="rounded-md border bg-muted/20 px-1.5 py-1">
                          <p className="font-semibold text-foreground">{getLeadTemperatureLabel(selectedLeadAction.score_confianca)}</p>
                          <p className="text-muted-foreground">Lead</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Perfil</span>
                          <span>{getProfileCompletionPercent(selectedLeadAction)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{
                              width: `${getProfileCompletionPercent(selectedLeadAction)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {(selectedLeadAction.missing_fields || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(selectedLeadAction.missing_fields || []).slice(0, 5).map((field) => (
                            <Badge key={field} variant="outline" className="h-5 px-1.5 text-[10px]">
                              {getMissingFieldLabel(field)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Dados principais preenchidos.</p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-full justify-start gap-2 text-xs"
                        onClick={() => {
                          const missing = (selectedLeadAction.missing_fields || []).map(getMissingFieldLabel).join(", ");
                          setMessageInput(
                            missing
                              ? `Para eu te ajudar melhor, posso confirmar rapidinho: ${missing}?`
                              : `Com essas informações já consigo buscar opções melhores para você. Quer priorizar valor, localização ou tamanho?`
                          );
                        }}
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Preparar resposta
                      </Button>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 justify-start gap-2 text-xs"
                          onClick={() => setMessageInput(buildVisitDraft(selectedPropertyRecommendation))}
                        >
                          <Calendar className="h-3.5 w-3.5" /> Visita
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 justify-start gap-2 text-xs"
                          onClick={() => setMessageInput(buildRecommendationsDraft(selectedPropertyRecommendations))}
                        >
                          <Home className="h-3.5 w-3.5" /> Imovel
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedConv && (
                    <div className="mt-4 rounded-lg border bg-background p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Settings className="h-3.5 w-3.5 text-foreground" />
                        <h4 className="text-sm font-medium text-foreground">Estágio do funil</h4>
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Seleccione a etapa do funil deste atendimento. Qualificar dispara a verificação anti-duplicidade e vincula o lead automaticamente.
                      </p>
                      <select
                        value={FUNNEL_STAGES.some((s) => s.value === selectedConv.stage) ? selectedConv.stage : 'Contato Cadastrado'}
                        onChange={(e) => handleStageChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {FUNNEL_STAGES.map((stage) => (
                          <option key={stage.value} value={stage.value}>{stage.label}</option>
                        ))}
                      </select>
                      {selectedConv.lead_id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-full justify-start gap-2 text-xs"
                          onClick={() => navigate('/leads', { state: { selectedLeadId: selectedConv.lead_id } })}
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Lead vinculado
                        </Button>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">Sem lead vinculado</p>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Badge variant="outline" className="border text-[10px]">
                          {getFunnelStageLabel(selectedConv.stage)}
                        </Badge>
                        <span>Estágio atual</span>
                      </div>
                    </div>
                  )}

                  {selectedPropertyRecommendations.length > 0 && (
                    <div className="mt-4 rounded-lg border bg-violet-50/50 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Home className="h-3.5 w-3.5" /> Imoveis recomendados
                        </h4>
                        <Badge variant="outline" className="border-violet-200 bg-white text-[10px] text-violet-700">
                          {selectedPropertyRecommendations.length} opcoes
                        </Badge>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-full justify-start gap-2 border-violet-200 bg-white text-xs text-violet-700 hover:bg-violet-100"
                        onClick={() => setMessageInput(buildRecommendationsDraft(selectedPropertyRecommendations))}
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Preparar lista com ate 3 opcoes
                      </Button>

                      <div className="space-y-2">
                        {selectedPropertyRecommendations.map((recommendation) => {
                          const isRecommended =
                            !!selectedLeadAction?.suggested_property_id &&
                            selectedLeadAction.suggested_property_id === recommendation.property_id;
                          const imageUrl = getPropertyImageUrl(recommendation);
                          const crmLink = getPropertyCrmLink(recommendation.property_id);

                          return (
                            <div key={recommendation.property_id} className="rounded-md border bg-white p-3 space-y-2">
                              <div className="flex items-start gap-3">
                                <div className="h-14 w-16 shrink-0 overflow-hidden rounded-md border bg-background">
                                  {imageUrl ? (
                                    <img src={imageUrl} alt={recommendation.property_title} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-violet-500">
                                      <Home className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h5 className="truncate text-sm font-medium text-foreground">
                                      {recommendation.property_title}
                                    </h5>
                                    <Badge variant="outline" className="shrink-0 border-violet-200 bg-violet-50 text-[10px] text-violet-700">
                                      {recommendation.match_score}
                                    </Badge>
                                  </div>
                                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {recommendation.property_code || 'Sem codigo'} - {recommendation.property_location}
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-violet-800">
                                    {formatCurrency(recommendation.property_price)}
                                  </p>
                                </div>
                              </div>

                              {(recommendation.match_reasons || []).length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {(recommendation.match_reasons || []).slice(0, 3).map((reason) => (
                                    <Badge key={reason} variant="outline" className="h-5 border-violet-200 bg-violet-50 px-1.5 text-[10px] text-violet-700">
                                      {reason}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                                <div className="rounded-md border bg-muted/20 px-1.5 py-1">
                                  <p className="font-semibold text-foreground">{recommendation.bedrooms || '-'}</p>
                                  <p className="text-muted-foreground">Quartos</p>
                                </div>
                                <div className="rounded-md border bg-muted/20 px-1.5 py-1">
                                  <p className="font-semibold text-foreground">{recommendation.parking || '-'}</p>
                                  <p className="text-muted-foreground">Vagas</p>
                                </div>
                                <div className="rounded-md border bg-muted/20 px-1.5 py-1">
                                  <p className="truncate font-semibold text-foreground">{recommendation.area || '-'}</p>
                                  <p className="text-muted-foreground">Area</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 justify-start gap-2 text-xs"
                                  onClick={() => setMessageInput(buildPropertyCardDraft(recommendation))}
                                >
                                  <MessageSquare className="h-3.5 w-3.5" /> Preparar
                                </Button>
                                <Button
                                  variant="cta"
                                  size="sm"
                                  className="h-8 justify-start gap-2 text-xs"
                                  onClick={() => handleSendPropertyRecommendation(recommendation)}
                                  disabled={sendWhatsAppMutation.isPending || markPropertyRecommendedMutation.isPending}
                                >
                                  <Send className="h-3.5 w-3.5" /> Enviar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 justify-start gap-2 border-emerald-200 text-xs text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => setMessageInput(buildVisitDraft(recommendation))}
                                >
                                  <Calendar className="h-3.5 w-3.5" /> Visita
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 justify-start gap-2 text-xs"
                                  onClick={() => crmLink && window.open(crmLink, '_blank', 'noopener,noreferrer')}
                                  disabled={!crmLink}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> Abrir
                                </Button>
                              </div>

                              {isRecommended && (
                                <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Ja registrado como indicado no lead
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 space-y-2 border-t pt-4 border-border">
                    <h4 className="text-sm font-medium text-foreground mb-2">Ações rápidas</h4>
                    <Button variant="outline" className="w-full gap-2 justify-start" onClick={handleQuickScheduleVisit} disabled={createVisitMutation.isPending}>
                      <Calendar className="h-4 w-4" />{createVisitMutation.isPending ? 'Agendando...' : 'Agendar Visita'}
                    </Button>
                    <Button variant="outline" className="w-full gap-2 justify-start" onClick={handleQuickCreateProposal}>
                      <FileText className="h-4 w-4" />Criar Proposta
                    </Button>
                    <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => navigate('/leads')}>
                      <FolderOpen className="h-4 w-4" />Ver no Funil de Leads
                    </Button>
                  </div>

                  {/* Atendimento Info */}
                  <div className="mt-6 rounded-lg border bg-blue-50/50 p-4 space-y-2">
                    <h4 className="text-sm font-medium text-blue-800 flex items-center gap-2">
                      <Info className="h-3.5 w-3.5" /> Sobre este atendimento
                    </h4>
                    <p className="text-xs text-blue-700">
                      Este cliente entrou em contato pelo WhatsApp da imobiliária. Todas as mensagens são sincronizadas em tempo real.
                    </p>
                  </div>
                </div>
                )}
              </div>
            )}
          </div>
          )}
        </main>
      </div>

      {/* Visit Scheduling Modal (compartido con Agenda: CreateVisitModal) */}
      <CreateVisitModal
        open={showCreateVisitModal}
        onOpenChange={setShowCreateVisitModal}
        onConfirm={handleConfirmCreateVisit}
        visitsPerDay={{}}
        availableLeads={[]}
        availableProperties={[]}
        availableContacts={availableContacts}
      />
      {/* Delete Conversation Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-card rounded-xl p-6 w-[400px] shadow-xl border border-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg text-foreground mb-2 flex items-center gap-2 text-destructive">
              Excluir Atendimento
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              Tem certeza que deseja excluir esta conversa? Esta ação apagará permanentemente o atendimento e todas as mensagens do banco de dados e **não pode ser desfeita**.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={handleConfirmDelete}
                disabled={deleteConversationMutation.isPending}
              >
                {deleteConversationMutation.isPending ? 'Excluindo...' : 'Sim, Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Forwarding Modal */}
      {forwardingMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setForwardingMessage(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-[480px] mx-4 shadow-2xl border border-border text-foreground space-y-4 animate-in scale-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3 border-border/80">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Share2 className="h-5 w-5 text-accent animate-pulse" /> Encaminhar Mensagem
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => setForwardingMessage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/60 italic max-h-[80px] overflow-y-auto">
              "{forwardingMessage.content}"
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar conversa ou corretor..."
                value={forwardSearch}
                onChange={(e) => setForwardSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
              />
            </div>

            {/* Destination List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {/* Atendimentos Section */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Atendimentos Ativos</p>
                {conversations
                  .filter(c => c.client?.full_name?.toLowerCase().includes(forwardSearch.toLowerCase()) && c.status !== 'deleted' && c.subject !== '[deleted]')
                  .slice(0, 5)
                  .map(conv => (
                    <div key={conv.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors border border-transparent hover:border-border">
                      <div className="min-w-0 flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          {conv.client?.avatar_url ? (
                            <AvatarImage src={conv.client.avatar_url} alt={conv.client?.full_name || 'Cliente'} />
                          ) : null}
                          <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">{getInitials(conv.client?.full_name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium truncate">{conv.client?.full_name || 'Cliente'}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-semibold px-3 hover:bg-accent hover:text-accent-foreground hover:border-accent"
                        onClick={async () => {
                          try {
                            await sendWhatsAppMutation.mutateAsync({
                              conversationId: conv.id,
                              content: forwardingMessage.content
                            });
                            toast({ title: "Mensagem encaminhada!", description: `Encaminhada para ${conv.client?.full_name}` });
                            setForwardingMessage(null);
                          } catch (err) {
                            toast({ title: "Erro ao encaminhar", description: (err as Error).message, variant: "destructive" });
                          }
                        }}
                      >
                        Enviar
                      </Button>
                    </div>
                  ))}
                {conversations.filter(c => c.client?.full_name?.toLowerCase().includes(forwardSearch.toLowerCase()) && c.status !== 'deleted' && c.subject !== '[deleted]').length === 0 && (
                  <p className="text-xs text-muted-foreground italic pl-2">Nenhum atendimento encontrado</p>
                )}
              </div>

              {/* Equipe Section */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Equipe / Corretores</p>
                {agents
                  .filter(a => a.full_name?.toLowerCase().includes(forwardSearch.toLowerCase()))
                  .slice(0, 5)
                  .map(agent => (
                    <div key={agent.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors border border-transparent hover:border-border">
                      <div className="min-w-0 flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          {agent.avatar_url ? (
                            <AvatarImage src={agent.avatar_url} alt={agent.full_name} />
                          ) : null}
                          <AvatarFallback className="text-[10px] bg-accent text-accent-foreground">{getInitials(agent.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{agent.full_name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">{agent.role === 'admin' ? 'Admin' : 'Corretor'}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-semibold px-3 hover:bg-accent hover:text-accent-foreground hover:border-accent"
                        onClick={async () => {
                          try {
                            // Find or create chat with team member
                            const targetConv = conversations.find(c => c.client_id === agent.id);
                            let targetConvId = targetConv?.id;
                            if (!targetConvId) {
                              const newConv = await createConversationMutation.mutateAsync({
                                client_id: agent.id,
                                subject: `Chat Equipe - ${agent.full_name}`
                              });
                              targetConvId = newConv.id;
                            }
                            
                            await sendWhatsAppMutation.mutateAsync({
                              conversationId: targetConvId,
                              content: forwardingMessage.content
                            });
                            toast({ title: "Mensagem encaminhada!", description: `Encaminhada para o corretor ${agent.full_name}` });
                            setForwardingMessage(null);
                          } catch (err) {
                            toast({ title: "Erro ao encaminhar", description: (err as Error).message, variant: "destructive" });
                          }
                        }}
                      >
                        Enviar
                      </Button>
                    </div>
                  ))}
                {agents.filter(a => a.full_name?.toLowerCase().includes(forwardSearch.toLowerCase())).length === 0 && (
                  <p className="text-xs text-muted-foreground italic pl-2">Nenhum corretor encontrado</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {transferConversationId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setTransferConversationId(null)}>
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 text-foreground" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-accent" />
                Transferir atendimento
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setTransferConversationId(null)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Corretor responsavel</label>
              <select
                value={transferAgentId}
                onChange={(e) => setTransferAgentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Selecione um corretor</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name} ({agent.role === 'admin' ? 'Admin' : 'Corretor'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setTransferConversationId(null)}>
                Cancelar
              </Button>
              <Button variant="cta" onClick={handleConfirmTransfer} disabled={isTransferring || !transferAgentId}>
                {isTransferring ? 'Transferindo...' : 'Transferir'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <CreateAtendimentoModal 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onConfirm={handleCreateAtendimento} 
        defaultLeadId={(location.state as any)?.leadToMessage?.id}
      />

      {qualifyProgress > 0 && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="rounded-xl border border-border bg-card p-5 max-w-sm shadow-2xl space-y-3 text-foreground">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Loader2 className="h-4 w-4 animate-spin" /> Qualificando lead
            </div>
            <div className="space-y-2">
              {QUALIFY_STEPS.map((step, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs ${qualifyProgress >= i + 1 ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                  {qualifyProgress === i + 1 ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : qualifyProgress > i + 1 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-muted" />
                  )}
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {qualifyResult && (
        <div className="fixed inset-0 z-[61] bg-black/50 backdrop-blur-sm flex items-center justify-center" onClick={() => setQualifyResult(null)}>
          <div className="rounded-xl border border-border bg-card p-5 max-w-md shadow-2xl space-y-3 text-foreground" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{qualifyResult === 'multiplicidad' || qualifyResult === 'error' ? '🚨' : qualifyResult === 'ya_vinculado' ? '🎴' : '✅'}</span>
              <h4 className="text-sm font-semibold leading-tight">{getQualifyResultTitle(qualifyResult)}</h4>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{getQualifyResultMessage(qualifyResult)}</p>
            <Button className="w-full" onClick={() => setQualifyResult(null)}>Cerrar</Button>
          </div>
        </div>
      )}

      <WhatsAppSettingsDrawer open={showSettings} onOpenChange={setShowSettings} />
      <ImportLeadsModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} />

      {followUpConvId && (
        <FollowUpModal
          open={isFollowUpOpen}
          onOpenChange={setIsFollowUpOpen}
          tenantId={currentTenantId}
          conversationId={followUpConvId}
          onCreated={() => queryClient.invalidateQueries({ queryKey: ['conversations'] })}
        />
      )}
      <TagsManager open={isTagsOpen} onOpenChange={setIsTagsOpen} />

      {/* Modal Adicionar Contato */}
      {isAddContactOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setIsAddContactOpen(false)}>
          <div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in scale-in duration-200 text-foreground" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-accent" />
                Adicionar Novo Contato
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddContactOpen(false)}
                className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">WhatsApp / Telefone *</label>
                <input
                  type="text"
                  placeholder="Ex: 5511999999999"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-[10px] text-muted-foreground">Insira apenas números com código de país e DDD (Ex: 5511999999999).</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">E-mail (Opcional)</label>
                <input
                  type="email"
                  placeholder="Ex: joao@email.com"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="cta" 
                onClick={handleAddContact} 
                disabled={isSavingContactNew || !newContactName.trim() || !newContactPhone.trim()}
              >
                {isSavingContactNew ? 'Salvando...' : 'Adicionar Contato'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Configuration Modal */}
      {showChatConfig && selectedConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border/80 shadow-2xl animate-in scale-in duration-200 text-foreground space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg font-semibold tracking-tight">Configurações do Atendimento</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChatConfig(false)}
                className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Status Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status do Ticket</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent text-sm font-medium text-foreground transition-all cursor-pointer"
                >
                  <option value="pending">Pendente</option>
                  <option value="open">Aberto</option>
                  <option value="waiting">Aguardando</option>
                  <option value="closed">Fechado</option>
                </select>
              </div>

              {/* Agent/Corretor Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Corretor Responsável</label>
                <select
                  value={selectedAgentId || ""}
                  onChange={(e) => setSelectedAgentId(e.target.value || null)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent text-sm font-medium text-foreground transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Ninguém atribuído</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.full_name} ({agent.role === 'admin' ? 'Admin' : 'Corretor'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      selectedConvAIEnabled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Inteligencia artificial</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedConvAIEnabled ? "IA ativa neste atendimento." : "Atendimento manual, sem respostas automaticas."}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={selectedConvAIEnabled}
                    onCheckedChange={handleToggleConversationAI}
                    disabled={setConversationAIMutation.isPending}
                    aria-label="Ativar ou pausar IA neste atendimento"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-3 border-t border-border/60">
              <Button
                variant="outline"
                onClick={() => setShowChatConfig(false)}
                className="rounded-lg px-4"
              >
                Cancelar
              </Button>
              <Button
                variant="cta"
                onClick={async () => {
                  try {
                    await updateSettingsMutation.mutateAsync({
                      conversationId: selectedConv.id,
                      status: selectedStatus,
                      agentId: selectedAgentId,
                      oldStatus: selectedConv.status,
                      oldAgentId: selectedConv.agent_id || null,
                      actorId: user?.id
                    });
                    toast({
                      title: "Sucesso!",
                      description: "Configurações de atendimento salvas com sucesso.",
                    });
                    setShowChatConfig(false);
                  } catch (err) {
                    toast({
                      title: "Erro ao salvar",
                      description: (err as Error).message,
                      variant: "destructive"
                    });
                  }
                }}
                disabled={updateSettingsMutation.isPending}
                className="rounded-lg px-4 gap-2 font-medium"
              >
                {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Camera className="h-5 w-5 text-orange-600" /> Câmera ao Vivo
              </h3>
              <Button variant="ghost" size="icon" onClick={handleCloseCamera} className="hover:bg-muted rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 pb-1">
              <Button
                variant={cameraFacing === "user" ? "secondary" : "outline"}
                size="sm"
                onClick={toggleCameraFacing}
                disabled={isCameraRecording}
                className="gap-1.5 text-xs"
                title={cameraFacing === "user" ? "Cambiar a cámara traseira" : "Cambiar a cámara frontal"}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                {cameraFacing === "user" ? "Frontal" : "Traseira"}
              </Button>
              <span className="text-[11px] text-muted-foreground">Alternar câmara</span>
            </div>
            
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-border shadow-inner">
              <video 
                ref={cameraVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${cameraFacing === "user" ? "scale-x-[-1]" : ""}`} 
              />
              <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur text-[10px] text-white font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 pt-2">
              {isCameraRecording ? (
                <>
                  <Button
                    variant="outline"
                    onClick={cancelCameraVideoRecording}
                    className="flex-1 rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={stopAndSendCameraVideo}
                    className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium gap-2 shadow-lg"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-red-200 animate-pulse" />
                    Enviar ({formatRecordingTime(cameraRecordingTime)})
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCloseCamera}
                    className="flex-1 rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCapturePhoto}
                    className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium gap-2 shadow-lg"
                  >
                    <Camera className="h-4 w-4" /> Capturar Foto
                  </Button>
                  <Button
                    onClick={startCameraVideoRecording}
                    className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium gap-2 shadow-lg"
                  >
                    <Video className="h-4 w-4" /> Grabar Vídeo
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-border">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-orange-600" /> Compartilhar Contato
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsContactModalOpen(false)} className="hover:bg-muted rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Nome do contato"
                  value={contactShareName}
                  onChange={(e) => setContactShareName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(DDD) 99999-9999"
                  value={contactSharePhone}
                  onChange={(e) => setContactSharePhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">E-mail</label>
                <input
                  type="email"
                  placeholder="contato@email.com"
                  value={contactShareEmail}
                  onChange={(e) => setContactShareEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Empresa (Opcional)</label>
                <input
                  type="text"
                  placeholder="Nome da empresa"
                  value={contactShareCompany}
                  onChange={(e) => setContactShareCompany(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsContactModalOpen(false)}
                className="flex-1 rounded-xl"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleShareContactConfirm}
                disabled={!contactShareName.trim() || !contactSharePhone.trim()}
                className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-lg"
              >
                Enviar Contato
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Atendimento() {
  return (
    <AtendimentoErrorBoundary>
      <AtendimentoContent />
    </AtendimentoErrorBoundary>
  );
}
