import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import {
  useDisconnectGoogleWorkspace,
  usePrepareGoogleWorkspaceConnection,
  useTenantGoogleWorkspaceStatus,
} from "@/hooks/use-google-workspace";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Save,
  Loader2,
  Mail,
  Phone,
  Lock,
  Globe,
  MapPin,
  FileText,
  Plug,
  CalendarDays,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Unplug,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarUpload } from "@/components/shared/AvatarUpload";

type SettingsTab = "perfil" | "empresa" | "integracoes" | "notificacoes" | "seguranca" | "aparencia";

export default function Configuracoes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("perfil");
  const [saving, setSaving] = useState(false);
  const { profile } = useAuth();
  const { data: googleWorkspace, isLoading: googleWorkspaceLoading } = useTenantGoogleWorkspaceStatus();
  const prepareGoogleWorkspace = usePrepareGoogleWorkspaceConnection();
  const disconnectGoogleWorkspace = useDisconnectGoogleWorkspace();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const googleResult = params.get("google");

    if (tab === "integracoes") {
      setActiveTab("integracoes");
    }

    if (googleResult === "connected") {
      toast({ title: "Google conectado", description: "Calendar e Drive da imobiliária foram autorizados." });
      window.history.replaceState({}, document.title, "/configuracoes?tab=integracoes");
    }

    if (googleResult === "error") {
      toast({
        title: "Erro no Google",
        description: params.get("reason") || "Não foi possível concluir a conexão.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, "/configuracoes?tab=integracoes");
    }
  }, []);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
  });

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    name: "Estate.ia Imobiliária",
    cnpj: "12.345.678/0001-90",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    website: "https://estate.ia",
    phone: "(11) 3000-0000",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_new_lead: true,
    email_new_proposal: true,
    email_visit_reminder: true,
    push_messages: true,
    push_updates: false,
    daily_report: true,
    weekly_report: true,
  });

  // Security settings
  const [securityForm, setSecurityForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "dark" as "light" | "dark",
    compact_sidebar: false,
    show_badges: true,
  });

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone || null,
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas com sucesso." });
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Erro ao salvar perfil.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    // Simulated save - in production this would save to a settings table
    await new Promise(r => setTimeout(r, 500));
    toast({ title: "Dados da empresa salvos!", description: "As informações da empresa foram atualizadas." });
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    toast({ title: "Notificações atualizadas!", description: "Suas preferências de notificação foram salvas." });
    setSaving(false);
  };

  const handlePrepareGoogleWorkspace = async () => {
    try {
      await prepareGoogleWorkspace.mutateAsync();
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Erro ao preparar Google.", variant: "destructive" });
    }
  };

  const handleDisconnectGoogleWorkspace = async () => {
    try {
      await disconnectGoogleWorkspace.mutateAsync();
      toast({ title: "Google desconectado", description: "A conexão Google da imobiliária foi desativada." });
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Erro ao desconectar Google.", variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (securityForm.new_password !== securityForm.confirm_password) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (securityForm.new_password.length < 6) {
      toast({ title: "Erro", description: "A nova senha deve ter no mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: securityForm.new_password });
      if (error) throw error;
      toast({ title: "Senha alterada!", description: "Sua senha foi atualizada com sucesso." });
      setSecurityForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Erro ao alterar senha.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    toast({ title: "Aparência atualizada!", description: "Suas preferências visuais foram salvas." });
    setSaving(false);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "perfil", label: "Meu Perfil", icon: <User className="h-4 w-4" /> },
    { id: "empresa", label: "Empresa", icon: <Building2 className="h-4 w-4" /> },
    { id: "integracoes", label: "Integrações", icon: <Plug className="h-4 w-4" /> },
    { id: "notificacoes", label: "Notificações", icon: <Bell className="h-4 w-4" /> },
    { id: "seguranca", label: "Segurança", icon: <Shield className="h-4 w-4" /> },
    { id: "aparencia", label: "Aparência", icon: <Palette className="h-4 w-4" /> },
  ];

  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-foreground">{label}</span>
      <button onClick={() => onChange(!checked)} className="text-accent">
        {checked ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="settings"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="settings"
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
          title="Configurações"
          subtitle="Gerencie as configurações do sistema"
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tabs Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl shadow-sm p-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {/* Perfil */}
              {activeTab === "perfil" && (
                <div className="bg-card rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold text-foreground">Meu Perfil</h2>
                  </div>

                  <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-muted/30">
                    {profile && (
                      <AvatarUpload
                        profileId={profile.id}
                        currentAvatarUrl={profile?.avatar_url || null}
                        fullName={profile.full_name || 'U'}
                        size="lg"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{profile?.full_name || 'Usuário'}</p>
                      <Badge className="mt-1">{profile?.role === 'admin' ? 'Administrador' : profile?.role === 'manager' ? 'Gestor' : 'Corretor'}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Clique na câmera para alterar a foto</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado.</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="(11) 99999-0000"
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button variant="cta" className="gap-2" onClick={handleSaveProfile} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              )}

              {/* Empresa */}
              {activeTab === "empresa" && (
                <div className="bg-card rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Building2 className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold text-foreground">Dados da Empresa</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Nome da Empresa</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={companyForm.name}
                          onChange={(e) => setCompanyForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">CNPJ</label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={companyForm.cnpj}
                            onChange={(e) => setCompanyForm(f => ({ ...f, cnpj: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Telefone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="tel"
                            value={companyForm.phone}
                            onChange={(e) => setCompanyForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Endereço</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={companyForm.address}
                          onChange={(e) => setCompanyForm(f => ({ ...f, address: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="url"
                          value={companyForm.website}
                          onChange={(e) => setCompanyForm(f => ({ ...f, website: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button variant="cta" className="gap-2" onClick={handleSaveCompany} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              )}

              {/* Integrações */}
              {activeTab === "integracoes" && (
                <div className="space-y-4">
                  <div className="bg-card rounded-xl shadow-sm p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Plug className="h-5 w-5 text-accent" />
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">Integrações</h2>
                          <p className="text-sm text-muted-foreground">Conexoes oficiais da imobiliaria</p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "w-fit",
                          googleWorkspace?.status === "connected"
                            ? "bg-success/10 text-success"
                            : googleWorkspace?.status === "error"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {googleWorkspaceLoading
                          ? "Carregando"
                          : googleWorkspace?.status === "connected"
                            ? "Conectado"
                            : googleWorkspace?.status === "connecting"
                              ? "Pendente"
                              : googleWorkspace?.status === "error"
                                ? "Erro"
                                : "Não conectado"}
                      </Badge>
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <GoogleMark />
                            <div>
                              <p className="font-semibold text-foreground">Google Workspace</p>
                              <p className="text-sm text-muted-foreground">
                                {googleWorkspace?.external_account_email || profile?.email || "Conta admin da imobiliaria"}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Agenda admin
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                              <HardDrive className="h-3.5 w-3.5" />
                              Drive da empresa
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                              <Shield className="h-3.5 w-3.5" />
                              Login Google
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                          <Button
                            variant={googleWorkspace?.status === "connected" ? "outline" : "cta"}
                            className="gap-2"
                            onClick={handlePrepareGoogleWorkspace}
                            disabled={prepareGoogleWorkspace.isPending || googleWorkspaceLoading}
                          >
                            {prepareGoogleWorkspace.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            {googleWorkspace?.status === "connected" ? "Reconectar" : "Conectar Google"}
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 text-destructive hover:text-destructive"
                            onClick={handleDisconnectGoogleWorkspace}
                            disabled={!googleWorkspace || disconnectGoogleWorkspace.isPending}
                          >
                            {disconnectGoogleWorkspace.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
                            Desconectar
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs font-medium uppercase text-muted-foreground">Calendario</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">{googleWorkspace?.calendar_id || "primary"}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs font-medium uppercase text-muted-foreground">Dono da agenda</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {googleWorkspace?.calendar_owner_name || profile?.full_name || "Admin"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs font-medium uppercase text-muted-foreground">Politica</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">Corretor sem dados Google</p>
                        </div>
                      </div>

                      {googleWorkspace?.status === "connecting" && (
                        <div className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <p>OAuth operacional pendente. Clique em Conectar Google para autorizar Calendar e Drive da imobiliaria.</p>
                        </div>
                      )}

                      {googleWorkspace?.error_message && (
                        <div className="mt-4 flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <p>{googleWorkspace.error_message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notificações */}
              {activeTab === "notificacoes" && (
                <div className="bg-card rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Email</h3>
                    <div className="divide-y divide-border">
                      <ToggleSwitch label="Novo lead recebido" checked={notifications.email_new_lead} onChange={v => setNotifications(n => ({ ...n, email_new_lead: v }))} />
                      <ToggleSwitch label="Nova proposta criada" checked={notifications.email_new_proposal} onChange={v => setNotifications(n => ({ ...n, email_new_proposal: v }))} />
                      <ToggleSwitch label="Lembrete de visita" checked={notifications.email_visit_reminder} onChange={v => setNotifications(n => ({ ...n, email_visit_reminder: v }))} />
                    </div>
                  </div>

                  <div className="space-y-1 mt-6">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Push / Sistema</h3>
                    <div className="divide-y divide-border">
                      <ToggleSwitch label="Novas mensagens" checked={notifications.push_messages} onChange={v => setNotifications(n => ({ ...n, push_messages: v }))} />
                      <ToggleSwitch label="Atualizações do sistema" checked={notifications.push_updates} onChange={v => setNotifications(n => ({ ...n, push_updates: v }))} />
                    </div>
                  </div>

                  <div className="space-y-1 mt-6">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Relatórios</h3>
                    <div className="divide-y divide-border">
                      <ToggleSwitch label="Relatório diário" checked={notifications.daily_report} onChange={v => setNotifications(n => ({ ...n, daily_report: v }))} />
                      <ToggleSwitch label="Relatório semanal" checked={notifications.weekly_report} onChange={v => setNotifications(n => ({ ...n, weekly_report: v }))} />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button variant="cta" className="gap-2" onClick={handleSaveNotifications} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salvar Preferências
                    </Button>
                  </div>
                </div>
              )}

              {/* Segurança */}
              {activeTab === "seguranca" && (
                <div className="bg-card rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold text-foreground">Segurança</h2>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Alterar Senha</h3>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Senha Atual</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="password"
                          value={securityForm.current_password}
                          onChange={(e) => setSecurityForm(f => ({ ...f, current_password: e.target.value }))}
                          placeholder="Digite sua senha atual"
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Nova Senha</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="password"
                            value={securityForm.new_password}
                            onChange={(e) => setSecurityForm(f => ({ ...f, new_password: e.target.value }))}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Confirmar Nova Senha</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="password"
                            value={securityForm.confirm_password}
                            onChange={(e) => setSecurityForm(f => ({ ...f, confirm_password: e.target.value }))}
                            placeholder="Repita a nova senha"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button variant="cta" className="gap-2" onClick={handleChangePassword} disabled={saving || !securityForm.new_password}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                      Alterar Senha
                    </Button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Sessões Ativas</h3>
                    <div className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Sessão Atual</p>
                          <p className="text-xs text-muted-foreground">Navegador • Ativo agora</p>
                        </div>
                        <Badge className="bg-success/10 text-success">Ativa</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aparência */}
              {activeTab === "aparencia" && (
                <div className="bg-card rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold text-foreground">Aparência</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">Tema</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setAppearance(a => ({ ...a, theme: "light" }))}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-colors text-center",
                            appearance.theme === "light" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <div className="h-12 w-12 mx-auto mb-2 rounded-lg bg-white border border-gray-200" />
                          <p className="text-sm font-medium text-foreground">Claro</p>
                        </button>
                        <button
                          onClick={() => setAppearance(a => ({ ...a, theme: "dark" }))}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-colors text-center",
                            appearance.theme === "dark" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <div className="h-12 w-12 mx-auto mb-2 rounded-lg bg-gray-800 border border-gray-700" />
                          <p className="text-sm font-medium text-foreground">Escuro</p>
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-border">
                      <ToggleSwitch label="Sidebar compacta por padrão" checked={appearance.compact_sidebar} onChange={v => setAppearance(a => ({ ...a, compact_sidebar: v }))} />
                      <ToggleSwitch label="Mostrar badges de notificação" checked={appearance.show_badges} onChange={v => setAppearance(a => ({ ...a, show_badges: v }))} />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button variant="cta" className="gap-2" onClick={handleSaveAppearance} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salvar Preferências
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
      </svg>
    </div>
  );
}
