# AGENTS.md — Anti-Amnésia Obrigatória (HuTCode de pasta/repos)

> Carregado automaticamente por Hermes/Codex/Claude **todo ciclo** quando a task roda com workdir neste repo. Não é uma sugestão: é o primeiro "Input de Dados" determinístico, injetado pela infraestrutura antes de qualquer raciocínio.

## ⚠️ REGRA 0 — Sempre abrir o cérebro antes de agir
Em **qualquer tarefa** neste repo, a **PRIMEIRA etapa** é ler:
1. `.agents/docs/KNOWLEDGE_BASE_GLOBAL.md` — mapa de repos/pastas/schema/UI/env + checklist de sessão.
2. `.agents/docs/PAINEL_DE_CONTROLE.md` — kanban/histórico TASK-NNN (o que já foi feito).

Proibido agir "às cegas" por memória. Se a task tem domínio específico, carregar também a skill correspondente (`ahut-crm-deploy-runbook`, `ahut-crm-data-model`, `ahut-crm-backend-architecture`, `ada-frontend-ui`, etc.).

## 📌 LEI DE ATUAÇÃO EDIÇÃO/REFERÊNCIA (canônica — diretriz do Comandante)
- **Diretório de EDIÇÃO** (novas features, correções, deploys): **`remodel-copy`** (repo CENTRAL, ramo `remodel`). Fonte de código ativa = **`src_recovered_1_1/`** (não a Scala). [⚠️ Há DUPLICATA: `00_ANTIGRAVITY_FASE3_CORRECCION/check/src` difere em 180/210 arquivos — CONS...[truncated]
- **Destino TESTE** (homologação): bundle → `1.1_FRONTEND_PROD_TESTE` → commit git + deploy hosting `teste-ahut-ecosystem.apexfyhub.com.br`.
- **Destino PROD cliente** (só quando validado): `01_FRONTEND_PRODUCAO_HOSTINGER` → commit git + deploy hosting `ahut-ecosystem.apexfyhub.com.br`.
- **REGRA CENTRAL:** o repo `rodrigofsacramento-alt/...-ahut-ecosystem-remodel` está DESCARTADO para sempre. Centralizar TODO no `remodel-copy`.
- **Diretório de REFERÊNCIA** ("Pedra de Roseta"): `00_ANTIGRAVITY_FASE3_CORRECCION/check/src/` (~210 arquivos reidratados). Uso **só como mapa**: conferir como roda em produção, tipagem real do Supabase, nomes reais de RPCs/tabelas/pages. **NUNCA editar daqui** (reidratado `e.jsx`, `tsc` não compila).
- **PROIBIDO** voltar ao fluxo antigo (`codigo_engenharia_reversa_tsx` de ahut-ecosystem como fonte de edição; deploy `dev/`; caminhos Mac `/Users/christianeracanelli/...`).

## 🧭 REGRA 1 — Roteiro do Foco (Atenção): só o estrito necessário
- Jarvis entrega ao executor **o caminho absoluto** do alvo (ex.: `/tmp/legacy_re/src/pages/Tecnologia.tsx` — repo Jhon Wick) + **a skill mínima** + **a restrição**, filtrando ruído.
- O executor NÃO assume que o repo está como a memória lembra.

## 🔍 REGRA 2 — Tutor Programático: validar o estado real
Antes de qualquer edit, executar no alvo:
```bash
git -C /tmp/legacy_re worktree list   # quem são os worktrees/branches HOJE (repo Jhon Wick)
find /tmp/legacy_re/src -maxdepth 2   # existe? é o esperado?
md5sum /tmp/legacy_re/src/<alvo>.tsx  # bate com o vivo? (produção ≠ git)
```
- **PITFALL `src/` vs `src/src/`:** o fonte ativo usa `src/` (não `src/src/`). Editar sempre o `src/` do build.
- **PITFALL docroot:** PROD Hostinger = `/teste/` (homologação) e `/ahut/` (produção), NUNCA pasta fantasma.
- **PROD ≠ DEV:** bundle único (DEV) NUNCA sobe no PROD (code-split). Nunca subir tema dark no PROD.

## 📌 REGRA 3 — Persistência
Toda decisão nova → registrar em `.agents/docs/KNOWLEDGE_BASE_GLOBAL.md` (seção 7) + PAINEL (kanban). Documentação atual é impossível de digerir, mas é obrigatório manter o **índice** apontando para onde está o detalhe.
## ?? REGRA 3 � PROTOCOLO WRITE-LAST (Registro de Mem�ria Obrigat�rio)
Toda task conclu�da DEVEM obrigatoriamente registrar a entrada correspondente em \CHANGELOG_APEXFY.md\ com data, m�dulo, arquivos, agente e status, e comitar junto com as altera��es.
