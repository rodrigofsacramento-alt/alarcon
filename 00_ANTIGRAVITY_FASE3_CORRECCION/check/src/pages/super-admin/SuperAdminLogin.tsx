import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logoEstate from '@/assets/logo-estate.png';
import { translateError } from '@/lib/error-messages';
export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const {
    signIn,
    isSuperAdmin,
    loading,
    adminCheckLoading
  } = useSuperAdmin();
  const {
    toast
  } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!loading && !adminCheckLoading && isSuperAdmin) {
      navigate('/super-admin', {
        replace: true
      });
    }
  }, [adminCheckLoading, isSuperAdmin, loading, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    console.log('[SuperAdmin Login] Tentando login com:', email);
    try {
      const {
        error
      } = await signIn(email, password);
      console.log('[SuperAdmin Login] Resultado signIn:', {
        error
      });
      if (error) {
        console.error('[SuperAdmin Login Error]', error);
        toast({
          title: 'Falha no login',
          description: translateError(error),
          variant: 'destructive'
        });
        setSubmitting(false);
        return;
      }
      console.log('[SuperAdmin Login] Login bem-sucedido, aguardando redirecionamento...');
    } catch (err) {
      console.error('[SuperAdmin Login] Exceção inesperada:', err);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao tentar fazer login. Verifique o console.',
        variant: 'destructive'
      });
      setSubmitting(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center p-4" style={{
    background: 'linear-gradient(135deg, #0f1829 0%, #1a2744 50%, #0f1829 100%)'
  }}>
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl" style={{
        background: 'radial-gradient(circle, rgba(200,89,10,0.08) 0%, transparent 70%)'
      }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{
        background: 'radial-gradient(circle, rgba(30,45,94,0.4) 0%, transparent 70%)'
      }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logoEstate} alt="Estate.ia" className="h-16 mx-auto mb-5" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium" style={{
          borderColor: 'rgba(200,89,10,0.4)',
          background: 'rgba(200,89,10,0.08)',
          color: '#e07a3a'
        }}>
            <Shield className="w-3 h-3" />
            Painel de Controle Global
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl backdrop-blur" style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
          <div className="flex items-center gap-2 mb-6 p-3 rounded-lg" style={{
          background: 'rgba(200,89,10,0.08)',
          border: '1px solid rgba(200,89,10,0.2)'
        }}>
            <Lock className="w-4 h-4 shrink-0" style={{
            color: '#e07a3a'
          }} />
            <p className="text-xs" style={{
            color: '#e07a3a'
          }}>Acesso restrito a administradores globais</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@estate.ia" className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm" style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                outline: 'none'
              }} onFocus={e => e.currentTarget.style.borderColor = 'rgba(200,89,10,0.6)'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-10 pr-12 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm" style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
              }} onFocus={e => e.currentTarget.style.borderColor = 'rgba(200,89,10,0.6)'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm" style={{
            background: 'linear-gradient(135deg, #c8590a, #e07a3a)',
            boxShadow: '0 4px 20px rgba(200,89,10,0.3)'
          }}>
              {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Entrando...</> : <><Shield className="w-4 h-4" /> Acessar Painel</>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{
        color: 'rgba(255,255,255,0.2)'
      }}>
          Estate.ia &copy; {new Date().getFullYear()} · Todos os direitos reservados
        </p>
      </div>
    </div>;
}