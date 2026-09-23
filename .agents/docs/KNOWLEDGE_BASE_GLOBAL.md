# 🧠 KNOWLEDGE_BASE_GLOBAL — Cérebro Externo do Squad Tech Ahut (v1, 05/09/2026)

> **Finalidade:** arquivo canônico persistente contra a amnésia de contexto. Responde a: **"onde está cada coisa?"** (pastas, repos, schema, regras de negócio, UI, env, decisões aprovadas). Substitui prompts gigantes por **leitura direta de arquivo**.
> **Como usar:** SEMPRE que o Jarvis acionar um agente ou retomar trabalho, a **primeira etapa** é ler este arquivo + `PAINEL_DE_CONTROLE.md` e validar o estado real com `find`/`ls`/`md5sum` antes de codar. Nunca agir só por memória.
> **Versão registrada:** criada 05/09/2026 a partir de verificação REAL do ambiente. Manter atualizado a cada mudança estrutural/decisão.

---

## 📌 0. OS 3 PILARES (mecânica anti-amnésia)
1. **Memória (RAG + canônicos):** `KNOWLEDGE_BASE_GLOBAL.md` (este) + `PAINEL_DE_CONTROLE.md` + skills (sinón) + `memory` do Hermes. Buscar por keyword via `search_files` **antes** de agir.
2. **Atenção (foco por agente):** Jarvis injeta ao agente APENAS o caminho absoluto + skill mínima + restrição, filtrando ruído. Nada de despejar histórico.
3. **Validação (tutor):** antes de codar, o agente executa `find <destino>` + `md5sum` nos arquivos-alvo e **confirma o estado real** (ignorar `tree` — não instalado, usar `find`).

**Regra de ouro:** produção (disco/VPS) ≠ git. Sempre `md5sum`/`cmp` contra o vivo antes de confiar em qualquer arquivo local ou commit.

---

## 🗂️ 1. MAPA REAL DE REPOS & WORKTREES (verificado 05/09/2026)

### Git remoto único
| Repo | URL | Uso |
|---|---|---|
| `ahut-ecosystem` (remodel) | github.com/rodrigofsacramento-alt/...-remodel.git | **Fonte TSX + skills + docs** |

> ⚠️ NÃO existe repo `ahut-ecosystem-active` no Git remoto atual (só a pasta local no disco). O `active` do manual é **pasta local** `/opt/data/.../ahut-ecosystem-active`, não um remote.

### Worktrees em `/opt/data/ahut-ecosystem` (estado real)
| Worktree | Branch | Utilidade |
|---|---|---|
| `/opt/data/ahut-ecosystem` | `remodel` | repo principal (documento de trabalho) |
| `/opt/data/backup-broker-vivo` | `backup-broker-ar-0409` | backup broker vivo (audio-recovery.ts) |
| `/opt/data/ahut-ecosystem-remodel-copy` | `remodel` | ⭐ **REPO CENTRAL & ÚNICO BUILDABLE (desde 11/09/2026)** — `src/` (171 arq) + `package.json` + `vite.config`; `npm run build` gera o app independente. TODA edição nova é feita AQUI. Commit/push p/ `rodrigofsacramento-alt/remodel-copy.git`. |
| `/tmp/legacy_re` | `main` (Jhon Wick `REPOSITORIOENGENHARIAREVERSACODIGOFONTE`) | 🔒 **SOMENTE LEITURA/REFERÊNCIA desde 11/09** — serviu de origem p/ consolidar o build no remodel-copy. NÃO editar aqui (área /tmp volátil). |

### Branches (remotes/origin: main, remodel) + locais: `backup-estado-ar-0409`, `backup-broker-ar-0409`, `prod-light-funil`, `main`, `remodel`

---

## 📁 2. ÁRVORE DE PASTAS-CHAVE (o mapa que importa)

