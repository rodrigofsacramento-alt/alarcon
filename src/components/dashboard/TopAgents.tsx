import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { usePerformanceDashboard } from "@/hooks/use-performance-dashboard";

interface Agent {
  id: string;
  name: string;
  initials: string;
  sales: number;
  interacciones: number;
  propuestas: number;
  score: number;
  rank: number;
}

function initialsOf(name: string): string {
  if (!name) return "";
  const clean = name.replace(/[^\p{L}\p{N} ]/gu, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return clean ? clean : "??";
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const getRankBadge = (rank: number) => {
  switch (rank) {
    case 1:
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Trophy className="h-3.5 w-3.5" />
        </div>
      );
    case 2:
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-xs">
          2º
        </div>
      );
    case 3:
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-xs">
          3º
        </div>
      );
    default:
      return (
        <div className="flex h-6 w-6 items-center justify-center text-muted-foreground font-medium text-xs">
          {rank}º
        </div>
      );
  }
};

export function TopAgents() {
  const navigate = useNavigate();
  const { data } = usePerformanceDashboard();
  const ranking = data?.ranking || [];

  const agents: Agent[] = ranking
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 6)
    .map((agent, index) => ({
      id: agent.agent_id,
      name: agent.agente || "Corretor",
      initials: initialsOf(agent.agente),
      sales: agent.vendas || 0,
      interacciones: agent.interacciones || 0,
      propuestas: agent.propuestas || 0,
      score: agent.score || 0,
      rank: index + 1,
    }));

  return (
    <div className="rounded-xl bg-card p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">
            Ranking Corretores
          </h3>
        </div>
      </div>

      {agents.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Sem dados de corretores disponíveis.
        </p>
      ) : (
      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={`${agent.id}-${agent.rank}`}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-secondary",
              agent.rank === 1 && "bg-accent/5 hover:bg-accent/10"
            )}
          >
            {getRankBadge(agent.rank)}

            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                agent.rank === 1
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {agent.initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {agent.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{agent.interacciones} interações</span>
                <span>•</span>
                <span>{agent.propuestas} propostas</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {agent.sales} vendas
              </p>
              <div className="text-xs text-muted-foreground flex items-center justify-end gap-0.5">
                <Target className="h-3 w-3" />
                score {agent.score}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      <button onClick={() => navigate('/dashboard-performance')} className="w-full mt-4 py-2 text-sm font-medium text-accent hover:underline">
        Ver ranking completo →
      </button>
    </div>
  );
}