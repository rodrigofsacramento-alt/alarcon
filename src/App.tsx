import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SuperAdminProvider } from "@/contexts/SuperAdminContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SuperAdminRoute } from "@/components/super-admin/SuperAdminRoute";
import { GlobalNotificationListener } from "@/components/GlobalNotificationListener";
import { GroupSidePanel } from "@/components/groups/GroupSidePanel";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChunkErrorBoundary } from "@/components/ChunkErrorBoundary";
// Lazy Loaded Tenant App Pages
const Login = lazy(() => import("./pages/Login"));
const Index = lazy(() => import("./pages/Index"));
const Leads = lazy(() => import("./pages/Leads"));
const Atendimento = lazy(() => import("./pages/Atendimento"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Imoveis = lazy(() => import("./pages/Imoveis"));
const Propostas = lazy(() => import("./pages/Propostas"));
const Juridico = lazy(() => import("./pages/Juridico"));
const Vendas = lazy(() => import("./pages/Vendas"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const Comissoes = lazy(() => import("./pages/Comissoes"));
const Contas = lazy(() => import("./pages/Contas"));
const Livro = lazy(() => import("./pages/Livro"));
const VendasImigracion = lazy(() => import("./pages/VendasImigracion"));
const AreaCliente = lazy(() => import("./pages/AreaCliente"));
const CorretorDashboard = lazy(() => import("./pages/CorretorDashboard"));
const GestaoClientes = lazy(() => import("./pages/GestaoClientes"));
  const DashboardPerformance = lazy(() => import("./pages/DashboardPerformance"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const RoutingLog = lazy(() => import("./pages/RoutingLog"));
const Rh = lazy(() => import("./pages/Rh"));
const Tecnologia = lazy(() => import("./pages/Tecnologia"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Blocked = lazy(() => import("./pages/Blocked"));
const MarketingLayout = lazy(() => import("./pages/marketing/MarketingLayout"));

// Lazy Loaded Super Admin Pages
const SuperAdminLogin = lazy(() => import("./pages/super-admin/SuperAdminLogin"));
const SuperAdminDashboard = lazy(() => import("./pages/super-admin/SuperAdminDashboard"));
const SuperAdminTenants = lazy(() => import("./pages/super-admin/SuperAdminTenants"));
const SuperAdminPlans = lazy(() => import("./pages/super-admin/SuperAdminPlans"));
const SuperAdminSubscriptions = lazy(() => import("./pages/super-admin/SuperAdminSubscriptions"));
const SuperAdminUsers = lazy(() => import("./pages/super-admin/SuperAdminUsers"));
const SuperAdminAudit = lazy(() => import("./pages/super-admin/SuperAdminAudit"));
const SuperAdminSettings = lazy(() => import("./pages/super-admin/SuperAdminSettings"));
const SuperAdminFinancial = lazy(() => import("./pages/super-admin/SuperAdminFinancial"));
const SuperAdminCommunications = lazy(() => import("./pages/super-admin/SuperAdminCommunications"));
const SuperAdminHealth = lazy(() => import("./pages/super-admin/SuperAdminHealth"));
const SuperAdminPortalIntegrations = lazy(() => import("./pages/super-admin/SuperAdminPortalIntegrations"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita recarregar dados automaticamente ao mudar de aba/guia
      refetchOnMount: false,       // Evita recarregar ao remontar componentes
      refetchOnReconnect: false,   // Evita recarregar ao reconectar a internet
      staleTime: 5 * 60 * 1000,   // Considera os dados "frescos" por 5 minutos
      retry: 1,                   // Tenta re-executar em caso de falha apenas 1 vez
    },
  },
});

const SALoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen" style={{ background: '#0d1526' }}>
    <div className="w-8 h-8 border-2 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
  </div>
);

const SALazyOutlet = () => (
  <Suspense fallback={<SALoadingFallback />}>
    <Outlet />
  </Suspense>
);

const App = () => {
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SuperAdminProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalNotificationListener />
            <ErrorBoundary name="GroupSidePanel">
              <GroupSidePanel />
            </ErrorBoundary>

            <ChunkErrorBoundary>
              <Suspense fallback={<SALoadingFallback />}>
                <Routes>
                {/* ── Tenant App routes ── */}
                <Route path="/login" element={<Login />} />
                <Route path="/blocked" element={<Blocked />} />
                <Route path="/" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Index /></ProtectedRoute>} />

                <Route path="/leads" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Leads /></ProtectedRoute>} />
                <Route path="/atendimento" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agent']}><Atendimento /></ProtectedRoute>} />
                <Route path="/agenda" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agent']}><Agenda /></ProtectedRoute>} />
                <Route path="/imoveis" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agent']}><Imoveis /></ProtectedRoute>} />
                <Route path="/propostas" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agent']}><Propostas /></ProtectedRoute>} />
                <Route path="/juridico" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Juridico /></ProtectedRoute>} />
                <Route path="/vendas" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Vendas /></ProtectedRoute>} />
                <Route path="/financeiro" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Financeiro /></ProtectedRoute>} />
                <Route path="/financeiro/comissoes" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Comissoes /></ProtectedRoute>} />
                <Route path="/financeiro/contas" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Contas /></ProtectedRoute>} />
                <Route path="/financeiro/livro" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Livro /></ProtectedRoute>} />
                <Route path="/financeiro/vendas" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><VendasImigracion /></ProtectedRoute>} />
                <Route path="/corretores" element={<Navigate to="/dashboard-performance" replace />} />
                <Route path="/dashboard-performance" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DashboardPerformance /></ProtectedRoute>} />
                <Route path="/routing-log" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agent']}><RoutingLog /></ProtectedRoute>} />
                <Route path="/rh" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Rh /></ProtectedRoute>} />
                <Route path="/tecnologia" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agent']}><Tecnologia /></ProtectedRoute>} />
                <Route path="/clientes" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><GestaoClientes /></ProtectedRoute>} />
                <Route path="/configuracoes" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Configuracoes /></ProtectedRoute>} />
                <Route path="/marketing/*" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><MarketingLayout /></ProtectedRoute>} />
                <Route path="/corretor-dashboard" element={<ProtectedRoute allowedRoles={['agent']}><CorretorDashboard /></ProtectedRoute>} />
                <Route path="/area-cliente" element={<ProtectedRoute allowedRoles={['client']}><AreaCliente /></ProtectedRoute>} />

                {/* ── Super Admin routes (lazy loaded) ── */}
                <Route path="/super-admin/login" element={<SuperAdminLogin />} />
                <Route element={<SALazyOutlet />}>
                  <Route path="/super-admin" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
                  <Route path="/super-admin/tenants" element={<SuperAdminRoute><SuperAdminTenants /></SuperAdminRoute>} />
                  <Route path="/super-admin/plans" element={<SuperAdminRoute><SuperAdminPlans /></SuperAdminRoute>} />
                  <Route path="/super-admin/subscriptions" element={<SuperAdminRoute><SuperAdminSubscriptions /></SuperAdminRoute>} />
                  <Route path="/super-admin/financial" element={<SuperAdminRoute><SuperAdminFinancial /></SuperAdminRoute>} />
                  <Route path="/super-admin/communications" element={<SuperAdminRoute><SuperAdminCommunications /></SuperAdminRoute>} />
                  <Route path="/super-admin/health" element={<SuperAdminRoute><SuperAdminHealth /></SuperAdminRoute>} />
                  <Route path="/super-admin/integrations" element={<SuperAdminRoute><SuperAdminPortalIntegrations /></SuperAdminRoute>} />
                  <Route path="/super-admin/users" element={<SuperAdminRoute><SuperAdminUsers /></SuperAdminRoute>} />
                  <Route path="/super-admin/audit" element={<SuperAdminRoute><SuperAdminAudit /></SuperAdminRoute>} />
                  <Route path="/super-admin/settings" element={<SuperAdminRoute><SuperAdminSettings /></SuperAdminRoute>} />
                </Route>

                <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ChunkErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </SuperAdminProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
