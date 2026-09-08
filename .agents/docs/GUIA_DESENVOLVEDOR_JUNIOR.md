# 🧑‍💻 GUIA DO DESENVOLVEDOR JÚNIOR — AMBIENTE ANTIGRAVITY / Jhon Wick

> **Atualizado 08/09 — Lei de Atuação EDIÇÃO/REFERÊNCIA canônica.**
> **Diretório de EDIÇÃO = `src/` do repo Jhon Wick (branch main).**
> **Diretório de REFERÊNCIA = `check/src/` (Pedra de Roseta) — só consulta, nunca editar.**

## ⚠️ REGRA ABSOLUTA: NUNCA MEXA NA PRODUÇÃO

**Você só tem acesso ao ambiente DEV (ANTIGRAVITY / teste-ahut).**
**Qualquer alteração no sistema produtivo do cliente resultará em danos reais a leads, conversas e dados de clientes.**

```
🔥 PRODUÇÃO (cliente real) → BLOQUEADO para você
🧪 TESTE / ANTIGRAVITY    → SEU AMBIENTE DE TRABALHO
```

---

## 📦 REPOSITÓRIOS

### ✅ EDIÇÃO (seu ambiente) — `REPOSITORIOENGENHARIAREVERSACODIGOFONTE` (Jhon Wick)
```
https://github.com/rodrigofsacramento-alt/REPOSITORIOENGENHARIAREVERSACODIGOFONTE.git
```
- **Branch:** `main` — tudo que você editar no `src/` e commitar vai para o ambiente de **teste** (homologação).
- **Local em:** `/tmp/legacy_re`
- **Mais conhecido como:** "Jhon Wick" (nome de referência do Comandante).

### 🔴 PRODUÇÃO (NÃO TOCAR) — dados reais
```
https://ahut-ecosystem.apexfyhub.com.br/   → produção (cliente real)
https://teste-ahut-ecosystem.apexfyhub.com.br/  → teste/homologação (seu alvo de deploy)
```
- **Supabase PROD:** `ptochsyoyatsydfysacc.supabase.co` — 🔴 NUNCA usar no DEV
- **VPS cliente:** `2.24.95.98` — 🔴 NUNCA acessar
- **Broker:** `/root/crmahut/backend-broker` — 🔴 NUNCA rodar local

---

## 🗺️ MAPA DE PASTAS (a diferença que importa)

| Pasta | Papel | Editar? |
|---|---|---|
| **`src/`** do Jhon Wick (`/tmp/legacy_re/src/`) | **EDIÇÃO** — código-fonte real buildable | ✅ **SIM — é aqui** |
| **`check/src/`** (`00_ANTIGRAVITY_FASE3_CORRECCION/check/src/`) | **REFERÊNCIA** — "Pedra de Roseta" (tipos Supabase, nomes reais) | ❌ **NÃO — só consultar** |
| `codigo_engenharia_reversa_tsx/` (antiga) | Fluxo ANTIGO — dev/ | 🔴 **ABANDONADO, não usar** |

---

## 🚀 FLUXO DE TRABALHO PASSO A PASSO

### 1. CLONAR O REPOSITÓRIO DE EDIÇÃO (Jhon Wick)
```bash
git clone https://github.com/rodrigofsacramento-alt/REPOSITORIOENGENHARIAREVERSACODIGOFONTE.git
cd REPOSITORIOENGENHARIAREVERSACODIGOFONTE   # local: /tmp/legacy_re
```

### 2. ENTRAR NO CÓDIGO FONTE
```bash
cd src
```

### 3. INSTALAR DEPENDÊNCIAS
```bash
npm install
```

### 4. FAZER ALTERAÇÕES NO CÓDIGO
Edite os arquivos em `src/` (Jhon Wick):
- `src/pages/` — Páginas do sistema (Atendimento, Leads, Login, Vendas, etc.)
- `src/components/` — Componentes reutilizáveis (layout, dashboard, corretores, etc.)
- `src/hooks/` — Hooks de dados/estado
- `src/contexts/` — Contextos React (i18n, etc.)
- `src/lib/` — Utilitários e configurações (supabase.ts, utils.ts)
- `src/store/` — Estado global (zustand)
- `src/types/` — Tipagens (incl. Supabase)
- `index.css` / assets — Estilos e tokens de design

> 💡 **Dúvida sobre como algo roda em produção?** Consulte `check/src/` (referência/Pedra de Roseta) para ver a tipagem real do Supabase e os nomes originais. **Nunca edite lá.**

### 5. TESTAR LOCALMENTE
```bash
npm run dev
# Sobe em http://localhost:5173/
```

### 6. BUILDAR
```bash
npm run build
# Saída em dist/
```

