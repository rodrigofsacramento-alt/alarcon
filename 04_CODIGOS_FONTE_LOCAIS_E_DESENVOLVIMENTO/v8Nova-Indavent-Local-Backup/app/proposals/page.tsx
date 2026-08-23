'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { 
  FileText, 
  TrendingUp, 
  Target, 
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  DollarSign,
  Briefcase,
  Users,
  Clock,
  LayoutDashboard,
  Trello,
  MoreVertical,
  CheckCircle,
  XCircle,
  GripHorizontal,
  X,
  Edit3,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';

const DRYWALL_PRICE_TABLE = [
  { id: 1, name: 'TAB20G70 - GUIA 70', price: 10.97 },
  { id: 2, name: 'TAB20M70 - MONTANTE 70', price: 13.25 },
  { id: 3, name: 'TAB20G48 - GUIA 48', price: 9.45 },
  { id: 4, name: 'TAB20M48 - MONTANTE 48', price: 11.80 },
  { id: 5, name: 'TAB20T - TABICA', price: 8.90 },
  { id: 6, name: 'TAB20C - CANALETA C', price: 10.20 },
  { id: 7, name: 'TAB20CN - CANTONEIRA 25x30', price: 7.50 },
];

const EXAUSTOR_PRICE_TABLE = [
  { id: 101, name: 'Exaustor Residencial Cliente - Montado', price: 300.00 },
  { id: 102, name: 'Exaustor Residencial Cliente - Desmontado', price: 280.00 },
  { id: 103, name: 'Exaustor Residencial Cliente - Desmontado/embalado', price: 350.00 },
  { id: 104, name: 'Exaustor Residencial Cliente Final - Montado', price: 350.00 },
  { id: 105, name: 'Exaustor Residencial Cliente Final - Desmontado', price: 330.00 },
  { id: 106, name: 'Exaustor Residencial Cliente Final - Desmontado/embalado', price: 400.00 },
  { id: 107, name: 'Exaustor Industrial Cliente - Montado', price: 280.00 },
  { id: 108, name: 'Exaustor Industrial Cliente - Desmontado', price: 265.00 },
  { id: 109, name: 'Exaustor Industrial Cliente - Desmontado/embalado', price: 300.00 },
  { id: 110, name: 'Exaustor Industrial Cliente Final - Montado', price: 330.00 },
  { id: 111, name: 'Exaustor Industrial Cliente Final - Desmontado', price: 310.00 },
  { id: 112, name: 'Exaustor Industrial Cliente Final - Desmontado/embalado', price: 350.00 },
];
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { generateProposalHtml } from '@/lib/proposalGenerator';

