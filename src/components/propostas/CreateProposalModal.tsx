import { useMemo, useState, useEffect } from "react";
import {
  FileText,
  User,
  Building2,
  Landmark,
  BadgeDollarSign,
  ClipboardList,
  AlarmClock,
  StickyNote,
  Calculator,
} from "lucide-react";
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
import { AsyncCombobox } from "@/components/ui/AsyncCombobox";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCreateCommercialProposal,
  type ProposalCurrency,
} from "@/hooks/use-commercial-proposals";
import { toast } from "@/hooks/use-toast";

/** Shape legacy — mantido para compatibilidade com Propostas.tsx (tabela `proposals`). */
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

interface CommercialFormValues {
  client_id: string;
  client_name: string;
  seller_id: string;
  seller_name: string;
  property_id: string;
  loteamento: string;
  manzana: string;
  lote: string;
  // Valores como string p/ edição livre; parseados com toNum no cálculo/salvamento.
  valor_total: string;
  valor_entrada_percentual: string;
  numero_parcelas: string;
  currency: ProposalCurrency;
  exchange_rate_manual: string;
  prazo_emissao_contrato_dias: string;
  validade_proposta_dias: string;
  observacoes: string;
}

const initialForm = (sellerId: string): CommercialFormValues => ({
  client_id: "",
  client_name: "",
  seller_id: sellerId,
  seller_name: "",
  property_id: "",
  loteamento: "",
  manzana: "",
  lote: "",
  valor_total: "",
  valor_entrada_percentual: "0",
  numero_parcelas: "1",
  currency: "Gs",
  exchange_rate_manual: "",
  prazo_emissao_contrato_dias: "120",
  validade_proposta_dias: "5",
  observacoes: "",
});

const toNum = (s: string): number => {
  if (s === "" || s == null) return 0;
  const n = parseFloat(String(s));
  return Number.isFinite(n) ? n : 0;
};

