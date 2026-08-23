import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isInternal, getAgentLabel } from '../utils/auth';
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Video, 
  Search, 
  Calendar,
  Clock,
  Check,
  CheckCheck,
  Activity
} from 'lucide-react';

interface Mensagem {
  id: string;
  sender: string;
  senderName?: string;
  department?: string;
  text: string;
  timestamp: string;
  status: 'read' | 'delivered' | 'sent';
}

interface ChatThread {
  id: string;
  pacienteNome: string;
  ultimoTexto: string;
  timestamp: string;
  unread: boolean;
  mensagens: Mensagem[];
  tipoConsulta: string;
  telefone: string;
}

const initialThreads: ChatThread[] = [
  {
    id: '1',
    pacienteNome: 'Mariana Silva',
    ultimoTexto: 'Confirmado! Estarei na clínica às 09:00.',
    timestamp: '09:12',
    unread: false,
    tipoConsulta: 'Cardiologia',
    telefone: '(11) 98765-4321',
    mensagens: [
      { id: '1a', sender: 'medico', text: 'Olá Mariana, aqui é do consultório do Dr. Gustavo Rocha. Lembrete de sua consulta agendada para amanhã, 25/07 às 09:00. Confirma seu comparecimento?', timestamp: 'Ontem', status: 'read' },
      { id: '1b', sender: 'paciente', text: 'Confirmado! Estarei na clínica às 09:00.', timestamp: '09:12', status: 'read' },
    ]
  },
  {
    id: '2',
    pacienteNome: 'Carlos Eduardo',
    ultimoTexto: 'Dr. Gustavo, posso adiantar a consulta pós-cirúrgica?',
    timestamp: 'Ontem',
    unread: true,
    tipoConsulta: 'Retorno Pós-Cirúrgico',
    telefone: '(11) 97654-3210',
    mensagens: [
      { id: '2a', sender: 'medico', text: 'Olá Carlos, tudo bem? Como está a cicatrização da cirurgia?', timestamp: 'Ontem', status: 'read' },
      { id: '2b', sender: 'paciente', text: 'Tudo bem! Dr. Gustavo, posso adiantar a consulta pós-cirúrgica?', timestamp: 'Ontem', status: 'read' },
    ]
  },
  {
    id: '3',
    pacienteNome: 'Beatriz Santos',
    ultimoTexto: 'Enviei os exames de sangue em anexo.',
    timestamp: '22/07',
    unread: false,
    tipoConsulta: 'Dermatologia - Avaliação',
    telefone: '(11) 96543-2109',
    mensagens: [
      { id: '3a', sender: 'paciente', text: 'Oi, bom dia! Segue o resultado dos exames.', timestamp: '22/07', status: 'read' },
      { id: '3b', sender: 'paciente', text: 'Enviei os exames de sangue em anexo.', timestamp: '22/07', status: 'read' },
      { id: '3c', sender: 'medico', text: 'Recebido, Beatriz. Vou analisar e conversamos na nossa consulta agendada.', timestamp: '22/07', status: 'read' }
    ]
  }
];

