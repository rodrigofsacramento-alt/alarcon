# 📐 SPEC DE ADAPTACIÓN — MÓDULO FINANCIERO (Clonación del parceiro → QUBITS)

> **Fecha:** 12/09 · **Autor:** Jarvis (Orquestador) · **Repositorio de edición:** `remodel-copy` (rama `remodel`)
> **Origen:** handover del parceiro dev (Misión 1: accesos · Misión 2: roadmap técnico). Aprobado por Rodrigo.
> **Contexto DB:** PTOCH = PRODUCCIÓN real (`ptochsyoyatsydfysacc`). Compatibilidad DB ya aplicada (TASK-017, PAINEL).

---

## 1. Objetivo

Fusionar las funcionalidades del módulo financiero del parceiro en **nuestro front existente** — NO reemplazar a ciegas — respetando la nomenclatura real de PTOCH (`financial_*`) y nuestro bundle (code-split de PROD).

**Archivos del parceiro (a fusionar):**
- `Finance.tsx` (pantalla: KPIs, filtros, tabla)
- `useFinance.ts` (hooks: `useFinance()` + `useFinanceBrokers()`)
- `Properties.tsx` (precificación doble + comisión fraccionada `mes_a_receber`)

**Archivos nuestros (destino de la fusión):**
- `src/pages/Financeiro.tsx` (existe)
- `src/hooks/use-financial.ts` (existe)
- `src/pages/Properties.tsx` (existe, por revisar)

---

## 2. ⛔ Desajustes detectados (resolver ANTES de escribir código)

| # | Nuestro código actual | PTOCH real | Acción |
|---|---|---|---|
| 1 | `hooks/use-financial.ts` L26-27: `query.eq('category', filtros.category)` | `financial_transactions.category_id` (UUID, FK) — **NO existe columna `category` texto** | Cambiar filtro a `category_id` (UUID) o JOIN con `financial_categories.name` |
| 2 | L122-127: `tx.category === 'commission'` / `'operational'` (texto) | IDEM — no hay `category` | Consultar por JOIN `financial_categories.name`/`category` o mapear por `category_id` |
| 3 | El parceiro crea `categories`/`banks` (sin prefijo) | PTOCH usa `financial_categories`(19), `financial_banks`(8), `financial_cards`, `financial_transfers` | **Adaptar** todo a `financial_*` — NO crear tablas genéricas |
| 4 | `FinancialTransaction = Tables<'financial_transactions'> & { agent? }` | tipo real OK | Mantener tipo; añadir `category?`/`bank?` en el join opcional si se expone |
| 5 | Parceiro `useFinanceBrokers` busca role `agent/manager/admin` en `profiles` | `profiles` real tiene esos roles | Compatible — solo confirmar filtro `tenant_id` |

---

## 3. Tablas reales PTOCH (verificadas 12/09)

- **`financial_transactions`** (0 filas): `id, tenant_id, name, type(income|expense), amount, category_id FK, bank_id FK, card_id FK, client_id FK, description, due_date, paid_date, is_realized, reference_id, reference_type, agent_id FK, date, source`.
- **`properties`** (17 filas): **tras TASK-017** ya tiene las 14 columnas de loteamiento+comisión (`loteamento, quadra, lote, matricula, topografia, preco_avista, preco_parcelado, entrada_valor, num_parcelas, valor_parcela, comissao_modalidade, comissao_porcentagem, comissao_valor_total, mes_a_receber JSONB`).
- **`financial_categories`** (19), **`financial_banks`** (8), **`financial_cards`** (0), **`financial_transfers`** (0).
- **`sales_records`** (3) → es el vínculo de cierre/venta real (NO existe tabla `contracts`).

---

## 4. Mapeo de funcionalidades del parceiro → destino nuestro

| Funcionalidad parceiro | Dónde queda en QUBITS | Nota |
|---|---|---|
| KPI `Receita Total` (income) | `Financeiro.tsx` top cards | Adaptar a `type='income'` + `tenant_id` |
| KPI `Despesas Totais` (expense) | IDEM | `type='expense'` |
| KPI `Saldo Previsto` (= ingresos−gastos) | IDEM | Cálculo en hook |
| Panel filtros (periodo/tipo/corretor) | `Financeiro.tsx` | Corretor = `agent_id` (JOIN profiles); tipo = `type`; período = `date` |
| Mód. Comisiones/Repasos (received/pending/expected/toPay/paid) | Añadir a `Financeiro.tsx` | Basado en `category` (vía categorías de comisión/repaso) + `is_realized`/`paid_date` |
| Gráfico VGV / flujo de caja (Recharts) | Añadir a `Financeiro.tsx` | Agrupar por mes en hook (Recharts ya en bundle) |
| Precificación doble + `mes_a_receber` (comisión fraccionada) | `Properties.tsx` (form modales) | Las 14 columnas YA existen en PTOCH |
| Botón Exportar (CSV/Excel) | `Financeiro.tsx` | CSV del resultado filtrado |

---

## 5. Estado & gestión (`use-financial.ts`)