### 7. FAZER DEPLOY NO AMBIENTE TESTE (teste-ahut)
```bash
# Via SFTP (veja o runbook de deploy — não é manual)
# Servidor: 82.25.73.206 | Porta: 65002
# Usuário: u817195350
# Pasta de destino: ~/domains/apexfyhub.com.br/public_html/teste/
#
# Arquivos para enviar:
# - dist/index.html
# - dist/assets/ (todos os arquivos)
```
**URL após deploy:** `https://teste-ahut-ecosystem.apexfyhub.com.br/`

### 8. COMMITAR NO GITHUB (Jhon Wick)
```bash
git add .
git commit -m "📝 descrição clara do que foi feito"
git push origin main
```

---

## 🛑 O QUE NUNCA FAZER (LISTA DE PROIBIÇÕES)

### 🔴 PROIBIDO — PRODUÇÃO / FLUXO ANTIGO
| Ação | Consequência |
|---|---|
| Editar em `codigo_engenharia_reversa_tsx/` (fluxo antigo) | Muda código DESCARTADO, não o app testado |
| Editar em `check/src/` | É só referência; `tsc` não compila; quebra o build |
| Deploy em `ahut-ecosystem.apexfyhub.com.br` (prod) | 🔴 QUEBRA produção real |
| Usar Supabase PROD `ptochsyoyatsydfysacc` | 🔴 ALTERA dados reais de clientes |
| Acessar VPS `2.24.95.98` | 🔴 DERRUBA o WhatsApp do cliente |
| Git push em `ahut-ecosystem-active` | 🔴 ALTERA código de produção |
| Rodar broker localmente | 🔴 PODE enviar mensagens a leads reais |
| Usar caminho Mac `/Users/christianeracanelli/...` | Não existe neste servidor |

### 🟡 CUIDADO
- Versão valida: **teste-ahut** = `teste-ahut-ecosystem.apexfyhub.com.br` (não `dev-`).
- Conteúdo do `check/src/` = mapa, não fonte de edição.

---

## 🏗️ ESTRUTURA DO PROJETO (src/ — repo Jhon Wick)

```
REPOSITORIOENGENHARIAREVERSACODIGOFONTE/
├── src/
│   ├── pages/         # Página completa (cada rota): Atendimento, Leads, Login, Vendas...
│   ├── components/    # Componentes reutilizáveis (layout, dashboard, corretores...)
│   ├── hooks/         # Lógica e dados (useState, useQuery)
│   ├── contexts/      # Contextos globais (i18n)
│   ├── lib/           # Configurações (supabase.ts, utils.ts)
│   ├── store/         # Estado global (zustand)
│   ├── types/         # Tipagens (Supabase)
│   └── (assets, test)
├── index.html
├── package.json
└── vite.config.ts
```

---

## 🎨 DESIGN SYSTEM VIGENTE

> O **teste/prod** valida o tema **CLARO** (Estate.ia / funil claro). O tema **DARK (QUBITS)** é do DEV e **NUNCA** deve subir no teste-ahut/prod.
> Confira o tema antes de editar: `bg-white`/`border-slate-200` = claro ✅; `bg-white/5`/`border-cyan-900` = escuro (não é o que o teste/prod valida).

---

## ✅ VERIFICADOR DE AMBIENTE

```bash
# Você está no repo Jhon Wick (EDIÇÃO)?
git -C /tmp/legacy_re branch --show-current   # → main
git -C /tmp/legacy_re remote -v               # → ...REPOSITORIOENGENHARIAREVERSACODIGOFONTE

# Você está em src/ do build (não src/src)?
[ -d /tmp/legacy_re/src/pages ] && echo "src real OK"

# Seu deploy apontou pro TESTE?
curl -sk https://teste-ahut-ecosystem.apexfyhub.com.br/ | head -3
```

### ❌ SINAIS DE PERIGO (PARE)
- URL: `ahut-ecosystem.apexfyhub.com.br` (sem `teste-ahut`) → PROD real
- Supabase: `ptochsyoyatsydfysacc.supabase.co` → PROD real
- Servidor: `2.24.95.98` → VPS do cliente
- Pasta: `codigo_engenharia_reversa_tsx` → fluxo antigo, abandonado
- Caminho: `/Users/christianeracanelli/...` → Mac inexistente

---

## 📞 CONTATOS DE EMERGÊNCIA

| Problema | Quem chamar |
|---|---|
| Dúvida sobre código | Comandante Rodrigo |
| Problema no deploy | Jarvis (agente IA) |
| Erro no Supabase | Jarvis |
| Qualquer coisa sobre PRODUÇÃO | ⚠️ PARE IMEDIATAMENTE E CHAME O COMANDANTE |

---

**🚨 LEMBRE-SE:** Uma única alteração na produção pode custar dados de clientes reais. Edite apenas no `src/` do Jhon Wick (teste). Consulte `check/src/` como referência. NUNCA mexa no prod.