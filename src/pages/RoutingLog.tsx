import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  useRoutingLog,
  RoutingLogRow,
  GrupoPeriodo,
  getPeriodos,
} from "@/hooks/use-routing-log";
import { useAuth } from "@/contexts/AuthContext";

// ---- Iconos (lucide) ----
import { ArrowUpRight } from "lucide-react";

const GRUPOS: { key: GrupoPeriodo; label: string }[] = [
  { key: "dia", label: "Día" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mês" },
];

const SOURCE_LABEL: Record<string, string> = {
  accept: "Aceitou",
  transfer: "Transferência",
  manual: "Asignación manual",
  auto: "Auto-direcionamento",
};

function fmtTimestamp(iso: string) {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 19);
}

export default function RoutingLog() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [grupo, setGrupo] = useState<GrupoPeriodo>("dia");
  const [periodoIdx, setPeriodoIdx] = useState(1); // por defecto "7 días"
  const periodos = getPeriodos();

  // Rango temporal según período seleccionado
  const hoy = new Date();
  const dias = periodos[periodoIdx].dias;
  const desde = dias === null ? null : (() => {
    const d = new Date(hoy);
    d.setHours(0, 0, 0, 0);
    if (dias > 0) d.setDate(d.getDate() - (dias - 1));
    return d;
  })();
  const hasta = new Date(hoy);

  const { data, isLoading, error } = useRoutingLog(desde, hasta, true);

  // ---- Agrupación día/semana/mes con contagem acumulativa ----
  interface GrupoFilas { clave: string; etiqueta: string; filas: RoutingLogRow[]; }
  const grupos: GrupoFilas[] = [];
  const acum: Record<string, number> = {};
  const claveDe = {
    dia: (f: RoutingLogRow) => f.dia_asuncion,
    semana: (f: RoutingLogRow) => f.semana_asuncion,
    mes: (f: RoutingLogRow) => f.mes_asuncion,
  }[grupo];
  const etiquetaDe = {
    dia: (c: string) => c,
    semana: (c: string) => {
      const [y, w] = c.split("-");
      return `Sem ${w} · ${y}`;
    },
    mes: (c: string) => c,
  }[grupo];

  if (data) {
    for (const f of data) {
      const clave = claveDe(f) || "sin-fecha";
      acum[clave] = (acum[clave] || 0) + 1;
      const g = grupos.find(g => g.clave === clave);
      if (g) g.filas.push(f);
      else {
        const etiqueta = clave === "sin-fecha" ? "Sin fecha" : etiquetaDe(clave);
        grupos.push({ clave, etiqueta, filas: [f] });
      }
    }
  }

  const totalGlobal = data?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="routing-log"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="routing-log"
        onModuleChange={() => {}}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "flex flex-col flex-1",
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <Header
          title="Log de Direcionamentos"
          subtitle="Registro de cada atendimento dirigido a um corretor"
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
          {/* Controles: período + grupo */}
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border/40 bg-card/60 p-3 backdrop-blur shadow-lg">
            <span className="text-xs text-muted-foreground">Período:</span>
            {periodos.map((p, i) => (
              <button
                key={p.etiqueta}
                onClick={() => setPeriodoIdx(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  i === periodoIdx
                    ? "bg-accent/25 text-accent-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {p.etiqueta}
              </button>
            ))}
            <span className="mx-2 text-xs text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground">Agrupar por:</span>
            {GRUPOS.map((g) => (
              <button
                key={g.key}
                onClick={() => setGrupo(g.key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  grupo === g.key
                    ? "bg-accent/25 text-accent-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {g.label}
              </button>
            ))}
            <span className="ml-auto font-mono text-sm text-foreground">
              Total: <span className="text-accent-foreground">{totalGlobal}</span>
            </span>
          </div>

          {/* Estados */}
          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              Erro ao cargar o log: {error.message}
            </div>
          )}
          {isLoading && (
            <div className="rounded-xl border border-border/40 bg-card/60 p-6 text-sm text-muted-foreground">
              Caricando direcionamentos…
            </div>
          )}
          {!isLoading && !error && totalGlobal === 0 && (
            <div className="rounded-xl border border-border/40 bg-card/60 p-6 text-sm text-muted-foreground">
              Não há direcionamentos registrados no período seleccionado.
            </div>
          )}

          {/* Listado por grupos */}
          {grupos.map((g) => (
            <div key={g.clave} className="mb-4 overflow-hidden rounded-xl border border-border/40 bg-card/60">
              <div className="flex items-center justify-between border-b border-border/40 px-4 py-2 bg-accent/10">
                <span className="text-sm font-semibold text-foreground">{g.etiqueta}</span>
                <span className="text-xs text-muted-foreground">
                  {g.filas.length} direcionamento{g.filas.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-xs text-muted-foreground">
                      <th className="px-3 py-2">Contato (WhatsApp)</th>
                      <th className="px-3 py-2">Corretor</th>
                      <th className="px-3 py-2">Fuente</th>
                      <th className="px-3 py-2">Hora (Asunción)</th>
                      <th className="px-3 py-2">Abrir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.filas.map((f) => (
                      <tr key={f.id} className="border-b border-border/20 hover:bg-white/5">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {f.kard_avatar ? (
                              <img
                                src={f.kard_avatar}
                                alt=""
                                className="h-7 w-7 rounded-full object-cover"
                              />
                            ) : (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs text-accent-foreground">
                                {f.kard_nombre?.slice(0, 1)?.toUpperCase() || "?"}
                              </span>
                            )}
                            <div className="leading-tight">
                              <span className="block font-medium text-foreground">{f.kard_nombre}</span>
                              <span className="block font-mono text-xs text-muted-foreground">{f.kard_phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-foreground">
                          {f.corretor_destino}
                          {f.corretor_anterior && f.corretor_anterior !== f.corretor_destino && (
                            <span className="block text-xs text-muted-foreground">
                              ← {f.corretor_anterior}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span className="rounded-full border border-border/40 px-2 py-0.5 text-xs text-muted-foreground">
                            {SOURCE_LABEL[f.source] || f.source}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                          {fmtTimestamp(f.assigned_at_asuncion)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => navigate(f.deep_link)}
                            title="Abrir conversa"
                            className="inline-flex items-center gap-1 rounded-lg border border-border/40 bg-accent/15 px-2 py-1 text-xs text-accent-foreground hover:bg-accent/25"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" /> Abrir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}