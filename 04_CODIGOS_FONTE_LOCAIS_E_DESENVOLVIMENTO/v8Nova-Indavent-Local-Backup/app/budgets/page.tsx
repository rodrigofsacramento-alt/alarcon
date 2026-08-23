'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Search, 
  Filter, 
  ChevronRight, 
  User, 
  Truck, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  ExternalLink,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function BudgetsPage() {
  const { user, profile, isAdmin } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'lead' | 'freight'>('details');

  useEffect(() => {
    fetchBudgets();
  }, [user, isAdmin, profile]);

  const fetchBudgets = async () => {
    if (!supabase || !user) return;
    setIsLoading(true);
    try {
      // Fetch budgets with lead information
      let query = supabase
        .from('orcamentos')
        .select(`
          *,
          leads:lead_id (*)
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin && profile) {
        // If not admin, only show budgets for leads assigned to this salesperson
        // Note: This requires lead filtering logic similar to LeadsPage
        // For simplicity, we assume the relationship handles it or we filter here
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) setBudgets(data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      const matchesSearch = 
        (b.codigo?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.leads?.Nome?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.client_data?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'Todos' || b.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [budgets, searchTerm, statusFilter]);

  const openBudgetDetail = (budget: any) => {
    setSelectedBudget(budget);
    setIsDetailModalOpen(true);
    setActiveTab('details');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30 text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden sidebar-offset">
        <TopBar title="Orçamentos & Propostas" />
        
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
                Central de Orçamentos
                <span className="ml-3 text-slate-500 text-lg font-normal">({filteredBudgets.length})</span>
              </h1>
              <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.2em]">Gestão de Propostas, Leads e Logística</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative group flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por código ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-600 font-medium text-sm"
                />
              </div>
              <button className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Budget Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-slate-900/40 border border-slate-800 animate-pulse rounded-3xl" />
              ))
            ) : filteredBudgets.map((budget) => (
              <motion.div 
                layout
                key={budget.id}
                onClick={() => openBudgetDetail(budget)}
                className="group relative bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 hover:border-blue-500/30 hover:bg-slate-900/60 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 font-black text-4xl text-white/5 group-hover:text-blue-500/10 transition-colors select-none">
                  #{budget.codigo?.slice(-4)}
                </div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{budget.codigo || 'S/ CÓDIGO'}</span>
                    <h3 className="text-xl font-bold text-white truncate max-w-[200px]">{budget.client_data?.name || budget.leads?.Nome || 'Cliente não identificado'}</h3>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    budget.status === 'Gerado' ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                  )}>
                    {budget.status}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-slate-400">
                    <User size={16} className="text-slate-600" />
                    <span className="text-xs font-semibold">{budget.leads?.Vendedor || 'Sem Vendedor'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Clock size={16} className="text-slate-600" />
                    <span className="text-xs font-semibold">{new Date(budget.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Valor Total</p>
                    <p className="text-lg font-black text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.total_value)}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>

          {filteredBudgets.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-slate-900/20 rounded-[40px] border border-dashed border-slate-800">
              <Calculator size={48} className="mx-auto text-slate-800 mb-4" />
              <p className="text-slate-500 font-bold">Nenhum orçamento encontrado</p>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedBudget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-400">
                    <Calculator size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">Orçamento {selectedBudget.codigo}</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedBudget.client_data?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex px-8 border-b border-slate-800 bg-slate-900/50">
                {[
                  { id: 'details', label: 'Detalhes', icon: FileText },
                  { id: 'lead', label: 'Visualizar Lead', icon: User },
                  { id: 'freight', label: 'Logística / Frete', icon: Truck },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
                      activeTab === tab.id ? "text-blue-500" : "text-slate-600 hover:text-slate-400"
                    )}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Informações Gerais</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">Status</p>
                            <p className="text-sm font-bold text-blue-400">{selectedBudget.status}</p>
                          </div>
                          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">Data</p>
                            <p className="text-sm font-bold text-white">{new Date(selectedBudget.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">Vendedor</p>
                            <p className="text-sm font-bold text-white">{selectedBudget.leads?.Vendedor}</p>
                          </div>
                          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">Frete Estimado</p>
                            <p className="text-sm font-bold text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedBudget.freight_cost)}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Condições Comerciais</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-4 bg-slate-950/30 border border-slate-800/50 rounded-2xl">
                            <span className="text-xs text-slate-400 lowercase italic">Pagamento</span>
                            <span className="text-sm font-bold text-white">{selectedBudget.payment_method || 'A combinar'}</span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-slate-950/30 border border-slate-800/50 rounded-2xl">
                            <span className="text-xs text-slate-400 lowercase italic">Prazo Entrega</span>
                            <span className="text-sm font-bold text-white">{selectedBudget.delivery_deadline || 'Consultar'}</span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-slate-950/30 border border-slate-800/50 rounded-2xl">
                            <span className="text-xs text-slate-400 lowercase italic">Validade</span>
                            <span className="text-sm font-bold text-emerald-400">{selectedBudget.validity_date ? new Date(selectedBudget.validity_date).toLocaleDateString('pt-BR') : 'Sem validade'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Itens do Orçamento</h4>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {selectedBudget.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl group hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="size-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400 font-black text-xs">
                                {item.quantity}x
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white uppercase tracking-tight">{item.name}</p>
                                <p className="text-[10px] text-slate-600 font-black uppercase">{item.category || 'PRODUTO'}</p>
                              </div>
                            </div>
                            <p className="text-sm font-black text-white">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                        
                        <div className="mt-8 p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex justify-between items-center">
                          <p className="text-sm font-black text-blue-400 uppercase tracking-widest">Valor Total Líquido</p>
                          <p className="text-2xl font-black text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedBudget.total_value)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'lead' && (
                  <div className="max-w-2xl mx-auto space-y-8">
                     <div className="p-8 bg-slate-950 rounded-[40px] border border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 size-40 bg-blue-600/5 blur-[60px] rounded-full group-hover:bg-blue-600/10 transition-all duration-700"></div>
                        
                        <div className="flex items-center gap-6 mb-10">
                           <div className="size-20 bg-blue-600 text-white rounded-[24px] flex items-center justify-center font-black text-4xl shadow-2xl shadow-blue-600/30">
                              {selectedBudget.leads?.Nome?.[0] || 'L'}
                           </div>
                           <div>
                              <h3 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">{selectedBudget.leads?.Nome}</h3>
                              <div className="flex items-center gap-4 mt-2">
                                 <span className="px-3 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    {selectedBudget.leads?.Estágio || 'Lead'}
                                 </span>
                                 <p className="text-slate-500 text-xs font-bold flex items-center gap-2">
                                    <MapPin size={14} className="text-slate-700" />
                                    {selectedBudget.leads?.Cidade} - SP
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-6 bg-slate-900/50 border border-slate-800/50 rounded-3xl space-y-4">
                              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                 <Phone size={12} /> Contato
                              </h4>
                              <p className="text-lg font-black text-white font-mono tracking-tighter">{selectedBudget.leads?.Telefone}</p>
                              <p className="text-xs font-medium text-slate-500 truncate">{selectedBudget.leads?.Email || 'Email não informado'}</p>
                           </div>
                           <div className="p-6 bg-slate-900/50 border border-slate-800/50 rounded-3xl space-y-4">
                              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                 <Fingerprint size={12} className="rotate-0" /> Documentos
                              </h4>
                              <p className="text-sm font-bold text-white uppercase tracking-tight">CNPJ: {selectedBudget.leads?.CNPJ || 'N/A'}</p>
                              <p className="text-xs font-medium text-slate-500 italic">Responsável: {selectedBudget.leads?.["Responsável da Empresa"] || 'Atendimento Direto'}</p>
                           </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-800/40 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-400 text-xs">
                                 {selectedBudget.leads?.Vendedor?.[0]}
                              </div>
                              <div>
                                 <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Gerente de Contas</p>
                                 <p className="text-sm font-bold text-slate-300">{selectedBudget.leads?.Vendedor}</p>
                              </div>
                           </div>
                           <button className="px-6 py-3 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/10 border border-blue-500/20">
                              Acessar Lead Pleno
                           </button>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'freight' && (
                  <div className="space-y-8">
                    <div className="bg-slate-950/50 border border-slate-800 rounded-[32px] p-8">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                          <div>
                             <h4 className="text-lg font-bold text-white mb-1">Cotações de Frete</h4>
                             <p className="text-xs text-slate-500">Acompanhamento logístico vinculado ao orçamento {selectedBudget.codigo}</p>
                          </div>
                          <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                             <Truck size={16} />
                             Solicitar Nova Cotação
                          </button>
                       </div>

                       <div className="space-y-4">
                          {/* Placeholder for real freight data */}
                          {[
                            { partner: 'Rodonaves', status: 'Realizado', value: 350.00, date: '25/03/2026' },
                            { partner: 'Transul', status: 'Cotado', value: 420.00, date: '26/03/2026' },
                            { partner: 'Braspress', status: 'Em andamento', value: null, date: 'Agendado' },
                          ].map((quote, idx) => (
                             <div key={idx} className="flex items-center justify-between p-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl group hover:border-blue-500/30 hover:bg-slate-900 transition-all">
                                <div className="flex items-center gap-5">
                                   <div className={cn(
                                      "size-12 rounded-2xl flex items-center justify-center border",
                                      quote.status === 'Realizado' ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/20" : 
                                      quote.status === 'Cotado' ? "bg-blue-600/10 text-blue-400 border-blue-500/20" : 
                                      "bg-slate-600/10 text-slate-400 border-slate-500/20"
                                   )}>
                                      <Truck size={20} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-white uppercase tracking-tight">{quote.partner}</p>
                                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{quote.date}</p>
                                   </div>
                                </div>
                                
                                <div className="flex items-center gap-8">
                                   <div className="text-right">
                                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</p>
                                      <span className={cn(
                                         "text-[10px] font-black uppercase tracking-wider",
                                         quote.status === 'Realizado' ? "text-emerald-400" : 
                                         quote.status === 'Cotado' ? "text-blue-400" : "text-slate-500"
                                      )}>
                                         {quote.status}
                                      </span>
                                   </div>
                                   <div className="text-right min-w-[100px]">
                                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Valor</p>
                                      <p className="text-sm font-black text-white">
                                         {quote.value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.value) : '---'}
                                      </p>
                                   </div>
                                   <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                      <MessageSquare size={16} />
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-950 border-t border-slate-800 flex justify-end gap-4">
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-3 bg-slate-900 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-800 hover:text-white transition-all"
                >
                  Fechar
                </button>
                <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                  <FileText size={16} />
                  Baixar PDF da Proposta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for icons that might be missing locally
function Fingerprint({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.02-.26 3.02" />
      <path d="M7 10a7 7 0 0 1 14 0c0 1.51-.2 3.01-.59 4.47" />
      <path d="M2 12a10 10 0 0 1 18-6.12" />
      <path d="M11 21.03a11.97 11.97 0 0 1-5.67-4.03" />
      <path d="M16 21c1.11-1.32 1.58-3.04 1.58-4.54a8.26 8.26 0 0 0-1.87-5.07" />
      <path d="M8 21a5.14 5.14 0 0 1-4-9" />
      <path d="M11 6a4.93 4.93 0 0 0-2.32.55" />
    </svg>
  );
}
