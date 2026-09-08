# 🛰️ PROJETO ANTIGRAVITY — SOP DE ENGENHARIA REVERSA FORENSE & AST
## Manual Unificado de Descompilación, Setup de Ambiente y Reidratación de Framework

**Clasificación:** Corporativo — Knowledge Base Oficial | **Área:** SSRE / Arquitectura / DevOps
**Patrón:** Pedra de Roseta (par FONTE preservada ↔ build compilado → heurísticas → aplicar al build huérfano)
**Revisión:** 2026-09-08 | **Autor:** Jarvis (Master Orchestrator / Lead Architect) — Squad Tech Ahut

---

## SUMARIO EJECUTIVO

> **Alcance.** Este SOP es el **Playbook absoluto y continuo** de ingeniería reversa de la compañía. Trata de forma central los archivos internos de dos carpetas del repo `remodel-copy` (branch `remodel`), pero exige reunir activos de **todo el ecosistema** para que el código resultante sea compilable y ejecutable localmente.
>
> | Carpeta | Naturaleza | Papel en Antigravity |
> |---|---|---|
> | `1.1_FRONTEND_PROD_TESTE/` | **Build Vite compilado — SIN `src/`** (fuente light perdida en rebrand 28/08) | **OBJETIVO de descompilación** → `src_recovered_1_1/` |
> | `02.2_BACKEND_BROKER_TESTE/` | **Broker TS con `src/` preservada** (`.ts` intacto) | **PAR ROSETTA** (referencia de firmas) + **auditoría de procedencia** |
>
> **Problema real.** El frontend `1.1` es un `dist` huérfano: el `.tsx` light original se perdió y el build es la única fuente de verdad. El backend `02.2` preserva el `.ts`, pero su `README.md` advierte que el código real de *test* vive **huérfano en la VPS** (`/root/crmahut/backend-broker-dev`, PM2 `rodrigo.whatsapp-broker-dev`) y que el `session-manager.ts` local es copia del PROD (`9eb2e374`).
>
> **Solución (documento completo).** Hábil **antes de tocar código**: la **Sección 0 — Checklist de Setup** (este). Luego el pipeline técnico: **Parte A** auditoría → **S1** forense bundlers → **S2** AST/desofuscación → **S3** rehidratación React/TSX → **S4** reconciliación broker → **S5** compliance/seguridad. Toda salida sanitizada.
>
> **Regla transversal.** Ningún secret detectado cruza la frontera de la recuperación. El deploy/validación siempre desde `dist/assets/` (solo esa carpeta tiene paridad 74/74 con el build correcto).

---

# SECCIÓN 0 — CHECKLIST DE PRE-EXECUCIÓN Y SETUP DE AMBIENTE (OBLIGATORIA)

> **Antes de iniciar cualquier descompilación**, el desarrollador debe reunir EXACTAMENTE estos activos. El objetivo: que el `src_recovered_1_1/` resultante **compile y ejecute en localhost** desde el primer intento. Si falta cualquiera de estos ítems, el proceso se detiene y se resuelve primero.

## 0.1 Environment & Runtime Build
**Objetivo:** poder inicializar el proyecto reconstruido con las mismas variables y configuración con que se construyó el build original.

### 0.1a Variáveis de Ambiente (`.env`) — OBLIGATORIO reunir
| Ítem | Detalle | De dónde se toma |
|---|---|---|
| **Supabase URL** | `SUPABASE_URL=https://<ref>.supabase.co` (REST/anon endpoint) | `02.2_BACKEND_BROKER_TESTE/src/supabase.ts` (que lo declara vía `load-env.ts`) |
| **Supabase keys** | `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` (esperados por el FRONT y el BROKER) | Credenciales de proyecto; **JAMÁS en git** — solo `.env` local + `keys_ahut.py` ch600 |
| **Supabase schema/ref** | Refs de PROD vs DEV (`xmsulduzvufdzkfktovk` = DEV del broker; PROD `…co`) | Contrato definido en `02.2/.env.example` |
| **Números/IDs de tenant** | Tenant id del CRM (ej. `fa440b34…`) para anotar RLS y tests | Datos de `profiles` del proyecto |
| **Paywall / API externas** | Tokens de WhatsApp/Baileys (si el front muestra estado de broker), APIs de pago, etc. | Config del broker PM2 / docs |

