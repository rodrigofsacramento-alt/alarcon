/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Configuracoes-ByCOskG1.js | AST | sanitizado | Fase 3 ==*/
import { a as te, u as V, b as J, j as e } from "@/components/query";
import { r as i } from "@/components/vendor-Jm1Lk";
import { u as K, s as C, t as l, c as _, B as b } from "@/components/index-C9";
import { S as re, M as ne, H as le } from "@/components/Header";
import { B as v } from "@/components/ui/badge";
import { A as oe } from "@/components/AvatarUpload";
import { G as z, W as de, P as q, L as j, au as E, l as F, F as ie, y as ce, az as me, a8 as H, aS as ue, aT as xe, aU as G, r as he, aV as ge, v as O, b as I, d as D, aW as Q, aX as pe, aY as fe } from "@/components/ui";
import "@/lib/supabase";
import "@/components/logo-estate";
import "@/components/index";
import "@/components/index";
const L = ["tenant-google-workspace"];
function be() {
  const {
      profile: n
    } = K(),
    h = (n == null ? void 0 : n.role) === "admin" || (n == null ? void 0 : n.role) === "manager";
  return te({
    queryKey: L,
    enabled: !!(n != null && n.tenant_id) && h,
    queryFn: async () => {
      const {
        data: c,
        error: m
      } = await C.from("tenant_google_workspace_status").select("*").limit(1).maybeSingle();
      if (m) throw m;
      return c ?? null;
    }
  });
}
function je() {
  const n = V();
  return J({
    mutationFn: async () => {
      const {
        data: h,
        error: c
      } = await C.functions.invoke("google-workspace-oauth", {
        body: {
          action: "start"
        }
      });
      if (c) throw c;
      const m = h;
      if (!m.auth_url) throw new Error("Google OAuth URL não retornada.");
      return window.location.href = m.auth_url, m;
    },
    onSuccess: () => {
      n.invalidateQueries({
        queryKey: L
      });
    }
  });
}
function ve() {
  const n = V();
  return J({
    mutationFn: async () => {
      const {
        data: h,
        error: c
      } = await C.rpc("disconnect_tenant_google_workspace");
      if (c) throw c;
      return h;
    },
    onSuccess: () => {
      n.invalidateQueries({
        queryKey: L
      });
    }
  });
}
function Te() {
  const [n, h] = i.useState(!1),
    [c, m] = i.useState(!1),
    [g, R] = i.useState("perfil"),
    [o, d] = i.useState(!1),
    {
      profile: r
    } = K(),
    {
      data: t,
      isLoading: U
    } = be(),
    M = je(),
    T = ve();
  i.useEffect(() => {
    const s = new URLSearchParams(window.location.search),
      a = s.get("tab"),
      P = s.get("google");
    a === "integracoes" && R("integracoes"), P === "connected" && (l({
      title: "Google conectado",
      description: "Calendar e Drive da imobiliária foram autorizados."
    }), window.history.replaceState({}, document.title, "/configuracoes?tab=integracoes")), P === "error" && (l({
      title: "Erro no Google",
      description: s.get("reason") || "Não foi possível concluir a conexão.",
      variant: "destructive"
    }), window.history.replaceState({}, document.title, "/configuracoes?tab=integracoes"));
  }, []);
  const [N, B] = i.useState({
      full_name: (r == null ? void 0 : r.full_name) || "",
      email: (r == null ? void 0 : r.email) || "",
      phone: (r == null ? void 0 : r.phone) || ""
    }),
    [w, y] = i.useState({
      name: "Estate.ia Imobiliária",
      cnpj: "12.345.678/0001-90",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      website: "https://estate.ia",
      phone: "(11) 3000-0000"
    }),
    [p, f] = i.useState({
      email_new_lead: !0,
      email_new_proposal: !0,
      email_visit_reminder: !0,
      push_messages: !0,
      push_updates: !1,
      daily_report: !0,
      weekly_report: !0
    }),
    [x, S] = i.useState({
      current_password: "",
      new_password: "",
      confirm_password: ""
    }),
    [k, A] = i.useState({
      theme: "dark",
      compact_sidebar: !1,
      show_badges: !0
    }),
    X = async () => {
      if (r) {
        d(!0);
        try {
          const {
            error: s
          } = await C.from("profiles").update({
            full_name: N.full_name,
            phone: N.phone || null
          }).eq("id", r.id);
          if (s) throw s;
          l({
            title: "Perfil atualizado!",
            description: "Suas informações foram salvas com sucesso."
          });
        } catch (s) {
          l({
            title: "Erro",
            description: (s == null ? void 0 : s.message) || "Erro ao salvar perfil.",
            variant: "destructive"
          });
        } finally {
          d(!1);
        }
      }
    },
    Y = async () => {
      d(!0), await new Promise(s => setTimeout(s, 500)), l({
        title: "Dados da empresa salvos!",
        description: "As informações da empresa foram atualizadas."
      }), d(!1);
    },
    Z = async () => {
      d(!0), await new Promise(s => setTimeout(s, 500)), l({
        title: "Notificações atualizadas!",
        description: "Suas preferências de notificação foram salvas."
      }), d(!1);
    },
    $ = async () => {
      try {
        await M.mutateAsync();
      } catch (s) {
        l({
          title: "Erro",
          description: (s == null ? void 0 : s.message) || "Erro ao preparar Google.",
          variant: "destructive"
        });
      }
    },
    W = async () => {
      try {
        await T.mutateAsync(), l({
          title: "Google desconectado",
          description: "A conexão Google da imobiliária foi desativada."
        });
      } catch (s) {
        l({
          title: "Erro",
          description: (s == null ? void 0 : s.message) || "Erro ao desconectar Google.",
          variant: "destructive"
        });
      }
    },
    ee = async () => {
      if (x.new_password !== x.confirm_password) {
        l({
          title: "Erro",
          description: "As senhas não coincidem.",
          variant: "destructive"
        });
        return;
      }
      if (x.new_password.length < 6) {
        l({
          title: "Erro",
          description: "A nova senha deve ter no mínimo 6 caracteres.",
          variant: "destructive"
        });
        return;
      }
      d(!0);
      try {
        const {
          error: s
        } = await C.auth.updateUser({
          password: x.new_password
        });
        if (s) throw s;
        l({
          title: "Senha alterada!",
          description: "Sua senha foi atualizada com sucesso."
        }), S({
          current_password: "",
          new_password: "",
          confirm_password: ""
        });
      } catch (s) {
        l({
          title: "Erro",
          description: (s == null ? void 0 : s.message) || "Erro ao alterar senha.",
          variant: "destructive"
        });
      } finally {
        d(!1);
      }
    },
    se = async () => {
      d(!0), await new Promise(s => setTimeout(s, 500)), l({
        title: "Aparência atualizada!",
        description: "Suas preferências visuais foram salvas."
      }), d(!1);
    },
    ae = [{
      id: "perfil",
      label: "Meu Perfil",
      icon: <z className="h-4 w-4" />
    }, {
      id: "empresa",
      label: "Empresa",
      icon: <F className="h-4 w-4" />
    }, {
      id: "integracoes",
      label: "Integrações",
      icon: <H className="h-4 w-4" />
    }, {
      id: "notificacoes",
      label: "Notificações",
      icon: <I className="h-4 w-4" />
    }, {
      id: "seguranca",
      label: "Segurança",
      icon: <G className="h-4 w-4" />
    }, {
      id: "aparencia",
      label: "Aparência",
      icon: <Q className="h-4 w-4" />
    }],
    u = ({
      checked: s,
      onChange: a,
      label: P
    }) => <div className="flex items-center justify-between py-3"><span className="text-sm text-foreground">{P}</span><button onClick={() => a(!s)} className="text-accent">{s ? <pe className="h-6 w-6" /> : <fe className="h-6 w-6 text-muted-foreground" />}</button></div>;
  return <div className="min-h-screen bg-background"><re activeModule="settings" onModuleChange={() => {}} collapsed={n} onCollapsedChange={h} /><ne activeModule="settings" onModuleChange={() => {}} open={c} onOpenChange={m} /><div className={_("transition-all duration-300", n ? "lg:pl-[72px]" : "lg:pl-64")}><le title="Configurações" subtitle="Gerencie as configurações do sistema" onMobileMenuClick={() => m(!0)} /><main className="p-4 lg:p-6"><div className="grid grid-cols-1 lg:grid-cols-4 gap-6"><div className="lg:col-span-1"><div className="bg-card rounded-xl shadow-sm p-2">{ae.map(s => <button onClick={() => R(s.id)} className={_("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", g === s.id ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>{s.icon}{s.label}</button>)}</div></div><div className="lg:col-span-3">{g === "perfil" && <div className="bg-card rounded-xl shadow-sm p-6"><div className="flex items-center gap-3 mb-6"><z className="h-5 w-5 text-accent" /><h2 className="text-lg font-semibold text-foreground">Meu Perfil</h2></div><div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-muted/30">{r && <oe profileId={r.id} currentAvatarUrl={(r == null ? void 0 : r.avatar_url) || null} fullName={r.full_name || "U"} size="lg" />}<div><p className="font-semibold text-foreground">{(r == null ? void 0 : r.full_name) || "Usuário"}</p><v className="mt-1">{(r == null ? void 0 : r.role) === "admin" ? "Administrador" : (r == null ? void 0 : r.role) === "manager" ? "Gestor" : "Corretor"}</v><p className="text-xs text-muted-foreground mt-1">Clique na câmera para alterar a foto</p></div></div><div className="space-y-4"><div><label className="text-sm font-medium text-foreground mb-1.5 block">Nome Completo</label><div className="relative"><z className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" value={N.full_name} onChange={s => B(a => ({
                      ...a,
                      full_name: s.target.value
                    }))} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div></div><div><label className="text-sm font-medium text-foreground mb-1.5 block">Email</label><div className="relative"><de className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="email" value={N.email} disabled={!0} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground cursor-not-allowed" /></div><p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado.</p></div><div><label className="text-sm font-medium text-foreground mb-1.5 block">Telefone</label><div className="relative"><q className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="tel" value={N.phone} onChange={s => B(a => ({
                      ...a,
                      phone: s.target.value
                    }))} placeholder="(11) 99999-0000" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div></div></div><div className="flex justify-end mt-6"><b variant="cta" className="gap-2" onClick={X} disabled={o}>{o ? <j className="h-4 w-4 animate-spin" /> : <E className="h-4 w-4" />}Salvar Alterações</b></div></div>}{g === "empresa" && <div className="bg-card rounded-xl shadow-sm p-6"><div className="flex items-center gap-3 mb-6"><F className="h-5 w-5 text-accent" /><h2 className="text-lg font-semibold text-foreground">Dados da Empresa</h2></div><div className="space-y-4"><div><label className="text-sm font-medium text-foreground mb-1.5 block">Nome da Empresa</label><div className="relative"><F className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" value={w.name} onChange={s => y(a => ({
                      ...a,
                      name: s.target.value
                    }))} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="text-sm font-medium text-foreground mb-1.5 block">CNPJ</label><div className="relative"><ie className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" value={w.cnpj} onChange={s => y(a => ({
                        ...a,
                        cnpj: s.target.value
                      }))} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div></div><div><label className="text-sm font-medium text-foreground mb-1.5 block">Telefone</label><div className="relative"><q className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="tel" value={w.phone} onChange={s => y(a => ({
                        ...a,
                        phone: s.target.value
                      }))} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div></div></div><div><label className="text-sm font-medium text-foreground mb-1.5 block">Endereço</label><div className="relative"><ce className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" value={w.address} onChange={s => y(a => ({
                      ...a,
                      address: s.target.value
                    }))} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div></div><div><label className="text-sm font-medium text-foreground mb-1.5 block">Website</label><div className="relative"><me className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="url" value={w.website} onChange={s => y(a => ({
                      ...a,
                      website: s.target.value
                    }))} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div></div></div><div className="flex justify-end mt-6"><b variant="cta" className="gap-2" onClick={Y} disabled={o}>{o ? <j className="h-4 w-4 animate-spin" /> : <E className="h-4 w-4" />}Salvar Alterações</b></div></div>}{g === "integracoes" && <div className="space-y-4"><div className="bg-card rounded-xl shadow-sm p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6"><div className="flex items-center gap-3"><H className="h-5 w-5 text-accent" /><div><h2 className="text-lg font-semibold text-foreground">Integrações</h2><p className="text-sm text-muted-foreground">Conexoes oficiais da imobiliaria</p></div></div><v className={_("w-fit", (t == null ? void 0 : t.status) === "connected" ? "bg-success/10 text-success" : (t == null ? void 0 : t.status) === "error" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>{U ? "Carregando" : (t == null ? void 0 : t.status) === "connected" ? "Conectado" : (t == null ? void 0 : t.status) === "connecting" ? "Pendente" : (t == null ? void 0 : t.status) === "error" ? "Erro" : "Não conectado"}</v></div><div className="rounded-lg border border-border p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="space-y-3"><div className="flex items-center gap-3"><Ne /><div><p className="font-semibold text-foreground">Google Workspace</p><p className="text-sm text-muted-foreground">{(t == null ? void 0 : t.external_account_email) || (r == null ? void 0 : r.email) || "Conta admin da imobiliaria"}</p></div></div><div className="flex flex-wrap gap-2"><v variant="outline" className="gap-1.5"><ue className="h-3.5 w-3.5" />Agenda admin</v><v variant="outline" className="gap-1.5"><xe className="h-3.5 w-3.5" />Drive da empresa</v><v variant="outline" className="gap-1.5"><G className="h-3.5 w-3.5" />Login Google</v></div></div><div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row"><b variant={(t == null ? void 0 : t.status) === "connected" ? "outline" : "cta"} className="gap-2" onClick={$} disabled={M.isPending || U}>{M.isPending ? <j className="h-4 w-4 animate-spin" /> : <he className="h-4 w-4" />}{(t == null ? void 0 : t.status) === "connected" ? "Reconectar" : "Conectar Google"}</b><b variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={W} disabled={!t || T.isPending}>{T.isPending ? <j className="h-4 w-4 animate-spin" /> : <ge className="h-4 w-4" />}Desconectar</b></div></div><div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"><div className="rounded-lg bg-muted/40 p-3"><p className="text-xs font-medium uppercase text-muted-foreground">Calendario</p><p className="mt-1 text-sm font-semibold text-foreground">{(t == null ? void 0 : t.calendar_id) || "primary"}</p></div><div className="rounded-lg bg-muted/40 p-3"><p className="text-xs font-medium uppercase text-muted-foreground">Dono da agenda</p><p className="mt-1 text-sm font-semibold text-foreground">{(t == null ? void 0 : t.calendar_owner_name) || (r == null ? void 0 : r.full_name) || "Admin"}</p></div><div className="rounded-lg bg-muted/40 p-3"><p className="text-xs font-medium uppercase text-muted-foreground">Politica</p><p className="mt-1 text-sm font-semibold text-foreground">Corretor sem dados Google</p></div></div>{(t == null ? void 0 : t.status) === "connecting" && <div className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><O className="mt-0.5 h-4 w-4 shrink-0" /><p>OAuth operacional pendente. Clique em Conectar Google para autorizar Calendar e Drive da imobiliaria.</p></div>}{(t == null ? void 0 : t.error_message) && <div className="mt-4 flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><O className="mt-0.5 h-4 w-4 shrink-0" /><p>{t.error_message}</p></div>}</div></div></div>}{g === "notificacoes" && <div className="bg-card rounded-xl shadow-sm p-6"><div className="flex items-center gap-3 mb-6"><I className="h-5 w-5 text-accent" /><h2 className="text-lg font-semibold text-foreground">Notificações</h2></div><div className="space-y-1"><h3 className="text-sm font-semibold text-foreground mb-2">Email</h3><div className="divide-y divide-border"><u label="Novo lead recebido" checked={p.email_new_lead} onChange={s => f(a => ({
                    ...a,
                    email_new_lead: s
                  }))} /><u label="Nova proposta criada" checked={p.email_new_proposal} onChange={s => f(a => ({
                    ...a,
                    email_new_proposal: s
                  }))} /><u label="Lembrete de visita" checked={p.email_visit_reminder} onChange={s => f(a => ({
                    ...a,
                    email_visit_reminder: s
                  }))} /></div></div><div className="space-y-1 mt-6"><h3 className="text-sm font-semibold text-foreground mb-2">Push / Sistema</h3><div className="divide-y divide-border"><u label="Novas mensagens" checked={p.push_messages} onChange={s => f(a => ({
                    ...a,
                    push_messages: s
                  }))} /><u label="Atualizações do sistema" checked={p.push_updates} onChange={s => f(a => ({
                    ...a,
                    push_updates: s
                  }))} /></div></div><div className="space-y-1 mt-6"><h3 className="text-sm font-semibold text-foreground mb-2">Relatórios</h3><div className="divide-y divide-border"><u label="Relatório diário" checked={p.daily_report} onChange={s => f(a => ({
                    ...a,
                    daily_report: s
                  }))} /><u label="Relatório semanal" checked={p.weekly_report} onChange={s => f(a => ({
                    ...a,
                    weekly_report: s
                  }))} /></div></div><div className="flex justify-end mt-6"><b variant="cta" className="gap-2" onClick={Z} disabled={o}>{o ? <j className="h-4 w-4 animate-spin" /> : <E className="h-4 w-4" />}Salvar Preferências</b></div></div>}{g === "seguranca" && <div className="bg-card rounded-xl shadow-sm p-6"><div className="flex items-center gap-3 mb-6"><G className="h-5 w-5 text-accent" /><h2 className="text-lg font-semibold text-foreground">Segurança</h2></div><div className="space-y-4"><h3 className="text-sm font-semibold text-foreground">Alterar Senha</h3><div><label className="text-sm font-medium text-foreground mb-1.5 block">Senha Atual</label><div className="relative"><D className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="password" value={x.current_password} onChange={s => S(a => ({
                      ...a,
                      current_password: s.target.value
                    }))} placeholder="Digite sua senha atual" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="text-sm font-medium text-foreground mb-1.5 block">Nova Senha</label><div className="relative"><D className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="password" value={x.new_password} onChange={s => S(a => ({
                        ...a,
                        new_password: s.target.value
                      }))} placeholder="Mínimo 6 caracteres" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div></div><div><label className="text-sm font-medium text-foreground mb-1.5 block">Confirmar Nova Senha</label><div className="relative"><D className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="password" value={x.confirm_password} onChange={s => S(a => ({
                        ...a,
                        confirm_password: s.target.value
                      }))} placeholder="Repita a nova senha" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" /></div></div></div></div><div className="flex justify-end mt-6"><b variant="cta" className="gap-2" onClick={ee} disabled={o || !x.new_password}>{o ? <j className="h-4 w-4 animate-spin" /> : <G className="h-4 w-4" />}Alterar Senha</b></div><div className="mt-8 pt-6 border-t border-border"><h3 className="text-sm font-semibold text-foreground mb-3">Sessões Ativas</h3><div className="p-4 rounded-lg border border-border"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-foreground">Sessão Atual</p><p className="text-xs text-muted-foreground">Navegador • Ativo agora</p></div><v className="bg-success/10 text-success">Ativa</v></div></div></div></div>}{g === "aparencia" && <div className="bg-card rounded-xl shadow-sm p-6"><div className="flex items-center gap-3 mb-6"><Q className="h-5 w-5 text-accent" /><h2 className="text-lg font-semibold text-foreground">Aparência</h2></div><div className="space-y-6"><div><h3 className="text-sm font-semibold text-foreground mb-3">Tema</h3><div className="grid grid-cols-2 gap-3"><button onClick={() => A(s => ({
                      ...s,
                      theme: "light"
                    }))} className={_("p-4 rounded-lg border-2 transition-colors text-center", k.theme === "light" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground")}><div className="h-12 w-12 mx-auto mb-2 rounded-lg bg-white border border-gray-200" /><p className="text-sm font-medium text-foreground">Claro</p></button><button onClick={() => A(s => ({
                      ...s,
                      theme: "dark"
                    }))} className={_("p-4 rounded-lg border-2 transition-colors text-center", k.theme === "dark" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground")}><div className="h-12 w-12 mx-auto mb-2 rounded-lg bg-gray-800 border border-gray-700" /><p className="text-sm font-medium text-foreground">Escuro</p></button></div></div><div className="divide-y divide-border"><u label="Sidebar compacta por padrão" checked={k.compact_sidebar} onChange={s => A(a => ({
                    ...a,
                    compact_sidebar: s
                  }))} /><u label="Mostrar badges de notificação" checked={k.show_badges} onChange={s => A(a => ({
                    ...a,
                    show_badges: s
                  }))} /></div></div><div className="flex justify-end mt-6"><b variant="cta" className="gap-2" onClick={se} disabled={o}>{o ? <j className="h-4 w-4 animate-spin" /> : <E className="h-4 w-4" />}Salvar Preferências</b></div></div>}</div></div></main></div></div>;
}
function Ne() {
  return <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background"><svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" /></svg></div>;
}
export { Te as default };