- Mantener **React Query** (`@tanstack/react-query`) — ya es la lib del proyecto.
- `staleTime: 1000*60*2` (2 min) propuesto por el parceiro — adoptar.
- Todo query agregado debe **filtrar por `tenant_id`** (multi-tenant real de PTOCH) — el parceiro lo indica vía RLS, pero reforzarlo en el hook evita depender del servicio.

---

## 6. RLS (seguridad por fila)

- El parceiro propone policy `FOR ALL USING auth.role()='authenticated' AND tenant_id=...`.
- **Real PTOCH:** `financial_transactions` tiene policy `all_all_financial_transactions: ALL` (abierta). El resto usa patrón `*_service_all` / `all_all_*`.
- **Decisión:** NO tocar RLS en este sprint de clonación (riesgo de romper acceso). Registrar como pendiente de refuerzo RLS. Modelo funcional primero; endurecer seguridad en iteración posterior con OK de Rodrigo.

---

## 7. Criterios de aceptación (definition of done)

1. `npm run build` en `remodel-copy` **sin errores** (lógica de tipos coherente con tipos PTOCH).
2. Deploy TESTE (`teste-ahut-ecosystem.apexfyhub.com.br`) → módulo financiero renderiza con las 3 KPIs + tabla.
3. FLUXO funcional en TESTE: crear transacción income/expense con categoría y corretor; validar KPI se actualiza.
4. Precificación doble + comisión fraccionada en `Properties.tsx` (widget `mes_a_receber`) persiste en PTOCH (verificable por lectura de vuelta).
5. `// TODO` de nomenclatura: cero referencias a `category` texto / tablas `categories`/`banks` sin prefijo.
6. Regla WRITE-LAST: entrada en `CHANGELOG_APEXFY.md` + commit `remodel`.

---

## 8. Orden de ejecución sugerido

1. `use-financial.ts` — corregir filtro categoría: `category_id` → JOIN `financial_categories`. [bloqueante]
2. `Financeiro.tsx` — adaptar KPIs existentes + añadir Comisiones/Repasos + VGV (Recharts).
3. `Properties.tsx` — modal precificación doble + widget comisión fraccionada `mes_a_receber`.
4. Build TESTE → validación manual → PROD (solo tras OK).

---

## 9. Pendientes de decision (Rodrigo) — **RESUELTO 12/09**

- [x] **RLS financiera:** CERRADA en esta iteración (fecho policy `ALL` de `financial_transactions`, reemplazo por policies autenticadas con patrón tenant). _Decisión Rodrigo: SIM 12/09._
- [x] **`Financeiro.tsx` reemplaza a `SuperAdminFinancial.tsx`** en el front (fusión del parceiro sobre `Financeiro.tsx` destronca el de superadmin). _Decisión Rodrigo: SUBSTITUYE 12/09._
- [x] **`mes_a_receber` se genera por TRIGGER** al fechar venta (no se escribe a mano desde Properties). Diseñar trigger sobre el cierre de venta. _Decisión Rodrigo: TRIGGER 12/09._

---
## 10. Implementación (tras decisiones 12/09)

### 10.3 Trigger de cierre de venta — **IMPLEMENTADO y probado 12/09**
- **Diseño:** `trg_generar_financiero_venta` → `AFTER UPDATE OF stage ON sales_records`, dispara SOLO cuando `stage='Vendido' AND OLD IS DISTINCT FROM 'Vendido'` (idempotente; NO al INSERT — corrige la inconsistencia previa de propiedades `sold` con ventas no cerradas).
- **Genera transaccionalmente:**
  - `income` cobranza al cliente: `amount=sale_value`, `name='Venta <prop> - <buyer>'`, `reference_type='sales_record'`, `source='trigger_venta'`.
  - `expense` comisión SOLO si la propiedad define comisión: `valor_fixo`→`comissao_valor_total`; `porcentagem`→`sale_value*pct/100`; dividida en N cuotas según `mes_a_receber` (JSONB array). Sin config → NO genera gasto (no inventa montos).
- **Prueba real (rollback):** propiedad `ae8d93ca` (porcentagem, pct=NULL) → generó 1 income 20000.00, 0 comisión. ✅
- **Verificado por lectura de vuelta** + backup `audit_trigger_venta/before_20260913_002351/`.

### 10.1 RLS — **APLICADO y verificado 12/09**
- Dropeada `all_all_financial_transactions` (ALL, public). Reemplazada por 4 policies authenticated tenant-scoped (`tenant_id = get_my_tenant_id()`, patrón visits) + `financial_transactions_service_all` (service_role).
- Backup: `audit_rls_financiero/before_20260913_000254/`. Verificado: 0 policies public abiertas.

### 10.2 Front — **pendiente (decisión Rodrigo: SUBSTITUYE 12/09)**
- Fusionar funcionalidades del parceiro sobre `Financeiro.tsx` (KPI, Comisiones/Repasos, VGV/Recharts, Exportar) + `use-financial.ts`.
- **`Financeiro.tsx` SUBSTITUYE a `SuperAdminFinancial.tsx`** (distroncarlo del fluxo).
- Corregir bloqueante: filtro `category` texto → `category_id` (JOIN `financial_categories`).