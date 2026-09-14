import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebarBadges } from "@/hooks/use-sidebar-badges";
import logoEstate from "@/assets/logo-estate.png";
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  UserCheck,
  Smartphone,
  Settings,
  ChevronDown,
  Target,
  MessageSquare,
  ClipboardList,
  FileCheck,
  Briefcase,
  TrendingUp,
  Award,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Megaphone,
  Network,
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  children?: { label: string; active?: boolean }[];
  collapsed?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active, badge, children, collapsed, onClick }: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (children) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "nav-item w-full justify-between",
            active && "active"
          )}
        >
          <div className="flex items-center gap-3">
            {icon}
            {!collapsed && <span>{label}</span>}
          </div>
          {!collapsed && (
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          )}
        </button>
        {!collapsed && isOpen && (
          <div className="ml-9 mt-1 space-y-1">
            {children.map((child) => (
              <button
                key={child.label}
                className={cn(
                  "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  child.active && "text-accent bg-sidebar-accent"
                )}
              >
                {child.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "nav-item w-full",
        active && "active",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
      {!collapsed && badge !== undefined && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
          {badge}
        </span>
      )}
    </button>
  );
};

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ activeModule, onModuleChange, collapsed, onCollapsedChange }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { data: badges } = useSidebarBadges();
  const [seenBadges, setSeenBadges] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('estate_sidebar_seen_badges') || '{}');
    } catch {
      return {};
    }
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const role = profile?.role;

  const rawBadgeById = useMemo(() => ({
    leads: badges?.leads || 0,
    atendimento: badges?.atendimento || 0,
    agenda: badges?.agenda || 0,
    propostas: badges?.propostas || 0,
    juridico: badges?.juridico || 0,
  }), [badges]);

  useEffect(() => {
    const routeToBadge: Record<string, keyof typeof rawBadgeById> = {
      '/leads': 'leads',
      '/atendimento': 'atendimento',
      '/agenda': 'agenda',
      '/propostas': 'propostas',
      '/juridico': 'juridico',
    };
    const entry = Object.entries(routeToBadge).find(([path]) => location.pathname === path || location.pathname.startsWith(`${path}/`));
    if (!entry || !badges) return;

    const id = entry[1];
    const currentCount = rawBadgeById[id] || 0;
    setSeenBadges((prev) => {
      if (prev[id] === currentCount) return prev;
      const next = { ...prev, [id]: currentCount };
      localStorage.setItem('estate_sidebar_seen_badges', JSON.stringify(next));
      return next;
    });
  }, [location.pathname, badges, rawBadgeById]);

  const getVisibleBadge = (id: keyof typeof rawBadgeById) => {
    const count = rawBadgeById[id] || 0;
    const seen = seenBadges[id] || 0;
    const delta = Math.max(0, count - seen);
    return delta || undefined;
  };

  const allNavItems = [
    { id: "dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", badge: undefined as number | undefined, path: "/", roles: ['admin', 'manager'] as string[] },
    { id: "leads", icon: <Target className="h-5 w-5" />, label: "Leads", badge: getVisibleBadge('leads'), path: "/leads", roles: ['admin', 'manager'] as string[] },
    { id: "atendimento", icon: <MessageSquare className="h-5 w-5" />, label: "Atendimento", badge: getVisibleBadge('atendimento'), path: "/atendimento", roles: ['admin', 'manager', 'agent'] as string[] },
    { id: "routing-log", icon: <FileText className="h-5 w-5" />, label: "Log de Direcionamentos", badge: undefined as number | undefined, path: "/routing-log", roles: ['admin', 'manager'] as string[] },
    { id: "agenda", icon: <Calendar className="h-5 w-5" />, label: "Agenda & Visitas", badge: getVisibleBadge('agenda'), path: "/agenda", roles: ['admin', 'manager', 'agent'] as string[] },
    { id: "imoveis", icon: <Building2 className="h-5 w-5" />, label: "Imóveis", badge: undefined as number | undefined, path: "/imoveis", roles: ['admin', 'manager', 'agent'] as string[] },
    { id: "propostas", icon: <ClipboardList className="h-5 w-5" />, label: "Propostas", badge: getVisibleBadge('propostas'), path: "/propostas", roles: ['admin', 'manager', 'agent'] as string[] },
    { id: "juridico", icon: <FileCheck className="h-5 w-5" />, label: "Jurídico", badge: getVisibleBadge('juridico'), path: "/juridico", roles: ['admin', 'manager'] as string[] },
    { id: "vendas", icon: <Briefcase className="h-5 w-5" />, label: "Vendas", badge: undefined as number | undefined, path: "/vendas", roles: ['admin', 'manager'] as string[] },
    { id: "financeiro", icon: <DollarSign className="h-5 w-5" />, label: "Financeiro", badge: undefined as number | undefined, path: "/financeiro", roles: ['admin', 'manager'] as string[] },
    { id: "marketing", icon: <Megaphone className="h-5 w-5" />, label: "Marketing", badge: undefined as number | undefined, path: "/marketing", roles: ['admin', 'manager'] as string[] },
    { id: "corretores", icon: <UserCheck className="h-5 w-5" />, label: "Corretores", badge: undefined as number | undefined, path: "/corretores", roles: ['admin', 'manager'] as string[] },
    { id: "rh", icon: <Network className="h-5 w-5" />, label: "RH", badge: undefined as number | undefined, path: "/rh", roles: ['admin', 'manager'] as string[] },
    { id: "clientes", icon: <Smartphone className="h-5 w-5" />, label: "Clientes", badge: undefined as number | undefined, path: "/clientes", roles: ['admin', 'manager'] as string[] },
  ];

  const navItems = allNavItems.filter(item => !role || item.roles.includes(role));

  const handleNavigation = (item: typeof navItems[0]) => {
    onModuleChange(item.id);
    navigate(item.path);
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.path === '/marketing' && location.pathname.startsWith('/marketing')) {
      return true;
    }
    return location.pathname === item.path;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex-col hidden lg:flex",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-[76px] px-4 border-b border-sidebar-border",
        collapsed && "justify-center px-2"
      )}>
        <img
          src={logoEstate}
          alt="Estate.ia"
          className={cn(
            "h-14 w-[132px] object-contain object-left transition-all",
            collapsed && "h-10 w-10 object-center"
          )}
        />
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-muted" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-sidebar-accent border-0 text-sm text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            active={isActive(item)}
            collapsed={collapsed}
            onClick={() => handleNavigation(item)}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <NavItem
          icon={<Settings className="h-5 w-5" />}
          label="Configurações"
          active={location.pathname === '/configuracoes'}
          collapsed={collapsed}
          onClick={() => { onModuleChange("settings"); navigate('/configuracoes'); }}
        />
        
        {/* Collapse Toggle */}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className={cn(
            "nav-item w-full",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-accent-foreground">
              {profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-sidebar-muted truncate">
                {profile?.role === 'admin' ? 'Administrador' : profile?.role === 'manager' ? 'Gestor' : profile?.role === 'agent' ? 'Corretor' : profile?.role === 'client' ? 'Cliente' : 'Usuário'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-muted hover:text-sidebar-foreground"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
