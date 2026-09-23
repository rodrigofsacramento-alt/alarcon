# 🧠 PROTOCOLO DE REGISTRO DE CONHECIMENTO — SQUAD AHUT (E2-2.5 / D5, 23/09)

> Um único protocolo para TODO o squad. Fim das regras concorrentes (learning.md antigo, "registrar na KB", "registrar no PAINEL"). Aplicado no **P3 do FLUXO 6** (pós-entrega), recolhido pelo **ARGUS**.

## 1. ONDE registrar (destino único por tipo de fato)
| Tipo de fato | Destino |
|---|---|
| Técnica/how-to do domínio do agente | `SKILL.md` do agente (`.agents/skills/<nome>/`) |
| Regra nova de atuação/repos/fluxo | `KNOWLEDGE_BASE_GLOBAL.md` §7 (+ AGENTS.md se for lei de entrada) |
| Evento/estado de tarefa | `PAINEL_DE_CONTROLE.md` (kanban) |
| História cronológica da entrega | `CHANGELOG_APEXFY.md` (WRITE-LAST — obrigatório) |

## 2. FORMATO do registro (bloco padrão)
```
[APRENDIZADO] <data> · <agente> · <problema> · <causa-raiz> · <regra derivada> · <arquivo-alvo>
```

## 3. INDEXAÇÃO
- Cada aprendizado aponta o **arquivo canônico** onde o detalhe vive (a KB é índice, não fonte).
- **ARGUS** valida os registros de todos os agentes no P3 e indexa no README de `.agents/skills/` e na KB §7.

## 4. QUEM registra
- Cada agente registra o SEU aprendizado (técnica → sua skill).
- ARGUS recolhe de TODO o squad no [P3] do Fluxo 6 e consolida.
