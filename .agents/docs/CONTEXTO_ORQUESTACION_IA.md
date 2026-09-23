# 🧭 CONTEXTO DE ORQUESTACIÓN — ECOSISTEMA AHUT / APEXFY (v1, 21/09/2026)

> **Para quién:** Claude Code (executor principal) · Hermes (executor alterno) · Jarvis (orquestador-chef).
> **Qué es:** prompt de contexto compacto que responde ANTES de empezar cualquier tarea: *¿dónde estoy? ¿qué edito? ¿cómo despliego? ¿a quién pertenece cada cosa?* El agente (Claude/Hermes) debe **leer este archivo + `PAINEL_DE_CONTROLE.md` + `KNOWLEDGE_BASE_GLOBAL.md`** al inicio de cada tarea, y validar el estado real con `ls`/`find`/`md5sum` antes de codar (producción ≠ git).
> **Fuente de verdad:** la realidad en disco/Supabase, nunca la memoria. Este archivo es el índice; los detalles viven en los `docs/` enlazados.

---

## 1️⃣ ROL DEL ORQUESTADOR (Jarvis) — REGLA DE ORO
- **Jarvis es el ORQUESTADOR**: planea, divide, entrega al executor el foco con: `caminho_absoluto` + `skill_mínima` + `restricción`. **No** es un codeador libre que improvisa en medio de una tarea sin encuadre.
- **Claude Code es el EXECUTOR principal** (código, tests, deploys). **Hermes** actúa como executor alterno y da **soporte al Claude** (revisa, valida, mantiene docs, orquesta al squad).
- **Flujo del ciclo:** Jarvis estructura la tarea → la entrega al executor (Claude) con contexto mínimo filtrando ruido → valida el resultado real (md5/ls/build log) → registra en `CHANGELOG_APEXFY.md` (WRITE-LAST) → commitea.
- **Pitfall identidad:** el executor NUNCA debe "volverse Jarvis" y empezar a planificar/orquestar por su cuenta dentro de una tarea que se le entregó resuelta en encuadre. Si falta contexto, pregunta; no re-inventa el scope.

---

## 2️⃣ MAPA DE ENTORNOS (edición / teste / producción)

| Env | Repo / Ruta | Motivo | URL | Estado |
|---|---|---|---|---|
| **EDIÇÃO** | `/opt/data/ahut-ecosystem-remodel-copy` (branch `remodel`, repo `remodel-copy`) | ⭐ FUENTE de código ACTIVA (React/TSX, buildable) | — | 🟢 ÚNICO autorizado |
| **REFERÊNCIA (Pedra Roseta)** | `00_ANTIGRAVITY_FASE3_CORRECCION/check/src/` | mapa de tipagem Supabase real / nombres reales | — | 🔒 NO editar |
| **TESTE (homologação)** | build `dist/` → docroot `/public_html/teste/` (KB §3) | validar antes de prod | `teste-ahut-ecosystem.apexfyhub.com.br` | 🟢 |
| **PROD cliente** | build `dist/` → docroot `/public_html/ahut/` (KB §3) | distribuição a cliente | `ahut-ecosystem.apexfyhub.com.br` | 🟢 |
| **PROD Backend/Broker** | `/root/crmahut/backend-broker` (PM2 `whatsapp-broker`) | broker WhatsApp + Supabase PROD | — | 🟢 |
| **SDR worker** | worker SDR (PM2 id14) | agente de disparo de leads | — | 🟢 (0 disparos) |

**⚠️ REGLA CENTRAL:** repo `rodrigofsacramento-alt/...-ahut-ecosystem-remodel` **DESCARTADO para siempre**. **Nunca** editar `/opt/data/ahut-ecosystem` (congelado) ni `/tmp/legacy_re` (solo lectura). Todo en `remodel-copy`.

---

## 3️⃣ CÓMO EDITAR (flujo correcto)
→ **Flujo canónico: KB §7 + AGENTS.md** (fonte única — não duplicar aqui). Resumo: `src/` do remodel-copy → `npm run build` → TESTE → Gate 2 (Comandante) → PROD.