export default function ProposalsDashboardPage() {
  const { user, profile, isAdmin } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timePeriod, setTimePeriod] = useState('Este Mês');
  const [viewMode, setViewMode] = useState<'dashboard' | 'kanban'>('kanban'); // Start default on Kanban for testing
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  
  // Edit Proposal States
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [editItems, setEditItems] = useState<any[]>([]);
  const [editFreight, setEditFreight] = useState<number | string>(0);
  const [editPayment, setEditPayment] = useState('');
  const [editDelivery, setEditDelivery] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleOpenProposal = (prop: any) => {
    setSelectedProposal(prop);
    setIsEditingProposal(false);
    if (prop.orcamentos) {
       setEditItems(prop.orcamentos.items || []);
       setEditFreight(prop.orcamentos.freight_cost || 0);
       setEditPayment(prop.orcamentos.payment_method || '');
       setEditDelivery(prop.orcamentos.delivery_deadline || '');
       setEditNotes(prop.orcamentos.notes || '');
    }
  };

  const handleSaveProposalEdit = async () => {
     setIsSavingEdit(true);
     try {
       const totalItems = editItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
       const total = totalItems + Number(editFreight);

       const { error } = await supabase.from('orcamentos').update({
         items: editItems,
         freight_cost: Number(editFreight),
         payment_method: editPayment,
         delivery_deadline: editDelivery,
         notes: editNotes,
         total_value: total
       }).eq('id', selectedProposal.orcamentos.id);

       if (error) throw error;
       
       const proposalData = {
         items: editItems,
         freight: Number(editFreight),
         paymentMethod: editPayment,
         deliveryDeadline: editDelivery,
         notes: editNotes,
         validityDate: new Date().toISOString()
       };
       const newHtml = generateProposalHtml(proposalData, selectedProposal.leads);
       
       const { error: propError } = await supabase.from('propostas').update({
         html_content: newHtml
       }).eq('id', selectedProposal.id);

       if (propError) throw propError;
       
       const updatedProps = proposals.map(p => {
          if (p.id === selectedProposal.id) {
             return {
                ...p,
                html_content: newHtml,
                orcamentos: {
                   ...p.orcamentos,
                   items: editItems,
                   freight_cost: Number(editFreight),
                   payment_method: editPayment,
                   delivery_deadline: editDelivery,
                   notes: editNotes,
                   total_value: total
                }
             };
          }
          return p;
       });
       setProposals(updatedProps);
       setSelectedProposal(updatedProps.find(p => p.id === selectedProposal.id));
       setIsEditingProposal(false);
     } catch (err: any) {
        alert('Erro ao salvar: ' + err.message);
     } finally {
        setIsSavingEdit(false);
     }
  };

  const KANBAN_STAGES = [
    { id: 'Capturando Informações', label: 'Capturando Informações', color: 'blue' },
    { id: 'Aguardando Cotação', label: 'Aguardando Cotação', color: 'amber' },
    { id: 'Enviada', label: 'Enviada ao Cliente', color: 'indigo' },
    { id: 'Finalizada', label: 'Finalizada', color: 'slate' }
  ];

  // Helper to normalize legacy status to new Kanban stages
  const getNormalizedStatus = (status: string) => {
    if (status === 'Ganho' || status === 'Perdido') return 'Finalizada';
    if (status === 'Pendente') return 'Aguardando Cotação';
    if (status === 'Enviada') return 'Enviada';
    if (!status || status === '') return 'Capturando Informações';
    
    // If it already matches one of the new ones
    if (KANBAN_STAGES.some(s => s.id === status)) return status;
    return 'Capturando Informações'; // Default fallback
  };

  useEffect(() => {
    fetchProposals();
  }, [user, isAdmin]);

  const fetchProposals = async () => {
    if (!supabase || !user) return;
    setIsLoading(true);
    try {
      // Fetch proposals with lead and budget info
      let query = supabase
        .from('propostas')
        .select(`
          *,
          leads:lead_id (*),
          orcamentos:orcamento_id (*)
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin && profile) {
        // Filter by salesperson if not admin
        // query = query.eq('leads.Vendedor', profile.name);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setProposals(data);
    } catch (err) {
      console.error('Error fetching proposals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const totalVolume = proposals.reduce((acc, p) => acc + (p.orcamentos?.total_value || 0), 0);
    const avgTicket = proposals.length > 0 ? totalVolume / proposals.length : 0;
    const activeProposals = proposals.filter(p => !['Ganho', 'Perdido'].includes(p.status)).length;
    const conversionRate = 65.5; // Mocked for UI richness

    return {
      totalVolume,
      avgTicket,
      activeProposals,
      conversionRate
    };
  }, [proposals]);

  const chartData = useMemo(() => {
    // Generate data for charts based on months
    return [
      { name: 'Jan', value: 45000 },
      { name: 'Fev', value: 52000 },
      { name: 'Mar', value: metrics.totalVolume * 0.8 },
      { name: 'Abr', value: metrics.totalVolume },
    ];
  }, [metrics.totalVolume]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      'Capturando Informações': 0,
      'Aguardando Cotação': 0,
      'Enviada': 0,
      'Finalizada': 0
    };
    
    proposals.forEach(p => {
      counts[getNormalizedStatus(p.status)]++;
    });

    return [
      { name: 'Captura', value: counts['Capturando Informações'], color: '#3b82f6' },
      { name: 'Cotação', value: counts['Aguardando Cotação'], color: '#f59e0b' },
      { name: 'Enviada', value: counts['Enviada'], color: '#6366f1' },
      { name: 'Finalizada', value: counts['Finalizada'], color: '#64748b' },
    ].filter(s => s.value > 0);
  }, [proposals]);

  const updateProposalStatus = async (proposalId: number, newStatus: string, finalResult?: 'Ganho' | 'Perdido') => {
    try {
      // Optimistic update
      setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
          return { ...p, status: finalResult || newStatus };
        }
        return p;
      }));

      const { error } = await supabase
        .from('propostas')
        .update({ status: finalResult || newStatus })
        .eq('id', proposalId);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error updating status:', err);
      // Revert on error could be implemented here
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden sidebar-offset">
        <TopBar title="Gestão de Propostas" />
        
        <div className="p-4 sm:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">Painel de Propostas</h1>
              <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Métricas Financeiras e Controle de Volume</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm mr-2">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    viewMode === 'dashboard' 
                      ? "bg-blue-50 text-blue-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    viewMode === 'kanban' 
                      ? "bg-blue-50 text-blue-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Trello size={14} />
                  Kanban
                </button>
              </div>
              
              <div className="hidden sm:flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                {['Este Mês', 'Últimos 90 dias', 'Ano Todo'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                      timePeriod === period 
                        ? "bg-slate-900 text-white shadow-lg" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {viewMode === 'dashboard' ? (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { label: 'Volume Financeiro', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalVolume), icon: DollarSign, trend: '+12.5%', color: 'blue' },
                  { label: 'Ticket Médio', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.avgTicket), icon: TrendingUp, trend: '+4.2%', color: 'emerald' },
                  { label: 'Propostas Ativas', value: metrics.activeProposals, icon: FileText, trend: '-2.1%', color: 'amber' },
                  { label: 'Taxa de Conversão', value: `${metrics.conversionRate}%`, icon: Target, trend: '+5.8%', color: 'indigo' },
                ].map((metric, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={metric.label}
                    className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "p-3 rounded-2xl",
                        metric.color === 'blue' && "bg-blue-50 text-blue-600",
                        metric.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                        metric.color === 'amber' && "bg-amber-50 text-amber-600",
                        metric.color === 'indigo' && "bg-indigo-50 text-indigo-600"
                      )}>
                        <metric.icon size={24} />
                      </div>
                      <span className={cn(
                        "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest py-1 px-2 rounded-lg",
                        metric.trend.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                      )}>
                        {metric.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {metric.trend}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{metric.label}</p>
                      <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{metric.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                          <BarChart3 size={20} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase">Evolução de Faturamento</h3>
                      </div>
                    </div>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <PieChartIcon size={20} />
                      </div>
                      <h3 className="text-lg font-black text-slate-900 uppercase">Distribuição por Estágio</h3>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={10}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-6 space-y-3">
                       {statusData.map((s) => (
                         <div key={s.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                               <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{s.name}</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">{s.value}</span>
                         </div>
                       ))}
                    </div>
                </div>
              </div>

              {/* Proposals List Table */}
              <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-slate-100 rounded-2xl text-slate-500">
                          <Briefcase size={20} />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Listagem Detalhada</h3>
                          <p className="text-xs text-slate-500 font-medium tracking-tight">Acompanhamento granular de todas as oportunidades geradas</p>
                       </div>
                    </div>

                    <div className="flex gap-3">
                       <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                             type="text" 
                             placeholder="Buscar cliente ou código..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none w-full sm:w-64"
                          />
                       </div>
                       <button className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all border border-slate-200">
                          <Filter size={20} />
                       </button>
                    </div>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">
                             <th className="px-8 py-5">Código / Cliente</th>
                             <th className="px-6 py-5">Vendedor</th>
                             <th className="px-6 py-5">Estágio</th>
                             <th className="px-6 py-5">Geração</th>
                             <th className="px-6 py-5">Valor</th>
                             <th className="px-8 py-5 text-right">Ação</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {proposals.filter(p => p.codigo?.includes(searchTerm) || p.leads?.Nome?.includes(searchTerm)).map((prop) => (
                            <tr key={prop.id} className="group hover:bg-blue-50/30 transition-all">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="size-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-xs text-blue-600 shadow-sm group-hover:border-blue-300">
                                        {prop.codigo?.slice(-3)}
                                     </div>
                                     <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{prop.leads?.Nome || 'Cliente não id'}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{prop.codigo}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-6">
                                  <div className="flex items-center gap-2">
                                     <Users size={14} className="text-slate-400" />
                                     <span className="text-xs font-bold text-slate-600">{prop.leads?.Vendedor || 'Jonathan'}</span>
                                  </div>
                               </td>
                               <td className="px-6 py-6">
                                  <span className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                    getNormalizedStatus(prop.status) === 'Enviada' ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                                    getNormalizedStatus(prop.status) === 'Aguardando Cotação' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                    getNormalizedStatus(prop.status) === 'Finalizada' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    "bg-blue-50 text-blue-600 border border-blue-100"
                                  )}>
                                     {prop.status}
                                  </span>
                               </td>
                               <td className="px-6 py-6 font-mono text-xs font-bold text-slate-500 flex items-center gap-2">
                                  <Clock size={14} />
                                  {new Date(prop.created_at).toLocaleDateString('pt-BR')}
                               </td>
                               <td className="px-6 py-6">
                                  <p className="text-sm font-black text-slate-900">
                                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.orcamentos?.total_value || 0)}
                                  </p>
                               </td>
                               <td className="px-8 py-6 text-right">
                              <button 
                                 onClick={() => handleOpenProposal(prop)}
                                 className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                 <ChevronRight size={20} />
                              </button>
                               </td>
                            </tr>
                          ))}
                          
                          {isLoading && (
                             Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                   <td colSpan={6} className="px-8 py-6 h-16 bg-slate-50/50" />
                                </tr>
                             ))
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
            </>
          ) : (
            /* Kanban View */
            <div className="h-[calc(100vh-220px)] flex gap-6 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 sm:-mx-8 sm:px-8">
              {KANBAN_STAGES.map((stage, sIdx) => {
                const stageProposals = proposals.filter(p => getNormalizedStatus(p.status) === stage.id);
                
                return (
                  <div key={stage.id} className="flex-shrink-0 w-80 lg:w-96 flex flex-col bg-slate-100/50 rounded-3xl border border-slate-200 overflow-hidden">
                    {/* Column Header */}
                    <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "size-3 rounded-full shadow-sm",
                          stage.color === 'blue' && "bg-blue-500",
                          stage.color === 'amber' && "bg-amber-500",
                          stage.color === 'indigo' && "bg-indigo-500",
                          stage.color === 'slate' && "bg-slate-500"
                        )} />
                        <h3 className="font-black text-slate-900 tracking-tight text-sm uppercase">{stage.label}</h3>
                      </div>
                      <div className="bg-slate-100 text-slate-600 font-bold text-xs px-2.5 py-1 rounded-lg">
                        {stageProposals.length}
                      </div>
                    </div>
                    
                    {/* Cards Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {stageProposals.map((prop) => (
                        <motion.div 
                          layoutId={`card-${prop.id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={prop.id} 
                          onClick={() => handleOpenProposal(prop)}
                          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md tracking-widest uppercase">#{prop.codigo?.slice(-4)}</span>
                              {prop.status === 'Ganho' && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase"><CheckCircle size={10} className="inline mr-1"/>Ganho</span>}
                              {prop.status === 'Perdido' && <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md uppercase"><XCircle size={10} className="inline mr-1"/>Perdido</span>}
                            </div>
                            
                            {/* Actions Dropdown */}
                            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1 text-slate-400 hover:text-slate-900 rounded bg-slate-50 hover:bg-slate-200">
                                <GripHorizontal size={14} />
                              </button>
                            </div>
                          </div>
                          
                          <h4 className="font-bold text-slate-900 text-sm mb-1 leading-tight">{prop.leads?.Nome || 'Cliente não identificado'}</h4>
                          <p className="text-xs text-slate-500 font-medium truncate mb-4">{prop.leads?.address || 'Sem endereço'}</p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <p className="font-black text-slate-900 text-sm">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.orcamentos?.total_value || 0)}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <Clock size={10} />
                              {new Date(prop.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          
                          {/* Quick move buttons */}
                          <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100/50">
                             {sIdx > 0 ? (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); updateProposalStatus(prop.id, KANBAN_STAGES[sIdx-1].id); }}
                                 className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest"
                               >
                                 &larr; Voltar
                               </button>
                             ) : <div></div>}
                             
                             {sIdx < 3 ? (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); updateProposalStatus(prop.id, KANBAN_STAGES[sIdx+1].id); }}
                                 className="text-[10px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg"
                               >
                                 Avançar &rarr;
                               </button>
                             ) : (
                               <div className="flex gap-2">
                                  {prop.status !== 'Ganho' && (
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); updateProposalStatus(prop.id, 'Finalizada', 'Ganho'); }}
                                        className="text-[9px] font-black text-emerald-600 hover:bg-emerald-100 uppercase bg-emerald-50 px-2 py-1 rounded"
                                      >
                                        Aprovar
                                      </button>
                                  )}
                                  {prop.status !== 'Perdido' && (
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); updateProposalStatus(prop.id, 'Finalizada', 'Perdido'); }}
                                        className="text-[9px] font-black text-rose-600 hover:bg-rose-100 uppercase bg-rose-50 px-2 py-1 rounded"
                                      >
                                        Recusar
                                      </button>
                                  )}
                               </div>
                             )}
                          </div>
                        </motion.div>
                      ))}
                      
                      {stageProposals.length === 0 && (
                        <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coluna Vazia</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Proposal Details Modal */}
      <AnimatePresence>
        {selectedProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProposal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    {isEditingProposal ? "Editando Orçamento" : "Resumo do Orçamento / Proposta"}
                  </h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    Cliente: {selectedProposal.leads?.Nome} • Código: {selectedProposal.codigo}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {!isEditingProposal && selectedProposal.orcamentos && (
                     <button 
                       onClick={() => setIsEditingProposal(true)}
                       className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2"
                     >
                       <Edit3 size={16} />
                       Editar Proposta
                     </button>
                  )}
                  <button 
                    onClick={() => setSelectedProposal(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 custom-scrollbar">
                 {selectedProposal.orcamentos ? (
                    <div className="space-y-8">
                      {/* Client Data */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Dados do Cliente (Capturados)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CNPJ</p>
                              <p className="text-sm font-black text-slate-900">{selectedProposal.orcamentos.client_data?.cnpj || 'N/A'}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Endereço</p>
                              <p className="text-sm font-black text-slate-900">{selectedProposal.orcamentos.client_data?.address || 'N/A'}</p>
                           </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Itens do Orçamento</h4>
                           {isEditingProposal && (
                              <button 
                                onClick={() => {
                                   const table = selectedProposal.leads?.Produto === 'Exaustor Eólico' ? EXAUSTOR_PRICE_TABLE : DRYWALL_PRICE_TABLE;
                                   setEditItems([...editItems, { ...table[0], quantity: 1 }]);
                                }}
                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                              >
                                <Plus size={14} /> Adicionar Item
                              </button>
                           )}
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="py-3 px-2">Produto</th>
                                    <th className="py-3 px-2 w-24">Qtd</th>
                                    <th className="py-3 px-2 w-32">Preço Un.</th>
                                    <th className="py-3 px-2 w-32 text-right">Subtotal</th>
                                    {isEditingProposal && <th className="py-3 px-2 w-10"></th>}
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 text-sm">
                                 {(!isEditingProposal ? selectedProposal.orcamentos.items : editItems)?.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                       <td className="py-3 px-2 font-bold text-slate-700">
                                          {isEditingProposal ? (
                                             <select 
                                               className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/50 outline-none"
                                               value={item.id}
                                               onChange={(e) => {
                                                  const table = selectedProposal.leads?.Produto === 'Exaustor Eólico' ? EXAUSTOR_PRICE_TABLE : DRYWALL_PRICE_TABLE;
                                                  const selected = table.find(p => p.id === Number(e.target.value));
                                                  if (selected) {
                                                     const newItems = [...editItems];
                                                     newItems[idx] = { ...newItems[idx], ...selected };
                                                     setEditItems(newItems);
                                                  }
                                               }}
                                             >
                                                {(selectedProposal.leads?.Produto === 'Exaustor Eólico' ? EXAUSTOR_PRICE_TABLE : DRYWALL_PRICE_TABLE).map(p => (
                                                   <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                             </select>
                                          ) : item.name}
                                       </td>
                                       <td className="py-3 px-2 font-medium text-slate-600">
                                          {isEditingProposal ? (
                                             <input 
                                                type="number" 
                                                min="1"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/50 outline-none"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                   const newItems = [...editItems];
                                                   newItems[idx].quantity = Number(e.target.value);
                                                   setEditItems(newItems);
                                                }}
                                             />
                                          ) : item.quantity}
                                       </td>
                                       <td className="py-3 px-2 font-medium text-slate-600">
                                          {isEditingProposal ? (
                                             <input 
                                                type="number" 
                                                step="0.01"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/50 outline-none"
                                                value={item.price}
                                                onChange={(e) => {
                                                   const newItems = [...editItems];
                                                   newItems[idx].price = Number(e.target.value);
                                                   setEditItems(newItems);
                                                }}
                                             />
                                          ) : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                       </td>
                                       <td className="py-3 px-2 font-black text-slate-900 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</td>
                                       {isEditingProposal && (
                                          <td className="py-3 px-2 text-right">
                                             <button 
                                                onClick={() => {
                                                   const newItems = [...editItems];
                                                   newItems.splice(idx, 1);
                                                   setEditItems(newItems);
                                                }}
                                                className="p-2 text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 rounded-lg transition-colors"
                                             >
                                                <Trash2 size={16} />
                                             </button>
                                          </td>
                                       )}
                                    </tr>
                                 ))}
                                 {(!isEditingProposal ? selectedProposal.orcamentos.items : editItems)?.length === 0 && (
                                    <tr>
                                       <td colSpan={isEditingProposal ? 5 : 4} className="py-8 text-center text-slate-500 font-bold text-sm">
                                          Nenhum item adicionado ao orçamento.
                                       </td>
                                    </tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                      </div>

                      {/* Financials */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Forma de Pagamento</p>
                               {isEditingProposal ? (
                                  <input 
                                     type="text" 
                                     className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/50 outline-none"
                                     value={editPayment}
                                     onChange={(e) => setEditPayment(e.target.value)}
                                  />
                               ) : (
                                  <p className="text-sm font-black text-slate-900">{selectedProposal.orcamentos.payment_method}</p>
                               )}
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prazo de Entrega</p>
                               {isEditingProposal ? (
                                  <input 
                                     type="text" 
                                     className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/50 outline-none"
                                     value={editDelivery}
                                     onChange={(e) => setEditDelivery(e.target.value)}
                                  />
                               ) : (
                                  <p className="text-sm font-black text-slate-900">{selectedProposal.orcamentos.delivery_deadline}</p>
                               )}
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Observações</p>
                               {isEditingProposal ? (
                                  <textarea 
                                     rows={3}
                                     className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-600/50 outline-none custom-scrollbar"
                                     value={editNotes}
                                     onChange={(e) => setEditNotes(e.target.value)}
                                  />
                               ) : (
                                  <p className="text-xs font-medium text-slate-600 whitespace-pre-wrap">{selectedProposal.orcamentos.notes}</p>
                               )}
                            </div>
                         </div>

                         <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center gap-4">
                            <div>
                               <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Frete (Custo de Logística)</p>
                               {isEditingProposal ? (
                                  <div className="relative">
                                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 font-bold">R$</span>
                                     <input 
                                        type="number" 
                                        className="w-full bg-white border border-blue-200 rounded-xl py-3 pl-10 pr-4 text-sm font-black text-blue-900 focus:ring-2 focus:ring-blue-600 outline-none"
                                        value={editFreight}
                                        onChange={(e) => setEditFreight(e.target.value)}
                                     />
                                  </div>
                               ) : (
                                  <p className="text-xl font-black text-blue-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProposal.orcamentos.freight_cost || 0)}</p>
                               )}
                            </div>
                            <div className="pt-4 border-t border-blue-200/50">
                               <p className="text-sm font-black text-blue-700 uppercase tracking-widest mb-1">Total Geral (Calculado)</p>
                               <p className="text-4xl font-black text-blue-900">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                     isEditingProposal 
                                     ? editItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) + Number(editFreight)
                                     : selectedProposal.orcamentos.total_value
                                  )}
                               </p>
                            </div>
                         </div>
                      </div>
                      
                      {isEditingProposal && (
                         <div className="flex gap-4 pt-4 border-t border-slate-200">
                            <button 
                               onClick={handleSaveProposalEdit}
                               disabled={isSavingEdit}
                               className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                               {isSavingEdit && <Loader2 size={18} className="animate-spin" />}
                               {isSavingEdit ? "Salvando..." : "Salvar Alterações"}
                            </button>
                            <button 
                               onClick={() => {
                                  setIsEditingProposal(false);
                                  handleOpenProposal(selectedProposal); // reset
                               }}
                               className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black uppercase tracking-widest rounded-xl transition-colors"
                            >
                               Cancelar
                            </button>
                         </div>
                      )}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                       <FileText size={48} className="mb-4 opacity-20" />
                       <p className="font-bold text-lg text-slate-600">Detalhes do orçamento não disponíveis.</p>
                       <p className="text-sm mt-2">Esta proposta pode ter sido gerada em uma versão anterior do sistema, ou ser apenas um registro legado.</p>
                    </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
