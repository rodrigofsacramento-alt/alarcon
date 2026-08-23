"use client";

import { useWhatsAppSession } from "@/hooks/use-whatsapp";
import { useConversations, type Conversation } from "@/hooks/use-messages";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { WhatsAppConnect } from "@/components/whatsapp/WhatsAppConnect";
import { useState, useRef, useEffect } from "react";
import { Search, User, MessageSquare, PanelRightClose, PanelRightOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { LeadDetailsPane } from "@/components/whatsapp/LeadDetailsPane";

function renderMessageContent(content: string | null) {
  if (!content) return null;

  // Verificar se o formato é de mídia: [Label] Nome\nURL
  const mediaRegex = /^\[(Imagem|Video|Audio|Arquivo)\]\s*(.*?)\n(https?:\/\/.*)$/s;
  const match = content.match(mediaRegex);

  if (match) {
    const [_, type, fileName, url] = match;

    if (type === 'Imagem') {
      return (
        <div className="flex flex-col gap-2">
          <img 
            src={url} 
            alt={fileName} 
            className="max-w-full max-h-[300px] rounded-lg object-contain cursor-pointer border border-white/10 hover:opacity-90 transition-opacity" 
            onClick={() => window.open(url, '_blank')}
          />
          <span className="text-[10px] text-white/50 truncate max-w-xs">{fileName}</span>
        </div>
      );
    }

    if (type === 'Video') {
      return (
        <div className="flex flex-col gap-2">
          <video 
            src={url} 
            controls 
            className="max-w-full max-h-[300px] rounded-lg border border-white/10"
          />
          <span className="text-[10px] text-white/50 truncate max-w-xs">{fileName}</span>
        </div>
      );
    }

    if (type === 'Audio') {
      return (
        <div className="flex flex-col gap-2 min-w-[240px]">
          <audio 
            src={url} 
            controls 
            className="w-full h-10 mt-1"
          />
          <span className="text-[10px] text-white/50 truncate max-w-xs">{fileName}</span>
        </div>
      );
    }

    if (type === 'Arquivo') {
      return (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group min-w-[200px]"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">{fileName}</p>
            <p className="text-[10px] text-white/50">Clique para baixar/ver</p>
          </div>
        </a>
      );
    }
  }

  // Fallback para mensagens de mídia indisponíveis ou texto comum
  if (content.startsWith('[Midia indisponivel]')) {
    const type = content.replace('[Midia indisponivel] ', '').trim();
    const label = type === 'image' ? 'Imagem' :
                  type === 'video' ? 'Vídeo' :
                  type === 'audio' ? 'Áudio' : 'Arquivo/Documento';
    return (
      <div className="flex items-center gap-2 text-white/50 italic text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>Mídia indisponível ({label})</span>
      </div>
    );
  }

  return <div className="leading-relaxed whitespace-pre-wrap">{content}</div>;
}

export default function WhatsAppCRMPage() {
  const { data: session, isLoading: sessionLoading } = useWhatsAppSession();
  const { data: conversations, isLoading: convLoading } = useConversations();
  const { user } = useAuth(); // <--- pegamos o user logado aqui
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const { messages, isLoading: messagesLoading } = useChatMessages(activeConv?.conversation_id || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const handleSelectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    
    // Zerar contador de mensagens não lidas
    const count = Array.isArray(conv.conversations) ? conv.conversations[0]?.unread_count : (conv.conversations as any)?.unread_count;
    if (count && count > 0 && conv.conversation_id) {
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conv.conversation_id);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeConv || isSending) return;

    const text = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    try {
      // 0. Assumir a conversa se for órfã
      const currentAgentId = Array.isArray(activeConv.conversations) ? activeConv.conversations[0]?.agent_id : (activeConv.conversations as any)?.agent_id;
      if (!currentAgentId && user?.id && activeConv.conversation_id) {
        await supabase
          .from('conversations')
          .update({ agent_id: user.id })
          .eq('id', activeConv.conversation_id);
      }

      // 1. Log técnico para o broker enviar (Raw Log)
      const { error } = await supabase.from('whatsapp_messages').insert({
        conversation_id: activeConv.conversation_id,
        remote_jid: activeConv.remote_jid,
        from_me: true,
        content: text,
        message_type: 'text',
        status: 'pending',
        whatsapp_session_id: session?.id,
      });

      // 2. Tabela de negócios para exibição na UI
      const { error: msgErr } = await supabase.from('messages').insert({
        conversation_id: activeConv.conversation_id,
        receiver_id: activeConv.profile_id, // ID do contato na tabela profiles
        content: text,
        message_type: 'text',
        is_read: true,
      });

      if (error || msgErr) {
        console.error("Failed to send message", JSON.stringify(error || msgErr, null, 2));
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (sessionLoading) {
    return <div className="p-8 h-screen flex items-center justify-center">Carregando CRM...</div>;
  }

  // Se não estiver conectado, mostra a tela de QR Code
  if (!session || session.status !== 'connected') {
    return (
      <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-900 p-8">
        <div className="w-full h-full flex flex-col">
          <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">WhatsApp CRM</h1>
          <div className="flex-1 rounded-2xl border overflow-hidden bg-white dark:bg-slate-950">
            <WhatsAppConnect />
          </div>
        </div>
      </div>
    );
  }

  // Se estiver conectado, mostra o layout do CRM (Lista na esquerda, chat na direita)
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 dark:bg-slate-900 sidebar-offset">
        <TopBar title="WhatsApp" />
        <div className="flex-1 flex overflow-hidden">
      {/* Sidebar - Lista de Conversas */}
      <div className={`${activeConv ? 'hidden md:flex' : 'flex'} w-full md:w-96 border-r flex-col bg-white dark:bg-slate-950 shrink-0 transition-all`}>
        <div className="p-4 border-b shrink-0">
          <h2 className="text-xl font-bold mb-4">Atendimentos</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input placeholder="Buscar conversas..." className="pl-9 w-full rounded-md border border-slate-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          {convLoading ? (
            <div className="p-4 text-center text-slate-500">Carregando contatos...</div>
          ) : conversations?.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <MessageSquare className="h-8 w-8 mb-4 opacity-20" />
              <p>Nenhuma conversa ativa.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {conversations?.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-center gap-3 p-4 border-b hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-left ${
                    activeConv?.id === conv.id ? 'bg-slate-100 dark:bg-slate-900 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    {conv.profile_pic_url ? (
                      <img src={conv.profile_pic_url} alt={conv.name || 'Contato'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {conv.name || conv.phone_number}
                      </h3>
                      <span className="text-xs text-slate-500 shrink-0">
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-slate-500 truncate mr-2">
                        {conv.phone_number}
                      </p>
                      {(() => {
                        const count = Array.isArray(conv.conversations) ? conv.conversations[0]?.unread_count : (conv.conversations as any)?.unread_count;
                        if (count && count > 0) {
                          return (
                            <span className="bg-orange-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full shrink-0">
                              {count}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Área de Chat */}
      <div className={`${!activeConv ? 'hidden md:flex' : 'flex'} flex-1 flex-col relative min-w-0 min-h-0 bg-slate-900 overflow-hidden`}>
        {/* Fundo Gradiente Orgânico para destacar o Glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 z-0">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 blur-[100px] rounded-full"></div>
        </div>

        {activeConv ? (
          <div className="flex-1 flex flex-col min-h-0 z-10">
            <div className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center px-6 shrink-0 justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveConv(null)}
                  className="md:hidden mr-2 p-2 -ml-2 text-white/70 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {activeConv.profile_pic_url ? (
                    <img src={activeConv.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-white/70" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate text-white">{activeConv.name || activeConv.phone_number}</h3>
                  <p className="text-xs text-white/60 truncate">{activeConv.phone_number}</p>
                </div>
              </div>
              <button
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className="p-2 text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors flex items-center justify-center"
                title={isRightPanelOpen ? "Minimizar painel de detalhes" : "Expandir painel de detalhes"}
              >
                {isRightPanelOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto min-h-0 flex flex-col gap-4">
              {messagesLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-white/50">
                  Carregando mensagens...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                  <p>O histórico de mensagens aparecerá aqui.</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMe = msg.sender_id !== activeConv.profile_id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[12px] border border-white/30 ${
                          isMe 
                            ? 'bg-white/15 text-white rounded-br-sm' 
                            : 'bg-black/20 text-slate-100 border-white/20 rounded-bl-sm'
                        }`}>
                          {renderMessageContent(msg.content)}
                          <div className={`text-[10px] text-right mt-2 font-medium tracking-wide ${isMe ? 'text-white/70' : 'text-white/50'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Digite uma mensagem..." 
                  disabled={isSending}
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/15 transition-all disabled:opacity-50" 
                />
                <button 
                  type="submit"
                  disabled={isSending || !messageInput.trim()}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl transition-all font-medium backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.1)] disabled:opacity-50 whitespace-nowrap flex items-center justify-center min-w-[100px]"
                >
                  {isSending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : "Enviar"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/50 min-h-0 z-10 relative">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center mb-6 shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
              <MessageSquare className="h-10 w-10 opacity-70 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">WhatsApp Web CRM</h2>
            <p className="max-w-md text-center px-4 text-white/70 leading-relaxed">
              Selecione uma conversa na lateral esquerda para visualizar o histórico de mensagens num ambiente de alta performance.
            </p>
          </div>
        )}
      </div>

      {/* Painel C - Detalhes do Lead (Apenas se tiver conversa ativa) */}
      {activeConv && isRightPanelOpen && (
        <div className="hidden lg:flex w-80 xl:w-96 shrink-0 border-l bg-white dark:bg-slate-950 z-20">
          <LeadDetailsPane activeConv={activeConv} />
        </div>
      )}

        </div>
      </main>
    </div>
  );
}
