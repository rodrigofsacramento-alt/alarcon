import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// ════════════════════════════════════════════════════════════════════════════
// Estate.ia Super Admin — Design System Components
// Dark Premium Executivo (estilo Vercel/Stripe)
// Tokens: bg #0d1526 / surface #0f1829 / accent #c8590a / navy #1e2d5e
// ════════════════════════════════════════════════════════════════════════════

export const SA_TOKENS = {
  bg: '#0d1526',
  surface: '#0f1829',
  surfaceElevated: '#162039',
  border: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
  accent: '#c8590a',
  accentLight: '#e07a3a',
  accentBg: 'rgba(200,89,10,0.12)',
  navy: '#1e2d5e',
  textPrimary: 'rgba(255,255,255,0.95)',
  textSecondary: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.4)',
  textDim: 'rgba(255,255,255,0.25)',
} as const;

// ─── SAPageHeader ──────────────────────────────────────────────────────────

interface SAPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}

export function SAPageHeader({ title, description, icon: Icon, actions }: SAPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8 pb-6"
         style={{ borderBottom: `1px solid ${SA_TOKENS.border}` }}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
               style={{ background: SA_TOKENS.accentBg, border: `1px solid ${SA_TOKENS.accent}33` }}>
            <Icon className="w-5 h-5" style={{ color: SA_TOKENS.accent }} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: SA_TOKENS.textPrimary }}>
            {title}
          </h1>
          {description && (
            <p className="text-sm mt-1" style={{ color: SA_TOKENS.textSecondary }}>
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

// ─── SAStatCard ────────────────────────────────────────────────────────────

interface SAStatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: { value: number; label?: string };
  subtext?: string;
  loading?: boolean;
}

export function SAStatCard({ label, value, icon: Icon, iconColor = SA_TOKENS.accent, trend, subtext, loading }: SAStatCardProps) {
  const isPositive = trend && trend.value >= 0;
  return (
    <div
      className="rounded-2xl p-5 transition-all hover:scale-[1.01]"
      style={{
        background: SA_TOKENS.surface,
        border: `1px solid ${SA_TOKENS.border}`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: SA_TOKENS.textMuted }}>
          {label}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
               style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}25` }}>
            <Icon className="w-4 h-4" style={{ color: iconColor }} />
          </div>
        )}
      </div>
      <div className="space-y-1">
        {loading ? (
          <div className="h-8 w-24 rounded animate-pulse" style={{ background: SA_TOKENS.borderSubtle }} />
        ) : (
          <p className="text-2xl font-bold tracking-tight" style={{ color: SA_TOKENS.textPrimary }}>
            {value}
          </p>
        )}
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className="inline-flex items-center gap-0.5 text-xs font-medium"
              style={{ color: isPositive ? '#10b981' : '#f87171' }}
            >
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend.value)}%
            </span>
          )}
          {subtext && (
            <span className="text-xs" style={{ color: SA_TOKENS.textMuted }}>
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SACard ────────────────────────────────────────────────────────────────

interface SACardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export function SACard({ children, className, title, description, action, noPadding }: SACardProps) {
  return (
    <div
      className={cn('rounded-2xl', className)}
      style={{ background: SA_TOKENS.surface, border: `1px solid ${SA_TOKENS.border}` }}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: `1px solid ${SA_TOKENS.borderSubtle}` }}>
          <div>
            {title && (
              <h3 className="text-sm font-semibold" style={{ color: SA_TOKENS.textPrimary }}>
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs mt-0.5" style={{ color: SA_TOKENS.textMuted }}>
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

// ─── SABadge ───────────────────────────────────────────────────────────────

type SABadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

const BADGE_TONES: Record<SABadgeTone, { bg: string; color: string; border: string }> = {
  success: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
  warning: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  danger:  { bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.25)' },
  info:    { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  neutral: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)', border: 'rgba(255,255,255,0.12)' },
  accent:  { bg: SA_TOKENS.accentBg, color: SA_TOKENS.accentLight, border: `${SA_TOKENS.accent}33` },
};

interface SABadgeProps {
  tone?: SABadgeTone;
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function SABadge({ tone = 'neutral', children, icon: Icon, className }: SABadgeProps) {
  const t = BADGE_TONES[tone];
  return (
    <span
      className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium', className)}
      style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}` }}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

// ─── SAEmptyState ──────────────────────────────────────────────────────────

interface SAEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SAEmptyState({ icon: Icon, title, description, action }: SAEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
             style={{ background: SA_TOKENS.borderSubtle, border: `1px solid ${SA_TOKENS.border}` }}>
          <Icon className="w-6 h-6" style={{ color: SA_TOKENS.textMuted }} />
        </div>
      )}
      <h3 className="text-base font-semibold mb-1" style={{ color: SA_TOKENS.textPrimary }}>{title}</h3>
      {description && (
        <p className="text-sm mb-4 max-w-sm" style={{ color: SA_TOKENS.textSecondary }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ─── SASkeleton ────────────────────────────────────────────────────────────

export function SASkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded animate-pulse', className)}
      style={{ background: SA_TOKENS.borderSubtle }}
    />
  );
}

// ─── SAButton ──────────────────────────────────────────────────────────────

type SAButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface SAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SAButtonVariant;
  icon?: LucideIcon;
  size?: 'sm' | 'md';
}

export function SAButton({ variant = 'primary', icon: Icon, size = 'md', children, className, ...props }: SAButtonProps) {
  const variants: Record<SAButtonVariant, React.CSSProperties> = {
    primary: {
      background: SA_TOKENS.accent,
      color: '#fff',
      border: `1px solid ${SA_TOKENS.accent}`,
    },
    secondary: {
      background: SA_TOKENS.surface,
      color: SA_TOKENS.textPrimary,
      border: `1px solid ${SA_TOKENS.border}`,
    },
    ghost: {
      background: 'transparent',
      color: SA_TOKENS.textSecondary,
      border: `1px solid transparent`,
    },
    danger: {
      background: 'rgba(239,68,68,0.12)',
      color: '#f87171',
      border: '1px solid rgba(239,68,68,0.25)',
    },
  };
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-sm',
        className
      )}
      style={variants[variant]}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
}

// ─── SAPagination ──────────────────────────────────────────────────────────

interface SAPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function SAPagination({ page, pageSize, total, onPageChange }: SAPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${SA_TOKENS.border}` }}>
      <span className="text-xs" style={{ color: SA_TOKENS.textMuted }}>
        Página {page} de {totalPages} ({total} total)
      </span>
      <div className="flex items-center gap-2">
        <SAButton variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Anterior
        </SAButton>
        <SAButton variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Próxima
        </SAButton>
      </div>
    </div>
  );
}

// ─── SAFilterBar ───────────────────────────────────────────────────────────

interface SAFilterBarProps {
  children: ReactNode;
  className?: string;
}

export function SAFilterBar({ children, className }: SAFilterBarProps) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2 p-3 rounded-xl', className)}
      style={{ background: SA_TOKENS.surface, border: `1px solid ${SA_TOKENS.border}` }}
    >
      {children}
    </div>
  );
}
