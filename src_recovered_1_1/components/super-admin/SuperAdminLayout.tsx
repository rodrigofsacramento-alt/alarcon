import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import {
  Shield, Building2, Users, CreditCard, BarChart3,
  ScrollText, Settings, LogOut, Menu, ChevronRight,
  Globe, Layers, Wallet, Megaphone, Activity, Plug
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logoEstate from '@/assets/logo-estate.png';

const navItems = [
  { to: '/super-admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/super-admin/tenants', label: 'Empresas', icon: Building2 },
  { to: '/super-admin/plans', label: 'Planos', icon: Layers },
  { to: '/super-admin/subscriptions', label: 'Assinaturas', icon: CreditCard },
  { to: '/super-admin/financial', label: 'Financeiro', icon: Wallet },
  { to: '/super-admin/communications', label: 'Comunicações', icon: Megaphone },
  { to: '/super-admin/health', label: 'Saúde do SaaS', icon: Activity },
  { to: '/super-admin/integrations', label: 'Integrações', icon: Plug },
  { to: '/super-admin/users', label: 'Usuários Globais', icon: Users },
  { to: '/super-admin/audit', label: 'Auditoria', icon: ScrollText },
];

interface Props {
  children: React.ReactNode;
}

export function SuperAdminLayout({ children }: Props) {
  const { signOut } = useSuperAdmin();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/super-admin/login', { replace: true });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="pl-3 pr-8 py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <img src={logoEstate} alt="Estate.ia" className="w-full h-auto object-contain scale-110 origin-left -my-4" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Menu</p>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group',
              isActive ? 'font-medium' : ''
            )}
            style={({ isActive }) => isActive
              ? { background: 'rgba(200,89,10,0.15)', color: '#e07a3a', border: '1px solid rgba(200,89,10,0.2)' }
              : { color: 'rgba(255,255,255,0.45)', border: '1px solid transparent' }
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? '#c8590a' : 'rgba(255,255,255,0.3)' }} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3" style={{ color: '#c8590a' }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <NavLink
          to="/super-admin/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
          style={({ isActive }) => isActive
            ? { background: 'rgba(200,89,10,0.15)', color: '#e07a3a', border: '1px solid rgba(200,89,10,0.2)' }
            : { color: 'rgba(255,255,255,0.45)', border: '1px solid transparent' }
          }
        >
          <Settings className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          Configurações
        </NavLink>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
          style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex dark" style={{ background: '#0d1526' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 left-0 z-30" style={{ background: '#0f1829', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 inset-y-0 w-64 z-50" style={{ background: '#0f1829', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 px-4 lg:px-6 h-14 backdrop-blur" style={{ background: 'rgba(15,24,41,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Globe className="w-3.5 h-3.5" />
            <span>Painel Global</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(200,89,10,0.1)', border: '1px solid rgba(200,89,10,0.25)' }}>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium" style={{ color: '#e07a3a' }}>Super Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto" style={{ background: '#0d1526' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
