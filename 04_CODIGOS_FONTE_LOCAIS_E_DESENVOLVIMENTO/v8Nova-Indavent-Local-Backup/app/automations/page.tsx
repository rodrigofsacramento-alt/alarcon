'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { Bot, MessageSquare, Zap, Settings, Shield, Link2, Key, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AutomationsPage() {
  const [openaiKey, setOpenaiKey] = useState('sk-proj-.....................');
  
  const [isProspectingActive, setIsProspectingActive] = useState(true);
  const [isQualificationActive, setIsQualificationActive] = useState(false);
  const [isFreightActive, setIsFreightActive] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden sidebar-offset">
        <TopBar title="Automações & IA" />
        
        <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Módulos de Automação</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Configure suas integrações de Inteligência Artificial e WhatsApp.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Toggles */}
            <div className="space-y-4 lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-blue-600" />
                  Status dos Serviços
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-semibold text-sm">Prospecção Ativa (Scraping)</p>
                      <p className="text-xs text-slate-500">Busca leads no Google Maps</p>
                    </div>
                    <button onClick={() => setIsProspectingActive(!isProspectingActive)}>
                      {isProspectingActive ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-semibold text-sm">Qualificação via IA (WPP)</p>
                      <p className="text-xs text-slate-500">GPT-4 responde clientes</p>
                    </div>
                    <button onClick={() => setIsQualificationActive(!isQualificationActive)}>
                      {isQualificationActive ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-semibold text-sm">Cotação de Frete API</p>
                      <p className="text-xs text-slate-500">Disparo via Webhook n8n</p>
                    </div>
                    <button onClick={() => setIsFreightActive(!isFreightActive)}>
                      {isFreightActive ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
                <Bot size={120} className="absolute -bottom-4 -right-4 text-white/5" />
                <h3 className="font-bold mb-2 relative z-10 flex items-center gap-2">
                  <Shield size={18} className="text-blue-400" />
                  Status de Conexão
                </h3>
                <p className="text-xs text-slate-400 relative z-10 mb-4">O núcleo de IA requer que ambas as APIs estejam conectadas para rodar fluxos complexos.</p>
                <div className="flex items-center gap-2 text-sm relative z-10">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-emerald-400">OpenAI Sincronizado</span>
                </div>
                <div className="flex items-center gap-2 text-sm relative z-10 mt-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-emerald-400">WhatsApp Sincronizado</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                  <div className="size-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Credenciais WhatsApp (Broker Local)</h2>
                    <p className="text-sm text-slate-500">O WhatsApp é gerenciado pelo nosso motor local (Baileys). Não é necessário token manual.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex gap-3 items-start">
                    <Shield className="shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-semibold text-sm">Integração Nativa Ativa</p>
                      <p className="text-xs opacity-90 mt-1">O sistema está conectado diretamente ao broker local. Para conectar o aparelho, acesse "Comercial {'>'} WhatsApp" e escaneie o QR Code.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                  <div className="size-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Inteligência Artificial (LLM)</h2>
                    <p className="text-sm text-slate-500">Credenciais para o motor de linguagem (GPT-4 / Llama).</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">OpenAI API Key (Secret)</label>
                    <div className="relative">
                      <Key size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="password" 
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                  <Save size={18} />
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
