# 🗺️ PLANO DE IMPLEMENTAÇÃO — AGÊNCIA HUT
### Ecossistema digital unificado (contrato assinado via ZapSign `6be43a7f-...`)

> **Base:** estrutura existente hoje (app `ahut-ecosystem.apexfyhub.com.br` + broker/supabase + squad de agentes IA).
> **Segmentação:** 6 Etapas do contrato. Inventário: ✅ já executado no ar / 🔧 otimizável nas próximas semanas / 🟥 pendente crítico.
> **Data:** 21/09/2026. **Fonte autoritativa:** `remodel-copy` + PAINEL_DE_CONTROL + histórico real.

---

## ETAPA 1 — DIAGNÓSTICO DE PRIORIDADE
*Mapeamento dos pontos falhos da operação para levantar gargalos ocultos e subsidiar a priorização de tecnologia.*

### ✅ Já executado no ar
- **Engenharia reversa completa** do frontend de produção (ciclo 1 e 2, ago/2026): 19 páginas, 8 hooks, fluxo completo reestabelecido.
- **GAP REPORT finais** 7/7 (Dashboard/Financeiro/Leads resolvidos com dados reais); páginas antes "mock puro" foram conectadas ao Supabase.
- **Diagnóstico de incidentes:** WhatsApp +595 logged-out (broker em loop QR); tela branca múltipla causadas por Vite code-split/cache imutável; dupla montagem de login.
- **Duplicatas de leads:** 39 normalizados + 170 unificados (LID × REAL) + auditoria CRON diária.
- **Diagnóstico da migração financeira (legado `crm-agencia-hut.vercel.app`):** revisão de junho concluída — **gap de ~Gs. 63,2M** em comissões de loteadoras fora do livro caixa.

### 🔧 Otimizável nas próximas semanas (gargalos a priorizar)
| # | Gargalo identificado | Fonte da evidência |
|---|---|---|
| D1 | Frontend ainda **não filtra leads inativos** (`is_active=false`) nas listagens | commit `75e252e` (12/09 — fix no path, pendência de aplicações) |
| D2 | Discrepância saldo **livro caixa × comissões de loteadoras** (junho/2026) | revisão legado 21/09 |
| D3 | **Duplicidade** de comissão Gs. 7.076.500 (aparece 2x no livro, 1x na aba) | revisão legado 21/09 |
| D4 | Tema claro no PROD diverge do dark QUBITS (build divergente 162KB vs code-split) | nota 04/09 |
| D5 | Worker SDR **sem prova controlada de disparo** (0 disparos) | monitoramento worker |
| D6 | Área Principal: ausência de **indicador de lead inédito** no fluxo SDR | diagnóstico SDR |

> **Produto da Etapa 1:** este plano (priorização quantificada por impacto × urgência de D1–D6).

---

## ETAPA 2 — PLANO DE IMPLEMENTAÇÃO
*Priorização e cronograma das soluções — inicia imediatamente após a Modelagem de Processos da consultora Chris Racanelli (Fase 2).*

### ✅ Já executado no ar
- Módulos prioritários já entregues e operantes: **Atendimento, Imóveis, Propostas, Financeiro (Livro/Vendas/Contas), Ranking de Corretores/Metas, RH, Tecnologia/Chamados**.
- **Chamados/Tecnologia** conectado ao Supabase (kanban drag-drop, Ada IA, solicitantes reais).
- **Notificações** com triggers (`new_lead`, `sale_completed`).

### 🔧 Cronograma proposto (pós-consulta Chris)
| Período | Objetivo | Entregáveis |
|---|---|---|
| S1 | Estabilidade | Finalizar filtro de inativos (D1); aplicar parity de tema (D4) |
| S2 | Financeiro | Conciliar junho (D2/D3); definir importação segura de comissões no ledger |
| S3 | Comercial | Prova controlada SDR (D5); flag lead inédito (D6) |
| S4 | Automação | Automação de relatórios periódicos + fluxos internos (Etapa 4) |
| S5 | IA | Integração de IA generativa analítica (Etapa 5) |

---

## ETAPA 3 — APLICATIVO DE GESTÃO ORGANIZADO
*App unificado de gestão interna — centro nervoso digital (dados, tarefas, colaboradores, controle geral, decisão em tempo real).*

### ✅ Já executado no ar (alto grau de aderência)
- **Portal web único** com 19+ páginas integradas a dados reais (não é mais mock).
- **Módulo RH** com organograma da Agência Hut + **Matriz RACI** (PMBOK).
- **Colaboradores:** perfis atribuídos (Jota, Chris, Chloe, Luciana, Igor, Rodrigo — Role + RACI).
- **Ranking de performance 7d** + **metas por corretor** (global + exceção por corretor).
- **Financeiro completo** (Livro Geral, Vendas & Imigração, Contas, DFC, gráfico de faturamento).
- **Log de Direcionamentos** (KARD + deep link + hora Asunción + agrupamento).
- **Aplicativo PWA** (ícones, manifest, installável).

### 🔧 Otimizável nas próximas semanas
| Área | Melhoria proposta |
|---|---|
| **Visibilidade total** | Dashboard executivo consolidado (KPIs cruzados vendas×comissões×metas×SDR) |
| **Mobile** | Polir experiência PWA mobile (drawers já existem; falta testar fluxo offline) |
| **Tarefas** | Painel unificado de tarefas do dia por colaborador (hoje disperso entre Atendimento/Agenda/Chamados) |
| **Workflow** | Fazer RACI "executar" (validação de que cada papel de decisão mapeia a uma tela/action real) |

---

## ETAPA 4 — IMPLEMENTAÇÃO DE AUTOMAÇÕES
*Automação de tarefas operacionais, relatórios, fluxos e processos produtivos recorrentes → elimina trabalho braçal repetitivo.*