> **Regla de seguridad:** los valores reales viven en `.env` local y en `keys_ahut.py` (chmod 600). En el repo solo `*.env.example`. Nunca versionar un secret.

### 0.1b Configuraciones Estructurales (orquestadores) — OBLIGATORIO rescatar de la versión legada
| Orquestador | Para qué sirve al reconstruir | Fuente segura |
|---|---|---|
| `package.json` | Reproducir deps/scripts (`build`, `dev`, `lint`) y versión de TS | `02.2_BACKEND_BROKER_TESTE/package.json` (front perdido → inferir de vendors en S1.2) |
| `tsconfig.json` | Target JS (ES2020+), `jsx` mode, paths | `02.2_BACKEND_BROKER_TESTE/tsconfig.json` |
| `vite.config.ts` (esperado) | `base`, `outDir`, `build.chunkSizeWarningLimit`, aliases | **Inferir** del build `1.1` (nombres de chunk `index-C9-68P_N.js` = hash Vite) |
| `webpack.config.js` (si la 1.1 fuese webpack) | **PITFALL:** si el entry tiene `__webpack_require__` → es webpack, NO Vite | Checkear en S1.1; ver tabla de fingerprints |

> **Clave:** si un orquestador ya no existe (front perdido), se **reconstruye desde el build** (S1.2 fingerprinting) y se valida en localhost. Si existe como referencia legada (broker `02.2`), se copia tal cual para balizar.

## 0.2 Contexto de Back-End, Autenticación y RPCs
**Objetivo:** que el dev entienda el **contrato de datos** que consume el front descompilado y pueda probar contra un backend real en localhost.

### 0.2a Database Schema (tipados exportados)
| Ítem | Detalle | Fuente |
|---|---|---|
| `database.types.ts` (o `supabase/generated`) | Tipos TS de las tablas que usa el front | Generar con `supabase gen types` si hay acceso; si no, reconstruir de `02.2/src/supabase.ts` + consultas `.from(".…")` del front (S1.3) |
| Modelos relacionales | `conversations`, `leads`, `proposals`, `sales_records`, entidades del CRM | Documentación del esquema real (PAINEL/KB del Squad) |
| Relaciones | `conversations.client_id`, `leads.responsible_id`, `proposals.lead_id`, `sales_records.proposal_id → lead_id` | KB de datos del CRM (mapa REF/MÓDULO) |

### 0.2b Políticas de RLS y Auth
| Ítem | Detalle | Consecuencia práctica |
|---|---|---|
| Reglas de RLS | `leads_select`, `isAgent`, tenant-scoping | **Sin ellas, en localhost el front reconstruido devuelve 0 filas** (RLS bloquea anon) |
| Flujo de login | `POST /auth/v1/token?grant_type=password` con email/senha | Para probar en localhost, crear usuario de test con `tenant_id` correcto (usuarios sin tenant = **invisibles** por RLS) |
| Roles | `agent`, admin, superadmin | Determinan qué `select` ve cada rol |
| **PITFALL documentado** | Usuario creado vía auth sin `tenant_id` → invisible | **Siempre** asignar tenant tras crear (patrón ya usado para Wilhan) |

### 0.2c Endpoints y Edge Functions
| Ítem | Detalle |
|---|---|
| Lista de tablas/RPC consumidas | `.from("<tabla>")` y `.rpc("<func>")` extraídas del front (S1.3, doble comilla `['"]`) |
| Endpoints del broker | WebSocket `ws://…`, `supabase.realtime` para `messages.upsert` en Atendimiento |
| **Doc de APIs para rastreo** | Anotar cada llamada ofuscada (`fetch(…, {body, headers})`) con su contrato para guiar la renombración semántica (S2.3) |

## 0.3 Activos Estáticos y Fidelidad de UI (Design System)
**Objetivo:** fidelidad *pixel-perfect* y assets no-empacados disponibles.

