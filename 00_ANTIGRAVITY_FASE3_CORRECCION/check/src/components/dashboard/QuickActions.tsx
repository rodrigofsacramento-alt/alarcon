import { useNavigate } from "react-router-dom";
import { UserPlus, Building2, Calendar, FileText, Send, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
interface ActionItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  path: string;
}
const actions: ActionItem[] = [{
  icon: <UserPlus className="h-5 w-5" />,
  label: "Novo Lead",
  description: "Cadastrar lead manualmente",
  color: "bg-accent text-accent-foreground",
  path: "/leads?action=new"
}, {
  icon: <Building2 className="h-5 w-5" />,
  label: "Novo Imóvel",
  description: "Cadastrar imóvel para captação",
  color: "bg-primary text-primary-foreground",
  path: "/imoveis?action=new"
}, {
  icon: <Calendar className="h-5 w-5" />,
  label: "Agendar Visita",
  description: "Criar agendamento de visita",
  color: "bg-info text-info-foreground",
  path: "/agenda?action=new"
}, {
  icon: <FileText className="h-5 w-5" />,
  label: "Nova Proposta",
  description: "Gerar proposta comercial",
  color: "bg-success text-success-foreground",
  path: "/propostas?action=new"
}, {
  icon: <Send className="h-5 w-5" />,
  label: "Enviar Imóveis",
  description: "Enviar sugestões ao cliente",
  color: "bg-chart-4 text-info-foreground",
  path: "/imoveis"
}, {
  icon: <Phone className="h-5 w-5" />,
  label: "Registrar Contato",
  description: "Registrar interação com cliente",
  color: "bg-warning text-warning-foreground",
  path: "/atendimento"
}];
export function QuickActions() {
  const navigate = useNavigate();
  return <div className="rounded-xl bg-card p-6 shadow-md">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Ações Rápidas
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(action => <button key={action.label} onClick={() => navigate(action.path)} className="action-card text-left">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", action.color)}>
              {action.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {action.label}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {action.description}
              </p>
            </div>
          </button>)}
      </div>
    </div>;
}