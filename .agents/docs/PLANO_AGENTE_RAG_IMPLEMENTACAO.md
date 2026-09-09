# 🧠 PLANO DE IMPLEMENTAÇÃO — AGENTE RAG SEMÂNTICO (Camada C)

**Data:** 09/set/2026 · **Autor:** Jarvis (Orquestrador) · **Executor previsto:** Jhon Wick (com supervisão Jarvis/Rodrigo)
**Status:** ⏳ PENDENTE DE ALINHAMENTO — decisão do vector store em aberto (bloqueador)
**Repo:** `remodel-copy` (branch `remodel`)

---

## 1. LOCALIZAÇÃO DO PLANO (onde está este documento)

```
remodel-copy/
└── .agents/docs/                          ← (antiga 00_SQUAD_AGENTES_IA, migrada pelo Jhon Wick)
    ├── PAINEL_DE_CONTROLE.md              ← kanban/histórico (ver seção "PENDÊNCIA ABERTA")
    ├── paridade/                          ← relatórios de auditoria/paridade
    └── PLANO_AGENTE_RAG_IMPLEMENTACAO.md  ← ESTE documento (o plano)
```

> **Para o Jhon Wick:** leia antes o `PAINEL_DE_CONTROLE.md` (regra 0) — a pendência RAG está registrada lá na seção `🔵 PENDÊNCIA ABERTA — AGENTE RAG SEMÂNTICO`. (Nota: esta pasta foi migrada de `04_.../00_SQUAD_AGENTES_IA/` para `.agents/docs/` na centralização — caminho atual é `.agents/docs/`.)

---

## 2. ONDE PAROU O NOSSO PROCESSO (estado atual em 09/set)

### O que JÁ EXISTE e funciona (Camada B — determinístico)
| Item | Localização real | Status |
|---|---|---|
| **Base de conhecimento** | `/opt/data/hut_docs_texts/` — **63 arquivos**, **46 únicos** (17 duplicados por nome truncado vs completo: `*_02:25` × `*_02:29`) ≈ 804 KB | ✅ pronta |
| **Tutor determinístico** | `/opt/data/scripts/tutor_rag_ahut.py` (+ cópia em `skills/software-development/deterministic-knowledge-injection/scripts/`) | ✅ funciona |
| **Skill de arquitetura** | `deterministic-knowledge-injection` (com schema pgvector em `references/vector-store-schema.md`) | ✅ documentado |

### Como o tutor funciona HOJE (Camada B)
- Recebe `--modulo funil|rh|financeiro|atendimento|devops|all`.
- Lê `KNOWLEDGE_BASE_GLOBAL.md` + `PAINEL_DE_CONTROLE.md`.
- Injeta: REGRA 0, dicas do módulo (por TAG/palavra-chave), estado git real (worktrees/branches), "proibido".
- **NÃO é semântico** — só filtra por palavra-chave do módulo, não por significado.

### O que FALTA (Camada C — o salto para RAG de verdade)
| Item | Situação |
|---|---|
| Embeddings | ❌ venv local **sem** `sentence-transformers`/`chromadb`/`pgvector` |
| Vector store | ❌ **não definido** (decisão em aberto) |
| Retrieval semântico (`match_rag`) | ❌ não existe |
| Ingestão determinística (chunk+embed+upsert) | ❌ não existe |

---

## 3. ARQUITETURA ALVO (o "agente RAG")

```
Task do agente ──► TUTOR (Camada B + C)
                       │
        embed da task ─┴─► match_rag(embedding, module)  ──► top-N chunks
                       ▲                                        │
   Cérebro externo (docs .txt) ─INGESTÃO─► vector store       injeta no prompt
        (63 arquivos, 46 únicos)          (pgvector/Chroma)       ▼
                                              └──────────────► ANTES de montar o prompt
```

- **Embedder:** `sentence-transformers` + `all-MiniLM-L6-v2` (384 dims, offline, gratuito) — escolher ANTES do schema (dimensão precisa bater).
- **Ingestão incremental & determinística:** hash do doc (`content_md5`) → só re-chunk/re-embed o que mudou. Idempotente.
- **Retrieval por módulo:** quando a task nomeia um domínio, filtra `filter_module` (atenção dirigida).
- **Operador:** distância cosseno (`<=>`), índice HNSW.

---

## 4. PASSOS A PASSO DE IMPLEMENTAÇÃO

> Ordem sugerida. Cada passo é verificável/committable.

### Passo 1 — Preparar ambiente de embeddings
```bash
# no venv do Hermes
/opt/data/.venv/bin/pip install sentence-transformers
# baixa all-MiniLM-L6-v2 (384 dims) automaticamente no 1º uso
```
- ✅ Verificar: `python -c "from sentence_transformers import SentenceTransformer; m=SentenceTransformer('all-MiniLM-L6-v2'); print(m.get_sentence_embedding_dimension())"` → `384`

