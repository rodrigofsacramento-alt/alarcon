'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Loader2, AlertCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/reports/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await login(username, password);
      if (result.success) {
        // Redirecionamento após login bem sucedido
        window.location.href = '/reports/';
      } else {
        setError(result.error || 'Falha ao realizar login.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enquanto carrega o estado de autenticação, mostra um spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="font-medium tracking-widest uppercase text-[10px]">Autenticando...</p>
      </div>
    );
  }

  // Se já estiver logado, não mostra o form (o useEffect cuidará do redirect)
  if (user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6"
          >
            <ShieldCheck className="text-white" size={40} />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight text-center italic">
            INDAVENT <span className="text-blue-500 not-italic">CRM</span>
          </h1>
          <p className="text-slate-500 mt-2 font-bold tracking-widest uppercase text-[10px] opacity-70">
            Acesso Restrito ao Sistema
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[32px] shadow-2xl relative">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 mb-6"
              >
                <AlertCircle className="text-rose-500 shrink-0" size={18} />
                <p className="text-rose-200 text-sm font-semibold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">
                Usuário
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name.indavent"
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all duration-200 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">
                Senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all duration-200 font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all duration-300 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 outline-none"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Entrar no Sistema
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest opacity-40">
            Nova Indavent &copy; {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