### 0.3a Directorio Public (no-empacados)
| Ítem | Archivos a rescatar | Fuente |
|---|---|---|
| Favicons | `favicon.png`, `favicon.svg`, `icons.svg` | `1.1_FRONTEND_PROD_TESTE/` (raíz) |
| Imágenes/SVGs | `placeholder.svg`, logos (`logo-estate-C7fj05B9.js`) | `1.1_FRONTEND_PROD_TESTE/` |
| Manifiesto PWA (si existe) | `manifest.webmanifest`, íconos | `1.1_FRONTEND_PROD_TESTE/` — **auditar** |
| `robots.txt` | SEO/limpieza | `1.1_FRONTEND_PROD_TESTE/robots.txt` |

### 0.3b Referencia Visual (pixel-perfect)
| Ítem | Detalle |
|---|---|
| **Figma** | Design system oficial (tokens, dark/light). Requerir link al equipo de diseño si hace falta |
| **Producción activa** | `https://ahut-ecosystem.apexfyhub.com.br/` (LIGHT) y `https://dev-ahut-ecosystem.apexfyhub.com.br/` (DARK QUBITS) como oráculo visual |
| **Teste** | `https://teste-ahut-ecosystem.apexfyhub.com.br/` (build actual desplegado = `dist/assets/` 74/74) |
| **Metodología** | Comparar cada componente `src_recovered_1_1/` contra la pantalla en vivo (coloores LIGHT = `bg-white`, sin `dark:`). Si hay divergencia visual, es un fallo de rehidratación (S3) |

### Checklist de cierre de la Sección 0 (todo o nada)
```
[ ] ¿Tengo .env local con Supabase URL + keys (nunca en git)?
[ ] ¿Tengo package.json / tsconfig.json (legado 02.2 o inferido del build 1.1)?
[ ] ¿Tengo el contrato de datos (database.types.ts o mapa manual de tablas/RPC)?
[ ] ¿Entiendo las reglas RLS y creé usuarios de test CON tenant_id?
[ ] ¿Documenté los endpoints/Edge Functions que el front consume?
[ ] ¿Tengo los assets public (favicon/icon/logos) y la referencia visual (Figma + prod)?
[ ] ¿Backup de md5 de los 2 acervos (1.1 y 02.2) antes de empezar?
```
> ⚡ **Gate:** si algún checkbox está vacío, el proceso **se detiene** y se resuelve el ítem antes de descompilar. Correr sin contexto = producir fuente que no compila ni corre.

---

# PARTE A — AUDITORÍA DE PROCEDENCIA DE LOS DOS ACERVOS (PRE-FLUJO)

**Regla obligatoria ANTES de cualquier descompilación:** catalogar y fijar la identidad de cada artefacto interno. Nada de "encontré una copia y seguí".

## A.1 Inventario canónico — `1.1_FRONTEND_PROD_TESTE/`
```
1.1_FRONTEND_PROD_TESTE/
├── index.html            # entry raíz → "/assets/index-C9-68P_N.js" + "/assets/index-rUI5cL83.css"
├── dist/
│   ├── index.html        # entry diploide → "/teste/assets/index-C9-68P_N.js" (variación docroot)
│   └── assets/
│       └── Atendimento-live-v14.js   # chunk ALVO (169.508 B, md5 9133ffc7 — resuelve tela blanca)
├── assets/               # build raíz usado en el deploy — PURGADO de viejos (72 archivos)
│   ├── index-C9-68P_N.js        # ENTRY (router + core)  [raíz limpia; usar dist/assets]
│   ├── index-rUI5cL83.css       # CSS claro
│   ├── Leads-DT8J3IsW.js, Configuracoes-ByCOskG1.js, … (chunks lazy por ruta)
│   ├── index-BAYkKTIo.js, index-BNtkguDZ.js, index-CT9FeErk.js, … (entrys fantasma)
│   └── pt-BR-DDwrwCX4.js, logo-estate-C7fj05B9.js, error-messages-B3Ql_3nv.js …
├── favicon.png / favicon.svg / icons.svg / placeholder.svg / robots.txt
```
**Nota crítica:** hay **múltiples entrys** y `dist/assets/` reutiliza los mismos nombres. **Solo el entry referenciado por el `index.html` activo es el objetivo.** Validar SIEMPRE por md5 antes de analizar. *(skill: match-live-bundle-by-md5).*

