'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter,
  X,
  AlignLeft,
  Clock,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  AlertTriangle,
  Flag,
  User,
  MoreHorizontal,
  FolderDot,
  Users,
  Calendar
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfDay,
  differenceInDays,
  isWeekend
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

type Status = 'pending' | 'in_progress' | 'completed';
type Priority = 'low' | 'medium' | 'high';

interface Activity {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  startDate: Date; // Prazo Planejado Inicial
  endDate: Date; // Prazo Planejado Final
  actualStartDate: Date | null; // Prazo Executado Inicial
  actualEndDate: Date | null; // Prazo Executado Final
  assignee: { name: string; avatar?: string };
  project: string;
  description: string;
  progress: number;
  createdBy: string;
  createdAt: Date;
  taggedCollaborators: string[];
}

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Planejamento Estratégico Q3',
    status: 'in_progress',
    priority: 'high',
    startDate: new Date(2026, 4, 2),
    endDate: new Date(2026, 4, 10),
    actualStartDate: new Date(2026, 4, 3),
    actualEndDate: null,
    assignee: { name: 'Edivana' },
    project: 'Financeiro',
    description: 'Definição de metas financeiras e OKRs para o terceiro trimestre com a diretoria.',
    progress: 45,
    createdBy: 'Sistema',
    createdAt: new Date(2026, 3, 20),
    taggedCollaborators: ['João Silva']
  },
  {
    id: '2',
    title: 'Atualização do CRM',
    status: 'pending',
    priority: 'medium',
    startDate: new Date(2026, 4, 5),
    endDate: new Date(2026, 4, 12),
    actualStartDate: null,
    actualEndDate: null,
    assignee: { name: 'João Silva' },
    project: 'Tecnologia',
    description: 'Implementar as novas funcionalidades de pipeline no Indavent.',
    progress: 0,
    createdBy: 'Sistema',
    createdAt: new Date(2026, 4, 1),
    taggedCollaborators: []
  },
  {
    id: '3',
    title: 'Fechamento Contábil Mês 4',
    status: 'completed',
    priority: 'high',
    startDate: new Date(2026, 4, 1),
    endDate: new Date(2026, 4, 5),
    actualStartDate: new Date(2026, 4, 1),
    actualEndDate: new Date(2026, 4, 4),
    assignee: { name: 'Maria Souza' },
    project: 'Financeiro',
    description: 'Conciliação bancária e emissão de notas do mês anterior.',
    progress: 100,
    createdBy: 'Sistema',
    createdAt: new Date(2026, 3, 25),
    taggedCollaborators: ['Edivana']
  },
  {
    id: '4',
    title: 'Campanha de Marketing Leads',
    status: 'in_progress',
    priority: 'high',
    startDate: new Date(2026, 4, 8),
    endDate: new Date(2026, 4, 20),
    actualStartDate: new Date(2026, 4, 8),
    actualEndDate: null,
    assignee: { name: 'Ana Costa' },
    project: 'Marketing',
    description: 'Campanha de captação de novos leads via Meta Ads e Google Ads.',
    progress: 60,
    createdBy: 'Sistema',
    createdAt: new Date(2026, 4, 5),
    taggedCollaborators: []
  },
  {
    id: '5',
    title: 'Revisão de Contratos de Parceria',
    status: 'pending',
    priority: 'low',
    startDate: new Date(2026, 3, 20), // This will be overdue since we mock May 2026
    endDate: new Date(2026, 3, 30),
    actualStartDate: null,
    actualEndDate: null,
    assignee: { name: 'Edivana' },
    project: 'Financeiro',
    description: 'Revisar cláusulas financeiras dos novos contratos de frete.',
    progress: 0,
    createdBy: 'Sistema',
    createdAt: new Date(2026, 3, 10),
    taggedCollaborators: []
  },
  {
    id: '6',
    title: 'Treinamento de Equipe de Vendas',
    status: 'pending',
    priority: 'medium',
    startDate: new Date(2026, 4, 18),
    endDate: new Date(2026, 4, 19),
    actualStartDate: null,
    actualEndDate: null,
    assignee: { name: 'Carlos Lima' },
    project: 'RH',
    description: 'Treinamento sobre as novas técnicas de fechamento (Spin Selling).',
    progress: 0,
    createdBy: 'Sistema',
    createdAt: new Date(2026, 4, 10),
    taggedCollaborators: []
  }
];

