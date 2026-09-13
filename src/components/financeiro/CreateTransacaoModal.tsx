import { useState, useEffect } from "react";
import { DollarSign, FileText, Calendar, Tag } from "lucide-react";
import { useFinancialCategories } from "@/hooks/use-financial";
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

export interface TransacaoFormData {
  description: string;
  type: "income" | "expense";
  categoryId: string;
  value: string;
  date: string;
  status: string;
  notes: string;
}

interface CreateTransacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: TransacaoFormData) => void;
}

const initialFormData: TransacaoFormData = {
  description: "",
  type: "income",
  categoryId: "",
  value: "",
  date: new Date().toISOString().split("T")[0],
  status: "completed",
  notes: "",
};

export function CreateTransacaoModal({ open, onOpenChange, onConfirm }: CreateTransacaoModalProps) {
  const [formData, setFormData] = useState<TransacaoFormData>(initialFormData);
  const { data: categories, isLoading: loadingCategories } = useFinancialCategories();

  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
    }
  }, [open]);

  const handleChange = (field: keyof TransacaoFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onConfirm(formData);
    onOpenChange(false);
  };

  const isValid = formData.description.trim() && formData.value.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Nova Transação</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">Registre uma entrada ou saída financeira</p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Tipo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Tag className="h-4 w-4 text-accent" />
              <span>Tipo de Transação</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <div className="flex gap-3">
                <label
                  className={`flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    formData.type === "income"
                      ? "border-success bg-success/10 text-success"
                      : "border-border hover:border-success/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    checked={formData.type === "income"}
                    onChange={() => handleChange("type", "income")}
                    className="sr-only"
                  />
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">Entrada</span>
                </label>
                <label
                  className={`flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    formData.type === "expense"
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border hover:border-destructive/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    checked={formData.type === "expense"}
                    onChange={() => handleChange("type", "expense")}
                    className="sr-only"
                  />
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">Saída</span>
                </label>
              </div>
            </div>
          </div>

          {/* Dados */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-accent" />
              <span>Dados da Transação</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input
                  placeholder="Ex: Venda Apto. Jardins"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$) *</Label>
                  <Input
                    placeholder="Ex: 18500"
                    value={formData.value}
                    onChange={(e) => handleChange("value", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formData.categoryId} onValueChange={(v) => handleChange("categoryId", v)}>
                    <SelectTrigger>
                      {loadingCategories ? (
                        <span className="text-muted-foreground">Cargando categorías...</span>
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategories ? (
                        <SelectItem value="" disabled>
                          Cargando...
                        </SelectItem>
                      ) : (
                        (categories || [])
                          .filter((cat) =>
                            (cat.category === "Entrada") === (formData.type === "income")
                          )
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Data e Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4 text-accent" />
              <span>Data e Status</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Notas adicionais..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                />
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
            Registrar Transação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
