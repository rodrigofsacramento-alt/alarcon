/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/SuperAdminCommunications-7fuPoaiO.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { r as g } from "@/components/vendor-Jm1Lk";
import { G as te, a as ne, e as le, H as re, I as ce, J as ie, S as oe } from "@/components/SuperAdminLayout";
import { S as de, a as o, b as p, c as r, e as me, d as ue, f as _ } from "@/components/index";
import { b as he, I as B } from "@/components/index-C9";
import { L as d } from "@/components/label";
import { T as xe } from "@/components/ui/textarea";
import { S as j, a as v, b as f, c as b, d as u } from "@/components/ui/select";
import { D as H, a as R, b as V, c as F, d as q, e as z } from "@/components/ui/dialog";
import { t as D } from "@/components/error-messages";
import { C as ge } from "@/components/confirm-dialog";
import { b9 as w, z as M, n as N, m as C, b as pe, U, aZ as je, v as ve, r as Y, a9 as fe, b5 as $, am as be } from "@/components/ui";
import { p as G } from "@/components/pt-BR";
import "@/components/logo-estate";
import "@/lib/supabase";
import "@/components/index";
import "@/components/index";
const J = {
    info: {
      label: "Informativo",
      tone: "info",
      icon: fe
    },
    success: {
      label: "Sucesso",
      tone: "success",
      icon: Y
    },
    warning: {
      label: "Atenção",
      tone: "warning",
      icon: ve
    },
    critical: {
      label: "Crítico",
      tone: "danger",
      icon: je
    }
  },
  Ne = {
    all: "Todas as empresas",
    plan: "Plano específico",
    status: "Status específico",
    tenant: "Empresa específica"
  },
  K = {
    title: "",
    message: "",
    severity: "info",
    target_type: "all",
    target_value: "",
    scheduled_at: "",
    send_now: !0
  };
