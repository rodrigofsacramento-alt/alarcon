# 📋 Relatório de Atualizações — App `ahut-ecosystem.apexfyhub.com.br`

> **Escopo:** todas as atualizações feitas diretamente no aplicativo em produção `ahut-ecosystem.apexfyhub.com.br`, de todo o histórico (ago–set/2026).
> **Fonte:** históricamente consolidado a partir do repositório de edição `/opt/data/ahut-ecosystem-remodel-copy` (194 commits; ago 85 + set 109).
> **Data do relatório:** 21/09/2026.

---

## Fluxo de trabalho (para contexto)

- **Fonte de edição (autoritativa):** `remodel-copy` (rama `remodel`, base `/`). `ahut-ecosystem` está **congelado** — nunca editado.
- **Fluxo:** dev Supabase DEV → validação em teste (`teste-ahut-ecosystem`) → promoção a PROD. Exceções diretas a PROD apenas para fixes de tela branca.
- **Document roots PROD:** `/ahut/` e `/ahut-ecosystem/` (2 docroots — deploy sempre nos dois, com verificação de paridade md5).
- **Backend:** broker `/root/crmahut/backend-broker` (PM2 id0); worker SDR (PM2 id14).
- **Supabase PROD:** `ptochsyoyatsydfysacc`.

---

## 💬 Atendimento / WhatsApp

| Data | Atualização |
|---|---|
| 23–24/08 | Engine reversa do ciclo de Atendimento (filas, aceite, transferência, ignorar); Modo DEMO (auditoria de UI quando WhatsApp não escaneado); envio de msgs em tempo real |
| 25/08 | Deploy de tecla de quebra de linha: **Ctrl+Enter** e **Ctrl+Space** no chat |
| 27/08 | **Player de áudio** (ogg/webm/mpeg/mp4); renderização de imagem/vídeo/documento; legenda de lead em grupo (nome+telefone); header de agente (nome+departamento) |
| 27–28/08 | Correções de inversão visual de grupos (`isAgentSender`); filtros por atendente/dashboard/ranking; polling fallback de msgs |
| 01–02/09 | Dupla montagem de login / sessão inválida corrigida (`?v=` removido do entry; guard singleton `__AHUT_SB_Q`) |
| 03–04/09 | Fix zombie dupla-montagem; **funil QUBITS MISSÃO 1** (indicador de estágio no card da lista, seletor de 12 estágios no cabeçalho do chat) |
| 04/09 | **Funil FASE 2** — régua de 12 estágios com data-binding bidirecional `conversations.lead_id`/`leads.conversation_id` + espelho `conversations.stage` + gatilhos SQL |
| 05/09 | Ajuste de prompt de IA com o funil (`tutor_rag_ahut.py`) |
| 14/09 | Aba **"Não Direcionados"** + refactor de Não Lidas + hotfix de navegação mobile |
| 16/09 | **Follow-up WhatsApp agendado** + **tags personalizadas por usuário** |
| 21/09 | **Metas de ações por corretor** (filtro por ranking) — ver Ranking |

**Pendência/observação:** leads no funil de Atendimento referenciam `conversations.client_id`; duplicatas tratadas com `leads.is_active` (11/09).

---

## 🏠 Imóveis / Properties

| Data | Atualização |
|---|---|
| 09/09 | **Módulo Imóveis**: moeda (USD/GS/BRL), valor mascarado (`amount`), modalidade (`price_type` FINAL/MONTHLY/DOWN_PAYMENT), link Google Maps (`maps_link`). Componentes: `CreatePropertyModal`, `PropertyDetailModal`, página `Imoveis.tsx` |
| 09/09 | **Cadastro de imóveis democratizado** (PROD + cliente) — fix filtro `agent_id` em `useProperties` |
| 09/09 | Migração de schema `properties` em PROD (`amount`/`currency`/`maps_link`) + CHECK `price_type` |
| 12/09 | Filtra imóveis inativos (`is_active`) nas listagens/agregações |

---

