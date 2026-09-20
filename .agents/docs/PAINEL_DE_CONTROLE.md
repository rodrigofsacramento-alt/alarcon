# 📌 CANÔNICA (08/09) — LEI DE ATUAÇÃO EDIÇÃO/REFERÊNCIA (diretriz do Comandante)

## ✅ 19/09 — MÓDULO CONTAS BANCÁRIAS (`/financeiro/contas`) — CONSTRUIDO + DEPLOY TESTE
**Solicitado por Rodrigo:** sub-páginas financeiras pendientes / reconstrução do mapeo financeiro como Jarvis.
**Entregue:** nova página `Contas.tsx` (rasta `/financeiro/contas`, roles admin/manager) + hook `use-financial-banks.ts` + tipo `financial_banks` agregado al gen-types.
- **Backend/schema validado na BD real:** `financial_banks` (14 cuentas activas tenant Ahut) tem RLS `ALL public` (sin tenant-scope) → front filtra por `tenantId` explícito. Saldo total consolidado **Gs 95.048.576** (Itaú 24.731.625, Efectivo Gs Imigración 22.082.600, Criptos 21.978.000, etc. — 9/9 cuentas com saldo ≠ 0).
- **Saldo via `financial_transactions`** (RSL tenant-scope, tipada) agregando income-expense por `bank_id` → replica EXACTO la view `financial_saldo` (validado: Itaú 405.480.627−380.749.002=24.731.625 ✓). Não se delegou na view (não tipada, sem tenant-scope na SQL).
- **UI:** banner saldo consolidado, listado de cuentas por grid (nome, saldo, movimientos, entradas/saídas, toggle activo/inactivo), detalle transacciones por cuenta (clique en card), modal "Nueva Cuenta", botón "Volver al Financeiro". Campos dinámicos/reativos del DB real (critério Rodrigo). Moneda Gs.
- **Rutas/navegación:** import lazy + Route `/financeiro/contas` en App.tsx; botón "Contas Bancárias" en header Financeiro.tsx.
- **Build OK** (tsc limpio em mis archivos — error `ai-prompts.ts` preexistente no tocado) → `dist/assets/Contas-Cw5quPl2.js` (11 KB). **Deploy TESTE ✅** (`teste-ahut-ecosystem`): backup 591 assets + `DEPLOY_OK`; verificado live: index `index-kYOd1bTU.js` servido + `Contas-Cw5quPl2.js` HTTP 200 + ruta `/financeiro/contas` no registro JS.
- **Próximas faltas financeiras:** segmento Vendas & Imigración sin tela dedicada (7 vendas Gs 71.6M). Livro Geral/Extrato completo YA implementado (ver entrada abajo).

## ✅ 20/09 — MÓDULO LIVRO GERAL / EXTRATO (`/financeiro/livro`) — CONSTRUIDO + DEPLOY TESTE
**Solicitado por Rodrigo:** «pode seguir para faltas financeiras» — implementar as sub-páginas financeiras pendientes.
**Entregue:** nova página `Livro.tsx` (rasta `/financeiro/livro`, roles admin/manager) com **extrato completo paginado + filtros + busca + export PDF/CSV**, superando o antigo limite de "top-10 sem filtros" do painel.
- **Schema validado na BD real:** `financial_transactions` (20 colunas; coluna real de texto = `name` + `description` opcional, `type` text, `bank_id` FK, `is_realized`, `source`, `date`, `agent_id`). Dados tenant Ahut: **340 transações** (90 income + 250 expense), todas realizadas, rang 01/01/2026→17/09/2026, fontes: import_livro_geral(324)/import_abertura(9)/import_imigracao(7). `agent_id` vazio no tenant (sem join necessário).
- **Backend:** novo hook `useFinancialLedger` em `use-financial.ts` — query paginada (`count:'exact'` + `.range`) com filtros (type, categoryId, bankId, dateFrom, dateTo, realizedOnly, search ilike) + joins de categoria e banco (`FinancialTransaction` estendido com `bank`). Reaproveita `useFinancialCategories` e `useFinancialBanks`.
- **UI:** cards resumo (registros + entradas/saídas da página visível), painel de filtros (busca, tipo, categoria, banco, range datas reativas — Springer Rodrigo: mudança num campo re-executa query), checkbox "somente realizadas", tabela com tipo/categoria/banco/situação, **paginação** Anterior/Próximo, botões **CSV** (exportToCSV) e **PDF** (exportToPDF) do export-utils. Moneda Gs.
- **Rutas/navegación:** import lazy + Route `/financeiro/livro` en App.tsx; botón "Livro Geral" (BookOpen) en header Financeiro.tsx, junto a Contas/Comissões.
- **Build OK** (tsc limpio nos meus arquivos — error `ai-prompts.ts` preexistente no tocado) → `dist/assets/Livro-DJVrClKB.js` (9.6 KB). **Deploy TESTE ✅** (`teste-ahut-ecosystem`): backup 661 assets + `DEPLOY_OK`; verificado live: index `index-CY5INcGH.js` servido + `Livro-DJVrClKB.js` HTTP 200 + ruta `/financeiro/livro` no registro JS.
- **Falta financeira pendiente:** Transferências/Ajustes entre bancos (movimentação P4b, saldo inicial 01/01/2026) e relatório de transferências. Vendas & Imigración YA implementado (ver entrada abajo).

## ✅ 20/09 — MÓDULO VENDAS & IMIGRAÇÃO (`/financeiro/vendas`) — CONSTRUIDO + DEPLOY TESTE
**Solicitado por Rodrigo:** «pode seguir para faltas financeiras» — última sub-página financeira pendiente do mapeo.
**Entregue:** nova página `VendasImigracion.tsx` (rasta `/financeiro/vendas`, roles admin/manager) com **KPIs + listado das 7 vendas de imigração**.
- **Schema validado na BD real:** `sales_records` do tenant está **vazio (0 rows)** — a fonte real das vendas de imigração é **`financial_transactions` WHERE `source='import_imigracao'`** (P2). Confirmado: 7 vendas income, **todas `is_realized=true`**, soma **Gs. 71.599.999**, categoria Imigração (13bacf33), banco Banco Itaú (5ab2f8f1), datas 01–19/08/2026, `reference_id`/`reference_type` nulos. Banco de dados real (critério Rodrigo).
- **Backend:** novo hook `useFinancialSales` em `use-financial-sales.ts` — query RLS tenant-scope (financial_transactions), agrega totalVendas/totalValor/media/maiorValor, parseia o comprador do nome composto "COMPRADOR — residência temporária…" (`parseBuyerName`).
- **UI:** 4 KPIs (total vendas, valor total, ticket médio, maior venda), tabela com comprador/descrição/data/situação/valor, botões **CSV** e **PDF** (export-utils). Moneda Gs.
- **Rutas/navegación:** import lazy + Route `/financeiro/vendas` en App.tsx; botón "Vendas & Imigração" (Plane) en header Financeiro.tsx.
- **Build OK** (tsc limpio — error `ai-prompts.ts` preexistente no tocado) → `dist/assets/VendasImigracion-CPO716xJ.js` (6.5 KB). **Deploy TESTE ✅** (`teste-ahut-ecosystem`): backup 734 assets + `DEPLOY_OK`; verificado live: index `index-Q-xMiWe2.js` servido + `VendasImigracion-CPO716xJ.js` HTTP 200 + ruta `/financeiro/vendas` no registro JS.
- **Falta financeira pendiente (fora do mapeo principal):** tela de Transferências/Ajustes entre bancos (movimentação de saldo inicial / transferências internas).

