import { useState } from "react";
import { Calendar, Plus, User, Phone as PhoneIcon, Mail, MapPin, Building2, FileText, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertySearch } from "@/components/leads/PropertySearch";
import type { Property } from "@/hooks/use-semantic-search";
interface CreateLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (leadData: LeadFormData) => void;
  availableProperties?: Property[];
}
export interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  source: string;
  propertyCode: string;
  propertyLocation: string;
  propertyId?: string;
  createdAt: string;
  stage: string;
  budget: string;
  history: string;
  interest: string;
  sla: string;
}
const stages = ["Lead Cadastrado", "Primeiro Atendimento", "Follow-up", "Agendamento de Visita", "Visita Agendada", "Imóvel Escolhido", "Em Aprovação de Correspondência", "Proposta Solicitada"];
const sources = ["Viva Real", "ZAP Imóveis", "OLX", "Facebook Ads", "Instagram Ads", "Google Ads", "Site", "Indicação", "Outros"];
const slaOptions = ["24h", "48h", "72h", "1 semana"];
export function CreateLeadModal({
  open,
  onOpenChange,
  onConfirm,
  availableProperties = []
}: CreateLeadModalProps) {
  const now = new Date();
  const formattedDate = `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    phone: "",
    email: "",
    source: "",
    propertyCode: "",
    propertyLocation: "",
    propertyId: undefined,
    createdAt: formattedDate,
    stage: "Lead Cadastrado",
    budget: "",
    history: "",
    interest: "",
    sla: "48h"
  });
  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSelectProperty = (property: Property) => {
    setFormData(prev => ({
      ...prev,
      propertyCode: property.id,
      propertyLocation: property.location,
      propertyId: property.id
    }));
  };
  const handleSubmit = () => {
    onConfirm(formData);
    setFormData({
      name: "",
      phone: "",
      email: "",
      source: "",
      propertyCode: "",
      propertyLocation: "",
      propertyId: undefined,
      createdAt: formattedDate,
      stage: "Lead Cadastrado",
      budget: "",
      history: "",
      interest: "",
      sla: "48h"
    });
    onOpenChange(false);
  };
  const isValid = formData.name && formData.phone && formData.email;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Cadastrar Lead</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">Preencha os dados do novo lead</p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Section: Dados Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="h-4 w-4 text-accent" />
              <span>Dados Pessoais</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" placeholder="Ex: Rodrigo Sacramento" value={formData.name} onChange={e => handleChange("name", e.target.value)} />
                </div>

                {/* Telefone / WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                  <Input id="phone" placeholder="Ex: 5511988192658" value={formData.phone} onChange={e => handleChange("phone", e.target.value)} />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="Ex: rodrigosacramento@gmail.com" value={formData.email} onChange={e => handleChange("email", e.target.value)} />
                </div>

                {/* Origem do Lead */}
                <div className="space-y-2">
                  <Label htmlFor="source">Origem do Lead</Label>
                  <Select value={formData.source} onValueChange={v => handleChange("source", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map(source => <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Imóvel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Building2 className="h-4 w-4 text-accent" />
              <span>Imóvel de Interesse</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              {/* Imóvel de Interesse com Busca Semântica */}
              <div className="space-y-2">
                <Label htmlFor="propertyCode">Imóvel de Interesse</Label>
                {availableProperties.length > 0 ? <>
                    <PropertySearch availableProperties={availableProperties} onPropertySelect={handleSelectProperty} placeholder="Buscar: código, nome ou localização..." />
                    {formData.propertyCode && <p className="text-xs text-success">✓ Imóvel selecionado: {formData.propertyCode}</p>}
                  </> : <Input id="propertyCode" placeholder="Ex: AP8736" value={formData.propertyCode} onChange={e => handleChange("propertyCode", e.target.value)} />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Localização do Imóvel */}
                <div className="space-y-2">
                  <Label htmlFor="propertyLocation">Localização do Imóvel</Label>
                  <Input id="propertyLocation" placeholder="Ex: São Bernardo do Campo" value={formData.propertyLocation} onChange={e => handleChange("propertyLocation", e.target.value)} readOnly={!!formData.propertyId} className={formData.propertyId ? "bg-muted" : ""} />
                </div>

                {/* Orçamento */}
                <div className="space-y-2">
                  <Label htmlFor="budget">Orçamento</Label>
                  <Input id="budget" placeholder="Ex: 1.5M – 2.2M" value={formData.budget} onChange={e => handleChange("budget", e.target.value)} />
                </div>
              </div>

              {/* Interesse */}
              <div className="space-y-2">
                <Label htmlFor="interest">Interesse</Label>
                <Input id="interest" placeholder="Ex: Imóvel 3 dorm no centro de SBC" value={formData.interest} onChange={e => handleChange("interest", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section: Gestão */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Target className="h-4 w-4 text-accent" />
              <span>Gestão do Lead</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data e Hora de Cadastro */}
                <div className="space-y-2">
                  <Label htmlFor="createdAt">Data e Hora de Cadastro</Label>
                  <div className="relative">
                    <Input id="createdAt" value={formData.createdAt} readOnly className="bg-muted pr-10" />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Estágio de Venda */}
                <div className="space-y-2">
                  <Label htmlFor="stage">Estágio de Venda</Label>
                  <Select value={formData.stage} onValueChange={v => handleChange("stage", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estágio" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map(stage => <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* SLA */}
                <div className="space-y-2">
                  <Label htmlFor="sla">SLA</Label>
                  <Select value={formData.sla} onValueChange={v => handleChange("sla", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o SLA" />
                    </SelectTrigger>
                    <SelectContent>
                      {slaOptions.map(sla => <SelectItem key={sla} value={sla}>
                          {sla}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Histórico */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-accent" />
              <span>Histórico</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="history">Histórico de Atendimento</Label>
                <Textarea id="history" placeholder="Descreva o histórico de atendimento..." value={formData.history} onChange={e => handleChange("history", e.target.value)} rows={4} />
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
            Confirmar Cadastro
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}