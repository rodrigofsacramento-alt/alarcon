import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular login simples para o protótipo do Dr. Gustavo
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-screen bg-[#070b13] flex items-center justify-center p-4 font-sans text-gray-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(14,165,233,0.05),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(13,148,136,0.05),transparent_40%)]" />

      <div className="w-full max-w-md bg-[#0d1321]/60 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl relative z-10">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400 mb-4 border border-sky-500/20">
            <Activity className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Bem-vindo, Dr. Gustavo</h2>
          <p className="text-sm text-gray-400 mt-1">Acesse seu painel clínico inteligente</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">Email Corporativo</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@clinica.com"
                className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">Senha de Acesso</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070b13]/80 border border-gray-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl py-3.5 font-semibold text-sm transition-all duration-300 shadow-[0_4px_20px_rgba(14,165,233,0.2)] hover:shadow-[0_4px_25px_rgba(14,165,233,0.35)] flex items-center justify-center gap-2 group"
          >
            Acessar Painel
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-800/80 pt-6">
          Desenvolvido com exclusividade para Consultórios Médicos
        </div>
      </div>
    </div>
  );
}
