import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { LeadFunnel } from "@/components/dashboard/LeadFunnel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SLAAlerts } from "@/components/dashboard/SLAAlerts";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { TopAgents } from "@/components/dashboard/TopAgents";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats } from "@/hooks/use-dashboard";
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
} from "lucide-react";

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return `R$ ${value}`;
};

const Index = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile } = useAuth();
  const { data: stats } = useDashboardStats();
  const firstName = profile?.full_name?.split(' ')[0] || 'Usuário';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar 
        activeModule={activeModule} 
        onModuleChange={setActiveModule}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <main className={cn(
        "transition-all duration-300",
        "lg:pl-64",
        sidebarCollapsed && "lg:pl-[72px]"
      )}>
        <Header
          title="Dashboard Executivo"
          subtitle="Visão geral da operação imobiliária"
          mobileMenuTrigger={
            <MobileSidebar
              activeModule={activeModule}
              onModuleChange={setActiveModule}
              open={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
            />
          }
        />

        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/90 p-4 lg:p-6 text-primary-foreground shadow-lg">
            <div className="relative z-10">
              <h2 className="text-xl lg:text-2xl font-bold mb-1">
                Olá, {firstName}! 👋
              </h2>
              <p className="text-primary-foreground/80 mb-3 lg:mb-4 text-sm lg:text-base">
                Você tem <span className="font-semibold text-accent">{(stats?.slaWarning || 0) + (stats?.slaCritical || 0)} alertas</span> de SLA e{" "}
                <span className="font-semibold text-accent">{stats?.leadsAtivos || 0} leads</span> aguardando atendimento.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/leads')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors shadow-accent"
                >
                  <Target className="h-4 w-4" />
                  Ver Leads Prioritários
                </button>
                <button
                  onClick={() => navigate('/agenda')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Agenda do Dia
                </button>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 hidden sm:block">
              <svg viewBox="0 0 200 200" className="h-full w-full">
                <circle cx="150" cy="100" r="80" fill="currentColor" />
                <circle cx="100" cy="150" r="60" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            <StatCard
              title="Leads Ativos"
              value={String(stats?.leadsAtivos || 0)}
              change={{ value: stats?.leadsThisMonth || 0, type: "increase" }}
              icon={<Users className="h-4 w-4 lg:h-5 lg:w-5" />}
            />
            <StatCard
              title="Imóveis Ativos"
              value={String(stats?.imoveisAtivos || 0)}
              change={{ value: 0, type: "increase" }}
              icon={<Building2 className="h-4 w-4 lg:h-5 lg:w-5" />}
            />
            <StatCard
              title="Visitas Mês"
              value={String(stats?.visitasMes || 0)}
              change={{ value: 0, type: "increase" }}
              icon={<Calendar className="h-4 w-4 lg:h-5 lg:w-5" />}
            />
            <StatCard
              title="Propostas"
              value={String(stats?.propostas || 0)}
              change={{ value: 0, type: "increase" }}
              icon={<Target className="h-4 w-4 lg:h-5 lg:w-5" />}
            />
            <StatCard
              title="Vendas Mês"
              value={String(stats?.vendasMes || 0)}
              change={{ value: 0, type: "increase" }}
              icon={<TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />}
            />
            <StatCard
              title="Receita Mês"
              value={formatCurrency(stats?.receitaMes || 0)}
              change={{ value: 0, type: "increase" }}
              icon={<DollarSign className="h-4 w-4 lg:h-5 lg:w-5" />}
              variant="accent"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column - 2/3 width */}
            <div className="xl:col-span-2 space-y-4 lg:space-y-6">
              <PerformanceChart data={stats?.performance || []} />
              <LeadFunnel />
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-4 lg:space-y-6">
              <SLAAlerts items={stats?.slaAlerts || []} />
              <QuickActions />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <TopAgents />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