**PITFALL comunes:** PROD = docroot `/teste/`(homologación) y `/ahut/`(producción), nunca pasta fantasma. Bundle DEV (unicio/dark) NUNCA a PROD (code-split/light). `md5sum` del bundle vivo antes de confiar.

---

## 4️⃣ ESTRUCTURA DE DATOS (Supabase PROD)
- **PROD Supabase:** `ptochsyoyatsydfysacc` · tenant auto `fa440b34`.
- **Atendimento** → `conversations.client_id` · **Leads** → `leads.id` + `responsible_id` · **Propostas** → `proposals.lead_id` · **Vendas** → `sales_records` (proposal_id→lead_id+buyer_name).
- **Financiero:** `financial_transactions` (saldo = agregar por `bank_id`) · RLS por tenant (SIN filtro ALL public) · 2 PSP (Asaas+Stripe) separados del ledger.
- **RLS:** 401 anon = RLS correcta · 406 = `.single()` vacío · **400 `valor_total` → usar `price`**.
- **Prefijos reales:** financial_categories (19), financial_banks (8), financial_cards, financial_transfers.
- **Nunca** alterar `financial_transactions` sin OK explícito · nunca tocar clientes reales (`@estateia.com`/`@vildaalarcon.com`, ~6.000).

---

## 5️⃣ USUARIOS / SEGURIDAD
- **Staff login `@hut.com` (16):** chloe, igor, jota (admin) · alba.gabriela, angel, carlos.cano, carlos.daniel, denisse, elias.marcelo, fatima.carmen, fredy.ariel, ivan.ezequiel, joyce, luciana, mauricio.panigua, rosario.guadalupe (agents). **Senha única vigente desde 21/09** (cambio masivo vía GoTrue admin).
- **Regla del grupo de prueba autorizado:** solo escopo del staff; **nunca** clientes reales.
- **Credenciales:** viven **fuera del repo** (`.env`, `keys_ahut.py`, `/opt/data/.deploy_teste_pass`); nunca commitearlas.
- **Seguridad:** el Comandante es autor legítimo (test de seguridad) — sin DoS, sin fuerza bruta agresiva, sin armas destravadas en PROD; carga pesada solo local.

---

## 6️⃣ AGENTES & ORQUESTADOR (squad)
→ **Organograma canónico: KB §7 (14 agentes: JARVIS → AXIOM → executores; ARGUS no processo; ASIMOV cria agentes; FINISH-GATE na UI).** Skills vivas: `.agents/skills/`.
| Agente | Rol |
|---|---|
| **Jarvis Orchestrator** | Chef / revisa o AXIOM nos gates HITL / valida / registra (WRITE-LAST) |
| **AXIOM** | Orquestrador técnico (despacha e revisa os executores — não executa tudo sozinho) |
| **Claude Code** | ⭐ Executor principal (código, tests, deploys) |
| **Hermes** | Executor alterno + soporte al Claude (revisa, documenta, orquesta) |
- **Adopción de agente externo:** reunión del squad — FUNDIR (preferido) vs SUBAGENTE.
- **Orquestación:** ver `.agents/skills/jarvis-orchestrator/SKILL.md` + `.agents/skills/axiom/SKILL.md`.

---

## 7️⃣ HOJA DE RUTA ABREVIADA (para el executor)
1. **WhatsApp estable 24/7:** el broker (/root/crmahut, PM2 id0) en caída constante — prioridad #1 de robustez (watchdog, reconexión, logs).
2. **Agentes IA dentro de WhatsApp:** desplegar el SDR worker como agente de chat conversacional 24/7 en el broker.
3. **Migración a Claude:** Claude como executor principal; Hermes/Jarvis como orquestador + soporte (este documento habilita el encuadre).
4. **Flujo correcto + identidad Jarvis:** reafirmar el rol de orquestador y el flujo teste→prod en cada tarea.

---

## 8️⃣ LECTURA OBLIGATORIA ANTES DE ACCIÓN (índice)
→ **REGRA 0: `AGENTS.md` (REGRA 0) + KB §8** são a única versão deste índice. Ordem: `AGENTS.md` → KB_GLOBAL (§8 checklist) → PAINEL → skill do domínio.

---
*Generado por Jarvis Orchestrator · 21/09/2026 · revisar/ampliar ante cualquier cambio estructural.*