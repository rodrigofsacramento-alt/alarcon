import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Clock,
  User,
  Navigation,
  CheckCircle2,
  Calendar as CalendarIcon,
  Video,
  AlertTriangle,
  X,
  Play,
  Pencil,
  ExternalLink,
  Phone,
  Mail,
  Star,
  Check,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreateVisitModal, VisitFormData } from "@/components/agenda/CreateVisitModal";
import { VisitRegistrationModal, VisitRegistrationData } from "@/components/agenda/VisitRegistrationModal";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useVisits, useCreateVisit, useConfirmVisit, useCompleteVisit, useSyncVisitGoogleCalendar, createVisitLimitNotification, type Visit } from "@/hooks/use-visits";
import { useLeads } from "@/hooks/use-leads";
import { useProperties } from "@/hooks/use-properties";
import { useConversations } from "@/hooks/use-messages";
import type { Lead, Property, Contact } from "@/hooks/use-semantic-search";

const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, month: month - 1, year: month === 0 ? year - 1 : year, isCurrentMonth: false });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, month, year, isCurrentMonth: true });
  }
  // Next month days to fill grid
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, month: month + 1, year: month === 11 ? year + 1 : year, isCurrentMonth: false });
    }
  }
  return days;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function openGoogleMapsRoute(address: string) {
  const encoded = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, "_blank");
}

