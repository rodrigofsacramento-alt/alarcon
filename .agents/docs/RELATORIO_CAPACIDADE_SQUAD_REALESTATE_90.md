# RELATÓRIO — SQUAD 90% AUTÔNOMO (real estate.ai)
**Autor:** Jarvis (CC) · **Data:** 24/09/2026 · **Objetivo:** imobiliária gerida pelo squad CC (Jarvis + 15 agentes), com humano só na reunião de venda.

Fonte de dados real: `.agents/skills/*/SKILL.md` (16 pacotes), `PAINEL_DE_CONTROLE.md`, `GAP_REPORT_PRIORIDADES.md`, `APEXFY_MODELO_DE_NEGOCIO_E_CONTRATO_HUT.md`.

---

## 📦 0. INVENTÁRIO REAL DO SQUAD (o que existe hoje)

| Agente | Competências comprovadas (SKILL.md) | Carga atual |
| :--- | :--- | :--- |
| **JARVIS** | Orquestração CEO, gates HITL, interface Comandante | Alta (todo ciclo passa por ele) |
| **AXIOM** | Pipeline /go, topologias multi-agente, quality gates | Alta |
| **ATOM** | Dev React/TS/Supabase, arquitetura imobiliária, deploy | Alta (gargalo técnico) |
| **ADA** | Frontend/UI/UX React+Tailwind | Média |
| **AURA** | QA, build, tsc, testes, prova visual | Média |
| **AEGIS** | SecOps, RLS, RBAC, auditoria IA, secrets | Média |
| **ATLAS** | DevOps, Hostinger, VPS, PM2, diagnóstico backend | Média |
| **AJAX** | WhatsApp/Baileys/Evolution, mídia, sessões | Média |
| **APOLLO** | BI, SQL, schema, índices, financeiro/ledger/comissões | Média |
| **ARGUS** | Scrum, processo, lições, P1-P6 | Média |
| **AVA** | Triagem de chamados, entrevista empática, spec | Baixa |
| **ARIA** | Monitor de leads, cruzamento de dados, vigilância | Baixa |
| **ATEM** | Chamados TCK, kanban /tecnologia, gatilhos Telegram | Baixa |
| **ASIMOV** | Criador de agentes, análise de lacunas | Baixa (ocioso) |
| **ARBITER** | Revisão visual pré-ship (subagente da ADA) | Baixa |
| **Humanos** | Comandante Rodrigo (decisão) + 1 SDR comercial + corretor(es) | 1 comercial |

**Conclusão do inventário:** squad é 100% TECNOLÓGICO. Constrói o app, mas quase ninguém opera A IMOBILIÁRIA dentro do app. O sdr-agent-worker (PM2 id14, Fase 4 pendente) é o único ator operacional digital.

---

## 🔄 FLUXO 1 — CÁLCULO DE PROXIMIDADE (Agente Conveniente)

Método: cada skill pendente da operação imobiliária → afinidade com competências existentes (0-10) → esforço de aprendizado (baixo/médio/alto). Maior afinidade = menor esforço = agente conveniente.

| # | Skill pendente (operação imobiliária) | Agente conveniente | Afinidade | Aprendizado | Racional |
| :-- | :--- | :--- | :--: | :---: | :--- |
| 1 | Qualificação/nutrição de leads (SDR digital) | **ARIA** (+ worker PM2 existente) | 9 | Baixo | ARIA já cruza dados de atendimento; sdr-agent-worker já tem travas+etapas — falta ligar Fase 4 |
| 2 | Agendamento/confirmação de visitas | **AJAX** | 8 | Baixo | Confirmação via OUTBOX WhatsApp já existe; agenda usa `useVisits` (gap report) |
| 3 | Cadastro/captação de imóvel (intake proprietário) | **AVA** | 8 | Baixo | Ava já faz entrevista empática de intake — é o mesmo músculo, outro objeto |
| 4 | Relatórios gerenciais/KPIs semanais (BI) | **APOLLO** | 9 | Baixo | Já faz BI/SQL; só formalizar cronjob de relatório |
| 5 | Conciliação financeira/comissões/repasses | **APOLLO** | 9 | Baixo | Já orquestra ledger+pagamento (PROIBIDO tocar sem OK — só automação de cálculo) |
| 6 | SLA/auditoria de atendimento (não vê quem respondeu, grupos) | **ARIA** | 8 | Baixo | Já é vigilância; queixas Denisse documentadas |
| 7 | Onboarding de corretor (conta, metas, treinamento) | **AVA** | 7 | Médio | Triagem → spec; 9 usuários agentes já criados no TASK-009 |
| 8 | Copiloto de negociação (scripts, objeções — Neurovendas) | **ARIA** | 6 | Médio | Base Neurovendas aulas 1-6 já na KB; correto humano lidera, IA sugere |
| 9 | Ranking/metas/performance de corretores | **APOLLO** | 8 | Baixo | RPCs `get_performance_*` já aplicadas (TASK-009) |
| 10 | Recuperação de leads frios (reativação em massa) | **ARIA** | 7 | Médio | Monitor + WhatsApp outbound; depende de ATEM/AJAX |

**Resultado F1:** 10 de ~14 skills pendentes têm alocação viável com afins ≥6 — a maioria cai em ARIA, APOLLO, AVA e AJAX.

---

## 🕳️ FLUXO 2 — LACUNAS CRÍTICAS (GAPS)

### 2a. Skills SEM NENHUM agente correspondente

