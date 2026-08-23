import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  UserPlus, 
  MessageSquare, 
  Calendar,
  Filter
} from 'lucide-react';

interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  tipoConsulta: string;
  dataCadastro: string;
  status: 'Agendado' | 'Retorno' | 'Aguardando' | 'Arquivado';
}

const mockPacientes: Paciente[] = [
  { id: '1', nome: 'Mariana Silva', telefone: '(11) 98765-4321', email: 'mariana.silva@email.com', tipoConsulta: 'Cardiologia', dataCadastro: '24/07/2026', status: 'Agendado' },
  { id: '2', nome: 'Carlos Eduardo', telefone: '(11) 97654-3210', email: 'carlos.edu@email.com', tipoConsulta: 'Retorno Pós-Cirúrgico', dataCadastro: '23/07/2026', status: 'Retorno' },
  { id: '3', nome: 'Beatriz Santos', telefone: '(11) 96543-2109', email: 'beatriz.santos@email.com', tipoConsulta: 'Dermatologia - Avaliação', dataCadastro: '22/07/2026', status: 'Aguardando' },
  { id: '4', nome: 'Ricardo Oliveira', telefone: '(11) 95432-1098', email: 'ricardo.oliveira@email.com', tipoConsulta: 'Ortopedia', dataCadastro: '21/07/2026', status: 'Agendado' },
  { id: '5', nome: 'Aline Souza', telefone: '(11) 94321-0987', email: 'aline.souza@email.com', tipoConsulta: 'Nutrologia', dataCadastro: '20/07/2026', status: 'Arquivado' },
];

export default function Pacientes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [pacientes, setPacientes] = useState<Paciente[]>(mockPacientes);
  
  // States for new patient form modal
  const [showModal, setShowModal] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newTelefone, setNewTelefone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTipo, setNewTipo] = useState('');

  const handleCreatePaciente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome || !newTelefone) return;

    const newPaciente: Paciente = {
      id: String(pacientes.length + 1),
      nome: newNome,
      telefone: newTelefone,
      email: newEmail || 'sem-email@email.com',
      tipoConsulta: newTipo || 'Consulta Geral',
      dataCadastro: new Date().toLocaleDateString('pt-BR'),
      status: 'Aguardando',
    };

    setPacientes([newPaciente, ...pacientes]);
    setShowModal(false);
    
    // Clear inputs
    setNewNome('');
    setNewTelefone('');
    setNewEmail('');
    setNewTipo('');
  };

  const handleStartChat = (paciente: Paciente) => {
    // Redireciona para o chat passando id do paciente
    navigate('/atendimento', { state: { pacienteId: paciente.id, pacienteNome: paciente.nome } });
  };

  const filteredPacientes = pacientes.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.telefone.includes(searchTerm) || 
                          p.tipoConsulta.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === 'todos' || p.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header bar of Pacientes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Pacientes & Leads</h2>
          <p className="text-xs text-gray-400 mt-1">Gerencie a entrada de novos pacientes e agende atendimentos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(14,165,233,0.15)] flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Cadastrar Paciente
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d1321]/60 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto max-w-full">
          <span className="text-gray-500 text-xs flex items-center gap-1 shrink-0">
            <Filter className="h-3.5 w-3.5" />
            Filtrar:
          </span>
          {['todos', 'agendado', 'retorno', 'aguardando', 'arquivado'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                statusFilter === f
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'bg-transparent text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d1321]/30 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs font-bold uppercase tracking-wider bg-[#0d1321]/50">
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Tipo/Especialidade</th>
                <th className="px-6 py-4">Cadastro</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40 text-sm">
              {filteredPacientes.length > 0 ? (
                filteredPacientes.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                          {p.nome.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-200">{p.nome}</h4>
                          <span className="text-xs text-gray-500 block">{p.telefone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-medium">
                      {p.tipoConsulta}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {p.dataCadastro}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        p.status === 'Agendado' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : p.status === 'Retorno'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : p.status === 'Aguardando'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStartChat(p)}
                          className="p-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg transition-colors border border-sky-500/10"
                          title="Iniciar conversa no WhatsApp"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate('/agenda')}
                          className="p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg transition-colors border border-teal-500/10"
                          title="Agendar Consulta"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    Nenhum paciente localizado para os filtros informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Cadastro de Paciente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0d1321] border border-gray-800 p-6 rounded-2xl shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Novo Cadastro de Paciente</h3>
            
            <form onSubmit={handleCreatePaciente} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  placeholder="Nome do paciente"
                  className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-2 px-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Telefone / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={newTelefone}
                  onChange={(e) => setNewTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-2 px-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">E-mail</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-2 px-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Especialidade / Tratamento</label>
                <input
                  type="text"
                  value={newTipo}
                  onChange={(e) => setNewTipo(e.target.value)}
                  placeholder="Ex: Cardiologia, Dermatologia..."
                  className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 rounded-xl py-2 px-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
                />
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
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