### ✅ Já executado no ar
- **Auditoria de leads automática** (CRON diário 6h + script `leads-audit.py`).
- **Fallback de áudio** com worker (quando 'Falhou Áudio?', reenvia em formato seguro).
- **Notificações automáticas** por triggers de BD (novo lead, venda concluída) + sons/toasts.
- **Follow-up WhatsApp agendado** + **tags automáticas por usuário**.
- **SDR worker** online (automatiza resposta a leads inéditos — aguardando prova controlada).
- **Geração dinâmica de pipeline** (`tutor_rag_ahut.py`) injetando funil no contexto do LLM.

### 🔧 Otimizável nas próximas semanas
| Automação | Status |
|---|---|
| **Relatórios recorrentes** (financeiro diário/semanal) | 🟥 não existe ainda |
| **Bot de comissão de loteadora → esteira de conferência** | 🟥 não existe (ligado a D2/D3) |
| **Atualização automática de estágio** via eventos de agenda | ⚙️ gatilhos existem, falta esteira de validação |
| **Backup/versionado automático do código** | ⚙️ manual hoje (falta CI/CD real) |
| **SDR resposta automática** | ⚙️ worker pronto, falta GO de validação (D5) |

---

## ETAPA 5 — INTEGRAÇÃO DE IA NO SISTEMA
*Integração de IA generativa para automação analítica, relatórios dinâmicos e insights preditivos/prescritivos.*

### ✅ Já executado no ar
- **Chat com IA** em Atendimento com funil de 13 estágios injetado deterministicamente (`tutor_rag_ahut.py` — injeta contexto, nunca por escolha do LLM).
- **Ada IA** no módulo Tecnologia/Chamados.
- **Squad de agentes IA** (Hermes) orquestrado: Jarvis/Chief, AXIOM/executor, ASIMOV/criador de agentes, AEGIS/secops, APOLLO/payments.
- **QUBITS** visual (Living Graph) e Living Graph Engine.

### 🔧 Otimizável nas próximas semanas
| IA | Proposta |
|---|---|
| **Relatório financeiro dinâmico** | IA que consome dados do ledger e gera extrato/insight em PT-BR sob demanda |
| **Insights preditivos de vendas** | Previsão de fechamento por corretor/imóvel com base em ranking e funil |
| **Resumo diário automático** | Digest da operação (leads, direcionamentos, comissões) entregue via chat |
| **Análise de duplicidade inteligente** | IA na conferência de comissões/duplicados (D2/D3) |
| ⚠️ **RAG semântico** | Foi **cancelado por ordem do Comandante** 09/09 (manter natureza determinística; não reabrir sem nova direção) |

---

## ETAPA 6 — OPERAÇÃO AUTÔNOMA 24/7 & MELHORIA CONTÍNUA
*Ecossistema ininterrupto e autoevolutivo: execução 24/7, aprendizado evolutivo, otimização autônoma.*

### ✅ Já executado no ar
- **Broker WhatsApp** online 24/7 (PM2 id0, Supabase PROD).
- **Worker SDR** online 24/7 (PM2 id14).
- **Auditoria CRON** diária; observabilidade de deploy (paridade md5 em 2 docroots).
- **Processo "Fluxo pós-entrega"** com scorecard (penaliza retrabalho que o squad poderia resolver sozinho) e gatilho ASIMOV a 80pts.
- **Skills de agentes** auto-atualizadas (ATOM/ADA/AJAX/ATLAS registram aprendizados).

### 🔧 Otimizável nas próximas semanas
| Pilar | Proposta |
|---|---|
| **Monitoramento 24/7** | Dashboard/alertas de saúde: broker, worker, Supabase, custos (hoje puxados sob demanda) |
| **Aprendizado evolutivo** | Loop formal: toda tarefa → registro em skill → reutilização (existe parcialmente nos skills; faltava consolidação) |
| **Otimização autônoma** | Rota de "gap analysis automático" pós-entrega já existe; escalar para decisão de novas automações |
| **Resiliência** | CI/CD + rollback automatizado (hoje manual); canary no TESTE |

---

## 🧮 RESUMO EXECUTIVO — Onde estamos por Etapa

| Etapa | Descrição | Status |
|---|---|---|
| **1** | Diagnóstico de Prioridade | ✅ Concluída (GAP REPORT 7/7; gargalos D1–D6 mapeados) |
| **2** | Plano de Implementação | 🔄 Em curso (este documento; mod iss watch aguardando Fase 2 Chris) |
| **3** | App de Gestão Organizado | ✅ ⭐ Alta aderência (portal unificado com dados reais + RH/RACI + metas) |
| **4** | Automações | 🟡 Parcial (auditoria/notifs/follow-up ok; falta relatórios recorrentes + esteira comissões) |
| **5** | Integração de IA | 🟡 Parcial (chat+funil/Squad OK; falta IA analítica/preditiva — RAG semântico pausado) |
| **6** | Operação Autônoma 24/7 | 🟡 Parcial (broker/worker 24/7 ok; falta monitoramento formal + CI/CD) |

**Próximas 2–4 semanas (recomendação):**
1. **S1 Estabilidade:** finalizar `is_active` + parity de tema.
2. **S2 Financeiro:** conciliar junho (D2/D3) e executável — maior valor financeiro imediato.
3. **S3 Comercial:** prova controlada SDR (liberar automação de resposta).
4. **S4 Automação:** relatório financeiro recorrente (passo da Etapa 4 visível ao cliente).

---
*Documento elaborado por Jarvis/Squad Tech Ahut sob demanda do Comandante. Baseado na estrutura existente e na evidência real de histórico/deploy.*
