# 📚 ESTUDIO DE MATERIAL — "9Router: Claude Code for Free" (Google Doc)

> **Fecha:** 22/09/2026 · **Estudiado por:** Jarvis (orquestador) · **Fuente:** https://docs.google.com/document/d/1v_hWwZd_vJbifpIrFEyVIy0WI3tfeB2LrI96Ul6-oJk/
> **Propósito:** Aprendizaje del documento COMPLETO. No es un manual de instalación de 9Router — es el análisis de cada concepto técnico y su aplicabilidad a la operación del squad Ahut (Hermes/Jarvis/OpenRouter).

---

## 📖 RESUMEN DEL DOCUMENTO (qué propone 9Router)

9Router es un **router/proxy de IA gratuito, open-source (MIT, `decolua/9router`, 27k⭐)** que corre en localhost (`:20128`) y se interpone **entre tu CLI de coding (Claude Code, Cursor, Codex, Cline…) y los proveedores de IA**. Sus 2 mecanismos centrales:

1. **Auto-fallback en cadena (Combo):**
   - Tier 1 → tu plan pago (Claude Pro/Max, ChatGPT Plus, Copilot, Cursor)
   - Tier 2 → modelos baratos (GLM, MiniMax)
   - Tier 3 → modelos GRATIS (Claude Sonnet 4.5 vía Kiro, OpenCode Free, Gemini vía créditos Vertex)
   - Cuando un modelo agota su cuota, el siguiente request cae automáticamente al siguiente tier → la sesión de coding **nunca se detiene**.

2. **RTK (token saver):** comprime el output largo de herramientas (git diffs, listados de archivos) recortando **20–40% de tokens** por request.

---

## 🔬 ANÁLISIS SECCIÓN POR SECCIÓN (lo que se aprende)

### §1 — Qué es / modelo de 3 tiers
**Aprendizaje clave:** El valor de un router no es solo "gratis", es la **resiliencia ante cuotas**. La arquitectura de *tier + fallback automático* es la forma correcta de garantizar disponibilidad cuando un solo proveedor impone límites. **Esto ya está implementado en Hermes** (fallback chain entre providers que usamos a diario) — el concepto no es nuevo para nosotros, pero el documento lo hace explícito y bien diseñado.

### §2 — Seguridad (lo que el autor chequeó)
**Aprendizajes útiles para CUALQUIER herramienta que instalamos:**
- Verificar que el paquete npm lo publica **la misma cuenta** que el repo GitHub (antifraude / copycat).
- Preferir herramientas que corren **local** (claves en tu disco, no en server ajeno).
- Ojo con **"power tool de 1 mantenedor"** con issues abiertos → tratar como herramienta avanzada, no producto con soporte.
- **NUNCA** activar MITM (interceptar tráfico cifrado con cert local) salvo que se sepa exactamente para qué; **NUNCA** exponer la key del router (quien la tenga gasta tus cuentas conectadas).

### §3 — Instalación (npm global / docker)
`npm install -g 9router` + `9router` → dashboard en `http://localhost:20128`.
**También soporta Docker:** `docker run -d --name 9router -p 20128:20128 -v "$HOME/.9router:/app/data" -e DATA_DIR=/app/data decolua/9router:latest` — **útil conceptualmente** (nuestra VPS corre servicios en containers; el patrón data-dir por volumen es el de siempre).

### §4 — Proveedores gratis (Kiro / OpenCode / Vertex)
- **OpenCode Free:** sin signup, modelos se auto-cargan, cambian con el tiempo.
- **Kiro:** ~50 créditos/mes gratis → incluye Claude Sonnet 4.5 + modelos open (GLM-5, MiniMax). Modelos nuevos (Sonnet 5/Opus 5) solo pago.
- **Vertex AI (Google):** cuenta nueva → $300 créditos gratis para Gemini/DeepSeek/GLM. ⚠️ *Lección importante:* hay que usar el endpoint **Vertex AI Studio** porque "el endpoint Gemini API ya no gasta esos créditos" — **los endpoints del mismo proveedor NO son equivalentes** (regla transferible a cualquier integración).