## 📊 Ranking de Corretores / Metas

| Data | Atualização |
|---|---|
| 14/09 | **Distribuição de leads por ranking 7 dias** (sem cap) + dashboard de performance |
| 14/09 | **Página `/corretores`** = ranking completo de performance (todos os corretores) |
| 21/09 | **Metas de ações por corretor** (nova tabela `corretor_metas` + RLS) — comparativo real/meta em contagem e %, edição inline, período do ranking |
| 21/09 | Meta **GLOBAL** por indicador (`corretor_metas_global`) + exceção por corretor (`corretor_metas`); edição inline, "uso global" para remover exceção |
| 21/09 | Navegação: ítem menu **"Corretores" → `/dashboard-performance`** (substitui página antiga); `/corretores` → redirect; lazy import removido |

---

## 💰 Financeiro

| Data | Atualização |
|---|---|
| 01/09 | **Chat interno de sincronia** Hermes⇄Antigravity + módulo financeiro completo (backend PROD + frontend) |
| 01–03/09 | **Módulo financeiro P1–P4** completo + data-binding de lançamentos |
| 03/09 | **DFC por grupo de categoria** + gráfico moderno Receitas/Despesas em linha com filtros de período |
| 09/09 | RLS **cerrada** + trigger de **cierre de venta** em PROD (`financial_banks`, `financial_transactions`); adaptação frontend ao schema real (`category_id` FK + join `financial_categories`) |
| 12–13/09 | Adaptação do hook/página/modal ao schema real do PROD (TASK-017) |
| 20/09 | **Livro Geral** `/financeiro/livro` — extrato paginado + filtros + export |
| 20/09 | **Vendas & Imigração** `/financeiro/vendas` — KPIs + listado das 7 vendas |
| 20/09 | **Contas Bancárias** `/financeiro/contas` + hook `use-financial-banks` |
| 20/09 | Override controlado do **faturamento no gráfico mensal** (Abr 9M / Mai 19M / Jun 112M / Jul 122M / Ago 112M) — opção 2 eleita; **não altera `financial_transactions`** |

> ⚠️ **Regra permanente:** o gráfico de faturamento mensal fica como está (KPIs quadram; desfase por 2 proyectos Supabase). Saldo de caixa = agregação de `financial_transactions` por `bank_id`. Payments (Asaas+Stripe) são PSPs separados do ledger.

---

## 📄 Propostas

| Data | Atualização |
|---|---|
| 13/09 | **Log de Direcionamentos** (KARD + deep link + corretor + hora Asunción + agrupamento día/semana/mes + filtro período) |
| 21/09 | Select de imóvel usa `price` (coluna **real**; `valor_total` inexistente era bug latente) + fix vendor fill |
| 21/09 | **Tabela `commercial_proposals` criada em PROD** (aditiva/RLS, idempotente) para o INSERT funcionar (double-write: modal → `commercial_proposals` → onSuccess → `proposals`) |
| 21/09 | **Painel de edição** lateral (cliente, valor, pagamento, status, imóvel, corretor, notas) + **deeplinks** (lead via `selectedLeadId`, imóvel via `/imoveis?property=`, corretor via `/dashboard-performance`) |

---

## 🛠️ Tecnologia / Chamados / RH

| Data | Atualização |
|---|---|
| 24/08 | **Tecnologia real**: kanban drag-drop, Ada IA, performance, solicitantes=usuários; Gestão (kanban Chris); Finance (hook Supabase) |
| 15/09 | **Evolução da página Chamados**: cadastro guiado + anexos + print + visual moderno |
| 15/09 | Módulo Chamados (tech tickets) + **painel SDR** + rebrand de textos + AsyncCombobox |
| 14/09 | **Página RH** com organograma da Agência Hut + matriz RACI (doc PMBOK) |
| 21/09 | **RH**: papéis por profissional atualizados (Jota, Chris, Chloe, Luciana, Igor, Rodrigo) + Matriz RACI ajustada; fix `MobileSidebar` |
| 21/09 | **Tecnologia**: solicitante por seleção (AsyncCombobox profiles), fix tela branca ao salvar (`delivery_forecast` DATE vazio + try/catch no `submitTicket`), fix `onOpenChange` MobileSidebar |