## A.2 Inventario — `02.2_BACKEND_BROKER_TESTE/`
```
02.2_BACKEND_BROKER_TESTE/
├── package.json          # estateia-whatsapp-broker v1.0.0 — deps: baileys, @supabase/supabase-js, fluent-ffmpeg, pino, qrcode, ws
├── tsconfig.json
├── Dockerfile / .env.example / README.md
└── src/
    ├── index.ts               # entry del broker (Baileys multi-tenant)
    ├── session-manager.ts     # COPIA DEL PROD hash 9eb2e374 (NO es el real de test)
    ├── session-manager_original_2508.ts   # snapshot legado (25/08)
    ├── session-manager_pre_singlefix.ts   # snapshot pre-fix
    ├── audio-recovery.ts      # único que NO es copia del prod (presente en broker de test)
    ├── realtime-sync.ts
    ├── supabase.ts            # cliente Supabase (DEV xmsulduzvufdzkfktovk)
    ├── load-env.ts / check-db.ts / session-manager.test.ts
```
**Conclusión de procedencia:** este acervo **preserva el `.ts`**, así que **no es objeto de descompilación**. Su papel es doble: (1) **Par Rosetta** — enseñar el "antes" (fuente) vs "después" (build) desde IDs/API surface; (2) **Auditoría** — el `session-manager.ts` local (`9eb2e374`) **NO** es el broker de test real (VPS huérfana).

---

# SECCIÓN 1 — FORENSE DE BUNDLERS & ANÁLISIS ESTÁTICA (PARA LA 1.1)

**Objetivo:** extraer firmas y mapear dependencias del build `1.1/assets` usando el `02.2/src` como diccionario.

## 1.1 Identificación del Runtime del Bundler
Fingerprint del `index-C9-68P_N.js` (entry): la 1.1 es **Vite/Rollup** (nombres de chunk por hash de contenido, `_jsx/_jsxs`, scope hoisting, `import("/assets/Atendimento-live-v14.js")`). Confirmar:
```bash
# En el entry: imports dinámicos ESM, SIN __webpack_require__
grep -oE 'import\("\.?/?assets/[^"]+"' assets/index-C9-68P_N.js | head
# JSX runtime: _jsx/_jsxs presente → jsx-runtime automático
grep -oE '_jsx[s]?\(' assets/index-C9-68P_N.js | head -1
```
**Si** aparece `__webpack_require__` → no es Vite; abortar y remapear.

## 1.2 Fingerprinting de Dependencias (Vendor Chunking)
Para el build claro `1.1`, identificar internamente (sin red):
| Biblioteca | Evidencia a buscar | Chunk típico |
|---|---|---|
| React | `_jsx`, `e.useState`, `createElement` | entry |
| react-router-dom | `createBrowserRouter`, `"/atendimento"`, `Navigate` | entry |
| Zustand | `create((set,get)=>` + `getState` en closure | entry |
| Supabase | `.from("...")`, `.rpc("...")`, `createClient(` | entry + chunks |
| Recharts | `LineChart`, `AreaChart`, `generateCategoricalChart` | `LineChart-*, AreaChart-*` |
| Baileys (es del BROKER, NO del front!) | `useSingleFileAuthState` solo en `02.2/src`, nunca en front | — |

> **PITFALL de alcance:** no confundir el stack del backend (`02.2`: baileys/ffmpeg/qrcode/ws) con el del frontend (`1.1`: react/router/supabase/recharts). Cada acervo tiene su inventario (A.1/A.2).

**Salida:** `vendor_inventory_1_1.csv` (`biblioteca, versión_inferida, 2 firmas, chunk_origen`).

## 1.3 Module ID Mapping & Dependency Graph
Como Vite usa **scope hoisting** (sin module-IDs numéricos), el grafo se auto-anota por **nombre de componente**: extraer todos `function Nome(` top-level + `lazy(()=>import("...*.js"))` del entry para reconstruir el mapa **ruta → chunk → componente**:
```bash
grep -oE 'path:"[^"]+"' assets/index-C9-68P_N.js          # rutas
grep -oE '"/assets/[A-Za-z0-9_-]+\\.js"' assets/index-C9-68P_N.js  # chunks lazy
```
**Salida:** `routing_map_1_1.csv` (ruta / path / chunk / componente).

