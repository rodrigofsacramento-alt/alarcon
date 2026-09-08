/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminLogin-M8d6kXwW.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { u as w, r as t } from "@/components/vendor-Jm1Lk";
import { T as v, b as N } from "@/components/index-C9";
import { l as S } from "@/components/logo-estate";
import { t as k } from "@/components/error-messages";
import { aU as b, d as g, W as E, E as A, i as C } from "@/components/ui";
import "@/lib/supabase";
function I() {
  const n = w(),
    {
      signIn: p,
      isSuperAdmin: i,
      loading: d,
      adminCheckLoading: c
    } = v(),
    {
      toast: u
    } = N(),
    [r, h] = t.useState(""),
    [m, f] = t.useState(""),
    [l, j] = t.useState(!1),
    [x, o] = t.useState(!1);
  t.useEffect(() => {
    !d && !c && i && n("/super-admin", {
      replace: !0
    });
  }, [c, i, d, n]);
  const y = async s => {
    s.preventDefault(), o(!0), console.log("[SuperAdmin Login] Tentando login com:", r);
    try {
      const {
        error: a
      } = await p(r, m);
      if (console.log("[SuperAdmin Login] Resultado signIn:", {
        error: a
      }), a) {
        console.error("[SuperAdmin Login Error]", a), u({
          title: "Falha no login",
          description: k(a),
          variant: "destructive"
        }), o(!1);
        return;
      }
      console.log("[SuperAdmin Login] Login bem-sucedido, aguardando redirecionamento...");
    } catch (a) {
      console.error("[SuperAdmin Login] Exceção inesperada:", a), u({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar fazer login. Verifique o console.",
        variant: "destructive"
      }), o(!1);
    }
  };
  return <div className="min-h-screen flex items-center justify-center p-4" style={{
    background: "linear-gradient(135deg, #0f1829 0%, #1a2744 50%, #0f1829 100%)"
  }}>{<div className="absolute inset-0 overflow-hidden pointer-events-none">{<div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl" style={{
        background: "radial-gradient(circle, rgba(200,89,10,0.08) 0%, transparent 70%)"
      }} />}{<div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{
        background: "radial-gradient(circle, rgba(30,45,94,0.4) 0%, transparent 70%)"
      }} />}</div>}{<div className="relative w-full max-w-md">{<div className="text-center mb-8">{<img src={S} alt="Estate.ia" className="h-16 mx-auto mb-5" />}{<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium" style={{
          borderColor: "rgba(200,89,10,0.4)",
          background: "rgba(200,89,10,0.08)",
          color: "#e07a3a"
        }}>{<b className="w-3 h-3" />}Painel de Controle Global</div>}</div>}{<div className="rounded-2xl p-8 shadow-2xl backdrop-blur" style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)"
      }}>{<div className="flex items-center gap-2 mb-6 p-3 rounded-lg" style={{
          background: "rgba(200,89,10,0.08)",
          border: "1px solid rgba(200,89,10,0.2)"
        }}>{<g className="w-4 h-4 shrink-0" style={{
            color: "#e07a3a"
          }} />}{<p className="text-xs" style={{
            color: "#e07a3a"
          }}>Acesso restrito a administradores globais</p>}</div>}{<form onSubmit={y} className="space-y-5">{<div>{<label className="block text-sm font-medium text-slate-300 mb-2">Email</label>}{<div className="relative">{<E className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}{<input type="email" value={r} onChange={s => h(s.target.value)} required={!0} placeholder="admin@estate.ia" className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm" style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                outline: "none"
              }} onFocus={s => s.currentTarget.style.borderColor = "rgba(200,89,10,0.6)"} onBlur={s => s.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />}</div>}</div>}{<div>{<label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>}{<div className="relative">{<g className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}{<input type={l ? "text" : "password"} value={m} onChange={s => f(s.target.value)} required={!0} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm" style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)"
              }} onFocus={s => s.currentTarget.style.borderColor = "rgba(200,89,10,0.6)"} onBlur={s => s.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />}{<button type="button" onClick={() => j(!l)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">{l ? <A className="w-4 h-4" /> : <C className="w-4 h-4" />}</button>}</div>}</div>}{<button type="submit" disabled={x} className="w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm" style={{
            background: "linear-gradient(135deg, #c8590a, #e07a3a)",
            boxShadow: "0 4px 20px rgba(200,89,10,0.3)"
          }}>{x ? <e.Fragment>{<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />} Entrando...</e.Fragment> : <e.Fragment>{<b className="w-4 h-4" />} Acessar Painel</e.Fragment>}</button>}</form>}</div>}{<p className="text-center text-xs mt-6" style={{
        color: "rgba(255,255,255,0.2)"
      }}>Estate.ia © {new Date().getFullYear()} · Todos os direitos reservados</p>}</div>}</div>;
}
export { I as default };