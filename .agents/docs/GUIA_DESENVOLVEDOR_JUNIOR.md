# 🧑‍💻 GUIA DO DESENVOLVIDOR JÚNIOR — AMBIENTE REMODEL-COPY

> **Atualizado 23/09 — fluxo canônico (KB §7). Versão anterior (Jhon Wick) revogada.**
> **Diretório de EDIÇÃO = `src/` do `remodel-copy` (branch `remodel`).**
> **Diretório de REFERÊNCIA = `check/src/` (Pedra de Roseta) — só consulta, nunca editar.**

## ⚠️ REGRA ABSOLUTA: NUNCA MEXA NA PRODUÇÃO SEM O GATE 2

**Você só tem acesso ao ambiente TESTE.** Deploy em PROD exige aprovação expressa do Comandante (Gate 2).
**Qualquer alteração no sistema produtivo do cliente sem essa aprovação resultará em danos reais a leads, conversas e dados de clientes.**

```
🔥 PRODUÇÃO (cliente real) → BLOQUEADO até o Gate 2 (Comandante aprova)
🧪 TESTE (homologação)     → SEU AMBIENTE DE TRABALHO
```

---

## 📦 REPOSITÓRIOS

### ✅ EDIÇÃO (seu ambiente) — `remodel-copy` (repo CENTRAL, ÚNICO)
```
https://github.com/rodrigofsacramento-alt/remodel-copy.git
```
- **Branch:** `remodel` — tudo que você editar no `src/` e commitar é a fonte do build.
- **Local:** `/opt/data/ahut-ecosystem-remodel-copy`
- **NUNCA editar/commitar:** `ahut-ecosystem-active`, Jhon Wick (`/tmp/legacy_re`, só leitura), `rodrigofsacramento-alt/...-ahut-ecosystem-remodel` (descartado) — regra completa = **KB §7**.

### 🔴 PRODUÇÃO (NÃO TOCAR sem Gate 2) — dados reais
```
https://ahut-ecosystem.apexfyhub.com.br/   → produção (cliente real)
https://teste-ahut-ecosystem.apexfyhub.com.br/  → teste/homologação (seu alvo de deploy)
```
- **Supabase PROD:** `ptochsyoyatsydfysacc.supabase.co` — 🔴 NUNCA usar no TESTE/DEV (usa o DEV `xmsulduzvufdzkfktovk`)
- **VPS cliente:** `2.24.95.98` — 🔴 NUNCA acessar sem encuadre
- **Broker:** `/root/crmahut/backend-broker` — 🔴 NUNCA rodar local

---

## 🗺️ MAPA DE PASTAS (a diferença que importa)

| Pasta | Papel | Editar? |
|---|---|---|
| **`src/`** do remodel-copy (`/opt/data/ahut-ecosystem-remodel-copy/src/`) | **EDIÇÃO** — código-fonte real buildable | ✅ **SIM — é aqui** |
| **`check/src/`** (`00_ANTIGRAVITY_FASE3_CORRECCION/check/src/`) | **REFERÊNCIA** — "Pedra de Roseta" (tipos Supabase, nomes reais) | ❌ **NÃO — só consultar** |
| `src_recovered_1_1/` | REFERÊNCIA reidratada | ❌ NÃO editar |
| Jhon Wick (`/tmp/legacy_re`) | Fluxo ANTIGO | 🔴 **[REVOGADO 23/09] — só leitura** |

---

## 🚀 FLUXO DE TRABALHO PASSO A PASSO

### 1. ENTRAR NO REPOSITÓRIO DE EDIÇÃO
```bash
cd /opt/data/ahut-ecosystem-remodel-copy
git branch --show-current   # deve ser `remodel`
```

### 2. LER O CÉREBRO ANTES DE AGIR (REGRA 0)
`AGENTS.md` → `.agents/docs/KNOWLEDGE_BASE_GLOBAL.md` (§8) → `.agents/docs/PAINEL_DE_CONTROLE.md` → skill do domínio (`.agents/skills/<nome>/SKILL.md`).

### 3. VALIDAR O ESTADO REAL
```bash
find src -maxdepth 2
md5sum src/<alvo>.tsx   # produção ≠ git
```

### 4. FAZER ALTERAÇÕES NO CÓDIGO
Edite os arquivos em `src/` (remodel-copy):
- `src/pages/` — Páginas do sistema (Atendimento, Leads, Login, Vendas, etc.)
- `src/components/` — Componentes reutilizáveis (layout, dashboard, corretores, etc.)
- `src/hooks/` — Hooks de dados/estado
- `src/contexts/` — Contextos React (i18n, etc.)
- `src/lib/` — Utilitários e configurações (supabase.ts, utils.ts)
- `src/store/` — Estado global (zustand)
- `src/types/` — Tipagens (incl. Supabase)

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