Root: `/opt/data/ahut-ecosystem`
- `01_FRONTEND_PRODUCAO_HOSTINGER/` — bundles compilados de produção (legado/backup)
- `02_BACKEND_E_SERVICOS_VPS/` — broker WhatsApp + serviços VPS (fonte + dist)
  - **Broker WhatsApp PROD = `/root/crmahut/backend-broker`** (PM2 `whatsapp-broker`, Supabase PROD). DEV = `/root/crmahut/backend-broker-dev`. ⚠️ `wpp-drgustavorocha/` é broker de OUTRO projeto (Gustavo) — NÃO é o do produto.
- `04_CODIGOS_FONTE_LOCAIS_E_DESENVOLVIMENTO/`
  - `.agents/docs/` — ⭐ **cérebro do squad** (docs, kanban, prompts)
    - `PAINEL_DE_CONTROLE.md` (kanban/histórico), `KNOWLEDGE_BASE.md` (aprendizados), `MANUAL_MASTER_RUNBOOK.md` (arquitetura/backend), `PROMPT_ENGENHARIA_REVERSA_CONTINUA.md`, `ORGANOGRAMA_SQUAD_QUBITS.md`, perfil de cada agente (`01_ATOM_DEVELOPER/`, `02_AVA_TRIAGEM_IA/`, `04_ARIA_MONITOR_LEADS/`, `05_ATLAS_DEVOPS_IA/`)
  - `ahut-ecosystem-active/` — fonte TSX antiga [HISTÓRICO 08/09 — REVOGADO 23/09; EDIÇÃO hoje = `src/` do **remodel-copy**, §7]
    - **[HISTÓRICO — NÃO usar como instrução]:** EDIÇÃO da época = `src/` do repo **Jhon Wick** (`REPOSITORIOENGENHARIAREVERSACODIGOFONTE`, clone `/tmp/legacy_re`, ~170 arq, Vite buildable). Hoje: `/tmp/legacy_re` = SOMENTE LEITURA (§1/§7).
    - **REFERÊNCIA (Pedra de Roseta):** `00_ANTIGRAVITY_FASE3_CORRECCION/check/src/` — tipagem Supabase real, nomes RPC/tabelas/pages. Consultar, NÃO editar.
    - `ahut-whatsapp-broker/`, `prod_snapshot_2408/`, `crm-dr-gustavo-original/`, `wpp-drgustavorocha-original/`
  - `crm-dr-gustavo/` — frontend-clone do módulo (Tecnologia.tsx e outras conforme o caso)
  - `copia-do004_...` / `v8Nova-Indavent-Local-Backup/` — back-ups legados
- `05_DOCUMENTACAO_E_PROMPTS_IA/` — docs e mega-prompts
- `RH Ecosystem/` — ⭐ **sistema RH** (em desenvolvimento — TCK-2026-098)
- `ahut-hermes-os/`, `ahut-telegram-orchestrator/` — componentes de orquestração/telegram
- `scratch/`, `test-results/` — rascunhos/resultados de teste

**PITFALL estrutural (amnésia recorrente):** alguns clones têm `src/` duplicado como `src/src/` (árvore fantasma). O build Vite usa **`src/`** (não `src/src/`). Editar SEMPRE o `src/` de topo usado pelo build (hoje: remodel-copy; menção histórica ao Jhon Wick = [REVOGADA 23/09]).

---

## 🔐 3. AMBIENTES & ACESSOS (destinos oficiais)

### 🟢 PRODUÇÃO (destinos oficiais — DOCROOT `/ahut/`) — ⭐ TABELA ÚNICA DE DESTINOS (23/09)
| # | Destino | Host:Porta | Usuário | Caminho |
|---|---|---|---|---|
| 1 | **Hostinger PROD (`ahut-ecosystem.apexfyhub.com.br` → `/ahut/`)** | 82.25.73.206:65002 | u817195350 | `/home/u817195350/domains/apexfyhub.com.br/public_html/ahut/` |
| 2 | VPS nginx | 2.24.95.98 (root) | root | `/var/www/html/` |
| 3 | VPS crm | 2.24.95.98 (root) | root | `/var/www/crm-imobiliaria/` |