---

# SECCIÓN 2 — MANIPULACIÓN AVANZADA DE AST & DESOFUSCACIÓN (PARA LA 1.1)

**Aplicable al front compilado.** El `02.2/src` no pasa por aquí (ya es fuente).

## 2.1 Source Map Probing
Sondear cada chunk de la `1.1` en este orden:
1. `//# sourceMappingURL=*.map` (fin del chunk);
2. `data:application/json;base64,` (inline);
3. archivos `*.map` en `1.1_FRONTEND_PROD_TESTE/**` (`find . -name '*.map'`);
4. banner de build (`/*! For license ... */` / banners vite-plugin).
Si aparece `*.map`, recuperar el árbol original directamente. Registrar `sourcemap_probe.log` [FOUND/NONE] por chunk. **Hasta hoy: NONE** en la 1.1 → sigue pipeline AST.

## 2.2 AST Traversing & Transformation
Herramientas canónicas: `@babel/parser` + `@babel/traverse` + `@babel/generator`, `jscodeshift`, o `@swc/core`. Enseñar con el par Rosetta (02.2→build) si está disponible; si no, diccionario manual.
```js
// pipeline_ast.mjs — aplica el diccionario aprendido a los chunks de la 1.1
import { parse, traverse, generate } from '@babel/core';
const ast = parse(chunkMin, { sourceType: 'module' });
traverse(ast, {
  Identifier: p => { if (rosettaMap.has(p.node.name)) p.node.name = rosettaMap.get(p.node.name); },
  Function: p => { const sig = generate(p.node).code.slice(0,160); /* → nombre */ }
});
```

### Transformación — ejemplo ANTES/DESPUÉS (del propio chunk Atendimiento de la 1.1)
**Entrada minificada** (`Atendimento-live-v14.js`):
```js
function Atendimento(){let m=e.useState(!1),[x,$]=m;return e.jsx("div",{className:"flex-1 py-3 px-4 rounded-lg border",children:[
e.jsx("select",{value:x,onChange:t=>$(t.target.value),children:e.jsx("option",{value:1,children:"Agendamiento"})}),
e.jsx("button",{onClick:()=>z(n.id),children:"fazer_LQA"})]})}
```
**Salida TSX desofuscada:**
```jsx
function Atendimento() {
  const [estagioSeleccionado, setEstagioSeleccionado] = useState(false);
  const [valor, setValor] = estagioSeleccionado;
  return (
    <div className="flex-1 py-3 px-4 rounded-lg border">
      <select value={valor} onChange={t => setValor(t.target.value)}>
        <option value={1}>Agendamento</option>
      </select>
      <button onClick={() => aplicarEtapa(registroActual.id)}>fazer_LQA</button>
    </div>
  );
}
```

## 2.3 Semantic Un-mangling & Control Flow Recovery
- **Renombrar por I/O boundaries:** entrada (arg-object `{query,limit,offset}` → fetch), salida (Promise → `fetch*/get*`; escalar con `+`/`/` → `calc*`), y el **llamador** (label vecina: `onClick` cerca de `"marcar"` → `marcarAtendimiento`).
- **Control Flow Flattening** (`while(1){switch(d){...}}`): recolectar todos `case N:`, reconstruir orden lineal por saltos `d=N`, extraer bloques, reemitir sin dispatcher.

## 2.4 Polyfill Stripping
Si hay `_asyncToGenerator`/`regeneratorRuntime`/`core-js` en el top del chunk: eliminar el bloque y reescribir `_asyncToGenerator(regeneratorRuntime.mark(f))` → `async function f(){}`; luego `transform-async-to-generator` al target del proyecto (ES2020+). Validar con `node --check`.

---

# SECCIÓN 3 — REHIDRATACIÓN DE FRAMEWORK (React/TSX) & COMPONENTIZACIÓN (PARA LA 1.1)

