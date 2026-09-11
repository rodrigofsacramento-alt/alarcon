import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardPerformancePoint } from "@/hooks/use-dashboard";

export function PerformanceChart({ data = [] }: { data?: DashboardPerformancePoint[] }) {
  const chartData = data.length ? data : [{ month: "-", leads: 0, vendas: 0 }];

  return (
    <div className="rounded-xl bg-card p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Performance Mensal
          </h3>
          <p className="text-sm text-muted-foreground">
            Evolução de leads e vendas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Leads</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Vendas</span>
          </div>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(26, 91%, 44%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(26, 91%, 44%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(218, 43%, 23%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(218, 43%, 23%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(218, 20%, 46%)", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(218, 20%, 46%)", fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(218, 20%, 46%)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 15%, 90%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: "hsl(218, 43%, 15%)", fontWeight: 600 }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="leads"
              stroke="hsl(26, 91%, 44%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLeads)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="vendas"
              stroke="hsl(218, 43%, 23%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVendas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
