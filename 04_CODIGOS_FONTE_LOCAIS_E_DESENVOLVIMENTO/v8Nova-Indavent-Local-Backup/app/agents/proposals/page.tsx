'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  User, 
  FileText, 
  Cpu, 
  Activity, 
  Zap, 
  ChevronLeft,
  Layout,
  MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const squadAgents = [
  {
    id: 1,
    name: 'Ricardo Mendes',
    role: 'Mapeamento de Requisitos',
    function: 'Mapeamento de itens da Tabela TAB20 e quantidades.',
    task: 'Mapeando Tabela TAB20 (Ex: TAB20G70) para orçamento Drywall.',
    status: 'completed',
    icon: User,
    color: 'blue'
  },
  {
    id: 2,
    name: 'Camila Souza',
    role: 'Especialista em Soluções',
    function: 'Cálculo de valores unitários e provisionamento de frete regional.',
    task: 'Processando valores unitários e provisionando frete padrão de R$ 490,00.',
    status: 'working',
    icon: Layout,
    color: 'emerald'
  },
  {
    id: 3,
    name: 'Fernando Lima',
    role: 'Gerador de Propostas',
    function: 'Consolidação final, regra 30/60/90 e geração de PDF.',
    task: 'Compilando PDF Final com regra 30/60/90 e validade de 10 dias.',
    status: 'idle',
    icon: FileText,
    color: 'amber'
  }
];

export default function ProposalSquadPage() {
  const [agents, setAgents] = useState(squadAgents);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden sidebar-offset">
        <TopBar title="Esquadrão de Propostas" />
        
        <div className="p-4 sm:p-8 space-y-8 bg-white overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <button 
                onClick={() => window.location.href = '/agents'}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all font-black uppercase text-[10px] tracking-widest mb-4"
              >
                <ChevronLeft size={16} /> Voltar ao Escritório
              </button>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 italic uppercase">
                Squad: <span className="text-blue-600 not-italic">Gerador de Propostas</span>
              </h1>
              <p className="text-slate-500 font-medium text-xs mt-1 lowercase italic">Monitoramento do fluxo de trabalho e delegação de funções.</p>
            </div>
            
            <button 
              onClick={() => window.location.href = '/agents/proposals/office'}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 group"
            >
              <Activity size={18} className="group-hover:animate-pulse" />
              Visualizar Squad (Office)
            </button>
          </div>

          {/* Execution Pipeline */}
          <div className="relative space-y-12">
            {/* Background Line */}
            <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-slate-100 hidden md:block" />

            <AnimatePresence>
              {agents.map((agent, index) => (
                <motion.div 
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative flex flex-col md:flex-row gap-8"
                >
                  {/* Step Indicator */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={cn(
                      "size-20 rounded-3xl flex items-center justify-center border-2 transition-all shadow-2xl",
                      agent.status === 'completed' ? "bg-emerald-500 border-emerald-400 text-white" : 
                      agent.status === 'working' ? "bg-blue-600 border-blue-400 text-white animate-pulse" : 
                      "bg-white border-slate-200 text-slate-400"
                    )}>
                      {agent.status === 'completed' ? <CheckCircle2 size={32} /> : 
                       agent.status === 'working' ? <Loader2 className="animate-spin" size={32} /> : 
                       <agent.icon size={32} />}
                    </div>
                    <div className="mt-4 bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                       Etapa {index + 1}
                    </div>
                  </div>

                  {/* Agent Card */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:border-blue-500/30 transition-all group relative overflow-hidden">
                    <div className={cn(
                      "absolute top-0 right-0 w-1 h-full",
                      agent.status === 'completed' ? "bg-emerald-500" : 
                      agent.status === 'working' ? "bg-blue-600" : "bg-slate-200"
                    )} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-1 space-y-4">
                        <div>
                          <p className="text-[10px] font-black italic uppercase tracking-widest text-blue-600 mb-1">{agent.role}</p>
                          <h3 className="text-xl font-black text-slate-900 truncate">{agent.name}</h3>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Responsabilidade</p>
                           <p className="text-sm font-medium text-slate-600 leading-relaxed">{agent.function}</p>
                        </div>
                      </div>

                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl relative">
                          <div className="flex items-center gap-3 mb-3">
                            <Activity size={16} className="text-blue-500" />
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Atividade em Tempo Real</p>
                          </div>
                          <p className="text-sm font-bold text-slate-800 italic shrink-0">
                            "{agent.task}"
                          </p>
                          
                          {agent.status === 'working' && (
                            <div className="mt-4 space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                                <span>Processando Dados da Etapa 1</span>
                                <span className="text-blue-600">65%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '65%' }}
                                  className="h-full bg-blue-600"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4">
                          {[
                            { label: 'SLA Entrega', value: '45min', icon: Clock },
                            { label: 'Uso CPU', value: '18%', icon: Cpu },
                            { label: 'Prioridade', value: 'Alta', icon: Zap },
                          ].map((stat) => (
                            <div key={stat.label} className="bg-white border border-slate-100 px-4 py-2 rounded-xl flex items-center gap-3">
                              <stat.icon size={14} className="text-slate-400" />
                              <div className="text-left">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-[11px] font-bold text-slate-900">{stat.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sequential Transition Arrow */}
                    {index < squadAgents.length - 1 && (
                      <div className="absolute -bottom-10 left-10 md:hidden flex justify-center w-8">
                        <ArrowRight size={24} className="text-slate-300 rotate-90" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Global Pipeline Status */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap size={100} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <h4 className="text-xl font-black italic uppercase tracking-tight mb-2">Resumo da Execução Sequencial</h4>
                  <p className="text-slate-400 text-sm max-w-xl">
                    Cada agente opera dentro de sua responsabilidade estrita. O Agent 1 não interfere no Agent 2. 
                    O fluxo de dados é validado pelo núcleo de IA antes da entrega final.
                  </p>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-center">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Previsão Conclusão</p>
                      <p className="text-2xl font-black">~12 min</p>
                   </div>
                   <div className="size-px h-12 bg-slate-800" />
                   <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                      Pausar Fluxo
                   </button>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