## ✅ REGISTRO NO APP — TAREFAS DOS 7 DIAS (08/09→15/09) COMO CHAMADOS (teste+prod compartilham o mesmo Supabase `ptochsyoyatsydfysacc`)
**Solicitado por Rodrigo (15/09):** registrar os cards dos últimos 7 dias (iniciadas/em andamento/executadas) no app TESTE e/ou PROD com datas e desenvolvimento de cada ticket.
**Entregue:** 15 tickets criados na tabela `technology_tickets` (aparecem em TESTE e PROD — mesmo banco). Códigos `TCK-2026-094` a `TCK-2026-108` + `TCK-2026-098` (RAG postergado, `a_analisar`) + `TCK-2026-104` (incidente broker, `a_analisar`). Cada um com `timeline[]` (from/to/note/actor/at) registrando o desenvolvimento passo a passo, `description` técnica, `business_impact`, `acceptance_criteria`. Validado ao vivo no TESTE (kanban renderiza os 17 TCK, screenshot `tickets_7dias_kanban.png`).
**Detalhe de schema (pitfall descoberto):** `technology_tickets.subcategory` tem CHECK constraint fixa = apenas `nao_especificado`/`em_aplicacao`/`atualizado`. `priority` = `alta/media/baixa`. `delivery_forecast` é DATE (não aceita `""`). Script: `/opt/data/scripts/_registro_tickets_7dias.py` (chmod 600).

| Ticket | Data | Título (resumo) | Status |
|---|---|---|---|
| TCK-2026-094 | 08/09 | ANTIGRAVITY Fase 3-C: reidratação JSX commitada | executado |
| TCK-2026-095 | 09/09 | Hotfix imóvel `amount`/`currency`/`maps_link` PROD | executado |
| TCK-2026-096 | 09/09 | Insumos Jhon Wick (briefing + compat broker) | executado |
| TCK-2026-097 | 09/09 | Retorno Jhon Wick: migração remodel-copy + paridade 100% | executado |
| TCK-2026-098 | 09/09 | RAG semântico (Camada C) — POSTERGADO | a_analisar |
| TCK-2026-099 | 14/09 | SDR Fase 0: schema próprio + RPC + toggle PROD | executado |
| TCK-2026-100 | 14/09 | SDR Fase 1: worker PM2 + Realtime + OUTBOX | executado |
| TCK-2026-101 | 14/09 | SDR Fase 3: painel UI qualificação TESTE | executado |
| TCK-2026-102 | 14/09 | Prep ambiente teste SDR (limpeza 6257 + fix RPC) | executado |
| TCK-2026-103 | 15/09 | Frente B mídia-reply broker (3 patches, PROD) | executado |
| TCK-2026-104 | 15/09 | **INCIDENTE** reload deslogou sessão PROD (auth deletado) | a_analisar |
| TCK-2026-105 | 15/09 | Frontend fix mídia + teto PostgREST (773ed19) | executado |
| TCK-2026-106 | 15/09 | Commit todas atualizações (f36dae4) | executado |
| TCK-2026-107 | 15/09 | Evolução page Chamados (cadastro guiado + anexos) TESTE | executado |
| TCK-2026-108 | 15/09 | Reunião squad: análise 7 dias + scorecards + evolução | executado |

## 📊 REUNIÃO SQUAD — 15/09 — ANÁLISE 7 DIAS (09/09→15/09) + SCORECARDS + EVOLUÇÃO DE AGENTES
**Atividades do período (ordem cronológica):**
- 09/09 — Hotfix cadastro de imóvel (`amount`/`currency`/`maps_link` ausentes na base PROD), insumos p/ Jhon Wick (briefing + manifest MD5 broker `9eb2e374` 100% compatível), RAG semântico postergado (aguarda decisão do store).
- 14/09 — Agente SDR (Ava da HUT): Fase 0 (schema próprio + RPC `fn_sdr_should_reply` + toggle `sdr_enabled` no PROD), Fase 1 (worker PM2 `sdr-agent-worker` id14 online + Realtime inbound + OUTBOX), Fase 3 (painel UI qualificação no Atendimento, bundle `Atendimento-Sxcfm-HT.js` TESTE). Limpeza em PROD do contato `5511915306257` + fix RPC `p_conv_id` + auto-enable p/ contato inédito.
- 15/09 — Frente B mídia-reply no broker (fix 3 patches `session-manager.ts`, tsc EXIT:0 + teste Node PASS, promovido PROD via `pm2 reload`) + **incidente: reload deslogou sessão WhatsApp PROD `595994857156`** (comportamento destrutivo pré-existente `cleanupDisconnectedSessions`); recuperação pausada por decisão do Comandante. Frontend: fix mídia + teto PostgREST commit `773ed19`. **Task 15/09: page Chamados evolvida** (cadastro guiado + anexos foto/áudio/doc + print + visual moderno, commit `242696e` TESTE).

**SCORECARD 14/09 (SDR Fase 0-3, 3 entregas):** TEMPO 8 · RETRABALHO 7 (1 fix RPC `p_conv_id`) · CONFORMIDADE 10 · COBERTURA 10 · AUTONOMIA 8 (auto-análise sem comando) · APRENDIZADO 10 → **88/100**
**SCORECARD 15/09 (mídia-reply + incidente + page Chamados):** TEMPO 8 · RETRABALHO 6 (gatilho do incidente — reload deletou sessão; responsabilidade assumida, mitigação pendente) · CONFORMIDADE 9 · COBERTURA 9 · AUTONOMIA 8 · APRENDIZADO 9 → **82/100**

**LACUNAS & MELHORIAS (rankeadas):**
1. 🔴 **CRÍTICO — broker destrói auth sem backup no reload/restart** (custo real: 1 sessão PROD perdida 15/09). Fix: backup automático `auth_info/` antes de qualquer `stopSession(deleteAuth=true)` + NÃO apagar auth em desconexão transitória. Prioridade máxima.
2. 🟡 **Validação ao vivo não automatizada** — o runbook manda validar na tela real, mas depende de browser/Chrome (daemon indisponível no backend). Proposta: prova programática via HTTP + curl dos bundles + Playwright headless quando Chrome disponível.
3. 🟡 **Fase 4 SDR não fechada** — painel no TESTE ok; falta conectar `sdr_enabled` p/ validar lead inédito no app (Ava da HUT aguarda validação real).
4. 🟢 **RAG semântico (Camada C)** postergado — base 63 docs pronta; aguarda escolha do store (decisão do Comandante).

