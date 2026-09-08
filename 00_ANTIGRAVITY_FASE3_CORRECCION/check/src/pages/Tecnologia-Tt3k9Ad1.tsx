/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/Tecnologia-Tt3k9Ad1.js | AST | sanitizado | Fase 3 ==*/
import { r as e } from "@/components/vendor-Jm1Lk";
import { s as E } from "@/components/index-C9";
var {
    useState: g,
    useEffect: j,
    useRef: J,
    useCallback: A,
    useMemo: W
  } = e,
  w = [{
    key: "a_analisar",
    label: "A Analisar",
    dot: "#f59e0b"
  }, {
    key: "a_executar",
    label: "A Executar",
    dot: "#3b82f6"
  }, {
    key: "executando",
    label: "Em Execu\xE7\xE3o",
    dot: "#8b5cf6"
  }, {
    key: "executado",
    label: "Executado",
    dot: "#10b981"
  }],
  _ = {
    a_analisar: ["nao_especificado"],
    a_executar: ["nao_especificado"],
    executando: ["em_planejamento", "em_aplicacao", "em_validacao"],
    executado: ["atualizado", "backup_realizado"]
  },
  O = {
    nao_especificado: "N\xE3o especificado",
    em_planejamento: "Em Planejamento",
    em_aplicacao: "Em Aplica\xE7\xE3o",
    em_validacao: "Em Valida\xE7\xE3o (QA)",
    atualizado: "Atualizado em Produ\xE7\xE3o",
    backup_realizado: "Backup Realizado (GitHub)"
  },
  v = {
    critica: "Cr\xEDtica",
    alta: "Alta",
    media: "M\xE9dia",
    baixa: "Baixa"
  },
  N = {
    critica: {
      bg: "#fef2f2",
      text: "#dc2626",
      border: "#fecaca"
    },
    alta: {
      bg: "#fef2f2",
      text: "#dc2626",
      border: "#fecaca"
    },
    media: {
      bg: "#fffbeb",
      text: "#d97706",
      border: "#fde68a"
    },
    baixa: {
      bg: "#ecfdf5",
      text: "#059669",
      border: "#a7f3d0"
    }
  },
  S = ["Frontend & UI", "Central de Chat & Agenda", "Im\xF3veis & Cat\xE1logo", "Backend & WhatsApp", "DevOps & VPS", "Autentica\xE7\xE3o & Seguran\xE7a", "Geral"],
  T = ["Diretoria", "Comercial & Vendas / Atendimento", "Jur\xEDdico & Contratos", "Opera\xE7\xF5es", "Tecnologia", "Geral"];
