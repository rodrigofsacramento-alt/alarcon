/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminSettings-x4q1Lfty.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r as S } from "@/components/vendor-Jm1Lk";
import { v as y, w as N, x as A, S as C } from "@/components/SuperAdminLayout";
import { S as w, e as x, c as a, a as E, d as _, f as h } from "@/components/index";
import { b as P, S as M, I as L } from "@/components/index-C9";
import { L as T } from "@/components/label";
import { t as k } from "@/components/error-messages";
import { aa as I, aY as B, m as D, W as $, az as G, au as z, bk as g, r as O, s as V } from "@/components/ui";
import "@/components/logo-estate";
import "@/lib/supabase";
const q = {
  "saas.name": {
    label: "Nome do produto",
    description: "Nome exibido no sistema",
    type: "string",
    icon: G
  },
  "saas.support_email": {
    label: "Email de suporte",
    description: "Para contato dos tenants",
    type: "string",
    icon: $
  },
  "saas.trial_days": {
    label: "Dias de trial",
    description: "Período de avaliação padrão",
    type: "number",
    icon: D
  },
  "saas.allow_signup": {
    label: "Cadastro público",
    description: "Permite signup sem provisionamento",
    type: "boolean",
    icon: B
  }
};
function Z() {
  const {
      toast: d
    } = P(),
    {
      data: b = [],
      isLoading: f
    } = y(),
    {
      data: i = []
    } = N(),
    m = A(),
    [n, u] = S.useState({}),
    v = s => {
      if (s in n) return n[s];
      const t = b.find(r => r.key === s);
      return t == null ? void 0 : t.value;
    },
    p = (s, t) => {
      u(r => ({
        ...r,
        [s]: t
      }));
    },
    j = async s => {
      const t = n[s];
      if (t !== void 0) try {
        await m.mutateAsync({
          key: s,
          value: t
        }), d({
          title: "Configuração salva"
        }), u(r => {
          const {
            [s]: c,
            ...l
          } = r;
          return l;
        });
      } catch (r) {
        d({
          title: "Erro ao salvar",
          description: k(r),
          variant: "destructive"
        });
      }
    };
  return <C><div className="space-y-6"><w title="Configurações" description="Parâmetros globais do SaaS e gestão dos super admins" icon={I} /><x title="Configurações Gerais" description="Ajustes que afetam todo o sistema">{f ? <div className="py-8 text-center text-sm" style={{
          color: a.textMuted
        }}>Carregando...</div> : <div className="space-y-4">{Object.entries(q).map(([s, t]) => {
            const r = t.icon,
              c = v(s),
              l = s in n;
            return <div className="flex items-center gap-4 p-4 rounded-xl" style={{
              background: a.surfaceElevated,
              border: `1px solid ${a.borderSubtle}`
            }}><div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{
                background: a.accentBg
              }}><r className="w-4 h-4" style={{
                  color: a.accent
                }} /></div><div className="flex-1 min-w-0"><T className="text-sm font-medium" style={{
                  color: a.textPrimary
                }}>{t.label}</T><p className="text-xs" style={{
                  color: a.textMuted
                }}>{t.description}</p></div><div className="flex items-center gap-2">{t.type === "boolean" ? <M checked={!!c} onCheckedChange={o => p(s, o)} /> : <L type={t.type === "number" ? "number" : "text"} value={String(c ?? "")} onChange={o => p(s, t.type === "number" ? Number(o.target.value) : o.target.value)} className="w-48 h-9 bg-transparent border-white/10 text-white" />}{l && <E size="sm" icon={z} onClick={() => j(s)} disabled={m.isPending}>Salvar</E>}</div></div>;
          })}</div>}</x><x title="Super Administradores" description={`${i.length} usuário${i.length === 1 ? "" : "s"} com acesso global`}>{i.length === 0 ? <_ icon={g} title="Nenhum super admin" description="Adicione via banco de dados na tabela super_admins" /> : <div className="space-y-2">{i.map(s => <div className="flex items-center gap-3 p-3 rounded-xl" style={{
            background: a.surfaceElevated,
            border: `1px solid ${a.borderSubtle}`
          }}><div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{
              background: a.accentBg
            }}><g className="w-4 h-4" style={{
                color: a.accent
              }} /></div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{
                color: a.textPrimary
              }}>{s.full_name || s.email}</p><p className="text-xs truncate" style={{
                color: a.textMuted
              }}>{s.email}</p></div>{s.is_active ? <h tone="success" icon={O}>Ativo</h> : <h tone="danger" icon={V}>Inativo</h>}</div>)}</div>}<p className="mt-4 text-xs" style={{
          color: a.textMuted
        }}>Para adicionar um novo super admin, insira o usuário na tabela <code className="px-1 py-0.5 rounded" style={{
            background: a.surfaceElevated
          }}>super_admins</code> via Supabase.</p></x></div></C>;
}
export { Z as default };