### §5 — Combos (la cadena "que nunca se detiene")
Definir una **lista ordenada** de modelos con estrategia *Fallback (try in order)*. Al agotarse uno, pasa al siguiente. **Lección de diseño de sistemas:** una lista priorizada de respaldo es superior a una sola dependencia.

### §6 — Cómo apuntar Claude Code a 9Router
Setting en `~/.claude/settings.json`:
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:20128/v1",
    "ANTHROPIC_AUTH_TOKEN": "CLAVE_9ROUTER",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "kr/claude-sonnet-4.5",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "kr/glm-5"
  }
}
```
**Aprendizaje:** los CLIs de coding respetan `*_BASE_URL` y `*_AUTH_TOKEN` para cambiar el backend sin tocar la app. Mismo patrón que Hermes (`OPENAI_BASE_URL`/`base_url` en config). Reversible borrando el bloque env.

### §7 — Cursor y Codex
- **Cursor:** Settings → Models → Advanced → `OpenAI API Base URL` = endpoint 9Router + model custom.
- **Codex CLI:** env `OPENAI_BASE_URL` + `OPENAI_API_KEY`.

### §8 — Verificación de funcionamiento
Dashboard → Usage: ver request, qué modelo respondió, cuántos tokens usó → eso confirma que estás en el router.

### §9 — Modelos gratis que conectar primero
1. `kr/claude-sonnet-4.5` (lo más cercano al Claude pago; créditos limitados → guardarlo p/ las partes difíciles)
2. `kr/glm-5` (coder fuerte para el trabajo diario)
3. OpenCode free (sin signup, ideal p/ edits simples, renames, explicaciones)
4. Gemini Vertex (contexto enorme, leer un proyecto entero)

### §10 — Troubleshooting
- Dashboard no abre → ya hay otra copia en el puerto.
- 401 en Claude Code → la key de settings.json no coincide con el dashboard.
- Un modelo deja de responder → se agotaron sus créditos; el combo avanza solo.
- Nombre de modelo rechazado → cambiar con las actualizaciones, copiar exacto del dashboard.

---

## 🎯 APLICABILIDAD A LA OPERACIÓN AHUT (conclusión ejecutiva)

| Concepto del doc | ¿Aplica al squad? | Cómo |
|---|---|---|
| Auto-fallback por tiers | ✅ **Ya lo tenemos** | Hermes/OpenRouter: fallback chain entre providers en config |
| Ahorro de tokens (RTK) | ✅ **Ya lo tenemos** | Hermes recorta contexto (limit de lectura, head+tail de archivos) |
| Instalar 9Router | ❌ **No necesitamos** | Usamos Hermes+OpenRouter, no Claude Code; capa extra = más riesgo |
| Docker + volumen de datos | ✅ Patrón reafirmado | Igual que nuestros stacks (evolution-api, etc.) |
| "Endpoint mismo proveedor ≠ equivalente" (Vertex vs Gemini API) | ✅ **Lección general** | Transferible: al integrar proveedores verificar el endpoint CORRECTO para el crédito/función |
| Verificación antifraude (npm account == repo owner) | ✅ **Buen hábito** | Aplicar en cualquier instalación futura |

**DECISIÓN (registrada):** No se instala 9Router. Se conservan los aprendizajes conceptuales (resiliencia por fallback, ahorro de tokens, higiene de instalación) que ya están inherentes en nuestra arquitectura Hermes/OpenRouter.

---

## 📌 NOTA CRÍTICA
La guía es **promocional** (vende la comunidad skool.com/viral-ads) y los tiers gratis son **volátiles** (iFlow, Qwen Code y Gemini CLI cortaron sus tiers gratis en 2026). Usar cuentas descartables, revisar la página de cuotas, y mantener ≥2 proveedores gratis conectados.