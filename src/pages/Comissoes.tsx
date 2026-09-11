import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CommissionsDashboard } from "@/components/financeiro/comissoes/CommissionsDashboard";
import { CommissionCalculator } from "@/components/financeiro/comissoes/CommissionCalculator";
import { CommissionSettings } from "@/components/financeiro/comissoes/CommissionSettings";
import { Calculator, Settings, PieChart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Comissoes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'settings'>('dashboard');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="financeiro"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="financeiro"
        onModuleChange={() => {}}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />

      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <Header
          title="Gestão de Comissões"
          subtitle="Visão de performance e cálculo progressivo"
          actionButton={
            <Button variant="outline" className="gap-2" onClick={() => navigate('/financeiro')}>
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Financeiro
            </Button>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
          {/* Tabs Nav */}
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className="gap-2"
              onClick={() => setActiveTab('dashboard')}
            >
              <PieChart className="h-4 w-4" />
              Visão Geral
            </Button>
            <Button
              variant={activeTab === 'calculator' ? 'default' : 'ghost'}
              className="gap-2"
              onClick={() => setActiveTab('calculator')}
            >
              <Calculator className="h-4 w-4" />
              Cadastrar / Calcular
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="gap-2"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-4 w-4" />
              Regras e Faixas
            </Button>
          </div>

          {/* Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dashboard' && <CommissionsDashboard />}
            {activeTab === 'calculator' && <CommissionCalculator />}
            {activeTab === 'settings' && <CommissionSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}
