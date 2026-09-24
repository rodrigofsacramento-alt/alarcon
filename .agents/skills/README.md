# 📚 Índice de Skills do Squad — `.agents/skills/`

Biblioteca de skills do squad Ahut/ApeXfy. Cada pasta de agente contém:
- `SKILL.md` — diretriz **principal** do agente (prevalece em conflito);
- `<skill>.md` — skills **secundárias** herdadas do repo [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) (CC-02, 23/09/2026), cada uma com bloco **🇧🇷 ADAPTAÇÃO AHUT** no topo (caminhos, ambientes, restrições e quando acionar).

**Distribuição (CC-02):** 25/25 skills distribuídas · 7 agentes receptores · 0 SKILL.md principal sobrescrito.

## Contexto Ahut (aplica-se a TODAS as skills herdadas)
- **Repo de edição:** `/opt/data/ahut-ecosystem-remodel-copy` (branch `remodel`). **NUNCA** editar o `ahut-ecosystem` congelado.
- **Ambientes:** Supabase `ptochsyoyatsydfysacc` = PROD · `xmsulduzvufdzkfktovk` = DEV (operações destrutivas só no DEV).
- **Deploy Hostinger:** docroot `/ahut/` (PROD) e `/teste/` (teste/DEV) — deploy só sob ordem explícita, via atlas-agent-devops; TESTE primeiro, depois PROD.
- **Stack:** frontend React+Vite+Tailwind (build `npm run build`, testes Vitest) · stack QUBITS · nicho imobiliário · PT-BR.
- **Segurança:** nunca colar segredos/chaves/tokens no chat, commits ou docs; referenciar `.env`.

## Matriz skill → agente → arquivo

| # | Skill | Dono (agente) | Arquivo |
|---|---|---|---|
| 1 | test-driven-development | atom-agent-developer | `atom-agent-developer/test-driven-development.md` |
| 2 | debugging-and-error-recovery | atom-agent-developer | `atom-agent-developer/debugging-and-error-recovery.md` |
| 3 | incremental-implementation | atom-agent-developer | `atom-agent-developer/incremental-implementation.md` |
| 4 | code-simplification | atom-agent-developer | `atom-agent-developer/code-simplification.md` |
| 5 | api-and-interface-design | atom-agent-developer | `atom-agent-developer/api-and-interface-design.md` |
| 6 | doubt-driven-development | atom-agent-developer | `atom-agent-developer/doubt-driven-development.md` |
| 7 | source-driven-development | atom-agent-developer | `atom-agent-developer/source-driven-development.md` |
| 8 | ci-cd-and-automation | atlas-agent-devops | `atlas-agent-devops/ci-cd-and-automation.md` |
| 9 | shipping-and-launch | atlas-agent-devops | `atlas-agent-devops/shipping-and-launch.md` |
| 10 | observability-and-instrumentation | atlas-agent-devops | `atlas-agent-devops/observability-and-instrumentation.md` |
| 11 | deprecation-and-migration | atlas-agent-devops | `atlas-agent-devops/deprecation-and-migration.md` |
| 12 | git-workflow-and-versioning | atlas-agent-devops | `atlas-agent-devops/git-workflow-and-versioning.md` |
| 13 | code-review-and-quality | aura-qa-tester | `aura-qa-tester/code-review-and-quality.md` |
| 14 | browser-testing-with-devtools | aura-qa-tester | `aura-qa-tester/browser-testing-with-devtools.md` |
| 15 | security-and-hardening | aegis-secops | `aegis-secops/security-and-hardening.md` |
| 16 | frontend-ui-engineering | ada-frontend-ui | `ada-frontend-ui/frontend-ui-engineering.md` |
| 17 | performance-optimization | ada-frontend-ui | `ada-frontend-ui/performance-optimization.md` |
| 18 | planning-and-task-breakdown | jarvis-orchestrator | `jarvis-orchestrator/planning-and-task-breakdown.md` |
| 19 | spec-driven-development | jarvis-orchestrator | `jarvis-orchestrator/spec-driven-development.md` |
| 20 | constraint-driven-development | jarvis-orchestrator | `jarvis-orchestrator/constraint-driven-development.md` |
| 21 | context-engineering | jarvis-orchestrator | `jarvis-orchestrator/context-engineering.md` |
| 22 | using-agent-skills | jarvis-orchestrator | `jarvis-orchestrator/using-agent-skills.md` |
| 23 | documentation-and-adrs | argus-scrum-master | `argus-scrum-master/documentation-and-adrs.md` |
| 24 | idea-refine | argus-scrum-master | `argus-scrum-master/idea-refine.md` |
| 25 | interview-me | argus-scrum-master | `argus-scrum-master/interview-me.md` |

## Agentes sem skills herdadas nesta rodada
Sem função correspondente direta às 25 skills: `apollo-data-bi`, `aria-monitor-leads`, `ajax-whatsapp-broker`, `ava-agent-intake`, `asimov`, `axiom`, `arbitrator-visual-gate`. Se surgir skill de dados/BI, dono = apollo-data-bi.

- **CC-08 (23/09):** novo agente **`atem-kanban-manager`** (ATEM, 15º do squad, sob o AXIOM) — SKILL.md principal própria (sem skill herdada); dono do `/tck` (plugin squad-commands v1.2.0) e dos 4 gatilhos de validação TCK via Telegram.
- **CC-11 (24/09):** 4 novos agentes com SKILL.md principal própria (cultura A do Comandante): **`argon-growth-marketing`** (gap G1 marketing) · **`lex-legal-docs`** (gap G2 jurídico) · **`anchor-cs-postsales`** (gap G3 pós-venda) · **`axon-n8n-automation`** (automação n8n — prioridade Comandante). Skills n8n correlatas do davila7/claude-code-templates instaladas em `.claude/skills/` (n8n-workflow-patterns, n8n-code-javascript, n8n-expression-syntax, n8n-mcp-tools-expert) — ativas no CC. Squad: 19 agentes.

## Notas de decisão
- `source-driven-development` (verificação contra docs oficiais) foi absorvido pelo **atom**: é prática de quem implementa — verificar doc oficial antes de codar e citar a fonte. Não justifica agente novo; qualquer outro agente pode consultá-lo via esta matriz.
- Nenhum agente novo criado nesta rodada: todas as 25 funções tinham correspondência com agente existente.