**VIABILIDADE DE EVOLUÇÃO/CRIAÇÃO DE AGENTE:**
- **Evoluir (recomendado, não criar novo):** o squad não precisa de agente novo — precisa de **robustez no AJAX (broker)** contra falhas destrutivas. Atualizar a skill `ajax-whatsapp-business` com a guarda de backup-de-auth pré-reload (aprendizado do incidente 15/09).
- **Criar?** 🚫 NÃO agora. A proposta `wab-client` (agente novo) segue **provável mas não urgente** — o valor viria depois da Fase 4 SDR e da robustez do broker. Revisitar pós-fechamento Fase 4.
- **Novo agente em avaliação:** `qas-tickets` (curador de chamados técnicos p/ leigos) — viável como evolução da própria page de Chamados (formato ficha técnica auto-gerado), NÃO como processo separado.

## ✅ 14/09 — PREPARAÇÃO AMBIENTE TESTE SDR: CONTATO 6257 INEXISTENTE + FIX RPC + AUTO-ENABLE
**Exclusão em PROD (autorizada por Rodrigo):** telefone **5511915306257** (Jonathan Gúsman) **purgado** de todas as tabelas — whatsapp_messages=0, messages=0, conversations=0, whatsapp_contacts=0, profiles=0, conversation_events=0, sdr_sessions=0. Backup `limpeza_6257_20260914_164755.json`. Trigger `trg_conversations_audit` reativado.
**Fix RPC (causa raiz de bloqueio do teste):** worker chamava `rpc('fn_sdr_should_reply',{p_conv})` mas a function espera **`p_conv_id`** → erro de schema cache. Corrigido no src e redeployado (PM2 id 14 online, inscrito Realtime, dist 13:57).
**Auto-enable SDR:** o worker agora auto-habilita `sdr_enabled=true` **apenas para contato inédito** (sem histórico/sem sessão) — regra de ouro preservada (base antiga = `has_history` barrada). `shouldReply` bloqueia só base antiga e sessão duplicada. **Ambiente pronto: próximo inbound inédito dispara Pergunta 1 sozinho.**

## ✅ 14/09 — FASE 3 AGENTE SDR (Ava da HUT): PAINEL UI NO TESTE
**Painel "Qualificação SDR (Ava)"** no card *Dados de Contato* do Atendimento: renderiza dinamicamente `sdr_steps ↔ sdr_answers` (pergunta → resposta registrada) com dados reais do banco. Novo hook `src/hooks/use-sdr.ts` (busca sessão da conversa + respostas + roteiro). Labels por step (Abertura/Orçamento/Cidade preferida/Apresentação/Compromisso). Build Vite OK + deploy TESTE (PARITY_OK bundle `Atendimento-Sxcfm-HT.js`). **Pergunta 3 = cidade de preferência aplicada no PROD.**

## ✅ 14/09 — FASE 1 AGENTE SDR (Ava da HUT): WORKER ONLINE NO PM2
**sdr-agent-worker** (PM2 id14, `/root/crmahut/sdr-agent-worker`) online + inscrito Realtime `whatsapp_messages` inbound. Travas via RPC `fn_sdr_should_reply` (toggle `sdr_enabled` ON + contato inedito + sem sessao). Envio via OUTBOX `whatsapp_messages pending/from_me=true` (broker coleta no poll). Qwen/OpenRouter (chave Hermes) interpreta resposta: avanca OU repregunta a MESMA etapa; registra em `sdr_answers`. Publicacao realtime ADD: `whatsapp_messages`+`sdr_sessions`+`sdr_answers`+`sdr_steps`. **PENDENTE Fase 4: ligar `sdr_enabled` p/ validar lead inedito no app TESTE.** Pitfall: bootstrap sob PM2 NAO usa guard `process.argv[1]` (levantaria ocioso) — inicia incondicional.

## ✅ 14/09 — FASE 0 AGENTE SDR (Ava da HUT): SCHEMA PRÓPRIO APLICADO NO PROD
**Decisão do Comandante:** testar no schema PROD via app TESTE; estrutura PRÓPRIA de tabelas p/ perguntas/respostas (NÃO usa `p1..p9` legado); chave OpenRouter do Hermes REUTILIZADA; DeepSeek = programação; Qwen (`qwen/qwen3.5-flash-02-23`) = exclusivo do agente de atendimento (validado HTTP 200).
**Objectivos aplicados em PROD `ptochsyoyatsydfysacc` (idempotente, backup `scripts/backups_sdr/sdr_fase0_20260914_152202.json`):**
- `sdr_steps` (roteiro 5 perguntas, seed: open/finance/region/presentation/compromise, `question_text` editável)
- `sdr_sessions` (estado: conversation_id, current_step 1..5, status active/completed/aborted, llm)
- `sdr_answers` (UMA LINHA POR RESPOSTA: session_id, step_code, answer_text, llm_interpretation jsonb, answered_at)
- `conversations.sdr_enabled` (trava de toggle DEDICADA, opção B — não colide com ai_enabled)
- RPC `fn_sdr_should_reply(uuid)` → jsonb {enabled, conv_id, has_history, sent_by_agent, exists_session} — validada em conversa real (enabled:false) e id fake (não quebra)
- RLS + policies + grants padrão squad.
**Prova pós-ALDO:** 3 tabelas criadas + seed 5 perguntas + coluna toggle + RPC. Chave Hermes funcional (Qwen respondeu).}
**Pendente Fase 1:** worker PM2 `sdr-agent-worker` (Node, Realtime inbound, travas, Etapa 1, Qwen para parsear resposta).

## ✅ 09/09 — HOTFIX CADASTRO DE IMÓVEL: colunas `amount`/`currency`/`maps_link` NÃO existiam na base PROD
**Bug reportado por Rodrigo:** ao clicar "Confirmar Cadastro" com tudo preenchido, erro `could not find the 'amount' column in 'properties' in the schema cache`.
**Causa-raiz (provada, não assumida):** o build M1 (09/09) insere `amount`,`currency`,`maps_link`, mas o M2 registrado no changelog 13:30 **nunca foi aplicado de fato** na base `ptochsyoyatsydfysacc` — a tabela real só tinha `price`/`price_type`(default 'sale'). Pipeline divergente.
**Fix aplicado PROD (com backup):**
- `ALTER TABLE properties ADD amount numeric, currency text DEFAULT 'USD', maps_link text`
- CHECK `currency IN (BRL,USD,GS)`
- CHECK `price_type` recualificado → `(sale,rent,FINAL,MONTHLY,DOWN_PAYMENT)`
- Backup: `backups_properties/properties_20260909_145051.json` + .schema + .constraints
- Validação: INSERT teste completo (MONTHLY+GS+maps_link) OK → cleanup → 15 reais intactos
**Lição:** após qualquer ALTER, rodar `_schema_properties.py` para PROVAR colunas na base real antes de fechar a task (não confiar só no changelog).