function Re() {
  const {
      toast: c
    } = he(),
    {
      data: i = [],
      isLoading: Z
    } = te(),
    {
      data: S
    } = ne(),
    k = (S == null ? void 0 : S.data) ?? [],
    {
      data: P = []
    } = le(),
    L = re(),
    I = ce(),
    O = ie(),
    [Q, h] = g.useState(!1),
    [a, n] = g.useState(K),
    [A, y] = g.useState(null),
    [E, T] = g.useState(null),
    x = g.useMemo(() => {
      const s = i.filter(l => l.sent_at),
        t = i.filter(l => l.scheduled_at && !l.is_sent && !l.sent_at),
        m = i.reduce((l, ae) => l + ae.sent_count, 0);
      return {
        total: i.length,
        sent: s.length,
        scheduled: t.length,
        drafts: i.filter(l => !l.sent_at && !l.scheduled_at).length,
        reach: m
      };
    }, [i]),
    W = async s => {
      if (s.preventDefault(), !a.title.trim() || !a.message.trim()) {
        c({
          title: "Preencha título e mensagem",
          variant: "destructive"
        });
        return;
      }
      if (a.target_type !== "all" && !a.target_value) {
        c({
          title: "Selecione o alvo da comunicação",
          variant: "destructive"
        });
        return;
      }
      try {
        const t = {
          title: a.title,
          message: a.message,
          severity: a.severity,
          target_type: a.target_type,
          target_value: a.target_type === "all" ? null : a.target_value
        };
        !a.send_now && a.scheduled_at && (t.scheduled_at = new Date(a.scheduled_at).toISOString()), await L.mutateAsync(t), c({
          title: a.send_now ? "Anúncio criado como rascunho" : "Anúncio agendado"
        }), h(!1), n(K);
      } catch (t) {
        c({
          title: "Erro ao criar",
          description: D(t),
          variant: "destructive"
        });
      }
    },
    X = async () => {
      if (A) try {
        const s = await I.mutateAsync(A.id);
        c({
          title: "Comunicação enviada",
          description: `${s.sent_count} usuários alcançados`
        }), y(null);
      } catch (s) {
        c({
          title: "Erro ao enviar",
          description: D(s),
          variant: "destructive"
        });
      }
    },
    ee = async () => {
      if (E) try {
        await O.mutateAsync(E), c({
          title: "Anúncio excluído"
        }), T(null);
      } catch (s) {
        c({
          title: "Erro",
          description: D(s),
          variant: "destructive"
        });
      }
    },
    se = s => {
      if (s.target_type === "all") return "Todas";
      if (s.target_type === "plan") {
        const t = P.find(m => m.id === s.target_value);
        return t ? `Plano: ${t.name}` : "Plano";
      }
      if (s.target_type === "tenant") {
        const t = k.find(m => m.id === s.target_value);
        return t ? t.name : "Empresa";
      }
      return s.target_type === "status" ? `Status: ${s.target_value}` : "—";
    };
  return <oe>{<div className="space-y-6">{<de title="Comunicações" description="Anúncios e notificações enviadas para os tenants" icon={w} actions={<o icon={M} onClick={() => h(!0)}>Novo anúncio</o>} />}{<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{<p label="Total" value={x.total} icon={w} iconColor="#60a5fa" />}{<p label="Enviados" value={x.sent} icon={N} iconColor="#10b981" />}{<p label="Agendados" value={x.scheduled} icon={C} iconColor="#f59e0b" />}{<p label="Rascunhos" value={x.drafts} icon={pe} iconColor={r.accent} />}{<p label="Usuários alcançados" value={x.reach} icon={U} iconColor="#8b5cf6" />}</div>}{<me noPadding={!0}>{Z ? <div className="p-8 text-center text-sm" style={{
          color: r.textMuted
        }}>Carregando...</div> : i.length === 0 ? <ue icon={w} title="Nenhuma comunicação ainda" description="Crie um anúncio para enviar a empresas, planos ou status específicos" action={<o icon={M} onClick={() => h(!0)}>Criar primeiro anúncio</o>} /> : <div className="divide-y" style={{
          borderColor: r.borderSubtle
        }}>{i.map(s => {
            const t = J[s.severity],
              m = t.icon;
            return <div className="p-5 hover:bg-white/[0.02] transition-colors" style={{
              borderColor: r.borderSubtle
            }}>{<div className="flex items-start gap-3">{<div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{
                  background: t.tone === "danger" ? "rgba(239,68,68,0.12)" : t.tone === "warning" ? "rgba(245,158,11,0.12)" : t.tone === "success" ? "rgba(16,185,129,0.12)" : "rgba(59,130,246,0.12)"
                }}>{<m className="w-4 h-4" style={{
                    color: t.tone === "danger" ? "#f87171" : t.tone === "warning" ? "#f59e0b" : t.tone === "success" ? "#10b981" : "#60a5fa"
                  }} />}</div>}{<div className="flex-1 min-w-0">{<div className="flex items-start justify-between gap-3 mb-1">{<h3 className="font-semibold" style={{
                      color: r.textPrimary
                    }}>{s.title}</h3>}{<div className="flex items-center gap-2 shrink-0">{<_ tone={t.tone}>{t.label}</_>}{s.sent_at ? <_ tone="success" icon={Y}>Enviado</_> : s.scheduled_at ? <_ tone="warning" icon={C}>Agendado</_> : <_ tone="neutral">Rascunho</_>}</div>}</div>}{<p className="text-sm mb-3" style={{
                    color: r.textSecondary
                  }}>{s.message}</p>}{<div className="flex flex-wrap items-center gap-3 text-xs" style={{
                    color: r.textMuted
                  }}>{<span className="flex items-center gap-1">{<U className="w-3 h-3" />}{se(s)}</span>}{s.sent_at && <e.Fragment>{<span>•</span>}{<span className="flex items-center gap-1">{<N className="w-3 h-3" />}{s.sent_count} usuários alcançados</span>}{<span>•</span>}{<span className="flex items-center gap-1">{<C className="w-3 h-3" />}{$(new Date(s.sent_at), "dd/MM/yy 'às' HH:mm", {
                          locale: G
                        })}</span>}</e.Fragment>}{s.scheduled_at && !s.sent_at && <e.Fragment>{<span>•</span>}{<span className="flex items-center gap-1">{<C className="w-3 h-3" />}Agendado para {$(new Date(s.scheduled_at), "dd/MM/yy 'às' HH:mm", {
                          locale: G
                        })}</span>}</e.Fragment>}</div>}</div>}{<div className="flex flex-col gap-1.5 shrink-0">{!s.sent_at && !s.scheduled_at && <o size="sm" icon={N} onClick={() => y(s)}>Enviar</o>}{<o size="sm" variant="ghost" icon={be} onClick={() => T(s.id)}>Excluir</o>}</div>}</div>}</div>;
          })}</div>}</me>}{<H open={Q} onOpenChange={h}>{<R className="bg-slate-900 border-slate-700 text-white max-w-lg">{<V>{<F className="flex items-center gap-2">{<w className="w-5 h-5" style={{
                color: r.accent
              }} />}Novo anúncio</F>}{<q className="text-slate-400">Envie imediatamente ou agende para uma data futura.</q>}</V>}{<form onSubmit={W} className="space-y-4">{<div className="space-y-2">{<d className="text-slate-300">Título *</d>}{<B value={a.title} onChange={s => n({
                ...a,
                title: s.target.value
              })} placeholder="Ex: Manutenção programada" className="bg-slate-800 border-slate-700" required={!0} />}</div>}{<div className="space-y-2">{<d className="text-slate-300">Mensagem *</d>}{<xe value={a.message} onChange={s => n({
                ...a,
                message: s.target.value
              })} placeholder="Detalhes da comunicação" className="bg-slate-800 border-slate-700 min-h-[100px]" required={!0} />}</div>}{<div className="grid grid-cols-2 gap-3">{<div className="space-y-2">{<d className="text-slate-300">Severidade</d>}{<j value={a.severity} onValueChange={s => n({
                  ...a,
                  severity: s
                })}>{<v className="bg-slate-800 border-slate-700 text-white">{<f className="text-white" />}</v>}{<b className="bg-slate-800 border-slate-700">{Object.entries(J).map(([s, t]) => <u value={s} className="text-white focus:bg-slate-700 focus:text-white">{t.label}</u>)}</b>}</j>}</div>}{<div className="space-y-2">{<d className="text-slate-300">Alvo</d>}{<j value={a.target_type} onValueChange={s => n({
                  ...a,
                  target_type: s,
                  target_value: ""
                })}>{<v className="bg-slate-800 border-slate-700 text-white">{<f className="text-white" />}</v>}{<b className="bg-slate-800 border-slate-700">{Object.entries(Ne).map(([s, t]) => <u value={s} className="text-white focus:bg-slate-700 focus:text-white">{t}</u>)}</b>}</j>}</div>}</div>}{a.target_type === "plan" && <div className="space-y-2">{<d className="text-slate-300">Plano</d>}{<j value={a.target_value} onValueChange={s => n({
                ...a,
                target_value: s
              })}>{<v className="bg-slate-800 border-slate-700 text-white">{<f placeholder="Selecione" className="text-white" />}</v>}{<b className="bg-slate-800 border-slate-700">{P.map(s => <u value={s.id} className="text-white focus:bg-slate-700 focus:text-white">{s.name}</u>)}</b>}</j>}</div>}{a.target_type === "tenant" && <div className="space-y-2">{<d className="text-slate-300">Empresa</d>}{<j value={a.target_value} onValueChange={s => n({
                ...a,
                target_value: s
              })}>{<v className="bg-slate-800 border-slate-700 text-white">{<f placeholder="Selecione" className="text-white" />}</v>}{<b className="bg-slate-800 border-slate-700">{k.map(s => <u value={s.id} className="text-white focus:bg-slate-700 focus:text-white">{s.name}</u>)}</b>}</j>}</div>}{a.target_type === "status" && <div className="space-y-2">{<d className="text-slate-300">Status</d>}{<j value={a.target_value} onValueChange={s => n({
                ...a,
                target_value: s
              })}>{<v className="bg-slate-800 border-slate-700 text-white">{<f placeholder="Selecione" className="text-white" />}</v>}{<b className="bg-slate-800 border-slate-700">{<u value="active" className="text-white focus:bg-slate-700 focus:text-white">Ativo</u>}{<u value="trial" className="text-white focus:bg-slate-700 focus:text-white">Trial</u>}{<u value="suspended" className="text-white focus:bg-slate-700 focus:text-white">Suspenso</u>}</b>}</j>}</div>}{<div className="flex items-center gap-3 pt-2">{<label className="flex items-center gap-2 text-sm cursor-pointer" style={{
                color: r.textSecondary
              }}>{<input type="checkbox" checked={a.send_now} onChange={s => n({
                  ...a,
                  send_now: s.target.checked
                })} className="rounded border-slate-600 bg-slate-800 accent-orange-500" />}Enviar agora</label>}</div>}{!a.send_now && <div className="space-y-2">{<d className="text-slate-300">Data e hora do envio</d>}{<B type="datetime-local" value={a.scheduled_at} onChange={s => n({
                ...a,
                scheduled_at: s.target.value
              })} className="bg-slate-800 border-slate-700 text-white" required={!a.send_now} />}</div>}{<z className="pt-2">{<o variant="secondary" type="button" onClick={() => h(!1)}>Cancelar</o>}{<o type="submit" icon={M} disabled={L.isPending}>{a.send_now ? "Criar rascunho" : "Agendar"}</o>}</z>}</form>}</R>}</H>}{<H open={!!A} onOpenChange={() => y(null)}>{<R className="bg-slate-900 border-slate-700 text-white">{<V>{<F className="flex items-center gap-2">{<N className="w-5 h-5" style={{
                color: r.accent
              }} />}Enviar anúncio</F>}{<q className="text-slate-400">Esta ação cria notificações para todos os usuários do alvo selecionado e é irreversível.</q>}</V>}{<z>{<o variant="secondary" onClick={() => y(null)}>Cancelar</o>}{<o icon={N} onClick={X} disabled={I.isPending}>Confirmar envio</o>}</z>}</R>}</H>}</div>}{<ge open={!!E} onOpenChange={s => !s && T(null)} title="Excluir anúncio" description="Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita." confirmLabel="Excluir" cancelLabel="Cancelar" variant="destructive" isLoading={O.isPending} onConfirm={ee} />}</oe>;
}
export { Re as default };