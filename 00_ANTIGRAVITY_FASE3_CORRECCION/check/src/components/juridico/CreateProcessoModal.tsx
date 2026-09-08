import { useState, useEffect } from "react";
import { Scale, User, Building2, FileText, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProperties } from "@/hooks/use-properties";
import { useLeads } from "@/hooks/use-leads";
export interface ProcessoFormData {
  contract_type: string;
  property_id: string;
  buyer_name: string;
  buyer_cpf: string;
  buyer_phone: string;
  seller_name: string;
  seller_cpf: string;
  value: string;
  lead_id: string;
  responsible_lawyer: string;
  priority: string;
  notes: string;
}
interface CreateProcessoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: ProcessoFormData) => void;
}
const initialFormData: ProcessoFormData = {
  contract_type: "compra_venda",
  property_id: "",
  buyer_name: "",
  buyer_cpf: "",
  buyer_phone: "",
  seller_name: "",
  seller_cpf: "",
  value: "",
  lead_id: "",
  responsible_lawyer: "",
  priority: "normal",
  notes: ""
};
export function CreateProcessoModal({
  open,
  onOpenChange,
  onConfirm
}: CreateProcessoModalProps) {
  const [formData, setFormData] = useState<ProcessoFormData>(initialFormData);
  const [step, setStep] = useState(1);
  const {
    data: properties = []
  } = useProperties();
  const {
    data: leads = []
  } = useLeads({});
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setStep(1);
    }
  }, [open]);
  useEffect(() => {
    if (formData.lead_id) {
      const lead = leads.find(l => l.id === formData.lead_id);
      if (lead && !formData.buyer_name) {
        setFormData(prev => ({
          ...prev,
          buyer_name: lead.name,
          buyer_phone: lead.phone || ""
        }));
      }
    }
  }, [formData.lead_id, leads]);
  useEffect(() => {
    if (formData.property_id) {
      const prop = properties.find(p => p.id === formData.property_id);
      if (prop) {
        setFormData(prev => ({
          ...prev,
          seller_name: prev.seller_name || prop.owner_name || "",
          value: prev.value || String(prop.price)
        }));
      }
    }
  }, [formData.property_id, properties]);
  const handleChange = (field: keyof ProcessoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = () => {
    onConfirm(formData);
    onOpenChange(false);
  };
  const isStep1Valid = formData.contract_type.length > 0;
  const isStep2Valid = formData.buyer_name.trim().length > 0;
  const totalSteps = 3;
  const formatPrice = (price: number) => price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  });
  const contractTypeLabel = (type: string) => {
    switch (type) {
      case "compra_venda":
        return "Compra e Venda";
      case "locacao":
        return "Locação";
      case "permuta":
        return "Permuta";
      case "cessao":
        return "Cessão de Direitos";
      case "distrato":
        return "Distrato";
      default:
        return type;
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Novo Processo Jurídico</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  Etapa {step} de {totalSteps}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            {Array.from({
            length: totalSteps
          }).map((_, i) => <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < step ? "bg-accent" : "bg-muted"}`} />)}
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Step 1: Tipo e Imóvel */}
          {step === 1 && <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="h-4 w-4 text-accent" />
                  <span>Tipo de Contrato e Imóvel</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Contrato *</Label>
                      <Select value={formData.contract_type} onValueChange={v => handleChange("contract_type", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compra_venda">Compra e Venda</SelectItem>
                          <SelectItem value="locacao">Locação</SelectItem>
                          <SelectItem value="permuta">Permuta</SelectItem>
                          <SelectItem value="cessao">Cessão de Direitos</SelectItem>
                          <SelectItem value="distrato">Distrato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select value={formData.priority} onValueChange={v => handleChange("priority", v)}>
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

                  <div className="space-y-2">
                    <Label>Imóvel</Label>
                    <Select value={formData.property_id} onValueChange={v => handleChange("property_id", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o imóvel" />
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
                        <p className="text-lg font-bold text-accent mt-1">{formatPrice(selected.price)}</p>
                      </div>;
              })()}

                  <div className="space-y-2">
                    <Label>Valor do Contrato (R$)</Label>
                    <Input placeholder="Ex: 1250000" value={formData.value} onChange={e => handleChange("value", e.target.value)} />
                  </div>
                </div>
              </div>
            </>}

          {/* Step 2: Partes Envolvidas */}
          {step === 2 && <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4 text-accent" />
                  <span>Comprador / Locatário</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
                  <div className="space-y-2">
                    <Label>Vincular a Lead</Label>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo *</Label>
                      <Input placeholder="Ex: João Silva" value={formData.buyer_name} onChange={e => handleChange("buyer_name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input placeholder="Ex: 000.000.000-00" value={formData.buyer_cpf} onChange={e => handleChange("buyer_cpf", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Telefone</Label>
                      <Input placeholder="Ex: 11999998888" value={formData.buyer_phone} onChange={e => handleChange("buyer_phone", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-accent" />
                  <span>Vendedor / Locador</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input placeholder="Ex: Maria Santos" value={formData.seller_name} onChange={e => handleChange("seller_name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input placeholder="Ex: 000.000.000-00" value={formData.seller_cpf} onChange={e => handleChange("seller_cpf", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </>}

          {/* Step 3: Revisão */}
          {step === 3 && <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ClipboardList className="h-4 w-4 text-accent" />
                  <span>Revisão e Responsável</span>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Tipo de Contrato</p>
                      <p className="font-medium text-foreground">{contractTypeLabel(formData.contract_type)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prioridade</p>
                      <p className="font-medium text-foreground capitalize">{formData.priority}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Comprador</p>
                      <p className="font-medium text-foreground">{formData.buyer_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vendedor</p>
                      <p className="font-medium text-foreground">{formData.seller_name || "—"}</p>
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
                      <p className="text-xs text-muted-foreground">Imóvel</p>
                      <p className="font-medium text-foreground">
                        {formData.property_id ? properties.find(p => p.id === formData.property_id)?.title || "—" : "Nenhum vinculado"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
                  <div className="space-y-2">
                    <Label>Advogado Responsável</Label>
                    <Input placeholder="Ex: Dr. Silvio Santos" value={formData.responsible_lawyer} onChange={e => handleChange("responsible_lawyer", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea placeholder="Notas adicionais sobre o processo..." value={formData.notes} onChange={e => handleChange("notes", e.target.value)} rows={4} />
                  </div>
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
            {step < totalSteps ? <Button variant="cta" onClick={() => setStep(step + 1)} disabled={step === 1 ? !isStep1Valid : step === 2 ? !isStep2Valid : false}>
                Próximo
              </Button> : <Button variant="cta" onClick={handleSubmit} disabled={!isStep2Valid}>
                Criar Processo
              </Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}