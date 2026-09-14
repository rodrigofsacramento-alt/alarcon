import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { cn } from "@/lib/utils";
import {
  Network,
  UserRound,
  BadgeCheck,
  Briefcase,
  Landmark,
  Users,
  Wrench,
  MonitorSmartphone,
  GitBranch,
  TrendingUp,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  ShieldQuestion,
} from "lucide-react";

// ─── Papéis definidos no PMBOK - Agencia Hut ───
const ROLES = [
  {
    id: "jota",
    nome: "Jota",
    cargo: "Proprietário",
    pmo: "Sponsor (Patrocinador) e Gestor de Portfólio",
    foco: "Comercial, Network e Direção de Negócios",
    grupos: "Iniciação, Monitoramento & Controle (nível estratégico)",
    icon: Briefcase,
    cor: "bg-primary/10 text-primary",
    resumo:
      "Aprova o Termo de Abertura (Project Charter), valida orçamentos e viabilidade financeira, e gerencia stakeholders estratégicos. Prospecta contas Enterprise, mas passa a execução para a operação. Revisa fluxo de caixa com Chloe e aprova limites de desconto.",
  },
  {
    id: "chris",
    nome: "Chris Racanelli",
    cargo: "Business Advisor & CRO",
    pmo: "Estrategista Chefe, Arquiteta de Soluções e Gestora de Mudanças",
    foco: "Estruturação, Neuropsicologia Corporativa, Escalabilidade e Otimização",
    grupos: "Planejamento, Execução, Monitoramento & Controle",
    icon: TrendingUp,
    cor: "bg-accent/10 text-accent",
    resumo:
      "Define escopo e cria a WBS, desenha a arquitetura das soluções, treina a equipe com neuropsicologia corporativa e conduz controle integrado de mudanças. Analisa conversão (CRO) com ciclo PDCA e faz auditorias de qualidade por amostragem.",
  },
  {
    id: "chloe",
    nome: "Chloe",
    cargo: "Financeiro",
    pmo: "Gestora de Custos, Aquisições e Gestora Financeira",
    foco: "Saúde financeira, controle de custos, Imigraciones e Compliance",
    grupos: "Planejamento, Execução, Monitoramento & Controle",
    icon: Landmark,
    cor: "bg-success/10 text-success",
    resumo:
      "Estima e controla custos, precifica serviços e garante margem. Faz dashboard de DRE, revisa fluxo de caixa com Jota, padroniza checklist de Imigraciones e gerencia contratos com fornecedores.",
  },
  {
    id: "luciana",
    nome: "Luciana",
    cargo: "Administração",
    pmo: "PMO Administrativo, Gestora da Informação e Compliance Documental",
    foco: "Documentação, organização de processos administrativos, encerramento e arquivo",
    grupos: "Planejamento, Execução, Monitoramento & Controle, Encerramento",
    icon: FileText,
    cor: "bg-warning/10 text-warning",
    resumo:
      "Arquiva projetos, organiza documentação e garante conformidade documental. Mantém estrutura de pastas padronizada por cliente, controla assinaturas (DocuSign) e registra lições aprendidas.",
  },
  {
    id: "igor",
    nome: "Igor",
    cargo: "Gerente de Vendas",
    pmo: "Gestor de Requisitos, Aquisição de Clientes e Líder de Equipe",
    foco: "Liderar a força de vendas, garantir o pipeline e fechar negócios",
    grupos: "Iniciação, Execução",
    icon: Users,
    cor: "bg-primary/10 text-primary",
    resumo:
      "Coleta requisitos (SPIN Selling), lidera a equipe de vendas (5 profissionais) com Daily de 15 min, controla o funil no CRM e acompanha conversão, ticket médio e ciclo de vendas.",
  },
  {
    id: "vendas",
    nome: "Equipe de Vendas (5)",
    cargo: "Vendedores",
    pmo: "Executores da Fase de Iniciação Comercial",
    foco: "Prospecção, qualificação, apresentação e fechamento",
    grupos: "Iniciação",
    icon: UserRound,
    cor: "bg-muted text-foreground",
    resumo:
      "Executam o processo comercial padronizado: qualificam leads, alimentam o CRM, movem oportunidades no funil Kanban, seguem limites de desconto aprovados e o escopo de serviços.",
  },
  {
    id: "sebastian",
    nome: "Sebastian",
    cargo: "Gerente Operacional",
    pmo: "Gerente de Execução (Delivery Manager) e Gestor de Recursos",
    foco: "Fazer a entrega acontecer no prazo e com os recursos certos",
    grupos: "Planejamento, Execução, Monitoramento & Controle",
    icon: Wrench,
    cor: "bg-accent/10 text-accent",
    resumo:
      "Planeja e estima recursos, direciona a execução e coordena o cronograma. Usa WBS da Chris, quadros Kanban e reajusta o plano proativamente em caso de atrasos.",
  },
  {
    id: "rodrigo",
    nome: "Rodrigo",
    cargo: "Sistemas e Marketing Digital",
    pmo: "Gestor de Comunicações Externas, Gestor de Conhecimento e Gestor de Tecnologia",
    foco: "Geração de leads, infraestrutura tecnológica e automação",
    grupos: "Planejamento, Execução, Monitoramento & Controle",
    icon: MonitorSmartphone,
    cor: "bg-success/10 text-success",
    resumo:
      "Planeja campanhas (pago e orgânico), analisa CAC, administra o CRM e o sistema de gestão de projetos, mantém integrações e automações e faz backups regulares.",
  },
];

