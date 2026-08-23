'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  MessageSquare,
  Settings,
  Plus,
  LogOut,
  Truck,
  BarChart2, 
  UserCircle,
  Briefcase,
  UserPlus, 
  Calculator, 
  Calendar,
  CalendarDays,
  Bot,
  Wallet,
  FileText,
  X,
  ChevronDown,
  ChevronRight,
  Store,
  Package,
  Monitor,
  ClipboardList,
  Factory,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useMobileMenu } from '@/context/MobileMenuContext';

const navItems = [
  { name: 'Relatórios', icon: BarChart3, href: '/reports' },
  { name: 'Dashboard', icon: BarChart2, href: '/dashboard' },
  { name: 'Histórico', icon: Activity, href: '/history' },
  { name: 'Escritório IA', icon: Bot, href: '/agents' },
  { name: 'Automações & IA', icon: Zap, href: '/automations' },
  { name: 'Roadmap Apexfy', icon: Package, href: '/roadmap' },
  { name: 'Tecnologia', icon: Monitor, href: '/technology' },
  { name: 'PCP', icon: ClipboardList, href: '/pcp' },
  { name: 'Produção', icon: Factory, href: '/production' },
  { name: 'Financeiro', icon: Wallet, href: '/finance' },
  { 
    name: 'Comercial', 
    icon: Store, 
    href: '/comercial',
    subItems: [
      { name: 'WhatsApp', icon: MessageSquare, href: '/comercial/whatsapp' },
      { name: 'Orçamentos', icon: Calculator, href: '/budgets' },
      { name: 'Gestão de Propostas', icon: FileText, href: '/proposals' },
      { name: 'Oportunidades', icon: Briefcase, href: '/opportunities' },
      { name: 'Leads', icon: UserPlus, href: '/leads' },
      { name: 'Contatos', icon: UserCircle, href: '/contacts' },
    ]
  },
  { 
    name: 'Logística', 
    icon: Package, 
    href: '/logistica',
    subItems: [
      { name: 'Parceiros Frete', icon: Truck, href: '/freight' },
    ]
  },
  { name: 'Cronograma', icon: CalendarDays, href: '/schedule' },
  { name: 'Calendário', icon: Calendar, href: '/calendar' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isAdmin, logout } = useAuth();
  const { isOpen, close } = useMobileMenu();
  const [logoError, setLogoError] = React.useState(false);
  
  // State for collapsible submenus
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Comercial': false,
    'Logística': false
  });

  // State for minimized sidebar
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-minimized');
    if (saved === 'true') {
      setIsMinimized(true);
      document.body.classList.add('sidebar-minimized');
    }
  }, []);

  const toggleMinimize = () => {
    setIsMinimized(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-minimized', String(next));
      if (next) {
        document.body.classList.add('sidebar-minimized');
      } else {
        document.body.classList.remove('sidebar-minimized');
      }
      return next;
    });
  };

  const toggleGroup = (name: string) => {
    // If sidebar is minimized, don't open submenus accordion, maybe auto-expand sidebar first
    if (isMinimized) {
      toggleMinimize();
      setOpenGroups(prev => ({ ...prev, [name]: true }));
      return;
    }
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
    }
  };

  const filteredNavItems = [
    ...navItems,
    ...(isAdmin ? [{ name: 'Usuários', icon: Settings, href: '/admin/users' }] : [])
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 border-r border-slate-800 bg-slate-950 flex flex-col h-screen transition-all duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isMinimized ? "w-20" : "w-56 xl:w-64"
      )}>
        <div className="flex flex-col h-full overflow-hidden">

          {/* Brand Logo */}
          <div className="flex items-center justify-center mb-2 xl:mb-5 px-3 pt-3 xl:pt-5 shrink-0">
            <div className={cn("relative flex items-center justify-center transition-all duration-300", isMinimized ? "w-10 h-10" : "w-full h-10 xl:h-16")}>
              {!logoError ? (
                <Image 
                  src="/logo.png" 
                  alt="Indavent Logo" 
                  fill 
                  className={cn("object-center brightness-0 invert transition-all duration-300", isMinimized ? "object-cover" : "object-contain")}
                  priority
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className={cn("font-black tracking-tighter text-white italic", isMinimized ? "text-lg" : "text-xl xl:text-2xl")}>
                  {isMinimized ? "N" : "NovaINDAVENT"}
                </span>
              )}
            </div>
            <button 
              onClick={close}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-900 rounded-lg transition-colors absolute right-3 top-3"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className={cn("flex-1 overflow-y-auto custom-scrollbar min-h-0 pb-4", isMinimized ? "px-2 space-y-2" : "px-2 space-y-0.5")}>
            {filteredNavItems.map((item) => {
              if (item.subItems) {
                const isGroupActive = item.subItems.some(sub => pathname === sub.href || (sub.href !== '/' && pathname.startsWith(sub.href)));
                const isOpenState = openGroups[item.name] || isGroupActive;
                
                return (
                  <div key={item.name} className={cn(!isMinimized && "space-y-0.5")}>
                    <button
                      onClick={() => {
                        toggleGroup(item.name);
                        if (item.href && !item.subItems) router.push(item.href);
                        if (isMinimized) close();
                      }}
                      className={cn(
                        "w-full flex items-center rounded-lg transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-blue-500 outline-none",
                        isMinimized ? "justify-center py-2" : "justify-between px-4 py-2 text-sm xl:text-base",
                        isGroupActive && !isOpenState ? "text-blue-500" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      )}
                      title={isMinimized ? item.name : undefined}
                    >
                      <div className={cn("flex items-center", !isMinimized && "gap-2.5")}>
                        <item.icon size={isMinimized ? 20 : 17} className={cn(isGroupActive && !isOpenState && "text-blue-500")} />
                        {!isMinimized && <span>{item.name}</span>}
                      </div>
                      {!isMinimized && (isOpenState ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />)}
                    </button>
                    
                    {!isMinimized && isOpenState && (
                      <div className="pl-6 space-y-0.5 mt-0.5 relative">
                        <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-800" />
                        {item.subItems.map(sub => {
                          const isSubActive = pathname === sub.href || (sub.href !== '/' && pathname.startsWith(sub.href));
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={close}
                              target={sub.href.startsWith('http') ? '_blank' : undefined}
                              rel={sub.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className={cn(
                                "flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all duration-200 text-sm xl:text-base font-medium relative z-10 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none",
                                isSubActive 
                                  ? "bg-blue-600/10 text-blue-500" 
                                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                              )}
                            >
                              <sub.icon size={15} />
                              <span>{sub.name}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href!));
              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  onClick={close}
                  className={cn(
                    "flex items-center rounded-lg transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-blue-500 outline-none",
                    isMinimized ? "justify-center py-2" : "gap-2.5 px-4 py-2 text-sm xl:text-base",
                    isActive 
                      ? "bg-blue-600/10 text-blue-500" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  )}
                  title={isMinimized ? item.name : undefined}
                >
                  <item.icon size={isMinimized ? 20 : 17} />
                  {!isMinimized && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className={cn("pt-2 xl:pt-3 border-t border-slate-800 space-y-2 pb-3 shrink-0", isMinimized ? "px-2" : "px-2")}>
            <Link
              href="/settings"
              onClick={close}
              className={cn(
                "flex items-center rounded-lg transition-colors font-medium",
                isMinimized ? "justify-center py-2.5" : "gap-2.5 px-3 py-1.5 xl:py-2 text-sm xl:text-base",
                pathname === '/settings' ? "bg-blue-600/10 text-blue-500" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
              title={isMinimized ? "Configurações" : undefined}
            >
              <Settings size={isMinimized ? 20 : 17} />
              {!isMinimized && <span>Configurações</span>}
            </Link>
            
            <button 
              onClick={() => {
                router.push('/leads');
                close();
              }}
              className={cn(
                "w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors",
                isMinimized ? "py-2.5" : "gap-2 py-2 px-4"
              )}
              title={isMinimized ? "Novo Lead" : undefined}
            >
              <Plus size={18} />
              {!isMinimized && <span className="text-sm xl:text-base">Novo Lead</span>}
            </button>

            <div className={cn("flex items-center bg-slate-900/50 rounded-xl border border-slate-800", isMinimized ? "p-1.5 flex-col gap-2" : "p-2 gap-2.5")}>
              <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs uppercase ring-2 ring-slate-800 relative overflow-hidden shrink-0">
                {profile?.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt={profile.name} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  profile?.name?.[0] || profile?.username?.[0] || '?'
                )}
              </div>
              
              {!isMinimized && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{profile?.name || 'Carregando...'}</p>
                  <p className="text-[11px] text-slate-500 truncate uppercase tracking-widest font-bold">{profile?.role || '...'}</p>
                </div>
              )}

              <div className={cn("flex items-center", isMinimized ? "flex-col gap-1.5" : "shrink-0 gap-1")}>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all border border-rose-500/20 group"
                  title="Sair do Sistema"
                >
                  <LogOut size={15} className="group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={toggleMinimize}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all hidden lg:block"
                  title={isMinimized ? "Expandir Menu" : "Minimizar Menu"}
                >
                  {isMinimized ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
                </button>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
