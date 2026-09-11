import { useState, useEffect } from "react";
import { MessageSquare, User, Tag, FileText, Clock, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLeads } from "@/hooks/use-leads";
import { cn } from "@/lib/utils";

export interface AtendimentoFormData {
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  lead_id: string;
  channel: string;
  type: string;
  priority: string;
  subject: string;
  description: string;
}

interface CreateAtendimentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: AtendimentoFormData) => void;
  defaultLeadId?: string;
}

const initialFormData: AtendimentoFormData = {
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  lead_id: "",
  channel: "whatsapp",
  type: "Venda",
  priority: "normal",
  subject: "",
  description: "",
};

export function CreateAtendimentoModal({ open, onOpenChange, onConfirm, defaultLeadId }: CreateAtendimentoModalProps) {
  const [formData, setFormData] = useState<AtendimentoFormData>(initialFormData);
  const [step, setStep] = useState(1);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const { data: leads = [] } = useLeads({});

  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setStep(1);
    } else if (defaultLeadId) {
      setFormData(prev => ({ ...prev, lead_id: defaultLeadId }));
    }
  }, [open, defaultLeadId]);

  useEffect(() => {
    if (formData.lead_id) {
      const lead = leads.find((l) => l.id === formData.lead_id);
      if (lead) {
        setFormData((prev) => ({
          ...prev,
          contact_name: prev.contact_name || lead.name || "",
          contact_phone: prev.contact_phone || lead.phone || "",
          contact_email: prev.contact_email || lead.email || "",
        }));
      }
    }
  }, [formData.lead_id, leads]);

  const handleChange = (field: keyof AtendimentoFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onConfirm(formData);
    onOpenChange(false);
  };

  const isStep1Valid = typeof formData.contact_name === 'string' && formData.contact_name.trim().length > 0;
  const totalSteps = 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Novo Atendimento</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  Etapa {step} de {totalSteps}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < step ? "bg-accent" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Step 1: Contato */}
          {step === 1 && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4 text-accent" />
                  <span>Dados do Contato</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
                  <div className="space-y-2">
                    <Label>Vincular a Lead Existente</Label>
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboboxOpen}
                          className="w-full justify-between font-normal"
                        >
                          {formData.lead_id
                            ? (() => {
                                const l = leads.find((lead) => lead.id === formData.lead_id);
                                return l ? `${l.name} ${l.phone ? `— ${l.phone}` : ""}` : "Selecione um lead (opcional)";
                              })()
                            : "Selecione um lead (opcional)"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full min-w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar leads pelo nome, email ou telefone..." />
                          <CommandEmpty>Nenhum lead encontrado.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-y-auto">
                            {leads.map((lead) => (
                              <CommandItem
                                key={lead.id}
                                value={`${lead.name} ${lead.phone || ""} ${lead.email || ""}`}
                                onSelect={() => {
                                  handleChange("lead_id", lead.id === formData.lead_id ? "" : lead.id);
                                  setComboboxOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.lead_id === lead.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{lead.name}</span>
                                  {(lead.phone || lead.email) && (
                                    <span className="text-xs text-muted-foreground">
                                      {lead.phone ? ` ${lead.phone}` : ""} {lead.email ? ` | ${lead.email}` : ""}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Contato *</Label>
                    <Input
                      placeholder="Ex: Ricardo Ferreira"
                      value={formData.contact_name}
                      onChange={(e) => handleChange("contact_name", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        placeholder="Ex: 11999998888"
                        value={formData.contact_phone}
                        onChange={(e) => handleChange("contact_phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        placeholder="Ex: contato@email.com"
                        value={formData.contact_email}
                        onChange={(e) => handleChange("contact_email", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Tag className="h-4 w-4 text-accent" />
                  <span>Canal e Tipo</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Canal</Label>
                      <Select
                        value={formData.channel}
                        onValueChange={(v) => handleChange("channel", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="grupo_whatsapp">Grupo WhatsApp</SelectItem>
                          <SelectItem value="telefone">Telefone</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="site">Site</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(v) => handleChange("type", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Venda">Venda</SelectItem>
                          <SelectItem value="Aluguel">Aluguel</SelectItem>
                          <SelectItem value="Consultoria">Consultoria</SelectItem>
                          <SelectItem value="Suporte">Suporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(v) => handleChange("priority", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Detalhes e Revisão */}
          {step === 2 && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="h-4 w-4 text-accent" />
                  <span>Detalhes do Atendimento</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
                  <div className="space-y-2">
                    <Label>Assunto *</Label>
                    <Input
                      placeholder="Ex: Interesse no Edifício Horizon - Cobertura"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição / Primeira Mensagem</Label>
                    <Textarea
                      placeholder="Descreva o motivo do atendimento ou a primeira mensagem do contato..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-accent" />
                  <span>Resumo</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Contato</p>
                      <p className="font-medium text-foreground">{formData.contact_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="font-medium text-foreground">{formData.contact_phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Canal</p>
                      <p className="font-medium text-foreground capitalize">{formData.channel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <p className="font-medium text-foreground">{formData.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prioridade</p>
                      <p className="font-medium text-foreground capitalize">{formData.priority}</p>
                    </div>
                    {formData.lead_id && (
                      <div>
                        <p className="text-xs text-muted-foreground">Lead</p>
                        <p className="font-medium text-foreground">
                          {leads.find((l) => l.id === formData.lead_id)?.name || "—"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between gap-3">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {step < totalSteps ? (
              <Button
                variant="cta"
                onClick={() => setStep(step + 1)}
                disabled={!isStep1Valid}
              >
                Próximo
              </Button>
            ) : (
              <Button variant="cta" onClick={handleSubmit} disabled={!isStep1Valid}>
                Criar Atendimento
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
