import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AsyncCombobox } from "@/components/ui/AsyncCombobox";
import { X, ExternalLink, Loader2, Save, User, Building2, UserCircle2 } from "lucide-react";
import type { Proposal } from "@/hooks/use-proposals";

export const PAYMENT_TYPES = [
  "Financiamento",
  "À Vista",
  "Parcelado Direto",
  "FGTS + Financiamento",
  "Permuta",
  "Consórcio",
];

export const STATUS_OPTIONS = [
  "Docs Enviados",
  "Proposta Comprador",
  "Finalizada Comprador",
  "Proposta Vendedor",
  "Finalizada",
  "Cancelada",
];

const formatValue = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

interface ProposalDetailModalProps {
  proposal: Proposal;
  onClose: () => void;
  onSave: (id: string, data: Record<string, unknown>) => Promise<void> | void;
  isSaving?: boolean;
}

export function ProposalDetailModal({ proposal, onClose, onSave, isSaving }: ProposalDetailModalProps) {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState(proposal.client_name || "");
  const [value, setValue] = useState(proposal.value != null ? String(proposal.value) : "");
  const [paymentType, setPaymentType] = useState(proposal.payment_type || "");
  const [status, setStatus] = useState(proposal.status || "Docs Enviados");
  const [propertyId, setPropertyId] = useState<string | null>(proposal.property_id || null);
  const [agentId, setAgentId] = useState<string | null>(proposal.agent_id || null);
  const [notes, setNotes] = useState(proposal.notes || "");

  // Deeplinks para entidades vinculadas
  const goLead = () => {
    if (proposal.lead_id) {
      navigate("/leads", { state: { selectedLeadId: proposal.lead_id } });
    } else if (proposal.client_name) {
      navigate("/leads", { state: {} });
    }
    onClose();
  };
  const goProperty = () => {
    if (proposal.property_id) {
      navigate(`/imoveis?property=${proposal.property_id}`);
    } else {
      navigate(`/imoveis`);
    }
    onClose();
  };
  const goAgent = () => {
    navigate("/dashboard-performance");
    onClose();
  };

  const handleSave = () => {
    const data: Record<string, unknown> = {
      client_name: clientName,
      value: value ? parseFloat(value) : null,
      payment_type: paymentType || null,
      status,
      property_id: propertyId,
      agent_id: agentId,
      notes: notes || null,
    };
    onSave(proposal.id, data);
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-[440px] max-w-full bg-card border-l border-border shadow-lg overflow-y-auto z-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{proposal.proposal_number}</h3>
          <p className="text-xs text-muted-foreground">{formatValue(proposal.value)}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-5">
        {/* Cliente — editável + deeplink p/ lead */}
        <div>
          <Label className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" /> CLIENTE
          </Label>
          <div className="flex items-center gap-2">
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome do cliente" />
            {proposal.lead_id && (
              <Button variant="outline" size="icon" title="Abrir lead" onClick={goLead}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
          {proposal.lead_id && (
            <button onClick={goLead} className="mt-1 text-xs text-accent hover:underline flex items-center gap-1">
              Ver lead vinculado <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Imóvel — editável + deeplink p/ imóvel */}
        <div>
          <Label className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" /> IMÓVEL
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <AsyncCombobox
                placeholder="Buscar lote, código, loteamento..."
                table="properties"
                searchFields={["title", "code", "loteamento"]}
                selectFields="id,title,code,loteamento,quadra,lote,price"
                labelField="title"
                subtitleField="loteamento"
                value={propertyId || undefined}
                onChange={(item) => setPropertyId(item?.id ?? null)}
              />
            </div>
            {proposal.property_id && (
              <Button variant="outline" size="icon" title="Abrir imóvel" onClick={goProperty}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
          {proposal.property?.title && (
            <button onClick={goProperty} className="mt-1 text-xs text-accent hover:underline flex items-center gap-1">
              {proposal.property.title} <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Valor proposto */}
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">VALOR PROPOSTO</Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0,00"
          />
        </div>

        {/* Pagamento */}
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">PAGAMENTO</Label>
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o pagamento" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TYPES.map((pt) => (
                <SelectItem key={pt} value={pt}>{pt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">STATUS</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-2">
            <Badge variant="outline">{status}</Badge>
          </div>
        </div>

        {/* Corretor — editável + deeplink p/ ranking */}
        <div>
          <Label className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <UserCircle2 className="h-3 w-3" /> CORRETOR
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <AsyncCombobox
                placeholder="Buscar corretor..."
                table="profiles"
                filters={{ role: ["agent", "admin", "manager"], is_active: true }}
                searchFields={["full_name", "email"]}
                selectFields="id,full_name,email"
                labelField="full_name"
                subtitleField="email"
                value={agentId || undefined}
                onChange={(item) => setAgentId(item?.id ?? null)}
              />
            </div>
            {proposal.agent?.full_name && (
              <Button variant="outline" size="icon" title="Ver ranking do corretor" onClick={goAgent}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
          {proposal.agent?.full_name && (
            <button onClick={goAgent} className="mt-1 text-xs text-accent hover:underline flex items-center gap-1">
              {proposal.agent.full_name} <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Notas */}
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">NOTAS</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações da proposta..."
            rows={3}
          />
        </div>

        {/* Assinatura */}
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">ASSINATURA</Label>
          <Badge
            variant="outline"
            className={
              proposal.signature_status === "signed"
                ? "text-success border-success"
                : proposal.signature_status === "na"
                  ? "text-muted-foreground"
                  : "text-warning border-warning"
            }
          >
            {proposal.signature_status === "signed" ? "Assinado" : proposal.signature_status === "na" ? "N/A" : "Pendente"}
          </Badge>
        </div>

        {/* Salvar */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="cta" className="flex-1 gap-2" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}