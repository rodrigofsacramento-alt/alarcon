import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Phone, 
  Video, 
  Send, 
  Smile, 
  Paperclip, 
  Check, 
  CheckCheck, 
  Calendar, 
  FileText, 
  Clock, 
  Mail, 
  MoreHorizontal, 
  Home, 
  DollarSign,
  QrCode,
  RefreshCw,
  PowerOff,
  Bot,
  AlertTriangle,
  User,
  Users,
  Mic,
  MicOff,
  Camera,
  MapPin,
  Share2,
  Trash2,
  UserPlus,
  Info,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useLeads } from '../hooks/useLeads';
import { useVisits, useCreateVisit } from '../hooks/useVisits';
import { useAgents } from '../hooks/useAgents';
import { 
  useWhatsapp, 
  useStartWhatsAppSession, 
  useDisconnectWhatsAppSession, 
  useSetWhatsAppAiEnabled, 
  useSendWhatsAppMessage 
} from '../hooks/useWhatsapp';

interface Client {
  id: string;
  full_name?: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  is_group?: boolean;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id?: string;
  content: string;
  message_type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'system' | 'bot';
  created_at: string;
  is_read?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  sender?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
    phone?: string;
  };
}

interface Conversation {
  id: string;
  client_id?: string;
  agent_id?: string | null;
  lead_id?: string | null;
  subject?: string;
  status: 'open' | 'pending' | 'closed' | 'deleted';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  channel?: string;
  tags?: string[];
  unread_count?: number;
  last_message_at?: string;
  ai_enabled?: boolean;
  client?: Client;
  whatsapp_contact?: Array<{ is_group?: boolean; remote_jid?: string; phone_number?: string }>;
  whatsapp_contacts?: Array<{ is_group?: boolean; remote_jid?: string; phone_number?: string }>;
}

