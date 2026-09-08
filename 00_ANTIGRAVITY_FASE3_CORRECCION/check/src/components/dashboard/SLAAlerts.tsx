import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { DashboardSlaAlert } from "@/hooks/use-dashboard";
const getStatusStyles = (status: DashboardSlaAlert["status"]) => {
  switch (status) {
    case "critical":
      return {
        bg: "bg-destructive/10",
        text: "text-destructive",
        icon: <AlertTriangle className="h-4 w-4" />,
        badge: "bg-destructive text-destructive-foreground"
      };
    case "warning":
      return {
        bg: "bg-warning/10",
        text: "text-warning",
        icon: <Clock className="h-4 w-4" />,
        badge: "bg-warning text-warning-foreground"
      };
    case "expired":
      return {
        bg: "bg-destructive/5",
        text: "text-destructive",
        icon: <XCircle className="h-4 w-4" />,
        badge: "bg-destructive/80 text-destructive-foreground"
      };
    case "ok":
      return {
        bg: "bg-success/10",
        text: "text-success",
        icon: <CheckCircle2 className="h-4 w-4" />,
        badge: "bg-success text-success-foreground"
      };
  }
};
export function SLAAlerts({
  items = []
}: {
  items?: DashboardSlaAlert[];
}) {
  const navigate = useNavigate();
  const criticalCount = items.filter(item => item.status === "critical" || item.status === "expired").length;
  return <div className="rounded-xl bg-card p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            Alertas de SLA
          </h3>
          {criticalCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground px-1.5 animate-pulse-accent">
              {criticalCount}
            </span>}
        </div>
        <button onClick={() => navigate('/leads')} className="text-sm text-accent hover:underline">
          Gerenciar
        </button>
      </div>

      {items.length === 0 ? <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
          <CheckCircle2 className="mx-auto h-5 w-5 text-success" />
          <p className="mt-2 text-sm font-medium text-foreground">Nenhum SLA critico</p>
          <p className="text-xs text-muted-foreground">Os leads ativos estao dentro do prazo calculado.</p>
        </div> : <div className="space-y-3">
          {items.map(item => {
        const styles = getStatusStyles(item.status);
        return <button key={item.id} onClick={() => navigate('/leads', {
          state: {
            selectedLeadId: item.id
          }
        })} className={cn("flex w-full items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm text-left", styles.bg)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(styles.text, "shrink-0")}>{styles.icon}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.type}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.client} - {item.agent}
                    </p>
                  </div>
                </div>
                <span className={cn("ml-3 shrink-0 text-xs font-medium px-2 py-1 rounded-full", styles.badge)}>
                  {item.deadline}
                </span>
              </button>;
      })}
        </div>}
    </div>;
}