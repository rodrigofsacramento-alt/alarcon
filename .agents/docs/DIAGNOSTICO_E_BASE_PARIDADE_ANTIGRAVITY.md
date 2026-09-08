# 🔎 ANTIGRAVITY — DIAGNÓSTICO COM EVIDÊNCIA + BASE DE PARIDADE (para o Jhon Wick executar)

**Data:** 2026-09-08 | **Autor auditor:** Jarvis (Master Orchestrator / Lead Architect)
**Repo legado auditado:** `rodrigofsacramento-alt/REPOSITORIOENGENHARIAREVERSACODIGOFONTE` (clone: 1823 arquivos)
**Plano auditado:** `implementation_plan-REVERSEENG` (3.209 B / 61 linhas) + CLI `antigravity_1_1/` (292 linhas)

---

## PARTE A — DIAGNÓSTICO COM EVIDÊNCIA (o que a auditoria provou)

### A1. O repositório legado JÁ TEM o código-fonte completo do CRM

Não são snippets — é o `src/` inteiro:

```
src/
├── pages/                28 páginas (Atendimento, Leads, Financeiro, Propostas, Vendas, super-admin/*…)
├── components/           ~90 componentes (layout, leads, imoveis, dashboard, financeiro, ui/ = shadcn)
├── hooks/                24 hooks (use-leads.ts, use-whatsapp.ts, use-dashboard.ts…)
├── store/                useGroupPanelStore.ts (zustand)
├── contexts/             AuthContext.tsx, SuperAdminContext.tsx
├── lib/                  supabase.ts, utils.ts, error-messages.ts…
├── types/                database.ts (57.3 KB, contrato completo de tabelas)
└── (main.tsx, App.tsx, index.css, vite-env.d.ts)
```

**Consequência:** reconstruir "do zero via AST" é desnecessário para o que já existe como fonte. O caminho certo do Antigravity é **paridade** (`src/` legado ↔ bundle online), descompilando **só o que divergir**.

### A2. Divergência crítica de tema — o legado `Atendimento.tsx` NÃO gerou o bundle claro online

**Medição real (comando executado, não suposição):**

| Sinal | `src/pages/Atendimento.tsx` (legado) | bundle `9133ffc7` (online) | Leitura |
|---|---|---|---|
| Tamanho | 190.373 B / 3.829 linhas | 169.508 B | diferentes |
| `dark:` | **36** | **0** | legado = DARK, online = LIGHT |
| `bg-white` | 3 | 14 | claro mais presente no bundle |
| `Estagio` / `estagio` | **0** | 1 / 2 | funil só existe no bundle |
| `full_name` | 46 | **64** | lógica de nomes expandida no bundle |
| `select` | 198 | 27 | bundle minificado (cru, não comparável) |
| `Agendamento` | 1 | 3 | pluralidade do bundle |

**Veredito técnico:** o `Atendimento.tsx` legado é uma **versão dark, pré-funil**. O bundle claro online (MD5 `9133ffc7`) é **mais novo que ele e de tema oposto**. → O legado **não é a fonte** do bundle nesta página.

### A3. O CLI `antigravity_1_1/` é um STUB — não há motor AST entregável

Auditoria dos módulos (292 linhas totais):

| Módulo | Linhas | Realidade |
|---|---|---|
| `cli.mjs` | 85 | parse de args OK; só conta arquivos (`processed++`) sem transformar |
| `lib/ast-pipeline.js` | 56 | **`transformAST` faz `return code` (no-op)** — não desofusca/reidrata nada |
| `lib/rosetta.js` | 48 | só mapeia 5 tabelas fixas + `.from("…")` — não reconstrói nomes semânticos |
| `lib/bundler.js` | 49 | detecta `_jsx`/`import(` de forma superficial |
| `lib/sanitize.js` | 54 | **único módulo realmente funcional** (RegEx de secrets OK) |

Código real do stub:
```js
// lib/ast-pipeline.js (REAL no repo) — falso motor
export async function runASTPipeline(distPath, outPath, rosettaMap, options = {}) {
  // loop real:
  for (const file of jsFiles) {
    stats.processed++;          // só conta, NÃO transforma
  }
}
export function transformAST(code, rosettaMap) {
  return code;                  // no-op completo
}
```

**E não há dependências AST** no `package.json` — apenas `@vitejs/plugin-react-swc` (que roda no *build*, não expõe `@babel/parser`/`traverse`/`generator`). O plano promete (linha 46) *"Pipeline AST com Babel/Parser, Traverse e Generator"*, mas **o núcleo não está implementado nem as deps instaladas**.

### A4. A premissa de Pedra de Roseta do FRONTEND está errada no plano

O plano usa `02.2_BACKEND_BROKER_TESTE` como dicionário para o frontend. Mas o Rosetta correto do **frontend** é o **`src/` completo deste repositório legado** (que tem páginas, hooks, store, contexto). O `02.2` serve **só** como Rosetta de **contrato de backend** (tabelas `.from()`, `.rpc()`).

