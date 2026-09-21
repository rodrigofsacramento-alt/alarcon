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
  CheckCircle2,
} from "lucide-react";

// ─── Papéis definidos no Modelo de Operação Ahut ───
const ROLES = [
  {
    id: "jota",
    nome: "Jota",
    cargo: "Proprietário",
    pmo: "Patrocinador do Negócio e Diretor de Portfólio",
    foco: "Comercial, Network e Direção de Negócios",
    grupos: "Geração de Leads, Acompanhamento no CRM (nível estratégico)",
    icon: Briefcase,
    cor: "bg-primary/10 text-primary",
    resumo:
      "Aprova a abertura de propostas e contratos, valida orçamentos e viabilidade financeira, e gerencia os clientes-chave. Prospecta contas Enterprise, mas repassa a execução para a operação. Revisa o fluxo de caixa com Chloe e aprova limites de desconto.",
    responsabilidades: [
      "Responsável por geração e liberação de Leads",
      "Responsável por liderar as vendas das casas",
      "Responsável por toda e qualquer aprovação das vendas e negociação",
      "Responsável por Orçamentos e liberação das negociações",
      "Responsável por descontos e valores nas parcelas",
      "Responsável por permitir a liberação de descontos para os vendedores",
      "Responsável por solicitação de atualização no sistema, incluindo o acompanhamento / efetivação dos testes",
      "Responsável por compra, inclusões de plataformas, registro e upgrade de ferramentas do sistema",
      "Responsável por incluir novos negócios imobiliários - loteadoras e empreendimentos",
      "Responsável por todo e qualquer entrada de novos negócios",
    ],
  },
  {
    id: "chris",
    nome: "Chris Racanelli",
    cargo: "Business Advisor & CRO",
    pmo: "Estrategista Chefe, Arquiteta de Soluções e Gestora de Crescimento",
    foco: "Estructuración, Neuropsicologia Corporativa, Escalabilidade e Otimização",
    grupos: "Qualificación & Proposta, Atendimento & Venda, Acompanhamento no CRM",
    icon: TrendingUp,
    cor: "bg-accent/10 text-accent",
    resumo:
      "Define o escopo do serviço e estrutura o plano de trabalho, desenha a arquitetura das soluções, treina a equipe com neuropsicologia corporativa e conduz o controle de mudanças de escopo. Analiza la conversión (CRO) en ciclos de mejora continua y hace auditorías de calidad por muestreo.",
    responsabilidades: [
      "Assume o Controle Operacional: poder executivo para tomar decisões difíceis e imediatas",
      "Preserva o Caixa: estanca a perda de dinheiro, corta custos cortantes e administra a liquidez de curto prazo",
      "Reorganiza o Negócio: vende ativos que não são o foco da empresa (no-core) e fecha divisões que dão prejuízo",
      "Auditoria de Recebíveis: rastreamento de todos os recursos que entraram",
      "Mapeia os recebíveis futuros",
      "Implementação de DRE e Fluxo de Caixa: demonstrações financeiras profissionais e semanais",
    ],
  },
  {
    id: "chloe",
    nome: "Chloe",
    cargo: "Financeiro",
    pmo: "Gestora Financeira, de Custos e de Aquisições",
    foco: "Saúde financeira, controlo de custos, Imigraciones e Compliance",
    grupos: "Qualificación & Proposta, Atendimento & Venda, Acompanhamento no CRM",
    icon: Landmark,
    cor: "bg-success/10 text-success",
    resumo:
      "Estima e controla custos, precifica serviços e garante margen. Faz o dashboard de DRE, revisa o fluxo de caixa com Jota, padroniza o checklist de Imigraciones e gerencia contratos com fornecedores.",
    responsabilidades: [
      "Preenche todos os dados e alimenta o sistema financeiro com informações diárias",
      "Responsável pelo fluxo de caixa desde sua entrada, até a colocação de cada informação para que haja competência na formulação do DRE",
    ],
  },
  {
    id: "luciana",
    nome: "Luciana",
    cargo: "Auxiliar Administrativo",
    pmo: "Auxiliar Administrativo, da Información e de Compliance Documental",
    foco: "Documentação, organização de processos administrativos, encerramento e arquivo",
    grupos: "Qualificação & Proposta, Atendimento & Venda, Acompanhamento no CRM, Fechamento & Pós-venda",
    icon: FileText,
    cor: "bg-warning/10 text-warning",
    resumo:
      "Arquiva projetos, organiza a documentação e garante a conformidade documental. Mantém a estrutura de pastas padronizada por cliente, controla assinaturas (DocuSign) e registra lições aprendidas.",
    responsabilidades: [],
  },
  {
    id: "igor",
    nome: "Igor",
    cargo: "Gerente de Vendas",
    pmo: "Gestor de Necessidades, Distribución do Funil (CRM) e Líder da Equipe Comercial",
    foco: "Acompañar a la equipe na transacción de vendas e controlar o funil no CRM",
    grupos: "Acompanhamento de grupos de Leads, Atendimento & Venda",
    icon: Users,
    cor: "bg-primary/10 text-primary",
    resumo:
      "Faz toda a distribuição e controla o funil no CRM, acompanha todo o processo de conversão de vendas, negocia junto aos vendedores e faz a ponte da negociação com Jota. Lidera a equipe de vendas (5 profissionais) com Daily de 15 min.",
    responsabilidades: [
      "Acompanha a equipe na transação de vendas",
      "Faz toda a distribuição e controla o funil no CRM",
      "Acompanha todo o processo de conversão de vendas",
      "Negocia junto aos vendedores e faz a ponte da negociação com Jota",
    ],
  },
  {
    id: "vendas",
    nome: "Equipe de Vendas (5)",
    cargo: "Vendedores",
    pmo: "Executores do Fluxo de Geração e Atendimento Comercial",
    foco: "Prospección, cualificación, presentación e fechamento",
    grupos: "Geração de Leads, Atendimento & Venda",
    icon: UserRound,
    cor: "bg-muted text-foreground",
    resumo:
      "Executan o proceso comercial estandarizado: cualifican leads, alimentan o CRM, moven oportunidades no funil Kanban, seguen límites de desconto aprobados e o escopo de servicios.",
    responsabilidades: [],
  },
  {
    id: "sebastian",
    nome: "Sebastian",
    cargo: "Gerente Operacional",
    pmo: "Gerente de Operación, Entrega e Recursos",
    foco: "Facer a entrega acontecer no prazo e cos recursos correctos",
    grupos: "Qualificación & Proposta, Atendimento & Venda, Acompanhamento no CRM",
    icon: Wrench,
    cor: "bg-accent/10 text-accent",
    resumo:
      "Planifica e estima recursos, direcciona a execución e coordena o cronograma. Usa o plan de traballo da Chris, cadros Kanban e reajusta o plan proactivamente en caso de atrasos.",
    responsabilidades: [],
  },
  {
    id: "rodrigo",
    nome: "Rodrigo",
    cargo: "Programador de Sistema",
    pmo: "Programador de Sistema para Infraestructura Tecnológica e Automação",
    foco: "Administração do Sistema, integrações e automação, análise de CAC, backup e acompanhamento de campanhas",
    grupos: "Administração do Sistema, acompanhamento do sistema de gestão, integrações e automatizaciones personalizadas, análises de cac, backup de sistema, verificação e acompanhamento de CRM, acompanhamento de campanhas de tráfico junto a Jota",
    icon: MonitorSmartphone,
    cor: "bg-success/10 text-success",
    resumo:
      "Programador responsável pela infraestructura tecnológica e automação. Administra o sistema de gestão, mantém integrações e automatizaciones personalizadas, analiza o CAC, faz backups e acompanha campanhas de tráfico junto a Jota. Organiza e ajusta o sistema mediante solicitudes programadas pelo propietario.",
    responsabilidades: [
      "Administração do Sistema",
      "Acompanhamento do sistema de gestão",
      "Integrações e automatizaciones personalizadas",
      "Análises de CAC",
      "Backup de sistema",
      "Verificação e acompanhamento de CRM",
      "Acompanhamento de campanhas de tráfico junto a Jota",
      "Organização e ajustes no sistema mediante solicitudes programadas pelo propietario",
    ],
  },
];

