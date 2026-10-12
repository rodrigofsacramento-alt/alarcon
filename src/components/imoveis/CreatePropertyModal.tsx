import { useState } from "react";
import { Building2, MapPin, DollarSign, FileText, Plus, ImageIcon } from "lucide-react";
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
import { ImageUploader } from "@/components/imoveis/ImageUploader";
import { useLoteamentos, useLoteadores } from "@/hooks/use-loteadores";

export interface PropertyFormData {
  title: string;
  code: string;
  type: string;
  status: string;
  price: string;
  price_type: string;
  currency: string;
  amount: string;
  address: string;
  location: string;
  maps_link: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  area: string;
  rooms: string;
  owner_name: string;
  owner_phone: string;
  image_url: string;
  images: string[];
  loteamento_id: string;
  loteador_id: string;
  // Bloco parcelado (modelo financeiro Terrenos & Lotes)
  valor_a_vista: string;
  valor_total_parcelado: string;
  valor_entrada_financiamento: string;
  saldo_financiado: string;
  valor_parcela_mensal: string;
  numero_parcelas: string;
  admin_parcelado: boolean;
  admin_entrada_total: string;
  admin_num_parcelas: string;
  admin_valor_parcela: string;
  _warnTotal?: string;
  _warnEntrada?: string;
}

interface CreatePropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: PropertyFormData) => void;
}

const initialFormData: PropertyFormData = {
  title: "",
  code: "",
  type: "residential",
  status: "available",
  price: "",
  price_type: "FINAL",
  currency: "USD",
  amount: "",
  address: "",
  location: "",
  maps_link: "",
  description: "",
  bedrooms: "",
  bathrooms: "",
  parking: "",
  area: "",
  rooms: "",
  owner_name: "",
  owner_phone: "",
  image_url: "",
  images: [],
  loteamento_id: "",
  loteador_id: "",
  valor_a_vista: "",
  valor_total_parcelado: "",
  valor_entrada_financiamento: "",
  saldo_financiado: "",
  valor_parcela_mensal: "",
  numero_parcelas: "",
  admin_parcelado: false,
  admin_entrada_total: "",
  admin_num_parcelas: "",
  admin_valor_parcela: "",
};

