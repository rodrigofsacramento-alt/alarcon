import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: React.ReactNode;
  variant?: "default" | "accent" | "primary";
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  variant = "default",
  subtitle,
}: StatCardProps) {
  const getChangeIcon = () => {
    if (!change) return null;
    switch (change.type) {
      case "increase":
        return <TrendingUp className="h-3.5 w-3.5" />;
      case "decrease":
        return <TrendingDown className="h-3.5 w-3.5" />;
      default:
        return <Minus className="h-3.5 w-3.5" />;
    }
  };

  const getChangeColor = () => {
    if (!change) return "";
    switch (change.type) {
      case "increase":
        return variant === "default" ? "text-success" : "text-success-foreground bg-success/20";
      case "decrease":
        return variant === "default" ? "text-destructive" : "text-destructive-foreground bg-destructive/20";
      default:
        return variant === "default" ? "text-muted-foreground" : "text-muted-foreground bg-muted/20";
    }
  };

  return (
    <div
      className={cn(
        "stat-card p-4 lg:p-6",
        variant === "accent" && "stat-card-accent",
        variant === "primary" && "stat-card-primary"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-0.5 lg:space-y-1 min-w-0 flex-1">
          <p
            className={cn(
              "text-xs lg:text-sm font-medium truncate",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "text-xl lg:text-2xl font-bold tracking-tight truncate",
              variant === "default" && "text-foreground"
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={cn(
                "text-[10px] lg:text-xs truncate",
                variant === "default" ? "text-muted-foreground" : "opacity-70"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-lg shrink-0 ml-2",
              variant === "default"
                ? "bg-secondary text-primary"
                : "bg-white/20"
            )}
          >
            {icon}
          </div>
        )}
      </div>
      {change && (
        <div className="mt-2 lg:mt-3 flex items-center gap-1 lg:gap-1.5 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 lg:gap-1 rounded-full px-1.5 lg:px-2 py-0.5 text-[10px] lg:text-xs font-medium",
              getChangeColor()
            )}
          >
            {getChangeIcon()}
            {Math.abs(change.value)}%
          </span>
          <span
            className={cn(
              "text-[10px] lg:text-xs hidden sm:inline",
              variant === "default" ? "text-muted-foreground" : "opacity-70"
            )}
          >
            vs. mês anterior
          </span>
        </div>
      )}
    </div>
  );
}