> ⚠️ **PITFALL 03/09:** subdomínio `ahut-ecosystem.apexfyhub.com.br` aponta para a pasta **`/ahut/`** do domínio principal (NÃO pasta de mesmo nome).
> 🚫 **DESTINOS MORTOS [REVOGADO 23/09 — NUNCA deploy/commit]:** pasta fantasma `/ahut-ecosystem/` (`public_html/ahut-ecosystem/`), pasta `dev/` (`public_html/dev/`), subdomínio `dev-ahut-ecosystem...`, pastas de bundle `1.1_FRONTEND_PROD_TESTE` e `01_FRONTEND_PRODUCAO_HOSTINGER` como destino de deploy, repo `ahut-ecosystem-active` como destino de commit. Os ÚNICOS destinos de deploy frontend são `/ahut/` (PROD) e `/teste/` (TESTE), nesta tabela.

### 🟢 TESTE/HOMOLOGAÇÃO (1 destino — substitui o antigo DEV `public_html/dev/` [REVOGADO 23/09 — destino morto])
| Destino | Host:Porta | Caminho |
|---|---|---|
| `teste-ahut-ecosystem.apexfyhub.com.br` | 82.25.73.206:65002 | `/home/u817195350/domains/apexfyhub.com.br/public_html/teste/` |

> Assets na **raiz** (`/assets/...`), não `/teste/assets/`. Cache bypass com nomes únicos `app-{uuid}.js`.

### 🟢 Supabase
| Ambiente | Project Ref | URL |
|---|---|---|
| **PROD** (dados reais) | `ptochsyoyatsydfysacc` | `https://ptochsyoyatsydfysacc.supabase.co` |
| **DEV** (isolado) | `xmsulduzvufdzkfktovk` | `https://xmsulduzvufdzkfktovk.supabase.co` |

**Credenciais DB DEV:** [REDACTED] — arquivo restrito `keys_ahut.py` (chmod 600). **Credenciais do frontend** (anon/service_role) consultar somente em arquivo restrito; nunca colar em docs/chat.

### 🧭 MAPA COMPLETO DE DESTINOS POR COMPONENTE (PROD × DEV)

| Componente | Ambiente | Destino/Pasta | Banco Supabase | Commit Git |
|---|---|---|---|---|
| **Broker WhatsApp** (roda o WhatsApp) | **PROD** | VPS `/root/crmahut/backend-broker` (PM2 `whatsapp-broker`, script `dist/index.js`) | **PROD** `ptochsyoyatsydfysacc` | branch PROD do repo broker |
| **Broker WhatsApp** | **DEV** | `/root/crmahut/backend-broker-dev` (PM2 `rodrigo.whatsapp-broker-dev`) | **DEV** `xmsulduzvufdzkfktovk` | branch DEV |
| **Frontend** | **PROD** | Hostinger `/home/u817195350/domains/apexfyhub.com.br/public_html/ahut/` (+ VPS `/var/www/html/`, `/var/www/crm-imobiliaria/`) | — | build vindo do **`src/` do remodel-copy** (após aprovação humana — Gate 2) |
| **Frontend** | **TESTE** | Hostinger `/home/u817195350/domains/apexfyhub.com.br/public_html/teste/` | — | **`src/` do remodel-copy** (script `_deploy_teste_remodel.py`) |
| **Backend** (API/analise) | **PROD** | VPS `/var/www/api.rh` (`analise-backend`) | PROD | — |
| **Banco** | PROD/DEV | Supabase (ver tabela acima) | `ptochsyoyatsydfysacc` / `xmsulduzvufdzkfktovk` | via migrations/sql |

> ✅ **CONFIRMADO 05/09/2026 (diagnóstico real na VPS): broker do WhatsApp em PRODUÇÃO = `/root/crmahut/backend-broker`** (PM2 `whatsapp-broker`, Supabase PROD). DEV = `/root/crmahut/backend-broker-dev` (Supabase DEV). O áudio do corretor Angel a um lead em 04/09 saiu do **broker PROD**. **⚠️ NÃO confundir com broker Gustavo** (outro projeto).

