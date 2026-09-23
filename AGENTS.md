# AGENTS.md — Anti-Amnésia Obrigatória (HuTCode de pasta/repos)

> Carregado automaticamente por Hermes/Codex/Claude **todo ciclo** quando a task roda com workdir neste repo. Não é uma sugestão: é o primeiro "Input de Dados" determinístico, injetado pela infraestrutura antes de qualquer raciocínio.

## ⚠️ REGRA 0 — Sempre abrir o cérebro antes de agir
Em **qualquer tarefa** neste repo, a **PRIMEIRA etapa** é ler:
1. `.agents/docs/KNOWLEDGE_BASE_GLOBAL.md` — mapa de repos/pastas/schema/UI/env + checklist de sessão.
2. `.agents/docs/PAINEL_DE_CONTROLE.md` — kanban/histórico TASK-NNN (o que já foi feito).

Proibido agir "às cegas" por memória. Se a task tem domínio específico, carregar também a skill correspondente (`.agents/skills/<nome>/SKILL.md` — árvore viva; `docs/0X_` = congelado).
Esta REGRA 0 + KB §8 são a ÚNICA versão — nenhum outro doc re-lista o cérebro.

## 📌 LEI DE ATUAÇÃO EDIÇÃO/REFERÊNCIA (canônica — diretriz do Comandante)
- **Diretório de EDIÇÃO** (novas features, correções, deploys): **`remodel-copy`** (repo CENTRAL, ramo `remodel`). Fonte de código ativa = **`src/`** (`src_recovered_1_1/` = referência reidratada, NÃO editar).
- **Destinos/deploy:** **KB §7** (canônico único). TESTE = `public_html/teste/` · PROD = `public_html/ahut/`.
- **REGRA CENTRAL:** o repo `rodrigofsacramento-alt/...-ahut-ecosystem-remodel` está DESCARTADO para sempre. Centralizar TODO no `remodel-copy`. `ahut-ecosystem-active`, Jhon Wick (`/tmp/legacy_re`) = LEGADO — NUNCA editar.
- **Diretório de REFERÊNCIA** ("Pedra de Roseta"): `00_ANTIGRAVITY_FASE3_CORRECCION/check/src/` (~210 arquivos reidratados). Uso **só como mapa**: conferir como roda em produção, tipagem real do Supabase, nomes reais de RPCs/tabelas/pages. **NUNCA editar daqui** (reidratado `e.jsx`, `tsc` não compila).
- **PROIBIDO** voltar ao fluxo antigo (fonte de edição fora do `src/` do remodel-copy; pastas de bundle `1.1_FRONTEND_PROD_TESTE`/`01_FRONTEND_PRODUCAO_HOSTINGER` como destino [REVOGADO 23/09 — destino morto]; deploy `dev/`; caminhos Mac `/Users/christianeracanelli/...`).

## 🧭 REGRA 1 — Roteiro do Foco (Atenção): só o estrito necessário
- JARVIS/AXIOM entregam ao executor **o caminho absoluto** do alvo (ex.: `/opt/data/ahut-ecosystem-remodel-copy/src/pages/Tecnologia.tsx`) + **a skill mínima** + **a restrição**, filtrando ruído.
- O executor NÃO assume que o repo está como a memória lembra.

## 🔍 REGRA 2 — Tutor Programático: validar o estado real
Antes de qualquer edit, executar no alvo:
```bash
git -C /opt/data/ahut-ecosystem-remodel-copy branch --show-current   # deve ser `remodel`
find /opt/data/ahut-ecosystem-remodel-copy/src -maxdepth 2           # existe? é o esperado?
md5sum /opt/data/ahut-ecosystem-remodel-copy/src/<alvo>.tsx          # bate com o vivo? (produção ≠ git)
```
- **PITFALL `src/` vs `src/src/`:** o fonte ativo usa `src/` (não `src/src/`). Editar sempre o `src/` do build.
- **PITFALL docroot:** PROD Hostinger = `/ahut/` (produção) e `/teste/` (homologação), NUNCA pasta fantasma (`/ahut-ecosystem/`, `/dev/`).
- **PROD ≠ DEV:** bundle único (DEV) NUNCA sobe no PROD (code-split). Nunca subir tema dark no PROD.

## 📌 REGRA 3 — Persistência (WRITE-LAST)
Toda decisão nova → registrar em `.agents/docs/KNOWLEDGE_BASE_GLOBAL.md` (seção 7) + PAINEL (kanban). Documentação atual é impossível de digerir, mas é obrigatório manter o **índice** apontando para onde está o detalhe. Toda task concluída DEVE obrigatoriamente registrar a entrada correspondente em `CHANGELOG_APEXFY.md` (data, módulo, arquivos, agente, status) e comitar junto com as alterações no branch `remodel`.
