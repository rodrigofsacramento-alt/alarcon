import { useState } from "react";
import { Calendar, Clock, Plus, AlertTriangle, User, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadSearch } from "@/components/agenda/LeadSearch";
import { PropertySearchAgenda } from "@/components/agenda/PropertySearchAgenda";
import type { Lead, Property } from "@/hooks/use-semantic-search";

interface CreateVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (visitData: VisitFormData) => void;
  visitsPerDay: Record<string, number>;
  availableLeads?: Lead[];
  availableProperties?: Property[];
}

export interface VisitFormData {
  leadName: string;
  leadId: string;
  propertyCode: string;
  date: string;
  time: string;
  confirmed: boolean;
  sla: string;
}

const slaOptions = ["24h", "48h", "72h"];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
];

export function CreateVisitModal({ 
  open, 
  onOpenChange, 
  onConfirm, 
  visitsPerDay,
  availableLeads = [],
  availableProperties = [],
}: CreateVisitModalProps) {
  const [formData, setFormData] = useState<VisitFormData>({
    leadName: "",
    leadId: "",
    propertyCode: "",
    date: "",
    time: "",
    confirmed: false,
    sla: "48h",
  });

  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const handleDateChange = (value: string) => {
    const visitsOnDate = visitsPerDay[value] || 0;
    setShowLimitWarning(visitsOnDate >= 2);
    setFormData((prev) => ({ ...prev, date: value }));
  };

  const handleTimeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, time: value }));
  };

  const handleSLAChange = (value: string) => {
    setFormData((prev) => ({ ...prev, sla: value }));
  };

  const handleConfirmedChange = (value: boolean) => {
    setFormData((prev) => ({ ...prev, confirmed: value }));
  };

  const handleLeadSelect = (lead: Lead) => {
    setFormData((prev) => ({
      ...prev,
      leadName: lead.name,
      leadId: lead.id,
    }));
  };

  const handlePropertySelect = (property: Property) => {
    setFormData((prev) => ({
      ...prev,
      propertyCode: property.id,
    }));
  };

  const handleSubmit = () => {
    onConfirm(formData);
    setFormData({
      leadName: "",
      leadId: "",
      propertyCode: "",
      date: "",
      time: "",
      confirmed: false,
      sla: "48h",
    });
    setShowLimitWarning(false);
    onOpenChange(false);
  };

  const isValid = formData.leadName && formData.propertyCode && formData.date && formData.time;

  // Calculate min and max dates (1 year past, 5 years future)
  const today = new Date();
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 1);
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() + 5);

  const formatDateForInput = (date: Date) => date.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Criar Visita</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">Agende uma nova visita ao imóvel</p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {showLimitWarning && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 text-sm text-warning flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>Este corretor já possui 2 ou mais visitas neste dia. A visita será cadastrada, mas um alerta será gerado.</span>
            </div>
          )}

          {/* Section: Lead & Imóvel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="h-4 w-4 text-accent" />
              <span>Lead & Imóvel</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              {/* Lead Search */}
              <div className="space-y-2">
                <Label>Lead *</Label>
                {availableLeads.length > 0 ? (
                  <>
                    <LeadSearch
                      availableLeads={availableLeads}
                      onLeadSelect={handleLeadSelect}
                      placeholder="Buscar lead pelo nome, email ou telefone..."
                    />
                    {formData.leadName && (
                      <p className="text-xs text-success">✓ Lead selecionado: {formData.leadName}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhum lead disponível para seleção</p>
                )}
                <p className="text-xs text-muted-foreground">O lead será clicável no card da visita</p>
              </div>

              {/* Property Search */}
              <div className="space-y-2">
                <Label>Imóvel *</Label>
                {availableProperties.length > 0 ? (
                  <>
                    <PropertySearchAgenda
                      availableProperties={availableProperties}
                      onPropertySelect={handlePropertySelect}
                      placeholder="Buscar imóvel: código, nome ou localização..."
                    />
                    {formData.propertyCode && (
                      <p className="text-xs text-success">✓ Imóvel selecionado: {formData.propertyCode}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhum imóvel disponível para seleção</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Agendamento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4 text-accent" />
              <span>Agendamento</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              {/* Data e Horário */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <div className="relative">
                    <input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={formatDateForInput(minDate)}
                      max={formatDateForInput(maxDate)}
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Horário *</Label>
                  <Select value={formData.time} onValueChange={handleTimeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* SLA */}
              <div className="space-y-2">
                <Label htmlFor="sla">SLA</Label>
                <Select value={formData.sla} onValueChange={handleSLAChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o SLA" />
                  </SelectTrigger>
                  <SelectContent>
                    {slaOptions.map((sla) => (
                      <SelectItem key={sla} value={sla}>
                        {sla}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section: Confirmação */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span>Confirmação</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <div className="space-y-3">
                <Label>Confirmado *</Label>
                <div className="flex gap-3">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 p-3 transition-all ${
                      formData.confirmed
                        ? "border-success bg-success/10 text-success"
                        : "border-border hover:border-success/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="confirmed"
                      checked={formData.confirmed === true}
                      onChange={() => handleConfirmedChange(true)}
                      className="sr-only"
                    />
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Sim, confirmada</span>
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 p-3 transition-all ${
                      !formData.confirmed
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border hover:border-destructive/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="confirmed"
                      checked={formData.confirmed === false}
                      onChange={() => handleConfirmedChange(false)}
                      className="sr-only"
                    />
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Pendente</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.confirmed 
                    ? "✓ Evento aparecerá em verde no calendário" 
                    : "⚠ Evento aparecerá em vermelho (pendência)"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="cta" onClick={handleSubmit} disabled={!isValid}>
            Criar Visita
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
