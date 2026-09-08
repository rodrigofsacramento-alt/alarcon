import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoEstate from "@/assets/logo-estate.png";
import { LayoutDashboard, Building2, Calendar, DollarSign, UserCheck, Smartphone, Settings, Target, MessageSquare, ClipboardList, FileCheck, Briefcase, Megaphone } from "lucide-react";
interface MobileSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const allNavItems = [{
  id: "dashboard",
  icon: LayoutDashboard,
  label: "Dashboard",
  path: "/",
  roles: ['admin', 'manager'] as string[]
}, {
  id: "leads",
  icon: Target,
  label: "Leads",
  path: "/leads",
  roles: ['admin', 'manager'] as string[]
}, {
  id: "atendimento",
  icon: MessageSquare,
  label: "Atendimento",
  path: "/atendimento",
  roles: ['admin', 'manager', 'agent'] as string[]
}, {
  id: "agenda",
  icon: Calendar,
  label: "Agenda & Visitas",
  path: "/agenda",
  roles: ['admin', 'manager', 'agent'] as string[]
}, {
  id: "imoveis",
  icon: Building2,
  label: "Imóveis",
  path: "/imoveis",
  roles: ['admin', 'manager', 'agent'] as string[]
}, {
  id: "propostas",
  icon: ClipboardList,
  label: "Propostas",
  path: "/propostas",
  roles: ['admin', 'manager', 'agent'] as string[]
}, {
  id: "juridico",
  icon: FileCheck,
  label: "Jurídico",
  path: "/juridico",
  roles: ['admin', 'manager'] as string[]
}, {
  id: "vendas",
  icon: Briefcase,
  label: "Vendas",
  path: "/vendas",
  roles: ['admin', 'manager'] as string[]
}, {
  id: "financeiro",
  icon: DollarSign,
  label: "Financeiro",
  path: "/financeiro",
  roles: ['admin', 'manager'] as string[]
}, {
  id: "marketing",
  icon: Megaphone,
  label: "Marketing",
  path: "/marketing",
  roles: ['admin', 'manager'] as string[]
}, {
  id: "corretores",
  icon: UserCheck,
  label: "Corretores",
  path: "/corretores",
  roles: ['admin', 'manager'] as string[]
}, {
  id: "clientes",
  icon: Smartphone,
  label: "Clientes",
  path: "/clientes",
  roles: ['admin', 'manager'] as string[]
}];
export function MobileSidebar({
  activeModule,
  onModuleChange,
  open,
  onOpenChange
}: MobileSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    profile
  } = useAuth();
  const role = profile?.role;
  const navItems = allNavItems.filter(item => !role || item.roles.includes(role));
  const handleNavigation = (item: typeof navItems[0]) => {
    onModuleChange(item.id);
    navigate(item.path);
    onOpenChange(false);
  };
  const isActive = (item: typeof navItems[0]) => location.pathname === item.path;
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const roleLabel = profile?.role === 'admin' ? 'Administrador' : profile?.role === 'manager' ? 'Gestor' : profile?.role === 'agent' ? 'Corretor' : 'Usuário';
  return <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <img src={logoEstate} alt="Estate.ia" className="h-10 object-contain" />
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">
          {navItems.map(item => {
          const Icon = item.icon;
          return <button key={item.id} onClick={() => handleNavigation(item)} className={cn("nav-item w-full", isActive(item) && "active")}>
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>;
        })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button onClick={() => onModuleChange("settings")} className="nav-item w-full">
            <Settings className="h-5 w-5" />
            <span>Configurações</span>
          </button>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-accent-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.full_name || 'Usuário'}</p>
              <p className="text-xs text-sidebar-muted truncate">{roleLabel}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>;
}