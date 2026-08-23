import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Calendar, 
  LogOut, 
  Activity,
  User,
  Monitor
} from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implementar logout simples
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { to: '/pacientes', label: 'Pacientes', icon: Users },
    { to: '/atendimento', label: 'Central de Chat', icon: MessageSquare },
    { to: '/agenda', label: 'Agenda & Consultas', icon: Calendar },
    { to: '/tecnologia', label: 'Tecnologia', icon: Monitor },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b13] text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d1321] border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Clinic Name */}
          <div className="p-6 border-b border-gray-800 flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
              <Activity className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-white">Ahut Ecosystem</h1>
              <span className="text-xs text-sky-400 font-medium tracking-wide uppercase">Hub de Tecnologia & IA</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.07)]'
                        : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 border border-transparent'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar Profile & Logout */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-900/50 rounded-xl border border-gray-800/80">
            <div className="h-9 w-9 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400">
              <User className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-gray-200 truncate">Tech Squad Ahut</h4>
              <p className="text-[10px] text-gray-400 truncate">tech@ahut.com.br</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/5 transition-all duration-200 border border-transparent hover:border-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 border-b border-gray-800 bg-[#0d1321]/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-400 font-medium">WhatsApp Broker Ativo</span>
          </div>
          <div className="text-xs text-gray-400">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto bg-[#070b13] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
