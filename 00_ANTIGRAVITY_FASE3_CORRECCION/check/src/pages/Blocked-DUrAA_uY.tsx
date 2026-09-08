/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Blocked-DUrAA_uY.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r } from "@/components/vendor-Jm1Lk";
import { u as f, B as n, s as h, t as g } from "@/components/index-C9";
import { aZ as b, L as j, aI as v, W as w, aQ as N } from "@/components/ui";
import "@/lib/supabase";
function B() {
  const {
      signOut: d,
      user: o
    } = f(),
    [a, i] = r.useState(null),
    [l, u] = r.useState(!0);
  r.useEffect(() => {
    if (!o) return;
    async function t() {
      try {
        const {
          data: s,
          error: c
        } = await h.rpc("get_latest_pending_invoice");
        if (c) throw c;
        s && s.length > 0 && i(s[0]);
      } catch (s) {
        console.error("Erro ao buscar fatura pendente:", s);
      } finally {
        u(!1);
      }
    }
    t();
  }, [o]);
  const x = async () => {
      try {
        await d(), window.location.href = "/login";
      } catch (t) {
        g({
          title: "Erro ao sair",
          description: t.message || "Tente novamente.",
          variant: "destructive"
        });
      }
    },
    m = t => (t / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    }),
    p = t => new Date(t + "T00:00:00").toLocaleDateString("pt-BR");
  return <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden"><div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" /><div className="w-full max-w-md bg-card border border-border shadow-xl rounded-2xl p-8 space-y-6 relative z-10 backdrop-blur-sm"><div className="flex justify-center"><div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-pulse-accent"><b className="h-8 w-8" /></div></div><div className="text-center space-y-2"><h1 className="text-2xl font-bold text-foreground tracking-tight">Acesso Suspenso</h1><p className="text-sm text-muted-foreground leading-relaxed">O período de testes (trial) ou a assinatura da sua imobiliária expirou. Para restabelecer o acesso aos painéis, leads e integração de WhatsApp, regularize sua conta.</p></div>{l ? <div className="flex items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50"><j className="h-5 w-5 animate-spin text-accent mr-2" /><span className="text-xs text-muted-foreground">Buscando informações de faturamento...</span></div> : a ? <div className="p-4 bg-muted/40 rounded-xl border border-border/60 space-y-3"><div className="flex justify-between items-center text-xs text-muted-foreground"><span>Fatura pendente:</span><span className="font-semibold text-foreground">{m(a.value_cents)}</span></div>{a.due_date && <div className="flex justify-between items-center text-xs text-muted-foreground"><span>Vencimento:</span><span className="font-semibold text-foreground">{p(a.due_date)}</span></div>}<n variant="cta" className="w-full gap-2 shadow-accent" onClick={() => window.open(a.invoice_url, "_blank")}><v className="h-4 w-4" />Pagar Fatura no Asaas</n></div> : <div className="p-4 bg-muted/20 rounded-xl border border-border/40 text-center"><p className="text-xs text-muted-foreground">Nenhuma fatura automática pendente encontrada. Entre em contato com nossa equipe para gerar a cobrança.</p></div>}<div className="space-y-3 pt-2"><n variant="outline" className="w-full gap-2" onClick={() => window.open("mailto:suporte@bardendev.com", "_blank")}><w className="h-4 w-4 text-muted-foreground" />Contatar Suporte</n><n variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground" onClick={x}><N className="h-4 w-4" />Sair da Conta</n></div></div><p className="mt-8 text-xs text-muted-foreground opacity-60">ApeXfy SaaS © {new Date().getFullYear()} — Todos os direitos reservados.</p></div>;
}
export { B as default };