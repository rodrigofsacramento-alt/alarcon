'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { 
  Monitor, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  PlayCircle, 
  PauseCircle, 
  Github, 
  Layers, 
  Tag, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  X, 
  ChevronRight, 
  Sparkles,
  Code2,
  Cpu,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

// Priority Types
export type TicketPriority = 'alta' | 'media' | 'baixa';

// Column & Subcategory Status Types
export type TicketMainStatus = 'a_executar' | 'executando' | 'executado';

export type TicketSubcategory = 
  | 'nao_especificado'
  | 'em_planejamento' 
  | 'em_aplicacao' 
  | 'em_validacao' 
  | 'atualizado' 
  | 'backup_realizado';

export interface TechTicket {
  id: string;
  title: string;
  description: string;
  module?: string;
  priority: TicketPriority;
  main_status: TicketMainStatus;
  subcategory: TicketSubcategory;
  delivery_forecast: string; // ISO date string (YYYY-MM-DD)
  created_at: string;
  assigned_to?: string;
}

// Initial Mock Tickets for rich first-run experience
const INITIAL_TICKETS: TechTicket[] = [
  {
    id: 'ticket-1',
    title: 'Cadastro de Usuário CTO & Níveis de Permissão',
    description: 'Adicionar novo perfil de acesso CTO (Desenvolvedor) com privilégios administrativos no sistema.',
    module: 'Autenticação & Permissões',
    priority: 'alta',
    main_status: 'executado',
    subcategory: 'backup_realizado',
    delivery_forecast: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    assigned_to: 'Desenvolvedor Ahut (CTO)'
  },
  {
    id: 'ticket-2',
    title: 'Módulo Tecnologia & Kanban de Atualizações',
    description: 'Criar página e fluxo visual Kanban para gestão de chamados do sistema divididos por subcategorias de status.',
    module: 'Frontend & UI',
    priority: 'alta',
    main_status: 'executando',
    subcategory: 'em_validacao',
    delivery_forecast: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    assigned_to: 'Desenvolvedor Ahut (CTO)'
  },
  {
    id: 'ticket-3',
    title: 'Otimização do Pipeline de Build e Purge LiteSpeed',
    description: 'Ajustar scripts de deploy para purgar automaticamente o cache e garantir carregamento limpo.',
    module: 'DevOps & VPS',
    priority: 'media',
    main_status: 'executando',
    subcategory: 'em_aplicacao',
    delivery_forecast: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    assigned_to: 'Desenvolvedor Ahut (CTO)'
  },
  {
    id: 'ticket-4',
    title: 'Refatoração da Arquitetura do Webhook WhatsApp Broker',
    description: 'Planejar nova rotina de conciliação de mensagens com envio assíncrono via fila Redis.',
    module: 'Backend & Webhooks',
    priority: 'alta',
    main_status: 'executando',
    subcategory: 'em_planejamento',
    delivery_forecast: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    assigned_to: 'Desenvolvedor Ahut (CTO)'
  },
  {
    id: 'ticket-5',
    title: 'Atualização de Dependências e Auditoria de Segurança',
    description: 'Revisar vulnerabilidades de pacotes npm e atualizar bibliotecas do Next.js.',
    module: 'Segurança & Infra',
    priority: 'baixa',
    main_status: 'a_executar',
    subcategory: 'nao_especificado',
    delivery_forecast: new Date(Date.now() + 432000000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    assigned_to: 'Desenvolvedor Ahut (CTO)'
  }
];

const LOCAL_STORAGE_KEY = 'ahut_technology_tickets_v2';

export default function TechnologyPage() {
  const { user, isAdmin } = useAuth();
  const [tickets, setTickets] = useState<TechTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TechTicket | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    module: string;
    priority: TicketPriority;
    main_status: TicketMainStatus;
    subcategory: TicketSubcategory;
    delivery_forecast: string;
    assigned_to: string;
  }>({
    title: '',
    description: '',
    module: 'Frontend',
    priority: 'media',
    main_status: 'a_executar',
    subcategory: 'nao_especificado',
    delivery_forecast: new Date().toISOString().split('T')[0],
    assigned_to: user?.name || 'Desenvolvedor Ahut (CTO)'
  });

  // Load Tickets
  useEffect(() => {
    async function loadTickets() {
      let loadedData: TechTicket[] = [];

      // 1. Try Supabase first
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('technology_tickets')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            loadedData = data;
          }
        } catch (e) {
          console.warn('Supabase technology_tickets table not available, using local cache:', e);
        }
      }

      // 2. Fallback to LocalStorage if empty or offline
      if (loadedData.length === 0) {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try {
            loadedData = JSON.parse(saved);
          } catch (e) {
            console.error('Error parsing local tickets:', e);
            loadedData = INITIAL_TICKETS;
          }
        } else {
          loadedData = INITIAL_TICKETS;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
        }
      }

      setTickets(loadedData);
      setLoading(false);
    }

    loadTickets();
  }, []);

  // Save changes to local storage & Supabase
  const saveTickets = async (updatedTickets: TechTicket[]) => {
    setTickets(updatedTickets);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTickets));

    if (supabase) {
      try {
        // Try bulk upsert if table exists
        await supabase.from('technology_tickets').upsert(updatedTickets);
      } catch (e) {
        console.warn('Could not sync to Supabase technology_tickets:', e);
      }
    }
  };

  const handleOpenAddModal = (defaultStatus: TicketMainStatus = 'a_executar', defaultSub: TicketSubcategory = 'nao_especificado') => {
    setEditingTicket(null);
    setFormData({
      title: '',
      description: '',
      module: 'Frontend',
      priority: 'media',
      main_status: defaultStatus,
      subcategory: defaultStatus === 'a_executar' ? 'nao_especificado' : defaultSub,
      delivery_forecast: new Date().toISOString().split('T')[0],
      assigned_to: user?.name || 'Desenvolvedor Ahut (CTO)'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ticket: TechTicket) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description,
      module: ticket.module || 'Geral',
      priority: ticket.priority,
      main_status: ticket.main_status,
      subcategory: ticket.subcategory,
      delivery_forecast: ticket.delivery_forecast || new Date().toISOString().split('T')[0],
      assigned_to: ticket.assigned_to || 'Desenvolvedor Ahut (CTO)'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    let updated: TechTicket[];

    if (editingTicket) {
      updated = tickets.map(t => t.id === editingTicket.id ? {
        ...t,
        title: formData.title,
        description: formData.description,
        module: formData.module,
        priority: formData.priority,
        main_status: formData.main_status,
        subcategory: formData.main_status === 'a_executar' ? 'nao_especificado' : formData.subcategory,
        delivery_forecast: formData.delivery_forecast,
        assigned_to: formData.assigned_to
      } : t);
    } else {
      const newTicket: TechTicket = {
        id: `ticket-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        module: formData.module,
        priority: formData.priority,
        main_status: formData.main_status,
        subcategory: formData.main_status === 'a_executar' ? 'nao_especificado' : formData.subcategory,
        delivery_forecast: formData.delivery_forecast,
        created_at: new Date().toISOString(),
        assigned_to: formData.assigned_to
      };
      updated = [newTicket, ...tickets];
    }

    await saveTickets(updated);
    setIsModalOpen(false);
  };

  const handleDeleteTicket = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este chamado de atualização?')) {
      const updated = tickets.filter(t => t.id !== id);
      await saveTickets(updated);
    }
  };

  const handleMoveTicket = async (id: string, newMain: TicketMainStatus, newSub: TicketSubcategory) => {
    const updated = tickets.map(t => {
      if (t.id === id) {
        return {
          ...t,
          main_status: newMain,
          subcategory: newMain === 'a_executar' ? 'nao_especificado' as TicketSubcategory : newSub
        };
      }
      return t;
    });
    await saveTickets(updated);
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.module && t.module.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriority = priorityFilter === 'todos' || t.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Column Buckets
  const colAExecutar = filteredTickets.filter(t => t.main_status === 'a_executar');
  const colExecutando = filteredTickets.filter(t => t.main_status === 'executando');
  const colExecutado = filteredTickets.filter(t => t.main_status === 'executado');

  // Counts for KPIs
  const highPriorityCount = tickets.filter(t => t.priority === 'alta' && t.main_status !== 'executado').length;
  const inProgressCount = tickets.filter(t => t.main_status === 'executando').length;
  const completedCount = tickets.filter(t => t.main_status === 'executado').length;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden sidebar-offset">
        <TopBar title="Tecnologia & Atualizações" />

        <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 space-y-6">
          
          {/* Header & KPI Summary */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
                  <Monitor className="size-6 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                    Painel de Tecnologia
                    <span className="text-xs font-semibold not-italic px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Ahut System v3.5
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Kanban de controle dos chamados e atualizações de sistema
                  </p>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
                <div className="size-2 rounded-full bg-amber-400 animate-ping" />
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Em Execução</p>
                  <p className="text-base font-black text-amber-400">{inProgressCount} chamados</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
                <div className="size-2 rounded-full bg-rose-500" />
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Alta Prioridade</p>
                  <p className="text-base font-black text-rose-500">{highPriorityCount} pendentes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
                <div className="size-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Concluídos</p>
                  <p className="text-base font-black text-emerald-400">{completedCount} entregas</p>
                </div>
              </div>

              <button
                onClick={() => handleOpenAddModal()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
              >
                <Plus size={16} />
                Novo Chamado
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Buscar chamado por título, descrição ou módulo..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="text-slate-500 ml-1" size={16} />
              <span className="text-xs text-slate-400 font-medium">Prioridade:</span>
              <select
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium outline-none focus:ring-2 focus:ring-blue-600"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="todos">Todas as Prioridades</option>
                <option value="alta">🔴 Alta Prioridade</option>
                <option value="media">🟡 Média Prioridade</option>
                <option value="baixa">🟢 Baixa Prioridade</option>
              </select>
            </div>
          </div>

          {/* KANBAN BOARD AREA */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-full min-w-[900px]">
              
              {/* COLUMN 1: A EXECUTAR */}
              <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-slate-500" />
                    <h3 className="font-black italic uppercase text-sm tracking-wider text-slate-200">A Executar</h3>
                    <span className="text-xs bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full">
                      {colAExecutar.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleOpenAddModal('a_executar', 'nao_especificado')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                    title="Adicionar chamado a executar"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {colAExecutar.map((ticket) => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket} 
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteTicket}
                      onMove={handleMoveTicket}
                    />
                  ))}

                  {colAExecutar.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/60 rounded-2xl text-slate-600 text-xs font-semibold">
                      Nenhum chamado pendente
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 2: EXECUTANDO */}
              <div className="flex flex-col h-full bg-slate-900/40 border border-amber-500/20 rounded-3xl overflow-hidden">
                <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-amber-500/5">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-amber-400 animate-pulse" />
                    <h3 className="font-black italic uppercase text-sm tracking-wider text-amber-400">Executando</h3>
                    <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      {colExecutando.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleOpenAddModal('executando', 'em_planejamento')}
                    className="p-1.5 text-amber-400 hover:text-white hover:bg-amber-500/20 rounded-lg transition-all"
                    title="Adicionar chamado em execução"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
                  
                  {/* Subcategory Group: Em Planejamento */}
                  <SubcategoryGroup 
                    title="Em Planejamento" 
                    icon={Clock}
                    colorClass="text-sky-400 border-sky-500/20 bg-sky-500/5"
                    tickets={colExecutando.filter(t => t.subcategory === 'em_planejamento')}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteTicket}
                    onMove={handleMoveTicket}
                    onAdd={() => handleOpenAddModal('executando', 'em_planejamento')}
                  />

                  {/* Subcategory Group: Em Aplicação */}
                  <SubcategoryGroup 
                    title="Em Aplicação" 
                    icon={Code2}
                    colorClass="text-amber-400 border-amber-500/20 bg-amber-500/5"
                    tickets={colExecutando.filter(t => t.subcategory === 'em_aplicacao')}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteTicket}
                    onMove={handleMoveTicket}
                    onAdd={() => handleOpenAddModal('executando', 'em_aplicacao')}
                  />

                  {/* Subcategory Group: Em Validação */}
                  <SubcategoryGroup 
                    title="Em Validação" 
                    icon={Sparkles}
                    colorClass="text-purple-400 border-purple-500/20 bg-purple-500/5"
                    tickets={colExecutando.filter(t => t.subcategory === 'em_validacao')}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteTicket}
                    onMove={handleMoveTicket}
                    onAdd={() => handleOpenAddModal('executando', 'em_validacao')}
                  />

                </div>
              </div>

              {/* COLUMN 3: EXECUTADO */}
              <div className="flex flex-col h-full bg-slate-900/40 border border-emerald-500/20 rounded-3xl overflow-hidden">
                <div className="p-4 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-500/5">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-emerald-400" />
                    <h3 className="font-black italic uppercase text-sm tracking-wider text-emerald-400">Executado</h3>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      {colExecutado.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleOpenAddModal('executado', 'atualizado')}
                    className="p-1.5 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-lg transition-all"
                    title="Adicionar chamado executado"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
                  
                  {/* Subcategory Group: Atualizado */}
                  <SubcategoryGroup 
                    title="Atualizado" 
                    icon={CheckCircle2}
                    colorClass="text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                    tickets={colExecutado.filter(t => t.subcategory === 'atualizado' || t.subcategory === 'nao_especificado')}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteTicket}
                    onMove={handleMoveTicket}
                    onAdd={() => handleOpenAddModal('executado', 'atualizado')}
                  />

                  {/* Subcategory Group: Backup Realizado (GitHub) */}
                  <SubcategoryGroup 
                    title="Backup Realizado (GitHub)" 
                    icon={Github}
                    colorClass="text-indigo-400 border-indigo-500/20 bg-indigo-500/5"
                    tickets={colExecutado.filter(t => t.subcategory === 'backup_realizado')}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteTicket}
                    onMove={handleMoveTicket}
                    onAdd={() => handleOpenAddModal('executado', 'backup_realizado')}
                  />

                </div>
              </div>

            </div>
          </div>

        </div>

        {/* MODAL CRIAR / EDITAR CHAMADO */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl overflow-hidden z-10"
              >
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-600/10 text-blue-400 rounded-xl">
                        <Monitor size={20} />
                      </div>
                      <h3 className="text-lg font-black italic uppercase text-white tracking-tight">
                        {editingTicket ? 'Editar Chamado' : 'Novo Chamado de Tecnologia'}
                      </h3>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Título da Atualização / Chamado
                      </label>
                      <input 
                        required
                        type="text"
                        placeholder="Ex: Implementar Webhook Redis para Atendimento"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Descrição Técnica & Escopo
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="Descreva os detalhes e requisitos da atualização..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Módulo Afetado
                        </label>
                        <input 
                          type="text"
                          placeholder="Ex: Frontend, Backend, IA"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-600"
                          value={formData.module}
                          onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Tag de Prioridade
                        </label>
                        <select 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-600"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                        >
                          <option value="alta">🔴 Alta Prioridade</option>
                          <option value="media">🟡 Média Prioridade</option>
                          <option value="baixa">🟢 Baixa Prioridade</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Coluna de Status
                        </label>
                        <select 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-600"
                          value={formData.main_status}
                          onChange={(e) => {
                            const newMain = e.target.value as TicketMainStatus;
                            let defaultSub: TicketSubcategory = 'nao_especificado';
                            if (newMain === 'executando') defaultSub = 'em_planejamento';
                            if (newMain === 'executado') defaultSub = 'atualizado';
                            setFormData({ ...formData, main_status: newMain, subcategory: defaultSub });
                          }}
                        >
                          <option value="a_executar">A Executar</option>
                          <option value="executando">Executando</option>
                          <option value="executado">Executado</option>
                        </select>
                      </div>

                      {formData.main_status !== 'a_executar' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Subcategoria de Status
                          </label>
                          <select 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-600"
                            value={formData.subcategory}
                            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value as TicketSubcategory })}
                          >
                            {formData.main_status === 'executando' && (
                              <>
                                <option value="em_planejamento">Em Planejamento</option>
                                <option value="em_aplicacao">Em Aplicação</option>
                                <option value="em_validacao">Em Validação</option>
                              </>
                            )}
                            {formData.main_status === 'executado' && (
                              <>
                                <option value="atualizado">Atualizado</option>
                                <option value="backup_realizado">Backup realizado (GitHub)</option>
                              </>
                            )}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Previsão de Entrega
                      </label>
                      <input 
                        type="date"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-blue-600"
                        value={formData.delivery_forecast}
                        onChange={(e) => setFormData({ ...formData, delivery_forecast: e.target.value })}
                      />
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-5 py-3 bg-slate-800 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-wider hover:text-white transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                      >
                        {editingTicket ? 'Salvar Alterações' : 'Criar Chamado'}
                      </button>
                    </div>

                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Subcategory Group Wrapper
function SubcategoryGroup({
  title,
  icon: Icon,
  colorClass,
  tickets,
  onEdit,
  onDelete,
  onMove,
  onAdd
}: {
  title: string;
  icon: any;
  colorClass: string;
  tickets: TechTicket[];
  onEdit: (t: TechTicket) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, main: TicketMainStatus, sub: TicketSubcategory) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className={cn("flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider", colorClass)}>
        <div className="flex items-center gap-1.5">
          <Icon size={14} />
          <span>{title}</span>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-950/40">
          {tickets.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {tickets.map(ticket => (
          <TicketCard 
            key={ticket.id} 
            ticket={ticket} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onMove={onMove} 
          />
        ))}

        {tickets.length === 0 && (
          <div className="p-3 text-center border border-dashed border-slate-800/40 rounded-xl text-[11px] text-slate-600 italic">
            Sem chamados nesta subcategoria
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Ticket Card Component
function TicketCard({
  ticket,
  onEdit,
  onDelete,
  onMove
}: {
  ticket: TechTicket;
  onEdit: (t: TechTicket) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, main: TicketMainStatus, sub: TicketSubcategory) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  // Formatting date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Sem previsão';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Priority Styles
  const priorityBadge = {
    alta: { label: 'Alta Prioridade', class: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    media: { label: 'Média Prioridade', class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    baixa: { label: 'Baixa Prioridade', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
  }[ticket.priority];

  return (
    <div className="group relative bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl shadow-lg transition-all space-y-3">
      
      {/* Top Tag Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border", priorityBadge.class)}>
            {priorityBadge.label}
          </span>
          {ticket.module && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/50">
              {ticket.module}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <div 
              className="absolute right-0 top-6 z-20 w-44 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 text-xs"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button 
                onClick={() => { onEdit(ticket); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-900 text-slate-300 flex items-center gap-2"
              >
                <Edit3 size={12} />
                Editar Chamado
              </button>
              
              <div className="border-t border-slate-800 my-1" />
              
              <div className="px-3 py-1 text-[9px] font-black uppercase text-slate-500">Mover para:</div>
              <button 
                onClick={() => { onMove(ticket.id, 'a_executar', 'nao_especificado'); setShowMenu(false); }}
                className="w-full text-left px-3 py-1 hover:bg-slate-900 text-slate-400 text-[11px]"
              >
                A Executar
              </button>
              <button 
                onClick={() => { onMove(ticket.id, 'executando', 'em_planejamento'); setShowMenu(false); }}
                className="w-full text-left px-3 py-1 hover:bg-slate-900 text-amber-400 text-[11px]"
              >
                Em Planejamento
              </button>
              <button 
                onClick={() => { onMove(ticket.id, 'executando', 'em_aplicacao'); setShowMenu(false); }}
                className="w-full text-left px-3 py-1 hover:bg-slate-900 text-amber-400 text-[11px]"
              >
                Em Aplicação
              </button>
              <button 
                onClick={() => { onMove(ticket.id, 'executando', 'em_validacao'); setShowMenu(false); }}
                className="w-full text-left px-3 py-1 hover:bg-slate-900 text-amber-400 text-[11px]"
              >
                Em Validação
              </button>
              <button 
                onClick={() => { onMove(ticket.id, 'executado', 'atualizado'); setShowMenu(false); }}
                className="w-full text-left px-3 py-1 hover:bg-slate-900 text-emerald-400 text-[11px]"
              >
                Atualizado
              </button>
              <button 
                onClick={() => { onMove(ticket.id, 'executado', 'backup_realizado'); setShowMenu(false); }}
                className="w-full text-left px-3 py-1 hover:bg-slate-900 text-indigo-400 text-[11px]"
              >
                Backup realizado (GitHub)
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button 
                onClick={() => { onDelete(ticket.id); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-rose-500/10 text-rose-400 flex items-center gap-2"
              >
                <Trash2 size={12} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2">
          {ticket.title}
        </h4>
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {ticket.description}
        </p>
      </div>

      {/* Footer: Previsão de Entrega & Dev */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5 text-blue-400 font-semibold bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
          <Calendar size={12} />
          <span>Previsão: {formatDate(ticket.delivery_forecast)}</span>
        </div>

        {ticket.assigned_to && (
          <span className="text-slate-500 font-medium truncate max-w-[120px]">
            {ticket.assigned_to}
          </span>
        )}
      </div>

    </div>
  );
}
