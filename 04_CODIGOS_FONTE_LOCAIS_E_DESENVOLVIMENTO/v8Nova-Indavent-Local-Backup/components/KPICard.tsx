'use client';

import React from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  color?: string;
  description?: string;
}

export function KPICard({ title, value, change, trend, icon: Icon, color = "blue", description }: KPICardProps) {
  const trendColor = trend === 'up' ? 'text-emerald-500' : 'text-rose-500';
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="p-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl hover:border-white/10 transition-colors duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-2 rounded-xl",
          color === 'blue' && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
          color === 'emerald' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
          color === 'amber' && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
          color === 'purple' && "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        )}>
          <Icon size={20} />
        </div>
        {change && (
          <span className={cn("text-xs font-bold flex items-center gap-0.5", trendColor)}>
            <TrendIcon size={14} />
            {change}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-100">{value}</h3>
      {description && <p className="text-[10px] text-slate-400 mt-2 font-medium">{description}</p>}
    </div>
  );
}