---

## 🗄️ 4. ESQUEMA DE BANCO & REGRAS DE NEGÓCIO (onde encontrar + resumo)

**Fonte primária:** `MANUAL_MASTER_RUNBOOK.md` (seção 3 Modelo de Dados + Regras) e `PROMPT_ENGENHARIA_REVERSA_CONTINUA.md`. Resumo das relações críticas:

### Funil Comercial (QUBITS — 12 estágios)
- **Fonte única:** `conversations.stage` (= `leads.stage`, nunca diverge). Estágio é dado único.
- Regras: `leads_stage_check` (check), `conversations.stage` (default Contato Cadastrado), `conversations.lead_id` (FK), `leads.conversation_id` (FK), `leads.id+responsible_id`.
- Gatilhos: `trg_lead_qualificado` (lead nasce em `leads` só no estágio **Qualificado** — nome+telefone+conversation_id); `trg_sync_conv_stage` (espelho transacional leads↔convers).
- **Detalhe completo:** skill `ahut-crm-data-model` (references/stage-funil-migration.md) + `check/src/` (REFERÊNCIA, Jhon Wick).
- **Saneamento JÁ APLICADO no PROD** (9.313 leads → `A Selecionar`; backup `_backup_leads_stage_2026`) — **NÃO repetir**.

### Atendimento / Chat / WhatsApp
- `conversations.client_id` (ref contato) · `remote_jid` = LID · `remote_jid_alt` = real (nunca inverter)
- Broker: `useWhatsapp.ts` hooks espelham RPCs de produção (`accept_conversation`, `transfer_conversation`, `mark_conversation_read`, `ignore_conversation`, `update_client_contact`, `create_client_profile`).
- Áudio: broker → FFmpeg webm→ogg; módulo `audio-recovery.ts` (contingência, roda vivo, backupado).
- LID filter: `LENGTH(phone) > 13` (nunca >14).

### Leads / Propostas / Vendas
- Leads: `leads.id` + `responsible_id`. Propostas: `proposals.lead_id`. Vendas: `sales_records` (sem FK direta; `proposal_id → lead_id` + `buyer_name`).

### Módulo Financeiro (PROD claro = Estate.ia/Asaas/SuperAdmin; DEV claro = QUBITS)
- Ver skill `ahut-crm-modulo-financeiro` (references: dev-prod-financeiro-schema-mismatch.md, dev-schema-provisioning.md).

### Chamados/Tecnologia
- Tabela **`technology_tickets`** (Supabase): `code` (TCK-2026-NNN), `title`, `description`, `module`, `requester_name/role/department`, `priority` (**apenas `alta/media/baixa`** — NÃO tem `critica`), `main_status` (a_analisar/a_executar/executando/executado/atualizado_producao), `subcategory` (nao_especificado/em_planejamento/em_aplicacao/em_validacao/atualizado/backup_realizado), `delivery_forecast` (**date, sem hora**), `assigned_to`, `impact_level`, `is_ai_triaged`, `business_impact`, `acceptance_criteria` (jsonb), `created_at`/`updated_at`. RLS habilitada com policy `public` p/ ALL+SELECT; grants p/ anon/authenticated/service_role. Cartões criados em 05/09: TCK-2026-094..098.

### RLS tenancy
- RLS filtra por tenant; **NULL = invisível Atendimento**. Tenant Ahut = `fa440b34-...-4d229e427`.

---

## 🎨 5. PADRÃO DE UI / DESIGN (decisões aprovadas — NÃO reexplicar)

