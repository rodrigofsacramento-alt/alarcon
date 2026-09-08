/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/MarketingLayout-Bc67obq9.js | AST | sanitizado | Fase 3 ==*/
import { a as G, u as L, b as E, j as e } from "@/components/query";
import { r as u, u as De, f as Ae, L as Pe, d as Ie, e as z } from "@/components/vendor-Jm1Lk";
import { s as h, a as f, B as p, I as P, c as R, J as qe } from "@/components/index-C9";
import { S as Le, M as Ee, H as Te } from "@/components/Header";
import { C as y, a as D, b as A, d as k, c as V } from "@/components/ui/card";
import { L as C, i as Fe, Y as Ue, a_ as Re, a$ as Oe, b0 as ze, b1 as Ke, ai as Be, ah as Qe, b2 as Ve, am as Q, al as $, z as We, b3 as H, b4 as J, m as $e, n as He, b5 as Je, h as Z, r as W, M as Ge, I as ee } from "@/components/ui";
import { R as se, C as ae, X as te, Y as ne, T as re, B as ie } from "@/components/generateCategoricalChart";
import { B as Ye } from "@/components/BarChart";
import { L as Xe, a as Ze } from "@/components/LineChart";
import { B as U } from "@/components/ui/badge";
import { L as K } from "@/components/label";
import { D as ce, a as le, b as oe, c as de, d as es, e as me } from "@/components/ui/dialog";
import { S as ue, a as xe, b as he, c as ge, d as pe } from "@/components/ui/select";
import { D as ss, a as as, b as ts, d as B, e as ns } from "@/components/ui/dropdown-menu";
import { C as Y } from "@/components/confirm-dialog";
import { T as rs } from "@/components/ui/textarea";
import { p as is } from "@/components/pt-BR";
import { u as cs } from "@/hooks/useWhatsapp";
import "@/lib/supabase";
import "@/components/logo-estate";
import "@/components/index";
import "@/components/index";
function ve() {
  return G({
    queryKey: ["marketing-posts"],
    queryFn: async () => {
      const {
        data: a,
        error: s
      } = await h.from("marketing_posts").select(`
          *,
          asset:marketing_assets!marketing_posts_asset_id_fkey(*),
          author:profiles!marketing_posts_author_id_fkey(id, full_name, avatar_url)
        `).order("created_at", {
        ascending: !1
      });
      if (s) throw s;
      return (a || []).map(r => {
        const o = r.asset;
        if (o != null && o.file_path) {
          const {
            data: c
          } = h.storage.from("marketing_assets").getPublicUrl(o.file_path);
          o.publicUrl = c.publicUrl;
        }
        return r;
      });
    }
  });
}
function ls() {
  const a = L();
  return E({
    mutationFn: async s => {
      const {
        data: n,
        error: r
      } = await h.rpc("get_my_tenant_id");
      if (r) throw r;
      const {
        data: o,
        error: c
      } = await h.from("marketing_posts").insert({
        ...s,
        tenant_id: n
      }).select().single();
      if (c) throw c;
      return o;
    },
    onSuccess: () => {
      a.invalidateQueries({
        queryKey: ["marketing-posts"]
      }), a.invalidateQueries({
        queryKey: ["marketing-dashboard"]
      });
    }
  });
}
function os() {
  const a = L();
  return E({
    mutationFn: async s => {
      const {
        error: n
      } = await h.from("marketing_posts").delete().eq("id", s);
      if (n) throw n;
    },
    onSuccess: () => {
      a.invalidateQueries({
        queryKey: ["marketing-posts"]
      }), a.invalidateQueries({
        queryKey: ["marketing-dashboard"]
      });
    }
  });
}
const ds = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
function ms() {
  const {
      data: a = [],
      isLoading: s
    } = ve(),
    n = a.reduce((i, d) => i + (d.metrics_reach || 0), 0),
    r = a.reduce((i, d) => i + (d.metrics_engagement || 0), 0),
    o = a.reduce((i, d) => i + (d.metrics_clicks || 0), 0),
    c = u.useMemo(() => {
      const i = new Map();
      return a.forEach(d => {
        if (!d.created_at) return;
        const m = new Date(d.created_at).getMonth(),
          g = i.get(m) || {
            reach: 0,
            engagement: 0,
            clicks: 0
          };
        i.set(m, {
          reach: g.reach + (d.metrics_reach || 0),
          engagement: g.engagement + (d.metrics_engagement || 0),
          clicks: g.clicks + (d.metrics_clicks || 0)
        });
      }), Array.from({
        length: 6
      }, (d, b) => {
        const m = (new Date().getMonth() - 5 + b + 12) % 12,
          g = i.get(m) || {
            reach: 0,
            engagement: 0,
            clicks: 0
          };
        return {
          name: ds[m],
          ...g
        };
      });
    }, [a]);
  return s ? <div className="flex items-center justify-center py-20"><C className="h-8 w-8 animate-spin text-accent" /><span className="ml-3 text-muted-foreground">Carregando métricas...</span></div> : <div className="space-y-4"><div className="grid gap-4 md:grid-cols-3"><y><D className="flex flex-row items-center justify-between space-y-0 pb-2"><A className="text-sm font-medium">Alcance Total</A><Fe className="h-4 w-4 text-muted-foreground" /></D><k><div className="text-2xl font-bold">{n.toLocaleString("pt-BR")}</div><p className="text-xs text-muted-foreground">{a.length} postagens publicadas</p></k></y><y><D className="flex flex-row items-center justify-between space-y-0 pb-2"><A className="text-sm font-medium">Engajamento Total</A><Ue className="h-4 w-4 text-muted-foreground" /></D><k><div className="text-2xl font-bold">{r.toLocaleString("pt-BR")}</div><p className="text-xs text-muted-foreground">Interações em todas as postagens</p></k></y><y><D className="flex flex-row items-center justify-between space-y-0 pb-2"><A className="text-sm font-medium">Cliques nos Links</A><Re className="h-4 w-4 text-muted-foreground" /></D><k><div className="text-2xl font-bold">{o.toLocaleString("pt-BR")}</div><p className="text-xs text-muted-foreground">Conversões de tráfego</p></k></y></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"><y className="col-span-4"><D><A>Alcance vs Engajamento (últimos 6 meses)</A></D><k className="pl-2"><div className="h-[300px] w-full">{c.some(i => i.reach > 0 || i.engagement > 0) ? <se width="100%" height="100%"><Ye data={c}><ae strokeDasharray="3 3" className="stroke-muted" /><te dataKey="name" className="text-xs" /><ne className="text-xs" /><re /><ie dataKey="reach" fill="#8884d8" name="Alcance" radius={[4, 4, 0, 0]} /><ie dataKey="engagement" fill="#82ca9d" name="Engajamento" radius={[4, 4, 0, 0]} /></Ye></se> : <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Nenhuma métrica registrada ainda</div>}</div></k></y><y className="col-span-3"><D><A>Tendência de Cliques</A></D><k><div className="h-[300px] w-full">{c.some(i => i.clicks > 0) ? <se width="100%" height="100%"><Xe data={c}><ae strokeDasharray="3 3" className="stroke-muted" /><te dataKey="name" className="text-xs" /><ne className="text-xs" /><re /><Ze type="monotone" dataKey="clicks" stroke="#ffc658" name="Cliques" strokeWidth={2} /></Xe></se> : <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Nenhuma métrica registrada ainda</div>}</div></k></y></div></div>;
}
function be() {
  return G({
    queryKey: ["marketing-assets"],
    queryFn: async () => {
      const {
        data: a,
        error: s
      } = await h.from("marketing_assets").select("*").order("created_at", {
        ascending: !1
      });
      if (s) throw s;
      return a.map(n => {
        const {
          data: r
        } = h.storage.from("marketing_assets").getPublicUrl(n.file_path);
        return {
          ...n,
          publicUrl: r.publicUrl
        };
      });
    }
  });
}
function us() {
  const a = L();
  return E({
    mutationFn: async ({
      file: s,
      name: n,
      category: r
    }) => {
      var j;
      const o = ((j = s.name.split(".").pop()) == null ? void 0 : j.toLowerCase()) || "jpg",
        c = s.type.startsWith("video") ? "video" : "image",
        i = `${Date.now()}-${Math.random().toString(36).substring(7)}.${o}`,
        {
          error: d
        } = await h.storage.from("marketing_assets").upload(i, s);
      if (d) throw d;
      const {
        data: b,
        error: m
      } = await h.rpc("get_my_tenant_id");
      if (m) throw m;
      const {
        data: g,
        error: N
      } = await h.from("marketing_assets").insert([{
        tenant_id: b,
        file_name: n || s.name,
        file_path: i,
        file_type: c,
        category: r,
        file_size: s.size
      }]).select().single();
      if (N) throw await h.storage.from("marketing_assets").remove([i]), N;
      return g;
    },
    onSuccess: () => {
      a.invalidateQueries({
        queryKey: ["marketing-assets"]
      }), f.success("Mídia enviada com sucesso!");
    },
    onError: s => {
      console.error(s), f.error("Erro ao fazer upload da mídia.");
    }
  });
}
function xs() {
  const a = L();
  return E({
    mutationFn: async s => {
      const {
        error: n
      } = await h.storage.from("marketing_assets").remove([s.file_path]);
      if (n) throw n;
      const {
        error: r
      } = await h.from("marketing_assets").delete().eq("id", s.id);
      if (r) throw r;
    },
    onSuccess: () => {
      a.invalidateQueries({
        queryKey: ["marketing-assets"]
      }), f.success("Mídia removida com sucesso!");
    },
    onError: s => {
      console.error(s), f.error("Erro ao deletar mídia.");
    }
  });
}
function hs() {
  const a = L();
  return E({
    mutationFn: async ({
      id: s,
      name: n,
      category: r
    }) => {
      const {
        data: o,
        error: c
      } = await h.from("marketing_assets").update({
        file_name: n,
        category: r
      }).eq("id", s).select().single();
      if (c) throw c;
      return o;
    },
    onSuccess: () => {
      a.invalidateQueries({
        queryKey: ["marketing-assets"]
      }), f.success("Informações atualizadas com sucesso!");
    },
    onError: s => {
      console.error(s), f.error("Erro ao atualizar informações.");
    }
  });
}
const fe = ["Institucional", "Imóvel", "Redes Sociais", "Outro"];
function gs() {
  const {
      data: a = [],
      isLoading: s
    } = be(),
    n = us(),
    r = xs(),
    o = hs(),
    c = u.useRef(null),
    [i, d] = u.useState(null),
    [b, m] = u.useState(!1),
    [g, N] = u.useState(!1),
    [j, v] = u.useState(""),
    [w, _] = u.useState("Redes Sociais"),
    [S, I] = u.useState(null),
    [l, M] = u.useState(null),
    q = t => {
      var O;
      const T = (O = t.target.files) == null ? void 0 : O[0];
      T && (d(T), v(T.name), m(!0)), c.current && (c.current.value = "");
    },
    x = () => {
      i && n.mutate({
        file: i,
        name: j,
        category: w
      }, {
        onSuccess: () => {
          m(!1), d(null);
        }
      });
    },
    ke = t => {
      I(t), v(t.file_name), _(t.category || "Outro"), N(!0);
    },
    Ce = () => {
      S && o.mutate({
        id: S.id,
        name: j,
        category: w
      }, {
        onSuccess: () => N(!1)
      });
    },
    _e = () => {
      l && r.mutate(l, {
        onSuccess: () => {
          f.success("Mídia removida."), M(null);
        }
      });
    },
    Se = async t => {
      try {
        const O = await (await fetch(t.publicUrl || "")).blob(),
          X = window.URL.createObjectURL(O),
          F = <a />;
        F.style.display = "none", F.href = X, F.download = t.file_name, document.body.appendChild(F), F.click(), window.URL.revokeObjectURL(X);
      } catch {
        f.error("Erro ao baixar o arquivo.");
      }
    },
    Me = t => {
      switch (t) {
        case "Institucional":
          return "bg-blue-100 text-blue-800 border-blue-200";
        case "Imóvel":
          return "bg-emerald-100 text-emerald-800 border-emerald-200";
        case "Redes Sociais":
          return "bg-pink-100 text-pink-800 border-pink-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h3 className="text-lg font-medium">Biblioteca de Mídias</h3><p className="text-sm text-muted-foreground">Gerencie imagens e vídeos para suas postagens.</p></div><div><input type="file" ref={c} className="hidden" accept="image/*,video/*" onChange={q} /><p variant="cta" onClick={() => {
          var t;
          return (t = c.current) == null ? void 0 : t.click();
        }}><Oe className="mr-2 h-4 w-4" />Fazer Upload</p></div></div>{s ? <div className="flex flex-col items-center justify-center py-12"><C className="h-8 w-8 animate-spin text-accent mb-4" /><p className="text-muted-foreground text-sm">Carregando mídias...</p></div> : <e.Fragment><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{a.map(t => <y className="overflow-hidden group flex flex-col"><k className="p-0 relative flex-1"><div className="aspect-square bg-muted flex items-center justify-center w-full">{t.file_type === "image" ? <img src={t.publicUrl || ""} alt={t.file_name} className="object-cover w-full h-full" /> : <div className="flex flex-col items-center text-muted-foreground"><ze className="h-8 w-8 mb-2" /><span className="text-xs">Vídeo</span></div>}</div><div className="absolute top-2 left-2"><U variant="outline" className={`text-[10px] uppercase shadow-sm ${Me(t.category)}`}>{t.category || "Outro"}</U></div><div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><ss><as asChild={!0}><p variant="secondary" size="icon" className="h-8 w-8 shadow-sm"><Ke className="h-4 w-4" /></p></as><ts align="end" className="w-48"><B onClick={() => Se(t)}><Be className="mr-2 h-4 w-4" /><span>Baixar</span></B><B onClick={() => {
                    navigator.clipboard.writeText(t.publicUrl || ""), f.success("Link copiado!");
                  }}><Qe className="mr-2 h-4 w-4" /><span>Copiar Link</span></B><B onClick={() => ke(t)}><Ve className="mr-2 h-4 w-4" /><span>Editar Informações</span></B><ns /><B className="text-destructive focus:text-destructive" onClick={() => M(t)}><Q className="mr-2 h-4 w-4" /><span>Apagar Mídia</span></B></ts></ss></div></k><div className="p-3 border-t bg-card"><p className="truncate text-sm font-medium" title={t.file_name}>{t.file_name}</p><p className="text-xs text-muted-foreground mt-0.5">{(t.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(t.created_at).toLocaleDateString()}</p></div></y>)}</div>{a.length === 0 && <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card/50"><$ className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-medium">Nenhuma mídia encontrada</h3><p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">Faça upload de imagens ou vídeos institucionais, de imóveis ou para suas redes sociais.</p><p variant="outline" className="mt-4" onClick={() => {
          var t;
          return (t = c.current) == null ? void 0 : t.click();
        }}>Selecionar Arquivo</p></div>}</e.Fragment>}<ce open={b} onOpenChange={m}><le className="sm:max-w-[425px]"><oe><de>Detalhes da Mídia</de><es>Confirme o nome e selecione a categoria correta para organizar sua biblioteca.</es></oe><div className="grid gap-4 py-4"><div className="space-y-2"><K htmlFor="filename">Nome do Arquivo</K><P id="filename" value={j} onChange={t => v(t.target.value)} /></div><div className="space-y-2"><K htmlFor="category">Categoria</K><ue value={w} onValueChange={_}><xe><he placeholder="Selecione uma categoria" /></xe><ge>{fe.map(t => <pe value={t}>{t}</pe>)}</ge></ue></div></div><me><p variant="outline" onClick={() => m(!1)} disabled={n.isPending}>Cancelar</p><p variant="cta" onClick={x} disabled={n.isPending || !j}>{n.isPending ? <e.Fragment><C className="mr-2 h-4 w-4 animate-spin" /> Salvando...</e.Fragment> : "Concluir Upload"}</p></me></le></ce><ce open={g} onOpenChange={N}><le className="sm:max-w-[425px]"><oe><de>Editar Informações</de></oe><div className="grid gap-4 py-4"><div className="space-y-2"><K htmlFor="edit-filename">Nome do Arquivo</K><P id="edit-filename" value={j} onChange={t => v(t.target.value)} /></div><div className="space-y-2"><K htmlFor="edit-category">Categoria</K><ue value={w} onValueChange={_}><xe><he /></xe><ge>{fe.map(t => <pe value={t}>{t}</pe>)}</ge></ue></div></div><me><p variant="outline" onClick={() => N(!1)} disabled={o.isPending}>Cancelar</p><p variant="cta" onClick={Ce} disabled={o.isPending || !j}>{o.isPending ? <e.Fragment><C className="mr-2 h-4 w-4 animate-spin" /> Atualizando...</e.Fragment> : "Salvar Alterações"}</p></me></le></ce><Y open={!!l} onOpenChange={t => !t && M(null)} title="Apagar mídia" description={l ? `Tem certeza que deseja apagar "${l.file_name}"? Esta ação não pode ser desfeita.` : ""} confirmLabel="Apagar" cancelLabel="Cancelar" variant="destructive" isLoading={r.isPending} onConfirm={_e} /></div>;
}
const je = {
  published: {
    label: "Publicado",
    color: "bg-green-500 hover:bg-green-600"
  },
  scheduled: {
    label: "Agendado",
    color: "bg-amber-500 hover:bg-amber-600"
  },
  draft: {
    label: "Rascunho",
    color: "bg-slate-500 hover:bg-slate-600"
  }
};
function ps() {
  const [a, s] = u.useState(!1),
    [n, r] = u.useState(""),
    [o, c] = u.useState("instagram"),
    [i, d] = u.useState(null),
    [b, m] = u.useState(null),
    {
      data: g = [],
      isLoading: N
    } = ve(),
    {
      data: j = []
    } = be(),
    v = ls(),
    w = os(),
    _ = () => {
      if (!n.trim()) return f.error("Escreva uma legenda para publicar.");
      v.mutate({
        content: n,
        platform: o,
        status: "published",
        asset_id: i,
        published_at: new Date().toISOString()
      }, {
        onSuccess: () => {
          f.success("Postagem publicada com sucesso!"), s(!1), r(""), d(null);
        }
      });
    },
    S = () => {
      if (!n.trim()) return f.error("Escreva uma legenda para agendar.");
      v.mutate({
        content: n,
        platform: o,
        status: "scheduled",
        asset_id: i
      }, {
        onSuccess: () => {
          f.success("Postagem agendada com sucesso!"), s(!1), r(""), d(null);
        }
      });
    },
    I = () => {
      b && w.mutate(b, {
        onSuccess: () => {
          f.success("Postagem removida."), m(null);
        }
      });
    };
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h3 className="text-lg font-medium">Postagens</h3><p className="text-sm text-muted-foreground">Crie e gerencie as publicações nas redes sociais.</p></div><p variant="cta" onClick={() => s(!a)}><We className="mr-2 h-4 w-4" />Nova Postagem</p></div>{a && <y className="border-primary/50 shadow-md"><D><A className="text-base">Criar Nova Publicação</A></D><k className="space-y-4"><rs placeholder="Escreva a legenda atrativa do seu imóvel..." value={n} onChange={l => r(l.target.value)} className="min-h-[120px]" /><div className="space-y-2"><p className="text-sm font-medium">Selecionar Mídia</p><div className="flex gap-2 overflow-x-auto pb-2">{j.map(l => <button onClick={() => d(l.id === i ? null : l.id)} className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${l.id === i ? "border-accent ring-2 ring-accent/20" : "border-border"}`}>{l.file_type === "image" ? <img src={l.publicUrl || ""} alt="" className="object-cover w-full h-full" /> : <div className="w-full h-full bg-muted flex items-center justify-center text-[10px]">Vídeo</div>}</button>)}</div></div><div className="flex items-center gap-4 pt-2"><span className="text-sm font-medium">Publicar em:</span><div className="flex gap-2"><U variant={o === "instagram" ? "default" : "outline"} className="cursor-pointer flex items-center gap-1" onClick={() => c("instagram")}><H className="h-3 w-3" /> Instagram</U><U variant={o === "facebook" ? "default" : "outline"} className="cursor-pointer flex items-center gap-1" onClick={() => c("facebook")}><J className="h-3 w-3" /> Facebook</U></div></div><div className="flex justify-end gap-2 pt-4"><p variant="outline" onClick={() => s(!1)}>Cancelar</p><p variant="outline" onClick={S} disabled={v.isPending}><$e className="mr-2 h-4 w-4" />Agendar</p><p variant="cta" onClick={_} disabled={v.isPending}>{v.isPending ? <C className="mr-2 h-4 w-4 animate-spin" /> : <He className="mr-2 h-4 w-4" />}Publicar Agora</p></div></k></y>}<div className="space-y-4"><h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Histórico Recente ({g.length})</h4>{N ? <div className="flex items-center justify-center py-12"><C className="h-8 w-8 animate-spin text-accent" /></div> : g.length === 0 ? <div className="text-center py-12 border-2 border-dashed rounded-lg"><$ className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-medium">Nenhuma postagem ainda</h3><p className="text-sm text-muted-foreground mt-1">Crie sua primeira postagem para aparecer aqui.</p></div> : g.map(l => {
        var x;
        const M = je[l.status] || je.draft,
          q = l.platform === "instagram";
        return <y><k className="p-4 flex items-start gap-4">{((x = l.asset) == null ? void 0 : x.file_type) === "image" ? <div className="h-20 w-20 bg-muted rounded-md shrink-0 flex items-center justify-center overflow-hidden"><img src={l.asset.publicUrl || ""} alt="" className="object-cover w-full h-full" /></div> : <div className="h-20 w-20 bg-muted rounded-md shrink-0 flex items-center justify-center"><$ className="h-8 w-8 text-muted-foreground" /></div>}<div className="flex-1 space-y-1 min-w-0"><div className="flex items-center justify-between gap-2"><div className="flex gap-2"><U className={M.color}>{M.label}</U><U variant="outline" className={q ? "text-pink-600 border-pink-200 bg-pink-50" : "text-blue-600 border-blue-200 bg-blue-50"}>{q ? <H className="h-3 w-3 mr-1" /> : <J className="h-3 w-3 mr-1" />}{q ? "Instagram" : "Facebook"}</U></div><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{l.created_at ? Je(new Date(l.created_at), "dd/MM/yy HH:mm", {
                      locale: is
                    }) : "—"}</span><button onClick={() => m(l.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Q className="h-4 w-4" /></button></div></div><p className="text-sm line-clamp-2 mt-2">{l.content}</p><div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground"><span>👁 {l.metrics_reach || 0} alcance</span><span>❤️ {l.metrics_engagement || 0} engajamento</span><span>� {l.metrics_clicks || 0} cliques</span></div></div></k></y>;
      })}</div><Y open={!!b} onOpenChange={l => !l && m(null)} title="Remover postagem" description="Tem certeza que deseja remover esta postagem? Esta ação não pode ser desfeita." confirmLabel="Remover" cancelLabel="Cancelar" variant="destructive" isLoading={w.isPending} onConfirm={I} /></div>;
}
const fs = qe("relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground", {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive [&>svg]:text-destructive"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }),
  Ne = u.forwardRef(({
    className: a,
    variant: s,
    ...n
  }, r) => <div ref={r} role="alert" className={R(fs({
    variant: s
  }), a)} />);
Ne.displayName = "Alert";
const we = u.forwardRef(({
  className: a,
  ...s
}, n) => <h5 ref={n} className={R("mb-1 font-medium leading-none tracking-tight", a)} />);
we.displayName = "AlertTitle";
const ye = u.forwardRef(({
  className: a,
  ...s
}, n) => <div ref={n} className={R("text-sm [&_p]:leading-relaxed", a)} />);
ye.displayName = "AlertDescription";
function js() {
  return G({
    queryKey: ["social-integrations"],
    queryFn: async () => {
      const {
        data: a,
        error: s
      } = await h.from("social_integrations").select("*").order("created_at", {
        ascending: !1
      });
      if (s) throw s;
      return a;
    }
  });
}
function vs() {
  const a = L();
  return E({
    mutationFn: async s => {
      const {
        data: n,
        error: r
      } = await h.rpc("get_my_tenant_id");
      if (r) throw r;
      const {
        data: o,
        error: c
      } = await h.from("social_integrations").insert({
        ...s,
        tenant_id: n
      }).select().single();
      if (c) throw c;
      return o;
    },
    onSuccess: () => {
      a.invalidateQueries({
        queryKey: ["social-integrations"]
      });
    }
  });
}
function bs() {
  const a = L();
  return E({
    mutationFn: async s => {
      const {
        error: n
      } = await h.from("social_integrations").delete().eq("id", s);
      if (n) throw n;
    },
    onSuccess: () => {
      a.invalidateQueries({
        queryKey: ["social-integrations"]
      });
    }
  });
}
function Ns() {
  const a = De(),
    {
      data: s = [],
      isLoading: n
    } = js(),
    {
      data: r,
      isLoading: o
    } = cs(),
    c = vs(),
    i = bs(),
    [d, b] = u.useState("facebook"),
    [m, g] = u.useState(""),
    [N, j] = u.useState(""),
    [v, w] = u.useState(""),
    [_, S] = u.useState(null),
    I = s.find(x => x.platform === "facebook"),
    l = s.find(x => x.platform === "instagram"),
    M = () => {
      if (!m.trim()) return f.error("Token de acesso é obrigatório.");
      c.mutate({
        platform: d,
        access_token: m,
        account_name: N || null,
        page_id: v || null,
        status: "active"
      }, {
        onSuccess: () => {
          f.success(`${d === "facebook" ? "Facebook" : "Instagram"} conectado com sucesso!`), g(""), j(""), w("");
        }
      });
    },
    q = () => {
      _ && i.mutate(_, {
        onSuccess: () => {
          f.success("Integração removida."), S(null);
        }
      });
    };
  return n ? <div className="flex items-center justify-center py-20"><C className="h-8 w-8 animate-spin text-accent" /></div> : <div className="space-y-6 max-w-3xl"><Ne><Z className="h-4 w-4" /><we>Configuração Necessária</we><ye>Para publicar automaticamente, conecte suas contas usando um Token de Acesso da Meta.</ye></Ne><div className="grid gap-6"><y><D className="flex flex-row items-center gap-4"><J className="h-8 w-8 text-blue-600" /><div><A>Página do Facebook</A><V>Publique diretamente na página da sua imobiliária.</V></div></D><k>{I ? <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-green-600 font-medium"><W className="h-5 w-5" /><span>{I.account_name || "Página Conectada"}</span></div><p variant="ghost" size="sm" onClick={() => S(I.id)}><Q className="h-4 w-4 mr-1" /> Desconectar</p></div> : <div className="space-y-3"><div className="flex gap-2"><P placeholder="Nome da conta/página" value={N} onChange={x => j(x.target.value)} /><P placeholder="Page ID (opcional)" value={v} onChange={x => w(x.target.value)} /></div><div className="flex items-center gap-4"><P type="password" placeholder="Cole seu User Access Token aqui" value={m} onChange={x => g(x.target.value)} /><p onClick={() => {
                b("facebook"), M();
              }} disabled={c.isPending || !m}>{c.isPending && d === "facebook" ? <C className="h-4 w-4 animate-spin" /> : "Conectar"}</p></div></div>}</k></y><y><D className="flex flex-row items-center gap-4"><H className="h-8 w-8 text-pink-600" /><div><A>Instagram Profissional</A><V>Agende postagens e acompanhe o engajamento.</V></div></D><k>{l ? <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-green-600 font-medium"><W className="h-5 w-5" /><span>{l.account_name || "Conta Conectada"}</span></div><p variant="ghost" size="sm" onClick={() => S(l.id)}><Q className="h-4 w-4 mr-1" /> Desconectar</p></div> : <div className="space-y-3"><div className="flex gap-2"><P placeholder="Nome da conta" value={N} onChange={x => j(x.target.value)} /><P placeholder="Page ID (opcional)" value={v} onChange={x => w(x.target.value)} /></div><div className="flex items-center gap-4"><P type="password" placeholder="Cole seu User Access Token aqui" value={m} onChange={x => g(x.target.value)} /><p onClick={() => {
                b("instagram"), M();
              }} disabled={c.isPending || !m}>{c.isPending && d === "instagram" ? <C className="h-4 w-4 animate-spin" /> : "Conectar"}</p></div></div>}</k></y><y><D className="flex flex-row items-center gap-4"><Ge className="h-8 w-8 text-emerald-500" /><div><A>WhatsApp Business</A><V>Atenda clientes via WhatsApp diretamente no sistema.</V></div></D><k>{o ? <div className="flex items-center gap-2 text-muted-foreground"><C className="h-4 w-4 animate-spin" /> Verificando status...</div> : (r == null ? void 0 : r.status) === "connected" ? <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-green-600 font-medium"><W className="h-5 w-5" /><span>{r.phone_number || "Conectado"}</span></div><p variant="outline" size="sm" onClick={() => a("/atendimento")}>Abrir Atendimento <ee className="h-4 w-4 ml-1" /></p></div> : <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-muted-foreground"><Z className="h-5 w-5" /><span>Desconectado</span></div><p size="sm" onClick={() => a("/atendimento")}>Conectar WhatsApp <ee className="h-4 w-4 ml-1" /></p></div>}</k></y></div><Y open={!!_} onOpenChange={x => !x && S(null)} title="Desconectar integração" description="Tem certeza que deseja desconectar esta integração? Você precisará reconectar para publicar novamente." confirmLabel="Desconectar" cancelLabel="Cancelar" variant="destructive" isLoading={i.isPending} onConfirm={q} /></div>;
}
function Qs() {
  const a = Ae(),
    [s, n] = u.useState(!1),
    [r, o] = u.useState(!1),
    c = [{
      name: "Dashboard",
      path: "/marketing"
    }, {
      name: "Mídias",
      path: "/marketing/assets"
    }, {
      name: "Postagens",
      path: "/marketing/posts"
    }, {
      name: "Integrações",
      path: "/marketing/integrations"
    }];
  return <div className="min-h-screen bg-background"><Le activeModule="marketing" onModuleChange={() => {}} collapsed={s} onCollapsedChange={n} /><Ee activeModule="marketing" onModuleChange={() => {}} open={r} onOpenChange={o} /><div className={R("transition-all duration-300", s ? "lg:pl-[72px]" : "lg:pl-64")}><Te title="Marketing" breadcrumbs={[{
        label: "Dashboard",
        href: "/"
      }, {
        label: "Marketing"
      }]} onMobileMenuClick={() => o(!0)} /><main className="p-4 lg:p-6"><div className="flex-1 space-y-4 w-full"><div className="border-b border-border"><nav className="-mb-px flex space-x-8" aria-label="Tabs">{c.map(i => {
                const d = a.pathname === i.path || i.path === "/marketing" && a.pathname === "/marketing/";
                return <Pe to={i.path} className={R(d ? "border-accent text-accent font-semibold" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground", "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors")}>{i.name}</Pe>;
              })}</nav></div><div className="mt-6"><Ie><z path="/" element=<ms /> /><z path="/assets" element=<gs /> /><z path="/posts" element=<ps /> /><z path="/integrations" element=<Ns /> /></Ie></div></div></main></div></div>;
}
export { Qs as default };