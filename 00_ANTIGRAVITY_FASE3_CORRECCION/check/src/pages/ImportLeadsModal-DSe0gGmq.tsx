/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/ImportLeadsModal-DSe0gGmq.js | AST | sanitizado | Fase 3 ==*/
import { u as V, j as e } from "@/components/query";
import { r as l } from "@/components/vendor-Jm1Lk";
import { r as Z, u as J } from "@/components/xlsx";
import { B as A, s as B, a as N } from "@/components/index-C9";
import { D as W, a as X, b as Y, c as ee } from "@/components/ui/dialog";
import { u as se } from "@/hooks/useAgents";
import { N as te, F as K, L as M, r as D, v as x } from "@/components/ui";
function xe({
  open: O,
  onOpenChange: S
}) {
  const {
      data: E = []
    } = se(),
    I = V(),
    b = l.useRef(null),
    [u, h] = l.useState(1),
    [ae, f] = l.useState(null),
    [ne, L] = l.useState(!1),
    [v, y] = l.useState(!1),
    [r, P] = l.useState([]),
    Q = t => {
      var n;
      const a = (n = t.target.files) == null ? void 0 : n[0];
      a && (f(a), k(a));
    },
    R = t => {
      var n;
      t.preventDefault();
      const a = (n = t.dataTransfer.files) == null ? void 0 : n[0];
      a && (f(a), k(a));
    },
    k = async t => {
      L(!0), h(2);
      try {
        const a = await t.arrayBuffer(),
          n = Z(a),
          o = n.SheetNames[0],
          p = n.Sheets[o],
          d = J.sheet_to_json(p).map(s => {
            const c = s.Nome || s["Nome do contato"] || [s["Primeiro Nome"], s["Último Nome"]].filter(Boolean).join(" ") || "",
              g = (s.Número || s.Telefone || s.Phone || s["Número de telefone"] || "").toString(),
              w = (s.Email || s["E-mail"] || s["e-mail"] || "").toString().trim(),
              m = (s.Agente || s["Agente "] || "").toString().trim(),
              H = s.Grupo ? [s.Grupo.toString()] : [],
              j = [];
            s.CPF && j.push(`CPF: ${s.CPF}`), s["Data Nascimento"] && j.push(`Nasc: ${s["Data Nascimento"]}`), s.Empresa && j.push(`Empresa: ${s.Empresa}`);
            const U = j.join(" | ");
            let C = null;
            if (m) {
              const T = E.find($ => $.full_name.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes($.full_name.toLowerCase().split(" ")[0]));
              T && (C = T.id);
            }
            let _ = "valid";
            return c ? m && !C && (_ = "invalid_agent") : _ = "missing_name", {
              originalName: c,
              name: c,
              phone: g,
              email: w,
              originalAgent: m,
              responsible_id: C,
              notes: U,
              tags: H,
              status: _
            };
          });
        P(d), h(3);
      } catch (a) {
        console.error(a), N.error("Erro ao ler o arquivo. Verifique o formato."), h(1), f(null);
      } finally {
        L(!1);
      }
    },
    z = async () => {
      y(!0);
      try {
        const a = r.filter(s => s.status === "valid" || s.status === "invalid_agent").map(s => ({
            name: s.name,
            phone: s.phone,
            email: s.email || null,
            responsible_id: s.responsible_id,
            notes: s.notes,
            stage: "Lead Cadastrado",
            source: "Outros",
            tags: s.tags || []
          })),
          {
            data: n,
            error: o
          } = await B.from("leads").select("phone").not("phone", "is", null);
        if (o) throw o;
        const p = new Set(n.map(s => s.phone)),
          i = [];
        for (const s of a) s.phone && p.has(s.phone) || (s.phone && p.add(s.phone), i.push(s));
        if (i.length === 0) {
          N.info("Nenhum lead importado: todos os telefones já existem no sistema."), y(!1);
          return;
        }
        const d = 100;
        for (let s = 0; s < i.length; s += d) {
          const c = i.slice(s, s + d),
            {
              error: g
            } = await B.from("leads").insert(c);
          if (g) throw g;
          s + d < a.length && (await new Promise(w => setTimeout(w, 300)));
        }
        N.success(`${i.length} leads importados com sucesso!`), I.invalidateQueries({
          queryKey: ["leads"]
        }), I.invalidateQueries({
          queryKey: ["dashboard-stats"]
        }), S(!1);
      } catch (t) {
        console.error(t), N.error(`Erro na importação: ${t.message}`);
      } finally {
        y(!1);
      }
    },
    q = () => {
      h(1), f(null), P([]);
    },
    G = r.filter(t => t.status === "valid").length,
    F = r.filter(t => t.status === "invalid_agent").length;
  return <W open={O} onOpenChange={t => {
    t || q(), S(t);
  }}><X className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0"><div className="bg-card border-b border-border px-6 py-5"><Y><ee className="text-xl font-semibold flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><te className="h-5 w-5 text-accent" /></div><div><span>Importação Inteligente de Leads</span><p className="text-sm font-normal text-muted-foreground mt-0.5">Importe planilhas brutas (.xlsx, .csv) e mapeie automaticamente</p></div></ee></Y></div><div className="flex-1 overflow-y-auto p-6">{u === 1 && <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer" onDragOver={t => t.preventDefault()} onDrop={R} onClick={() => {
          var t;
          return (t = b.current) == null ? void 0 : t.click();
        }}><K className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-medium text-foreground mb-2">Arraste sua planilha aqui ou clique para selecionar</h3><p className="text-sm text-muted-foreground max-w-sm mb-6">Formatos aceitos: .xlsx, .csv. O sistema padronizará os campos e mapeará os agentes automaticamente.</p><A variant="secondary" onClick={t => {
            var a;
            t.stopPropagation(), (a = b.current) == null || a.click();
          }}>Selecionar Arquivo</A><input type="file" ref={b} className="hidden" accept=".xlsx,.csv" onChange={Q} /></div>}{u === 2 && <div className="flex flex-col items-center justify-center py-12"><M className="h-8 w-8 animate-spin text-accent mb-4" /><h3 className="text-lg font-medium">Processando e padronizando dados...</h3></div>}{u === 3 && <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4"><div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><K className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{r.length}</p><p className="text-sm text-muted-foreground">Total Encontrados</p></div></div><div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4"><div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success"><D className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{G}</p><p className="text-sm text-muted-foreground">Prontos / Mapeados</p></div></div><div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4"><div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center text-warning"><x className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{F}</p><p className="text-sm text-muted-foreground">Agente não encontrado</p></div></div></div>{F > 0 && <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex gap-3 text-warning-foreground text-sm"><x className="h-5 w-5 shrink-0 text-warning" /><p>Alguns leads possuem um Agente preenchido na planilha que não foi encontrado no banco de dados. Eles serão importados, mas sem responsável definido.</p></div>}<div className="border border-border rounded-xl overflow-hidden"><div className="max-h-[400px] overflow-y-auto"><table className="w-full text-sm"><thead className="bg-muted sticky top-0"><tr><th className="p-3 text-left font-medium">Status</th><th className="p-3 text-left font-medium">Nome</th><th className="p-3 text-left font-medium">E-mail</th><th className="p-3 text-left font-medium">Telefone</th><th className="p-3 text-left font-medium">Agente Identificado</th><th className="p-3 text-left font-medium">Dados Agrupados (Notes)</th></tr></thead><tbody className="divide-y divide-border">{r.slice(0, 100).map((t, a) => {
                    var n;
                    return <tr className="hover:bg-muted/30"><td className="p-3">{t.status === "valid" && <D className="h-4 w-4 text-success" />}{t.status === "invalid_agent" && <x className="h-4 w-4 text-warning" title="Agente não encontrado" />}{t.status === "missing_name" && <x className="h-4 w-4 text-destructive" title="Nome faltando" />}</td><td className="p-3 font-medium">{t.name || "-"}</td><td className="p-3 text-muted-foreground">{t.email || "-"}</td><td className="p-3 text-muted-foreground">{t.phone || "-"}</td><td className="p-3">{t.responsible_id ? <span className="text-success font-medium flex items-center gap-1"><D className="h-3 w-3" />{((n = E.find(o => o.id === t.responsible_id)) == null ? void 0 : n.full_name) || t.originalAgent}</span> : t.originalAgent ? <span className="text-warning flex items-center gap-1"><x className="h-3 w-3" />{t.originalAgent} (Não achou)</span> : <span className="text-muted-foreground">-</span>}</td><td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate" title={t.notes}>{t.notes || "-"}</td></tr>;
                  })}</tbody></table></div>{r.length > 100 && <div className="p-3 text-center text-sm text-muted-foreground border-t border-border bg-muted/30">Mostrando 100 de {r.length} leads.</div>}</div></div>}</div>{u === 3 && <div className="bg-card border-t border-border px-6 py-4 flex justify-end gap-3"><A variant="outline" onClick={q} disabled={v}>Cancelar / Escolher outro arquivo</A><A variant="cta" onClick={z} disabled={v || r.filter(t => t.status !== "missing_name").length === 0}>{v ? <e.Fragment><M className="mr-2 h-4 w-4 animate-spin" />Importando...</e.Fragment> : `Confirmar Importação de ${r.filter(t => t.status !== "missing_name").length} Leads`}</A></div>}</X></W>;
}
export { xe as I };