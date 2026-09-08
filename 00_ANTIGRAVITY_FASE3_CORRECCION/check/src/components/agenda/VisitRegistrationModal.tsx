import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
interface VisitRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: VisitRegistrationData) => void;
  visitInfo: {
    clientName: string;
    property: string;
  };
}
export interface VisitRegistrationData {
  clientAttended: boolean;
  interestLevel: "low" | "medium" | "high";
  positivePoints: string;
  objections: string;
  nextStep: "followup" | "new_visit" | "proposal";
  willFormalize: boolean;
  noFormalizeReason?: string;
}
export function VisitRegistrationModal({
  open,
  onOpenChange,
  onConfirm,
  visitInfo
}: VisitRegistrationModalProps) {
  const [formData, setFormData] = useState<VisitRegistrationData>({
    clientAttended: true,
    interestLevel: "medium",
    positivePoints: "",
    objections: "",
    nextStep: "followup",
    willFormalize: false,
    noFormalizeReason: ""
  });
  const handleChange = <K extends keyof VisitRegistrationData,>(field: K, value: VisitRegistrationData[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = () => {
    onConfirm(formData);
    onOpenChange(false);
  };
  const isValid = formData.clientAttended !== undefined && (formData.willFormalize || formData.noFormalizeReason);
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-accent" />
            Registro de Visita
          </DialogTitle>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-muted-foreground">Cliente: <span className="font-medium text-foreground">{visitInfo.clientName}</span></p>
          <p className="text-sm text-muted-foreground">Imóvel: <span className="font-medium text-foreground">{visitInfo.property}</span></p>
        </div>

        <div className="space-y-5">
          {/* Cliente compareceu? */}
          <div className="space-y-2">
            <Label>Cliente compareceu? *</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="clientAttended" checked={formData.clientAttended === true} onChange={() => handleChange("clientAttended", true)} className="w-4 h-4 accent-success" />
                <span className="text-sm">Sim</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="clientAttended" checked={formData.clientAttended === false} onChange={() => handleChange("clientAttended", false)} className="w-4 h-4 accent-destructive" />
                <span className="text-sm">Não</span>
              </label>
            </div>
          </div>

          {formData.clientAttended && <>
              {/* Interesse percebido */}
              <div className="space-y-2">
                <Label>Interesse percebido *</Label>
                <div className="flex gap-4">
                  {[{
                value: "low",
                label: "Baixo",
                color: "text-destructive"
              }, {
                value: "medium",
                label: "Médio",
                color: "text-warning"
              }, {
                value: "high",
                label: "Alto",
                color: "text-success"
              }].map(option => <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="interestLevel" checked={formData.interestLevel === option.value} onChange={() => handleChange("interestLevel", option.value as "low" | "medium" | "high")} className="w-4 h-4" />
                      <span className={`text-sm ${option.color}`}>{option.label}</span>
                    </label>)}
                </div>
              </div>

              {/* Pontos positivos */}
              <div className="space-y-2">
                <Label htmlFor="positivePoints">Pontos positivos</Label>
                <Textarea id="positivePoints" placeholder="O que o cliente gostou..." value={formData.positivePoints} onChange={e => handleChange("positivePoints", e.target.value)} rows={2} />
              </div>

              {/* Objeções */}
              <div className="space-y-2">
                <Label htmlFor="objections">Objeções</Label>
                <Textarea id="objections" placeholder="Dúvidas ou objeções levantadas..." value={formData.objections} onChange={e => handleChange("objections", e.target.value)} rows={2} />
              </div>

              {/* Próximo passo */}
              <div className="space-y-2">
                <Label>Próximo passo *</Label>
                <div className="flex flex-wrap gap-3">
                  {[{
                value: "followup",
                label: "Follow-up"
              }, {
                value: "new_visit",
                label: "Nova visita"
              }, {
                value: "proposal",
                label: "Proposta"
              }].map(option => <label key={option.value} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-colors ${formData.nextStep === option.value ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50"}`}>
                      <input type="radio" name="nextStep" checked={formData.nextStep === option.value} onChange={() => handleChange("nextStep", option.value as "followup" | "new_visit" | "proposal")} className="sr-only" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>)}
                </div>
              </div>

              {/* Cliente vai formalizar proposta? */}
              <div className="space-y-2 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                <Label className="text-accent font-medium">Cliente vai formalizar proposta? *</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="willFormalize" checked={formData.willFormalize === true} onChange={() => handleChange("willFormalize", true)} className="w-4 h-4 accent-success" />
                    <span className="text-sm font-medium text-success">Sim → Criar proposta</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="willFormalize" checked={formData.willFormalize === false} onChange={() => handleChange("willFormalize", false)} className="w-4 h-4 accent-destructive" />
                    <span className="text-sm">Não</span>
                  </label>
                </div>

                {formData.willFormalize === false && <div className="mt-3">
                    <Label htmlFor="noFormalizeReason" className="text-destructive">
                      Motivo (obrigatório) *
                    </Label>
                    <Textarea id="noFormalizeReason" placeholder="Por que o cliente não vai formalizar proposta?" value={formData.noFormalizeReason} onChange={e => handleChange("noFormalizeReason", e.target.value)} rows={2} className="mt-1" />
                  </div>}
              </div>
            </>}

          {!formData.clientAttended && <div className="space-y-2">
              <Label htmlFor="noFormalizeReason" className="text-destructive">
                Motivo da ausência *
              </Label>
              <Textarea id="noFormalizeReason" placeholder="Por que o cliente não compareceu?" value={formData.noFormalizeReason} onChange={e => handleChange("noFormalizeReason", e.target.value)} rows={2} />
            </div>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="cta" onClick={handleSubmit} disabled={!isValid}>
            Registrar Visita
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}