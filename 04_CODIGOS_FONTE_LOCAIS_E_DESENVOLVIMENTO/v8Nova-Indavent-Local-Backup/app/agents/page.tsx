'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { 
  Bot, 
  Cpu, 
  Zap, 
  FileText, 
  Users, 
  MessageSquare, 
  Truck, 
  Loader2, 
  Search,
  CheckCircle2,
  Brain,
  Sparkles,
  ChevronRight,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'analyzing' | 'completed';
  lastActivity: string;
  icon: any;
  color: string;
  progress: number;
  stats: { label: string, value: string }[];
}

const initialAgents: Agent[] = [
  {
    id: 'prop-gen',
    name: 'Prop-Gen Alpha',
    role: 'Gerador de Propostas',
    status: 'working',
    lastActivity: 'Analisando requisitos da Globex',
    icon: FileText,
    color: 'blue',
    progress: 65,
    stats: [
      { label: 'Propostas Hoje', value: '12' },
      { label: 'Taxa Alt.', value: '98%' }
    ]
  },
  {
    id: 'lead-gen',
    name: 'Lead-Finder Pro',
    role: 'Gerador de Listas',
    status: 'analyzing',
    lastActivity: 'Scraping LinkedIn para setor industrial',
    icon: Search,
    color: 'emerald',
    progress: 42,
    stats: [
      { label: 'Leads Encontrados', value: '142' },
      { label: 'Qualificação', value: 'Alta' }
    ]
  },
  {
    id: 'follow-up',
    name: 'Engagement Bot',
    role: 'Follow-ups Automáticos',
    status: 'idle',
    lastActivity: 'Aguardando gatilho de inatividade',
    icon: MessageSquare,
    color: 'amber',
    progress: 0,
    stats: [
      { label: 'Mensagens Enviadas', value: '89' },
      { label: 'Engajamento', value: '24%' }
    ]
  },
  {
    id: 'freight-bot',
    name: 'Logi-Quote AI',
    role: 'Cotador de Frete',
    status: 'completed',
    lastActivity: 'Cotação finalizada para rota SP -> RJ',
    icon: Truck,
    color: 'purple',
    progress: 100,
    stats: [
      { label: 'Cotações Realizadas', value: '45' },
      { label: 'Economia Estimada', value: 'R$ 1.2k' }
    ]
  }
];