| # | Skill | Risco | Por que ninguém cobre |
| :-- | :--- | :--- | :--- |
| G1 | **Marketing/tráfego pago** (campanhas Meta/Google, conteúdo, portais imobiliários) | 🔴 Crítico | Zero competência no squad. Sem captação de demanda, o funil não se autoalimenta — quebra a meta 90% |
| G2 | **Jurídico/documental** (contratos, minuta, checklist documental, LGPD imobiliário, reservas) | 🔴 Crítico | Zero. Página `Jurídico` está em backlog Fase 3 sem dono. AEGIS é segurança de sistema, NÃO jurídico de negócio |
| G3 | **Pós-venda/CS** (satisfação, renovação, indicação, NPS) | 🟠 Alto | Zero. Nenhuma skill de CS existe; área do cliente (`/area-cliente`) sem TSX |
| G4 | **Precificação/avaliação de imóveis** (CMV, comparáveis, VGV por região) | 🟠 Alto | APOLLO tem os dados mas não a metodologia de avaliação imobiliária |
| G5 | **Cobrança/inadimplência** (Follow-up de contrato assinado até repasse) | 🟡 Médio | APOLLO cobre cálculo, não cobrança ativa (que é operação comercial de contato) |
| G6 | **Estoque de imóveis/intermediação** (captação de proprietário, visita, exclusividade) | 🔴 Crítico | Nenhum agente opera o ciclo imobiliário puro — o app registra, ninguém opera |

### 2b. Skills cuja alocação SOBRECARREGARIA o time

| Agente | Sobrecarga |
| :--- | :--- |
| **ATOM** | Já é gargalo: recebe tudo de engenharia + arquitetura + deploy. Não pode acumular nenhuma skill operacional |
| **JARVIS** | Interface única com Comandante + todos os gates. Acumular = gargalo de decisão |
| **APOLLO** | Se receber BI + financeiro + cobrança + precificação, vira SPOF de dados |
| **ARIA** | Com F1 (leads + SLA + reativação + copiloto) já dobra de carga — precisa de worker atrás dela |

---

## 🏗️ FLUXO 3 — RECOMENDAÇÃO DE CAPACIDADE (VEREDITO)

> **Veredito: 6 de 14 skills pendentes (43%) não possuem cobertura viável com o squad atual.** As 8 restantes são alocáveis por proximidade (Fluxo 1), mas 4 delas sobrecarregam ARIA/APOLLO sem worker de apoio.

### Novos agentes (custo baixo — ASIMOV cria, skill + posto no organograma)

| Agente novo | Skill pai (gap) | Afinidade de criação | Sob |
| :--- | :--- | :--- | :--- |
| **ARTEMIS** (Marketing & Growth) | G1 tráfego pago, conteúdo, portais | Departamental — par com ARIA (demanda) | Jarvis |
| **LEX** (Jurídico & Documental) | G2 contratos, minutas, checklist, LGPD de negócio | Par com AEGIS (compliance) | Jarvis |
| **ANCHOR** (Pós-venda/CS) | G3 satisfação, indicação, renovação | Par com AJAX (canal WhatsApp) | Jarvis |

### Novos DEPARTAMENTOS (empresa real — o squad como estrutura de empresa)

| Departamento | Papel humano residual | Agentes digitais | Automação |
| :--- | :--- | :--- | :--- |
| **Engenharia** (existe) | Comandante valida gates | ATOM, ADA, AURA, AEGIS, ATLAS, AJAX, ASIMOV, ARBITER | ~95% |
| **Processo & Dados** (existe) | — | ARGUS, APOLLO, AVA, ATEM, ARIA | ~90% |
| **Comercial** (NOVO — hoje = 1 SDR humano) | Corretor só na reunião de venda | ARIA (qualificação) + ANCHOR (pós-venda) + sdr-agent-worker (resposta digital) | 70-80% |
| **Marketing** (NOVO) | — | ARTEMIS | ~85% |
| **Jurídico/Administrativo** (NOVO) | Assinatura final (ZapSign) | LEX | 80% |

### Estratégia de recrutamento (contratação mínima)
1. **Não contratar antes de automatizar:** ligar sdr-agent-worker Fase 4 (pendente) + alocar Fluxo 1 = maior ganho por esforço, custo zero.
2. **1 corretor por praia** (inevitável — reunião de venda é o 10% humano declarado).
3. **1 coordenador comercial** SÓ quando volume passar de 2 corretores — antes disso, ARIA+AXIOM gerenciam a fila.
4. Marketing e Jurídico começam 100% digitais (ARTEMIS/LEX); humano entra só se CAC ou risco jurídico justificar.

### Sequência de execução (próximos /go)
1. **Fase 4 SDR:** ligar `sdr_enabled` e validar lead inédito (PENDENTE registrado no PAINEL) → maior degrau único de autonomia, já construído.
2. Alocar Fluxo 1 (skills 1-10) — ASIMOV cria as 3 skills novas nos agentes existentes.
3. ASIMOV gera ARTEMIS, LEX, ANCHOR (skills + organograma + PAINEL).
4. Registrar no organograma os 4 departamentos (ENG, PROC, COM, MKT/JUR) — pendência já aberta no CC-09 (posições ARGUS/AJAX).

---

*Relatório gerado a partir de dados reais do repo (`SKILL.md` × 16, PAINEL, GAP_REPORT, contrato HUT). Próxima revisão: após Fase 4 do SDR.*