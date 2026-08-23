import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  GitBranch, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  X, 
  Sparkles,
  Code2
} from 'lucide-react';

export type TicketPriority = 'alta' | 'media' | 'baixa';
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
  delivery_forecast: string;
  created_at: string;
  assigned_to?: string;
}

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
    description: 'Revisar vulnerabilidades de pacotes npm e atualizar bibliotecas do sistema.',
    module: 'Segurança & Infra',
    priority: 'baixa',
    main_status: 'a_executar',
    subcategory: 'nao_especificado',
    delivery_forecast: new Date(Date.now() + 432000000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    assigned_to: 'Desenvolvedor Ahut (CTO)'
  }
];

const LOCAL_STORAGE_KEY = 'ahut_crm_tech_tickets_v1';

export default function Tecnologia() {
  const [tickets, setTickets] = useState<TechTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TechTicket | null>(null);

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
    assigned_to: 'Desenvolvedor Ahut (CTO)'
  });

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setTickets(JSON.parse(saved));
      } catch {
        setTickets(INITIAL_TICKETS);
      }
    } else {
      setTickets(INITIAL_TICKETS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
    }
  }, []);

  const saveTickets = (updated: TechTicket[]) => {
    setTickets(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
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
      assigned_to: 'Desenvolvedor Ahut (CTO)'
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

  const handleSubmit = (e: React.FormEvent) => {
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

    saveTickets(updated);
    setIsModalOpen(false);
  };

  const handleDeleteTicket = (id: string) => {
    if (confirm('Deseja realmente excluir este chamado de tecnologia?')) {
      const updated = tickets.filter(t => t.id !== id);
      saveTickets(updated);
    }
  };

  const handleMoveTicket = (id: string, newMain: TicketMainStatus, newSub: TicketSubcategory) => {
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
    saveTickets(updated);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.module && t.module.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'todos' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const colAExecutar = filteredTickets.filter(t => t.main_status === 'a_executar');
  const colExecutando = filteredTickets.filter(t => t.main_status === 'executando');
  const colExecutado = filteredTickets.filter(t => t.main_status === 'executado');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0d1321] p-6 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <Monitor className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Tecnologia & Chamados de Sistema
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                Ahut System
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Kanban de acompanhamento de melhorias, desenvolvimento e updates
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleOpenAddModal()}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(14,165,233,0.2)] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Chamado
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d1321]/50 p-4 rounded-xl border border-gray-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por chamado, módulo ou detalhes..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-xs text-gray-200 focus:ring-1 focus:ring-sky-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="text-gray-400 h-4 w-4" />
          <span className="text-xs text-gray-400">Prioridade:</span>
          <select
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 outline-none focus:ring-1 focus:ring-sky-500"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="todos">Todas</option>
            <option value="alta">🔴 Alta Prioridade</option>
            <option value="media">🟡 Média Prioridade</option>
            <option value="baixa">🟢 Baixa Prioridade</option>
          </select>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Coluna A Executar */}
        <div className="bg-[#0d1321] border border-gray-800 rounded-2xl p-4 flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-gray-500"></span>
              <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">A Executar</h3>
              <span className="text-xs bg-gray-800 text-gray-400 font-mono px-2 py-0.5 rounded-full">
                {colAExecutar.length}
              </span>
            </div>
            <button onClick={() => handleOpenAddModal('a_executar')} className="text-gray-400 hover:text-white">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {colAExecutar.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} onEdit={handleOpenEditModal} onDelete={handleDeleteTicket} onMove={handleMoveTicket} />
            ))}
            {colAExecutar.length === 0 && (
              <div className="h-32 flex items-center justify-center border border-dashed border-gray-800 rounded-xl text-xs text-gray-600">
                Nenhum chamado pendente
              </div>
            )}
          </div>
        </div>

        {/* Coluna Executando */}
        <div className="bg-[#0d1321] border border-amber-500/20 rounded-2xl p-4 flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-400 animate-pulse"></span>
              <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider">Executando</h3>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full">
                {colExecutando.length}
              </span>
            </div>
            <button onClick={() => handleOpenAddModal('executando', 'em_planejamento')} className="text-amber-400 hover:text-white">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {/* Subcategoria: Em Planejamento */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider px-2 py-1 bg-sky-500/10 rounded-md border border-sky-500/20 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>Em Planejamento</span>
              </div>
              {colExecutando.filter(t => t.subcategory === 'em_planejamento').map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} onEdit={handleOpenEditModal} onDelete={handleDeleteTicket} onMove={handleMoveTicket} />
              ))}
            </div>

            {/* Subcategoria: Em Aplicação */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-2 py-1 bg-amber-500/10 rounded-md border border-amber-500/20 flex items-center gap-1.5">
                <Code2 className="h-3 w-3" />
                <span>Em Aplicação</span>
              </div>
              {colExecutando.filter(t => t.subcategory === 'em_aplicacao').map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} onEdit={handleOpenEditModal} onDelete={handleDeleteTicket} onMove={handleMoveTicket} />
              ))}
            </div>

            {/* Subcategoria: Em Validação */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider px-2 py-1 bg-purple-500/10 rounded-md border border-purple-500/20 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                <span>Em Validação</span>
              </div>
              {colExecutando.filter(t => t.subcategory === 'em_validacao').map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} onEdit={handleOpenEditModal} onDelete={handleDeleteTicket} onMove={handleMoveTicket} />
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Executado */}
        <div className="bg-[#0d1321] border border-emerald-500/20 rounded-2xl p-4 flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
              <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider">Executado</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full">
                {colExecutado.length}
              </span>
            </div>
            <button onClick={() => handleOpenAddModal('executado', 'atualizado')} className="text-emerald-400 hover:text-white">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {/* Subcategoria: Atualizado */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                <span>Atualizado</span>
              </div>
              {colExecutado.filter(t => t.subcategory === 'atualizado' || t.subcategory === 'nao_especificado').map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} onEdit={handleOpenEditModal} onDelete={handleDeleteTicket} onMove={handleMoveTicket} />
              ))}
            </div>

            {/* Subcategoria: Backup Realizado (GitHub) */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider px-2 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20 flex items-center gap-1.5">
                <GitBranch className="h-3 w-3" />
                <span>Backup Realizado (GitHub)</span>
              </div>
              {colExecutado.filter(t => t.subcategory === 'backup_realizado').map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} onEdit={handleOpenEditModal} onDelete={handleDeleteTicket} onMove={handleMoveTicket} />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d1321] border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                {editingTicket ? 'Editar Chamado' : 'Novo Chamado de Tecnologia'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium">Título do Chamado</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500 mt-1"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium">Descrição Técnica</label>
                <textarea
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500 mt-1 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-medium">Módulo</label>
                  <input
                    type="text"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white outline-none focus:border-sky-500 mt-1"
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium">Prioridade</label>
                  <select
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white outline-none focus:border-sky-500 mt-1"
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
                <div>
                  <label className="text-xs text-gray-400 font-medium">Coluna</label>
                  <select
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white outline-none focus:border-sky-500 mt-1"
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
                  <div>
                    <label className="text-xs text-gray-400 font-medium">Subcategoria</label>
                    <select
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white outline-none focus:border-sky-500 mt-1"
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

              <div>
                <label className="text-xs text-gray-400 font-medium">Previsão de Entrega</label>
                <input
                  type="date"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-sky-500 mt-1"
                  value={formData.delivery_forecast}
                  onChange={(e) => setFormData({ ...formData, delivery_forecast: e.target.value })}
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-500 text-slate-950 hover:bg-sky-400 rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  {editingTicket ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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

  const priorityStyles = {
    alta: 'bg-red-500/10 text-red-400 border-red-500/20',
    media: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    baixa: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }[ticket.priority];

  const priorityLabel = {
    alta: 'Alta Prioridade',
    media: 'Média Prioridade',
    baixa: 'Baixa Prioridade'
  }[ticket.priority];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Sem data';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 p-3.5 rounded-xl space-y-2.5 relative group">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${priorityStyles}`}>
          {priorityLabel}
        </span>

        <button onClick={() => setShowMenu(!showMenu)} className="text-gray-500 hover:text-gray-200">
          <MoreVertical className="h-4 w-4" />
        </button>

        {showMenu && (
          <div 
            className="absolute right-3 top-8 z-30 w-44 bg-gray-950 border border-gray-800 rounded-lg shadow-xl py-1 text-xs"
            onMouseLeave={() => setShowMenu(false)}
          >
            <button onClick={() => { onEdit(ticket); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-gray-300 hover:bg-gray-800 flex items-center gap-2">
              <Edit3 className="h-3 w-3" /> Editar
            </button>
            <div className="border-t border-gray-800 my-1" />
            <div className="px-3 py-0.5 text-[9px] uppercase text-gray-500 font-bold">Mover para:</div>
            <button onClick={() => { onMove(ticket.id, 'a_executar', 'nao_especificado'); setShowMenu(false); }} className="w-full text-left px-3 py-1 text-gray-400 text-[11px] hover:bg-gray-800">
              A Executar
            </button>
            <button onClick={() => { onMove(ticket.id, 'executando', 'em_planejamento'); setShowMenu(false); }} className="w-full text-left px-3 py-1 text-amber-400 text-[11px] hover:bg-gray-800">
              Em Planejamento
            </button>
            <button onClick={() => { onMove(ticket.id, 'executando', 'em_aplicacao'); setShowMenu(false); }} className="w-full text-left px-3 py-1 text-amber-400 text-[11px] hover:bg-gray-800">
              Em Aplicação
            </button>
            <button onClick={() => { onMove(ticket.id, 'executando', 'em_validacao'); setShowMenu(false); }} className="w-full text-left px-3 py-1 text-amber-400 text-[11px] hover:bg-gray-800">
              Em Validação
            </button>
            <button onClick={() => { onMove(ticket.id, 'executado', 'atualizado'); setShowMenu(false); }} className="w-full text-left px-3 py-1 text-emerald-400 text-[11px] hover:bg-gray-800">
              Atualizado
            </button>
            <button onClick={() => { onMove(ticket.id, 'executado', 'backup_realizado'); setShowMenu(false); }} className="w-full text-left px-3 py-1 text-indigo-400 text-[11px] hover:bg-gray-800">
              Backup realizado (GitHub)
            </button>
            <div className="border-t border-gray-800 my-1" />
            <button onClick={() => { onDelete(ticket.id); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-red-500/10 flex items-center gap-2">
              <Trash2 className="h-3 w-3" /> Excluir
            </button>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-bold text-gray-200 group-hover:text-sky-400 transition-colors">
          {ticket.title}
        </h4>
        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-snug">
          {ticket.description}
        </p>
      </div>

      <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[10px]">
        <span className="text-sky-400 font-medium flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
          <Calendar className="h-3 w-3" /> Previsão: {formatDate(ticket.delivery_forecast)}
        </span>
        <span className="text-gray-500 truncate max-w-[100px]">
          {ticket.assigned_to}
        </span>
      </div>
    </div>
  );
}
