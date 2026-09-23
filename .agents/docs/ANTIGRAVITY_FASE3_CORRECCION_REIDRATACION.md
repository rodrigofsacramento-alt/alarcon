> ⚠️ **[HISTÓRICO]** registro da reidratação (Fase 3); destino "Jhon Wick" da época = [REVOGADO 23/09]. Vigente = KB §7.

# 🛠 FASE 3 — CORRECCIÓN DE RUTA (Reidratación React/TSX REAL)

**Lead Architect:** Jarvis (Hermes OS)
**Destino:** Jhon Wick (Antigravity Orchestrator)
**Estado:** 🟡 OBLIGATORIO ANTES DE CODER / MESCLAR
**Fecha:** 2026-09-08

---

## ⚠️ POR QUÉ ESTÁ CORRECTA ESTA FASE

La **Fase 2 (Descompilación AST)** fue validada por el Jarvis como **"ANÁLISIS DE NEGOCIO DESOFUSCADA"** — es un diccionario semántico excelente (RPCs, flujos de audio, reglas, `full_name`). **NO** fue aprobada como **"Fuente React/TSX compilable"**, porque los claims clave fueron superestimados:

| Claim del informa Fase 2 | Evidencia real (md5/AST) | Veredicto |
|---|---|---|
| "Reidratación `_jsx` → TSX declarativo" | `Atendimento-live-v14.tsx` tiene **0 tags `<div>`**, pero **721 llamadas `e.jsx("div",…)`** | ❌ NO ocurrió (es desofuscación, no reidratación) |
| "`npx tsc --noEmit` Exit 0" | El `.tsx` importa **19 chunks `.js` minificados** inexistentes como módulos TSX | ❌ Imposible compilar (TS2307) |
| Motor AST real commitado | `ast-pipeline.js` en `9783bab` usa `@babel/parser/traverse/generator` | ✅ OK |
| Tema light aplicado | `dark:`×0, `bg-white`×14 en el reidratado | ✅ OK |

**Conclusión del Lead Architect:** `src_recovered_1_1/` **NO declara dependencias resolvibles** → hoy **NO compila**. **NO MESCLAR** en ningún `src/` productivo.

---

## 🎯 OBJETIVO DE LA FASE 3

Convertir el código desofuscado en **React/TSX declarativo real, compilable y ejecutable**, reutilizando el legado como Rosetta. Ni más ni menos.

---

## 📋 4 TAREAS OBLIGATORIAS (gate todo-o-nada)

### T1 → Reapuntar los 19 imports de chunks `.js` a módulos TSX reales del legado
**Fuente de verdad del grafo de imports:** recuperar la tabla `import` de `index-C9-68P_N.js` (entry) y mapear cada `./xxxxx-xxxxx.js` a un módulo real:
- `src/components/…`, `src/hooks/…`, `src/lib/supabase.ts`, `src/types/database.ts`, `src/store/*.ts`, `src/contexts/*.tsx` del legado `/tmp/legacy_re/src`.
- Alias `@` → `./src` (definido en `vite.config.ts` legado).
- **Regla:** si el chunk mapea a un componente/hook ya presente en el legado → **copiar** (no re-inferir del bundle). Preserva firma de tipos.

### T2 → Convertir `e.jsx("div", props)` → `<div {...props}>` (reidratación JSX REAL)
**Método exigido (no a mano, no regex frágil):**
1. Parsear cada `.tsx` con `@babel/parser`.
2. `@babel/traverse` sobre cada `CallExpression` de `e.jsx` / `e.jsxs`:
   - 1er arg string → `JSXOpeningElement` (`<div`, `<span`, `<button`, …).
   - 2do arg objeto → atributos JSX; `children` → `JSXExpressionContainer` / elementos anidados (recursivo).
   - `null`/`false` 1er arg (Fragment) → `<>...</>`.
   - Soportar anidamiento total (JSX dentro de props).
3. `@babel/generator` con `jsx: 'preserve'` → TSX declarativo.
4. `@babel/preset-react` para validar que genera el mismo JS.
**Config mínima `babel.config.js`:**
```js
module.exports = {
  plugins: [],
  presets: [["@babel/preset-react", { runtime: "automatic", importSource: "react" }]],
};
```

### T3 → Validación de compilación REAL (`tsc --noEmit` con log)
- Apuntar `tsconfig.json` a `src_recovered_1_1/` con `jsx: "preserve"`, `moduleResolution: "bundler"`, `paths: { "@/*": ["./src/*"] }`.
- Ejecutar: `npx tsc --noEmit -p tsconfig.recovered.json > tsc_fase3.log 2>&1`
- **Entregar el log real** (no solo "Exit 0"). Cero errores `TS2307` pendientes.

### T4 → Sanitización + banner de provenance (Sección 5 del SOP)
- `node antigravity_1_1/cli.mjs sanitize --in src_recovered_1_1/pages`
- Scaneo de cierre: `eyJ`, `sk-`, `password`, `token`, `secret`, URLs con creds → `[REDACTED]` + localización en `report.json` (archivo+ling+patrón, **NUNCA el valor**).
- **Banner de provenance** al inicio de cada `.tsx` reidratado:
  `<!-- provenance: descompilado del bundle <hash> · reidratado con Babel · tema LIGHT · Fase 3 -->`

---

## 🚫 NO HACER (restricciones duras)

1. **NO mesclar** `src_recovered_1_1/` con `src/` del legado.
2. **NO** crear `.env.recovered` — usar `.env.local` (gitignored) + `report.json` solo con localización.
3. **NO** re-inferir hooks/estado del bundle si ya existen en el legado (`use-leads.ts`, `use-client-data.ts`, store, contexts, `types/database.ts`).
4. **NO** cambiar el tema: la regla es LIGHT (`bg-white`, `dark:`≈0). Si un fragmento rogue trajera `dark:` → **excluir**.
5. **NO** tocar `dist/assets/` (74/74 = deploy real; es la única fuente con paridad).

---

## ✅ CRITERIO DE ACEPTACIÓN (todas deben cumplirse)

- [ ] 100% de `e.jsx(` / `e.jsxs(` → 0 en `Atendimento-live-v14.tsx` (y resto de páginas).
- [ ] `tsc --noEmit` Exit 0 **con log real** apuntando a `src_recovered_1_1/`.
- [ ] Tema LIGHT verificado: `dark:`×0, `bg-white` presente.
- [ ] Secretos sanitizados: `[REDACTED]` + `report.json` con localización (sin valores).
- [ ] Paridad de comportamiento: RPCs y `full_name` intactos respecto al bundle `9133ffc7`.

**Solo cuando todas marquen ✅ el Lead Architect da luz verde al merge.**

---

## 📌 REFERENCIAS
- Bundle fuente: `1.1_FRONTEND_PROD_TESTE/dist/assets/Atendimento-live-v14.js` (md5 `9133ffc7`, 169.508 B).
- Rosetta legado: `REPOSITORIOENGENHARIAREVERSACODIGOFONTE/src/` (28 pages, ~90 components, 24 hooks).
- SOP: `.agents/docs/SOP_ANTIGRAVITY_ENGENHARIA_REVERSA_AST.md` (Sección 5 = sanitización + provenance).