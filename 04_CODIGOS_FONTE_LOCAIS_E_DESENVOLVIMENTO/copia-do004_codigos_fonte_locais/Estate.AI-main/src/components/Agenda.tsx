import { useState } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const visits = [
  { id: 1, day: 2, time: '10:00', client: 'Ricardo Oliveira', property: 'Apto. Duplex, Jardins', status: 'confirmed' },
  { id: 2, day: 4, time: '14:30', client: 'Ana Clara Souza', property: 'Casa no Lago', status: 'completed' },
  { id: 3, day: 4, time: '16:00', client: 'Marcos Silva', property: 'Ap. Centro', status: 'scheduled' },
  { id: 4, day: 8, time: '09:00', client: 'Ana Clara Souza', property: 'Casa no Lago', status: 'completed' },
  { id: 5, day: 8, time: '14:00', client: 'Ricardo Oliveira', property: 'Zoom Meeting', status: 'scheduled' },
  { id: 6, day: 9, time: '11:00', client: 'Vila Nova', property: 'Vila Nova', status: 'confirmed' },
];

export default function Agenda() {
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 1)); // Outubro 2023

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-bold px-4">Outubro 2023</span>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Hoje</button>
          
          <div className="flex p-1 bg-slate-200/50 rounded-xl ml-4">
            <button className="px-4 py-1.5 text-xs font-bold bg-white text-slate-900 rounded-lg shadow-sm">Mês</button>
            <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Semana</button>
            <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Dia</button>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Evento
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100">
            {days.map(day => (
              <div key={day} className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - 0; // Simplified calendar logic
              const dayVisits = visits.filter(v => v.day === dayNum);
              
              return (
                <div key={i} className={cn(
                  "min-h-[120px] p-2 border-r border-b border-slate-50 last:border-r-0 relative",
                  dayNum <= 0 || dayNum > 31 ? "bg-slate-50/50" : "bg-white"
                )}>
                  {dayNum > 0 && dayNum <= 31 && (
                    <>
                      <span className={cn(
                        "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1",
                        dayNum === 8 ? "bg-orange-500 text-white" : "text-slate-400"
                      )}>
                        {dayNum}
                      </span>
                      <div className="space-y-1">
                        {dayVisits.map(visit => (
                          <div key={visit.id} className={cn(
                            "p-1.5 rounded-md text-[9px] font-bold truncate border",
                            visit.status === 'confirmed' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            visit.status === 'completed' ? "bg-purple-50 text-purple-600 border-purple-100" :
                            "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                            {visit.time} - {visit.client.split(' ')[0]}...
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Visitas do Dia</h3>
              <span className="text-xs text-slate-400">8 Out, Terça</span>
            </div>

            <div className="bg-orange-500 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold px-2 py-1 bg-white/20 rounded-full uppercase">Próxima Visita</span>
                  <span className="text-[10px] font-bold opacity-80">Em 45 min</span>
                </div>
                <h4 className="text-xl font-bold mb-1">Ricardo Oliveira</h4>
                <p className="text-sm opacity-80 mb-4">Apto. Duplex, Jardins</p>
                <div className="flex items-center gap-2 text-sm font-bold mb-6">
                  <Clock className="w-4 h-4" />
                  14:00 - 15:30
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="py-2 bg-white text-orange-500 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">Iniciar Rota</button>
                  <button className="py-2 bg-white/20 text-white rounded-lg text-xs font-bold hover:bg-white/30 transition-colors">Check-in</button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            </div>

            <div className="rounded-2xl border border-slate-100 overflow-hidden mb-6">
              <img src="https://picsum.photos/seed/map/400/200" alt="Map" className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
              <div className="p-3 bg-slate-50 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-bold text-slate-600">R. Augusta, 1402 - SP</span>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cronograma</h4>
              <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                  <p className="text-[10px] text-slate-400 font-bold mb-1">09:00 - 10:30</p>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <p className="text-sm font-bold text-slate-900">Ana Clara Souza</p>
                    <p className="text-xs text-slate-500 mb-2">Visita - Casa no Lago</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full">Realizada</span>
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow-sm" />
                  <p className="text-[10px] text-slate-400 font-bold mb-1">14:00 - 15:30</p>
                  <div className="p-3 rounded-xl border border-orange-100 bg-orange-50/30">
                    <p className="text-sm font-bold text-slate-900">Ricardo Oliveira</p>
                    <p className="text-xs text-slate-500 mb-3">Visita - Apto Duplex</p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-lg">Confirmar Chegada</button>
                      <button className="px-3 py-1 bg-white border border-slate-200 text-slate-400 text-[10px] font-bold rounded-lg">Reagendar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Criar Visita */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Criar Visita</h3>
                  <p className="text-xs text-slate-500">Agende uma nova visita ao imóvel</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Lead *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Buscar lead pelo nome, email ou telefone..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-10 py-2 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
                </div>
                <p className="text-[10px] text-slate-400 italic">O lead será clicável no card da visita</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Imóvel *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Buscar imóvel: código, nome ou localização..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-10 py-2 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Data *</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Horário *</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-orange-500">
                    <option>Selecione</option>
                    <option>09:00</option>
                    <option>10:00</option>
                    <option>14:00</option>
                    <option>16:00</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">SLA</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-orange-500">
                  <option>48h</option>
                  <option>24h</option>
                  <option>12h</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-700">Confirmado *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all">
                    <CheckCircle2 className="w-4 h-4" />
                    Sim, confirmada
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold transition-all">
                    <AlertCircle className="w-4 h-4" />
                    Pendente
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 italic">Evento aparecerá em vermelho (pendência)</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                Cancelar
              </button>
              <button className="px-6 py-2 rounded-lg text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-lg shadow-orange-500/20">
                Criar Visita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
