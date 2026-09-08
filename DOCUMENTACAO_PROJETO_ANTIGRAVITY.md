# 🛰️ PROJETO ANTIGRAVITY — ENGENHARIA REVERSA & AST RECOVERY PIPELINE

**Repositório Oficial:** `https://github.com/rodrigofsacramento-alt/REPOSITORIOENGENHARIAREVERSACODIGOFONTE.git`  
**Data:** 2026-09-08  
**Autor/Agente:** Jhon Wick (Antigravity Orchestrator)

---

## 📌 SUMÁRIO EXECUTIVO

Este documento contém o plano de implementação, inventário de alvos e documentação da ferramenta CLI de engenharia reversa AST (`antigravity_1_1/`) desenvolvida no âmbito do **Projeto Antigravity**.

### Objetivos Principais
1. **Reconstrução de Código-Fonte:** Reidratar o bundle minificado de produção `1.1_FRONTEND_PROD_TESTE` (Vite/React) para código-fonte limpo (`src_recovered_1_1/`).
2. **Pedra de Roseta:** Utilizar o repositório backend preservado `02.2_BACKEND_BROKER_TESTE` (`.ts`) como referência de contratos de dados, tabelas do Supabase e chamadas de RPCs.
3. **Compliance & Sanitização:** Garantir que nenhum secret/token cruze a fronteira da recuperação, armazenando relatórios sanitizados em `report.json`.

---

## 🔍 ALVOS IDENTIFICADOS & RECONHECIMENTO

### Front-End (`1.1_FRONTEND_PROD_TESTE`)
* **Entry Point (`index.html`):** `/assets/index-C9-68P_N.js`
* **Chunk Principal de Atendimento:** `Atendimento-live-v14.js` (169.508 B, MD5 `9133ffc7` localizado em `dist/assets/`).
* **Estrutura de Chunks:** 74 arquivos JS/CSS em `dist/assets/`.

### Back-End (`02.2_BACKEND_BROKER_TESTE`)
* Preservado em TypeScript puro (`src/index.ts`, `src/supabase.ts`, `src/session-manager.ts`).
* Fornece o schema do Supabase para tabelas: `conversations`, `leads`, `proposals`, `sales_records`, `profiles`.

---

## ⚙️ ARQUITETURA DO CLI (`antigravity_1_1/`)

```
antigravity_1_1/
├── cli.mjs          # Interface CLI (recover, sanitize, help)
└── lib/
    ├── bundler.js   # Detecta Vite/Rollup vs Webpack e mapeia chunks
    ├── rosetta.js   # Aprende assinaturas a partir do backend 02.2
    ├── ast-pipeline.js  # Engine AST (Parse -> Traverse -> Reidratação _jsx -> TSX)
    └── sanitize.js  # Quarentena de secrets e geração de report
```

### Comandos de Uso

```bash
# Ajuda do CLI
node antigravity_1_1/cli.mjs help

# Teste Dry-Run de Recuperação (Reconhecimento sem alteração)
node antigravity_1_1/cli.mjs recover \
  --dist "C:\Users\Rafael_Livre\Downloads\remodel-copy-remodel (1)\remodel-copy-remodel\1.1_FRONTEND_PROD_TESTE\dist\assets" \
  --rosetta "C:\Users\Rafael_Livre\Downloads\remodel-copy-remodel (1)\remodel-copy-remodel\02.2_BACKEND_BROKER_TESTE" \
  --out src_recovered_1_1 \
  --dry-run

# Execução Real da Recuperação
node antigravity_1_1/cli.mjs recover \
  --dist "C:\Users\Rafael_Livre\Downloads\remodel-copy-remodel (1)\remodel-copy-remodel\1.1_FRONTEND_PROD_TESTE\dist\assets" \
  --rosetta "C:\Users\Rafael_Livre\Downloads\remodel-copy-remodel (1)\remodel-copy-remodel\02.2_BACKEND_BROKER_TESTE" \
  --out src_recovered_1_1

# Varredura de Segurança / Sanitização de Secrets
node antigravity_1_1/cli.mjs sanitize --in src_recovered_1_1 --report report.json
```

---

## 📋 CHECKLIST DE AMBIENTE (SEÇÃO 0 DO SOP)

- [x] `.env` com Supabase URL e Anon Keys em `d:\imobili-ria-inteligente-1\.env`.
- [x] `package.json` e `tsconfig.json` validados no repositório.
- [x] Tipagem de banco de dados `src/types/database.ts` (57.3 KB) com contrato de tabelas.
- [x] Assets estáticos (`favicon.png`, `robots.txt`) verificados.
