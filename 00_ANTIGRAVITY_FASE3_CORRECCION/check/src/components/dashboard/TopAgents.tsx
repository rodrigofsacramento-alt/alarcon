import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Target } from "lucide-react";
interface Agent {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  sales: number;
  revenue: string;
  conversion: number;
  rank: number;
  trend: "up" | "down" | "stable";
}
const agents: Agent[] = [{
  id: "1",
  name: "Patricia Santos",
  initials: "PS",
  sales: 8,
  revenue: "R$ 7.2M",
  conversion: 24,
  rank: 1,
  trend: "up"
}, {
  id: "2",
  name: "Carlos Mendes",
  initials: "CM",
  sales: 6,
  revenue: "R$ 5.4M",
  conversion: 21,
  rank: 2,
  trend: "up"
}, {
  id: "3",
  name: "Ana Rodrigues",
  initials: "AR",
  sales: 5,
  revenue: "R$ 4.8M",
  conversion: 18,
  rank: 3,
  trend: "stable"
}, {
  id: "4",
  name: "Roberto Lima",
  initials: "RL",
  sales: 4,
  revenue: "R$ 3.6M",
  conversion: 16,
  rank: 4,
  trend: "down"
}, {
  id: "5",
  name: "Fernanda Costa",
  initials: "FC",
  sales: 3,
  revenue: "R$ 2.7M",
  conversion: 14,
  rank: 5,
  trend: "up"
}];
const getRankBadge = (rank: number) => {
  switch (rank) {
    case 1:
      return <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Trophy className="h-3.5 w-3.5" />
        </div>;
    case 2:
      return <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-xs">
          2º
        </div>;
    case 3:
      return <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-xs">
          3º
        </div>;
    default:
      return <div className="flex h-6 w-6 items-center justify-center text-muted-foreground font-medium text-xs">
          {rank}º
        </div>;
  }
};
export function TopAgents() {
  const navigate = useNavigate();
  return <div className="rounded-xl bg-card p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">
            Ranking Corretores
          </h3>
        </div>
        <select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
          <option>Este mês</option>
          <option>Este trimestre</option>
          <option>Este ano</option>
        </select>
      </div>

      <div className="space-y-3">
        {agents.map(agent => <div key={agent.id} className={cn("flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-secondary", agent.rank === 1 && "bg-accent/5 hover:bg-accent/10")}>
            {getRankBadge(agent.rank)}
            
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold", agent.rank === 1 ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")}>
              {agent.initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {agent.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{agent.sales} vendas</span>
                <span>•</span>
                <span className="text-success flex items-center gap-0.5">
                  <Target className="h-3 w-3" />
                  {agent.conversion}%
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {agent.revenue}
              </p>
              <div className={cn("text-xs flex items-center justify-end gap-0.5", agent.trend === "up" && "text-success", agent.trend === "down" && "text-destructive", agent.trend === "stable" && "text-muted-foreground")}>
                {agent.trend === "up" && <TrendingUp className="h-3 w-3" />}
                {agent.trend === "up" ? "↑ Subindo" : agent.trend === "down" ? "↓ Descendo" : "→ Estável"}
              </div>
            </div>
          </div>)}
      </div>

      <button onClick={() => navigate('/corretores')} className="w-full mt-4 py-2 text-sm font-medium text-accent hover:underline">
        Ver ranking completo →
      </button>
    </div>;
}