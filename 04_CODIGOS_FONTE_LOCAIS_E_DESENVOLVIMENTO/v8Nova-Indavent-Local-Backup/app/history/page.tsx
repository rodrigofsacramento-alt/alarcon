'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { supabase } from '@/lib/supabase';
import { formatTimeAgo, cn } from '@/lib/utils';
import { 
  Filter, 
  Activity, 
  Search,
  CheckCircle2,
  Mail,
  CalendarDays,
  User as UserIcon,
  Clock,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';

export default function HistoryPage() {
  const { user, profile, isAdmin } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch users
        const { data: usersData } = await supabase.from('internal_users').select('id, name');
        if (usersData) setUsers(usersData);
        
        const usersMap = usersData ? Object.fromEntries(usersData.map(u => [u.id, u.name])) : {};

        // Fetch activities
        let actsQuery = supabase
          .from('activities')
          .select('id, type, description, created_at, user_id, leads(Nome)')
          .order('created_at', { ascending: false });

        if (!isAdmin && user) {
          actsQuery = actsQuery.eq('user_id', user.id);
        }

        const { data: actsData, error } = await actsQuery.limit(100);
        
        if (!error && actsData) {
          const formatted = actsData.map(a => ({
            id: a.id,
            type: a.type,
            description: a.description,
            leadName: (a.leads as any)?.Nome || 'Desconhecido',
            userId: a.user_id,
            userName: a.user_id ? (usersMap[a.user_id] || 'Usuário') : 'Sistema',
            createdAt: a.created_at,
            timeAgo: formatTimeAgo(a.created_at),
            icon: a.type === 'Message' ? Mail : a.type === 'Call' ? CheckCircle2 : CalendarDays
          }));

          // Busca todos os leads para adicionar como "Criação"
          const { data: leadsData } = await supabase.from('leads').select('id, Nome, name, nome, created_at, salesperson_id, Vendedor, vendedor');
          
          const leadsActivities = (leadsData || []).map(l => {
            let userName = 'Sistema';
            if (l.salesperson_id && usersMap[l.salesperson_id]) {
              userName = usersMap[l.salesperson_id];
            } else if (l.Vendedor || l.vendedor || l["Vendedor."]) {
              userName = l.Vendedor || l.vendedor || l["Vendedor."];
            }
            
            return {
              id: `lead-create-${l.id}`,
              type: 'Create',
              description: `Novo lead cadastrado`,
              leadName: l.Nome || l.name || l.nome || 'Desconhecido',
              userId: l.salesperson_id || 'system',
              userName: userName,
              createdAt: l.created_at,
              timeAgo: formatTimeAgo(l.created_at),
              icon: UserPlus
            };
          });

          // Filtra por usuário se não for admin
          let combinedActivities = [...formatted, ...leadsActivities];
          if (!isAdmin && user) {
            combinedActivities = combinedActivities.filter(a => a.userId === user.id);
          }

          // Ordena por data e limite para não travar (opcional)
          combinedActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setActivities(combinedActivities);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user || isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const filteredActivities = activities.filter(act => {
    if (selectedUser !== 'all' && act.userId !== selectedUser) return false;
    if (selectedType !== 'all' && act.type !== selectedType) return false;
    if (searchQuery && !act.description.toLowerCase().includes(searchQuery.toLowerCase()) && !act.leadName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getIconColor = (type: string) => {
    if (type === 'Create') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (type === 'Update') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (type === 'Message') return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    if (type === 'Budget') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (type === 'Delete') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden sidebar-offset">
        <TopBar title="Histórico de Atividades" />
        
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-100 uppercase italic">
                Histórico <span className="text-blue-500 not-italic">de Atualizações</span>
              </h1>
              <p className="text-slate-400 font-medium text-xs mt-1">
                Acompanhe quem atualizou cada lead e quais foram as mudanças.
              </p>
            </div>
          </div>

          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-xl flex flex-wrap gap-4 items-center"
          >
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500" />
              </div>
              <input 
                type="text" 
                placeholder="Buscar em descrições ou leads..." 
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <select 
                className="bg-slate-800/50 border border-white/5 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="all">Todos os Usuários</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Activity size={16} className="text-slate-500" />
              <select 
                className="bg-slate-800/50 border border-white/5 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Todos os Tipos</option>
                <option value="Create">Cadastros</option>
                <option value="Update">Atualizações</option>
                <option value="Message">Mensagens</option>
                <option value="Budget">Orçamentos</option>
                <option value="Delete">Exclusões</option>
              </select>
            </div>
          </motion.div>

          {/* Activities List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl overflow-hidden"
          >
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm font-bold uppercase tracking-widest">
                Carregando histórico...
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm font-bold uppercase tracking-widest">
                Nenhuma atividade encontrada para os filtros selecionados.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="p-4 sm:p-6 hover:bg-slate-800/30 transition-colors flex gap-4 items-start group">
                      <div className={cn("size-10 rounded-xl flex items-center justify-center border shrink-0", getIconColor(act.type))}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-bold text-slate-100 truncate">
                            {act.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                            <Clock size={12} />
                            {act.timeAgo}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 bg-slate-800/50 border border-white/5 px-2 py-1 rounded-md">
                            <UserIcon size={12} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{act.userName}</span>
                          </div>
                          <span className="text-xs font-medium text-slate-500 truncate">
                            Referência: <span className="text-blue-400">{act.leadName}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
