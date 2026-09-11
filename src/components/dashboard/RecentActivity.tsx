import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  UserCheck,
  Home,
  FileText,
  Calendar,
  MessageSquare,
  DollarSign,
} from "lucide-react";

interface Activity {
  id: string;
  type: "lead" | "property" | "proposal" | "visit" | "message" | "sale";
  title: string;
  description: string;
  time: string;
  user: {
    name: string;
    avatar?: string;
  };
}

const activities: Activity[] = [
  {
    id: "1",
    type: "lead",
    title: "Novo lead qualificado",
    description: "Maria Silva - Apt 3 quartos Jardins",
    time: "2 min",
    user: { name: "Carlos" },
  },
  {
    id: "2",
    type: "visit",
    title: "Visita confirmada",
    description: "Casa Alphaville - João Pedro",
    time: "15 min",
    user: { name: "Ana" },
  },
  {
    id: "3",
    type: "proposal",
    title: "Proposta enviada",
    description: "Cobertura Moema - R$ 2.8M",
    time: "32 min",
    user: { name: "Roberto" },
  },
  {
    id: "4",
    type: "sale",
    title: "Venda fechada!",
    description: "Apt Itaim - R$ 1.4M",
    time: "1h",
    user: { name: "Patricia" },
  },
  {
    id: "5",
    type: "property",
    title: "Novo imóvel captado",
    description: "Casa 4 suítes - Morumbi",
    time: "2h",
    user: { name: "Lucas" },
  },
  {
    id: "6",
    type: "message",
    title: "Follow-up realizado",
    description: "Cliente retornou interesse",
    time: "3h",
    user: { name: "Fernanda" },
  },
];

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "lead":
      return <UserCheck className="h-4 w-4" />;
    case "property":
      return <Home className="h-4 w-4" />;
    case "proposal":
      return <FileText className="h-4 w-4" />;
    case "visit":
      return <Calendar className="h-4 w-4" />;
    case "message":
      return <MessageSquare className="h-4 w-4" />;
    case "sale":
      return <DollarSign className="h-4 w-4" />;
  }
};

const getActivityColor = (type: Activity["type"]) => {
  switch (type) {
    case "lead":
      return "bg-info/10 text-info";
    case "property":
      return "bg-primary/10 text-primary";
    case "proposal":
      return "bg-accent/10 text-accent";
    case "visit":
      return "bg-chart-4/10 text-chart-4";
    case "message":
      return "bg-muted text-muted-foreground";
    case "sale":
      return "bg-success/10 text-success";
  }
};

export function RecentActivity() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl bg-card p-6 shadow-md h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Atividade Recente
        </h3>
        <button onClick={() => navigate('/leads')} className="text-sm text-accent hover:underline">
          Ver tudo
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 group"
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                getActivityColor(activity.type)
              )}
            >
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {activity.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">{activity.time}</p>
              <p className="text-xs text-muted-foreground">{activity.user.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
