import { X, FileText, Clock, User, Building, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProposalDetailPanelProps {
  proposal: {
    id: string;
    property: { name: string; image: string };
    client: string;
    value: string;
    paymentType: string;
    status: string;
    statusColor: "blue" | "green" | "orange" | "gray";
    currentStage: number;
    stages: ("complete" | "current" | "pending")[];
    signature: "pending" | "signed" | "na";
    leadId?: string;
    agentId?: string;
    agentName?: string;
    sla?: string;
    documents?: { name: string; status: "pending" | "received" }[];
    history?: { date: string; action: string; user: string }[];
  };
  onClose: () => void;
}

const proposalStages = [
  "Solicitação de documentos enviada ao comprador",
  "Proposta enviada ao comprador",
  "Proposta finalizada pelo comprador",
  "Proposta enviada ao vendedor",
  "Proposta finalizada (comprador e vendedor assinaram)",
];

export function ProposalDetailPanel({ proposal, onClose }: ProposalDetailPanelProps) {
  const getStageStatus = (index: number) => {
    if (index < proposal.currentStage) return "complete";
    if (index === proposal.currentStage) return "current";
    return "pending";
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-[420px] bg-card border-l border-border shadow-lg overflow-y-auto z-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Detalhes da Proposta</h3>
            <p className="text-sm text-muted-foreground">#{proposal.id}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Property Info */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl mb-6">
          <img
            src={proposal.property.image}
            alt={proposal.property.name}
            className="h-16 w-16 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium text-foreground">{proposal.property.name}</p>
            <p className="text-sm text-muted-foreground">Cliente: {proposal.client}</p>
            <p className="text-lg font-bold text-accent mt-1">{proposal.value}</p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <User className="h-3 w-3" />
              Responsável
            </div>
            <p className="text-sm font-medium">{proposal.agentName || "Não definido"}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Clock className="h-3 w-3" />
              SLA
            </div>
            <p className="text-sm font-medium">{proposal.sla || "48h"}</p>
          </div>
        </div>

        {/* Stages Timeline */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-4">Estágios da Proposta</h4>
          <div className="space-y-3">
            {proposalStages.map((stage, index) => {
              const status = getStageStatus(index);
              return (
                <div key={index} className="relative pl-8">
                  {/* Line */}
                  {index < proposalStages.length - 1 && (
                    <div className={cn(
                      "absolute left-[11px] top-6 bottom-0 w-0.5",
                      status === "complete" ? "bg-success" : "bg-border"
                    )} />
                  )}
                  {/* Dot */}
                  <div className={cn(
                    "absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center",
                    status === "complete" && "bg-success text-success-foreground",
                    status === "current" && "bg-accent text-accent-foreground",
                    status === "pending" && "bg-muted text-muted-foreground"
                  )}>
                    {status === "complete" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className={cn(
                    "pb-3 pt-0.5",
                    status === "current" && "font-medium text-accent",
                    status === "pending" && "text-muted-foreground"
                  )}>
                    <p className="text-sm">{stage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Documents */}
        {proposal.documents && proposal.documents.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Documentos</h4>
            <div className="space-y-2">
              {proposal.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{doc.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={doc.status === "received" ? "text-success border-success" : "text-warning border-warning"}
                  >
                    {doc.status === "received" ? "Recebido" : "Pendente"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {proposal.history && proposal.history.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Histórico</h4>
            <div className="space-y-3">
              {proposal.history.map((entry, index) => (
                <div key={index} className="text-sm border-l-2 border-border pl-3">
                  <p className="text-muted-foreground text-xs">{entry.date}</p>
                  <p className="text-foreground">{entry.action}</p>
                  <p className="text-muted-foreground text-xs">por {entry.user}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="cta" className="flex-1">
            Editar Proposta
          </Button>
          <Button variant="outline" className="flex-1">
            Ver Lead
          </Button>
        </div>
      </div>
    </div>
  );
}
