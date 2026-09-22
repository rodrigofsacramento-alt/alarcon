# 🔍 EXPERIMENTO — OmniRoute (gateway IA free) probado en VPS de TESTE

> **Fecha:** 22/09/2026 · **Autor:** Jarvis (orquestador) · **Estado:** 🧪 PROBADO EMPÍRICAMENTE — **NO SE ADOPTA**
> **Contexto:** a pedido del Comandante ("omniroute está famoso estas semanas"), se instaló y probó en TESTE (docker, password fuerte `OmniRoute_Ahut_2R7x!qT9` a rotar, container `omniroute`, puerto 20128). Container detenido/eliminado tras la prueba.

## Qué es (origen: estudio web)
- Gateway/router de IA **self-hosted**, MIT (`diegosouzapw/OmniRoute`), ~68k⭐ web / 33.9k⭐ GitHub v3.8.48.
- Agrega **350+ providers / 90–150+ free tiers / ~1.5B tokens gratis-mes** detrás de un endpoint `localhost:20128/v1`.
- Promete: auto-fallback 4 tiers + compresión de tokens (RTK/Caveman 15–95%) + "funciona de entrada sin claves".
- Dato: **primer proyecto open-source brasileño** en el programa de soporte de Kimi.

## Verificación EMPÍRICA en TESTE (lo que pasó de verdad)
| Paso | Resultado |
|---|---|
| Docker run | ✅ Container `omniroute` Up (healthy) |
| Login admin | ✅ `POST /api/auth/login` → 200 (password fuerte) |
| Crear API key | ✅ `POST /api/keys` → key `sk-...` (ligada a machineId; listado la ofusca) |
| `GET /v1/models` | ✅ **490 modelos** · 40 combos/alias (`auto/best-free`, `auto/best-coding`, etc.) |
| Chat `auto/best-free` | ❌ **FALLA** — providers keyless por omisión caídos: `oc/big-pickle` 403 (OpenCode free solo desde OpenCode), `felo/*` 400/429 |
| Chat `oc/deepseek-v4-flash-free` | ❌ 400 "Model is unavailable" |
| Chat `oc/mimo-v2.5-free` | ❌ 403 "free tier only usable from within OpenCode" |
| Chat `ddgw/tinfoil/gpt-oss-120b` | ❌ 418 anti-abuse (DuckDuckGo rechaza IP externa) |

## Verdicto (honesto, sin el hype)
- **El "funciona de entrada sin claves / FREE Claude/GPT gratis" NO se sostiene en la práctica** para integrarlo a un endpoint externo tipo Hermes/openai-compatible:
  - Los providers **keyless** (OpenCode Free, Felo, DuckDuckGo) **bloquean el acceso por gateway** (403/418/429): exigen usar SU cliente o rechazan IPs foráneas/rate-limit.
  - El `deepseek-v4-flash` **sigue sin ser accesible gratis** vía gateway (el alias `-free` devuelve "model unavailable").
- **Coincide con el patrón 9Router** (el mismo proyecto familiar): el valor real es el **concepto** (fallback-tiers + ahorro de tokens) que **Hermes/OpenRouter ya implementan** en nuestro stack.
- Contribuyentes/1 mantenedor fuerte + 550+ contribuidores: para integrarlo a PRODUCCIÓN habría que auditar seguridad a fondo (machineId, key ligada, dashboard admin con password — controllable, pero no trivial).

## Conclusión
❌ **No se adopta OmniRoute** en la operación. Los aprendizajes (agregación free-tiers, auto-fallback, compresión) ya los cubre nuestra arquitectura. Los "modelos gratuitos" reales y accesibles siguen siendo los que validamos antes: **Gemma 4 / Nemotron / GPT-OSS gratis vía Ollama** + **OpenRouter `:free`** + **Kiro (Sonnet 4.5, créditos limitados)**.

## Limpieza
- Container `omniroute` detenido y eliminado (no se deja gateway corriendo sin configurar).
- Key/credenciales del experimento: NO se persisten; password `OmniRoute_Ahut_2R7x!qT9` requiere rotación si se reutiliza.
- Scripts del experimento: `/opt/data/scripts/_omniroute_*.py`.