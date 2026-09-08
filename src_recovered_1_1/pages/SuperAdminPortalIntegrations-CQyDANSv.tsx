/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminPortalIntegrations-CQyDANSv.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r as v } from "@/components/vendor-Jm1Lk";
import { v as P, x as S, S as _ } from "@/components/SuperAdminLayout";
import { S as M, c as t, e as E, a as b } from "@/components/index";
import { b as D, S as L, I as z } from "@/components/index-C9";
import { L as $ } from "@/components/label";
import { D as T, a as F, b as U, c as O, d as X } from "@/components/ui/dialog";
import { a8 as R, bz as B, L as k, az as h, M as G, b4 as K, b3 as V, r as W, s as q, _ as H, aR as Z, E as J, i as Q, a5 as Y, au as ee } from "@/components/ui";
import "@/components/logo-estate";
import "@/lib/supabase";
import "@/components/index";
import "@/components/index";
const ae = [{
  key: "portal.viva_real",
  label: "Viva Real",
  description: "Integração com o portal Viva Real (Grupo OLX). Envie imóveis automaticamente.",
  icon: h,
  color: "#c8590a",
  bgColor: "rgba(200,89,10,0.12)",
  docsUrl: "https://www.vivareal.com.br/para-corretores/",
  fields: [{
    name: "api_key",
    label: "API Key",
    type: "password",
    placeholder: "vr_api_xxxxxxxx..."
  }, {
    name: "client_id",
    label: "Client ID",
    type: "text",
    placeholder: "ID do parceiro"
  }, {
    name: "endpoint",
    label: "Endpoint",
    type: "text",
    placeholder: "https://api.vivareal.com.br/v1"
  }]
}, {
  key: "portal.zap_imoveis",
  label: "ZAP Imóveis",
  description: "Integração com ZAP Imóveis (Grupo OLX). Sincronize seu catálogo.",
  icon: h,
  color: "#0a6ed2",
  bgColor: "rgba(10,110,210,0.12)",
  docsUrl: "https://www.zapimoveis.com.br/para-corretores/",
  fields: [{
    name: "api_key",
    label: "API Key",
    type: "password",
    placeholder: "zap_api_xxxxxxxx..."
  }, {
    name: "client_id",
    label: "Client ID",
    type: "text",
    placeholder: "ID do parceiro"
  }, {
    name: "endpoint",
    label: "Endpoint",
    type: "text",
    placeholder: "https://api.zapimoveis.com.br/v1"
  }]
}, {
  key: "portal.olx",
  label: "OLX Imóveis",
  description: "Publicação direta de imóveis na OLX via API oficial.",
  icon: h,
  color: "#6e0ad6",
  bgColor: "rgba(110,10,214,0.12)",
  docsUrl: "https://developers.olx.com.br/",
  fields: [{
    name: "api_key",
    label: "API Key",
    type: "password",
    placeholder: "olx_api_xxxxxxxx..."
  }, {
    name: "client_secret",
    label: "Client Secret",
    type: "password",
    placeholder: "secreto..."
  }, {
    name: "endpoint",
    label: "Endpoint",
    type: "text",
    placeholder: "https://api.olx.com.br/v2"
  }]
}, {
  key: "portal.facebook",
  label: "Facebook Marketplace",
  description: "Integração com Facebook Marketplace para anúncios de imóveis.",
  icon: h,
  color: "#1877f2",
  bgColor: "rgba(24,119,242,0.12)",
  docsUrl: "https://developers.facebook.com/docs/marketplace/",
  fields: [{
    name: "app_id",
    label: "App ID",
    type: "text",
    placeholder: "123456789..."
  }, {
    name: "app_secret",
    label: "App Secret",
    type: "password",
    placeholder: "secreto..."
  }, {
    name: "access_token",
    label: "Access Token",
    type: "password",
    placeholder: "EAAG..."
  }]
}, {
  key: "whatsapp.baileys",
  label: "WhatsApp (Baileys)",
  description: "Conexão WhatsApp via Baileys para atendimento multi-tenant. Configure o broker.",
  icon: G,
  color: "#25d366",
  bgColor: "rgba(37,211,102,0.12)",
  docsUrl: "https://github.com/WhiskeySockets/Baileys",
  fields: [{
    name: "broker_url",
    label: "Broker URL",
    type: "text",
    placeholder: "wss://seu-servidor.com/whatsapp"
  }, {
    name: "webhook_secret",
    label: "Webhook Secret",
    type: "password",
    placeholder: "whsec_..."
  }]
}, {
  key: "marketing.facebook",
  label: "Facebook Marketing",
  description: "API de publicação e anúncios no Facebook para as imobiliárias.",
  icon: K,
  color: "#1877f2",
  bgColor: "rgba(24,119,242,0.12)",
  docsUrl: "https://developers.facebook.com/docs/graph-api/",
  fields: [{
    name: "app_id",
    label: "App ID",
    type: "text",
    placeholder: "123456789..."
  }, {
    name: "app_secret",
    label: "App Secret",
    type: "password",
    placeholder: "secreto..."
  }, {
    name: "api_version",
    label: "Versão API",
    type: "text",
    placeholder: "v18.0"
  }]
}, {
  key: "marketing.instagram",
  label: "Instagram Marketing",
  description: "API do Instagram para publicação de conteúdo e análise de engajamento.",
  icon: V,
  color: "#e1306c",
  bgColor: "rgba(225,48,108,0.12)",
  docsUrl: "https://developers.facebook.com/docs/instagram-api/",
  fields: [{
    name: "access_token",
    label: "Access Token",
    type: "password",
    placeholder: "EAAG..."
  }, {
    name: "account_id",
    label: "Account ID",
    type: "text",
    placeholder: "178414..."
  }]
}];
function j(l, n) {
  const p = `${n}.`,
    i = {},
    s = l.find(c => c.key === `${n}.enabled`),
    x = (s == null ? void 0 : s.value) === !0 || (s == null ? void 0 : s.value) === "true";
  for (const c of l) c.key.startsWith(p) && (i[c.key.replace(p, "")] = String(c.value ?? ""));
  return {
    map: i,
    enabled: x
  };
}
function se(l, n) {
  return n.some(p => {
    var i;
    return !!((i = l[p.name]) != null && i.trim());
  });
}
function he() {
  const {
      toast: l
    } = D(),
    {
      data: n = [],
      isLoading: p
    } = P(),
    i = S(),
    [s, x] = v.useState(null),
    [c, u] = v.useState({}),
    [w, f] = v.useState({}),
    N = a => {
      x(a);
      const {
          map: o
        } = j(n, a.key),
        r = {};
      for (const d of a.fields) r[d.name] = o[d.name] || "";
      u(r);
    },
    y = () => {
      x(null), u({}), f({});
    },
    C = async () => {
      if (s) try {
        for (const [a, o] of Object.entries(c)) await i.mutateAsync({
          key: `${s.key}.${a}`,
          value: o
        });
        l({
          title: `${s.label} salvo`,
          description: "Configurações de API atualizadas."
        }), y();
      } catch (a) {
        l({
          title: "Erro ao salvar",
          description: (a == null ? void 0 : a.message) || "Tente novamente.",
          variant: "destructive"
        });
      }
    },
    A = async (a, o) => {
      try {
        await i.mutateAsync({
          key: `${a.key}.enabled`,
          value: o
        }), l({
          title: o ? `${a.label} ativado` : `${a.label} desativado`
        });
      } catch (r) {
        l({
          title: "Erro",
          description: r == null ? void 0 : r.message,
          variant: "destructive"
        });
      }
    },
    I = a => {
      navigator.clipboard.writeText(a), l({
        title: "Copiado para área de transferência"
      });
    };
  return <_>{<div className="space-y-6">{<M title="Integrações" description="Configure portais imobiliários, APIs de marketing e comunicação" icon={R} />}{<div className="flex items-start gap-3 p-4 rounded-xl" style={{
        background: "rgba(10,110,210,0.08)",
        border: "1px solid rgba(10,110,210,0.2)"
      }}>{<B className="w-5 h-5 shrink-0 mt-0.5" style={{
          color: "#0a6ed2"
        }} />}{<div>{<p className="text-sm font-medium" style={{
            color: t.textPrimary
          }}>XML Feed como alternativa imediata</p>}{<p className="text-xs mt-1" style={{
            color: t.textMuted
          }}>Enquanto aguarda credenciais de API, cada imobiliária pode baixar o XML Feed dos imóveis diretamente no painel de imóveis e enviar para o suporte dos portais. As credenciais aqui habilitarão a sincronização automática no futuro.</p>}</div>}</div>}{p ? <div className="py-12 text-center">{<k className="w-8 h-8 animate-spin mx-auto" style={{
          color: t.accent
        }} />}{<p className="text-sm mt-3" style={{
          color: t.textMuted
        }}>Carregando integrações...</p>}</div> : <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{ae.map(a => {
          const {
              map: o,
              enabled: r
            } = j(n, a.key),
            d = se(o, a.fields),
            m = a.icon;
          return <E>{<div className="flex items-start gap-4">{<div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{
                background: a.bgColor
              }}>{<m className="w-6 h-6" style={{
                  color: a.color
                }} />}</div>}{<div className="flex-1 min-w-0">{<div className="flex items-center gap-2 mb-1">{<h3 className="text-base font-semibold" style={{
                    color: t.textPrimary
                  }}>{a.label}</h3>}{d ? <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{<W className="w-3 h-3" />} Configurado</span> : <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/20">{<q className="w-3 h-3" />} Não configurado</span>}</div>}{<p className="text-xs leading-relaxed" style={{
                  color: t.textMuted
                }}>{a.description}</p>}{<div className="flex items-center justify-between mt-4 pt-3" style={{
                  borderTop: `1px solid ${t.borderSubtle}`
                }}>{<div className="flex items-center gap-2">{<L checked={r} onCheckedChange={g => A(a, g)} />}{<span className="text-xs" style={{
                      color: t.textMuted
                    }}>{r ? "Ativo" : "Inativo"}</span>}</div>}{<div className="flex items-center gap-2">{<b size="sm" variant="ghost" icon={H} onClick={() => window.open(a.docsUrl, "_blank")}>Docs</b>}{<b size="sm" icon={Z} onClick={() => N(a)}>Configurar</b>}</div>}</div>}</div>}</div>}</E>;
        })}</div>}</div>}{<T open={!!s} onOpenChange={a => !a && y()}>{<F className="max-w-md" style={{
        background: "#0f1829",
        border: "1px solid rgba(255,255,255,0.08)"
      }}>{s && <e.Fragment>{<U>{<div className="flex items-center gap-3">{<div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                background: s.bgColor
              }}>{<s.icon className="w-5 h-5" style={{
                  color: s.color
                }} />}</div>}{<div>{<O className="text-base" style={{
                  color: t.textPrimary
                }}>{s.label}</O>}{<X className="text-xs" style={{
                  color: t.textMuted
                }}>Cole as credenciais de API fornecidas pelo portal</X>}</div>}</div>}</U>}{<div className="space-y-4 mt-2">{s.fields.map(a => {
              const o = `${s.key}.${a.name}`,
                r = a.type === "password",
                d = w[o] || !1;
              return <div className="space-y-1.5">{<$ className="text-xs font-medium" style={{
                  color: t.textMuted
                }}>{a.label}</$>}{<div className="relative">{<z type={r && !d ? "password" : "text"} value={c[a.name] || ""} onChange={m => u(g => ({
                    ...g,
                    [a.name]: m.target.value
                  }))} placeholder={a.placeholder} className="h-10 pr-20 bg-transparent border-white/10 text-sm" style={{
                    color: t.textPrimary
                  }} />}{<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">{r && <button type="button" onClick={() => f(m => ({
                      ...m,
                      [o]: !m[o]
                    }))} className="p-1 rounded hover:bg-white/5" style={{
                      color: t.textMuted
                    }}>{d ? <J className="w-3.5 h-3.5" /> : <Q className="w-3.5 h-3.5" />}</button>}{c[a.name] && <button type="button" onClick={() => I(c[a.name])} className="p-1 rounded hover:bg-white/5" style={{
                      color: t.textMuted
                    }}>{<Y className="w-3.5 h-3.5" />}</button>}</div>}</div>}</div>;
            })}</div>}{<div className="flex items-center justify-between mt-6 pt-4" style={{
            borderTop: `1px solid ${t.borderSubtle}`
          }}>{<b size="sm" variant="ghost" onClick={y}>Cancelar</b>}{<b size="sm" icon={ee} onClick={C} disabled={i.isPending}>{i.isPending ? <e.Fragment>{<k className="w-3.5 h-3.5 animate-spin" />} Salvando...</e.Fragment> : "Salvar credenciais"}</b>}</div>}</e.Fragment>}</F>}</T>}</_>;
}
export { he as default };