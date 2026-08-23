'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { KPICard } from '@/components/KPICard';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Download,
  Calendar,
  Wallet,
  Receipt,
  FileText,
  PieChart
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
const financialData = [
  { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
  { month: 'Fev', revenue: 52000, expenses: 34000, profit: 18000 },
  { month: 'Mar', revenue: 48000, expenses: 31000, profit: 17000 },
  { month: 'Abr', revenue: 61000, expenses: 38000, profit: 23000 },
  { month: 'Mai', revenue: 55000, expenses: 35000, profit: 20000 },
  { month: 'Jun', revenue: 67000, expenses: 40000, profit: 27000 },
];

const transactions = [
  { id: 1, date: '15/04/2026', description: 'Venda - Globex Corp', category: 'Receita', amount: 12500.00, status: 'completed' },
  { id: 2, date: '14/04/2026', description: 'Assinatura AWS Cloud', category: 'Infraestrutura', amount: -1200.00, status: 'completed' },
  { id: 3, date: '14/04/2026', description: 'Venda - TechSolutions', category: 'Receita', amount: 8400.00, status: 'completed' },
  { id: 4, date: '12/04/2026', description: 'Marketing LinkedIn Ads', category: 'Marketing', amount: -2500.00, status: 'pending' },
  { id: 5, date: '10/04/2026', description: 'Venda - Vertex Ltd', category: 'Receita', amount: 15700.00, status: 'completed' },
  { id: 6, date: '08/04/2026', description: 'Aluguel Escritório', category: 'Operacional', amount: -4500.00, status: 'completed' },
];

export default function FinancePage() {
  const [activeRange, setActiveRange] = useState('6m');

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden sidebar-offset">
        <TopBar title="Área Financeira" />
        
        <div className="p-4 sm:p-8 space-y-8 overflow-y-auto">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-100 uppercase italic">
                Gestão <span className="text-blue-500 not-italic">Financeira</span>
              </h1>
              <p className="text-slate-400 font-medium text-xs mt-1">Visão analítica de fluxo de caixa, receitas e despesas operacionais.</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex bg-slate-900/40 backdrop-blur-xl border border-white/5 p-1 rounded-xl shadow-xl">
                {['1m', '3m', '6m', '1y'].map(range => (
                  <button 
                    key={range}
                    onClick={() => setActiveRange(range)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      activeRange === range ? "bg-slate-800 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                <Download size={16} />
                Exportar Relatório
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              title="Receita Total" 
              value="R$ 328.000,00" 
              change="+14.2%" 
              trend="up"
              icon={DollarSign} 
              color="blue"
              description="Total faturado no período"
            />
            <KPICard 
              title="Despesas" 
              value="R$ 142.200,00" 
              change="-2.1%" 
              trend="down"
              icon={TrendingDown} 
              color="rose"
              description="Custos operacionais e impostos"
            />
            <KPICard 
              title="Lucro Líquido" 
              value="R$ 185.800,00" 
              change="+18.5%" 
              trend="up"
              icon={TrendingUp} 
              color="emerald"
              description="Margem líquida de 56.6%"
            />
            <KPICard 
              title="Saldo em Caixa" 
              value="R$ 94.500,00" 
              change="+5.4k" 
              trend="up"
              icon={Wallet} 
              color="amber"
              description="Disponibilidade imediata"
            />
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Cash Flow Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }} className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-black italic uppercase text-slate-100 tracking-tight">Fluxo de Caixa Mensal</h3>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <span className="size-2 bg-blue-500 rounded-full" /> RECEITA
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <span className="size-2 bg-slate-600 rounded-full" /> DESPESAS
                    </div>
                  </div>
                </div>
                <div className="size-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-white/5">
                  <PieChart className="text-blue-400" size={24} />
                </div>
              </div>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      tickFormatter={(value) => `R$ ${value >= 1000 ? value / 1000 + 'k' : value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2563eb" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                      animationDuration={1500}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#475569" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Billing Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 text-white flex flex-col shadow-xl">
              <h3 className="text-xl font-black italic uppercase tracking-tight mb-8">Faturado por Categoria</h3>
              <div className="space-y-6 flex-1">
                {[
                  { label: 'Serviços AI', value: 'R$ 124.5k', color: '#3b82f6', percent: 65 },
                  { label: 'Consultoria', value: 'R$ 48.2k', color: '#10b981', percent: 25 },
                  { label: 'Software Licensing', value: 'R$ 19.3k', color: '#f59e0b', percent: 10 },
                ].map((cat) => (
                  <div key={cat.label}>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                      <span className="text-slate-400">{cat.label}</span>
                      <span>{cat.value}</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-5 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-8 bg-blue-600/20 rounded flex items-center justify-center">
                    <Receipt className="text-blue-500" size={16} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Próximo Vencimento</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-lg font-black truncate">Indavent Cloud Services</p>
                  <p className="text-sm font-bold text-blue-500 whitespace-nowrap">22 Abr</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Transactions Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-slate-800 border border-white/5 rounded-xl flex items-center justify-center text-slate-100">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-black italic uppercase text-slate-100 tracking-tight">Transações Recentes</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atividade monetária dos últimos 7 dias</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-white/5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Categoria</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-400">{t.date}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "size-8 rounded-lg flex items-center justify-center border border-white/5",
                            t.amount > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                            {t.amount > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          </div>
                          <span className="text-sm font-bold text-slate-100">{t.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-800/50 border border-white/5 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-sm font-black italic",
                          t.amount > 0 ? "text-emerald-400" : "text-slate-100"
                        )}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "size-1.5 rounded-full",
                            t.status === 'completed' ? "bg-emerald-400" : "bg-amber-400"
                          )} />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            t.status === 'completed' ? "text-emerald-400" : "text-amber-400"
                          )}>
                            {t.status === 'completed' ? 'Efetivado' : 'Pendente'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
