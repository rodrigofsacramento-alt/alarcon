import { useState, useEffect } from "react";
import { FileText, DollarSign, User, Building2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeads } from "@/hooks/use-leads";
import { useProperties } from "@/hooks/use-properties";
export interface ProposalFormData {
  client_name: string;
  lead_id: string;
  property_id: string;
  value: string;
  payment_type: string;
  status: string;
  notes: string;
}
interface CreateProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: ProposalFormData) => void;
}
const initialFormData: ProposalFormData = {
  client_name: "",
  lead_id: "",
  property_id: "",
  value: "",
  payment_type: "Financiamento",
  status: "Docs Enviados",
  notes: ""
};
export function CreateProposalModal({
  open,
  onOpenChange,
  onConfirm
}: CreateProposalModalProps) {
  const [formData, setFormData] = useState<ProposalFormData>(initialFormData);
  const [step, setStep] = useState(1);
  const {
    data: leads = []
  } = useLeads({});
  const {
    data: properties = []
  } = useProperties();
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setStep(1);
    }
  }, [open]);

  // Auto-fill client name when lead is selected
  useEffect(() => {
    if (formData.lead_id) {
      const lead = leads.find(l => l.id === formData.lead_id);
      if (lead && !formData.client_name) {
        setFormData(prev => ({
          ...prev,
          client_name: lead.name
        }));
      }
    }
  }, [formData.lead_id, leads]);
  const handleChange = (field: keyof ProposalFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = () => {
    onConfirm(formData);
    onOpenChange(false);
  };
  const isStep1Valid = formData.client_name.trim() && formData.value.trim();
  const isStep2Valid = true; // optional fields
  const totalSteps = 3;
  const formatPrice = (price: number) => price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  });
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Nova Proposta</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  Etapa {step} de {totalSteps}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {/* Progress bar */}
          <div className="flex gap-2 mt-4">
            {Array.from({
            length: totalSteps
          }).map((_, i) => <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < step ? "bg-accent" : "bg-muted"}`} />)}
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Step 1: Cliente e Valor */}
          {step === 1 && <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4 text-accent" />
                  <span>Cliente e Valor</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
                  <div className="space-y-2">
                    <Label>Lead Vinculado</Label>
                    <Select value={formData.lead_id} onValueChange={v => handleChange("lead_id", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um lead (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {leads.map(lead => <SelectItem key={lead.id} value={lead.id}>
                            {lead.name} — {lead.email}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Cliente *</Label>
                    <Input placeholder="Ex: João Silva" value={formData.client_name} onChange={e => handleChange("client_name", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor da Proposta (R$) *</Label>
                      <Input placeholder="Ex: 1250000" value={formData.value} onChange={e => handleChange("value", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Forma de Pagamento</Label>
                      <Select value={formData.payment_type} onValueChange={v => handleChange("payment_type", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Financiamento">Financiamento</SelectItem>
                          <SelectItem value="À Vista">À Vista</SelectItem>
                          <SelectItem value="Parcelado Direto">Parcelado Direto</SelectItem>
                          <SelectItem value="FGTS + Financiamento">FGTS + Financiamento</SelectItem>
                          <SelectItem value="Permuta">Permuta</SelectItem>
                          <SelectItem value="Consórcio">Consórcio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </>}

          {/* Step 2: Imóvel */}
          {step === 2 && <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-accent" />
                  <span>Imóvel Vinculado</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
                  <div className="space-y-2">
                    <Label>Selecione o Imóvel</Label>
                    <Select value={formData.property_id} onValueChange={v => handleChange("property_id", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um imóvel" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map(p => <SelectItem key={p.id} value={p.id}>
                            {p.code} — {p.title} ({formatPrice(p.price)})
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.property_id && (() => {
                const selected = properties.find(p => p.id === formData.property_id);
                if (!selected) return null;
                return <div className="bg-card rounded-lg p-4 border border-border">
                        <p className="font-semibold text-foreground">{selected.title}</p>
                        <p className="text-sm text-muted-foreground">{selected.address || selected.location}</p>
                        <p className="text-lg font-bold text-accent mt-2">{formatPrice(selected.price)}</p>
                      </div>;
              })()}

                  <div className="space-y-2">
                    <Label>Status Inicial</Label>
                    <Select value={formData.status} onValueChange={v => handleChange("status", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Docs Enviados">Docs Enviados</SelectItem>
                        <SelectItem value="Proposta Comprador">Proposta Comprador</SelectItem>
                        <SelectItem value="Finalizada Comprador">Finalizada Comprador</SelectItem>
                        <SelectItem value="Proposta Vendedor">Proposta Vendedor</SelectItem>
                        <SelectItem value="Finalizada">Finalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>}

          {/* Step 3: Revisão */}
          {step === 3 && <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ClipboardList className="h-4 w-4 text-accent" />
                  <span>Revisão e Observações</span>
                </div>

                {/* Summary */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Cliente</p>
                      <p className="font-medium text-foreground">{formData.client_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="font-medium text-accent">
                        {formData.value ? parseFloat(formData.value).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0
                    }) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pagamento</p>
                      <p className="font-medium text-foreground">{formData.payment_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium text-foreground">{formData.status}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Imóvel</p>
                      <p className="font-medium text-foreground">
                        {formData.property_id ? properties.find(p => p.id === formData.property_id)?.title || "—" : "Nenhum vinculado"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea placeholder="Notas adicionais sobre a proposta..." value={formData.notes} onChange={e => handleChange("notes", e.target.value)} rows={4} />
                </div>
              </div>
            </>}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between gap-3">
          <div>
            {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {step < totalSteps ? <Button variant="cta" onClick={() => setStep(step + 1)} disabled={step === 1 && !isStep1Valid}>
                Próximo
              </Button> : <Button variant="cta" onClick={handleSubmit} disabled={!isStep1Valid}>
                Criar Proposta
              </Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}