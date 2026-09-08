/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminAudit-Bfj5c5Ah.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r as i } from "@/components/vendor-Jm1Lk";
import { t as N, S as v } from "@/components/SuperAdminLayout";
import { g } from "@/components/index";
import { S as w, L as y, bm as x, G as C, l as S, u as L, b5 as _ } from "@/components/ui";
import { p as A } from "@/components/pt-BR";
import "@/components/index-C9";
import "@/lib/supabase";
import "@/components/logo-estate";
const k = {
  tenant: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  plan: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  user: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  lead: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  proposal: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  property: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  auth: "text-red-400 bg-red-500/10 border-red-500/20"
};
function q() {
  const [r, p] = i.useState(""),
    [l, u] = i.useState("all"),
    [c, h] = i.useState(1),
    n = 50,
    {
      data: t,
      isLoading: f
    } = N(c, n),
    d = (t == null ? void 0 : t.data) ?? [],
    b = (t == null ? void 0 : t.count) ?? 0,
    m = d.filter(s => {
      const o = !r || s.action.toLowerCase().includes(r.toLowerCase()) || (s.user_email ?? "").toLowerCase().includes(r.toLowerCase()) || (s.description ?? "").toLowerCase().includes(r.toLowerCase()),
        a = l === "all" || s.resource_type === l;
      return o && a;
    }),
    j = [...new Set(d.map(s => s.resource_type))];
  return <v><div className="space-y-6"><div><h1 className="text-2xl font-bold text-white">Auditoria</h1><p className="text-slate-400 text-sm mt-1">Log completo de ações realizadas no sistema</p></div><div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><w className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input value={r} onChange={s => p(s.target.value)} placeholder="Buscar por ação, usuário ou descrição..." className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all" /></div><select value={l} onChange={s => u(s.target.value)} className="px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"><option value="all">Todos os recursos</option>{j.map(s => <option value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div><div className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden">{f ? <div className="flex items-center justify-center py-20"><y className="w-6 h-6 text-violet-400 animate-spin" /></div> : m.length === 0 ? <div className="text-center py-20 text-slate-500"><x className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Nenhum log encontrado</p><p className="text-xs mt-1">As ações do sistema aparecerão aqui conforme ocorrem</p></div> : <div className="divide-y divide-slate-700/30">{m.map(s => {
            const o = k[s.resource_type] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20",
              a = s.tenant;
            return <div className="flex items-start gap-4 px-5 py-4 hover:bg-slate-800/20 transition-colors"><div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center shrink-0 mt-0.5"><x className="w-3.5 h-3.5 text-slate-500" /></div><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2 mb-1"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${o}`}>{s.resource_type}</span><span className="text-sm font-medium text-white">{s.action}</span></div>{s.description && <p className="text-xs text-slate-400 mb-1.5">{s.description}</p>}<div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">{s.user_email && <span className="flex items-center gap-1"><C className="w-3 h-3" />{s.user_email}</span>}{(a == null ? void 0 : a.name) && <span className="flex items-center gap-1"><S className="w-3 h-3" />{a.name}</span>}{s.ip_address && <span className="text-slate-600">{s.ip_address}</span>}</div></div><div className="shrink-0 flex items-center gap-1 text-xs text-slate-600"><L className="w-3 h-3" />{s.created_at ? _(new Date(s.created_at), "dd/MM/yy HH:mm", {
                  locale: A
                }) : "—"}</div></div>;
          })}</div>}<g page={c} pageSize={n} total={b} onPageChange={h} /></div></div></v>;
}
export { q as default };