const statusConfig = {
  pending: { label: 'Pendente', icon: CircleDashed, color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
  in_progress: { label: 'Em Andamento', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  completed: { label: 'Concluído', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

const priorityConfig = {
  low: { label: 'Baixa', icon: Flag, color: 'text-slate-500', bg: 'bg-slate-100' },
  medium: { label: 'Média', icon: Flag, color: 'text-amber-500', bg: 'bg-amber-50' },
  high: { label: 'Alta', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
};

const DAY_WIDTH = 48; // px per day column

export default function SchedulePage() {
  const { profile, isAdmin } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // Default to May 2026 based on mock data
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('internal_users').select('name');
      if (data && !error) {
        setAvailableUsers(data.map((u: any) => u.name).filter(Boolean));
      }
    };
    fetchUsers();
  }, []);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
  }, [currentMonth]);

  const visibleActivities = useMemo(() => {
    if (isAdmin) return activities;
    if (!profile?.name) return [];
    return activities.filter(act => 
      act.assignee.name === profile.name || 
      act.taggedCollaborators.includes(profile.name)
    );
  }, [activities, isAdmin, profile]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Auto-scroll to today if today is in current month
  useEffect(() => {
    if (scrollContainerRef.current) {
      const today = startOfDay(new Date());
      const monthStart = startOfDay(daysInMonth[0]);
      const monthEnd = startOfDay(daysInMonth[daysInMonth.length - 1]);
      
      if (today >= monthStart && today <= monthEnd) {
         const diff = differenceInDays(today, monthStart);
         scrollContainerRef.current.scrollTo({ left: diff * DAY_WIDTH, behavior: 'smooth' });
      }
    }
  }, [daysInMonth]);

  const handleCreateActivity = (newActivity: Activity) => {
    setActivities(prev => [...prev, newActivity]);
    setIsCreateModalOpen(false);
  };

  const handleUpdateActivity = (updatedActivity: Activity) => {
    setActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));
    setSelectedActivity(updatedActivity); // update details panel
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden sidebar-offset">
        <TopBar title="Cronograma de Atividades" />
        
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col min-h-0 h-full gap-6">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic flex items-center gap-3">
                <CalendarDays className="text-blue-600" size={32} />
                Cronograma <span className="text-blue-600 not-italic">de Projetos</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Visualize e gerencie as atividades ao longo do tempo.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative group hidden sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar atividade..." 
                  className="pl-9 pr-4 py-2 w-64 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
              <button className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm hidden sm:block">
                <Filter size={18} />
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
              >
                <Plus size={18} />
                Nova Atividade
              </button>
            </div>
          </div>

          {/* Timeline View */}
          <div className="flex-1 bg-white border border-slate-200 rounded-[24px] shadow-sm flex flex-col min-h-0 overflow-hidden relative">
            
            {/* Timeline Toolbar */}
            <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0 z-20">
               <div className="flex items-center gap-4">
                 <h2 className="text-xl font-bold text-slate-800 capitalize">
                   {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                 </h2>
                 <div className="flex items-center bg-slate-100 rounded-lg p-1">
                   <button onClick={prevMonth} className="p-1.5 rounded-md text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900 transition-all">
                     <ChevronLeft size={16} />
                   </button>
                   <button 
                     onClick={() => setCurrentMonth(new Date())} 
                     className="px-3 py-1.5 rounded-md text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                   >
                     Hoje
                   </button>
                   <button onClick={nextMonth} className="p-1.5 rounded-md text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900 transition-all">
                     <ChevronRight size={16} />
                   </button>
                 </div>
               </div>
               
               <div className="flex items-center gap-2 hidden sm:flex">
                 <div className="text-xs font-medium text-slate-500 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-rose-500" /> Alta Prio</span>
                    <span className="flex items-center gap-1 ml-2"><div className="size-2 rounded-full bg-blue-500" /> Em Andamento</span>
                 </div>
               </div>
            </div>

            {/* Scrollable Timeline Area */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-auto custom-scrollbar relative bg-white"
            >
              <div className="min-w-max relative pb-32">
                
                {/* Header Row (Sticky Top) */}
                <div className="flex h-14 border-b border-slate-200 bg-white sticky top-0 z-30">
                  {/* Fixed Left Column Header */}
                  <div className="w-[340px] shrink-0 border-r border-slate-200 bg-white sticky left-0 z-40 flex items-center px-6">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Atividades</span>
                  </div>
                  
                  {/* Days Header */}
                  <div className="flex relative">
                    {daysInMonth.map((day) => {
                      const isWknd = isWeekend(day);
                      const isTdy = isToday(day);
                      return (
                        <div 
                          key={day.toISOString()} 
                          className={cn(
                            "w-[48px] shrink-0 border-r border-slate-200 flex flex-col items-center justify-center transition-colors bg-white",
                            isWknd ? "bg-slate-50 text-slate-400" : "text-slate-600",
                            isTdy && "bg-blue-50 text-blue-700 font-bold"
                          )}
                        >
                          <span className="text-[9px] uppercase tracking-wider">{format(day, 'E', { locale: ptBR }).substring(0, 3)}</span>
                          <span className={cn(
                            "text-sm font-semibold mt-0.5 size-6 flex items-center justify-center rounded-full",
                            isTdy && "bg-blue-600 text-white shadow-sm"
                          )}>
                            {format(day, 'd')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Body Rows */}
                <div className="relative">
                   {/* Background Grid (Absolute, stretches full height) */}
                   <div className="absolute inset-0 flex pl-[340px] pointer-events-none z-0">
                     {daysInMonth.map((day) => (
                        <div 
                          key={day.toISOString()} 
                          className={cn(
                            "w-[48px] shrink-0 border-r border-slate-100/50",
                            isWeekend(day) && "bg-slate-50/50",
                            isToday(day) && "bg-blue-50/30"
                          )} 
                        />
                     ))}
                   </div>

                   {/* Rows */}
                   <div className="relative z-10">
                     {visibleActivities.map((act) => (
                       <TimelineRow 
                         key={act.id} 
                         activity={act} 
                         daysInMonth={daysInMonth} 
                         onClick={() => setSelectedActivity(act)}
                       />
                     ))}
                   </div>
                </div>
                
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* Create / Edit Activity Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || activityToEdit) && (
          <ActivityFormModal 
            initialData={activityToEdit || undefined}
            onClose={() => {
              setIsCreateModalOpen(false);
              setActivityToEdit(null);
            }} 
            onSave={(act) => {
              if (activityToEdit) {
                handleUpdateActivity(act);
              } else {
                handleCreateActivity(act);
              }
              setIsCreateModalOpen(false);
              setActivityToEdit(null);
            }}
            currentUser={profile?.name || 'Usuário Atual'}
            availableUsers={availableUsers}
          />
        )}
      </AnimatePresence>

      {/* Activity Detail Modal (Side Peek) */}
      <AnimatePresence>
        {selectedActivity && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
              onClick={() => setSelectedActivity(null)}
            />
            {/* Panel */}
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[101] border-l border-slate-200 flex flex-col"
            >
              <ActivityDetailPanel 
                activity={selectedActivity} 
                onClose={() => setSelectedActivity(null)} 
                onUpdate={handleUpdateActivity}
                availableUsers={availableUsers}
                onEdit={() => setActivityToEdit(selectedActivity)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------

function TimelineRow({ activity, daysInMonth, onClick }: { activity: Activity, daysInMonth: Date[], onClick: () => void }) {
  const monthStartDay = startOfDay(daysInMonth[0]);
  const monthEndDay = startOfDay(daysInMonth[daysInMonth.length - 1]);
  
  const actStart = startOfDay(activity.startDate);
  const actEnd = startOfDay(activity.endDate);
  
  // Overdue check
  const today = startOfDay(new Date());
  const isOverdue = actEnd < today && activity.status !== 'completed';
  
  // Check if activity is outside the current month view
  if (actEnd < monthStartDay || actStart > monthEndDay) {
    return (
      <div className="flex h-14 border-b border-slate-100 group hover:bg-slate-50/50 transition-colors relative z-10">
        <StickyLeftColumn activity={activity} isOverdue={isOverdue} />
      </div>
    );
  }
  
  const actualStart = actStart < monthStartDay ? monthStartDay : actStart;
  const actualEnd = actEnd > monthEndDay ? monthEndDay : actEnd;
  
  const startOffsetDays = differenceInDays(actualStart, monthStartDay);
  const durationDays = differenceInDays(actualEnd, actualStart) + 1;
  
  const left = startOffsetDays * DAY_WIDTH;
  const width = durationDays * DAY_WIDTH;
  
  // Styling based on status
  const isCompleted = activity.status === 'completed';
  const barColor = isCompleted 
    ? 'bg-emerald-500 hover:bg-emerald-600' 
    : isOverdue
      ? 'bg-rose-500 hover:bg-rose-600'
      : activity.priority === 'high' 
        ? 'bg-rose-500 hover:bg-rose-600'
        : 'bg-blue-500 hover:bg-blue-600';

  return (
    <div className="flex h-14 border-b border-slate-100 group transition-colors relative z-10 hover:bg-slate-50/80">
      
      {/* Sticky Left Info */}
      <StickyLeftColumn activity={activity} isOverdue={isOverdue} />
      
      {/* Timeline Track Area */}
      <div className="relative flex-1 min-w-0" style={{ paddingLeft: '340px' }}>
         <div 
           onClick={onClick}
           className={cn(
             "absolute top-2 bottom-2 rounded-lg shadow-sm cursor-pointer transition-all flex items-center px-3 group/bar overflow-hidden",
             barColor,
             isCompleted && "opacity-80"
           )}
           style={{ left: `${left + 340}px`, width: `${width}px` }}
         >
           {/* Progress overlay */}
           {activity.progress > 0 && activity.progress < 100 && (
             <div 
               className="absolute left-0 top-0 bottom-0 bg-black/10" 
               style={{ width: `${activity.progress}%` }} 
             />
           )}
           
           <span className="text-xs text-white font-medium truncate relative z-10 w-full flex items-center gap-1.5">
             {isOverdue && <AlertTriangle size={12} className="shrink-0" />}
             {activity.title}
           </span>
         </div>
      </div>
    </div>
  );
}

function StickyLeftColumn({ activity, isOverdue }: { activity: Activity, isOverdue: boolean }) {
  const StatusIcon = statusConfig[activity.status].icon;
  const statusColor = statusConfig[activity.status].color;

  return (
    <div className="w-[340px] shrink-0 border-r border-slate-200 bg-white group-hover:bg-slate-50/80 sticky left-0 z-20 flex items-center px-4 gap-3">
      <div className={cn("shrink-0", statusColor)}>
        <StatusIcon size={16} />
      </div>
      <div className="min-w-0 flex-1 cursor-default">
        <p className={cn(
          "text-sm font-semibold truncate transition-all flex items-center gap-1.5",
          activity.status === 'completed' ? "text-slate-400 line-through" : "text-slate-700"
        )}>
          {isOverdue && <AlertTriangle size={14} className="text-rose-500 shrink-0" />}
          <span className="truncate">{activity.title}</span>
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          <span className="truncate max-w-[100px]">{activity.project}</span>
          <span className="size-1 rounded-full bg-slate-300 shrink-0" />
          <span className="truncate">{activity.assignee.name}</span>
        </div>
      </div>
    </div>
  );
}

function ActivityDetailPanel({ activity, onClose, onUpdate, availableUsers, onEdit }: { activity: Activity, onClose: () => void, onUpdate: (a: Activity) => void, availableUsers: string[], onEdit: () => void }) {
  const StatusIcon = statusConfig[activity.status].icon;
  const statusConf = statusConfig[activity.status];
  const PrioIcon = priorityConfig[activity.priority].icon;
  const prioConf = priorityConfig[activity.priority];

  const today = startOfDay(new Date());
  const isOverdue = startOfDay(activity.endDate) < today && activity.status !== 'completed';

  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const toggleCollaborator = (name: string) => {
    const updatedTags = activity.taggedCollaborators.includes(name)
      ? activity.taggedCollaborators.filter(c => c !== name)
      : [...activity.taggedCollaborators, name];
    onUpdate({ ...activity, taggedCollaborators: updatedTags });
  };

  return (
    <>
      <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {isOverdue && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
             <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
             <div>
               <h4 className="text-sm font-bold text-rose-800">Atividade Atrasada</h4>
               <p className="text-xs text-rose-600 mt-0.5">O prazo planejado para esta atividade foi ultrapassado.</p>
             </div>
          </div>
        )}

        {/* Title Area */}
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
            {activity.title}
          </h2>
          <div className="flex items-center gap-2 mt-3">
             <span className={cn("px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5", statusConf.bg, statusConf.color, statusConf.border, "border")}>
               <StatusIcon size={14} /> {statusConf.label}
             </span>
             <span className="text-sm text-slate-400">em</span>
             <span className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 cursor-pointer hover:text-blue-600 transition-colors">
               {activity.project}
             </span>
          </div>
        </div>

        {/* Audit Info (Created by/at) */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-100">
           <span className="flex items-center gap-1.5">Criado por: <strong className="text-slate-600">{activity.createdBy}</strong></span>
           <span className="flex items-center gap-1.5">Criado em: <strong className="text-slate-600">{format(activity.createdAt, "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</strong></span>
        </div>

        {/* Properties Grid */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 grid grid-cols-1 gap-y-4">
          
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <User size={16} /> Responsável
            </span>
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">
                {activity.assignee.name.charAt(0)}
              </div>
              <span className="text-sm font-semibold text-slate-700">{activity.assignee.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <AlertCircle size={16} /> Prioridade
            </span>
            <div className="flex items-center gap-1.5">
               <PrioIcon size={14} className={prioConf.color} />
               <span className="text-sm font-semibold text-slate-700">{prioConf.label}</span>
            </div>
          </div>

        </div>

        {/* Prazos Area */}
        <div className="grid grid-cols-2 gap-4">
           {/* Prazo Planejado */}
           <div className="border border-slate-200 rounded-2xl p-4 shadow-sm bg-white">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
                <Calendar size={12} /> Prazo Planejado
              </h4>
              <div className="space-y-2">
                 <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">Data Inicial</p>
                    <p className="text-sm font-bold text-slate-800">{format(activity.startDate, "dd MMM yyyy", { locale: ptBR })}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">Data Final</p>
                    <p className="text-sm font-bold text-slate-800">{format(activity.endDate, "dd MMM yyyy", { locale: ptBR })}</p>
                 </div>
              </div>
           </div>

           {/* Prazo Executado */}
           <div className="border border-slate-200 rounded-2xl p-4 shadow-sm bg-slate-50">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
                <CheckCircle2 size={12} /> Prazo Executado
              </h4>
              <div className="space-y-2">
                 <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">Data Inicial</p>
                    <p className="text-sm font-bold text-slate-800">
                      {activity.actualStartDate ? format(activity.actualStartDate, "dd MMM yyyy", { locale: ptBR }) : '-'}
                    </p>
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">Data Final</p>
                    <p className="text-sm font-bold text-slate-800">
                      {activity.actualEndDate ? format(activity.actualEndDate, "dd MMM yyyy", { locale: ptBR }) : '-'}
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Colaboradores Marcados */}
        <div className="space-y-3 relative">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Users size={16} /> Colaboradores Marcados
          </h3>
          
          <div 
            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            className="min-h-[44px] bg-white border border-slate-200 rounded-xl p-2 cursor-pointer hover:border-blue-400 transition-colors flex flex-wrap gap-2 items-center"
          >
            {activity.taggedCollaborators.length > 0 ? (
              activity.taggedCollaborators.map(name => (
                <div key={name} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                   {name}
                </div>
              ))
            ) : (
              <span className="text-sm text-slate-400 px-2">Marcar colaborador...</span>
            )}
          </div>

          {/* Tag Dropdown */}
          {isTagDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
               <div className="p-2 border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Notificar Colaboradores
               </div>
               <div className="max-h-48 overflow-y-auto">
                 {availableUsers.map(user => {
                   const isSelected = activity.taggedCollaborators.includes(user);
                   return (
                     <div 
                       key={user}
                       onClick={() => toggleCollaborator(user)}
                       className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                     >
                       <div className={cn("size-4 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300")}>
                         {isSelected && <CheckCircle2 size={12} />}
                       </div>
                       <span className="text-sm font-medium text-slate-700">{user}</span>
                     </div>
                   )
                 })}
               </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <AlignLeft size={16} /> Descrição
          </h3>
          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            {activity.description || 'Nenhuma descrição fornecida.'}
          </div>
        </div>
        
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
         <button onClick={onEdit} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-600/20">
           Editar Atividade
         </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------
// Activity Form Modal (Create / Edit)
// ---------------------------------------------------------

function ActivityFormModal({ onClose, onSave, currentUser, availableUsers, initialData }: { onClose: () => void, onSave: (act: Activity) => void, currentUser: string, availableUsers: string[], initialData?: Activity }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [project, setProject] = useState(initialData?.project || '');
  const [assignee, setAssignee] = useState(initialData?.assignee.name || currentUser);
  const [startDate, setStartDate] = useState(format(initialData?.startDate || new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(initialData?.endDate || addMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium');
  const [description, setDescription] = useState(initialData?.description || '');
  const [taggedCollaborators, setTaggedCollaborators] = useState<string[]>(initialData?.taggedCollaborators || []);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !project || !startDate || !endDate) return;

    const newActivity: Activity = {
      id: initialData?.id || Math.random().toString(36).substring(7),
      title,
      project,
      assignee: { name: assignee, avatar: initialData?.assignee.avatar },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      actualStartDate: initialData?.actualStartDate || null,
      actualEndDate: initialData?.actualEndDate || null,
      priority,
      status: initialData?.status || 'pending',
      description,
      progress: initialData?.progress || 0,
      createdBy: initialData?.createdBy || currentUser,
      createdAt: initialData?.createdAt || new Date(),
      taggedCollaborators
    };

    onSave(newActivity);
  };

  const toggleCollaborator = (name: string) => {
    setTaggedCollaborators(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
             <h2 className="text-xl font-black text-slate-900 tracking-tight">{initialData ? 'Editar Atividade' : 'Nova Atividade'}</h2>
             <p className="text-xs font-medium text-slate-500 mt-0.5">{initialData ? 'Atualize os dados da atividade' : 'Preencha os dados do planejamento da atividade'}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form id="create-activity-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Audit Fields (Read Only) */}
          <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
             <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Criado por</label>
                <div className="text-sm font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg cursor-not-allowed opacity-80 flex items-center gap-2">
                   <User size={14} className="text-slate-400" />
                   {initialData?.createdBy || currentUser}
                </div>
             </div>
             <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Criado em</label>
                <div className="text-sm font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg cursor-not-allowed opacity-80 flex items-center gap-2">
                   <Clock size={14} className="text-slate-400" />
                   {format(initialData?.createdAt || new Date(), "dd/MM/yyyy HH:mm")}
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Título da Atividade *</label>
                <input 
                  type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Ex: Reunião de Alinhamento"
                />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">Projeto *</label>
                  <input 
                    type="text" required value={project} onChange={e => setProject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Ex: Marketing"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">Responsável Principal</label>
                  <select 
                    value={assignee} onChange={e => setAssignee(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    {availableUsers.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5"><Calendar size={12}/> Prazo Planejado</label>
                  <div className="space-y-3">
                     <div>
                       <span className="text-xs text-slate-500 mb-1 block">Data Inicial *</span>
                       <input 
                         type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
                         className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-blue-500 transition-all"
                       />
                     </div>
                     <div>
                       <span className="text-xs text-slate-500 mb-1 block">Data Final *</span>
                       <input 
                         type="date" required value={endDate} onChange={e => setEndDate(e.target.value)}
                         className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-blue-500 transition-all"
                       />
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div>
                     <label className="text-xs font-bold text-slate-700 mb-1.5 block">Prioridade</label>
                     <select 
                       value={priority} onChange={e => setPriority(e.target.value as Priority)}
                       className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                     >
                       <option value="low">Baixa</option>
                       <option value="medium">Média</option>
                       <option value="high">Alta</option>
                     </select>
                   </div>

                   {/* Marcar Colaboradores no Cadastro */}
                   <div className="relative">
                     <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><Users size={14}/> Marcar Colaboradores</label>
                     <div 
                        onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                        className="min-h-[42px] bg-white border border-slate-300 rounded-xl p-2 cursor-pointer focus-within:border-blue-500 transition-all flex flex-wrap gap-1.5 items-center"
                     >
                        {taggedCollaborators.length > 0 ? (
                          taggedCollaborators.map(name => (
                            <div key={name} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded border border-blue-100">
                              {name}
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400 px-2">Clique para marcar...</span>
                        )}
                     </div>

                     {isTagDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-40 overflow-y-auto">
                           {availableUsers.map(user => {
                             const isSelected = taggedCollaborators.includes(user);
                             return (
                               <div 
                                 key={user} onClick={() => toggleCollaborator(user)}
                                 className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
                               >
                                 <div className={cn("size-4 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300")}>
                                   {isSelected && <CheckCircle2 size={12} />}
                                 </div>
                                 <span className="text-sm font-medium text-slate-700">{user}</span>
                               </div>
                             )
                           })}
                        </div>
                     )}
                   </div>
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Descrição</label>
                <textarea 
                  value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder="Detalhes adicionais sobre a atividade..."
                />
             </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
           <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
             Cancelar
           </button>
           <button type="submit" form="create-activity-form" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2">
             <Plus size={16} /> {initialData ? 'Salvar Alterações' : 'Cadastrar Atividade'}
           </button>
        </div>
      </motion.div>
    </div>
  );
}