---

## 🎨 Design / QUBITS

| Data | Atualização |
|---|---|
| 28/08 | **Dark Glassmorphism** (19 páginas: Dashboard, Leads, Atendimento, Agenda, Properties, Proposals, Contracts, Juridico, GestaoClientes, Comissoes, Marketing, Treinamentos, Gestao, Finance, Vendas, Tecnologia, Notificacoes, Configuracoes, Corretores) |
| 28/08 | **Rebrand QUBITS APEX**: Living Graph Engine (200+ nós), CSS tokens (#06080e, #00FFCC, #00F5A0, #38BDF8, #00DF9A), fonts Outfit + Plus Jakarta, fundo #030303 + neon #00FFCC |
| 26–28/08 | PWA icons (SVG + PNG 192/512/180), tipografia (scale 9 roles, grid 8pt), transition animations, chart tooltip glass, scroll-reveal, force-directed graph (`useRealtimeGraph`) |
| 16/09 | Fase 1: AEGIS code-auditor, APOLLO database-optimizer + payments (Asaas+Stripe), finish-gate-reviewer |

> **Nota de tema:** o build atual em PROD é o tema **CLARO** (light); o dark QUBITS vive no ambiente DEV (`dev-ahut-ecosystem`). Confirmação registrada em 04/09 (rebuild P3 code-split OK).

---

## 🐛 Estabilidade (tela branca)

| Data | Atualização |
|---|---|
| 15/09 | Fix teto PostgREST + mídia em respostas |
| 21/09 | **ChunkErrorBoundary** auto-reload em rotas lazy (fix de tela branca geral — Vite code-split + cache imutável) |
| 21/09 | Fix tela branca propostas (`seller_id: sellerId` em `initialForm`) |
| 21/09 | Fix tela branca Tecnologia ao salvar (`delivery_forecast`) |

---

## 🗄️ Backend / Banco (em produção)

| Data | Atualização |
|---|---|
| 08/09–10/09 | Migração de funil anti-duplicidade e **Bloco B/C** (`visits.tipo` check reunião/visita; `get_agent_ranking` 5 métricas); vinculação de estágio a visits/proposals/sales_records em tempo real (`trg_sync_funil_stage`) |
| 10/09 | Trigger `ensure_lead` herda `responsible_id = conversations.agent_id` (deep link do responsável) |
| 09/09 | Migração de schema `properties` (amount/currency/maps_link) + CHECK `price_type` |
| 11/09 | **Duplicados PROD:** `leads.is_active` (add 11/09); frontend deve filtrar; canônico = 'Agência Hut' sempre ativo via `_norm_txt` |
| 21/09 | Tabela **`commercial_proposals`** criada em PROD (aditiva/RLS) |
| 21/09 | Tabelas **`corretor_metas`** + **`corretor_metas_global`** (+ RLS) |

---

## 🧭 Inventário de pendências & referências

- **Leads:** listas **segmentadas por tabela** (LEADS vs ATENDIMENTO); frontend ainda precisa filtrar inativos.
- **SDR:** worker online, 0 disparos; gatilho = lead inédito sem histórico (`fn_sdr_should_reply`).
- **Migração financeira (em análise, somente leitura):** sistema legacy `crm-agencia-hut.vercel.app` — entradas de junho que não constam no livro caixa (gap de comissões de loteadoras ~Gs. 63,2M; requer validação antes de qualquer importação).
- **Sistema legacy (clone):** `crm.hutinnovaciones.com` — ambiente de QA pré-cliente (Next16/Auth.js/Hostinger), **sem teste de carga pesada em produção**.

---

*Relatório gerado sob demanda do Comandante — Jarvis/Squad Tech Ahut. Fonte autoritativa: repositório `remodel-copy` + PAINEL_DE_CONTROL.md.*
