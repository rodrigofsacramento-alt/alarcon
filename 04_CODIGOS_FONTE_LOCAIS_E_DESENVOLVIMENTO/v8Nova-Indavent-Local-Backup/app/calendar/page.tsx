'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Video, 
  Users, 
  Clock, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  MoreVertical,
  MapPin,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

// Mock Data
const meetings = [
  { id: 1, title: 'Check-in Projeto Globex', time: '10:00', type: 'video', participants: 4, date: new Date(2026, 3, 15) },
  { id: 2, title: 'Alinhamento Comercial Indavent', time: '14:30', type: 'presencial', location: 'Sala 02', date: new Date(2026, 3, 15) },
  { id: 3, title: 'Review Sprint IA', time: '09:00', type: 'video', participants: 3, date: new Date(2026, 3, 16) },
];

const activities = [
  { id: 101, title: 'Revisar Proposta de Drywall', status: 'pending', priority: 'alta', date: new Date(2026, 3, 15) },
  { id: 102, title: 'Enviar e-mail para Leads Qualificados', status: 'doing', priority: 'media', date: new Date(2026, 3, 15) },
  { id: 103, title: 'Atualizar Planilha de Custos', status: 'done', priority: 'baixa', date: new Date(2026, 3, 14) },
  { id: 104, title: 'Ligação Follow-up - Cliente Tech', status: 'pending', priority: 'alta', date: new Date(2026, 3, 15) },
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day: Date) => setSelectedDate(day);

  // Filter items for selected day
  const dailyMeetings = meetings.filter(m => isSameDay(m.date, selectedDate));
  const dailyActivities = activities.filter(a => isSameDay(a.date, selectedDate));

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden sidebar-offset">
        <TopBar title="Minha Agenda" />
        
        <div className="p-4 sm:p-8 flex flex-col lg:flex-row gap-8 min-h-0 h-full">
          
          {/* Main Calendar Section */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">
                  Agenda <span className="text-blue-600 not-italic">& Atividades</span>
                </h1>
                <p className="text-slate-500 font-medium text-xs mt-1 lowercase italic">Gerenciamento de tempo e produtividade individual.</p>
              </div>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Filter size={14} /> Filtros
                 </button>
                 <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                    <Plus size={16} /> Novo Evento
                 </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
              <CalendarHeader 
                currentMonth={currentMonth} 
                prevMonth={prevMonth} 
                nextMonth={nextMonth} 
              />
              <div className="mt-10">
                <CalendarGrid 
                  currentMonth={currentMonth} 
                  selectedDate={selectedDate} 
                  onDateClick={onDateClick}
                  meetings={meetings}
                  activities={activities}
                />
              </div>
            </div>
          </div>

          {/* Daily Detail Sidebar (Desktop view) */}
          <div className="w-full lg:w-96 flex flex-col gap-6">
            {/* Header for Daily Details */}
            <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 size-32 bg-blue-600/20 blur-3xl rounded-full" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Compromissos para</p>
               <h3 className="text-2xl font-black italic uppercase tracking-tight">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
               </h3>
               <div className="flex gap-4 mt-6">
                  <div className="flex-1 bg-white/5 border border-white/10 p-3 rounded-2xl">
                     <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Reuniões</p>
                     <p className="text-lg font-black">{dailyMeetings.length}</p>
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 p-3 rounded-2xl">
                     <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Atividades</p>
                     <p className="text-lg font-black">{dailyActivities.length}</p>
                  </div>
               </div>
            </div>

            {/* Visual Separation: Meetings */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
               <section className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Video size={12} className="text-blue-500" /> Reuniões
                     </h4>
                  </div>
                  <div className="space-y-3">
                     {dailyMeetings.length > 0 ? dailyMeetings.map(meeting => (
                       <MeetingCard key={meeting.id} meeting={meeting} />
                     )) : (
                       <p className="text-xs font-medium text-slate-400 italic px-4">Nenhuma reunião para hoje.</p>
                     )}
                  </div>
               </section>

               <section className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <ClipboardList size={12} className="text-emerald-500" /> Atividades
                     </h4>
                  </div>
                  <div className="space-y-3">
                     {dailyActivities.length > 0 ? dailyActivities.map(activity => (
                        <ActivityCard key={activity.id} activity={activity} />
                     )) : (
                        <p className="text-xs font-medium text-slate-400 italic px-4">Nenhuma atividade pendente.</p>
                     )}
                  </div>
               </section>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function CalendarHeader({ currentMonth, prevMonth, nextMonth }: any) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">
        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
      </h2>
      <div className="flex gap-2">
        <button onClick={prevMonth} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
          <ChevronLeft size={20} />
        </button>
        <button onClick={nextMonth} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function CalendarGrid({ currentMonth, selectedDate, onDateClick, meetings, activities }: any) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const rows: any[] = [];
  const days: any[] = [];
  const dayInterval = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-6">
        {weekDays.map(day => (
          <div key={day} className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-[24px] border border-slate-100 overflow-hidden shadow-inner">
        {dayInterval.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const hasMeetings = meetings.some((m: any) => isSameDay(m.date, day));
          const hasActivities = activities.some((a: any) => isSameDay(a.date, day));

          return (
            <div 
              key={idx}
              onClick={() => onDateClick(day)}
              className={cn(
                "h-28 bg-white p-3 cursor-pointer transition-all relative group",
                !isCurrentMonth ? "bg-slate-50/50" : "hover:bg-blue-50/30",
                isSelected && "bg-blue-600/5 ring-2 ring-inset ring-blue-600/20"
              )}
            >
              <div className={cn(
                "size-8 flex items-center justify-center rounded-xl text-xs font-black transition-all",
                isToday(day) ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : 
                isSelected ? "bg-slate-900 text-white" : "text-slate-400 group-hover:text-slate-900"
              )}>
                {format(day, "d")}
              </div>

              {/* Event Markers */}
              <div className="absolute bottom-3 left-3 flex gap-1">
                 {hasMeetings && <div className="size-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
                 {hasActivities && <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MeetingCard({ meeting }: any) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-blue-500/30 transition-all group relative overflow-hidden">
       <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
       <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
             <div className="size-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                {meeting.type === 'video' ? <Video size={16} /> : <MapPin size={16} />}
             </div>
             <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{meeting.time}</span>
          </div>
          <button className="text-slate-300 hover:text-slate-900">
             <MoreVertical size={16} />
          </button>
       </div>
       <h5 className="text-sm font-black text-slate-900 mb-1 truncate">{meeting.title}</h5>
       <div className="flex items-center gap-2 text-slate-400">
          <Users size={12} />
          <span className="text-[10px] font-bold">{meeting.participants ? `${meeting.participants} pessoas` : meeting.location}</span>
       </div>
    </div>
  );
}

function ActivityCard({ activity }: any) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all group relative overflow-hidden">
       <div className={cn(
         "absolute top-0 left-0 w-1 h-full",
         activity.status === 'done' ? "bg-emerald-500" : 
         activity.status === 'doing' ? "bg-amber-500" : "bg-slate-300"
       )} />
       
       <div className="flex justify-between items-center mb-2">
          <div className={cn(
            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
            activity.priority === 'alta' ? "bg-rose-50 text-rose-500 border-rose-500/20" :
            activity.priority === 'media' ? "bg-amber-50 text-amber-500 border-amber-500/20" :
            "bg-slate-50 text-slate-500 border-slate-500/20"
          )}>
            {activity.priority}
          </div>
          {activity.status === 'done' && <CheckCircle2 size={14} className="text-emerald-500" />}
       </div>

       <h5 className={cn(
         "text-xs font-bold text-slate-900 leading-tight",
         activity.status === 'done' && "line-through text-slate-400 opacity-60"
       )}>
          {activity.title}
       </h5>

       <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
             {activity.status === 'done' ? 'Concluído' : activity.status === 'doing' ? 'Em progresso' : 'Pendente'}
          </span>
          <div className="flex gap-1.5">
             <button className="p-1 px-2 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                Marcar como concluído
             </button>
          </div>
       </div>
    </div>
  );
}