// ─── Papéis faltantes (a preencher/treinar) ───
const GAPS = [
  {
    papel: "A. Gerente de Projetos (PMO / Project Manager)",
    processos: "Develop Schedule, Control Schedule, Monitor and Control Project Work, Manage Project Knowledge, Close Project, Lessons Learned",
    alocacao: "Temporário: Sebastian (suporte estrutura e treinamento de Chris)",
    icon: GitBranch,
  },
  {
    papel: "B. Analista de Qualidade (QA / Quality Assurance)",
    processos: "Plan Quality Management, Manage Quality, Control Quality",
    alocacao: "Temporário: Luciana (checklists) e Chris (auditoria estratégica)",
    icon: ClipboardCheck,
  },
  {
    papel: "C. Analista de Riscos",
    processos: "Plan Risk Management, Identify Risks, Perform Qualitative Risk Analysis, Plan Risk Responses, Monitor Risks",
    alocacao: "Temporário: Chris (visão estratégica) + Chloe (riscos financeiros)",
    icon: ShieldQuestion,
  },
];

// ─── Matriz RACI integral (extraída do doc PMBOK) ───
const RACI_ROWS: [string, string, string, string, string][] = [
  ["Develop Project Charter", "Chris", "Jota", "Igor", "Todos"],
  ["Identify Stakeholders", "Chris", "Jota", "Igor", "Todos"],
  ["Collect Requirements", "Igor + Vendas", "Igor", "Chris", "Sebastian"],
  ["Define Scope", "Chris", "Chris", "Igor", "Sebastian"],
  ["Create WBS", "Chris", "Chris", "Sebastian", "Todos"],
  ["Estimate Costs", "Chloe", "Chloe", "Chris", "Jota"],
  ["Determine Budget", "Chloe", "Jota", "Chris", "Todos"],
  ["Plan Resources", "Sebastian", "Sebastian", "Chris", "Chloe"],
  ["Estimate Duration", "[PMO]", "Sebastian", "Chris", "Chloe"],
  ["Develop Schedule", "[PMO]", "Sebastian", "Chris", "Chloe"],
  ["Plan Quality", "[QA]", "Chris", "Luciana", "Todos"],
  ["Plan Risks", "[Risco]", "Chris", "Chloe", "Todos"],
  ["Plan Communications", "Rodrigo", "Chris", "Jota", "Todos"],
  ["Plan Procurements", "Chloe", "Jota", "Luciana", "Todos"],
  ["Direct & Manage Work", "Sebastian + Equipe", "Sebastian", "Chris", "Jota"],
  ["Manage Communications", "Rodrigo", "Chris", "Todos", "Todos"],
  ["Manage Quality", "[QA]", "Chris", "Sebastian", "Todos"],
  ["Acquire Resources", "Sebastian", "Sebastian", "Chris", "Chloe"],
  ["Develop Team", "Chris", "Chris", "Igor, Sebastian", "Todos"],
  ["Manage Team", "Sebastian + Igor", "Sebastian", "Chris", "Jota"],
  ["Manage Stakeholder Engagement", "Chris + Jota", "Jota", "Todos", "Todos"],
  ["Monitor & Control Work", "Chris + Sebastian", "Chris", "[PMO]", "Jota"],
  ["Control Schedule", "[PMO]", "Sebastian", "Chris", "Jota"],
  ["Control Costs", "Chloe", "Chloe", "Chris", "Jota"],
  ["Control Quality", "[QA]", "Chris", "Sebastian", "Jota"],
  ["Monitor Risks", "[Risco]", "Chris", "Chloe", "Jota"],
  ["Control Procurements", "Chloe + Luciana", "Chloe", "Jota", "Todos"],
  ["Perform Integrated Change Control", "Chris", "Chris", "Jota", "Todos"],
  ["Monitor Stakeholder Engagement", "Chris", "Chris", "Jota", "Todos"],
  ["Close Project", "Chris + Luciana", "Chris", "Jota", "Todos"],
  ["Lessons Learned", "[PMO]", "Chris", "Todos", "Todos"],
];

