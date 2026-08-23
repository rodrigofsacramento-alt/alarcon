# 📋 RELATÓRIO DE ATUALIZAÇÕES — RH ECOSYSTEM
**Data:** 2026-08-11 | **Responsável:** Antigravity AI

---

## 🔎 Diagnóstico: O Que Foi Desenvolvido no Histórico e Não Está Em Produção

Após análise cruzada de 17 sessões de desenvolvimento registradas no `HISTORICO_CONVERSAS_E_PROMPTS_RH.md` e inspeção direta dos arquivos locais do backend (`api.rh_backend`) e frontend estático (`ahut-rh_frontend/frontend/assets/`), identificamos os gaps críticos abaixo.

---

## 🚨 GAP 1 — Problema Crítico: Duplo Banco de Dados Supabase (Instâncias Divergentes)

| Ponto | Valor |
|---|---|
| **Backend `api.rh_backend` (VPS)** | `ptochsyoyatsydfysacc.supabase.co` |
| **Backend `ahut-rh_frontend/backend` (local)** | `ywxlmxjpearnowdlwtpj.supabase.co` |
| **Frontend React (bundle compilado)** | Desconhecido — depende da build |

**O código da VPS (`api.rh_backend/.env`) aponta para `ptochsyoyatsydfysacc.supabase.co`**, onde confirmamos que as **349 perguntas existem** na tabela `questions`. Porém, o `RHTableWrapper` em `db_service.py` redireciona `questions` → `rh_behavioral_questions` (inexistente), causando timeout e fallback.

---

## 🚨 GAP 2 — RHTableWrapper: Mapeamento Incorreto da Tabela `questions`

**Código atual em `db_service.py`:**
```python
def table(self, table_name: str):
    if table_name == "users" or table_name == "rh_users":
        return self._client.table("rh_users")
    clean_name = table_name.replace("rh_", "")
    return self._client.table(f"rh_behavioral_{clean_name}")  # ← BUG CRÍTICO
```

**Problema:** A tabela de perguntas se chama `questions` (sem prefixo). O wrapper a mapeia para `rh_behavioral_questions` (inexistente), fazendo as perguntas nunca carregarem da VPS.

**Correção necessária:**
```python
def table(self, table_name: str):
    if table_name in ("users", "rh_users"):
        return self._client.table("rh_users")
    if table_name == "questions":          # ← Perguntas ficam em tabela pura
        return self._client.table("questions")
    clean_name = table_name.replace("rh_", "").replace("behavioral_", "")
    return self._client.table(f"rh_behavioral_{clean_name}")
```

---

## 🚨 GAP 3 — `results.py` e `reports.py`: Uso de `.single()` Causando HTTP 406

**Código problemático (em múltiplos arquivos):**
```python
result = supabase.table("results").select("*").eq("assessment_id", id).single().execute()
```

**Problema:** O PostgREST retorna **HTTP 406 (Not Acceptable)** quando `.single()` não encontra exatamente 1 registro. Isso quebra o pipeline quando um candidato recém-avaliado ainda não tem resultado calculado.

**Correção:**
```python
result = supabase.table("results").select("*").eq("assessment_id", id).limit(1).execute()
if result.data:
    data = result.data[0]
```

---

## 🚨 GAP 4 — `assessments.py` e `assessment_service.py`: Tabelas Sem Prefixo Correto

As tabelas de respostas e assessments devem ter o prefixo `rh_behavioral_`:
- `assessments` → `rh_behavioral_assessments`
- `responses` → `rh_behavioral_responses`
- `results` → `rh_behavioral_results`
- `reports` → `rh_behavioral_reports`

O `RHTableWrapper` já faz isso para todas exceto `questions`. Após a correção do GAP 2, isso será resolvido automaticamente.

---

## 🚨 GAP 5 — `assessments.py`: Rota de Questions Sem Normalização de Case

**Código atual:**
```python
result = supabase.table("questions").select("*").eq("tool_name", tool_name).order("question_number").execute()
```