// ─── Papéis faltantes (a preencher/treinar) ───
const GAPS = [
  {
    papel: "A. Coordenador de Fluxo Operacional",
    processos: "Controlar cronograma e prazos, acompanhar o trabalho no CRM, organizar o conhecimento e encerrar com lições aprendidas",
    alocacao: "Temporário: Sebastian (suporte de estrutura e treinamento de Chris)",
    icon: GitBranch,
  },
  {
    papel: "B. Analista de Qualidade (QA / Garantia de Qualidade)",
    processos: "Padronizar checklists, acompanhar a qualidade das entregas e controlar a conformidade",
    alocacao: "Temporário: Luciana (checklists) e Chris (auditoria estratégica)",
    icon: ClipboardCheck,
  },
  {
    papel: "C. Analista de Riscos",
    processos: "Identificar riscos comerciais e financeiros, avaliar impacto, definir respostas e monitorar",
    alocacao: "Temporário: Chris (visão estratégica) + Chloe (riscos financeiros)",
    icon: ShieldQuestion,
  },
];

// ─── Matriz de responsabilidades do fluxo operacional Ahut ───
const RACI_ROWS: [string, string, string, string, string][] = [
  ["Abrir Proposta / Contrato", "Igor", "Jota", "Jota", "Todos"],
  ["Mapear Clientes-chave", "Jota", "Jota", "Igor", "Todos"],
  ["Levantar Necessidades", "Igor + Vendas", "Igor", "Chris", "Jota"],
  ["Definir Escopo", "Chris", "Chris", "Igor", "Sebastian"],
  ["Estruturar Plano de Trabalho", "Chris", "Chris", "Sebastian", "Todos"],
  ["Estimar Custos", "Chloe", "Chloe", "Chris", "Jota"],
  ["Definir Orçamento", "Chloe", "Jota", "Chris", "Todos"],
  ["Planejar Recursos", "Jota", "Jota", "Chris", "Chloe"],
  ["Estimar Prazos", "[Fluxo]", "Sebastian", "Chloe", "Chloe"],
  ["Montar Cronograma", "[Fluxo]", "Chloe", "Chris", "Chloe"],
  ["Planejar Qualidade", "[QA]", "Chris", "Luciana", "Todos"],
  ["Planejar Riscos", "[Risco]", "Chris", "Chloe", "Todos"],
  ["Planejar Comunicação", "Jota", "Chris", "Jota", "Todos"],
  ["Planejar Aquisições", "Chloe", "Jota", "Chloe", "Todos"],
  ["Conduzir o Trabalho", "Sebastian + Equipe", "Sebastian", "Chris", "Jota"],
  ["Gerir a Comunicação", "Jota", "Chris", "Todos", "Todos"],
  ["Gerir a Qualidade", "Jota", "Chris", "Sebastian", "Todos"],
  ["Adquirir Recursos", "Jota", "Jota", "Chloe", "Todos"],
  ["Desenvolver a Equipe", "Chris", "Chris", "Igor, Sebastian", "Todos"],
  ["Gerir a Equipe", "Sebastian + Igor", "Sebastian", "Chris", "Jota"],
  ["Gerir o Relacionamento com Clientes", "Chris + Jota", "Jota", "Todos", "Todos"],
  ["Monitorar e Controlar o Trabalho", "Chris + Sebastian", "Chris", "Igor", "Jota"],
  ["Controlar o Cronograma", "[Fluxo]", "Sebastian", "Igor", "Jota"],
  ["Controlar Custos", "Chloe", "Chloe", "Chris", "Jota"],
  ["Controlar Qualidade", "[QA]", "Jota", "Sebastian", "Jota"],
  ["Monitorar Riscos", "[Risco]", "Chris", "Chloe", "Jota"],
  ["Controlar Aquisições", "Chloe", "Chloe", "Jota", "Todos"],
  ["Controlar Mudanças de Escopo", "Jota", "Chris", "Jota", "Chris"],
  ["Monitorar a Satisfação do Cliente", "Jota", "Igor", "Jota", "Todos"],
  ["Fechar Proposta / Entrega", "Jota", "Chris", "Jota", "Todos"],
  ["Lições Aprendidas", "[Fluxo]", "Chris", "Todos", "Todos"],
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

  // Fases do fluxo operacional (vertical) para o filtro
  const gruposFiltro = ["todos", "Geração de Leads", "Qualificação & Proposta", "Atendimento & Venda", "Acompanhamento no CRM", "Fechamento & Pós-venda"];

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
        onOpenChange={setMobileOpen}
      />
      <div className={cn("flex flex-col flex-1", sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <Header
          title="Recursos Humanos (RH)"
          subtitle="Organograma e matriz de responsabilidades do fluxo operacional Ahut"
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
                  Estrutura Operacional da Agência Hut
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Modelo de Operação Ahut: mapeamento dos profissionais nos ciclos do fluxo
                  operacional (Geração de Leads → Qualificação &amp; Proposta → Atendimento &amp; Venda →
                  Acompanhamento no CRM → Fechamento &amp; Pós-venda), com matriz de responsabilidades
                  própria desenhada a partir do jeito real de trabalhar da agência (CRM, funil,
                  quadros e meritocracia).
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
                      <p><span className="text-muted-foreground">Papel no fluxo:</span> <span className="text-foreground">{r.pmo}</span></p>
                      <p><span className="text-muted-foreground">Foco:</span> <span className="text-foreground">{r.foco}</span></p>
                      <p><span className="text-muted-foreground">Grupos:</span> <span className="text-foreground">{r.grupos}</span></p>
                      <p className="text-muted-foreground leading-relaxed">{r.resumo}</p>
                      {r.responsabilidades && r.responsabilidades.length > 0 && (
                        <div className="mt-1">
                          <p><span className="text-muted-foreground">Responsabilidades:</span></p>
                          <ul className="mt-1 space-y-1.5">
                            {r.responsabilidades.map((resp, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                <span className="text-foreground">{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
                    <th className="px-4 py-3">Processo do fluxo</th>
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
                    // filtro simples por palavra-chave por fase do fluxo
                    if (faseFiltro !== "todos") {
                      const inFase =
                        (faseFiltro === "Geração de Leads" &&
                          /Abrir Proposta|Mapear Clientes|Levantar Necessidades|Definir Escopo|Estruturar Plano/.test(processo)) ||
                        (faseFiltro === "Qualificação & Proposta" &&
                          /Estimar Custos|Definir Orçamento|Planejar Recursos|Estimar Prazos|Montar Cronograma|Planejar Qualidade|Planejar Riscos|Planejar Comunicação|Planejar Aquisições/.test(processo)) ||
                        (faseFiltro === "Atendimento & Venda" &&
                          /Conduzir o Trabalho|Gerir a Comunicação|Gerir a Qualidade|Adquirir Recursos|Desenvolver a Equipe|Gerir a Equipe|Gerir o Relacionamento/.test(processo)) ||
                        (faseFiltro === "Acompanhamento no CRM" &&
                          /Monitorar e Controlar|Controlar o Cronograma|Controlar Custos|Controlar Qualidade|Monitorar Riscos|Controlar Aquisições|Controlar Mudanças|Monitorar a Satisfação/.test(processo)) ||
                        (faseFiltro === "Fechamento & Pós-venda" &&
                          /Fechar Proposta|Lições Aprendidas/.test(processo));
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
