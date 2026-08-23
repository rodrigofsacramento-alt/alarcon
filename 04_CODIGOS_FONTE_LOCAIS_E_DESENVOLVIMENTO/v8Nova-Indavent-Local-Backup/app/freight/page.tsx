'use client';

import React, { useState } from 'react';
import { Truck, CheckCircle, XCircle, FileText, ChevronDown, ChevronUp, Zap, Phone, Mail, User, BarChart3 } from 'lucide-react';

// Mocks simulando a base de dados
const MOCK_PARTNERS = [
  {
    id: 1,
    name: 'Logística Rápida Brasil',
    contact: { name: 'João Silva', phone: '(11) 98888-7777', email: 'joao@logisticarapida.com.br' },
    stats: { quoted: 145, approved: 89, executed: 80, canceled: 9 }
  },
  {
    id: 2,
    name: 'Expresso Norte Sul LTDA',
    contact: { name: 'Maria Souza', phone: '(41) 97777-6666', email: 'maria@expressonorte.com' },
    stats: { quoted: 320, approved: 210, executed: 195, canceled: 15 }
  },
  {
    id: 3,
    name: 'TransCarga Continental',
    contact: { name: 'Pedro Santos', phone: '(31) 99999-5555', email: 'pedro@transcarga.com' },
    stats: { quoted: 80, approved: 35, executed: 30, canceled: 5 }
  }
];

const MOCK_BUDGETS = [
  { id: '101', title: 'Orçamento #101 - Carga SP para RJ (Refrigerada)' },
  { id: '102', title: 'Orçamento #102 - Eletrônicos (Valor Alto)' },
  { id: '103', title: 'Orçamento #103 - Maquinário Pesado MT' },
];

export default function FreightPartnersPage() {
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quoteTarget, setQuoteTarget] = useState<{ id: string | number, name: string } | null>(null);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const openQuoteModal = (target: { id: string | number, name: string }) => {
    setQuoteTarget(target);
    setSelectedBudget('');
    setIsModalOpen(true);
  };

  const executeAIQuote = () => {
    if (!selectedBudget) return;
    setIsProcessing(true);
    // Simula a chamada da Inteligência Artificial / Evolution API
    setTimeout(() => {
      setIsProcessing(false);
      setIsModalOpen(false);
      alert(`✅ Cotação via IA disparada com sucesso para: ${quoteTarget?.name}\nRespostas automatizadas em andamento via WhatsApp!`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-200">
      
      {/* HEADER E AÇÃO GLOBAL */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-500" />
            Parceiros de Frete
          </h1>
          <p className="text-slate-400 mt-2">Gerencie transportadoras, acompanhe métricas de sucesso e automatize cotações com IA.</p>
        </div>
        
        <button 
          onClick={() => openQuoteModal({ id: 'all', name: 'TODOS OS PARCEIROS' })}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105"
        >
          <Zap className="h-5 w-5" />
          Cotar Frete com Todos
        </button>
      </div>

      {/* LISTA DE PARCEIROS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {MOCK_PARTNERS.map(partner => {
          const isExpanded = expandedCardId === partner.id;
          
          return (
            <div key={partner.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-slate-700">
              {/* CABEÇALHO DO CARTÃO */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-slate-100">{partner.name}</h2>
                  <button 
                    onClick={() => toggleExpand(partner.id)}
                    className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>

                {/* MÉTRICAS (COUNTERS) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center text-center">
                    <FileText className="h-6 w-6 text-slate-400 mb-2" />
                    <span className="text-2xl font-black text-white">{partner.stats.quoted}</span>
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Cotados</span>
                  </div>
                  
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center text-center">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mb-2" />
                    <span className="text-2xl font-black text-emerald-400">{partner.stats.approved}</span>
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Aprovados</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center text-center">
                    <Truck className="h-6 w-6 text-blue-400 mb-2" />
                    <span className="text-2xl font-black text-blue-400">{partner.stats.executed}</span>
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Executados</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center text-center">
                    <XCircle className="h-6 w-6 text-rose-400 mb-2" />
                    <span className="text-2xl font-black text-rose-400">{partner.stats.canceled}</span>
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Cancelados</span>
                  </div>
                </div>
              </div>

              {/* ÁREA EXPANSÍVEL (CONTATOS E AÇÃO) */}
              {isExpanded && (
                <div className="bg-slate-800/50 p-6 border-t border-slate-800 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex flex-col sm:flex-row justify-between gap-6 items-center">
                    
                    {/* Contatos */}
                    <div className="space-y-3 w-full sm:w-auto">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Informações de Contato</h3>
                      <div className="flex items-center gap-3 text-slate-300">
                        <User className="h-4 w-4 text-slate-500" />
                        <span>{partner.contact.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span>{partner.contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <span>{partner.contact.email}</span>
                      </div>
                    </div>

                    {/* Botão de Cotação Específica */}
                    <button 
                      onClick={() => openQuoteModal(partner)}
                      className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-blue-600 text-white w-full sm:w-auto px-6 py-4 rounded-xl font-medium transition-colors border border-slate-600 h-fit"
                    >
                      <Zap className="h-5 w-5 text-amber-400" />
                      Cotar Automaticamente
                    </button>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL DE COTAÇÃO DE FRETE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-blue-500" />
                Iniciar Cotação via IA
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 bg-slate-900/50">
              <div>
                <p className="text-slate-300 mb-2">
                  Destinatário(s) da Cotação: 
                  <strong className="block text-white text-lg mt-1">{quoteTarget?.name}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Selecione o Orçamento-Base</label>
                <select 
                  value={selectedBudget} 
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                >
                  <option value="" disabled>-- Clique para selecionar --</option>
                  {MOCK_BUDGETS.map(budget => (
                    <option key={budget.id} value={budget.id}>
                      {budget.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 bg-slate-800/30 flex justify-end gap-3 border-t border-slate-800">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-lg text-slate-300 font-medium hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={executeAIQuote}
                disabled={!selectedBudget || isProcessing}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processando IA...' : 'Disparar Cotações'}
                {!isProcessing && <Zap className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
