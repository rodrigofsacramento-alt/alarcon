import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Pacientes Cadastrados', value: '184', icon: Users, change: '+12 este mês', color: 'text-sky-400 bg-sky-500/10' },
    { label: 'Consultas Agendadas', value: '28', icon: CalendarDays, change: '12 hoje', color: 'text-teal-400 bg-teal-500/10' },
    { label: 'Retornos Pendentes', value: '14', icon: Clock, change: 'Requer atenção', color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Confirmações (WhatsApp)', value: '89%', icon: CheckCircle2, change: 'Altamente eficaz', color: 'text-emerald-400 bg-emerald-500/10' },
  ];

  const proximasConsultas = [
    { paciente: 'Mariana Silva', horario: '09:00', tipo: 'Consulta Geral', status: 'Confirmado' },
    { paciente: 'Carlos Eduardo', horario: '10:30', tipo: 'Retorno Pós-Cirúrgico', status: 'Confirmado' },
    { paciente: 'Beatriz Santos', horario: '13:00', tipo: 'Avaliação de Exames', status: 'Aguardando' },
    { paciente: 'Ricardo Oliveira', horario: '14:30', tipo: 'Consulta Geral', status: 'Confirmado' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-900/40 via-teal-900/20 to-transparent p-8 rounded-3xl border border-sky-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>Painel Atualizado em Tempo Real</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Olá, Dr. Gustavo</h2>
          <p className="text-gray-400 max-w-xl">
            Sua agenda de hoje está cheia e o WhatsApp Broker já confirmou automaticamente 95% das consultas agendadas para amanhã.
          </p>
        </div>
        <button 
          onClick={() => navigate('/atendimento')}
          className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(14,165,233,0.2)] flex items-center gap-2 group self-start md:self-auto"
        >
          <MessageSquare className="h-4 w-4" />
          Abrir Central de Chat
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-[#0d1321]/60 border border-gray-800 p-6 rounded-2xl flex items-center justify-between hover:border-gray-700/60 transition-all duration-200">
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                <span className="text-[10px] text-gray-500 block font-medium">{stat.change}</span>
              </div>
              <div className={`p-4 rounded-xl ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Próximas Consultas */}
        <div className="bg-[#0d1321]/40 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-800">
            <h3 className="font-bold text-lg text-white">Consultas Hoje</h3>
            <button 
              onClick={() => navigate('/agenda')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Ver agenda completa
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-800/60">
            {proximasConsultas.map((consulta, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-gray-200">{consulta.paciente}</h4>
                  <p className="text-xs text-gray-500">{consulta.tipo}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-sky-400 bg-sky-500/5 border border-sky-500/10 px-2.5 py-1 rounded-lg">
                    {consulta.horario}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    consulta.status === 'Confirmado' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {consulta.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas Ações do WhatsApp Broker */}
        <div className="bg-[#0d1321]/40 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-800">
            <h3 className="font-bold text-lg text-white">Ações Recentes (WhatsApp)</h3>
            <button 
              onClick={() => navigate('/atendimento')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Gerenciar conversas
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 p-3 bg-gray-900/30 rounded-xl border border-gray-800/50">
              <div className="h-8 w-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-200">Confirmação automática de consulta</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">Paciente Mariana Silva confirmou a consulta das 09:00.</p>
                <span className="text-[9px] text-gray-600 block mt-1">Há 10 minutos</span>
              </div>
            </div>

            <div className="flex gap-4 p-3 bg-gray-900/30 rounded-xl border border-gray-800/50">
              <div className="h-8 w-8 bg-sky-500/10 text-sky-400 rounded-lg flex items-center justify-center shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-200">Novo paciente cadastrado</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">Ricardo Oliveira entrou em contato via chat e foi cadastrado como lead.</p>
                <span className="text-[9px] text-gray-600 block mt-1">Há 45 minutos</span>
              </div>
            </div>

            <div className="flex gap-4 p-3 bg-gray-900/30 rounded-xl border border-gray-800/50">
              <div className="h-8 w-8 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-200">Aviso de atraso enviado</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">Lembrete de consulta enviado para Beatriz Santos (consulta às 13:00).</p>
                <span className="text-[9px] text-gray-600 block mt-1">Há 2 horas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
