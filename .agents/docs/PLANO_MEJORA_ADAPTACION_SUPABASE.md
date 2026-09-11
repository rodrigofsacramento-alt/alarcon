# 📋 PLAN DE MEJORA Y ADAPTACIÓN PROFESIONAL — Supabase & Sistema Ahut

**Fecha:** 09/set/2026 · **Autor:** Jarvis (Orquestrador) · **Base:** auditoría SOLO-LECTURA real del SUPABASE DEV `xmsulduzvufdzkfktovk` (72 tablas, 182 funciones, RLS, pgvector)

> Este plan se construyó con **evidencia real tomada del banco DEV** (no de memoria ni de reportes ajenos). Cada item marca lo que YA existe vs lo que FALTA.

---

## 🟢 LO QUE TU SUPABASE YA TIENE (infraestructura madura — aprovecharla, no re-crear)

| Recurso | Estado REAL verificado | Implicación |
|---|---|---|
| **pgvector** (`vector`, `halfvec`, `sparsevec`, HNSW) | ✅ **INSTALADO** y funcional | El "activar pgvector" del reporte anterior es **redundante** — ya está. |
| **RAG semántico** (`match_documents()` + `match_documents_for_tenant()`) | ✅ **YA EXISTE** | Parte del RAG multi-tenant ya está construido en DEV. |
| **Tablas knowledge** (`tenant_knowledge_documents` / `tenant_knowledge_sources`) | ✅ EXISTEN | El almacén RAG por tenant ya está definido. |
| **RLS** | ✅ ON en 71/72 tablas (solo `deleted_profiles` OFF) | Aislamiento multi-tenant casi total. |
| **Funciones de negocio** (182): funil, performance, WhatsApp (send/accept/transfer), RH, financeiro, provisioning | ✅ 182 funciones | El backend de lógica está N. |
| **72 tablas** | ✅ leads, conversations, properties, proposals, sales_records, RH, financeiro, SaaS | Modelo de datos rico y de negocio real. |

**Conclusión del hallazgo:** el "gap" que el reporte del agente proponía llenar (pgvector, RAG, matching) **ya está cubierto en DEV**. Hay que HABILITAR/ALINEAR lo existente, no construirlo desde cero.

---

## 🟠 GAPS REALES / ADAPTACIONES PROFESIONALES (priorizadas)

### PRIORIDAD ALTA — Riesgo/Deuda que corregir YA

1. **🔴 Credencial DEV hardcodeada en scripts**
   - Hoy: `conectar_dev.py`, `seed_financeiro_dev.py`, etc. contienen la password en texto plano (`Dir@124!@$!@$`).
   - Acción: mover a `.env` (chmod 600) / variable de entorno / `keys_ahut.py` (ya existe el patrón) y gitignore. **Nunca en repos.**
   - Verificación: `git grep` no devuelva la clave; scripts lean de env.

2. **🟠 `rag_chunks` no existe, pero el RAG DEBERÍA usar `tenant_knowledge_documents`**
   - Hoy: el issue es que el plan RAG (`.agents/docs/PLANO_AGENTE_RAG_IMPLEMENTACAO.md`) asume crear `rag_chunks` desde cero, pero DEV ya tiene el patrón knowledge por tenant.
   - Acción: **adoptar el esquema existente** (`tenant_knowledge_documents` + `match_documents_for_tenant`) en vez de crear tablas nuevas paralelas. Alinee el `rag_ingest.py` a ese esquema.
   - Verificación: el ingest escribe en `tenant_knowledge_documents`, no en `rag_chunks`.

3. **🟠 `deleted_profiles` sin RLS**
   - Acción: habilitar RLS + política (solo super_admin / role) como en el resto.
   - Verificación: `relrowsecurity=ON`.

### PRIORIDAD MEDIA — Gobernanza profesional

4. **🟡 Sincronización de tipos** (el único punto válido del reporte previo)
   - Hoy: `types/database.ts` (1.851 líneas, mezcla 72 tablas + 182 funciones) es estático/manual → desactualización + casts `any`.
   - Acción: script `types:gen` que regenera los tipos del DEV, NO del PROD. (El reporte previo lo proponía para PROD y con `package.json` inexistente — aquí es viable por ser regeneración, no build.)
   - Verificación: `types/database.ts` refleja las 72 tablas reales.

5. **🟡 Auditoría de 72 tablas vs código** (lo que el frontend realmente usa)
   - Acción: mapear tablas/columnas usadas en `src_recovered_1_1/**` vs schema real → listar huérfanas (p. ej. `leads_sync_2_0`, `whatapp_*`, `rh_*` ¿se usan?) y candidatas a limpieza.
   - Verificación: reporte tablas-por-módulo.

### PRIORIDAD BAJA — Mejora continua

6. **🟢 Funil/estágio**: `leads.stage` ya existe (texto). El selector de la engranaje (igualado a PROD) ya escribe a `leads.stage`. Verificar el trg/trigger de sync `leads.stage ⇄ conversations` si aplica.
7. **🟢 Backup/versionado**: extensiones pg_cron presentes — revisar que no haya cron huérfano.

---

## 🚫 LO QUE NO SE HARÁ (para no revertir el avance)

- ❌ NO crear `rag_chunks` paralelo si ya existe `tenant_knowledge_documents` (duplicaría el modelo).
- ❌ NO "activar pgvector desde cero" — ya está.
- ❌ NO tocar SUPABASE PROD (`ptochsyoyatsydfysacc`) para embeddings/ingest — es el banco de los clientes.
- ❌ NO crear aparato IaC `supabase/migrations` + `npx supabase db push` — el repo no es buildable (sin package.json en fuentes recuperadas). La gobernanza aquí es de **escaneo + regeneración**, no de CLI de build.

---

## ✅ CRITERIOS DE ACEPTE (así sabemos que está listo)

- [ ] Ninguna credencial en repos/scripts (solo env ch600).
- [ ] `rag_ingest.py` escribe en `tenant_knowledge_documents` (MISMO esquema que DEV ya tiene).
- [ ] `types/database.ts` regenerado refleja 72 tablas reales.
- [ ] `deleted_profiles` RLS ON.
- [ ] Audit de tablas huérfanas entregado.
- [ ] PROD jamás tocado; todo en DEV.

---

## 🎯 PRÓXIMOS PASOS (orden sugerido)

1. **YA (independiente, sin credenciales nuevas):** mover credenciales a env + gitignore. *(lo hago ahora si autorizas)*
2. **ALINEAR RAG:** apuntar `rag_ingest.py` al esquema `tenant_knowledge_documents` existente.
3. **Regenerar tipos** desde DEV.
4. **Audit de tablas vs código**.