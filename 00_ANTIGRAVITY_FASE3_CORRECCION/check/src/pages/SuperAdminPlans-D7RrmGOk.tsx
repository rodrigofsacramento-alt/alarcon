/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminPlans-D7RrmGOk.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r as d } from "@/components/vendor-Jm1Lk";
import { e as w, n as P, o as k, S as C } from "@/components/SuperAdminLayout";
import { b as S } from "@/components/index-C9";
import { t as u } from "@/components/error-messages";
import { z as A, L as p, as as E, b2 as F, aX as I, aY as L, U as M, l as R, k as $, a0 as z, X as B } from "@/components/ui";
import "@/components/logo-estate";
import "@/lib/supabase";
const h = c => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0
  }).format(c),
  g = {
    name: "",
    description: "",
    price_monthly: "",
    price_yearly: "",
    max_agents: "5",
    max_properties: "50",
    max_leads: "200",
    features: "",
    is_active: !0,
    is_popular: !1
  };
function J() {
  const {
      data: c = [],
      isLoading: b
    } = w(),
    x = P(),
    n = k(),
    {
      toast: i
    } = S(),
    [v, r] = d.useState(!1),
    [o, m] = d.useState(null),
    [a, l] = d.useState(g),
    f = () => {
      m(null), l(g), r(!0);
    },
    j = s => {
      m(s), l({
        name: s.name,
        description: s.description ?? "",
        price_monthly: String(s.price_monthly),
        price_yearly: String(s.price_yearly),
        max_agents: String(s.max_agents),
        max_properties: String(s.max_properties),
        max_leads: String(s.max_leads),
        features: Array.isArray(s.features) ? s.features.join(`
`) : "",
        is_active: s.is_active,
        is_popular: s.is_popular
      }), r(!0);
    },
    N = async () => {
      if (!a.name || !a.price_monthly) {
        i({
          title: "Preencha nome e preço mensal",
          variant: "destructive"
        });
        return;
      }
      const s = {
        name: a.name,
        description: a.description || null,
        price_monthly: parseFloat(a.price_monthly),
        price_yearly: parseFloat(a.price_yearly) || 0,
        max_agents: parseInt(a.max_agents) || 5,
        max_properties: parseInt(a.max_properties) || 50,
        max_leads: parseInt(a.max_leads) || 200,
        features: a.features.split(`
`).map(t => t.trim()).filter(Boolean),
        is_active: a.is_active,
        is_popular: a.is_popular
      };
      try {
        o ? (await n.mutateAsync({
          id: o.id,
          ...s
        }), i({
          title: "Plano atualizado com sucesso"
        })) : (await x.mutateAsync(s), i({
          title: "Plano criado com sucesso"
        })), r(!1);
      } catch (t) {
        i({
          title: "Erro ao salvar plano",
          description: u(t),
          variant: "destructive"
        });
      }
    },
    y = async s => {
      try {
        await n.mutateAsync({
          id: s.id,
          is_active: !s.is_active
        }), i({
          title: `Plano ${s.is_active ? "desativado" : "ativado"}`
        });
      } catch (t) {
        i({
          title: "Erro ao alterar status do plano",
          description: u(t),
          variant: "destructive"
        });
      }
    };
  return <C><div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-white">Planos</h1><p className="text-slate-400 text-sm mt-1">Gerencie os planos de assinatura do SaaS</p></div><button onClick={f} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-600/20"><A className="w-4 h-4" /> Novo Plano</button></div>{b ? <div className="flex items-center justify-center py-20"><p className="w-6 h-6 text-violet-400 animate-spin" /></div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{c.map(s => <div className={`relative bg-slate-900/60 border rounded-2xl overflow-hidden transition-all ${s.is_popular ? "border-violet-500/40 shadow-lg shadow-violet-500/10" : "border-slate-700/50"} ${s.is_active ? "" : "opacity-60"}`}>{s.is_popular && <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-violet-500 via-violet-400 to-violet-500" />}<div className="p-5"><div className="flex items-start justify-between mb-4"><div><div className="flex items-center gap-2 mb-1"><h3 className="text-base font-bold text-white">{s.name}</h3>{s.is_popular && <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-600/20 border border-violet-500/30 rounded-full text-xs text-violet-300 font-medium"><E className="w-2.5 h-2.5" /> Popular</span>}{!s.is_active && <span className="px-2 py-0.5 bg-slate-700/50 rounded-full text-xs text-slate-400">Inativo</span>}</div><p className="text-slate-400 text-xs">{s.description}</p></div><div className="flex items-center gap-1"><button onClick={() => j(s)} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"><F className="w-3.5 h-3.5" /></button><button onClick={() => y(s)} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">{s.is_active ? <I className="w-4 h-4 text-emerald-400" /> : <L className="w-4 h-4" />}</button></div></div><div className="flex items-baseline gap-1 mb-4"><span className="text-3xl font-bold text-white">{h(s.price_monthly)}</span><span className="text-slate-400 text-sm">/mês</span></div><div className="grid grid-cols-3 gap-2 mb-4"><div className="bg-slate-800/60 rounded-lg p-2 text-center"><M className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" /><p className="text-white text-xs font-semibold">{s.max_agents >= 999 ? "∞" : s.max_agents}</p><p className="text-slate-500 text-[10px]">Corretores</p></div><div className="bg-slate-800/60 rounded-lg p-2 text-center"><R className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" /><p className="text-white text-xs font-semibold">{s.max_properties >= 9999 ? "∞" : s.max_properties}</p><p className="text-slate-500 text-[10px]">Imóveis</p></div><div className="bg-slate-800/60 rounded-lg p-2 text-center"><$ className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" /><p className="text-white text-xs font-semibold">{s.max_leads >= 9999 ? "∞" : s.max_leads}</p><p className="text-slate-500 text-[10px]">Leads</p></div></div>{Array.isArray(s.features) && s.features.length > 0 && <ul className="space-y-1.5">{s.features.slice(0, 5).map((t, _) => <li className="flex items-center gap-2 text-xs text-slate-300"><z className="w-3 h-3 text-emerald-400 shrink-0" />{t}</li>)}</ul>}<div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500"><span>Anual: {h(s.price_yearly)}</span><span>{s.price_yearly > 0 ? `${Math.round((1 - s.price_yearly / (s.price_monthly * 12)) * 100)}% off` : ""}</span></div></div></div>)}</div>}</div>{v && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => r(!1)} /><div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 sticky top-0 bg-slate-900 z-10"><h2 className="text-base font-semibold text-white">{o ? "Editar Plano" : "Novo Plano"}</h2><button onClick={() => r(!1)} className="text-slate-400 hover:text-white transition-colors"><B className="w-5 h-5" /></button></div><div className="p-6 space-y-4"><div><label className="block text-xs font-medium text-slate-400 mb-1.5">Nome do Plano *</label><input value={a.name} onChange={s => l(t => ({
              ...t,
              name: s.target.value
            }))} className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" placeholder="Ex: Professional" /></div><div><label className="block text-xs font-medium text-slate-400 mb-1.5">Descrição</label><input value={a.description} onChange={s => l(t => ({
              ...t,
              description: s.target.value
            }))} className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" placeholder="Ideal para corretoras em crescimento" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-medium text-slate-400 mb-1.5">Preço Mensal (R$) *</label><input value={a.price_monthly} onChange={s => l(t => ({
                ...t,
                price_monthly: s.target.value
              }))} type="number" className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" placeholder="397" /></div><div><label className="block text-xs font-medium text-slate-400 mb-1.5">Preço Anual (R$)</label><input value={a.price_yearly} onChange={s => l(t => ({
                ...t,
                price_yearly: s.target.value
              }))} type="number" className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" placeholder="3970" /></div><div><label className="block text-xs font-medium text-slate-400 mb-1.5">Máx. Corretores</label><input value={a.max_agents} onChange={s => l(t => ({
                ...t,
                max_agents: s.target.value
              }))} type="number" className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" /></div><div><label className="block text-xs font-medium text-slate-400 mb-1.5">Máx. Imóveis</label><input value={a.max_properties} onChange={s => l(t => ({
                ...t,
                max_properties: s.target.value
              }))} type="number" className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" /></div><div><label className="block text-xs font-medium text-slate-400 mb-1.5">Máx. Leads/mês</label><input value={a.max_leads} onChange={s => l(t => ({
                ...t,
                max_leads: s.target.value
              }))} type="number" className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" /></div></div><div><label className="block text-xs font-medium text-slate-400 mb-1.5">Funcionalidades (uma por linha)</label><textarea value={a.features} onChange={s => l(t => ({
              ...t,
              features: s.target.value
            }))} rows={4} className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none" placeholder={`Até 10 corretores
Relatórios avançados
Exportação PDF/Excel`} /></div><div className="flex items-center gap-6"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={a.is_active} onChange={s => l(t => ({
                ...t,
                is_active: s.target.checked
              }))} className="w-4 h-4 accent-violet-500" /><span className="text-sm text-slate-300">Plano ativo</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={a.is_popular} onChange={s => l(t => ({
                ...t,
                is_popular: s.target.checked
              }))} className="w-4 h-4 accent-violet-500" /><span className="text-sm text-slate-300">Marcar como popular</span></label></div><div className="flex gap-3 pt-2"><button onClick={() => r(!1)} className="flex-1 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-all">Cancelar</button><button onClick={N} disabled={x.isPending || n.isPending} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">{(x.isPending || n.isPending) && <p className="w-4 h-4 animate-spin" />}{o ? "Salvar" : "Criar plano"}</button></div></div></div></div>}</C>;
}
export { J as default };