export default function Agenda() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isPhoneRestricted } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"mes" | "semana" | "dia">("mes");

  // Dynamic calendar state
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(now.getFullYear(), now.getMonth(), now.getDate()));

  // Modal states
  const [isCreateVisitOpen, setIsCreateVisitOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedVisitForReg, setSelectedVisitForReg] = useState<Visit | null>(null);
  const [isVisitDetailOpen, setIsVisitDetailOpen] = useState(false);
  const [detailVisit, setDetailVisit] = useState<Visit | null>(null);
  const [leadPanelVisit, setLeadPanelVisit] = useState<Visit | null>(null);

  // Real data hooks
  const { data: visits = [], isLoading } = useVisits({ month: currentMonth, year: currentYear });
  const { data: allLeads = [] } = useLeads();
  const { data: allProperties = [] } = useProperties();
  const { data: conversations = [] } = useConversations(user?.id, profile?.role || "admin");
  const createVisitMutation = useCreateVisit();
  const confirmVisitMutation = useConfirmVisit();
  const completeVisitMutation = useCompleteVisit();
  const syncGoogleMutation = useSyncVisitGoogleCalendar();

  // Map leads/properties for the create modal
  const availableLeads: Lead[] = useMemo(() =>
    allLeads.map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email || "",
      phone: l.phone || "",
      score: l.score || 0,
      stage: l.stage,
      propertyCode: "",
    })),
    [allLeads]
  );

  const availableProperties: Property[] = useMemo(() =>
    allProperties.map((p) => ({
      id: p.id,
      title: `${p.code ? p.code + ' - ' : ''}${p.title}`,
      location: p.location,
      price: p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }),
    })),
    [allProperties]
  );

  // Contatos de Atendimiento: clientes de las conversaciones (profiles), para el
  // nuevo campo "Contato de Atendimiento" del modal de agendamiento.
  const availableContacts: Contact[] = useMemo(() =>
    conversations
      .filter((c) => !!c.client)
      .map((c) => ({
        id: c.client!.id,
        conversationId: c.id,
        name: c.client!.full_name || "",
        phone: c.client!.phone || "",
        email: c.client!.email || null,
        avatarUrl: c.client!.avatar_url || null,
      }))
      .filter((c) => c.name.trim().length > 0 || c.phone.trim().length > 0),
    [conversations]
  );

  // Open create modal when navigating with ?action=new
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setIsCreateVisitOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Group visits by date for calendar rendering
  const visitsByDate = useMemo(() => {
    const map: Record<string, Visit[]> = {};
    visits.forEach((v) => {
      const key = v.scheduled_at.split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(v);
    });
    return map;
  }, [visits]);

  // Visits per day count (for limit checking)
  const visitsPerDay = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(visitsByDate).forEach(([date, vs]) => {
      counts[date] = vs.length;
    });
    return counts;
  }, [visitsByDate]);

  // Calendar days
  const calendarDays = useMemo(() => getCalendarDays(currentYear, currentMonth), [currentYear, currentMonth]);

  // Today's visits (selected date)
  const selectedDayVisits = visitsByDate[selectedDate] || [];

  // Pending confirmations
  const pendingConfirmations = visits.filter((v) => v.status === "scheduled");

  // Next upcoming visit
  const nextVisit = useMemo(() => {
    const nowMs = Date.now();
    return visits
      .filter((v) => v.status !== "completed" && v.status !== "cancelled" && new Date(v.scheduled_at).getTime() > nowMs)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0] || null;
  }, [visits]);

  // Navigation
  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };
  const goToToday = () => {
    const t = new Date();
    setCurrentYear(t.getFullYear());
    setCurrentMonth(t.getMonth());
    setSelectedDate(formatDateKey(t.getFullYear(), t.getMonth(), t.getDate()));
  };

  const getVisitColor = (v: Visit) => {
    if (v.status === "completed") return "bg-success/20 text-success border-l-2 border-success";
    if (v.status === "confirmed") return "bg-success/20 text-success border-l-2 border-success";
    if (v.status === "cancelled") return "bg-muted text-muted-foreground border-l-2 border-muted";
    return "bg-destructive/20 text-destructive border-l-2 border-destructive"; // scheduled = pending
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Concluída";
      case "confirmed": return "Confirmada";
      case "cancelled": return "Cancelada";
      default: return "Pendente";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "confirmed": return "bg-success/20 text-success border border-success";
      case "cancelled": return "bg-muted text-muted-foreground";
      default: return "bg-destructive text-destructive-foreground";
    }
  };

  const getGoogleSyncLabel = (visit: Visit) => {
    switch (visit.google_sync_status) {
      case "synced": return "Google ok";
      case "error": return "Google erro";
      case "skipped": return "Google off";
      default: return "Google pendente";
    }
  };

  const getGoogleSyncStyle = (visit: Visit) => {
    switch (visit.google_sync_status) {
      case "synced": return "bg-success/10 text-success border-success/20";
      case "error": return "bg-destructive/10 text-destructive border-destructive/20";
      case "skipped": return "bg-muted text-muted-foreground border-border";
      default: return "bg-warning/10 text-warning border-warning/20";
    }
  };

  const handleRetryGoogleSync = async (visit: Visit) => {
    try {
      await syncGoogleMutation.mutateAsync({
        visitId: visit.id,
        action: visit.status === "cancelled" ? "delete" : "upsert",
      });
      toast({ title: "Google atualizado", description: "A visita foi reenviada para o Google Calendar." });
    } catch (err: any) {
      toast({ title: "Erro no Google", description: err?.message || "Não foi possível sincronizar.", variant: "destructive" });
    }
  };

  // Create visit handler (saves to Supabase)
  const handleCreateVisit = async (formData: VisitFormData) => {
    if (!user) return;

    // Use IDs directly — leadId and propertyCode now carry real UUIDs
    const leadId = formData.leadId || null;
    const propertyId = formData.propertyCode || null;
    // id del cliente de la conversación (profiles.id). El back (useCreateVisit) lo resuelve:
    // deriva lead_id desde conversations y elimina contact_id antes del INSERT.
    const contactId = formData.contactId || null;

    // `tipo` (reunion|visita) se guarda en formData.tipo (contrato). Se enviará como columna
    // cuando types/database.ts la incluya; se omite ahora para no fallar el INSERT en runtime.

    const scheduledAt = new Date(`${formData.date}T${formData.time}:00`).toISOString();

    try {
      await createVisitMutation.mutateAsync({
        lead_id: contactId && !leadId ? null : leadId,
        property_id: propertyId,
        agent_id: user.id,
        created_by: user.id,
        scheduled_at: scheduledAt,
        status: formData.confirmed ? "confirmed" : "scheduled",
        duration_minutes: 90,
        notes: formData.notes || null,
        contact_id: contactId,
      });

      toast({
        title: "Visita Criada",
        description: `Visita agendada para ${formData.date} às ${formData.time}.`,
      });

      // Check limit: if 3rd+ visit on this day, notify manager
      const dayCount = (visitsPerDay[formData.date] || 0) + 1;
      if (dayCount >= 3) {
        await createVisitLimitNotification(user.id, formData.date, dayCount);
      }
    } catch (err: any) {
      console.error("Erro ao criar visita:", err);
      toast({
        title: "Erro ao criar visita",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmVisit = async (visitId: string) => {
    try {
      await confirmVisitMutation.mutateAsync(visitId);
      toast({ title: "Visita Confirmada", description: "Status atualizado com sucesso." });
    } catch (err: any) {
      console.error("Erro ao confirmar visita:", err);
      toast({ title: "Erro ao confirmar", description: err?.message || "Tente novamente.", variant: "destructive" });
    }
  };

  const handleStartVisit = (visit: Visit) => {
    setSelectedVisitForReg(visit);
    setIsRegistrationOpen(true);
  };

  const handleVisitRegistration = async (data: VisitRegistrationData) => {
    if (!selectedVisitForReg) return;
    try {
      await completeVisitMutation.mutateAsync({
        id: selectedVisitForReg.id,
        feedback: `Interesse: ${data.interestLevel}. Pontos positivos: ${data.positivePoints}. Objeções: ${data.objections}. Próximo passo: ${data.nextStep}`,
        rating: data.interestLevel === "high" ? 5 : data.interestLevel === "medium" ? 3 : 1,
        notes: data.willFormalize ? "Cliente vai formalizar proposta" : data.noFormalizeReason || "",
      });
      toast({ title: "Visita Registrada", description: "Feedback salvo com sucesso." });
    } catch (err: any) {
      console.error("Erro ao registrar visita:", err);
      toast({ title: "Erro ao registrar", description: err?.message || "Tente novamente.", variant: "destructive" });
    }
    setSelectedVisitForReg(null);
  };

  const handleEventClick = (visit: Visit) => {
    setDetailVisit(visit);
    setIsVisitDetailOpen(true);
  };

  const handleLeadClick = (visit: Visit) => {
    setLeadPanelVisit(visit);
  };

  const handleNavigateToLead = useCallback((leadId?: string) => {
    if (leadId) navigate("/leads", { state: { selectedLeadId: leadId } });
    else navigate("/leads");
  }, [navigate]);

  const todayKey = formatDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDateObj = new Date(selectedDate + "T12:00:00");
  const selectedDateLabel = selectedDateObj.toLocaleDateString("pt-BR", { day: "numeric", month: "short", weekday: "short" });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="agenda"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="agenda"
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
          title="Agenda e Visitas"
          subtitle="Gestão de compromissos e visitas aos imóveis"
          actionButton={
            <div className="flex gap-2">
              <Button variant="cta" className="gap-2" onClick={() => setIsCreateVisitOpen(true)}>
                <Plus className="h-4 w-4" />
                Criar Visita
              </Button>
            </div>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
          {/* Pending Confirmations Alert */}
          {pendingConfirmations.length > 0 && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  {pendingConfirmations.length} visita(s) pendente(s) de confirmação
                </p>
                <p className="text-sm text-muted-foreground">
                  Visitas não confirmadas aparecem em vermelho no calendário
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-6">
            {/* Calendar */}
            <div className="flex-1">
              <div className="bg-card rounded-xl shadow-sm p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold text-foreground">
                      {monthNames[currentMonth]} {currentYear}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="cta" size="sm" onClick={goToToday}>
                      Hoje
                    </Button>
                  </div>
                  <div className="flex border border-border rounded-lg overflow-hidden">
                    {(["mes", "semana", "dia"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={cn(
                          "px-4 py-2 text-sm font-medium transition-colors",
                          viewMode === mode
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Confirmada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="text-muted-foreground">Não Confirmada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span className="text-muted-foreground">Reunião/Chamada</span>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-7 bg-muted/50">
                    {weekDays.map((day) => (
                      <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground border-b border-border">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {calendarDays.map((dayInfo, index) => {
                      const dateKey = formatDateKey(dayInfo.year, dayInfo.month, dayInfo.day);
                      const dayVisits = visitsByDate[dateKey] || [];
                      const hasOverLimit = dayVisits.length > 2;
                      const isSelected = dateKey === selectedDate;
                      const isToday = dateKey === todayKey;

                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(dateKey)}
                          className={cn(
                            "min-h-[100px] p-2 border-b border-r border-border cursor-pointer transition-colors hover:bg-muted/30",
                            isSelected && "bg-accent/5",
                            !dayInfo.isCurrentMonth && "opacity-40",
                            index % 7 === 6 && "border-r-0"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "inline-flex items-center justify-center h-7 w-7 rounded-full text-sm",
                                isToday && "bg-primary text-primary-foreground font-bold",
                                isSelected && !isToday && "bg-accent text-accent-foreground font-semibold",
                                !isSelected && !isToday && "text-foreground"
                              )}
                            >
                              {dayInfo.day}
                            </span>
                            {hasOverLimit && (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                          </div>
                          <div className="mt-1 space-y-1">
                            {dayVisits.slice(0, 3).map((visit) => (
                              <div
                                key={visit.id}
                                onClick={(e) => { e.stopPropagation(); handleEventClick(visit); }}
                                className={cn(
                                  "text-xs px-1.5 py-1 rounded truncate cursor-pointer hover:opacity-80",
                                  getVisitColor(visit)
                                )}
                              >
                                {formatTime(visit.scheduled_at)} - {visit.lead?.name?.split(" ")[0] || visit.property?.code || "Visita"}
                              </div>
                            ))}
                            {dayVisits.length > 3 && (
                              <div className="text-xs text-muted-foreground px-1.5">+{dayVisits.length - 3} mais</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Today's Visits + Lead Detail */}
            <div className="hidden lg:flex lg:flex-col w-[340px] gap-4">
              {/* Visits Panel */}
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Visitas do Dia</h3>
                  <span className="text-sm text-muted-foreground capitalize">{selectedDateLabel}</span>
                </div>

                {/* Next Visit Card */}
                {nextVisit && (
                  <div className="p-4">
                    <div className="bg-accent rounded-xl p-4 text-accent-foreground relative overflow-hidden">
                      <Badge className="bg-accent-foreground/20 text-accent-foreground mb-2">
                        Próxima Visita
                      </Badge>
                      <h4 className="font-semibold text-lg mb-1">
                        {nextVisit.lead?.name || "Visita"}
                      </h4>
                      <p className="text-sm opacity-90 mb-2">
                        {nextVisit.property?.title || nextVisit.property?.code || ""}
                      </p>
                      <div className="flex items-center gap-1 text-sm opacity-90 mb-4">
                        <Clock className="h-4 w-4" />
                        {formatTime(nextVisit.scheduled_at)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          onClick={() => {
                            const addr = nextVisit.property?.address || nextVisit.property?.location || "";
                            if (addr) openGoogleMapsRoute(addr);
                          }}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Iniciar Rota
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          onClick={() => handleStartVisit(nextVisit)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Check-in
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visits List */}
                <div className="border-t border-border">
                  {selectedDayVisits.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      Nenhuma visita agendada para este dia
                    </div>
                  )}
                  {selectedDayVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5
                            className="font-medium text-foreground hover:text-accent cursor-pointer truncate"
                            onClick={() => handleLeadClick(visit)}
                          >
                            {visit.lead?.name || "Visita"}
                          </h5>
                          <p className="text-sm text-muted-foreground truncate">{visit.property?.title || visit.property?.code || ""}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(visit.scheduled_at)}
                          </div>
                          {(visit.property?.address || visit.property?.location) && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {visit.property?.address || visit.property?.location}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={cn("text-xs", getStatusBadgeStyle(visit.status))}>
                            {visit.status === "completed" && <><Check className="h-3 w-3 mr-1" /> Concluída</>}
                            {visit.status === "confirmed" && "Confirmada"}
                            {visit.status === "scheduled" && "Pendente"}
                            {visit.status === "cancelled" && "Cancelada"}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs", getGoogleSyncStyle(visit))}>
                            {getGoogleSyncLabel(visit)}
                          </Badge>
                          <div className="flex gap-1">
                            {visit.status === "scheduled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-success text-success hover:bg-success/10"
                                onClick={(e) => { e.stopPropagation(); handleConfirmVisit(visit.id); }}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Confirmar
                              </Button>
                            )}
                            {visit.status !== "completed" && visit.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={(e) => { e.stopPropagation(); handleStartVisit(visit); }}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Iniciar
                              </Button>
                            )}
                            {(visit.property?.address || visit.property?.location) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openGoogleMapsRoute(visit.property?.address || visit.property?.location || "");
                                }}
                              >
                                <Navigation className="h-3 w-3" />
                              </Button>
                            )}
                            {visit.google_calendar_link && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(visit.google_calendar_link || "", "_blank");
                                }}
                                title="Abrir no Google Calendar"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                            {(visit.google_sync_status === "error" || visit.google_sync_status === "skipped" || visit.google_sync_status === "pending") && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRetryGoogleSync(visit);
                                }}
                                disabled={syncGoogleMutation.isPending}
                                title="Reenviar para Google Calendar"
                              >
                                <RefreshCw className={cn("h-3 w-3", syncGoogleMutation.isPending && "animate-spin")} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Detail Panel (opens when clicking lead name) */}
              {leadPanelVisit?.lead && (
                <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm">Detalhes do Lead</h3>
                    <button onClick={() => setLeadPanelVisit(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-accent text-accent-foreground text-sm font-semibold">
                          {leadPanelVisit.lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{leadPanelVisit.lead.name}</p>
                        <p className="text-xs text-muted-foreground">{leadPanelVisit.lead.stage}</p>
                      </div>
                    </div>

                    {isPhoneRestricted ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">[Oculto]</span>
                      </div>
                    ) : leadPanelVisit.lead.phone ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{leadPanelVisit.lead.phone}</span>
                      </div>
                    ) : null}
                    {leadPanelVisit.lead.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{leadPanelVisit.lead.email}</span>
                      </div>
                    )}
                    {leadPanelVisit.lead.score !== null && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-accent" />
                        <span className="text-foreground">Score: {leadPanelVisit.lead.score}/10</span>
                      </div>
                    )}
                    {leadPanelVisit.lead.source && (
                      <div className="text-xs text-muted-foreground">
                        Origem: {leadPanelVisit.lead.source}
                      </div>
                    )}
                    {leadPanelVisit.lead.sla_status && (
                      <Badge className={cn("text-xs",
                        leadPanelVisit.lead.sla_status === "ok" && "bg-success/20 text-success",
                        leadPanelVisit.lead.sla_status === "warning" && "bg-warning/20 text-warning",
                        (leadPanelVisit.lead.sla_status === "critical" || leadPanelVisit.lead.sla_status === "expired") && "bg-destructive/20 text-destructive"
                      )}>
                        SLA: {leadPanelVisit.lead.sla_status}
                      </Badge>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 gap-2"
                      onClick={() => handleNavigateToLead(leadPanelVisit.lead?.id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver Lead Completo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Visit Modal */}
      <CreateVisitModal
        open={isCreateVisitOpen}
        onOpenChange={setIsCreateVisitOpen}
        onConfirm={handleCreateVisit}
        visitsPerDay={visitsPerDay}
        availableLeads={availableLeads}
        availableProperties={availableProperties}
        availableContacts={availableContacts}
      />

      {/* Visit Registration Modal */}
      {selectedVisitForReg && (
        <VisitRegistrationModal
          open={isRegistrationOpen}
          onOpenChange={setIsRegistrationOpen}
          onConfirm={handleVisitRegistration}
          visitInfo={{
            clientName: selectedVisitForReg.lead?.name || "Visita",
            property: selectedVisitForReg.property?.title || selectedVisitForReg.property?.code || "",
          }}
        />
      )}

      {/* Visit Detail Modal */}
      {detailVisit && isVisitDetailOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsVisitDetailOpen(false)}>
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {formatTime(detailVisit.scheduled_at)} - {detailVisit.property?.title || detailVisit.property?.code || "Visita"}
              </h3>
              <button onClick={() => setIsVisitDetailOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {detailVisit.lead && (
                <div>
                  <Label className="text-muted-foreground">Lead</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg flex items-center justify-between">
                    <span className="font-medium text-foreground">{detailVisit.lead.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => { handleNavigateToLead(detailVisit.lead?.id); setIsVisitDetailOpen(false); }}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {detailVisit.property && (
                <div>
                  <Label className="text-muted-foreground">Imóvel</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p className="font-medium text-foreground">{detailVisit.property.title}</p>
                    <p className="text-xs text-muted-foreground">{detailVisit.property.code} • {detailVisit.property.location}</p>
                    {detailVisit.property.address && (
                      <p className="text-xs text-muted-foreground mt-1">{detailVisit.property.address}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge className={cn("text-xs", getStatusBadgeStyle(detailVisit.status))}>
                    {getStatusLabel(detailVisit.status)}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", getGoogleSyncStyle(detailVisit))}>
                    {getGoogleSyncLabel(detailVisit)}
                  </Badge>
                </div>
                {detailVisit.google_sync_error && (
                  <p className="mt-2 text-xs text-destructive">{detailVisit.google_sync_error}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => setIsVisitDetailOpen(false)} className="flex-1">
                Fechar
              </Button>
              {detailVisit.status === "scheduled" && (
                <Button
                  variant="cta"
                  className="flex-1 gap-2"
                  onClick={() => { handleConfirmVisit(detailVisit.id); setIsVisitDetailOpen(false); }}
                >
                  <Check className="h-4 w-4" />
                  Confirmar
                </Button>
              )}
              {(detailVisit.property?.address || detailVisit.property?.location) && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => openGoogleMapsRoute(detailVisit.property?.address || detailVisit.property?.location || "")}
                >
                  <Navigation className="h-4 w-4" />
                  Rota
                </Button>
              )}
              {detailVisit.google_calendar_link && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(detailVisit.google_calendar_link || "", "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Google
                </Button>
              )}
              {(detailVisit.google_sync_status === "error" || detailVisit.google_sync_status === "skipped" || detailVisit.google_sync_status === "pending") && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleRetryGoogleSync(detailVisit)}
                  disabled={syncGoogleMutation.isPending}
                >
                  <RefreshCw className={cn("h-4 w-4", syncGoogleMutation.isPending && "animate-spin")} />
                  Sync
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