const activityLogs = [
  { id: 1, agent: 'Prop-Gen Alpha', action: 'Gerou proposta personalizada', target: 'TechSolutions Ltd', time: 'Agora' },
  { id: 2, agent: 'Lead-Finder Pro', action: 'Adicionou 15 novos leads', target: 'Campanha Q4', time: '2 min atrás' },
  { id: 3, agent: 'Logi-Quote AI', action: 'Otimizou rota de entrega', target: 'Pedido #4582', time: '10 min atrás' },
  { id: 4, agent: 'Engagement Bot', action: 'Follow-up enviado via WhatsApp', target: 'Marcos Oliveira', time: '15 min atrás' },
  { id: 5, agent: 'Prop-Gen Alpha', action: 'Análise de ROI concluída', target: 'Globex Corp', time: '1 hora atrás' },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [activeTab, setActiveTab] = useState<'office' | 'logs'>('office');

  // Simular progresso e mudanças de status
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.status === 'working' || agent.status === 'analyzing') {
          const newProgress = (agent.progress + Math.random() * 5) % 101;
          return { 
            ...agent, 
            progress: Math.floor(newProgress),
            status: newProgress > 95 ? 'completed' : agent.status 
          };
        } else if (agent.status === 'completed' && Math.random() > 0.8) {
          return { ...agent, status: 'idle', progress: 0 };
        } else if (agent.status === 'idle' && Math.random() > 0.8) {
          return { ...agent, status: 'working', progress: 10 };
        }
        return agent;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden sidebar-offset">
        <TopBar title="Escritório de IA" />
        
        <div className="p-4 sm:p-8 space-y-8 bg-white overflow-y-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-blue-600 size-2 rounded-full animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Sistemas Autônomos Ativos</p>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 italic uppercase">
                AI <span className="text-blue-600 not-italic">Squad Office</span>
              </h1>
              <p className="text-slate-500 font-medium text-xs mt-1">Visualize e monitore seus agentes de inteligência artificial em tempo real.</p>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('office')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  activeTab === 'office' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Escritório
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  activeTab === 'logs' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Logs Globais
              </button>
            </div>
            
            <button 
              onClick={() => window.location.href = '/agents/proposals/office'}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
            >
              <Sparkles size={16} />
              Visualizar Escritório Digital
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'office' ? (
              <motion.div 
                key="office-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {agents.map((agent) => (
                  <div 
                    key={agent.id} 
                    onClick={() => {
                      if (agent.id === 'prop-gen') window.location.href = '/agents/proposals';
                    }}
                    className="cursor-pointer"
                  >
                    <AgentCard agent={agent} />
                  </div>
                ))}

                {/* Status Geral / Central de Comando */}
                <div className="md:col-span-2 lg:col-span-4 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Brain size={120} />
                  </div>
                  
                  <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center lg:items-start text-center lg:text-left">
                    <div className="size-20 bg-blue-600/20 rounded-3xl flex items-center justify-center border border-blue-500/30">
                      <Cpu className="text-blue-500" size={40} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black italic uppercase tracking-tight">Status do Núcleo Central</h3>
                      <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">
                        A infraestrutura de IA da Indavent está operando com eficiência máxima. 
                        Todos os modelos proprietários (Llama 3, GPT-4o e Gemini) estão sincronizados e distribuindo tarefas entre os squads.
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {[
                          { label: 'Uso de CPU', value: '24%', icon: Activity },
                          { label: 'Tokens/Min', value: '4.2k', icon: Zap },
                          { label: 'Eficiência', value: '99.9%', icon: CheckCircle2 },
                          { label: 'Agentes On', value: '4 / 4', icon: Bot },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2 text-slate-500">
                              <stat.icon size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <div className="text-xl font-black text-white">{stat.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="logs-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black italic uppercase text-slate-900">Histórico de Atividade da IA</h3>
                  <Activity className="text-blue-600" size={20} />
                </div>
                <div className="divide-y divide-slate-100">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                      <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Activity size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-bold text-slate-900">{log.agent}</p>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.time}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {log.action} para <span className="font-bold text-blue-600">{log.target}</span>
                        </p>
                      </div>
                      <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="text-slate-400" size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const getStatusColor = () => {
    switch (agent.status) {
      case 'working': return 'text-blue-500';
      case 'analyzing': return 'text-emerald-500';
      case 'completed': return 'text-purple-500';
      default: return 'text-slate-400';
    }
  };

  const getStatusText = () => {
    switch (agent.status) {
      case 'working': return 'Emitindo...';
      case 'analyzing': return 'Analisando...';
      case 'completed': return 'Concluído';
      default: return 'Em Espera';
    }
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all">
      <div className="flex flex-col h-full">
        {/* Card Header */}
        <div className="flex justify-between items-start mb-6">
          <div className={cn(
            "size-14 rounded-2xl flex items-center justify-center transition-all",
            agent.status === 'working' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : 
            agent.status === 'analyzing' ? "bg-emerald-600 text-white" :
            agent.status === 'completed' ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-400"
          )}>
            <agent.icon size={28} />
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
            agent.status === 'working' ? "bg-blue-50 text-blue-600 border-blue-100" : 
            agent.status === 'analyzing' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
            agent.status === 'completed' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-slate-50 text-slate-400 border-slate-100"
          )}>
            {getStatusText()}
          </div>
        </div>

        {/* Agent Info */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic tracking-tight">{agent.name}</h3>
          <p className="text-[10px] font-black italic uppercase tracking-widest text-slate-400 opacity-70 mb-2">{agent.role}</p>
          <div className="flex items-center gap-2 mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            {agent.status === 'working' || agent.status === 'analyzing' ? (
              <Loader2 className="animate-spin text-blue-600" size={14} />
            ) : (
              <Activity className="text-slate-400" size={14} />
            )}
            <p className="text-[11px] font-medium text-slate-600 truncate">{agent.lastActivity}</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-auto space-y-4">
          {(agent.status === 'working' || agent.status === 'analyzing') && (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Execução</span>
                <span className="text-xs font-black text-slate-900">{agent.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${agent.progress}%` }}
                  className="h-full bg-blue-600"
                />
              </div>
            </div>
          )}

          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            {agent.stats.map((stat, i) => (
              <div key={i}>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
                <p className="text-sm font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
          
          <button className="w-full py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Sparkles size={14} />
            Ver Processamento
          </button>
        </div>
      </div>
    </div>
  );
}