**Diretório de EDIÇÃO** (novas features + deploys): `src/` do **Jhon Wick** (repo `REPOSITORIOENGENHARIAREVERSACODIGOFONTE`, branch `main`, montado em `/tmp/legacy_re`, 170 arq, buildable). É aqui que se fazem as **edições reais**, gera-se o **re-build** e sobe-se para **teste-ahut**.
**Diretório de REFERÊNCIA** ("Pedra de Roseta"): `00_ANTIGRAVITY_FASE3_CORRECCION/check/src/` (210 arq reidratados). **Só como mapa** — conferir como roda em produção, tipagem Supabase real, nomes originais. **NÃO editar/compilar daqui**.
**Fluxo estrito:** editar `src/` (Jhon Wick/main) → re-build → deploy dist em teste-ahut → validar → prod (aprovação humana).

## ✅ 08/09 — ANTIGRAVITY FASE 3-C: REIDRATAÇÃO JSX CORRIGIDA E COMMITADA (remodel)
**Entrega:** os 210 arquivos `.ts/.tsx` reidratados (e.jsx→JSX declarativo) agora **parseiam 210/210** com parser real TypeScript 5.9.3 (0 fail sintático).
- **Commit:** `43b3ddf` na branch `remodel` do `ahut-ecosystem-remodel-copy` (HEAD anterior `285f483`).
- **Alvo:** `00_ANTIGRAVITY_FASE3_CORRECCION/check/src/` — components 96, pages 80, hooks 24, lib 6, comissoes 4, contexts 2, ui/types/store 1 cada.
- **Correções-chave (causas-raiz de descompilação):**
  1. `lib/ai-prompts.ts` — backticks/`${` escapados (`\``, `\${`) de descompilação → template literals literais.
  2. `pages/index-C9-68P_N.tsx` — **JWT anon real de 208 chars** embutido no bundle → redigido `[REDACTED: SUPABASE_ANON_JWT]` (commit refeito via amend, secret NÃO ficou no histórico).
  3. `pages/Atendimento-live-v14.tsx` (l.857/860/1039) — `>` cru em texto JSX (`Menu > Aparelhos > Conectar`) → `&gt;`.
  4. `tsconfig.json` — removido `baseUrl` (obsoleto no TS 7) + alias `@/*`→`src/*`.
- **Sanitização final:** 0 `sk-`, 0 `service_role`, 0 `eyJhbG[50+]`, 0 AWS/ghp/private keys no commit.
- **Achado crítico (auditoria Fase 3 original):** o `report` anterior afirmava "tsc 0 erros" via `--listFiles`, mas o `.bin/tsc` **não existia** no checkout → `0` era máscara (2 parse_fail reais escondidos). Prova real agora usa parser instalado.
- **Evidência rerodável:** `00_ANTIGRAVITY_FASE3_CORRECCION/check/parse_test.js` + relatório `ANTIGRAVITY_FASE3_CORRECCION_VERIFICADA.md`.
- **Pendente:** build → dist → valida link em `teste-ahut` → ativar. Árvore vive em `00_ANTIGRAVITY_FASE3_CORRECCION/check/src` (no repo), ainda não copiada para a pasta de prod/RE.

## 🛑 PONTUAÇÃO PENALIZADA — 04/09 — INDICADOR DE ESTÁGIO NUNCA DEPLOYADO (falha de review+validação+deploy)
**Falha:** Missões 1 e 2 (indicador de estágio na lista + seletor no chat) foram **implementadas na FASE 2 (commit `46f6421`)** mas **NUNCA foram deployadas** — o bundle do DEV (`index-DBFmZRCv.js`) só subiu em 04/09 após correção do Comandante. Por isso **não havia NENHUMA identificação de estágio na tela**.
**Responsáveis (penalidade):**
- **ATOM (frontend review):** ❌ não revisou a entrega → **-5 pts**
- **Jarvis (orquestrador):** ❌ não validou resultado REAL na tela, só código/build → **-5 pts**
- **Agente de deploy:** ❌ deixou o bundle parado no repo, não subiu → **-5 pts**
**Lição:** DEPLOY NUNCA fica pendente após commit — validar na tela real do DEV. FIX SEQUENCIA: sidebar fecha (hidden xl→block) + Origem dinâmica (L.source) + Estágio Atual + Histórico (c.subject) + Notas (L.notes) + Ver Cartão do Lead → A("/leads",{state:{selectedLeadId:c.lead_id}}) abrindo lead específico. Bundle completo `387dcb44` no /teste/ (Task1 login validado HTTP 200 no subdomínio); prod `/ahut/`+`/ahut-ecosystem/` ainda `12421532` aguardando validação.

## ✅ 06/09 — SELETOR DE ESTÁGIO DENTRO DA ENGRENAGEM ⚙️ (HEADER ATENDIMENTO) — DEPLOYADO EM PROD
**Entrega:** seletor de 12 estágios do funil DENTRO do modal "Configurações do Atendimento" que a engrenagem ⚙️ (ao lado do 👤) abre no header do chat central.
**Posição no modal:** Status do Ticket → **Estágio do Atendimento** → Corretor Responsável.
**Bundle:** `Atendimento-live-v14.js` md5 `9133ffc7` (169.508 B) — deployado em `/ahut/`, `/ahut-ecosystem/` e `/teste/` (mesmo docroot). Backups `.bak_seletor_prod` (original `9c57d6bf`) preservados p/ rollback.
**Persistência:** grava em `leads.stage` via `c.lead_id` (usa `B` global + `c` em escopo — sem tela branca).
**Iteração (3 telas brancas superadas):**
- v14: inseriu no ⋮ MoreVertical (lugar errado — a ⚙️ abre modal separado `Re(!0)`).
- v15: array de `option`s SEM vírgula → SyntaxError runtime → tela branca (`node --check` não pega ESM).
- **v16 final:** seletor no modal da ⚙️ + vírgulas entre `option`s + validação parse **ESM real** (`.mjs`). Confirmado pelo usuário: "Deu certo o botão de seleção dentro da engrenagem". ✅

## 📊 Painel de Controle Consolidado do Squad IA

**Última Atualização:** 03/09/2026 (Ciclo 5 — Zombie dupla-montagem + push código + Funil de Performance)  
**Ambiente Ativo:** Produção (`ahut-ecosystem.apexfyhub.com.br`) | Repo: `rodrigofsacramento-alt-...-remodel` (branch `remodel`, docroot `/ahut/`)  
**Dev Subdomínio:** `https://dev-ahut-ecosystem.apexfyhub.com.br` ✅ Funcionando (SPA routing fix)  