export function CreateProposalModal({ open, onOpenChange, onConfirm }: CreateProposalModalProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CommercialFormValues>(() => initialForm(profile?.id || ""));
  const createCommercial = useCreateCommercialProposal();

  // Reset ao fechar
  useEffect(() => {
    if (open) {
      setForm(initialForm(profile?.id || ""));
      setStep(1);
    }
  }, [open, profile?.id]);

  const set = <K extends keyof CommercialFormValues>(key: K, value: CommercialFormValues[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  // CÁLCULO AUTOMÁTICO (data-binding reativo) — derivado de valor_total/percentual/parcelas
  const calc = useMemo(() => {
    const total = toNum(form.valor_total);
    const parcelas = Math.max(1, Math.round(toNum(form.numero_parcelas)) || 1);
    const valorParcela = total / parcelas;
    const valorEntrada = total * (toNum(form.valor_entrada_percentual) / 100);
    return {
      total,
      parcelas,
      valorParcela,
      valorEntrada,
      valorTotalInicial: valorEntrada + valorParcela,
    };
  }, [form.valor_total, form.numero_parcelas, form.valor_entrada_percentual]);

  const formatMoney = (value: number, currency?: ProposalCurrency) => {
    const cur: ProposalCurrency = currency || form.currency;
    const v = Number.isFinite(value) ? value : 0;
    if (cur === "Gs") return `Gs ${Math.round(v).toLocaleString("pt-BR")}`;
    if (cur === "USD")
      return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
  };

  const isStep1Valid = !!form.client_id;
  const isStep2Valid = calc.total > 0;

  const previewItems: { icon: React.ReactNode; label: string; value: string }[] = [
    { icon: <User className="h-4 w-4 text-accent" />, label: "Cliente", value: form.client_name || "—" },
    { icon: <Building2 className="h-4 w-4 text-accent" />, label: "Vendedor / Corretor", value: form.seller_name || "—" },
    {
      icon: <Landmark className="h-4 w-4 text-accent" />,
      label: "Imóvel",
      value: form.property_id
        ? `${form.loteamento || ""} ${form.manzana ? "· Mç. " + form.manzana : ""} ${form.lote ? "· Lt. " + form.lote : ""}`.trim() || "Vinculado"
        : "Nenhum vínculo",
    },
    {
      icon: <BadgeDollarSign className="h-4 w-4 text-accent" />,
      label: "Valor Total",
      value: formatMoney(calc.total),
    },
    { icon: <Calculator className="h-4 w-4 text-accent" />, label: "Valor da Parcela", value: formatMoney(calc.valorParcela) },
    { icon: <BadgeDollarSign className="h-4 w-4 text-accent" />, label: "Valor de Entrada", value: formatMoney(calc.valorEntrada) },
    { icon: <Calculator className="h-4 w-4 text-accent" />, label: "Total Inicial", value: formatMoney(calc.valorTotalInicial) },
    { icon: <StickyNote className="h-4 w-4 text-accent" />, label: "Prazo do Contrato", value: `${form.prazo_emissao_contrato_dias || "0"} dias` },
    { icon: <AlarmClock className="h-4 w-4 text-accent" />, label: "Validade da Proposta", value: `${form.validade_proposta_dias || "0"} dias` },
  ];

  const handleSubmit = () => {
    if (createCommercial.isPending) return;
    const payload = {
      client_id: form.client_id || null,
      agent_id: form.seller_id || null,
      property_id: form.property_id || null,
      client_name: form.client_name || null,
      loteamento: form.loteamento?.trim() || null,
      manzana: form.manzana?.trim() || null,
      lote: form.lote?.trim() || null,
      valor_total: calc.total,
      valor_entrada_percentual: toNum(form.valor_entrada_percentual),
      valor_entrada_calculado: calc.valorEntrada,
      numero_parcelas: calc.parcelas,
      valor_parcela: calc.valorParcela,
      valor_total_inicial: calc.valorTotalInicial,
      currency: form.currency,
      exchange_rate_manual: form.exchange_rate_manual === "" ? null : toNum(form.exchange_rate_manual),
      prazo_emissao_contrato_dias: Math.round(toNum(form.prazo_emissao_contrato_dias)) || 120,
      validade_proposta_dias: Math.round(toNum(form.validade_proposta_dias)) || 5,
      observacoes: form.observacoes?.trim() || null,
      status: "Rascunho",
    };

    createCommercial.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Proposta Comercial Criada",
          description: `Proposta de ${formatMoney(calc.total)} (${form.currency}) registrada.`,
        });
        // Compatibilidade com o fluxo legacy (tabela `proposals`)
        onConfirm({
          client_name: form.client_name,
          lead_id: form.client_id,
          property_id: form.property_id,
          value: String(calc.total),
          payment_type: "Financiamento",
          status: "Docs Enviados",
          notes: form.observacoes,
        });
        onOpenChange(false);
      },
      onError: (err) => {
        toast({
          title: "Erro ao criar proposta",
          description: (err as any)?.message || "Tente novamente.",
          variant: "destructive",
        });
      },
    });
  };

  const glassCard = "rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 !bg-[#0a0a0a]/95 !border-white/10 backdrop-blur-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-black/30 px-6 py-5 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Nova Proposta Comercial</span>
                <p className="mt-0.5 text-sm font-normal text-white/50">
                  Etapa {step} de 3
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-accent" : "bg-white/10"}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6 px-6 py-5 text-white">
          {/* ============ BLOCO 1 — Imóvel e Envolvidos ============ */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-accent" />
                <span>Imóvel e Envolvidos</span>
              </div>

              <div className={`${glassCard} space-y-4 p-4`}>
                <div className="space-y-1.5">
                  <Label className="text-white/70">Cliente *</Label>
                  <AsyncCombobox
                    table="leads"
                    searchFields={["name", "phone"]}
                    selectFields="id,name,phone"
                    labelField="name"
                    subtitleField="phone"
                    placeholder="Buscar cliente por nome ou telefone..."
                    value={form.client_id}
                    icon={<User className="h-4 w-4 text-accent" />}
                    onChange={(item) => {
                      if (!item) {
                        set("client_id", "");
                        set("client_name", "");
                      } else {
                        set("client_id", item.id);
                        set("client_name", item.name || "");
                      }
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70">Vendedor / Corretor</Label>
                  <AsyncCombobox
                    table="profiles"
                    searchFields={["full_name"]}
                    selectFields="id,full_name"
                    labelField="full_name"
                    subtitleField="phone"
                    placeholder="Selecionar corretor..."
                    value={form.seller_id}
                    icon={<Building2 className="h-4 w-4 text-accent" />}
                    onChange={(item) => {
                      set("seller_id", item ? item.id : "");
                      set("seller_name", item ? item.full_name || "" : "");
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70">Imóvel / Lote</Label>
                  <AsyncCombobox
                    table="properties"
                    searchFields={["title", "code", "loteamento"]}
                    selectFields="id,title,code,loteamento,quadra,lote,price"
                    labelField="title"
                    subtitleField="loteamento"
                    placeholder="Buscar lote, código, loteamento..."
                    value={form.property_id}
                    icon={<Landmark className="h-4 w-4 text-accent" />}
                    onChange={(item) => {
                      if (!item) {
                        set("property_id", "");
                        return;
                      }
                      const p = item as any;
                      setForm((prev) => ({
                        ...prev,
                        property_id: p.id ?? "",
                        loteamento: p.loteamento ? String(p.loteamento) : p.loteamento || prev.loteamento,
                        manzana: p.quadra ? String(p.quadra) : p.manzana ? String(p.manzana) : prev.manzana,
                        lote: p.lote ? String(p.lote) : prev.lote || prev.lote,
                        valor_total: typeof p.price === "number" && p.price > 0 ? String(p.price) : prev.valor_total,
                        currency: p.currency || prev.currency,
                      }));
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-white/70">Loteamento</Label>
                    <Input
                      className="!border-white/10 !bg-white/5 text-white placeholder:text-white/40"
                      placeholder="Ex: Vale Verde"
                      value={form.loteamento}
                      onChange={(e) => set("loteamento", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/70">Manzana</Label>
                    <Input
                      className="!border-white/10 !bg-white/5 text-white placeholder:text-white/40"
                      placeholder="Ex: Mç 12"
                      value={form.manzana}
                      onChange={(e) => set("manzana", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/70">Lote</Label>
                    <Input
                      className="!border-white/10 !bg-white/5 text-white placeholder:text-white/40"
                      placeholder="Ex: Lt 45"
                      value={form.lote}
                      onChange={(e) => set("lote", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ BLOCO 2 — Estrutura de Pagamento ============ */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BadgeDollarSign className="h-4 w-4 text-accent" />
                <span>Estrutura de Pagamento</span>
              </div>

              <div className={`${glassCard} space-y-4 p-4`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-white/70">Valor Total</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    className="!border-white/10 !bg-white/5 text-white placeholder:text-white/40"
                    placeholder="0"
                    value={form.valor_total}
                    onChange={(e) => set("valor_total", e.target.value)}
                  />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-white/70">Entrada (%)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      className="!border-white/10 !bg-white/5 text-white placeholder:text-white/40"
                      value={form.valor_entrada_percentual}
                      onChange={(e) => set("valor_entrada_percentual", e.target.value)}
                    />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/70">Nº de Parcelas</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      className="!border-white/10 !bg-white/5 text-white placeholder:text-white/40"
                      value={form.numero_parcelas}
                      onChange={(e) => set("numero_parcelas", e.target.value)}
                    />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-white/70">Moeda</Label>
                    <Select
                      value={form.currency}
                      onValueChange={(v) => set("currency", v as ProposalCurrency)}
                    >
                      <SelectTrigger className="!border-white/10 !bg-white/5 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="!bg-[#0a0a0a]/95 !border-white/10 text-white backdrop-blur-3xl">
                        <SelectItem value="Gs" className="text-white focus:!bg-white/10">Gs — Guaraní (PY)</SelectItem>
                        <SelectItem value="BRL" className="text-white focus:!bg-white/10">R$ — Real (BR)</SelectItem>
                        <SelectItem value="USD" className="text-white focus:!bg-white/10">US$ — Dólar (US)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <Label className="text-white/70">Cotação do dia (manual)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      className="!border-white/10 !bg-white/5 text-white placeholder:text-white/40"
                      placeholder="Opcional"
                      value={form.exchange_rate_manual}
                      onChange={(e) => set("exchange_rate_manual", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Resultados calculados automaticamente */}
              <div className={`${glassCard} space-y-3 p-4`}>
                <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                  Cálculo Automático
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-white/10 bg-accent/10 p-3">
                    <p className="text-xs text-white/50">Valor da Parcela</p>
                    <p className="mt-1 text-lg font-bold text-white">{formatMoney(calc.valorParcela)}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-accent/10 p-3">
                    <p className="text-xs text-white/50">Valor de Entrada</p>
                    <p className="mt-1 text-lg font-bold text-white">{formatMoney(calc.valorEntrada)}</p>
                  </div>
                  <div className="rounded-lg border border-accent/30 bg-accent/10 p-3">
                    <p className="text-xs text-white/50">Total Inicial</p>
                    <p className="mt-1 text-lg font-bold text-accent">{formatMoney(calc.valorTotalInicial)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ BLOCO 3 — Condições Legais e Observações + Preview ============ */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ClipboardList className="h-4 w-4 text-accent" />
                <span>Condições Legais e Observações</span>
              </div>

              <div className={`${glassCard} space-y-4 p-4`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-white/70">Prazo Emissão Contrato (dias)</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      className="!border-white/10 !bg-white/5 text-white placeholder:text-white/40"
                      value={form.prazo_emissao_contrato_dias}
                      onChange={(e) => set("prazo_emissao_contrato_dias", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/70">Validade da Proposta (dias)</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      className="!border-white/10 !bg-white/5 text-white placeholder:text-white/40"
                      value={form.validade_proposta_dias}
                      onChange={(e) => set("validade_proposta_dias", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70">Observações</Label>
                  <Textarea
                    rows={4}
                    className="!border-white/10 !bg-white/5 text-white placeholder:text-white/40"
                    placeholder="Notas adicionais sobre a proposta..."
                    value={form.observacoes}
                    onChange={(e) => set("observacoes", e.target.value)}
                  />
                </div>
              </div>

              {/* Pré-visualização do payload (exatamente como o cliente verá) */}
              <div className={`${glassCard} space-y-3 p-4`}>
                <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                  Pré-visualização da Proposta
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                  {previewItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5">
                      {item.icon}
                      <div className="min-w-0">
                        <p className="text-xs text-white/45">{item.label}</p>
                        <p className="truncate text-sm font-medium text-white">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-white/10 bg-black/30 px-6 py-4 backdrop-blur-xl">
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
            {step < 3 ? (
              <Button
                variant="cta"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              >
                Próximo
              </Button>
            ) : (
              <Button variant="cta" onClick={handleSubmit} disabled={createCommercial.isPending}>
                {createCommercial.isPending ? "Criando..." : "Criar Proposta"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}