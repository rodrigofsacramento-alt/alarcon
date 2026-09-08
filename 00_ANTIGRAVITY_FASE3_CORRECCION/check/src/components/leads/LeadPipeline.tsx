import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLeads, useUpdateLead } from "@/hooks/use-leads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, User, Phone, Mail, Loader2, Calendar, ArrowRight, CheckCircle2, Tag } from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "@/hooks/use-leads";
const pipelineStages = ["Lead Cadastrado", "Primeiro Atendimento", "Follow-up", "Agendamento de Visita", "Visita Agendada", "Imóvel Escolhido", "Em Aprovação de Correspondência", "Proposta Solicitada"];
const stageColors: Record<string, string> = {
  "Lead Cadastrado": "bg-slate-100 border-slate-300",
  "Primeiro Atendimento": "bg-blue-50 border-blue-300",
  "Follow-up": "bg-amber-50 border-amber-300",
  "Agendamento de Visita": "bg-purple-50 border-purple-300",
  "Visita Agendada": "bg-indigo-50 border-indigo-300",
  "Imóvel Escolhido": "bg-cyan-50 border-cyan-300",
  "Em Aprovação de Correspondência": "bg-orange-50 border-orange-300",
  "Proposta Solicitada": "bg-emerald-50 border-emerald-300"
};
const stageBadgeColors: Record<string, string> = {
  "Lead Cadastrado": "bg-slate-100 text-slate-700",
  "Primeiro Atendimento": "bg-blue-100 text-blue-700",
  "Follow-up": "bg-amber-100 text-amber-700",
  "Agendamento de Visita": "bg-purple-100 text-purple-700",
  "Visita Agendada": "bg-indigo-100 text-indigo-700",
  "Imóvel Escolhido": "bg-cyan-100 text-cyan-700",
  "Em Aprovação de Correspondência": "bg-orange-100 text-orange-700",
  "Proposta Solicitada": "bg-emerald-100 text-emerald-700"
};
interface LeadCardProps {
  lead: Lead;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  canMoveForward: boolean;
  canMoveBackward: boolean;
  onClick: () => void;
}
function LeadCard({
  lead,
  onMoveForward,
  onMoveBackward,
  canMoveForward,
  canMoveBackward,
  onClick
}: LeadCardProps) {
  return <div className="bg-card rounded-lg border border-border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm font-medium truncate">{lead.name || 'Sem nome'}</p>
        <p className="text-xs text-muted-foreground truncate">{lead.source || 'Sem fonte'}</p>
        
        {lead.tags && Array.isArray(lead.tags) && lead.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-1">
            {lead.tags.map((tag: string, idx: number) => <Badge key={`ptag-${idx}`} variant="default" className="rounded-md px-1.5 py-0 text-[9px] bg-accent/90 text-white border-transparent">
                <Tag className="mr-0.5 h-2 w-2" />
                {tag}
              </Badge>)}
          </div>}
        
        {lead.whatsapp_group && <div className="mt-1">
            <Badge variant="outline" className="rounded-md px-1.5 py-0 text-[10px] border-[#25D366] text-[#25D366] bg-[#25D366]/10">
              {lead.whatsapp_group}
            </Badge>
          </div>}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={e => {
          e.stopPropagation();
          onMoveBackward();
        }} disabled={!canMoveBackward} className={cn("p-1 rounded hover:bg-muted transition-colors", !canMoveBackward && "opacity-30 cursor-not-allowed")}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button onClick={e => {
          e.stopPropagation();
          onMoveForward();
        }} disabled={!canMoveForward} className={cn("p-1 rounded hover:bg-muted transition-colors", !canMoveForward && "opacity-30 cursor-not-allowed")}>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>;
}
interface LeadPipelineProps {
  onSelectLead?: (leadId: string) => void;
  filters?: {
    stage?: string;
    source?: string;
    search?: string;
    agent?: string;
  };
}
export default function LeadPipeline({
  onSelectLead,
  filters
}: LeadPipelineProps) {
  const {
    data: leads = [],
    isLoading
  } = useLeads(filters);
  const updateLeadMutation = useUpdateLead();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const handleMove = (lead: Lead, direction: 'forward' | 'backward') => {
    const currentIndex = pipelineStages.indexOf(lead.stage);
    if (currentIndex === -1) return;
    const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= pipelineStages.length) return;
    const newStage = pipelineStages[newIndex];
    updateLeadMutation.mutate({
      id: lead.id,
      stage: newStage
    }, {
      onSuccess: () => {
        toast.success(`Lead movido para "${newStage}"`);
      },
      onError: (err: any) => {
        toast.error("Erro ao mover lead", {
          description: err?.message
        });
      }
    });
  };
  const handleConvert = (lead: Lead) => {
    updateLeadMutation.mutate({
      id: lead.id,
      stage: 'Convertido'
    }, {
      onSuccess: () => toast.success(`Lead "${lead.name}" convertido!`),
      onError: (err: any) => toast.error("Erro ao converter", {
        description: err?.message
      })
    });
  };
  const handleLose = (lead: Lead) => {
    updateLeadMutation.mutate({
      id: lead.id,
      stage: 'Perdido'
    }, {
      onSuccess: () => toast.info(`Lead "${lead.name}" marcado como perdido`),
      onError: (err: any) => toast.error("Erro", {
        description: err?.message
      })
    });
  };
  if (isLoading) {
    return <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>;
  }

  // Filtrar leads ativos (não Convertidos nem Perdidos)
  const activeLeads = leads.filter(l => l.stage !== 'Convertido' && l.stage !== 'Perdido');
  try {
    return <div className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-muted-foreground">Convertidos:</span>
            <span className="font-semibold">{leads.filter((l: any) => l.stage === 'Convertido').length}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="h-4 w-4 text-muted-foreground rotate-45" />
            <span className="text-muted-foreground">Perdidos:</span>
            <span className="font-semibold">{leads.filter((l: any) => l.stage === 'Perdido').length}</span>
          </div>
          <div className="flex items-center gap-2 text-sm ml-auto">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Ativos no funil:</span>
            <span className="font-semibold">{activeLeads.length}</span>
          </div>
        </div>

        {/* Pipeline columns - horizontal scroll */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {pipelineStages.map(stage => {
            const stageLeads = activeLeads.filter((l: any) => l.stage === stage);
            const colorClass = stageColors[stage] || "bg-muted border-border";
            const badgeColor = stageBadgeColors[stage] || "bg-muted text-muted-foreground";
            return <div key={stage} className={cn("w-72 rounded-xl border p-3 flex flex-col max-h-[calc(100vh-280px)]", colorClass)}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-[10px] h-5", badgeColor)}>
                        {stageLeads.length}
                      </Badge>
                      <span className="text-sm font-medium truncate">{stage}</span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                    {stageLeads.length === 0 ? <div className="text-center py-6 text-xs text-muted-foreground italic">
                        Nenhum lead
                      </div> : stageLeads.map((lead: any) => {
                  try {
                    return <LeadCard key={lead.id} lead={lead} canMoveForward={pipelineStages.indexOf(stage) < pipelineStages.length - 1} canMoveBackward={pipelineStages.indexOf(stage) > 0} onMoveForward={() => handleMove(lead, 'forward')} onMoveBackward={() => handleMove(lead, 'backward')} onClick={() => onSelectLead?.(lead.id)} />;
                  } catch (e: any) {
                    return <div key={lead.id} className="text-red-500 text-xs">Erro card: {e.message}</div>;
                  }
                })}
                  </div>
                </div>;
          })}
          </div>
        </div>
      </div>;
  } catch (err: any) {
    return <div className="p-10 text-red-500 font-bold">Erro no Pipeline: {err.message}</div>;
  }
}