## ✅ PROGRESSO CICLO 5 — ZOMBIE DUPLA-MONTAGEM DO LOGIN (03/09) — RESOLVIDO
- ✅ **Push GitHub** — commits `b69dfaa` (filtro atendentes) / `1722d54` (filtro admin-only) confirmados no remote `origin/remodel`. Filtro de atendentes 100% funcional no PROD (sha `55cd3037`, `Atendimento-live-v14.js` = mesmo conteúdo de `v12` versionado).
- ✅ **Causa raiz zombie (provada via Playwright, não assumida):** módulo ES do entry `index-C9-68P_N.js` **executa 2×** (carregado com 2 URLs: `?v=...` vs sem) → **2 `createRoot` no mesmo `#root`** → app inteira monta 2× (2 forms, 2 toaster, 2 buttons). NÃO é dupla invocação React nem o monkey-patch `insertBefore` (benigno, existe em todo commit).
- ✅ **Fix aplicado:** guard de idempotência **por MONTAGEM** (não por render) no entry: `(!window.__APP_MOUNTED&&(window.__APP_MOUNTED=1))&&br(...).render(au)`.
- ✅ **Deploy nos 4 destinos oficiais** (VPS html, VPS crm, Hostinger `/ahut/`, legacy) — verificado sha `26d262d834d9`. Backups `.pre_dupfix` preservados.
- ✅ **PROD validado ao vivo:** `forms:1, emails:1, pws:1, root_children:4, body_white:false, PAGE_ERRORS:nenhum` — **login 1 form, tema claro Estate.ia mantido, sem tela branca, sem duplicata.**
- ✅ **Commit + push** `cf6c7d6` no GitHub `origin/remodel` (bundle patched + backups versionados).
- 🚨 **Reporte "Não foi possível validar a sessão"** → **✅ RESOLVIDO 03/09.** Causa raiz: cache-buster `?v=` no entry do index.html criava módulo 2× (URL ≠ chunks) → 2 contexts `Io` → Login via `$t` lia o errado → signIn stub no-op → nenhum fetch → `getUser()` null → "Não foi possível validar a sessão". Fix: remover `?v=` do entry no index.html + bundle singleton client `__AHUT_SB_Q`. Deploy 4 destinos + index.html corrigido (backups `.pre_noqv`). Commit `7f6db20` pushado. **Prova PROD real:** 1 req entry, POST `/auth/v1/token` ocorre, "Invalid login credentials" real, 0 GoTrueClient warn, `sessao_invalida:false`, `forms:1`.
- 🔄 **Próximo (ordem usuário, 2º erro):** ~~`Cannot destructure property 'error' of '(intermediate value)' as it is undefined`~~ → **✅ RESOLVIDO 03/09**. Destructuring null-safe `?.error` nos awaits de auth do `Login-CbFMVaJO.js` (submit `Promise.race` + OAuth `L()`). Prova: 0 destructuring inseguro em await (era 2). Deploy 4 destinos sha `cb940b67f25d`, commit `7ce1b3e` pushado.
- ✅ **BUG-UI-001** — Inversão Visual Grupos (isAgentSender) + Legenda lead mostrava nome do grupo: corrigido. 10 perfis atualizados no DB. Backend patched. **status: executado**
- ✅ **TCK-2026-093** — Hotfixes produção: áudio, textarea, isAgentSender (solicitado 24/08, entregue 26/08)
- ✅ **TCK-2026-092** — Correção de áudios WhatsApp: pipeline WebM→OGG, retry 2x, timeout 60s, `.single()` fix
- ✅ **Commit `38e8c1e`** — Snapshot produção + broker no `ahut-ecosystem-active`
- ✅ **Commit `3e47891`** — Schema banco de dados produção
- ✅ **MANUAL_MASTER_RUNBOOK.md** — Handover do dev original documentado
- ✅ **GUIA_COMANDANTE.md** — Comandos `/executar`, `/performance`, `/criaragente`
- ✅ **Fluxo Pós-Entrega** — SKILL.md do Jarvis atualizado com performance + lacuna + ASIMOV
- ✅ **Áudio funcionando** — Testado e validado na produção
- ✅ **Score de Performance (03/09, relatório do dia):** **85/100** — aplicado o novo critério de RETRABALHO (03/09).

### 📊 SCORECARD 03/09 — atividades do dia (novo critério de Retrabalho)
| Indicador | Avaliação do dia | Pts |
|---|---|---|
| TEMPO_EXECUCAO | Fix do ciclo puxou +1 iteração (detour do singleton no login) | 7 |
| **RETRABALHO** | **1** → correção do Comandante: validar o **fluxo REAL** (submit/login), não só render — o squad podia ter testado sozinho | **7** |
| CONFORMIDADE_CRITERIOS | 100% — zombie morto, login autentica de verdade, destructuring ok, filtro atendentes intacto | 10 |
| COBERTURA_TECNICA | index.html + entry bundle + Login + 4 destinos + runbook (5 mapeados, 5 alterados) | 10 |
| AUTONOMIA_AGENTE | Descobriu causa raiz (módulo dupla) via prova real; mas precisou de 1 correção QA de fluxo | 7 |
| APRENDIZADO_REGISTRADO | Runbook + PAINEL atualizados com a causa raiz definitiva | 10 |
| **Score final (média×10)** | | **85/100** |

> **Regra de ponderação aplicada (definida 03/09):** NÃO penalizei o usuário não ter passado acesso a sistema nunca fornecido (fora do alcance). PENALIZEI a instrução de testar o fluxo real do login — o squad tinha como descobrir sozinho (probe de submit real). Isso entrou como 1 retrabalho.

### 📊 SCORECARD 03/09 (noite) — Ciclo /executar Tasks 1–4
| Indicador | Avaliação | Pts |
|---|---|---|
| TEMPO_EXECUCAO | Dentro de ~10% do estimado (funil exigiu 1 rework do hook p/ RPCs) | 7 |
| RETRABALHO | 0 correções de escopo; 1 re-fechamento interno (hook não chamava as RPCs criadas) resolvido pelo squad | 7 |
| CONFORMIDADE_CRITERIOS | 100% — 4 tasks entregues + badge + commit seguro com push validado | 10 |
| COBERTURA_TECNICA | broker + 9 usuários + bundle v14 + TSX (App/Layout/Lang/Atendimento) + hook + SQL + 2 deploy scripts (13 mapeados, 13 alterados) | 10 |
| AUTONOMIA_AGENTE | Validou SQL no schema real, refez hook p/ RPCs, deploy dev real, commit+ls-remote — sem correção de Rodrigo | 8 |
| APRENDIZADO_REGISTRADO | Runbook (schema real DEV) + PAINEL (TASK-009) atualizados | 10 |
| **Score final (média×10)** | | **87/100** |

> **Análise de Lacuna:** PHP de funil já resolvido no DEV. Nova lacuna proposta na entrega noturna: **verificação** da Task 4 permanece DEV-bound (PROD Estate.ia usa schema diferente, sem `contracts`/`lead_id` em conversations) — vide decisão de não portar dark p/ PROD claro.

