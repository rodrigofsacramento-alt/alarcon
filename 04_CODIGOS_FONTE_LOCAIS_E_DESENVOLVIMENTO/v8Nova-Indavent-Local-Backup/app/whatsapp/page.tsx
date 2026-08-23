'use client';

import React from 'react';
import Image from 'next/image';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { 
  Search, 
  Paperclip, 
  Phone, 
  Send, 
  Smile, 
  Eye, 
  MessageSquare,
  Plus,
  RefreshCw,
  Clock,
  User,
  MoreVertical,
  CheckCircle2,
  Check,
  AlertCircle,
  X,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatTimeAgo } from '@/lib/utils';

export default function WhatsAppPage() {
  const { user, profile } = useAuth();
  const [chats, setChats] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [newMessage, setNewMessage] = React.useState("");
  const [syncing, setSyncing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Connection States
  const [connectionStatus, setConnectionStatus] = React.useState<string>("checking"); // checking, open, close, connecting
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [qrCode, setQrCode] = React.useState<string | null>(null);
  const [checkingConnection, setCheckingConnection] = React.useState(false);

  // 1. Data Fetching Helpers
  const fetchChats = React.useCallback(async () => {
    if (!supabase || !user) {
      console.log('FetchChats skipped: supabase or user not ready', { hasSupabase: !!supabase, hasUser: !!user });
      return;
    }
    try {
      console.log('Fetching WhatsApp chats...', { user_id: user.id });
      
      // Filtro de 2 horas (120 minutos)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select(`
          phone, 
          sender_name, 
          content, 
          timestamp, 
          type,
          lead_id,
          leads (
            id,
            name,
            stage,
            budget
          )
        `)
        .gte('timestamp', twoHoursAgo)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Supabase query error (Detailed):', {
          message: error.message,
          details: error.details,
          code: error.code,
          hint: (error as any).hint
        });
        throw error;
      }

      console.log(`Retrieved ${data?.length || 0} messages from Supabase.`, data);

      const grouped = data.reduce((acc: any, curr: any) => {
        if (!acc[curr.phone]) {
          acc[curr.phone] = {
            id: curr.phone,
            phone: curr.phone,
            name: curr.leads?.Nome || curr.leads?.name || curr.sender_name || curr.phone,
            lastMessage: curr.content || "Sem conteúdo",
            time: formatTimeAgo(curr.timestamp),
            raw_timestamp: curr.timestamp,
            online: false,
            stage: curr.leads?.Estágio || curr.leads?.stage || 'Novo Lead',
            budget: curr.leads?.Orçamento || curr.leads?.budget || 0,
            lead_id: curr.lead_id || curr.leads?.id
          };
        }
        return acc;
      }, {});

      const chatsList = Object.values(grouped).sort((a: any, b: any) => 
        new Date(b.raw_timestamp).getTime() - new Date(a.raw_timestamp).getTime()
      );
      
      console.log(`Grouped into ${chatsList.length} unique conversations.`);
      setChats(chatsList);
      
      if (!selectedChat && chatsList.length > 0) {
        setSelectedChat(chatsList[0]);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedChat]);

  const fetchMessages = React.useCallback(async (phone: string) => {
    if (!supabase) return;
    
    // Filtro de 2 horas (120 minutos) para mensagens do chat selecionado
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('phone', phone)
      .gte('timestamp', twoHoursAgo)
      .order('timestamp', { ascending: true });

    if (!error && data) {
      // Heurística para garantir a direção correta
      const processed = data.map(msg => {
        let type = msg.type;
        // Se o tipo no DB for inconsistente, verificamos o metadata
        if (msg.metadata) {
          const meta = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
          // Evolution API: usa key.fromMe para mensagens enviadas
          if (meta.key?.fromMe === true || meta.id?.endsWith('_out') || meta.from?.includes('@lid')) {
            type = 'sent';
          } else if (meta.key?.fromMe === false || meta.from?.includes(phone)) {
            type = 'received';
          }
        }
        return { ...msg, type };
      });
      setMessages(processed);
    }
  }, []);

  // 2. Status/Connection Handlers
  const checkConnectionStatus = React.useCallback(async () => {
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-integration`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ action: 'status' })
      });
      const result = await response.json();
      setConnectionStatus(result.state);
      
      // Se conectar, fecha o modal
      if (result.state === 'open' && showQRModal) {
        setShowQRModal(false);
        setQrCode(null);
        fetchChats();
      }
    } catch (err) {
      console.error('Status Check Error:', err);
    }
  }, [showQRModal, fetchChats]);

  const handleConnect = async () => {
    setCheckingConnection(true);
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-integration`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ action: 'connect' })
      });
      const result = await response.json();
      if (result.status === 'success' && result.qrcode) {
        setQrCode(result.qrcode);
        setShowQRModal(true);
      } else {
        alert('Erro ao gerar QR Code: ' + (result.error || 'Verifique se a Evolution API está rodando.'));
      }
    } catch (err) {
      console.error('Connect Error:', err);
      alert('Falha ao conectar com o serviço de integração.');
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Deseja realmente desconectar este WhatsApp?')) return;
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-integration`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ action: 'logout' })
      });
      checkConnectionStatus();
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  // 3. User Action Handlers
  const handleSyncHistory = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-integration`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ action: 'sync_history' })
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert(`${result.synced} mensagens dos últimos 7 dias sincronizadas com sucesso!`);
        fetchChats();
      } else {
        alert('Erro na sincronização: ' + (result.error || result.message));
      }
    } catch (err) {
      console.error('Sync Error:', err);
      alert('Falha ao conectar com o serviço de sincronização.');
    } finally {
      setSyncing(false);
    }
  };


  React.useEffect(() => {
    fetchChats();
    checkConnectionStatus();
    
    const channel = supabase?.channel('whatsapp_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whatsapp_messages' }, () => {
        console.log('Realtime update: new message received.');
        fetchChats();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'whatsapp_messages' }, () => {
        console.log('Realtime update: message status changed.');
        fetchChats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_sessions' }, (payload) => {
        console.log('Realtime update: session status changed.', payload.new);
        if (payload.new && (payload.new as any).status) {
           setConnectionStatus((payload.new as any).status);
           if ((payload.new as any).qr_code) {
             setQrCode((payload.new as any).qr_code);
             setShowQRModal(true);
           }
           if ((payload.new as any).status === 'connected' || (payload.new as any).status === 'open') {
             setShowQRModal(false);
             setQrCode(null);
             fetchChats();
           }
        }
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel!);
    };
  }, [fetchChats, checkConnectionStatus]);

  React.useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.phone);
    }
  }, [selectedChat, fetchMessages]);

  React.useEffect(() => {
    if (messages.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) {
          const element = document.getElementById('messages-end');
          element?.scrollIntoView({ behavior: 'smooth' });
        }
      });
      
      const element = document.getElementById('messages-end');
      if (element) observer.observe(element);
      
      return () => {
        if (element) observer.unobserve(element);
      };
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const messageToSend = newMessage;
    setNewMessage("");

    try {
      // Optimistic Update
      const optimisticMsg = {
        id: `temp_${Date.now()}`,
        phone: selectedChat.phone,
        content: messageToSend,
        type: 'sent',
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      setMessages(prev => [...prev, optimisticMsg]);

      // Insert via Supabase (Broker vai ler esta mensagem)
      const { error } = await supabase!
        .from('whatsapp_messages')
        .insert({
           phone: selectedChat.phone,
           remote_jid: selectedChat.phone + '@s.whatsapp.net',
           content: messageToSend,
           from_me: true,
           type: 'sent',
           message_type: 'text',
           status: 'pending',
           timestamp: new Date().toISOString(),
           lead_id: selectedChat.lead_id || null,
        });

      if (error) {
        throw error;
      }

      // Re-fetch para garantir integridade, embora o Realtime vá atualizar a tela em breve
      fetchMessages(selectedChat.phone);
    } catch (err) {
      console.error('Send Error:', err);
      alert('Falha ao enfileirar mensagem para envio.');
      setMessages(prev => prev.filter(m => m.status !== 'pending'));
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    chat.phone.includes(searchTerm)
  );

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30 text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden sidebar-offset">
        <TopBar title="Central WhatsApp" />
        <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-8 bg-slate-950 overflow-hidden">
           <div className="flex-1 flex flex-col min-w-0 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden relative">
        
        {/* Header - Matches the User Screenshot */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="size-10 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
              <MessageSquare size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 tracking-tight">Canais de Atendimento</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Evolution API • Indavent</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 mr-4 text-[11px] font-bold">
              {connectionStatus === 'open' ? (
                <div className="flex items-center gap-2 text-emerald-500">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  SESSÃO ATIVA
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-400">
                  <span className="size-2 rounded-full bg-rose-500"></span>
                  DESCONECTADO
                </div>
              )}
            </div>
            
            {connectionStatus !== 'open' ? (
               <button 
                  onClick={handleConnect}
                  disabled={checkingConnection}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[11px] font-bold transition-all hover:bg-slate-800 active:scale-95 shadow-md"
                >
                  <Smartphone className={cn("size-3.5", checkingConnection && "animate-pulse")} />
                  {checkingConnection ? "GERANDO..." : "CONECTAR WHATSAPP"}
                </button>
            ) : (
              <button 
                onClick={handleSyncHistory}
                disabled={syncing}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-[#00a884] text-white rounded-full text-[11px] font-bold transition-all hover:bg-[#008f72] active:scale-95 shadow-md shadow-emerald-500/10",
                  syncing && "opacity-75 cursor-not-allowed"
                )}
              >
                <RefreshCw className={cn("size-3.5", syncing && "animate-spin")} />
                {syncing ? "SINCRONIZANDO..." : "SINCRONIZAR HISTÓRICO (7 DIAS)"}
              </button>
            )}

            {connectionStatus === 'open' && (
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                title="Desconectar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Leads List */}
          <aside className="w-[340px] flex flex-col border-r border-slate-800 bg-slate-900 shrink-0">
            <div className="p-3 bg-slate-900">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  className="w-full bg-slate-950 border-none rounded-lg py-2 pl-10 pr-4 text-[13px] focus:outline-none transition-all placeholder:text-slate-400" 
                  placeholder="Pesquisar ou começar uma nova conversa" 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1 py-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <RefreshCw className="size-6 text-emerald-500 animate-spin" />
                  <p className="text-xs text-slate-400 font-medium">Carregando histórico...</p>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 px-10 text-center gap-4">
                  <div className="size-16 rounded-full bg-slate-950 flex items-center justify-center text-[#bac1c7]">
                    <User size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">Nenhuma conversa encontrada</p>
                    <p className="text-xs text-slate-400 mt-1">Sincronize sua Evolution API para começar.</p>
                  </div>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div 
                    key={chat.id} 
                    onClick={() => setSelectedChat(chat)}
                    className={cn(
                      "group relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-800",
                      selectedChat?.id === chat.id 
                        ? "bg-slate-950" 
                        : "hover:bg-slate-800 bg-slate-900"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className={cn(
                        "size-12 rounded-full flex items-center justify-center text-sm font-semibold",
                        selectedChat?.id === chat.id 
                          ? "bg-slate-700 text-slate-300" 
                          : "bg-slate-800 text-slate-400"
                      )}>
                        {chat.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-[#00a884] border-2 border-white rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0 border-b border-transparent py-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="text-[16px] font-medium text-slate-100 truncate">
                          {chat.name}
                        </h4>
                        <span className="text-[12px] text-slate-400 whitespace-nowrap ml-2">
                          {chat.time}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-[13px] text-slate-400 truncate leading-tight flex-1">
                          {chat.lastMessage}
                        </p>
                        {selectedChat?.id === chat.id && (
                           <span className="size-5 bg-[#00a884] text-white text-[10px] font-bold rounded-full flex items-center justify-center ml-2 shadow-sm">
                             1
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <header className="h-[59px] flex items-center justify-between px-4 bg-slate-950 border-l border-slate-700 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-semibold">
                      {selectedChat.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h2 className="font-medium text-[16px] text-slate-100 truncate">{selectedChat.name}</h2>
                      <p className="text-[12px] text-slate-400 truncate">visto hoje às {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <button className="p-2 hover:bg-slate-700/50 rounded-full transition-colors">
                      <Search size={20} />
                    </button>
                    <button className="p-2 hover:bg-slate-700/50 rounded-full transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </header>

                  <div className="flex-1 overflow-y-auto p-4 md:px-10 lg:px-20 space-y-2 custom-scrollbar bg-slate-950 relative whatsapp-bg">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                        <div className="size-16 rounded-full bg-slate-900/20 backdrop-blur-md flex items-center justify-center text-slate-400 shadow-inner">
                          <Clock size={32} />
                        </div>
                        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-900/50 backdrop-blur-sm px-4 py-1.5 rounded-full">Sem histórico recente</p>
                      </div>
                    ) : (
                      <div className="space-y-1 py-4">
                        {Object.entries(
                          messages.reduce((groups: any, msg) => {
                            const date = new Date(msg.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                            if (!groups[date]) groups[date] = [];
                            groups[date].push(msg);
                            return groups;
                          }, {})
                        ).map(([date, groupMessages]: [string, any]) => (
                          <div key={date} className="space-y-1">
                            <div className="flex justify-center my-6">
                              <span className="px-3 py-1.5 bg-slate-900 text-slate-400 text-[12px] font-medium rounded-lg shadow-sm uppercase tracking-wide">
                                {date === new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) ? 'Hoje' : date}
                              </span>
                            </div>
                            
                            {groupMessages.map((msg: any, idx: number) => {
                              const isSent = msg.type === 'sent';
                              const nextMsg = groupMessages[idx + 1];
                              const isLastInGroup = !nextMsg || nextMsg.type !== msg.type;
                              
                              return (
                                <div 
                                  key={msg.id} 
                                  className={cn(
                                    "flex w-full animate-in fade-in slide-in-from-bottom-1 duration-200",
                                    isSent ? "justify-end" : "justify-start"
                                  )}
                                >
                                  <div className={cn(
                                    "max-w-[85%] md:max-w-[65%] min-w-[80px] shadow-sm relative mb-0.5 px-2 pt-1 pb-1 flex flex-col",
                                    isSent 
                                      ? "bg-emerald-600 text-slate-100 rounded-lg rounded-tr-none" 
                                      : "bg-slate-900 text-slate-100 rounded-lg rounded-tl-none",
                                    isLastInGroup && (isSent ? "rounded-tr-none" : "rounded-tl-none")
                                  )}>
                                    {/* Tail */}
                                    {isLastInGroup && (
                                      <div className={cn(
                                        "absolute top-0 w-3 h-3",
                                        isSent 
                                          ? "-right-2 bg-emerald-600 [clip-path:polygon(0_0,0%_100%,100%_0)]" 
                                          : "-left-2 bg-slate-900 [clip-path:polygon(100%_0,0%_0,100%_100%)]"
                                      )} />
                                    )}

                                    {/* Mídia */}
                                    {msg.media_type === 'image' && msg.media_url && (
                                      <div className="p-1">
                                        <img src={msg.media_url} alt="WhatsApp Image" className="w-full h-auto object-cover max-h-80 rounded-md cursor-pointer hover:opacity-95 transition-opacity" />
                                      </div>
                                    )}

                                    <div className="px-1 py-0.5 flex flex-col">
                                      <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words">
                                        {msg.content || ""}
                                        <span className="inline-block w-16" /> {/* Espaçador para o time */}
                                      </p>
                                      
                                      <div className="flex items-center gap-1 justify-end absolute bottom-1 right-2">
                                        <span className="text-[11px] text-slate-400 tabular-nums font-normal">
                                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isSent && (
                                          <div className="flex -space-x-1 text-blue-400">
                                            <Check size={14} strokeWidth={2.5} />
                                            <Check size={14} strokeWidth={2.5} className="-ml-2" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                    <div id="messages-end" />
                  </div>

                {/* Input Area */}
                <footer className="px-4 py-3 bg-slate-950 shrink-0">
                  <div className="flex items-center gap-2 max-w-6xl mx-auto px-2">
                    <div className="flex items-center gap-1 text-slate-400">
                      <button className="p-2 hover:bg-slate-700/80 rounded-full transition-colors active:scale-95">
                        <Smile size={24} />
                      </button>
                      <button className="p-2 hover:bg-slate-700/80 rounded-full transition-colors active:scale-95">
                        <Paperclip size={24} className="rotate-45" />
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <textarea 
                        className="w-full bg-slate-900 border-none py-2.5 px-4 text-[15px] rounded-lg focus:ring-0 placeholder:text-slate-400 text-slate-100 shadow-sm resize-none min-h-[40px] max-h-40 leading-tight" 
                        placeholder="Digite uma mensagem" 
                        rows={1}
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          e.target.style.height = 'inherit';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = '40px';
                          }
                        }}
                      />
                    </div>
                    
                    <button 
                      onClick={handleSendMessage}
                      className="p-3 bg-transparent text-slate-400 hover:text-[#00a884] transition-all active:scale-90"
                    >
                      {newMessage.trim() ? (
                         <div className="size-10 bg-[#00a884] text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
                           <Send size={18} />
                         </div>
                      ) : (
                         <div className="size-10 hover:bg-slate-700/80 rounded-full flex items-center justify-center">
                            <Plus size={24} />
                         </div>
                      )}
                    </button>
                  </div>
                </footer>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-950 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#00a884]"></div>
                <div className="size-32 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-8 border border-white shadow-soft">
                  <MessageSquare size={64} />
                </div>
                <h3 className="text-[32px] font-light text-slate-200 mb-4">WhatsApp Web Evolution</h3>
                <p className="text-[14px] text-slate-400 max-w-md leading-[1.6]">
                  Envie e receba mensagens sem precisar manter seu celular conectado.<br/>
                  Utilize a Evolution API para gerenciar seus leads em tempo real.
                </p>
                <div className="mt-20 text-[14px] text-slate-400 flex items-center gap-2">
                   <Clock size={14} /> Criptografado de ponta a ponta
                </div>
              </div>
            )}
          </main>

          {/* Right Panel: Lead Details */}
          {selectedChat && (
            <aside className="w-[320px] border-l border-slate-800 bg-slate-900 hidden xl:flex flex-col py-6 overflow-y-auto custom-scrollbar active-panel-shadow shrink-0">
              <div className="px-6 text-center pb-8 border-b border-slate-800/50">
                <div className="relative inline-block">
                  <div className="size-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-[38px] mx-auto mb-5 flex items-center justify-center text-slate-400 text-2xl font-bold shadow-soft border border-white">
                    {selectedChat.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute bottom-4 right-1 size-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                </div>
                
                <h3 className="font-bold text-base text-slate-200 tracking-tight">{selectedChat.name}</h3>
                <p className="text-[11px] text-slate-400 font-bold mt-1.5 tracking-[0.15em] uppercase tabular-nums">
                  {selectedChat.phone.length >= 12 
                    ? selectedChat.phone.replace(/(\d{2})(\d{2})(\d{1})(\d{4})(\d{4})/, '+$1 ($2) $3 $4-$5')
                    : selectedChat.phone.replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})/, '+$1 ($2) $3-$4')}
                </p>
                
                <div className="mt-5 flex items-center justify-center gap-2">
                  <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-emerald-100/50">
                    {selectedChat.stage}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-8">
                <section>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 px-1">Perfil do Lead</h4>
                  <div className="grid gap-5">
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-800/50/50 border border-slate-800/50">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Investimento</span>
                      <span className="text-xs font-black text-slate-300">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedChat.budget || 0)}
                      </span>
                    </div>
                    
                    <div className="space-y-4 px-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-medium text-slate-400">Origem</span>
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-2">
                          <div className="size-2 rounded-full bg-emerald-400"></div>
                          WhatsApp Ads
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-medium text-slate-400">Responsável</span>
                        <div className="flex items-center gap-2">
                          <div className="size-5 bg-slate-800 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                            {profile?.name?.substring(0,1) || "V"}
                          </div>
                          <span className="text-[11px] font-bold text-slate-300">{profile?.name || "Vendedor"}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-medium text-slate-400">Última Interação</span>
                        <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                          {selectedChat.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="pt-2">
                  <button className="group w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-bold text-slate-300 hover:border-slate-600 hover:bg-slate-800/50 transition-all active:scale-[0.98] shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:shadow-sm transition-all">
                        <Eye size={16} />
                      </div>
                      <span>Ver Ficha Completa</span>
                    </div>
                    <div className="size-5 rounded-full border border-slate-700 flex items-center justify-center text-slate-300">
                      <Plus size={12} />
                    </div>
                  </button>
                </section>
                
                <section className="space-y-3 pt-4 border-t border-slate-800/50 mt-auto">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Ações Rápidas</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="py-3.5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 border border-rose-100/50">
                        Perdido
                      </button>
                      <button className="py-3.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                        Ganho
                      </button>
                    </div>
                </section>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  </main>

      {/* QR Code Pairing Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 text-center border-b border-slate-800/50 relative">
              <button 
                onClick={() => { setShowQRModal(false); setQrCode(null); }}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="size-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4 border border-emerald-100">
                <Smartphone size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-200">Conectar WhatsApp</h3>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Evolution API Pair</p>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              {qrCode ? (
                <div className="relative p-4 bg-slate-900 rounded-2xl border-2 border-emerald-50 group">
                  <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all"></div>
                  <img src={qrCode} alt="WhatsApp QR Code" className="relative size-56 block render-pixelated" />
                </div>
              ) : (
                <div className="size-56 bg-slate-800/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-700">
                  <RefreshCw className="size-8 text-slate-300 animate-spin" />
                </div>
              )}
              
              <div className="mt-8 space-y-4 w-full">
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="size-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                  <p className="text-[11px] text-slate-300 leading-normal">Abra o WhatsApp no seu celular e toque em <b>Aparelhos Conectados</b>.</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="size-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                  <p className="text-[11px] text-slate-300 leading-normal">Toque em <b>Conectar um aparelho</b> e aponte a câmera para esta tela.</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-800/50 text-center">
              <p className="text-[10px] text-slate-400 font-medium animate-pulse">Aguardando conexão...</p>
            </div>
          </div>
        </div>
      )}
      

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ced5d9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #babec2;
        }
        .shadow-soft {
          box-shadow: 0 4px 20px -4px rgba(0,0,0,0.05);
        }
        .whatsapp-bg::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.06;
          z-index: 0;
          background-image: url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png");
          pointer-events: none;
        }
        .whatsapp-bg > div {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