**Problema:** Se o frontend chama `/assessments/questions/disc` (minúsculas), o banco não encontra porque o campo é `DISC`. **Solução já aplicada localmente — precisa ser sincronizada com o servidor.**

---

## 🚨 GAP 6 — Sincronização de Endpoints Backend VPS → Frontend

O proxy Nginx na VPS retira o prefixo `/rh-api/` mas o FastAPI espera `/api/v1/` ou `/`. O mapeamento correto deve ser:

| Chamada do Frontend | Nginx Converte Para | FastAPI Recebe |
|---|---|---|
| `/rh-api/assessments/questions/DISC` | `/assessments/questions/DISC` | ✅ |
| `/rh-api/results/{id}/calculate` | `/results/{id}/calculate` | ✅ |
| `/rh-api/api/v1/assessments/...` | `/api/v1/assessments/...` | ❌ (prefixo extra) |

---

## 🚨 GAP 7 — Frontend Compilado Desatualizado

O bundle React compilado no servidor Hostinger (`ahut-rh_frontend/frontend/assets/index-CK_7qwXM.js`) foi gerado antes das correções das rotas e do schema. Ele precisa ser recompilado após:
- Correção das chamadas de API para usar `tool_name` em maiúsculas
- Adição dos gráficos de todas as 6 ferramentas (DISC, MBTI, Big Five, Âncoras, OPQ, Valores)
- Correção do fallback estático de 1 pergunta para fallback vazio/carregamento

---

## 📌 Funcionalidades Desenvolvidas no Histórico que Precisam Estar em Produção

| # | Funcionalidade | Status Local | Status VPS |
|---|---|---|---|
| 1 | Carga das 349 perguntas via API dinâmica | ✅ Corrigido localmente | ❌ VPS tem código antigo |
| 2 | Cálculo de score para 6 ferramentas | ✅ Existe em `calculation_service.py` | 🔶 Não validado em produção |
| 3 | Geração de relatório em PDF (IA) | ✅ Existe em `ai_report_service.py` | 🔶 Depende da correção do banco |
| 4 | Dashboard de Triagem (`/avaliacoes`) | ✅ Compilado no bundle | ❓ Depende do bundle atualizado |
| 5 | Gráfico MBTI (Cabo de Guerra) | ✅ Desenvolvido no histórico | ❌ Não confirmado no bundle atual |
| 6 | Gráficos OPQ, Âncoras, Valores | ✅ Desenvolvido no histórico | ❌ Não confirmado no bundle atual |
| 7 | Exportação PDF com gráficos | ✅ `chart_service.py` + `report_service.py` | 🔶 Não validado end-to-end |
| 8 | `RHTableWrapper` com prefixo correto | ✅ Existe | ❌ Bug no mapeamento de `questions` |

---

## ✅ Plano de Execução de Correções (Ordem Prioritária)

### Prioridade 1 — Correções Críticas (Hoje)
1. **[CRÍTICO]** Corrigir `db_service.py` — Adicionar exceção para `questions` no `RHTableWrapper`
2. **[CRÍTICO]** Corrigir `assessments.py` — Normalização de `tool_name` para MAIÚSCULAS
3. **[CRÍTICO]** Corrigir `results.py` e `reports.py` — Trocar `.single()` por `.limit(1)` com fallback
4. **[CRÍTICO]** Sincronizar `.env` — Garantir que `api.rh_backend/.env` aponta para o Supabase correto com as 349 perguntas

### Prioridade 2 — Atualização no Servidor VPS
5. Upload dos arquivos corrigidos para a VPS via SSH/SFTP
6. Reiniciar o serviço na VPS: `pm2 restart rh-api`

### Prioridade 3 — Recompilação do Frontend
7. Localizar o código-fonte do frontend React e recompilar com `npm run build`
8. Upload do novo `dist/` para a Hostinger

### Prioridade 4 — Validação e Teste Final
9. Executar o robô Playwright (`python3 simulate_test.py`) contra produção
10. Validar que o contador exibe "DISC - Pergunta 1 de 30" e prossegue até as 349 perguntas