- **QUBITS** é o nome do sistema (não "ApeXfy"/"estate.ai"). Fundo `#030303`, neon `#00FFCC`, **glassmorphism global** (`bg-white/50` proibido), logo = símbolo `Q` + texto QUBITS.
- **PROD é CLARO** (Estate.ia): NUNCA subir dark. DEV pode ser claro QUBITS. Distinguir skin por ambiente.
- Animações: framer-motion (page transitions, scroll reveal, card hover y:-4, tap scale .97, stagger .05). Acessibilidade WCAG 4.5:1, focus ring, 4 estados.
- Tipografia: Inter (UI) + Playfair Display (display). Grid 8pt (4/8/16/24/32/48/64), breakpoints base/md/lg/xl/2xl.
- Leis: Hick/Fitts/Miller/Von Restorff, 60-30-10. Referência: skill `ada-frontend-ui` + `DESIGN_SKILLS_UNIFIED.md`.
- i18n PT/ES: bandeiras toggle no header, todas as páginas (LanguagePrompt/LanguageToggle).

---

## 🛠️ 6. VARIÁVEIS DE AMBIENTE (.env)

**Fonte primária:** `MANUAL_MASTER_RUNBOOK.md` (seção 9). Resumo:
- Broker VPS `/root/crmahut/backend-broker/.env`: credenciais WhatsApp (Baileys), Supabase PROD, FFmpeg paths.
- Frontend `src/lib/supabase.ts`: aponta **DEV** `xmsulduzvufdzkfktovk` (anon key) — editar sempre o `src/` do build.
- **NUNCA commitar secrets** no remodel. Preferir variáveis de ambiente/skills de credenciais.

---

## 🤝 7. DECISÕES & PROTOCOLOS APROVADOS (squad)
- **LEI DE ATUAÇÃO EDIÇÃO/REFERÊNCIA — ÚNICA VIGENTE (CANÔNICO 11/09, confirmado 23/09):**
  - **Diretório de EDIÇÃO** (novas features + deploys): **`src/` do `remodel-copy`** (`/opt/data/ahut-ecosystem-remodel-copy`, repo único buildable, remote `rodrigofsacramento-alt/remodel-copy.git`, branch `remodel`). É aqui que se fazem as edições reais, gera-se o re-build e sobe-se para TESTE.
  - **Diretório de REFERÊNCIA** ("Pedra de Roseta"): `00_ANTIGRAVITY_FASE3_CORRECCION/check/src/` + `src_recovered_1_1/` (reidratados). Usar **apenas como mapa** — consultar como as coisas rodam em produção, tipagem real do Supabase, nomes originais. **NÃO editar/compilar daqui; tsc não compila** (reidratado `e.jsx`).
  - **Fluxo:** editar `src/` (remodel-copy) → `npm run build` → deploy TESTE (`public_html/teste/`, `_deploy_teste_remodel.py`) → validar → **Gate 2 (aprovação do Comandante)** → PROD (`/ahut/`). URGENTE = direto PROD→valida→commit→eng. reversa no `src/`.
  - **REVOGADA 23/09 [histórico — NÃO usar]:** a lei anterior de 08/09 (EDIÇÃO = `src/` do Jhon Wick `/tmp/legacy_re`, repo `REPOSITORIOENGENHARIAREVERSACODIGOFONTE`). `/tmp/legacy_re` = SOMENTE LEITURA (área /tmp volátil). Repos NUNCA editar: `ahut-ecosystem-active`, `/tmp/legacy_re` (Jhon Wick), `rodrigofsacramento-alt/...-ahut-ecosystem-remodel` (descartado). Pastas de bundle `1.1_FRONTEND_PROD_TESTE`/`01_FRONTEND_PRODUCAO_HOSTINGER` = [REVOGADO 23/09 — destino morto]; destinos únicos = **tabela §3**.
