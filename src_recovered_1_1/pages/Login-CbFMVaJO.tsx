/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Login-CbFMVaJO.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { u as I, r as o } from "@/components/vendor-Jm1Lk";
import { u as G, s as h, B as w, I as N } from "@/components/index-C9";
import { L as y } from "@/components/label";
import { t as x } from "@/components/error-messages";
import { L as E, E as q, i as U } from "@/components/ui";
import "@/lib/supabase";
function _() {
  const l = I(),
    {
      signIn: S,
      signInWithGoogle: L,
      session: f,
      loading: p
    } = G(),
    [g, P] = o.useState(""),
    [v, C] = o.useState(""),
    [c, k] = o.useState(!1),
    [d, j] = o.useState(!1),
    [m, n] = o.useState(!1),
    [b, a] = o.useState(""),
    u = async () => {
      const {
        data: {
          user: s
        }
      } = await h.auth.getUser();
      if (!s) {
        a("Não foi possível validar a sessão do usuário.");
        return;
      }
      const {
        data: t
      } = await h.from("profiles").select("role, tenant_id").eq("id", s.id).single();
      if (!(t != null && t.role)) {
        a("Seu usuário não possui perfil válido para acessar o sistema.");
        return;
      }
      if (t.role !== "client" && !t.tenant_id) {
        a("Seu usuário não está vinculado a nenhuma empresa.");
        return;
      }
      t.role === "client" ? l("/area-cliente") : t.role === "agent" ? l("/corretor-dashboard") : l("/");
    };
  o.useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("code");
    t && (n(!0), a(""), h.auth.exchangeCodeForSession(t).then(({
      error: r
    }) => {
      if (window.history.replaceState({}, document.title, window.location.pathname), r) {
        a(x(r));
        return;
      }
      return u();
    }).catch(r => {
      a((r == null ? void 0 : r.message) || "Erro ao validar login Google.");
    }).finally(() => n(!1)));
  }, []), o.useEffect(() => {
    const s = new URLSearchParams(window.location.search);
    p || !f || s.get("code") || (a(""), n(!0), u().finally(() => n(!1)));
  }, [p, f]);
  if (f && !p) return null;
  const B = async s => {
      s.preventDefault(), a(""), j(!0);
      const t = S(g.trim(), v.trim()),
        r = new Promise(i => setTimeout(() => i({
          error: new Error("Tempo limite excedido na resposta do servidor de autenticação. Por favor, tente novamente ou verifique se as chaves de API estão ativas no Supabase.")
        }), 1e4));
      try {
        const i = (await Promise.race([t, r]))?.error;
        i ? a(`${i.message} - ${x(i)}`) : await u();
      } catch (i) {
        a(i.message || "Erro inesperado.");
      } finally {
        j(!1);
      }
    },
    F = async () => {
      a(""), n(!0);
      const s = (await L())?.error;
      s && (a(x(s)), n(!1));
    };
  return <div className="min-h-screen bg-background flex">{<div className="hidden lg:block lg:w-1/2 relative overflow-hidden">{<img src="https://i.imgur.com/cUiF709.png" alt="Estate.ia Imobiliaria" className="absolute inset-0 w-full h-full object-cover" />}{<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />}</div>}{<div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">{<div className="w-full max-w-md">{<h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta</h2>}{<p className="text-muted-foreground mb-8">Entre com suas credenciais para acessar o sistema.</p>}{b && <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{b}</div>}{<w type="button" variant="outline" className="w-full h-11 gap-3 font-semibold" onClick={F} disabled={d || m}>{m ? <E className="h-4 w-4 animate-spin" /> : <z />}Entrar com Google</w>}{<div className="my-5 flex items-center gap-3">{<div className="h-px flex-1 bg-border" />}{<span className="text-xs text-muted-foreground">ou</span>}{<div className="h-px flex-1 bg-border" />}</div>}{<form onSubmit={B} className="space-y-5">{<div className="space-y-2">{<y htmlFor="email">Email</y>}{<N id="email" type="email" placeholder="seu@email.com" value={g} onChange={s => P(s.target.value)} required={!0} className="h-11" />}</div>}{<div className="space-y-2">{<div className="flex items-center justify-between">{<y htmlFor="password">Senha</y>}{<button type="button" className="text-xs text-accent hover:underline">Esqueceu a senha?</button>}</div>}{<div className="relative">{<N id="password" type={c ? "text" : "password"} placeholder="********" value={v} onChange={s => C(s.target.value)} required={!0} minLength={6} className="h-11" />}{<button type="button" onClick={() => k(!c)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{c ? <q className="h-4 w-4" /> : <U className="h-4 w-4" />}</button>}</div>}</div>}{<w type="submit" className="w-full h-11 text-base font-semibold" variant="cta" disabled={d || m}>{d && <E className="h-4 w-4 mr-2 animate-spin" />}Entrar</w>}</form>}{<div className="mt-8 text-center">{<p className="text-sm text-muted-foreground">O acesso é liberado apenas para usuários provisionados pela sua empresa.</p>}</div>}{<p className="mt-10 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Estate.ia. Todos os direitos reservados.</p>}</div>}</div>}</div>;
}
function z() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">{<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />}{<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z" />}{<path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />}{<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />}</svg>;
}
export { _ as default };