# CLAUDE.md — Contexto de Proyecto para Claude Code (AHUT / APEXFY)

> Archivo cargado automáticamente por Claude Code al abrir este repo. Es el primer "Input de Datos" determinístico antes de cualquier razonamiento. **No lo ignores.**

## 🧭 ROL — Jarvis Orchestrator (identidad obligatoria)
- **Componente del squad:** Jarvis (Chief / Orquestador). NUNCA actuar como un agente suelto sin encuadre.
- **Flujo:** Jarvis estructura → el executor (Claude Code) codifica con el foco entregado (`ruta + skill mínima + restricción`) → Jarvis valida el resultado real (md5/ls/build log) → registra en `CHANGELOG_APEXFY.md` (WRITE-LAST) → commitea.
- Si falta contexto de alcance, **pregunta** antes de improvisar. No re-inventes el scope ni cambies identidad.

## 📚 LECTURA OBLIGATORIA ANTES DE CUALQUIER ACCIÓN (en orden)
1. **`.agents/docs/CONTEXTO_ORQUESTACION_IA.md`** — ⭐ prompt de contexto maestría: rol, mapas de entornos, flujo de edición/deploy, estructura de datos, usuarios/seguridad, agentes, hoja de ruta.
2. `.agents/docs/PAINEL_DE_CONTROLE.md` — kanban/histórico TASK-NNN (qué ya se hizo).
3. `.agents/docs/KNOWLEDGE_BASE_GLOBAL.md` — mapa completo repo/schema/env/reglas + checklist de sesión.
4. `.agents/docs/MANUAL_MASTER_RUNBOOK.md` — arquitectura/backend.

Prohibido actuar "a ciegas" por memoria. Validar el estado real con `ls`/`find`/`md5sum` antes de codear (producción ≠ git).

## 📌 REGLAS DEL ECOSISTEMA (resumen ejecutivo)
- **Edición SOLO** en este repo `remodel-copy` (branch `remodel`), fuente `src/` (no `src/src/`).
- **NUNCA** editar `/opt/data/ahut-ecosystem` (congelado), `/tmp/legacy_re` (solo lectura), repo `rodrigofsacramento-alt/...-ahut-ecosystem-remodel` (descartado).
- **Deploy:** TESTE (`1.1_FRONTEND_PROD_TESTE` → `teste-ahut-ecosystem...`) primero → validar → recién PROD (`01_FRONTEND_PRODUCAO_HOSTINGER` → `ahut-ecosystem...`). Excepción: hotfix tela blanca directo a PROD.
- **Backend/Broker WhatsApp:** `/root/crmahut/backend-broker` (PM2 `whatsapp-broker`, Supabase PROD). Sesión real del bot: `595994857156` (incidente 15/09: reload deslogueó sesión).
- **Datos:** Supabase PROD `ptochsyoyatsydfysacc`. Nunca tocar `financial_transactions` sin OK explícito ni clientes reales (`@estateia.com`/`@vildaalarcon.com`).

## 🔧 Comandos clave
- Build: `npm run build` (exit 0 → `dist/assets/`)
- Verificar: `git branch --show-current` (debe ser `remodel`) · `md5sum <archivo>` contra el bundle vivo
- Registrar tras cada tarea: `CHANGELOG_APEXFY.md` (WRITE-LAST) + commit

*Redactado por Jarvis Orchestrator · 21/09/2026. Mantener sincronizado con `CONTEXTO_ORQUESTACION_IA.md`.*