function B(t) {
  return {
    id: t.id,
    code: t.code || `TCK-${String(Math.floor(100 + Math.random() * 900))}`,
    title: t.title,
    description: t.description || "",
    module: t.module || "Geral",
    requesterName: t.requester_name || "Equipe Interna",
    requesterRole: t.requester_role || "",
    requesterDepartment: t.requester_department || "Opera\xE7\xF5es",
    priority: t.priority || "media",
    main_status: t.main_status || "a_analisar",
    subcategory: t.subcategory || "nao_especificado",
    delivery_forecast: t.delivery_forecast || "",
    assigned_to: t.assigned_to || "Squad Ahut Tech",
    impact_level: t.impact_level || "M\xE9dio",
    is_ai_triaged: !!t.is_ai_triaged,
    business_impact: t.business_impact || "",
    acceptance_criteria: t.acceptance_criteria || [],
    created_at: t.created_at,
    updated_at: t.updated_at
  };
}
function $(t) {
  return {
    id: t.id,
    code: t.code,
    title: t.title,
    description: t.description,
    module: t.module,
    requester_name: t.requesterName,
    requester_role: t.requesterRole,
    requester_department: t.requesterDepartment,
    priority: t.priority,
    main_status: t.main_status,
    subcategory: t.subcategory,
    delivery_forecast: t.delivery_forecast || null,
    assigned_to: t.assigned_to,
    impact_level: t.impact_level,
    is_ai_triaged: t.is_ai_triaged,
    business_impact: t.business_impact,
    acceptance_criteria: t.acceptance_criteria || [],
    updated_at: new Date().toISOString()
  };
}
var p = {
  Plus: t => <svg />,
  Search: t => <svg />,
  X: t => <svg />,
  Trash: t => <svg />,
  Edit: t => <svg />,
  Eye: t => <svg />,
  Calendar: t => <svg />,
  Grip: t => <svg />
};
function L() {
  return `TCK-2026-${String(Math.floor(100 + Math.random() * 900))}`;
}
function z(t) {
  if (!t) return "Sem previs\xE3o";
  let r = String(t).split("-");
  return r.length === 3 ? `${r[2]}/${r[1]}/${r[0]}` : t;
}
function q(t) {
  return t = Object.assign({}, t), t.style = Object.assign({
    wordWrap: "normal",
    lineHeight: "1.5",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical"
  }, t.style || {}), t;
}
function G() {
  let [t, r] = g([]),
    [m, i] = g(!0),
    [o, u] = g(null),
    c = A(async () => {
      try {
        let {
          data: l,
          error: d
        } = await E.from("technology_tickets").select("*").order("created_at", {
          ascending: !1
        });
        if (d) throw d;
        r((l || []).map(B)), u(null);
      } catch (l) {
        console.warn("[Tecnologia] erro ao buscar:", l && l.message), u(l && l.message);
      } finally {
        i(!1);
      }
    }, []);
  return j(() => {
    c();
    let l = E.channel("tech-tickets-kanban").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "technology_tickets"
    }, () => c()).subscribe();
    return () => {
      E.removeChannel(l);
    };
  }, [c]), {
    tickets: t,
    loading: m,
    error: o,
    refetch: c
  };
}
async function D(t) {
  let r = $(t);
  r.code || (r.code = L());
  let {
    data: m,
    error: i
  } = await E.from("technology_tickets").upsert(r, {
    onConflict: "id"
  }).select().single();
  if (i) throw i;
  return B(m);
}
async function U(t) {
  let {
    error: r
  } = await E.from("technology_tickets").delete().eq("id", t);
  if (r) throw r;
}
function H({
  ticket: t,
  onOpen: r,
  onEdit: m,
  onDelete: i,
  onMove: o
}) {
  let [u, c] = g(!1),
    l = N[t.priority] || N.media;
  return <div className="group relative bg-white hover:bg-gray-50 border border-gray-200 hover:border-orange-300 rounded-xl p-3.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-3" style={{
    wordWrap: "normal",
    lineHeight: "1.5"
  }} />;
}
function V({
  open: t,
  ticket: r,
  onClose: m,
  onSave: i
}) {
  let [o, u] = g({}),
    c = !!r;
  if (j(() => {
    t && u(r ? {
      ...r,
      subcategory: r.subcategory || "nao_especificado",
      priority: r.priority || "media"
    } : {
      id: "ticket-" + Date.now(),
      code: L(),
      title: "",
      description: "",
      module: S[0],
      requesterName: "",
      requesterRole: "Colaborador",
      requesterDepartment: T[0],
      priority: "media",
      main_status: "a_analisar",
      subcategory: "nao_especificado",
      delivery_forecast: "",
      assigned_to: "Squad Ahut Tech",
      impact_level: "M\xE9dio",
      is_ai_triaged: !1
    });
  }, [t, r]), !t) return null;
  let l = a => u(x => ({
      ...x,
      ...a
    })),
    d = _[o.main_status] || ["nao_especificado"];
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" />;
}
function F({
  ticket: t,
  onClose: r,
  onEdit: m,
  onDelete: i,
  onMove: o
}) {
  if (!t) return null;
  let u = N[t.priority] || N.media;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" />;
}
function K() {
  let {
      tickets: t,
      loading: r,
      error: m,
      refetch: i
    } = G(),
    [o, u] = g(""),
    [c, l] = g(!1),
    [d, a] = g(null),
    [x, h] = g(null),
    [k, C] = g(null),
    y = A(n => {
      C(n), setTimeout(() => C(null), 2500);
    }, []),
    I = W(() => {
      let n = o.trim().toLowerCase();
      return n ? t.filter(s => `${s.title} ${s.description} ${s.code} ${s.module} ${s.requesterName}`.toLowerCase().includes(n)) : t;
    }, [t, o]),
    P = async n => {
      try {
        await D(n), y(d ? "Chamado atualizado \u2705" : "Chamado criado \u2705"), l(!1), a(null), i();
      } catch (s) {
        console.error(s), y("Erro ao salvar: " + (s && s.message));
      }
    },
    M = async n => {
      if (window.confirm("Excluir o chamado " + n.code + "?")) try {
        await U(n.id), y("Chamado exclu\xEDdo \u{1F5D1}\uFE0F"), h(null), i();
      } catch (s) {
        console.error(s), y("Erro ao excluir: " + (s && s.message));
      }
    },
    R = async (n, s, f) => {
      try {
        await D({
          ...t.find(b => b.id === n),
          main_status: s,
          subcategory: f
        }), y("Status atualizado");
      } catch (b) {
        console.error(b), y("Erro: " + (b && b.message));
      }
    };
  return <div className="min-h-screen bg-gray-50 p-4 md:p-6" />;
}
export { K as default };