- 🔄 **Análise de Lacuna:** Agente `wab-client` proposto (WhatsApp Business Client Specialist)
- 🔄 **Engenharia reversa produção→dev:** Pendente (ADA identificou 12 correções que faltam no TSX)
- ✅ **Commit + Push no GitHub remodel** — 10 commits enviados (58c5415): cartões navegam, TreinamentoAula, 🚀 Skill ATLAS deploy dev, Gestão persistência, Neurovendas, Chamados/Tecnologia, refatoramento, RPCs Atendimento, Corretores/Agenda. [58c5415]
- ✅ **PostgreSQL 15 instalado na VPS** (2.24.95.98) — serviço systemd, DB clone_prod.
- ✅ **pg_dump da produção Supabase** (`ptochsyoyatsydfysacc`) — schema 15.113 linhas extraído com pg_dump 17.
- ✅ **Schema restaurado no clone**: 65 tabelas, 58 funções, 53 triggers, 110 RLS policies, 4 extensões.
- ✅ **Comparação clone vs dev Supabase** (`mizeybqkgvuulbatsvte`): 16 tabelas faltantes no dev foram **criadas**.
- ✅ **Divergências de colunas corrigidas**: leads.tags (removido whatsapp_group), profiles.department_id + manager_id, whatsapp_sessions.last_event_at.
- ✅ **Tabela `documents` removida** do dev (não existe em produção).
- ✅ **Dev Supabase agora com 65 tabelas** (idêntico à produção em estrutura).
- ✅ **RLS Policies incluídas** no clone (110 policies de produção).

## 🔧 INFRA — Conexão com o clone na VPS
- `postgresql://postgres:[REDACTED]@2.24.95.98:5432/clone_prod`
- Acesso completo para testes livres — 0 risco ao cliente.
- _Falta: extensions pg_cron, pg_graphql, pg_net, supabase_vault, vector (instalar se app usar)_

## ✅ PROGRESSO CICLO 2 — IMPLEMENTAÇÃO (páginas novas + conexão a dados)
- ✅ **Jurídico** (`/juridico`) — criada, rota+nav, build ok. [commit c6e77ac/452d4a7]
- ✅ **Comissões** (`/comissoes`) — criada (agent_commissions/commission_rules, faixas, câmbio), build ok. [452d4a7]
- ✅ **GestãoClientes** (`/clientes`) — criada, rota+nav, build ok. [452d4a7]
- ✅ **Marketing** (`/marketing`) — criada (alcance vs engajamento, mídias, integrações), build ok. [452d4a7]
- ✅ **Atendimento** — modo DEMO (fallback conversas/msgs quando WhatsApp não escaneado) p/ auditoria de UI. [a88fd14]
- ✅ **Leads** — conectado ao Supabase (useLeads/useCreateLead/useUpdateLead): Assumir Lead, mover estágio, cadastrar real. [052db56]
- 🔄 **Financeiro** — refatoração p/ dados (agente em execução)
- 🔄 **Dashboard** — refatoração p/ dados (agente em execução)
- 📄 **GAP REPORT PRIORIDADES** — descoberta: Leads/Financeiro/Dashboard eram MOCK puro; sem dados reais. [f085c76]

## 🎯 PRÓXIMAS FALTAS (de produção, ainda sem TSX reverso)
- **Área do Cliente** (`/area-cliente`) — portal do cliente
- **CorretorDashboard** — resumo do corretor (metas/ranking)
- **SuperAdmin*** (Users, Tenants, Plans, Subscriptions, Financial, Health, Audit, Communications, PortalIntegrations, Settings, Dashboard, Login, Layout) — gestão do sistema

---

## 🚨 INCIDENTE EM PRODUÇÃO — RECLAMAÇÕES DA DENISSE (Central de Atendimento)
> Relato da usuária (23/08): (1) não vê quem responde no grupo; (2) muitas mensagens como "arquivo indisponível"; (3) não vê todos os contatos; (4) não consegue chamar contato no privado pelo sistema.
> **Observação do comandante:** estas falhas afetam a PRODUÇÃO (não só o protótipo TSX).
> **Responsável (ATLAS):** diagnóstico de causa-raiz em andamento (artefatos: patch_broker_groups.mjs, build_group_sidebar_v7.mjs, update_participant_loader.mjs, chunks de produção Atendimento).
> **MAIOR GAP verificado localmente:** código reverso NÃO usa as RPCs de produção `accept_conversation`, `mark_conversation_read`, `transfer_conversation`, `ignore_conversation`, `update_client_contact` (essenciais p/ fila/aceite/transferência e chamada no privado).

---

---

## 🚦 Status Atual dos Agentes

| Agente | Papel | Status | Porta/URL | Última Entrega |
| :--- | :--- | :---: | :---: | :--- |
| **🛠️ ATOM** | Fullstack & DevOps | 🟢 **Aguardando Fase 3** | `5175` | Refatoração UI Propostas |
| **👩‍💼 AVA** | Triagem & Intake IA | 🟢 **Ativa** | N/A | Roteiro de Entrevista Imobiliária |
| **👑 JARVIS** | Orquestrador Chief | 🟢 **Monitorando** | N/A | Sincronização do Squad |
| **👁️‍🗨️ ARGUS** | Scrum Master | 🟢 **Fechamento Sprint 3** | N/A | Conclusão Fase 2 |
| **🎨 ADA** | Frontend UI/UX | 🟢 **Aguardando Fase 3** | N/A | Refatoração UI Atendimento |
| **🕵️ AURA** | QA Tester | 🟢 **Validado Localmente** | N/A | Prints Automáticos 5175 |
| **🛡️ AEGIS** | SecOps | 🟢 **Aguardando Fase 3** | N/A | RBAC em Agenda (Mock) |
| **📊 APOLLO**| Data Analyst | 🟢 **Em Espera** | N/A | Aguardando Vendas |
| **👁️ ARIA** | Monitor de Leads | 🟢 **Ativa** | N/A | Vigia no Banco de Dados |
| **🌐 ATLAS** | Infra & Integrações | 🟢 **Em Espera** | N/A | - |

## 📋 Kanban Engenharia Reversa (Fase 2 - Sprints 2 e 3)
- [x] Extração Lógica `Configuracoes.js` e Componentização TSX (Sprint 2)
- [x] Implementar Filtro Visual de Grupos em Leads (Sprint 3)
- [x] Refinar Design e Atalhos de Agendamento da Central de Atendimento (Sprint 3)
- [x] Implementar RBAC e Modais em Agenda (Sprint 3)
- [x] Implementar UI de Dashboard em Propostas (Sprint 3)
- [ ] Engenharia Reversa - Módulo Jurídico (Fase 3)
- [ ] Refatoração Página `Corretores.tsx` (Fase 3)

| Status | Ticket | Origem | Agente Envolvido |
| :---: | :--- | :--- | :--- |
| 🟢 | Sprint 3 - Atendimento, Agenda, Propostas, Leads | Engenharia TSX | **Atom & Ada** |
| 🟢 | Teste e Build da Sprint 3 | QA | **Aura** (Validado 100%) |
| ⚪ | Refatoração Página `Corretores.tsx` | Backlog Fase 3 | **Squad** |
| ⚪ | Refatoração Página `Jurídico` | Backlog Fase 3 | **Squad** |