**Objetivo:** `_jsx` → `<TSX/>`, reconstruir hooks/rotas/layout y emitir en `src_recovered_1_1/`.

## 3.1 Descompilación de JSX Runtime
| Runtime | TSX | Nota |
|---|---|---|
| `e.jsx("div",{...})` | `<div {...}/>` | tag string |
| `e.jsx(Nombre,{a:1})` | `<Nombre a={1}/>` | componente |
| `e.jsxs("div",{children:[...]})` | `<div>{[...]}</div>` | array fragmento |
| `e.jsx(Fragment,{...})` | `<>...</>` | fragmento |
| `e.jsx("option",{value:1})` | `<option value={1}>` | atributo |

Transformar por **subárbol** (visitor de Babel), nunca línea a línea por regex. Regex solo para cortes estables/extractores.

## 3.2 Reconstrucción de Hooks & State Trees
- `let m=e.useState(0),[n,o]=m` → `const [etapa, setEtapa]=useState(0)` (nombrar por uso posterior del setter).
- **Preservar orden estricto** de los hooks (violación = crash de render del React).
- `useEffect`/`useMemo` → reconstruir closure; `useContext`/`.Provider` → `Context.tsx`; `create((set,get)=>...)` → `store.ts`.

## 3.3 Ingeniería de Ruteo & Layout → `src_recovered_1_1/`
Extraer `path:"..."` + `element:`/`lazy:` del entry → reconstruir rutas. Organizar:
```
src_recovered_1_1/
├── index.tsx / main.tsx
├── routes.tsx
├── pages/Atendimento.tsx, Leads.tsx, Configuracoes.tsx, …   # 1 por ruta del routing_map
├── components/Header.tsx, …                                  # reuso
└── layouts/MarketingLayout.tsx, SuperAdminLayout.tsx, …      # patrones NavLink/Outlet
```
**Validación de paridad (no-mock):** cada página reescrita debe tener **≥1** `.from(`/`.rpc(` (si la ruta original accedía a datos). Contar:
```bash
grep -cE "\.from\(|\.rpc\(" src_recovered_1_1/pages/Atendimento.tsx   # >=1
```

---

# SECCIÓN 4 — RECONCILIACIÓN DEL BROKER (02.2_BACKEND_BROKER_TESTE)

> El broker NO se descompila (ya tiene `.ts`). Pero hay un riesgo de procedencia documentado. Esta sección emite el **par de auditoría** y cierra el "Rosetta" para el front.

## 4.1 Auditoría de hash & procedencia de los `src/*.ts`
- Catalogar md5 de **todos** `src/*.ts` y comparar las variantes: `session-manager.ts` vs `_original_2508.ts` vs `_pre_singlefix.ts`.
- Confirmar si `session-manager.ts` == PROD `9eb2e374` (README dice sí).
- **No** "arreglar" el `session-manager.ts` al de test real sin acceso a la VPS `2.24.95.98` (puerto 22 inaccesible hoy). Registrar brecha.

## 4.2 Broker como Par Rosetta (enseña la descompilación del front)
Usar la superficie de API del `02.2/src` para anotar el `src_recovered_1_1/`:
- `supabase.ts` → tablas/RPC reales (`conversations`, `leads`, `conversations.*`) que el front consume.
- `session-manager.ts` → patrones de estado/eventos para mapear llamadas `on("messages.upsert")` en el front.
- **Objetivo:** que el front recuperado hable con las **mismas entidades** que el broker, cerrando la "piedra" entre lo que el backend preserva y lo que el front reconstruido espera.

---

# SECCIÓN 5 — COMPLIANCE, SEGURIDAD & TOOLING AUTOMATIZADO

## 5.1 Automação (CLI)
```
antigravity_1_1/
├── cli.mjs          # --dist 1.1_FRONTEND_PROD_TESTE --rosetta 02.2_BACKEND_BROKER_TESTE --out src_recovered_1_1
├── lib/bundler.js   # detecta Vite (específico de la 1.1)
├── lib/rosetta.js   # aprende del par 02.2/src (API surface) + mapas manuales
├── lib/ast-pipeline.js  # parse→traverse→(unmangle|jsx|hooks)→generate
├── lib/sanitize.js  # secrets
└── tests/*.test.mjs # golden-tests (fragmentos antes/después reales de la 1.1)
```
Flujo: ① **learn** (par 02.2→heurística) → ② **recover** (`--dry-run` obligatorio) → ③ **sanitize** → ④ **parity-check** → ⑤ commit.

