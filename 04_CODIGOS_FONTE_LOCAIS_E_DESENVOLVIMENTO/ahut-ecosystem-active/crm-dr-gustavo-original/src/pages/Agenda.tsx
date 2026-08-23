import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  User,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Consulta {
  id: string;
  pacienteNome: string;
  horario: string;
  duracao: string;
  tipo: string;
  status: 'Confirmado' | 'Aguardando' | 'Cancelado';
}

const mockConsultas: Record<string, Consulta[]> = {
  '2026-07-24': [
    { id: '1', pacienteNome: 'Mariana Silva', horario: '09:00', duracao: '30 min', tipo: 'Cardiologia - Primeira Consulta', status: 'Confirmado' },
    { id: '2', pacienteNome: 'Carlos Eduardo', horario: '10:30', duracao: '45 min', tipo: 'Retorno Pós-Cirúrgico', status: 'Confirmado' },
    { id: '3', pacienteNome: 'Beatriz Santos', horario: '13:00', duracao: '30 min', tipo: 'Dermatologia - Avaliação', status: 'Aguardando' },
    { id: '4', pacienteNome: 'Ricardo Oliveira', horario: '14:30', duracao: '30 min', tipo: 'Ortopedia - Primeira Consulta', status: 'Confirmado' },
  ],
  '2026-07-25': [
    { id: '5', pacienteNome: 'Fernanda Souza', horario: '09:30', duracao: '30 min', tipo: 'Consulta Geral', status: 'Confirmado' },
    { id: '6', pacienteNome: 'Gabriel Costa', horario: '11:00', duracao: '30 min', tipo: 'Exames de Sangue', status: 'Aguardando' },
    { id: '7', pacienteNome: 'Juliana Paes', horario: '15:00', duracao: '60 min', tipo: 'Pequena Cirurgia Dermatológica', status: 'Confirmado' }
  ]
};

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState('2026-07-24');
  const [consultas, setConsultas] = useState<Record<string, Consulta[]>>(mockConsultas);
  const [showModal, setShowModal] = useState(false);

  // New appointment form state
  const [newPaciente, setNewPaciente] = useState('');
  const [newHorario, setNewHorario] = useState('09:00');
  const [newDuracao, setNewDuracao] = useState('30 min');
  const [newTipo, setNewTipo] = useState('');
  const [newDate, setNewDate] = useState('2026-07-24');

  const activeConsultas = consultas[selectedDate] || [];

  const handleAddConsulta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaciente) return;

    const newConsulta: Consulta = {
      id: String(Date.now()),
      pacienteNome: newPaciente,
      horario: newHorario,
      duracao: newDuracao,
      tipo: newTipo || 'Consulta Geral',
      status: 'Aguardando'
    };

    const dateList = consultas[newDate] || [];
    // Insert sorted by hour
    const updatedList = [...dateList, newConsulta].sort((a, b) => a.horario.localeCompare(b.horario));

    setConsultas({
      ...consultas,
      [newDate]: updatedList
    });

    setShowModal(false);
    setNewPaciente('');
    setNewTipo('');
  };

  const handleStatusChange = (id: string, newStatus: 'Confirmado' | 'Aguardando' | 'Cancelado') => {
    const updatedList = activeConsultas.map(c => {
      if (c.id === id) {
        return { ...c, status: newStatus };
      }
      return c;
    });

    setConsultas({
      ...consultas,
      [selectedDate]: updatedList
    });
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Agenda de Consultas</h2>
          <p className="text-xs text-gray-400 mt-1">Organize seus atendimentos médicos e gerencie confirmações automáticas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(14,165,233,0.15)] flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Mini Calendar Navigator */}
        <div className="bg-[#0d1321]/60 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-800">
            <span className="font-bold text-sm text-white">Navegar por Datas</span>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-gray-800 rounded text-gray-400"><ChevronLeft className="h-4 w-4" /></button>
              <button className="p-1 hover:bg-gray-800 rounded text-gray-400"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => setSelectedDate('2026-07-24')}
              className={`w-full p-4 rounded-xl text-left border transition-all ${
                selectedDate === '2026-07-24'
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  : 'bg-transparent border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider">Hoje</div>
              <div className="font-bold text-sm text-white mt-0.5">Sexta-feira, 24 de Julho</div>
              <span className="text-[10px] text-gray-500 block mt-1">4 agendamentos</span>
            </button>

            <button
              onClick={() => setSelectedDate('2026-07-25')}
              className={`w-full p-4 rounded-xl text-left border transition-all ${
                selectedDate === '2026-07-25'
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  : 'bg-transparent border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider">Amanhã</div>
              <div className="font-bold text-sm text-white mt-0.5">Sábado, 25 de Julho</div>
              <span className="text-[10px] text-gray-500 block mt-1">3 agendamentos</span>
            </button>
          </div>
        </div>

        {/* Right Side: Appointment List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0d1321]/40 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-sky-400" />
              Agendamentos para {selectedDate === '2026-07-24' ? 'Hoje (24/07)' : 'Amanhã (25/07)'}
            </h3>

            <div className="space-y-4">
              {activeConsultas.length > 0 ? (
                activeConsultas.map((consulta) => (
                  <div 
                    key={consulta.id}
                    className="p-4 bg-gray-900/20 border border-gray-800/80 hover:border-gray-700/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Horário block */}
                      <div className="px-3 py-2 bg-sky-500/5 border border-sky-500/10 rounded-xl text-sky-400 text-center shrink-0 min-w-[70px]">
                        <span className="font-bold text-sm block">{consulta.horario}</span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">{consulta.duracao}</span>
                      </div>
                      
                      {/* Detalhes */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-gray-200 flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-gray-500" />
                          {consulta.pacienteNome}
                        </h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-teal-500" />
                          {consulta.tipo}
                        </p>
                      </div>
                    </div>

                    {/* Status Actions */}
                    <div className="flex items-center gap-3 self-end md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-850">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded ${
                        consulta.status === 'Confirmado' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : consulta.status === 'Aguardando'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {consulta.status}
                      </span>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleStatusChange(consulta.id, 'Confirmado')}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/10 transition-colors"
                          title="Confirmar Consulta"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(consulta.id, 'Cancelado')}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/10 transition-colors"
                          title="Cancelar Consulta"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 text-sm">
                  Nenhuma consulta agendada para esta data.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: New Booking */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0d1321] border border-gray-800 p-6 rounded-2xl shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Novo Agendamento Clínico</h3>
            
            <form onSubmit={handleAddConsulta} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Paciente</label>
                <input
                  type="text"
                  required
                  value={newPaciente}
                  onChange={(e) => setNewPaciente(e.target.value)}
                  placeholder="Nome do paciente"
                  className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-2.5 px-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Data</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-2 px-3 text-sm text-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Horário</label>
                  <input
                    type="time"
                    value={newHorario}
                    onChange={(e) => setNewHorario(e.target.value)}
                    className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-2 px-3 text-sm text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Duração</label>
                  <select
                    value={newDuracao}
                    onChange={(e) => setNewDuracao(e.target.value)}
                    className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-2 px-3 text-sm text-white outline-none transition-all"
                  >
                    <option value="15 min">15 minutos</option>
                    <option value="30 min">30 minutos</option>
                    <option value="45 min">45 minutos</option>
                    <option value="60 min">60 minutos</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Especialidade</label>
                  <input
                    type="text"
                    value={newTipo}
                    onChange={(e) => setNewTipo(e.target.value)}
                    placeholder="Ex: Cardiologia"
                    className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-2 px-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-800 hover:bg-gray-800/40 text-gray-400 hover:text-gray-200 text-sm font-semibold rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
