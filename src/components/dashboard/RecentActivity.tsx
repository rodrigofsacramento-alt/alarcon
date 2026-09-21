import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  UserCheck,
  Home,
  FileText,
  Calendar,
  MessageSquare,
  DollarSign,
  ArrowRight,
  Mail,
} from "lucide-react";
import { useRecentActivity } from "@/hooks/use-dashboard";

interface Activity {
  id: string;
  type: "lead" | "property" | "proposal" | "visit" | "message" | "sale";
  title: string;
  description: string;
  time: string;
  user: { name: string };
}

const TIMELINE_TYPE_MAP: Record<string, { type: Activity["type"]; icon: "default" }> = {
  lead_created: { type: "lead", icon: "default" },
  status: { type: "message", icon: "default" },
  edit: { type: "property", icon: "default" },
  note: { type: "message", icon: "default" },
  visit: { type: "visit", icon: "default" },
  proposal: { type: "proposal", icon: "default" },
  sale: { type: "sale", icon: "default" },
};

function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin} min`;
  const hours = Math.round(diffMin / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "ontem" : `${days}d`;
}

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
  const { data: timeline } = useRecentActivity();

  const activities: Activity[] = (timeline || []).slice(0, 8).map((item: any) => {
    const mapped = TIMELINE_TYPE_MAP[item.type]?.type || "message";
    const leadName = item.lead?.name;
    const userName = item.user?.full_name || "Sistema";
    const desc =
      item.description
        ? leadName ? `${leadName} — ${item.description}` : item.description
        : leadName || item.title || "Atividade de lead";
    return {
      id: item.id,
      type: mapped,
      title: item.title || item.type?.replace('_', ' ') || "Atividade",
      description: desc,
      time: relativeTime(item.created_at),
      user: { name: userName },
    };
  });

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

      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Sem atividades recentes registradas.
        </p>
      ) : (
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
      )}
    </div>
  );
}