---

## PARTE B — BASE DE PARIDADE (roteiro de execução para o Jhon Wick)

### B1. ENTRADAS (caminhos portaáveis — RELATIVOS, nunca `C:\...` nem `d:\...`)

| Papel | Fonte | Caminho canônico |
|---|---|---|
| **P1 — imagem legada** | repo de engenharia reversa | `src/pages/*.tsx`, `src/components/**`, `src/hooks/**`, `src/store/**`, `src/types/database.ts`, `src/lib/supabase.ts` |
| **P2 — bundle de produção (alvo)** | pasta 1.1 | `dist/assets/` (74 arquivos) — entry `index-C9-68P_N.js`, chunk `Atendimento-live-v14.js` (169.508 B, **MD5 `9133ffc7`**) |
| **P3 — runtime online (oráculo)** | link teste | `https://teste-ahut-ecosystem.apexfyhub.com.br/assets/…` |
| **P4 — contrato backend** | pasta 02.2 | `02.2_BACKEND_BROKER_TESTE/src/*.ts` |
| **P5 — config do bundle** | legado | `vite.config.ts` (`base:'/'`, alias `@`→`./src`, `manualChunks` {vendor,ui,supabase,query}) |

**Regra:** usar env vars (`$LEGADO_SRC`, `$DIST_1_1`) e paths relativos. O Jhon Wick roda em Linux (VPS).

### B2. CRITÉRIOS DE PARIDADE (comparar por página/chunk)

1. **Assinatura de runtime:** contagem de `_jsx`/`_jsxs`/`jsxRuntime`/`import(`/`export`.
2. **Manifest de bundle:** o chunk `index-*.js` declara o grafo de imports de cada page (nome-fantasma real de cada página).
3. **Tabelas do banco:** todos `.from("tabela")` e `.rpc("fn")` do legado devem aparecer no bundle (`conversations`, `leads`, `proposals`, `sales_records`, `profiles`…).
4. **Strings de negócio:** `full_name`, `Configurações do Atendimento`, `WhatsApp Business`, mensagens de erro de `use-leads.ts`/`use-client-data.ts`.
5. **Tema (crítico):** `dark:` vs `bg-white` + classes shadcn (`bg-background`, `text-foreground`). Online = **claro**; legado `Atendimento.tsx` = **dark**.
6. **Rotas:** paths do react-router no legado vs strings no bundle (`/atendimento`, `/leads`, …).

### B3. MATRIZ DE SAÍDA (entregável: `paridade_report.md` + `.json`)

| página legada | tamanho (B) | tema | `full_name`× | `Estagio`× | `dark:`× | chunk dist | md5 online | veredito |
|---|---|---|---|---|---|---|---|---|
| `Atendimento.tsx` | 190.373 | DARK | 46 | 0 | 36 | `Atendimento-live-v14.js` | `9133ffc7` | ⚠️ DIVERGENTE |

**Vereditos:** ✅ `IGUAL` (copiar direto) · ⚠️ `DIVERGENTE` (recuperar do bundle) · ❌ `AUSENTE` (órfão).

### B4. REGRAS DURAS

1. **Fase somente-leitura** — não gerar `src_recovered_1_1`, não commit, não instalar deps.
2. **MD5 é truth** — o bundle `9133ffc7` é a referência de tema claro; documentar divergência, nunca "consertar" o legado.
3. **Não tocar `src/` legado nem `dist/assets/`** — são fontes preservadas (Rosetta).
4. **Sanitizar** secrets cruzados no diff → `[REDACTED]` + localização em `paridade_report.json` (nunca o valor).
5. **Caminhos relativos** — sem paths Windows.
6. **Divergência >30% de strings/tema** ⇒ classificar página DIVERGENTE inteira.

### B5. PLANO DE AÇÃO (ordem rígida)

1. Mapear `$LEGADO_SRC` e `$DIST_1_1` via env.
2. Rodar o diff de **todas** as páginas com a matriz B3.
3. Gerar `paridade_report.json` (automatizado) + `paridade_report.md` (legível).
4. Destacar o conjunto DIVERGENTE (provável: só `Atendimento.tsx`) e os ÓRFÃOS.
5. **PARAR e reportar** — não avançar para descompilação sem sinal verde.

---

## ⚖️ VEREDITO DO AUDITOR

**Plano = "scaffolding inicial" incompleto; NÃO liberar codificação com o CLI stub atual.**
Recomendação de 3 fases:
1. **Paridade** (este doc) → fechar diagnóstico.
2. **AST real** (deps Babel/SWC + `transformAST` implementado) → descompilar só divergências → validar `npm run build` + tema claro.
3. **Empacotar** `src_recovered_1_1/` reutilizando hooks/store/types do legado + `report.json` sanitizado.