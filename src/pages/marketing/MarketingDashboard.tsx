import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Eye, ThumbsUp, MousePointerClick, Loader2 } from "lucide-react";
import { useMarketingPosts } from "@/hooks/use-marketing-posts";

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function MarketingDashboard() {
  const { data: posts = [], isLoading } = useMarketingPosts();

  const totalReach = posts.reduce((s, p) => s + (p.metrics_reach || 0), 0);
  const totalEngagement = posts.reduce((s, p) => s + (p.metrics_engagement || 0), 0);
  const totalClicks = posts.reduce((s, p) => s + (p.metrics_clicks || 0), 0);

  const monthlyData = useMemo(() => {
    const map = new Map<number, { reach: number; engagement: number; clicks: number }>();
    posts.forEach(p => {
      if (!p.created_at) return;
      const d = new Date(p.created_at);
      const key = d.getMonth();
      const existing = map.get(key) || { reach: 0, engagement: 0, clicks: 0 };
      map.set(key, {
        reach: existing.reach + (p.metrics_reach || 0),
        engagement: existing.engagement + (p.metrics_engagement || 0),
        clicks: existing.clicks + (p.metrics_clicks || 0),
      });
    });
    return Array.from({ length: 6 }, (_, i) => {
      const monthIdx = (new Date().getMonth() - 5 + i + 12) % 12;
      const data = map.get(monthIdx) || { reach: 0, engagement: 0, clicks: 0 };
      return { name: monthLabels[monthIdx], ...data };
    });
  }, [posts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="ml-3 text-muted-foreground">Carregando métricas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alcance Total</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReach.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">{posts.length} postagens publicadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento Total</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngagement.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Interações em todas as postagens</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques nos Links</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Conversões de tráfego</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Alcance vs Engajamento (últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              {monthlyData.some(d => d.reach > 0 || d.engagement > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <RechartsTooltip />
                    <Bar dataKey="reach" fill="#8884d8" name="Alcance" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="engagement" fill="#82ca9d" name="Engajamento" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Nenhuma métrica registrada ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tendência de Cliques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {monthlyData.some(d => d.clicks > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="clicks" stroke="#ffc658" name="Cliques" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Nenhuma métrica registrada ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
