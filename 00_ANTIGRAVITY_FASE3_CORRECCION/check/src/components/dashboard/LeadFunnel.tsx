import { cn } from "@/lib/utils";
interface FunnelStage {
  label: string;
  count: number;
  value: string;
  conversion?: number;
  color: string;
}
const stages: FunnelStage[] = [{
  label: "Novos Leads",
  count: 248,
  value: "R$ 186M",
  conversion: 100,
  color: "bg-chart-1"
}, {
  label: "Qualificados",
  count: 186,
  value: "R$ 142M",
  conversion: 75,
  color: "bg-chart-2"
}, {
  label: "Em Atendimento",
  count: 124,
  value: "R$ 98M",
  conversion: 67,
  color: "bg-chart-3"
}, {
  label: "Visita Agendada",
  count: 68,
  value: "R$ 54M",
  conversion: 55,
  color: "bg-chart-4"
}, {
  label: "Proposta Enviada",
  count: 42,
  value: "R$ 38M",
  conversion: 62,
  color: "bg-chart-5"
}, {
  label: "Em Negociação",
  count: 28,
  value: "R$ 24M",
  conversion: 67,
  color: "bg-success"
}, {
  label: "Fechados",
  count: 18,
  value: "R$ 16.2M",
  conversion: 64,
  color: "bg-accent"
}];
export function LeadFunnel() {
  const maxCount = stages[0].count;
  return <div className="rounded-xl bg-card p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Funil de Vendas</h3>
          <p className="text-sm text-muted-foreground">Conversão por etapa</p>
        </div>
        <select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
          <option>Este mês</option>
          <option>Últimos 7 dias</option>
          <option>Últimos 30 dias</option>
          <option>Este trimestre</option>
        </select>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => {
        const widthPercentage = stage.count / maxCount * 100;
        return <div key={stage.label} className="group relative">
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
                    {stage.value}
                  </span>
                  {stage.conversion !== undefined && index > 0 && <span className={cn("text-xs font-medium min-w-[48px] text-right", stage.conversion >= 60 ? "text-success" : stage.conversion >= 40 ? "text-warning" : "text-destructive")}>
                      {stage.conversion}%
                    </span>}
                </div>
                {/* Progress bar background */}
                <div className={cn("absolute left-0 top-0 h-full rounded-lg opacity-10 transition-all duration-300 group-hover:opacity-20", stage.color)} style={{
              width: `${widthPercentage}%`
            }} />
              </div>
              {/* Connection line */}
              {index < stages.length - 1 && <div className="ml-[18px] h-2 w-px bg-border" />}
            </div>;
      })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Taxa de conversão geral</p>
          <p className="text-xl font-bold text-foreground">7.3%</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Ticket médio</p>
          <p className="text-xl font-bold text-accent">R$ 900.000</p>
        </div>
      </div>
    </div>;
}