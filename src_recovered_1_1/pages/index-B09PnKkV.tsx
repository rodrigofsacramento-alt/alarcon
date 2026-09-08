/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/index-B09PnKkV.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { c as n } from "@/components/index-C9";
import { aD as m, aE as b } from "@/components/ui";
const s = {
  surface: "#0f1829",
  surfaceElevated: "#162039",
  border: "rgba(255,255,255,0.08)",
  borderSubtle: "rgba(255,255,255,0.05)",
  accent: "#c8590a",
  accentLight: "#e07a3a",
  accentBg: "rgba(200,89,10,0.12)",
  textPrimary: "rgba(255,255,255,0.95)",
  textSecondary: "rgba(255,255,255,0.6)",
  textMuted: "rgba(255,255,255,0.4)"
};
function p({
  title: t,
  description: l,
  icon: r,
  actions: a
}) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8 pb-6" style={{
    borderBottom: `1px solid ${s.border}`
  }}>{<div className="flex items-start gap-4">{r && <div className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0" style={{
        background: s.accentBg,
        border: `1px solid ${s.accent}33`
      }}>{<r className="w-5 h-5" style={{
          color: s.accent
        }} />}</div>}{<div>{<h1 className="text-2xl font-semibold tracking-tight" style={{
          color: s.textPrimary
        }}>{t}</h1>}{l && <p className="text-sm mt-1" style={{
          color: s.textSecondary
        }}>{l}</p>}</div>}</div>}{a && <div className="flex flex-wrap gap-2">{a}</div>}</div>;
}
function y({
  label: t,
  value: l,
  icon: r,
  iconColor: a = s.accent,
  trend: c,
  subtext: o,
  loading: d
}) {
  const i = c && c.value >= 0;
  return <div className="rounded-2xl p-5 transition-all hover:scale-[1.01]" style={{
    background: s.surface,
    border: `1px solid ${s.border}`
  }}>{<div className="flex items-start justify-between mb-4">{<span className="text-xs font-medium uppercase tracking-wider" style={{
        color: s.textMuted
      }}>{t}</span>}{r && <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{
        background: `${a}15`,
        border: `1px solid ${a}25`
      }}>{<r className="w-4 h-4" style={{
          color: a
        }} />}</div>}</div>}{<div className="space-y-1">{d ? <div className="h-8 w-24 rounded animate-pulse" style={{
        background: s.borderSubtle
      }} /> : <p className="text-2xl font-bold tracking-tight" style={{
        color: s.textPrimary
      }}>{l}</p>}{<div className="flex items-center gap-2">{c && <span className="inline-flex items-center gap-0.5 text-xs font-medium" style={{
          color: i ? "#10b981" : "#f87171"
        }}>{i ? <m className="w-3 h-3" /> : <b className="w-3 h-3" />}{Math.abs(c.value)}%</span>}{o && <span className="text-xs" style={{
          color: s.textMuted
        }}>{o}</span>}</div>}</div>}</div>;
}
function j({
  children: t,
  className: l,
  title: r,
  description: a,
  action: c,
  noPadding: o
}) {
  return <div className={n("rounded-2xl", l)} style={{
    background: s.surface,
    border: `1px solid ${s.border}`
  }}>{(r || c) && <div className="flex items-center justify-between px-5 py-4" style={{
      borderBottom: `1px solid ${s.borderSubtle}`
    }}>{<div>{r && <h3 className="text-sm font-semibold" style={{
          color: s.textPrimary
        }}>{r}</h3>}{a && <p className="text-xs mt-0.5" style={{
          color: s.textMuted
        }}>{a}</p>}</div>}{c}</div>}{<div className={o ? "" : "p-5"}>{t}</div>}</div>;
}
const u = {
  success: {
    bg: "rgba(16,185,129,0.12)",
    color: "#10b981",
    border: "rgba(16,185,129,0.25)"
  },
  warning: {
    bg: "rgba(245,158,11,0.12)",
    color: "#f59e0b",
    border: "rgba(245,158,11,0.25)"
  },
  danger: {
    bg: "rgba(239,68,68,0.12)",
    color: "#f87171",
    border: "rgba(239,68,68,0.25)"
  },
  info: {
    bg: "rgba(59,130,246,0.12)",
    color: "#60a5fa",
    border: "rgba(59,130,246,0.25)"
  },
  neutral: {
    bg: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.65)",
    border: "rgba(255,255,255,0.12)"
  },
  accent: {
    bg: s.accentBg,
    color: s.accentLight,
    border: `${s.accent}33`
  }
};
function N({
  tone: t = "neutral",
  children: l,
  icon: r,
  className: a
}) {
  const c = u[t];
  return <span className={n("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium", a)} style={{
    background: c.bg,
    color: c.color,
    border: `1px solid ${c.border}`
  }}>{r && <r className="w-3 h-3" />}{l}</span>;
}
function v({
  icon: t,
  title: l,
  description: r,
  action: a
}) {
  return <div className="flex flex-col items-center justify-center text-center py-12 px-6">{t && <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{
      background: s.borderSubtle,
      border: `1px solid ${s.border}`
    }}>{<t className="w-6 h-6" style={{
        color: s.textMuted
      }} />}</div>}{<h3 className="text-base font-semibold mb-1" style={{
      color: s.textPrimary
    }}>{l}</h3>}{r && <p className="text-sm mb-4 max-w-sm" style={{
      color: s.textSecondary
    }}>{r}</p>}{a}</div>;
}
function x({
  variant: t = "primary",
  icon: l,
  size: r = "md",
  children: a,
  className: c,
  ...o
}) {
  const d = {
    primary: {
      background: s.accent,
      color: "#fff",
      border: `1px solid ${s.accent}`
    },
    secondary: {
      background: s.surface,
      color: s.textPrimary,
      border: `1px solid ${s.border}`
    },
    ghost: {
      background: "transparent",
      color: s.textSecondary,
      border: "1px solid transparent"
    },
    danger: {
      background: "rgba(239,68,68,0.12)",
      color: "#f87171",
      border: "1px solid rgba(239,68,68,0.25)"
    }
  };
  return <button className={n("inline-flex items-center gap-2 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed", r === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm", c)} style={d[t]}>{l && <l className={r === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />}{a}</button>;
}
function w({
  page: t,
  pageSize: l,
  total: r,
  onPageChange: a
}) {
  const c = Math.max(1, Math.ceil(r / l));
  return c <= 1 ? null : <div className="flex items-center justify-between px-5 py-3" style={{
    borderTop: `1px solid ${s.border}`
  }}>{<span className="text-xs" style={{
      color: s.textMuted
    }}>Página {t} de {c} ({r} total)</span>}{<div className="flex items-center gap-2">{<x variant="secondary" size="sm" onClick={() => a(t - 1)} disabled={t <= 1}>Anterior</x>}{<x variant="secondary" size="sm" onClick={() => a(t + 1)} disabled={t >= c}>Próxima</x>}</div>}</div>;
}
function S({
  children: t,
  className: l
}) {
  return <div className={n("flex flex-wrap items-center gap-2 p-3 rounded-xl", l)} style={{
    background: s.surface,
    border: `1px solid ${s.border}`
  }}>{t}</div>;
}
export { p as S, x as a, y as b, s as c, v as d, j as e, N as f, w as g, S as h };