- **ORGANOGRAMA (estrutura oficial — 14 agentes, declaração do Comandante 23/09):** Hierarquia:

  ```
  🧠 JARVIS — Orquestrador Chefe & CEO (revisa o AXIOM nos Gates HITL 1/2/3;
  │           interface com o Comandante)
  ├── ⚡ AXIOM — Orquestrador Técnico de Engenharia (pipeline; despacha e
  │     │       revisa os executores — não executa tudo sozinho)
  │     └── 🛠️ ATOM — Engenheiro Sênior Full-Stack (Tech Lead)
  │           ├── 🎨 ADA — Front-End / UI-UX (com subagente FINISH-GATE)
  │           ├── 🚀 ATLAS — DevOps & Infraestrutura
  │           ├── 🔍 AURA — QA & Testes
  │           ├── 🛡️ AEGIS — Security Ops
  │           └── 📱 AJAX — WhatsApp Business Specialist
  ├── 👁️ ARGUS — Scrum Master & Processo
  │     ├── 🎙️ AVA — Triagem & Especificação
  │     ├── 📊 APOLLO — Data & BI
  │     └── 📈 ARIA — Monitor de Leads
  └── 🤖 ASIMOV — Criador de Agentes (sob o JARVIS)
  ```

  - **JARVIS** = único com acesso ao Comandante (Rodrigo); revisa o trabalho do AXIOM nos gates, aprova/recusa. **ANTES de 16/05 não existia AXIOM** — hoje AXIOM é o orquestrador de engenharia na prática, sob o JARVIS.
  - **AXIOM** orquestra o pipeline; **ATOM** (técnico) e **ARGUS** (processo) conduzem os especialistas → reportam ao AXIOM.
  - **AJAX** é perpendicular (especialista WhatsApp/broker/mídia), reporta ao ATOM.
  - Habilidades-chave: JARVIS=orquestração,deploy,git,telegram,supabase,diagnóstico | AXIOM=topologias multi-agente,plano,loop dev↔QA,gates | ATOM=TS,Node,Supabase,FFmpeg,Baileys,PM2 | ADA=React18,TS,Tailwind,Recharts,MediaRecorder | ATLAS=Linux,LiteSpeed,nginx,PM2,pg_dump,SFTP,Docker | AURA=tsc,build,prova visual,cross-browser,critérios aceite | AEGIS=RLS,JWT,OWASP,SSH hardening,secrets | ARGUS=git log,kanban,Scrum | AVA=spec,payload JSON,VGV,prioridade | APOLLO=SQL analítico,BI,dashboards | ARIA=lead scoring,Realtime,conversão | AJAX=Baileys7,FFmpeg,OGG Opus,pipeline mídia,sessões | ASIMOV=criação de agentes | FINISH-GATE=revisão visual pré-ship.
  - Skills versionadas em **`.agents/skills/`** (árvore viva, 25 skills + 14 agentes; `docs/0X_` = congelado) — **obrigatórias via AGENTS.md + tutor RAG antes de agir**.
- **SINCRONIA Hermes ↔ Antigravity:** `CANAL_LIVE.md` + `PROTOCOLO_SINCRONIA_AGENTES.md` (aguardando confirmação de instruções A-E).
- **Lixeira:** `move_profile_to_trash()`; restarts do broker deletam `creds.json`.
- **Saneamento leads já executado** (não repetir). **Módulo financeiro** skin clara PROD vs DEV QUBITS.
- **CI/anti-cache:** `build_anticache.mjs`, nomes únicos `app-{uuid}`, purge `curl .../purge.php`.

---

## ✅ 8. CHECKLIST DE INÍCIO DE SESSÃO (anti-amnésia — obrigatório)
1. `git -C /opt/data/ahut-ecosystem worktree list` + `git branch -a` → confirmar worktrees/branches atuais.
2. Ler este `KNOWLEDGE_BASE_GLOBAL.md` + `PAINEL_DE_CONTROLE.md` (kanban/histórico TASK-NNN).
3. Para o alvo da task: `find <destino> -maxdepth 2` + `md5sum <arquivos>` → **validar estado real** antes de editar.
4. Carregar a skill(s) do domínio via `skill_view` (runbook, backend, data-model, financeiro, ada-ui, etc.).
5. **Registrar toda decisão nova aqui** (seção 7 / seções pertinentes) + kanban.

---

*Fonte de verdade congelada (somente leitura): estado vivo em PROD/VPS. Este arquivo é o **índice**, nunca a fonte única — para detalhes, seguir os caminhos indicados em cada seção.*