## 🚨 Último Alerta (AURA)
> **[BLOCKER] - Build Vite falhou!**
> "Atom e Ada, o componente Vendas.tsx tem importações inexistentes (`../types/supabase`, `ConfirmDialog`, `Avatar`). A build quebrou! **Não autorizo o deploy local**. Corrijam as dependências antes de prosseguir."

---

## 📜 Histórico Recente de Tasks

| Task | Descrição | Status | Detalhes |
| :--- | :--- | :---: | :--- |
| **TASK-010** | SANEAMENTO DE LEADS LEGADOS — Funil QUBITS (MISSÃO 1) | **✅ CONCLUÍDO** | `leads.stage`: 9.313 migrados p/ `A Selecionar` (5.336 Primeiro Atendimento + 3.977 Lead Cadastrado). Backup `_backup_leads_stage_2026` (9.313). Check `leads_stage_check` ajustada (+`A Selecionar`, preservou 10 avançados). Nenhum dado avançado tocado. Commit seguro pushado. |
| **TASK-011** | FUNIL ÚNICO QUBITS — FASE 2: Data-binding + Gatilho (aceite GO 4/4) | **✅ CONCLUÍDO** | Régua 12 estágios (fonte única `conversations.stage`): check c onstraint `leads_stage_check` + `conversations.stage` (default Contato Cadastrado) + `conversations.lead_id` (FK) + `leads.conversation_id` (FK) + índices. Gatilho `trg_lead_qualificado` cria lead concatenado (nome+tel+conv) + espelho transacional leads→convers (`trg_sync_conv_stage`, nunca diverge). Testado transacional (ROLLBACK): Qualificado→lead Samir Jorge; espelho Follow Up. Dropdown 12 estágios no header do Atendimento + `ESTAGIOS` em Leads + TS/build OK. |
| **TASK-009** | Ciclo /executar 03/09 (noite) — Tasks 1-4 + commit seguro | **✅ CONCLUÍDO** | T1: broker `isFromMe` zera unread + resolve `pending→active` (rota Não Lidas); T2: 9 usuários agentes `@hut.com` criados (login HTTP 200); T3: fix inversão de balões em grupos (autoria `from_me`+`sender_id`, sem `role!=='client'`); T4: Funil Performance+SLA+Ranking (3 RPCs `get_performance_*` aplicadas+testadas no DEV, hook refeito p/ RPCs, build+deploy dev validado); T4b: badge laranja `pending` no card (sem alterar rota). Commit `70c972a` "commit seguro" pushado (ls-remote confirmado). |
| **TASK-008** | Inclusão do Campo de Contexto de Problema | Adição de um campo global "Contexto do Problema" na estrutura dos tickets. O ticket TCK-2026-086 teve o solicitante alterado para Denisse e seu respectivo contexto do incidente do Wesley documentado no React. | ✅ CONCLUÍDO | Ambiente Local Atualizado |
| **TASK-007** | Modal Expandido para Subtickets & Inteligência Compartilhada | Modificação do React (TicketDetailModal) para renderizar o painel expansível de Subtickets com seus devidos estágios (a executar, validando, executado). Atualização das regras nas skills do ATOM, AVA e ORQUESTRADOR assumindo que cada subticket é um deploy/update de sistema. | ✅ CONCLUÍDO | Código React Refatorado |
| **TASK-006** | Estruturação de Subtickets e Resolução Incidente Wesley | Implementação da estrutura UI de pré-requisitos, atualização das métricas dos 3 agentes (ATOM, AVA, ORQUESTRADOR), e adição do Ticket TCK-2026-086 com 10 subtickets | ✅ CONCLUÍDO | Ambiente Local Atualizado |
| **TASK-005** | Carregamento das Últimas 800 Mensagens nos Grupos | Ajuste da consulta do histórico para `created_at desc limit 800` + reverse (exibição em tempo real de mensagens de grupos densos) | ✅ CONCLUÍDO | Deployado na Hostinger |
| **TASK-004** | Restrição de Acesso à Conexão WhatsApp | Engrenagem e QR Code restritos exclusivamente a Admins (v8 deployado) | ✅ CONCLUÍDO | Hostinger SFTP OK |
| **TASK-003** | Resolução Lead Maria Ferreira & Blindagens | ✅ CONCLUÍDO | Queries PostgREST corrigidas, processo zumbi eliminado |
| **TASK-002** | Criação da Agente AVA (Intake/Triagem) | ✅ CONCLUÍDO | Skill & Estrutura Ativa em `.agents/docs/02_AVA_TRIAGEM_IA` |
| **TASK-001** | Organização do Agente ATOM no App | ✅ CONCLUÍDO | Centralização das pastas em `.agents/docs` |
| **HUB-ATLZ-1** | - [Atom, Ada, Jarvis, Aura] Engenharia Reversa - Página Configurações (Concluído)
- [Aura] Automação de QA Visual com Cypress/Playwright no frontend reverso (Concluído e Validado na Sprint 2) Corretor construído em React + Vite. |
| **HUB-ATLZ-2** | Atualização de Sistema | ✅ CONCLUÍDO | Filtro de pesquisa case-insensitive implementado na tela de leads. |
| **HUB-ATLZ-3** | Atualização de Sistema | ✅ CONCLUÍDO | Sistema de ordenação decrescente por data da última mensagem adicionado na tela [[Dashboard-do-Corretor]]. |
| **HUB-ATLZ-4** | Atualização de Sistema | ✅ CONCLUÍDO | Automação WhatsApp - Servidor `whatsapp-broker` online e funcional. |
| **HUB-ATLZ-5** | Atualização de Sistema | ✅ CONCLUÍDO | Integração Realtime entre o Baileys e o Supabase. |
| **HUB-ATLZ-6** | Atualização de Sistema | ✅ CONCLUÍDO | Correção do Bug "Agência Hut" implementando a verificação `isFromMe` documentada em [[Tratamento-de-Erros-Sessoes]]. |
| **HUB-ATLZ-7** | Atualização de Sistema | ✅ CONCLUÍDO | Lógica de desconexão e nova sessão do QR Code. |
| **HUB-ATLZ-8** | Atualização de Sistema | ✅ CONCLUÍDO | Inteligência e Estruturação - Inicialização do projeto Next. |
| **HUB-ATLZ-9** |
| **TASK-DEM-6** | Erro de envio de mensagem Column Net Does not Exist | ✅ CONCLUÍDO | O sistema gerava erro schema net ao tentar enviar. Resolvido desativando gatilho de webhook. |
| **TASK-DEM-1** | Separar telas de atendimento individuais e de grupos | ✅ CONCLUÍDO | Separar telas de atendimento individuais e de grupos. |
| **TASK-DEM-2** | Realizar teste de validação de recebimento de mensagem via grupo | ✅ CONCLUÍDO | Teste de validação de recebimento de mensagem via grupo com espelhamento. |
| **TASK-DEM-7** | Atualizar VPS 24/7 | ✅ CONCLUÍDO | Fazer rodar sistema de whatsapp em vps. |
| **TASK-DEM-8** | Testar mensagem de grupo | ✅ CONCLUÍDO | Fazer teste enviando mensagem e recebendo mensagem via sistema. | Atualização de Sistema | ✅ CONCLUÍDO | Criação do HUB central documentando todos os nossos [[Relatórios]]. |

