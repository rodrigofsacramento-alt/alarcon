import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

interface FollowUpBadgeProps {
  /** ISO timestamp do follow-up agendado (scheduled_at). */
  scheduled_at: string;
  className?: string;
}

/**
 * Calcula a etiqueta relativa de um follow-up agendado:
 *  - diff < 30min        -> 'agora'
 *  - diff < 60min        -> '30min'
 *  - diff < 24h          -> '1H' / '<N>H'
 *  - diff < 7d           -> '1D' / '<N>D'
 *  - diff < 30d          -> '1S' / '<N>S' (semana)
 *  - caso contrário      -> '1M' / '<N>M' (mês)
 */
export function formatRelativeFollowUp(scheduledAt: string, now: Date = new Date()): string {
  const scheduled = new Date(scheduledAt).getTime();
  const ref = now.getTime();
  if (!Number.isFinite(scheduled)) return '';

  const diff = scheduled - ref;
  if (diff <= 0) return 'agora';
  if (diff < 30 * MINUTE) return 'agora';
  if (diff < 60 * MINUTE) return '30min';
  if (diff < DAY) {
    const n = Math.max(1, Math.round(diff / HOUR));
    return n <= 1 ? '1H' : `${n}H`;
  }
  if (diff < WEEK) {
    const n = Math.max(1, Math.round(diff / DAY));
    return n <= 1 ? '1D' : `${n}D`;
  }
  if (diff < MONTH) {
    const n = Math.max(1, Math.round(diff / WEEK));
    return n <= 1 ? '1S' : `${n}S`;
  }
  const n = Math.max(1, Math.round(diff / MONTH));
  return n <= 1 ? '1M' : `${n}M`;
}

export function FollowUpBadge({ scheduled_at, className }: FollowUpBadgeProps) {
  const label = useMemo(() => formatRelativeFollowUp(scheduled_at), [scheduled_at]);
  if (!label) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border-2 border-amber-300 bg-amber-100 px-1.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/60',
        className
      )}
      title={`Follow-up agendado: ${new Date(scheduled_at).toLocaleString('pt-BR')}`}
    >
      <Clock className="h-2.5 w-2.5 shrink-0" />
      {label}
    </span>
  );
}