## 5.2 Data Sanitización (obligatoria)
1. **Barrido** en cada chunk extraído de la 1.1 y en `src_recovered_1_1/`:
   `/(eyJ[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{8,}|service_role|sb_publishable|password[=:]["'][^"']{4,}|sk-[A-Za-z0-9]{20,})/gi`
2. **Aislar** → mover a `quarantine/` y sustituir por `[REDACTED: <tipo>]` de igual longitud.
3. **Registrar** solo ubicación+tipo en `report.json` (jamás el valor).
4. **Re-scan de cierre:** cero hits en la carpeta emitida = pass.
5. **Gate de commit:** bloquear merge si `src_recovered_1_1/` contiene secret.

## 5.3 Procedencia & auditoría
- Banner de origen en todo archivo recuperado:
  ```js
  /*== ANTIGRAVITY RECOVERED v2.1 — origen: 1.1/assets/<chunk>:<sha256_prefix> | AST | sanitizado ==*/
  ```
- `report.json` con hash del bundle-fuente, fechas, versión CLI — rastro de auditoría.

---

## APÉNDICE — Runbook del operador (flujo completo, desde Setup)

```bash
# 0. [SECCIÓN 0] Reunir activos: .env, orquestadores, contrato DB, RLS, assets public, referencia visual
#    (Todos los checklists resueltos ANTES de avanzar)

# 1. Fijar identidad de los dos acervos
md5sum 1.1_FRONTEND_PROD_TESTE/dist/assets/Atendimento-live-v14.js   # debe ser 9133ffc7
md5sum 02.2_BACKEND_BROKER_TESTE/src/*.ts                            # Auditar procedencia (4.1)

# 2. Recuperar el front (dry-run primero)
node antigravity_1_1/cli.mjs recover \
  --dist 1.1_FRONTEND_PROD_TESTE/assets --out src_recovered_1_1 --dry-run

# 3. Sanitizar + cerrar
node antigravity_1_1/cli.mjs sanitize --in src_recovered_1_1 --report report.json

# 4. Paridad (no-mock)
grep -cE "\.from\(|\.rpc\(" src_recovered_1_1/pages/Atendimento.tsx   # >=1

# 5. Compilar/ejecutar en localhost (validando el Setup de la Sección 0)
npm install && npm run build && npm run dev   # debe levantar sin secret hardcodeado

# 6. Commit con banner + report
git add src_recovered_1_1 report.json && git commit -m "antigravity: recover 1.1 (Atendimento 9133ffc7 de dist)"
```

## APÉNDICE B — Mapa de heurísticas (validaciones reales de estos acervos)
| Heurística | Dónde | Validación |
|---|---|---|
| Identidad por **MD5** (no nombre) | `Atendimento-live-v14.js` `9133ffc7` | 15 copias antiguas `9c57d6b`/`387dcb4` no engañan |
| Entry activo vía **index.html referenciado** | `index-C9-68P_N.js` (raíz) vs `dist/` | hay 4 entrys fantasma — solo el referenciado vale |
| **Dos docroots** (`/assets/` vs `/teste/assets/`) | `index.html` raíz vs `dist/index.html` | no confundir en la regla de assets |
| Backend **no se descompila** (ya es `.ts`) | `02.2/src` | papel = auditoría + Rosetta |
| `session-manager.ts` ≠ broker de test real | `9eb2e374` (copia PROD) | brecha de VPS huérfana registrada, sin "arreglo" |
| Asset **purga de viejos** en raíz | `assets/` (72) vs `dist/assets/` (74) | solo `dist/assets/` se despliega; raíz limpia |

---

*Fin del SOP Antigravity (alcance central: 1.1_FRONTEND_PROD_TESTE + 02.2_BACKEND_BROKER_TESTE; contexto completo: todo el ecosistema de la Sección 0). Versionado en la KB del Squad.*