const LEGEND: { letra: string; cor: string; sigla: string; desc: string }[] = [
  { letra: "R", sigla: "Responsible", desc: "Quem executa o trabalho", cor: "bg-primary text-primary-foreground" },
  { letra: "A", sigla: "Accountable", desc: "Responsável pelo resultado final (apenas um)", cor: "bg-warning text-warning-foreground" },
  { letra: "C", sigla: "Consulted", desc: "Fornece informações ou opinião", cor: "bg-accent text-accent-foreground" },
  { letra: "I", sigla: "Informed", desc: "Deve ser informado sobre o resultado", cor: "bg-muted text-muted-foreground" },
];

export default function Rh() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faseFiltro, setFaseFiltro] = useState<string>("todos");

  // Process groups (vertical) para o filtro
  const gruposFiltro = ["todos", "Iniciação", "Planejamento", "Execução", "Monitoramento & Controle", "Encerramento"];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="rh"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="rh"
        onModuleChange={() => {}}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className={cn("flex flex-col flex-1", sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <Header
          title="Recursos Humanos (RH)"
          subtitle="Organograma da empresa e matriz de responsabilidades RACI (PMBOK)"
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6 space-y-6">
          {/* Van inference: hero */}
          <div className="rounded-xl border border-border/40 bg-card/60 p-5 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-accent/10 flex items-center justify-center">
                <Network className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Estrutura PMBOK da Agência Hut
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mapeamento dos profissionais nos 5 grupos de processos do PMBOK (Iniciação,
                  Planejamento, Execução, Monitoramento &amp; Controle, Encerramento) e nas 10 áreas
                  de conhecimento, com matriz RACI de responsabilidades. Fonte: documento PMBOK —
                  Agência Hut (Manus AI).
                </p>
              </div>
            </div>
          </div>

          {/* Organograma */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-accent" />
              <h2 className="font-semibold text-foreground">Organograma</h2>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur">
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  {/* L1: Jota (dono) */}
                  <div className="flex justify-center">
                    <CardPessoa role={ROLES[0]} showResumo={false} />
                  </div>
                  <div className="flex justify-center">
                    <Linea />
                  </div>
                  {/* L2: Chris + Sebastian (governança/operação) */}
                  <div className="flex justify-center gap-3">
                    <CardPessoa role={ROLES[1]} showResumo={false} />
                    <CardPessoa role={ROLES[6]} showResumo={false} />
                  </div>
                  <div className="flex justify-center">
                    <Linea />
                  </div>
                  {/* L3: Poeiras líderes */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <CardPessoa role={ROLES[2]} showResumo={false} />
                    <CardPessoa role={ROLES[3]} showResumo={false} />
                    <CardPessoa role={ROLES[4]} showResumo={false} />
                    <CardPessoa role={ROLES[7]} showResumo={false} />
                  </div>
                  {/* L4: equipe vendas */}
                  <div className="flex justify-center mt-3">
                    <CardPessoa role={ROLES[5]} showResumo={false} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Papéis detalhados */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              <h2 className="font-semibold text-foreground">Papéis e Escopo por Profissional</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.id} className="rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center", r.cor)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{r.nome}</p>
                        <p className="text-sm text-muted-foreground">{r.cargo}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Papel PMBOK:</span> <span className="text-foreground">{r.pmo}</span></p>
                      <p><span className="text-muted-foreground">Foco:</span> <span className="text-foreground">{r.foco}</span></p>
                      <p><span className="text-muted-foreground">Grupos:</span> <span className="text-foreground">{r.grupos}</span></p>
                      <p className="text-muted-foreground leading-relaxed">{r.resumo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Papéis faltantes */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="font-semibold text-foreground">Papéis Faltantes (a Preencher ou Treinar)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {GAPS.map((g) => {
                const Icon = g.icon;
                return (
                  <div key={g.papel} className="rounded-xl border border-warning/30 bg-warning/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-warning" />
                      <p className="font-semibold text-foreground">{g.papel}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Processos: {g.processos}</p>
                    <p className="text-sm text-foreground"><span className="text-muted-foreground">Alocação: </span>{g.alocacao}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Matriz RACI */}
          <section>
            <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-accent" />
                <h2 className="font-semibold text-foreground">Matriz de Responsabilidades (RACI)</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {gruposFiltro.map((g) => (
                  <button
                    key={g}
                    onClick={() => setFaseFiltro(g)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      faseFiltro === g
                        ? "bg-accent/25 text-accent-foreground"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {g === "todos" ? "Todos" : g}
                  </button>
                ))}
              </div>
            </div>

            {/* Legenda */}
            <div className="mb-3 flex flex-wrap gap-2">
              {LEGEND.map((l) => (
                <div key={l.sigla} className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/60 px-3 py-1.5 text-xs">
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded font-bold", l.cor)}>{l.letra}</span>
                  <span className="font-medium text-foreground">{l.sigla}</span>
                  <span className="text-muted-foreground">— {l.desc}</span>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/60">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-xs text-muted-foreground">
                    <th className="px-4 py-3">Processo PMBOK</th>
                    <th className="px-4 py-3 text-center">R</th>
                    <th className="px-4 py-3 text-center">A</th>
                    <th className="px-4 py-3 text-center">C</th>
                    <th className="px-4 py-3 text-center">I</th>
                  </tr>
                </thead>
                <tbody>
                  {RACI_ROWS.map((row, idx) => {
                    const processo = row[0];
                    const [_, r, a, c, i] = row;
                    // filtro simples por palavra-chave
                    if (faseFiltro !== "todos") {
                      const fase = faseFiltro.toLowerCase().replace("& ", "").replace("controle", "control");
                      // Palavras-chave por fase para agrupar visualmente
                      const inFase =
                        (faseFiltro === "Iniciação" && /Charter|Stakeholders|Requirements|Scope|WBS/.test(processo)) ||
                        (faseFiltro === "Planejamento" && /Estimate|Budget|Resources|Duration|Schedule|Quality|Risks|Communications|Procurements|Scope|WBS/.test(processo)) ||
                        (faseFiltro === "Execução" && /Direct|Manage Communications|Manage Quality|Acquire|Develop Team|Manage Team|Manage Stakeholder Engagement/.test(processo)) ||
                        (faseFiltro === "Monitoramento & Controle" && /Monitor|Control/.test(processo)) ||
                        (faseFiltro === "Encerramento" && /Close|Lessons/.test(processo));
                      if (!inFase) return null;
                    }
                    return (
                      <tr key={idx} className="border-b border-border/20 hover:bg-white/5">
                        <td className="px-4 py-2.5 font-medium text-foreground">{processo}</td>
                        {[r, a, c, i].map((v, j) => (
                          <td key={j} className="px-4 py-2.5 text-center">
                            <span
                              title={v}
                              className={cn(
                                "inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs",
                                v.includes("[") ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"
                              )}
                            >
                              {v}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// ─── Componentes auxiliares ───
function CardPessoa({ role, showResumo }: { role: (typeof ROLES)[number]; showResumo: boolean }) {
  const Icon = role.icon;
  return (
    <div className="w-40 rounded-xl border border-border/40 bg-card/80 p-3 text-center shadow-sm">
      <div className={cn("mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg", role.cor)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-semibold text-foreground leading-tight">{role.nome}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{role.cargo}</p>
      {showResumo && <p className="mt-2 text-xs text-muted-foreground leading-snug">{role.resumo}</p>}
    </div>
  );
}

function Linea() {
  return <div className="h-5 w-px bg-border" />;
}
