# 🔑 GUÍA — CLAVES API GRATUITAS para la operación Ahut (Hermes/OpenRouter)

> **Fecha:** 22/09/2026 · **Autor:** Jarvis (orquestador) · **Foco:** deepseek-v4-flash gratis + fallbacks
> **Estado:** 📝 GUÍA PREPARADA — **no se ha tocado configuración** (a pedido del Comandante: preparar sin ejecutar).
> **Fuentes verificadas:** docs oficiales de Ollama Cloud, OpenRouter, cheahjs/free-llm-api-resources (mar-2026) y mnfst/awesome-free-llm-apis.

---

## 🎯 Objetivo
Conectar al stack Hermes/OpenRouter **modelos gratuitos como capas de respaldo (fallback)** sin cambiar la arquitectura. Prioridad: **deepseek-v4-flash gratis vía Ollama Cloud** (es el mismo modelo que usamos como principal vía OpenRouter → coherencia de comportamiento).

---

## ⭐ A. deepseek-v4-flash GRATIS vía Ollama Cloud (PRIORITARIO)

### Datos técnicos (verificados en docs oficiales)
| Campo | Valor |
|---|---|
| Página de API key | `https://ollama.com/settings/keys` (requiere sign-in con **GitHub**) |
| Endpoint OpenAI-compatible | `https://ollama.com/v1` |
| Autenticación | `Authorization: Bearer $OLLAMA_API_KEY` (env `OLLAMA_API_KEY`) |
| Modelo | `deepseek-v4-flash` (modelo **cloud** oficial; alternativo recomendado tras retiro de deepseek-v3.1/v3.2/cogito-2.1) |
| Límite gratis | Sesión (reset 5h) + semanal (reset 7d); **sin tarjeta de crédito** |
| Retiros | Ollama avisa por email; hoy **sin retiro anunciado** para deepseek-v4-flash |

### Paso a paso
1. **Crear/entrar en Ollama:** `https://ollama.com` → **Continue with GitHub** (si no tienes GitHub, crear una cuenta; no usa OpenAI).
2. **Generar API key:** `https://ollama.com/settings/keys` → **Create key** → copiar el valor (formato `ollama_...`). Guardarlo en el gestor de secretos del squad (NUNCA en el chat).
3. **Guardar en Hermes** como provider/modelo de reserva (cuando se autorice):
   - `base_url`: `https://ollama.com/v1`
   - `api_key`: la key generada
   - `model`: `deepseek-v4-flash`
4. **Probar** (verificación real antes de usarlo en producción):
   ```bash
   curl https://ollama.com/v1/chat/completions \
     -H "Authorization: Bearer $OLLAMA_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"deepseek-v4-flash","messages":[{"role":"user","content":"Hola, responde OK"}],"stream":false}'
   ```
5. **Colocarlo en la fallback chain** (después de OpenRouter principal, antes de los gratuitos más débiles).

### ⚠️ Notas
- Límites gratis por **sesión (5h)** y **semana (7d)** — el tope semanal es el limitante real.
- El modelo cloud `deepseek-v4-flash` **no requiere pull** ni Ollama local (acceso directo a `ollama.com/v1`).
- Si se quiere usar con Ollama local instalado, hacer `ollama signin` + `ollama run deepseek-v4-flash`.

---

## 🟢 B. Fallbacks gratuitos recomendados (en orden de utilidad)

### B1. OpenRouter modelo `:free` (YA TENEMOS LA KEY — CERO setup)
No hay que pedir clave nueva. Solo cambiar el slug del modelo al hacer fallback:
- `nvidia/nemotron-3-super-120b-a12b:free` (262K ctx)
- `openai/gpt-oss-20b:free` · `cohere/north-mini-code:free` (código)
- Endpoint: `https://openrouter.ai/api/v1` (mismo de siempre)
- Límite: 20 RPM / 50 RPD por modelo (→ 1.000 RPD con $10 top-up único)

### B2. Google Gemini (AI Studio) — contexto 1M
- Key: `https://aistudio.google.com/app/apikey` (sin tarjeta; opt-in training fuera de EU/UK/EEA)
- Modelo: `gemini-2.5-flash` · Límite 15 RPM / 1.500 RPD · Contexto **1M tokens**
- Útil para leer codebase/PDF completo de una vez.

### B3. NVIDIA NIM — alto volumen (40 RPM / 10k RPD)
- Registro free con NVIDIA Developer Program: `https://build.nvidia.com/explore/discover`
- Modelo: `nvidia/gpt-oss-120b` · Endpoint `https://integrate.api.nvidia.com/v1`
- De los límites gratis más generosos.

### B4. Groq — velocidad (30 RPM / 1k RPD)
- Key: `https://console.groq.com/keys` · Endpoint `https://api.groq.com/openai/v1`
- Modelos: `openai/gpt-oss-120b`, `qwen/qwen3.6-27b`

### B5. Mistral — volumen código (~$10/mes free con opt-in training)
- Key: `https://console.mistral.ai/api-keys` · `https://api.mistral.ai/v1` · Modelo: `codestral`/`mistral-small-4`

### B6. Kiro — Claude Sonnet 4.5 gratis (única vía real; 50 créditos/mes)
- Sign-in con GitHub/Google: `https://kiro.dev` · Acceso a Claude Sonnet 4.5
- ⚠️ **Claude NO está en Ollama Cloud** (Ollama solo sirve open-weights: DeepSeek/GLM/Qwen/Kimi/Nemotron/Mistral/GPT-OSS). El OpenRouter `:free` tampoco tiene `claude-sonnet-4.5`.
- **Kiro free:** bonus único 500 créditos + ~50 créditos/mes → incluye Sonnet 4.5 + Auto agent + open-weights.
- Los créditos **se agotan rápido** (Sonnet/Opus queman créditos) → usar SOLO para las partes más difíciles, no para operación continua.

---

## 🚫 C. SIN CLAVE (anotado, menos práctico)
- **Kilo Code** `https://api.kilo.ai/api/gateway`: 200 req/hr por IP, sin key, auto-router `kilo-auto/free`
- **OVHcloud AI Endpoints**: 2 RPM/IP, sin signup, modelos en EU

---

## 🧭 D. Arquitectura de fallback recomendada (cuando se autorice)
```
1. OpenRouter (deepseek-v4-flash)      → PRINCIPAL (ya operativo)
2. Ollama Cloud (deepseek-v4-flash)    → MISMO modelo gratis (mejor coherencia) ★
3. OpenRouter (:free, nemotron/gpt-oss)→ gratis sin clave nueva
4. Gemini (AI Studio) o NVIDIA NIM     → volumen / contexto largo
```
**Principio:** mantener el **mismo modelo** (deepseek-v4-flash) como primer respaldo + capas baratas/gratis detrás. Sin instalar 9Router (decisión ya registrada).

---

## 📌 HIGIENE DE SEGURIDAD
- **Nunca** pegar claves en el chat/commits → guardar en gestor de secretos del squad.
- Free tiers **usan tus prompts para entrenar** (Google/Mistral fuera de EU; OpenRouter `:free` puede loggear). No enviar datos de clientes reales por estas vías.
- Límites **cambian frecuentemente** → reverificar antes de depender de uno.
- Tratar los free tiers como **respaldo**, nunca como canal único para datos productivos.

---

## ✅ Siguiente paso OFERIDO (no ejecutado)
Cuando el Comandante lo autorice: generar/gestionar las keys (las que requieren cuenta nueva son accionables por el usuario, enlaces arriba) → guardarlas en secretos → **configurar la fallback chain en Hermes** → probar cada capa con una llamada real → validar y documentar.