export default function Atendimento() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const isAgent = profile?.role === 'agent';

  // Tabs: 'meus' | 'equipe' | 'grupos' | 'nao-lidas' | 'arquivadas'
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('atendimento_active_tab');
      return saved || 'meus';
    } catch {
      return 'meus';
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  
  // Real Data & Hooks
  const { data: whatsappSession, isLoading: isWhatsappLoading, refetch: refetchWhatsapp } = useWhatsapp();
  const startWhatsappMutation = useStartWhatsAppSession();
  const disconnectWhatsappMutation = useDisconnectWhatsAppSession();
  const toggleAiMutation = useSetWhatsAppAiEnabled();
  const sendMessageMutation = useSendWhatsAppMessage();
  const { data: leads = [] } = useLeads();
  const { data: agents = [] } = useAgents();
  const createVisitMutation = useCreateVisit();

  // Local conversations state (synced with Supabase)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const checkIsGroup = (chat: Conversation) => {
    const wContact = chat.whatsapp_contact?.[0] || chat.whatsapp_contacts?.[0];
    return Boolean(
      wContact?.is_group ||
      chat.client?.is_group ||
      chat.client?.phone?.includes('@g.us') ||
      wContact?.remote_jid?.endsWith('@g.us') ||
      (chat.client?.phone && chat.client.phone.length > 15 && !chat.client.phone.startsWith('55'))
    );
  };

  // Fetch conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        let query = supabase
          .from('conversations')
          .select('*, client:profiles!conversations_client_id_fkey(*), whatsapp_contact:whatsapp_contacts(*)')
          .neq('status', 'deleted')
          .order('last_message_at', { ascending: false, nullsFirst: false });

        if (isAgent && user?.id) {
          query = query.or(`agent_id.eq.${user.id},agent_id.is.null`);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (data) {
          setConversations(data as Conversation[]);
          if (!activeChatId && data.length > 0) {
            setActiveChatId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar conversas:', err);
      }
    }
    loadConversations();

    // Subscribe to realtime conversation updates
    const channel = supabase
      .channel('conversations-realtime-feed')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, isAgent]);

  // Tab counts
  const tabCounts = useMemo(() => {
    let meus = 0;
    let equipe = 0;
    let grupos = 0;
    let naoLidas = 0;

    conversations.forEach((chat) => {
      if (chat.status === 'deleted' || chat.subject === '[deleted]') return;
      const isGroup = checkIsGroup(chat);
      if (isGroup) {
        grupos++;
      } else {
        equipe++;
        if (chat.agent_id === user?.id || !chat.agent_id) meus++;
        if (chat.status === 'pending' || (chat.unread_count || 0) > 0) naoLidas++;
      }
    });

    return { meus, equipe, grupos, naoLidas };
  }, [conversations, user?.id]);

  // Filtered Conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((chat) => {
      if (chat.status === 'deleted' || chat.subject === '[deleted]') return false;
      const isGroup = checkIsGroup(chat);
      const name = (chat.client?.full_name || chat.client?.name || '').toLowerCase();
      const phone = (chat.client?.phone || '').toLowerCase();
      const subject = (chat.subject || '').toLowerCase();
      const query = searchTerm.trim().toLowerCase();

      if (query && !name.includes(query) && !phone.includes(query) && !subject.includes(query)) {
        return false;
      }

      switch (activeTab) {
        case 'grupos':
          return isGroup;
        case 'meus':
          return !isGroup && (isAgent ? chat.agent_id === user?.id : true) && chat.status !== 'closed';
        case 'equipe':
          return !isGroup && chat.status !== 'closed';
        case 'nao-lidas':
          return !isGroup && (chat.status === 'pending' || (chat.unread_count || 0) > 0);
        case 'arquivadas':
          return chat.status === 'closed';
        default:
          return true;
      }
    });
  }, [conversations, activeTab, searchTerm, user?.id, isAgent]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChatId) return;

    async function loadMessages() {
      setIsLoadingMessages(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*, sender:profiles!messages_sender_id_fkey(*)')
          .eq('conversation_id', activeChatId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages((data as Message[]) || []);
      } catch (err) {
        console.error('Erro ao carregar mensagens:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    }

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-messages-${activeChatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeChatId}`
      }, async (payload) => {
        const newMsg = payload.new as Message;
        if (newMsg.sender_id && !newMsg.sender) {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newMsg.sender_id)
            .maybeSingle();
          if (senderProfile) {
            newMsg.sender = senderProfile;
          }
        }
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [activeChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || null;
  }, [conversations, activeChatId]);

  const isGroupActiveChat = activeChat ? checkIsGroup(activeChat) : false;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeChatId) return;

    const content = messageInput.trim();
    setMessageInput('');
    setReplyToMessage(null);

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: activeChatId,
        content: content
      });
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  const isWhatsappConnected = whatsappSession?.status === 'connected';

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl">
      
      {/* 1. SIDEBAR CONVERSAS */}
      <div className="w-80 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/40">
        
        {/* Header da Sidebar */}
        <div className="p-4 space-y-3 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              Atendimentos
            </h2>
            <div className="flex items-center gap-1.5">
              {/* WhatsApp Status Pill */}
              <button 
                onClick={() => setShowWhatsAppModal(true)}
                className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                  isWhatsappConnected 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                }`}
                title="Configurar WhatsApp"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isWhatsappConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                {isWhatsappConnected ? 'WPP Conectado' : 'Conectar WPP'}
              </button>

              <button 
                onClick={() => setShowNewChatModal(true)}
                className="p-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-400 transition-colors"
                title="Novo Atendimento"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Abas */}
          <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800/60 text-xs">
            <button 
              onClick={() => setActiveTab('meus')}
              className={`flex-1 py-1 rounded-lg font-medium transition-all relative ${activeTab === 'meus' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Meus
              {tabCounts.meus > 0 && (
                <span className="ml-1 text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full font-bold">
                  {tabCounts.meus}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('equipe')}
              className={`flex-1 py-1 rounded-lg font-medium transition-all relative ${activeTab === 'equipe' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Equipe
            </button>
            <button 
              onClick={() => setActiveTab('grupos')}
              className={`flex-1 py-1 rounded-lg font-medium transition-all relative flex items-center justify-center gap-1 ${activeTab === 'grupos' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Users className="w-3 h-3" />
              Grupos
              {tabCounts.grupos > 0 && (
                <span className="ml-0.5 text-[10px] bg-amber-600 px-1.5 py-0.2 rounded-full font-bold text-white">
                  {tabCounts.grupos}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('nao-lidas')}
              className={`flex-1 py-1 rounded-lg font-medium transition-all relative ${activeTab === 'nao-lidas' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Não lidas
              {tabCounts.naoLidas > 0 && (
                <span className="ml-1 text-[10px] bg-red-600 px-1 rounded-full font-bold text-white">
                  {tabCounts.naoLidas}
                </span>
              )}
            </button>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 focus:border-sky-500/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Lista de Chats */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-900/40">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhuma conversa encontrada neste filtro.
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isGroup = checkIsGroup(chat);
              const clientName = chat.client?.full_name || chat.client?.name || (isGroup ? 'Grupo WhatsApp' : 'Cliente');
              const isSelected = chat.id === activeChatId;

              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-all ${
                    isSelected ? (isGroup ? 'bg-amber-500/10 border-l-4 border-l-amber-500' : 'bg-sky-500/10 border-l-4 border-l-sky-500') : 'hover:bg-slate-900/40 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border ${
                      isGroup 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                        : 'bg-slate-800 text-sky-400 border-slate-700'
                    }`}>
                      {isGroup ? <Users className="w-4 h-4" /> : clientName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                        {clientName}
                        {isGroup && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Grupo
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mb-1">{chat.subject || 'Atendimento ativo'}</p>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase">
                        {chat.channel || 'WhatsApp'}
                      </span>
                      {chat.ai_enabled !== false && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Bot className="w-2.5 h-2.5" /> IA
                        </span>
                      )}
                      {(chat.unread_count || 0) > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white ml-auto">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. ÁREA CENTRAL: CHAT */}
      <div className="flex-1 flex flex-col h-full bg-slate-950/20">
        {activeChat ? (
          <>
            {/* Header do Chat */}
            <div className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                  isGroupActiveChat 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                    : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                }`}>
                  {isGroupActiveChat ? <Users className="w-5 h-5" /> : (activeChat.client?.full_name || 'C').charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {activeChat.client?.full_name || activeChat.client?.name || (isGroupActiveChat ? 'Grupo WhatsApp' : 'Cliente')}
                    {isGroupActiveChat && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" /> Grupo
                      </span>
                    )}
                    {isWhatsappConnected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online via WhatsApp" />
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isGroupActiveChat ? 'Grupo WhatsApp • Comunicação em tempo real' : (activeChat.client?.phone || 'Sem telefone')} • {activeChat.channel || 'WhatsApp'}
                  </p>
                </div>
              </div>

              {/* Ações do Header */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleAiMutation.mutate({ enabled: activeChat.ai_enabled === false })}
                  className={`text-xs font-medium px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
                    activeChat.ai_enabled !== false 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Ativar/Pausar IA no atendimento"
                >
                  <Bot className="w-4 h-4" />
                  {activeChat.ai_enabled !== false ? 'IA Ativa' : 'IA Pausada'}
                </button>

                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lista de Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                  Carregando mensagens...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-600" />
                  <p>Nenhuma mensagem nesta conversa ainda.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAgentSender = msg.sender_id === user?.id || 
                                        msg.message_type === 'bot' || 
                                        (msg.sender && msg.sender.role !== 'client');
                  
                  const senderName = msg.sender?.full_name || (isAgentSender ? 'Você' : 'Participante');

                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col ${isAgentSender ? 'items-end' : 'items-start'}`}
                    >
                      {/* Em grupos, exibir o nome do remetente para mensagens de participantes */}
                      {isGroupActiveChat && !isAgentSender && (
                        <div className="flex items-center gap-1.5 ml-1 mb-1">
                          <div className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center text-[9px] font-bold border border-slate-700">
                            {(msg.sender?.full_name || 'P').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[10px] font-semibold text-sky-400">
                            {senderName}
                          </span>
                          {msg.sender?.phone && (
                            <span className="text-[9px] text-slate-500 font-normal">
                              ({msg.sender.phone})
                            </span>
                          )}
                        </div>
                      )}

                      <div className={`max-w-[75%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-1 shadow-sm ${
                        isAgentSender 
                          ? 'bg-sky-600 text-white rounded-br-none' 
                          : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-slate-700/60'
                      }`}>
                        <p className="whitespace-pre-line break-words">{msg.content}</p>
                        <div className={`flex items-center gap-1 text-[10px] ${isAgentSender ? 'text-sky-200 justify-end' : 'text-slate-400 justify-start'}`}>
                          <span>{new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          {isAgentSender && <CheckCheck className="w-3 h-3 text-sky-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800/80 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder={isGroupActiveChat ? "Enviar mensagem para todos no grupo..." : "Digite sua mensagem via WhatsApp..."}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-slate-900/90 border border-slate-800 focus:border-sky-500 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-500 outline-none transition-all"
                />
                <button 
                  type="submit"
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white transition-all shadow-lg shadow-sky-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm space-y-2">
            <MessageSquare className="w-12 h-12 text-slate-700" />
            <p>Selecione uma conversa para iniciar o atendimento.</p>
          </div>
        )}
      </div>

      {/* 3. MODAL DE CONEXÃO DO WHATSAPP (QR CODE / STATUS) */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Conexão WhatsApp Imobiliária</h3>
                  <p className="text-xs text-slate-400">Integração oficial via Broker</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWhatsAppModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Status da Sessão */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Status da Sessão</p>
                  <p className="text-sm font-bold text-white capitalize">{whatsappSession?.status || 'Desconectado'}</p>
                  {whatsappSession?.phone_number && (
                    <p className="text-xs text-emerald-400 font-mono mt-0.5">{whatsappSession.phone_number}</p>
                  )}
                </div>
                <button 
                  onClick={() => refetchWhatsapp()}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Atualizar
                </button>
              </div>

              {/* QR Code se pronto */}
              {whatsappSession?.status === 'qr_ready' && whatsappSession.qr_code && (
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl">
                  <img 
                    src={whatsappSession.qr_code.startsWith('data:') ? whatsappSession.qr_code : `data:image/png;base64,${whatsappSession.qr_code}`}
                    alt="QR Code WhatsApp" 
                    className="w-56 h-56 object-contain"
                  />
                  <p className="text-slate-800 text-xs font-semibold mt-2">Escaneie com o celular da imobiliária</p>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3">
                {!isWhatsappConnected ? (
                  <button
                    onClick={() => startWhatsappMutation.mutate({})}
                    disabled={startWhatsappMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> Gerar Novo QR Code
                  </button>
                ) : (
                  <button
                    onClick={() => disconnectWhatsappMutation.mutate()}
                    disabled={disconnectWhatsappMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <PowerOff className="w-4 h-4" /> Desconectar Sessão
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