export function CreatePropertyModal({ open, onOpenChange, onConfirm }: CreatePropertyModalProps) {
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const { data: loteamentos = [] } = useLoteamentos();
  const { data: loteadores = [] } = useLoteadores();
  const isTerrenoOuLote = formData.type === "land" || formData.type === "lote";

  const handleChange = (field: keyof PropertyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Mantiene `amount` (número puro) sincronizado con `price` (con máscara)
  const handlePriceChange = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, "");
    setFormData((prev) => ({ ...prev, price: digits, amount: digits }));
  };

  // Máscara de formato: agrupa miles con punto según la moneda
  const formatThousands = (digits: string): string => {
    const d = digits.replace(/[^\d]/g, "");
    if (!d) return "";
    return d.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // ===== MOTOR DE CÁLCULO AUTOMÁTICO (portado do QUBITS/AHUT Properties.tsx, commit ddd8c4a) =====
  // À VISTA: um único valor. PARCELADO: Total = Entrada + (Nº Parcelas × Valor da Parcela).
  // Qualquer combinação de 2 dos 4 valores preenche os demais automaticamente.
  const num = (v: string | boolean | undefined) => {
    if (typeof v === "boolean") return v ? 1 : 0;
    return Number(String(v ?? "").replace(/[^\d]/g, "")) || 0;
  };

  const handleChangeCalc = (field: keyof PropertyFormData, value: string | boolean) => {
    setFormData((prev) => {
      const updated: any = { ...prev, [field]: value };

      // ===== BLOCO FINANCEIRO (apenas quando Modalidade = PARCELADO) =====
      if (updated.price_type === "PARCELADO") {
        const nP = num(field === "numero_parcelas" ? value : updated.numero_parcelas);
        const ent = num(field === "valor_entrada_financiamento" ? value : updated.valor_entrada_financiamento);
        const vp = num(field === "valor_parcela_mensal" ? value : updated.valor_parcela_mensal);
        const tot = num(field === "valor_total_parcelado" ? value : updated.valor_total_parcelado);
        const avista = num(field === "valor_a_vista" ? value : updated.valor_a_vista);

        // Regra: Total Parcelado ≥ Valor À Vista
        if (avista > 0 && tot > 0 && tot < avista) {
          updated._warnTotal = `⚠️ Total Parcelado (${tot.toLocaleString("pt-BR")}) não pode ser menor que o Valor à Vista (${avista.toLocaleString("pt-BR")}) na mesma moeda.`;
        } else {
          delete updated._warnTotal;
        }

        if (field === "valor_total_parcelado" && tot > 0) {
          const saldo = Math.max(0, tot - ent);
          updated.saldo_financiado = saldo > 0 ? String(saldo) : "";
          if (nP > 0 && saldo > 0) updated.valor_parcela_mensal = String(Math.round(saldo / nP));
        } else if (field === "valor_entrada_financiamento" && ent > 0) {
          const saldo = Math.max(0, (tot || avista) - ent);
          updated.saldo_financiado = saldo > 0 ? String(saldo) : "";
          if (nP > 0 && saldo > 0) updated.valor_parcela_mensal = String(Math.round(saldo / nP));
          if (!tot && avista > 0) updated.valor_total_parcelado = String(avista);
        } else if (field === "numero_parcelas" && nP > 0) {
          const saldo = Math.max(0, (tot || avista) - ent);
          updated.saldo_financiado = saldo > 0 ? String(saldo) : "";
          if (saldo > 0) updated.valor_parcela_mensal = String(Math.round(saldo / nP));
          if (!tot && avista > 0) updated.valor_total_parcelado = String(avista);
        } else if (field === "valor_parcela_mensal" && vp > 0) {
          if (nP > 0) {
            updated.valor_total_parcelado = String(ent + vp * nP);
            updated.saldo_financiado = String(vp * nP);
          }
        } else if (field === "valor_a_vista" && avista > 0) {
          if (!tot && nP > 0) {
            const saldo = Math.max(0, avista - ent);
            updated.valor_total_parcelado = String(avista);
            updated.saldo_financiado = saldo > 0 ? String(saldo) : "";
            if (saldo > 0) updated.valor_parcela_mensal = String(Math.round(saldo / nP));
          }
        }

        // Validação: À Vista não pode ser menor que a Entrada
        const entFinal = num(updated.valor_entrada_financiamento);
        const avFinal = num(updated.valor_a_vista);
        if (avFinal > 0 && entFinal > avFinal) {
          updated._warnEntrada = `⚠️ Entrada (${entFinal.toLocaleString("pt-BR")}) não pode ser maior que o Valor à Vista (${avFinal.toLocaleString("pt-BR")}).`;
        } else {
          delete updated._warnEntrada;
        }
      }

      // ===== PARCELAMENTO DO CUSTO ADMIN (campo 8) =====
      const adminTot = num(field === "admin_entrada_total" ? value : updated.admin_entrada_total);
      const adminN = num(field === "admin_num_parcelas" ? value : updated.admin_num_parcelas);
      const adminVp = num(field === "admin_valor_parcela" ? value : updated.admin_valor_parcela);

      if (updated.admin_parcelado && adminTot > 0) {
        if (field === "admin_num_parcelas" && adminN > 0) {
          updated.admin_valor_parcela = String(Math.round(adminTot / adminN));
        } else if (field === "admin_valor_parcela" && adminVp > 0) {
          updated.admin_num_parcelas = String(Math.max(1, Math.ceil(adminTot / adminVp)));
        } else if (field === "admin_entrada_total" && adminN > 0 && adminVp === 0) {
          updated.admin_valor_parcela = String(Math.round(adminTot / adminN));
        }
      }

      return updated as PropertyFormData;
    });
  };

  const handleSubmit = () => {
    onConfirm(formData);
    setFormData(initialFormData);
    onOpenChange(false);
  };

  const isValid = formData.title.trim() && formData.amount.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Cadastrar Imóvel</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">Preencha os dados do novo imóvel</p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Section: Dados Básicos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Building2 className="h-4 w-4 text-accent" />
              <span>Dados Básicos</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Imóvel *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Apartamento Jardins Luxo"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    placeholder="Ex: AP8736"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residencial</SelectItem>
                      <SelectItem value="commercial">Comercial</SelectItem>
                      <SelectItem value="land">Terreno</SelectItem>
                      <SelectItem value="lote">Lote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponível</SelectItem>
                      <SelectItem value="reserved">Reservado</SelectItem>
                      <SelectItem value="sold">Vendido</SelectItem>
                      <SelectItem value="rented">Alugado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Vínculo Loteamento/Loteador (só terreno e lote) */}
          {isTerrenoOuLote && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin className="h-4 w-4 text-accent" />
                <span>Vínculo Loteamento / Loteador</span>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loteamento</Label>
                  <Select value={formData.loteamento_id || "none"} onValueChange={(v) => handleChange("loteamento_id", v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {loteamentos.map((lt) => (
                        <SelectItem key={lt.id} value={lt.id}>{lt.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Loteador / Proprietário</Label>
                  <Select value={formData.loteador_id || "none"} onValueChange={(v) => handleChange("loteador_id", v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {loteadores.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Section: Preço e Localização */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <DollarSign className="h-4 w-4 text-accent" />
              <span>Preço e Localização</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              {/* Etapa 1 — Seletor de Moeda (single-select) */}
              <div className="space-y-2">
                <Label>Moeda *</Label>
                <Select value={formData.currency} onValueChange={(v) => handleChange("currency", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD — Dólar</SelectItem>
                    <SelectItem value="GS">GS — Guarani</SelectItem>
                    <SelectItem value="BRL">BRL — Real</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Etapa 2 — Seletor de Modalidade de Preço */}
              <div className="space-y-2">
                <Label htmlFor="price_type">Modalidade de Preço *</Label>
                <Select value={formData.price_type} onValueChange={(v) => handleChangeCalc("price_type", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVISTA">À Vista</SelectItem>
                    <SelectItem value="PARCELADO">Parcelado</SelectItem>
                    <SelectItem value="FINAL">Valor Final</SelectItem>
                    <SelectItem value="MONTHLY">A partir de (mensual)</SelectItem>
                    <SelectItem value="DOWN_PAYMENT">Entrada de</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Etapa 3 — Input Numérico con máscara automática */}
              <div className="space-y-2">
                <Label htmlFor="price">Valor *</Label>
                <Input
                  id="price"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatThousands(formData.price)}
                  onChange={(e) => handlePriceChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.price_type === "FINAL"
                    ? `Valor Final ${formatThousands(formData.amount)} ${formData.currency}`
                    : formData.price_type === "MONTHLY"
                      ? `A partir de ${formatThousands(formData.amount)} ${formData.currency} mensais`
                      : `Entrada de ${formatThousands(formData.amount)} ${formData.currency}`}
                </p>
              </div>

              {formData.price_type === "PARCELADO" && (
                <div className="space-y-4 border border-accent/30 rounded-xl p-4 bg-accent/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-accent flex items-center gap-2">
                      Cálculo do Valor Parcelado
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Total = Entrada + (Nº Parcelas × Valor da Parcela)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor à Vista *</Label>
                      <Input
                        inputMode="numeric"
                        placeholder="0"
                        value={formatThousands(formData.valor_a_vista)}
                        onChange={(e) => handleChangeCalc("valor_a_vista", e.target.value.replace(/[^\d]/g, ""))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor Total Parcelado *</Label>
                      <Input
                        inputMode="numeric"
                        placeholder="0"
                        value={formatThousands(formData.valor_total_parcelado)}
                        onChange={(e) => handleChangeCalc("valor_total_parcelado", e.target.value.replace(/[^\d]/g, ""))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor de Entrada *</Label>
                      <Input
                        inputMode="numeric"
                        placeholder="0"
                        value={formatThousands(formData.valor_entrada_financiamento)}
                        onChange={(e) => handleChangeCalc("valor_entrada_financiamento", e.target.value.replace(/[^\d]/g, ""))}
                      />
                      {formData.saldo_financiado && (
                        <p className="text-xs text-muted-foreground">
                          Saldo a Financiar: <strong>{formatThousands(formData.saldo_financiado)} {formData.currency}</strong>
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Nº de Parcelas *</Label>
                      <Input
                        inputMode="numeric"
                        placeholder="Ex: 50"
                        value={formData.numero_parcelas}
                        onChange={(e) => handleChangeCalc("numero_parcelas", e.target.value.replace(/[^\d]/g, ""))}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-accent">Valor da Parcela Mensal (cálculo automático) *</Label>
                      <Input
                        inputMode="numeric"
                        placeholder="Calculado automaticamente..."
                        className="font-bold border-accent/50"
                        value={formatThousands(formData.valor_parcela_mensal)}
                        onChange={(e) => handleChangeCalc("valor_parcela_mensal", e.target.value.replace(/[^\d]/g, ""))}
                      />
                      {formData.valor_parcela_mensal && formData.numero_parcelas && (
                        <p className="text-xs text-muted-foreground">
                          Cliente pagará <strong>{formatThousands(formData.valor_parcela_mensal)} {formData.currency}</strong> por parcela em {formData.numero_parcelas} parcelas após a entrada.
                        </p>
                      )}
                      {!formData.valor_parcela_mensal && (
                        <p className="text-xs text-amber-600">
                          Preencha Total, Entrada e Nº de Parcelas — ou informe 2 deles + a parcela — para o cálculo automático funcionar.
                        </p>
                      )}
                    </div>
                  </div>

                  {formData._warnTotal && (
                    <p className="text-xs text-destructive font-medium">{formData._warnTotal}</p>
                  )}
                  {formData._warnEntrada && (
                    <p className="text-xs text-destructive font-medium">{formData._warnEntrada}</p>
                  )}

                  {/* Custo administrativo parcelável */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={formData.admin_parcelado}
                        onChange={(e) => handleChangeCalc("admin_parcelado", e.target.checked)}
                      />
                      <span className="text-sm font-medium">Parcelar custo administrativo</span>
                    </label>
                    {formData.admin_parcelado && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Total do Custo Admin</Label>
                          <Input
                            inputMode="numeric"
                            placeholder="0"
                            value={formatThousands(formData.admin_entrada_total)}
                            onChange={(e) => handleChangeCalc("admin_entrada_total", e.target.value.replace(/[^\d]/g, ""))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Nº de Parcelas</Label>
                          <Input
                            inputMode="numeric"
                            placeholder="Ex: 12"
                            value={formData.admin_num_parcelas}
                            onChange={(e) => handleChangeCalc("admin_num_parcelas", e.target.value.replace(/[^\d]/g, ""))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Valor por Parcela</Label>
                          <Input
                            inputMode="numeric"
                            placeholder="Auto"
                            value={formatThousands(formData.admin_valor_parcela)}
                            onChange={(e) => handleChangeCalc("admin_valor_parcela", e.target.value.replace(/[^\d]/g, ""))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    placeholder="Ex: Rua Oscar Freire, 1200 - Jardins, São Paulo"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Bairro / Região</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Jardins - São Paulo"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="maps_link">Link Google Maps (ubicación del imóvil)</Label>
                  <Input
                    id="maps_link"
                    placeholder="Ex: https://maps.app.goo.gl/xxxxxxxx"
                    value={formData.maps_link}
                    onChange={(e) => handleChange("maps_link", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Características */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="h-4 w-4 text-accent" />
              <span>Características</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="0"
                    value={formData.bedrooms}
                    onChange={(e) => handleChange("bedrooms", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Banheiros</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="0"
                    value={formData.bathrooms}
                    onChange={(e) => handleChange("bathrooms", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rooms">Salas</Label>
                  <Input
                    id="rooms"
                    type="number"
                    placeholder="0"
                    value={formData.rooms}
                    onChange={(e) => handleChange("rooms", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parking">Vagas</Label>
                  <Input
                    id="parking"
                    type="number"
                    placeholder="0"
                    value={formData.parking}
                    onChange={(e) => handleChange("parking", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    placeholder="0"
                    value={formData.area}
                    onChange={(e) => handleChange("area", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Imagens */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ImageIcon className="h-4 w-4 text-accent" />
              <span>Imagens</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <ImageUploader
                images={formData.images}
                onImagesChange={(imgs) => {
                  setFormData((prev) => ({
                    ...prev,
                    images: imgs,
                    image_url: imgs[0] || prev.image_url,
                  }));
                }}
              />
            </div>
          </div>

          {/* Section: Proprietário */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-accent" />
              <span>Proprietário e Descrição</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Nome do Proprietário</Label>
                  <Input
                    id="owner_name"
                    placeholder="Ex: João Silva"
                    value={formData.owner_name}
                    onChange={(e) => handleChange("owner_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner_phone">Telefone do Proprietário</Label>
                  <Input
                    id="owner_phone"
                    placeholder="Ex: 11999998888"
                    value={formData.owner_phone}
                    onChange={(e) => handleChange("owner_phone", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o imóvel..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
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
            Confirmar Cadastro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