### Passo 2 — Script de INGESTÃO determinística
- Criar `/opt/data/scripts/rag_ingest.py`
- Funções:
  - `scan_docs()` — varre `/opt/data/hut_docs_texts/*.txt`
  - **`dedup()`** — trata os 17 duplicados: se 2 arquivos têm mesmo hash, guarda só um (nome mais completo). Usa MD5 → 46 únicos.
  - `chunk_text()` — split em ~500 tokens com overlap (~50)
  - `embed()` — vectores com o modelo
  - `upsert(doc, chunks)` — idempotente: se `content_md5` não mudou, pula
- ✅ Verificar: rodar 2x → 2º run não re-embed nada (idempotência)

### Passo 3 — DECISÃO DO VECTOR STORE (⛔ BLOQUEADOR — precisa do Comandante)
| Opção | Prós | Contras |
|---|---|---|
| **(a) Local Chroma** | offline, grátis, não toca banco prod | separado do Postgres; dados não viajam |
| **(b) Supabase DEV pgvector** (recomendado pela skill) | reusa Postgres, schema pronto (`rag_documents`/`rag_chunks`/`match_rag`), escala | **preciso da credencial DEV** |
| **(c) Supabase PROD isolado** | — | ⚠️ desaconselhado — é banco dos clientes |
| **(d) só script agora** | nada bloqueia | adia o store |

- Schema de referência (se pgvector): `skills/.../references/vector-store-schema.md`

### Passo 4 — Retrieval no tutor (Camada C)
- Atualizar `/opt/data/scripts/tutor_rag_ahut.py`:
  - Ao chegar a task: embed da pergunta → `match_rag(embedding, module)` → injeta top-N chunks ANTES do prompt.
  - Manter a saída determinística atual (REGRA 0, git, proibido) e ADICIONAR os chunks semânticos.
- ✅ Verificar: pergunta "fluxo de caixa" traz chunks do `POP_SEM2_Fluxo_Caixa`, não do contrato.

### Passo 5 — Validação real (teste funcional)
- Query de prova: "Como funciona o fluxo de caixa da HUT?"
- Esperado: top-3 chunks todos do `POP_SEM2_Fluxo_Caixa.txt` / `POP_FIN_001`.
- Contrastar com uma pergunta off-topic p/ garantir que não retorna ruído.

---

## 5. INSTRUÇÕES AO JHON WICK (como executar)

> Você (Jhon Wick) tem acesso aos repos GitHub (`REPOSITORIOENGENHARIAREVERSACODIGOFONTE` e `remodel-copy`). **A base de conhecimento e o script do tutor NÃO estão nos repos — estão na máquina (`/opt/data/`).** Quando receber a ordem do Comandante para implementar, siga o fluxo:

1. **Leia o `PAINEL_DE_CONTROLE.md`** (regra 0) — seção `🔵 PENDÊNCIA ABERTA — AGENTE RAG`.
2. **Confirme a decisão do Comandante** sobre o vector store (Passo 3) — sem isso, NÃO avance no store.
3. **Pípede a credencial DEV** ao Comandante **se** a opção for Supabase DEV (nunca adivinhe senha).
4. Implemente **Passos 1-2** (ambiente + ingestão) — são independentes do store e podem começar já.
5. Implemente **Passos 4-5** (retrieval + validação) **depois** que o store estiver decidido.
6. **Commite** cada passo concluído no `remodel-copy` (branch `remodel`) com mensagem clara; **não inclua senha/credencial jamais**.
7. **Reporte** de volta no canal orquestrador (Jarvis/Rodrigo) o que concluiu + o resultado do Passo 5.

### ⚠️ Regras críticas
- **Nunca** usar o Supabase PROD (`ptochsyoyatsydfysacc`) para armazenar embeddings de RAG interno — é o banco dos clientes. Só DEV (com credencial) ou local.
- **Idempotência:** o ingestão deve ser re-rodável sem duplicar chunks (hash MD5).
- **Dedup:** dos 63 arquivos, 17 são duplicados → processar 46 únicos.
- **Sanitização:** nenhuma credencial/senha real em commits. Se um doc da base contiver segredo, redigir.

---

## 6. COMO SABER QUE ESTÁ PRONTO (critérios de aceite)

- [ ] `sentence-transformers` instalado, dimensão = 384
- [ ] `rag_ingest.py` processa 46 docs únicos; re-run é idempotente
- [ ] Store decidido e populado (Chroma local OU Supabase DEV)
- [ ] `tutor_rag_ahut.py` injeta chunks semânticos (Camada C) além do determinístico
- [ ] Query "fluxo de caixa" retorna POP_SEM2/POP_FIN (não contrato)
- [ ] Nenhuma credencial vazada em commits; PROD não tocado

---

## 7. HISTÓRICO DE DECISÃO / BLOQUEIO
- **09/set:** Pendência aberta no PAINEL. Comandante consultado sobre o store (local/DEV/PROD) — **sem resposta ainda** (timeout 60min). Documento de plano criado para instruir o Jhon Wick. **Bloqueado no Passo 3 até decisão.**