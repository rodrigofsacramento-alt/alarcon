import { cn } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/use-dashboard";

interface FunnelStage {
  label: string;
  count: number;
  value: string;
  conversion?: number;
  color: string;
}

// ValueError real: aqui vienen los conteos por etapa desde el hook (no estáticos)
const STAGE_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-success",
  "bg-accent",
];

export function LeadFunnel() {
  const { data: stats } = useDashboardStats();
  const funnel = stats?.funnel || [];

  const totalLeads = funnel.reduce((s, f) => s + f.count, 0);
  const stages: FunnelStage[] = funnel.map((item, index) => ({
    label: item.stage,
    count: item.count,
    value: `${item.count}`,
    conversion: index > 0 && totalLeads > 0
      ? Math.max(0, Math.round((item.count / totalLeads) * 100))
      : undefined,
    color: STAGE_COLORS[index % STAGE_COLORS.length],
  }));

  const maxCount = stages.length ? Math.max(...stages.map((s) => s.count)) : 1;

  return (
    <div className="rounded-xl bg-card p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Funil de Vendas</h3>
          <p className="text-sm text-muted-foreground">Conversão por etapa (leads reais)</p>
        </div>
      </div>

      {stages.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Sem dados de leads por etapa.
        </p>
      ) : (
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const widthPercentage = (stage.count / maxCount) * 100;
          
          return (
            <div key={`${stage.label}-${index}`} className="group relative">
              <div className="funnel-stage">
                <div className="flex items-center gap-3 z-10 relative">
                  <div className={cn("h-2.5 w-2.5 rounded-full", stage.color)} />
                  <span className="text-sm font-medium text-foreground">
                    {stage.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 z-10 relative">
                  <span className="text-sm font-semibold text-foreground">
                    {stage.count}
                  </span>
                  <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                    {stage.value} leads
                  </span>
                  {stage.conversion !== undefined && index > 0 && (
                    <span className={cn(
                      "text-xs font-medium min-w-[48px] text-right",
                      stage.conversion >= 60 ? "text-success" : 
                      stage.conversion >= 40 ? "text-warning" : "text-destructive"
                    )}>
                      {stage.conversion}%
                    </span>
                  )}
                </div>
                {/* Progress bar background */}
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full rounded-lg opacity-10 transition-all duration-300 group-hover:opacity-20",
                    stage.color
                  )}
                  style={{ width: `${widthPercentage}%` }}
                />
              </div>
              {/* Connection line */}
              {index < stages.length - 1 && (
                <div className="ml-[18px] h-2 w-px bg-border" />
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Leads ativos</p>
          <p className="text-xl font-bold text-foreground">{totalLeads}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Vendas do mês</p>
          <p className="text-xl font-bold text-accent">{stats?.vendasMes || 0}</p>
        </div>
      </div>
    </div>
  );
}