export default function Atendimento() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { pacienteId?: string; pacienteNome?: string } | null;

  const [threads, setThreads] = useState<ChatThread[]>(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('1');
  const [inputMsg, setInputMsg] = useState('');

  // Handle transition from Pacientes screen (if any)
  useEffect(() => {
    if (state?.pacienteId) {
      const threadExists = threads.find(t => t.id === state.pacienteId);
      if (threadExists) {
        setSelectedThreadId(state.pacienteId);
      } else {
        // Create new dynamic thread
        const newThread: ChatThread = {
          id: state.pacienteId,
          pacienteNome: state.pacienteNome || 'Novo Paciente',
          ultimoTexto: 'Iniciando chat...',
          timestamp: 'Agora',
          unread: false,
          tipoConsulta: 'Consulta Geral',
          telefone: 'WhatsApp Ativo',
          mensagens: [
            { id: 'new-1', sender: 'medico', text: `Olá ${state.pacienteNome}, como posso ajudar hoje?`, timestamp: 'Agora', status: 'sent' }
          ]
        };
        setThreads([newThread, ...threads]);
        setSelectedThreadId(state.pacienteId);
      }
    }
  }, [state]);

  const activeThread = threads.find(t => t.id === selectedThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: Mensagem = {
      id: String(Date.now()),
      sender: 'medico',
      text: inputMsg,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    const updatedThreads = threads.map(t => {
      if (t.id === selectedThreadId) {
        return {
          ...t,
          ultimoTexto: inputMsg,
          timestamp: newMsg.timestamp,
          mensagens: [...t.mensagens, newMsg]
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setInputMsg('');

    // Simulate response delay from patient
    setTimeout(() => {
      const responseMsg: Mensagem = {
        id: String(Date.now() + 1),
        sender: 'paciente',
        text: 'Obrigado pelo retorno rápido, Dr. Gustavo! Vou aguardar.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };

      setThreads(prevThreads => prevThreads.map(t => {
        if (t.id === selectedThreadId) {
          return {
            ...t,
            ultimoTexto: responseMsg.text,
            timestamp: responseMsg.timestamp,
            mensagens: [...t.mensagens, responseMsg]
          };
        }
        return t;
      }));
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] w-full flex bg-[#0d1321]/60 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl">
      
      {/* LEFT COLUMN: Threads & Back button */}
      <div className="w-80 border-r border-gray-800 flex flex-col h-full bg-[#0d1321]/40 shrink-0">
        
        {/* CRITICAL BACK BUTTON FOR AGENTS/PHYSICIANS */}
        <div className="p-4 border-b border-gray-800 flex flex-col gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-wider group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Painel Geral
          </button>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input 
              type="text" 
              placeholder="Buscar conversas..."
              className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-600 outline-none transition-all"
            />
          </div>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-900/40">
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => setSelectedThreadId(thread.id)}
              className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                thread.id === selectedThreadId 
                  ? 'bg-sky-500/5 border-l-2 border-sky-500' 
                  : 'hover:bg-gray-800/10'
              }`}
            >
              <div className="h-9 w-9 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold shrink-0">
                {thread.pacienteNome.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-xs text-gray-200 truncate">{thread.pacienteNome}</h4>
                  <span className="text-[9px] text-gray-500">{thread.timestamp}</span>
                </div>
                <p className="text-[10px] text-sky-400/90 font-medium truncate mt-0.5">{thread.tipoConsulta}</p>
                <p className="text-[10px] text-gray-500 truncate mt-1">{thread.ultimoTexto}</p>
              </div>
              {thread.unread && (
                <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0 mt-1.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CENTER COLUMN: Chat Thread */}
      <div className="flex-1 flex flex-col h-full bg-[#070b13]/30">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-800 px-6 flex items-center justify-between shrink-0 bg-[#0d1321]/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-teal-500/15 text-teal-400 flex items-center justify-center font-bold">
              {activeThread.pacienteNome.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">{activeThread.pacienteNome}</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">{activeThread.telefone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-sky-400 hover:bg-gray-800/40 rounded-xl transition-all">
              <Phone className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-sky-400 hover:bg-gray-800/40 rounded-xl transition-all">
              <Video className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col justify-end">
          <div className="space-y-4">
            {activeThread.mensagens.map(msg => {
              const isAgent = isInternal(msg.sender);
              const agentLabel = getAgentLabel(msg.senderName || '', msg.department);
              return (
                <div key={msg.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3.5 text-xs relative ${
                    isAgent 
                      ? 'bubble-agent rounded-2xl rounded-br-none' 
                      : 'bg-gray-800/50 border border-gray-800 text-gray-300 rounded-2xl rounded-tl-none'
                  }`}>
                    {isAgent && (
                      <span className="text-[10px] font-semibold text-gray-500 mr-1 mb-0.5 max-w-[300px] truncate block text-right">
                        {agentLabel}
                      </span>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[9px] text-gray-500">
                      <span>{msg.timestamp}</span>
                      {isAgent && (
                        msg.status === 'read' ? (
                          <CheckCheck className="h-3 w-3 text-sky-400" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 shrink-0 bg-[#0d1321]/30">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Digite uma mensagem ou selecione um modelo de envio..."
              className="flex-1 bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 outline-none transition-all"
            />
            <button
              type="submit"
              className="p-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all shadow-[0_2px_10px_rgba(14,165,233,0.2)]"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Patient Medical Summary Card */}
      <div className="w-64 border-l border-gray-800 bg-[#0d1321]/40 h-full p-6 shrink-0 flex flex-col gap-6 overflow-y-auto">
        <div className="text-center space-y-2 border-b border-gray-800/60 pb-6">
          <div className="h-16 w-16 mx-auto bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center font-bold text-lg border border-sky-500/20">
            {activeThread.pacienteNome.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{activeThread.pacienteNome}</h3>
            <span className="text-[10px] text-gray-500 block">Ficha Clínica Ativa</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Tratamento</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold">
              <Activity className="h-3.5 w-3.5 text-sky-400" />
              {activeThread.tipoConsulta}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Próxima Consulta</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold">
              <Calendar className="h-3.5 w-3.5 text-teal-400" />
              Amanhã, 25/07
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              09:00 às 09:30
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-gray-800/60 pt-6">
          <button
            onClick={() => navigate('/agenda')}
            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4 text-sky-400" />
            Remarcar Consulta
          </button>
        </div>
      </div>
    </div>
  );
}