### 7. DEPLOY NO AMBIENTE TESTE
```bash
# Script canônico: _deploy_teste_remodel.py (via paramiko, /opt/data/ssh-venv/bin/python3)
# Servidor: 82.25.73.206 | Porta: 65002 | Usuário: u817195350 (senha em keys_ahut.py)
# Destino: /home/u817195350/domains/apexfyhub.com.br/public_html/teste/
# Arquivos: dist/index.html + dist/assets/ (todos)
```
**URL após deploy:** `https://teste-ahut-ecosystem.apexfyhub.com.br/`

### 8. PROVA VISUAL + COMMIT
- **Anexe screenshot da tela real em TESTE** — sem prova visual, o Gate 1 RECUSA (sem exceção).
```bash
git status && git diff --stat
git add . && git commit -m "📝 descrição clara do que foi feito"
```

### 9. PROD? SÓ NO GATE 2
PROD (`/ahut/`) só com aprovação expressa do Comandante. Depois: purge LiteSpeed (`purge.php`) + validação HTTP 200.

---

## 🛑 O QUE NUNCA FAZER (LISTA DE PROIBIÇÕES)

### 🔴 PROIBIDO — PRODUÇÃO / FLUXOS MORTOS
| Ação | Consequência |
|---|---|
| Editar em `/tmp/legacy_re` (Jhon Wick) | [REVOGADO 23/09] área volátil, só leitura |
| Editar em `check/src/` ou `src_recovered_1_1/` | É só referência; `tsc` não compila; quebra o build |
| Deploy em `ahut-ecosystem.apexfyhub.com.br` sem Gate 2 | 🔴 QUEBRA produção real |
| Deploy em pasta fantasma `/ahut-ecosystem/` ou `dev/` | Destino morto — nada é servido dali |
| Usar pastas de bundle `1.1_FRONTEND_PROD_TESTE`/`01_FRONTEND_PRODUCAO_HOSTINGER` como destino | [REVOGADO 23/09 — destino morto]; destinos únicos = KB §3 |
| Usar Supabase PROD `ptochsyoyatsydfysacc` no TESTE | 🔴 ALTERA dados reais de clientes |
| Acessar VPS `2.24.95.98` sem encuadre | 🔴 DERRUBA o WhatsApp do cliente |
| Git push em `ahut-ecosystem-active` | [REVOGADO 23/09] legado — commit é no `remodel-copy` |
| Rodar broker localmente | 🔴 PODE enviar mensagens a leads reais |
| Usar caminho Mac `/Users/christianeracanelli/...` | Não existe neste servidor |

### 🟡 CUIDADO
- Versão valida: **teste-ahut** = `teste-ahut-ecosystem.apexfyhub.com.br` (não `dev-`).
- Conteúdo do `check/src/` = mapa, não fonte de edição.
- `tsc` + build passarem NÃO substitui a prova visual.

---

## 🏗️ ESTRUTURA DO PROJETO (src/ — remodel-copy)

```
remodel-copy/
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
# Você está no repo canônico (EDIÇÃO)?
git -C /opt/data/ahut-ecosystem-remodel-copy branch --show-current   # → remodel
git -C /opt/data/ahut-ecosystem-remodel-copy remote -v               # → ...remodel-copy.git

# Você está em src/ do build (não src/src)?
[ -d /opt/data/ahut-ecosystem-remodel-copy/src/pages ] && echo "src real OK"

# Seu deploy apontou pro TESTE?
curl -sk https://teste-ahut-ecosystem.apexfyhub.com.br/ | head -3
```

### ❌ SINAIS DE PERIGO (PARE)
- URL: `ahut-ecosystem.apexfyhub.com.br` (sem `teste-ahut`) → PROD real
- Supabase: `ptochsyoyatsydfysacc.supabase.co` → PROD real
- Servidor: `2.24.95.98` → VPS do cliente
- Pasta: `/tmp/legacy_re` ou `1.1_FRONTEND_PROD_TESTE` → fluxo revogado 23/09
- Caminho: `/Users/christianeracanelli/...` → Mac inexistente

---

## 📞 CONTATOS DE EMERGÊNCIA

| Problema | Quem chamar |
|---|---|
| Dúvida sobre código | Comandante Rodrigo |
| Problema no deploy | JARVIS/AXIOM (agentes IA) |
| Erro no Supabase | JARVIS |
| Qualquer coisa sobre PRODUÇÃO | ⚠️ PARE IMEDIATAMENTE E CHAME O COMANDANTE |

---

**🚨 LEMBRE-SE:** Uma única alteração na produção pode custar dados de clientes reais. Edite apenas no `src/` do remodel-copy (TESTE). Consulte `check/src/` como referência. NUNCA mexa no prod sem o Gate 2. Sem prova visual anexada, o Gate 1 RECUSA.