---

## 🖼️ Validação Visual do Último Teste Local

O **ATOM** validou o layout e tirou um screenshot automático na porta `5174`:

![Último Teste Local](file:///Users/christianeracanelli/Desktop/Ahut%20Ecosystem/.agents/docs/01_ATOM_DEVELOPER/ULTIMO_TESTE_LOCAL.png)

---

## 📋 Regras de Deploy em Produção
* 🔒 **Deploy na Hostinger (SFTP):** Bloqueado até aprovação manual.
* 🔒 **Deploy na VPS (SSH):** Bloqueado até aprovação manual.
* 🟢 **Ambiente Local de Testes:** Liberado em `http://localhost:5174/tecnologia`.
- [x] Task 5 - Removido o botão de Configurar WhatsApp (QR Code) para o usuário Jota no painel de Atendimento (Atendimento-live-v10.js) em produção.
- [x] TASK INCORPORAR ATUALIZAÇÕES EXECUTADAS: Rastreadas as demandas no DOCUMENTO_UNIFICADO_DEMANDAS.md e inseridas no frontend de Tecnologia.

---

## ✅ 09/09 — INSUMOS PARA O JHON WICK (briefing + verificação compatibilidade broker)
**Entrega:** 2 docs criados e commitados no repo do Jhon Wick (`REPOSITORIOENGENHARIAREVERSACODIGOFONTE`, branch `main`), commit `8112cdd` (push ✅):
- **`00_ANTIGRAVITY_FASE3_CORRECCION/BRIEFING_PARA_JHON_WICK.md`** — atualiza o Jhon Wick sobre: Lei de Atuação EDIÇÃO/REFERÊNCIA, calibração (646a8ad→5756cc8), padronização 11 agentes (91b27c9/c548299), deploy teste-ahut (ab87aed), pendências (SSL prod expirado, 121 vs 210 destinos, ~90% cobertura).
- **`00_ANTIGRAVITY_FASE3_CORRECCION/VERIFICACAO_COMPATIBILIDADE_BROKER.md`** — guia completo p/ ele verificar se as pastas `02_BACKEND_E_SERVICOS_VPS/ahut-whatsapp-broker` + `02.2_BACKEND_BROKER_TESTE` estão alinhadas com o broker **VIVO**; inclui **manifest MD5** do `src/` (session-manager.ts = `9eb2e374`) e **instruções de acesso VPS** (`ssh root@2.24.95.98`, `md5sum`/`pm2`) **e Hostinger** (SFTP `82.25.73.206:65002` / hPanel file manager).
- **Sanitizado:** nenhuma senha real nos docs (só referência de instrução a host/user/IP); verificação pré-commit ✅.
- **⚠️ Achado de segurança:** ~18 scripts de deploy do repo antigo têm o **credencial do Hostinger em texto claro** (ex.: `deploy-true.mjs`, `deploy-hostinger.ps1`). **Pendente sanitização (purge).**

**Comandante:** a decisão sobre **deploy do build novo Teste → PROD** e o **SSL prod expirado** seguem aguardando sua aprovação/ação. O Jhon Wick tem agora os insumos p/ validar o broker vivo antes de qualquer edição.

---

## 🔴 PENDÊNCIA CANCELADA/REVERTIDA — AGENTE RAG SEMÂNTICO (Recusado pelo Comandante)

**Status:** ⏳ AGUARDANDO ALINHAMENTO COM O COMANDANTE (registro 09/09)

**O que é:** o `tutor_rag_ahut.py` é **Camada B** (injeção determinística por tags/module). Falta a **Camada C — RAG semântico de verdade** (embeddings + vector store + retrieval por significado).

**Já temos:**
- Base de conhecimento: **63 docs** em `/opt/data/hut_docs_texts/` (Pops, contratos, estratégia de vendas, diagnósticos, PMBOK, etc.) ≈ 804 KB.
- Tutor determinístico: `/opt/data/scripts/tutor_rag_ahut.py` (filtra por módulo/tags — **não semântico**).
- Schema de vector store documentado na skill `deterministic-knowledge-injection` (pgvector, `rag_documents`/`rag_chunks`/`match_rag`, HNSW).
- Venv local **sem** sentence-transformers/chromadb/pgvector ainda (instalar p/ embedder).

**Próximos passos planejados (quando alinhar):**
1. Ingestão determinística: varre os 63 docs → trata duplicatas (`_02:25`×`_02:29`) → MD5 → chunk (~500 tok, overlap) → embed → upsert idempotente.
2. Embedder: `sentence-transformers` + `all-MiniLM-L6-v2` (384 dims, offline, gratuito) no venv.
3. **Vector store — DECISÃO ABERTA:** (a) Local Chroma, (b) Supabase DEV pgvector (preciso da credencial DEV), (c) Supabase PROD com tabela `rag_*` isolada — **desaconselhado**, (d) só script agora.
4. Retrieval no tutor: embed da task → `match_rag(embedding, module)` → injeta top-N chunks antes do prompt.
5. Validação real: pergunta "fluxo de caixa" deve trazer POP_FIN, não contrato.

**Bloqueador:** decisão do Comandante sobre o store (ver os 3) + credencial DEV se for o caso.

> 📄 **Plano completo de implementação:** `PLANO_AGENTE_RAG_IMPLEMENTACAO.md` (mesma pasta .agents/docs) — localização, onde parou, passos a passo e instrução ao Jhon Wick.

---

## ✅ 09/09 — RETORNO DO JHON WICK: MIGRAÇÃO E CENTRALIZAÇÃO NO remodel-copy

**Relato recebido (via Comandante):** migração centralizada no `remodel-copy` (branch `remodel`) concluída com:
- `antigravity_1_1/` — Motor CLI de Engenharia Reversa AST (cli.mjs, lib/{bundler,rosetta,ast-pipeline,jsx-converter,sanitize}.js)
- `src_recovered_1_1/` — Código reidratado validado (Zero erros TS2307)
- `DOCUMENTACAO_PROJETO_ANTIGRAVITY.md` — manual consolidado
- Relatórios auditoria/paridade em `.agents/docs/paridade/` + `00_ANTIGRAVITY_FASE3_CORRECCION/RELATORIO_COMPATIBILIDADE_BROKER.md` (**100% paridade MD5 do backend broker** ✅)

**Significado:** a verificação de compatibilidade do broker retornou **paridade MD5 100%** entre as pastas do repo (`02_BACKEND...` / `02.2_BACKEND_BROKER_TESTE`) e o broker — ou seja, **as pastas estão alinhadas e seguras para edição**. Demandas broker-ativas reconciliadas. Próximo passo (Comandante decide): retomar deploy do build Teste → PROD.
