# 🗂️ PLANO DE AÇÃO QUBITS™ — Agência HUT

> **Base:** o que **já está implantado** no sistema `ahut-ecosystem.apexfyhub.com.br` (Supabase PROD).
> Reconciliado contra: Cláusula 2.2 (6 fases), Anexo I (módulos), Anexo III (estra de aceleração 90 dias) do contrato `6be43a7f-...`.
> **Estado:** ✅ já implantado · 🟡 parcial · 🔧 próximo passo · 📅 a agendar (consultoría/trabajo humano)

---

## RESUMO EXECUTIVO

| Etapa QUBITS | Estado no sistema | Conclusão |
|---|---|---|
| 1 · Diagnóstico de Prioridade | ✅ Hecho (GAP REPORT + rediagnóstico) | Base estratégica lista |
| 2 · Plano de Implementação | 🔄 Este documento | A executar post-Fase 2 Chris |
| 3 · Aplicativo de Gestión Organizado | ✅ Alta adherencia (centro nervioso digital operativo) | Eje consolidado |
| 4 · Automações | 🟡 Parcial (auditoría·notif·follow-up; falta reportes/esteira) | Próximas semanas |
| 5 · Integração de IA | 🟡 Parcial (chat+funil+SQAD; falta analítica/preditiva) | Roadmap controlado |
| 6 · Operação Autônoma 24/7 | 🟡 Parcial (broker/worker; falta monitorización formal) | Consolidar |

---

## ETAPA 1 — DIAGNÓSTICO DE PRIORIDAD  ✅

Ya cubierta en el sistema:
- ✅ **GAP REPORT** (7 prioridades) — Dashboard, Financeiro e Leads conectados a datos reales.
- ✅ **Rediagnóstico** D1–D6 (leads inativos, gap de comissões junho, duplicidad 7.076.500, tema claro×dark, SDR sin prueba, flag lead inédito).
- ✅ **Normalización** de leads (39 + 170 unificados; auditoría diária automática).
- 📅 Revisión con consultora Chris (Fase 2) para validar priorización.

**Próximo paso (S1):** cerrar D1 (filtro de inativos) y D4 (parity de tema).

---

## ETAPA 2 — PLANO DE IMPLEMENTACIÓN  🔄

- ✅ Cronograma estratégico S1–S5 definido (estabilidad → financeiro → comercial → automação → IA).
- 🔧 Inicia formalmente tras la Modelagem de Procesos de Chris (Fase 2), como fija la cláusula.
- 📅 Calendario de ritos (daily + reuniões) — entregable Anexo III Sem 9.

---

## ETAPA 3 — APLICATIVO DE GESTIÓN ORGANIZADO  ✅⭐

**Centro nervioso digital operativo.** Lo que ya está implantado:

### Atendimento / WhatsApp
| Feature | Estado |
|---|---|
| Chat WhatsApp multi-agente (broker 24/7) | ✅ |
| Reproductor de áudio / imagen / video / documento | ✅ |
| **Funil de 13 estágios** (régua + data-binding) + injeção al LLM | ✅ |
| Ctrl+Enter / Ctrl+Space; legenda de lead (nombre+tel) | ✅ |
| Aba "Não Direccionados" / Não Lidas / refactor mobile | ✅ |
| **Follow-up WhatsApp agendado** + tags por usuario | ✅ |

### Imóveis (verticals)
| Feature | Estado |
|---|---|
| Módulo propiedad (USD/GS/BRL, modalidad, maps, valores reales) | ✅ |
| 6 inmuebles reals con `price` (sin valor_total fantasma) | ✅ |
| Filtra inativos en listado | 🟡 (revisar D1) |

### Propostas
| Feature | Estado |
|---|---|
| Painel **editável** (cliente/valor/pago/status/inmueble/corretor/notas) | ✅ |
| Tabla `commercial_proposals` (aditiva/RLS) + select price | ✅ |
| **Deeplinks** (lead→propiedad→corretor) + autoabrir inmueble | ✅ |

### Financeiro
| Feature | Estado |
|---|---|
| **Livro Geral** `/financeiro/livro` (extracto paginado+filtros+export) | ✅ |
| **Vendas & Imigração** `/financeiro/vendas` (KPIs + vendas) | ✅ |
| **Contas Bancárias** `/financeiro/contas` | ✅ |
| DFC + gráfico de faturamento com override controlado | ✅ |
| RLS/trigger de cierre de venta | ✅ |
| Conciliación comisiones junho (gap ~63,2M) | 🔧 S2 |

### Rankings / Metas / RH
| Feature | Estado |
|---|---|
| Ranking diagonal performance (7 días) + `/corretores` | ✅ |
| **Metas por corretor** (`corretor_metas` + RLS), global + excepción | ✅ |
| **RH** con organograma + **Matriz RACI** | ✅ |
| Perfiles reales (Jota, Chloe, Luciana, Sebastian, Igor, Rodrigo) | ✅ |

### Tecnología / Chamados / TAGs
| Feature | Estado |
|---|---|
| Módulo Chamados (kanban drag-drop + Ada IA + anexos) | ✅ |
| Solicitantes reales (AsyncCombobox) + fix tela branca | ✅ |
| PWA instalable | ✅ |
| ChunkErrorBoundary (fix tela branca rotas lazy) | ✅ |

**Mejoras propuestas (favorizando lo existente):**
- 🔧 Dashboard ejecutivo consolidado (cruce ventas × comisiones × metas × SDR) reutilizando hooks existentes.
- 🔧 Painel unificado de tareas del día por colaborador (hoy disperso).
- 📅 Polir PWA mobile (offline flow).

---

## ETAPA 4 — IMPLEMENTACIÓN DE AUTOMAÇÕES  🟡

### Ya implantado
| Automação | Estado |
|---|---|
| Auditoría diaria de leads (CRON 6h + leads-audit.py) | ✅ |
| Fallback de áudio (re-envío seguro al fallar) | ✅ |
| Notificaciones por trigger (nuevo lead / venta) + sonido/toast | ✅ |
| Follow-up WhatsApp agendado | ✅ |
| Worker **SDR** (resposta a leads inéditos) | ✅ online · 0 disparos |
| Inyección determinística del funil en LLM (`tutor_rag_ahut.py`) | ✅ |

### Próximos pasos (2–4 semanas)
| Automação | Acción | Sprint |
|---|---|---|
| Reporte financeiro periódico (diario/semanal) | Crear generador + disparo agendado | S4 |
| Esteira de conciliación de comisión de loteadora | Conectar a D2/D3 (regla de conciliación) | S2 |
| Validar esteira de estágio via eventos de agenda | Activar/gatillos existentes | S3 |
| Implantar CI/CD + rollback | Backup automático del código | Largo plazo |
| Probar disparo SDR controlado y liberarlo | Prova controlada (D5) | S3 |

---

## ETAPA 5 — INTEGRACIÓN DE IA EN EL SISTEMA  🟡

### Ya implantado
| Capacidad IA | Estado |
|---|---|
| Chat IA en Atendimento + funil 13 estágios (determinístico) | ✅ |
| **Ada IA** en Chamados/Tecnología | ✅ |
| **Squad de agentes** (Jarvis/Chief, AXIOM, ASIMOV, AEGIS, APOLLO) | ✅ |
| QUBITS: Living Graph Engine + gráfico de forças data-driven | ✅ |

### Próximos pasos (roadmap controlado)
| Caso de uso IA | Propuesta | Prioridad |
|---|---|---|
| Reporte financeiro dinámico (PT-BR) | IA que lee el ledger y genera insight bajo demanda | Alta |
| Insights predictivos de ventas | Previsão de cierre por corretor/inmueble (ranking+funil) | Media |
| Resumo diário automático | Digest de la operación vía chat | Media |
| Análisis de duplicidad asistida | Apoyo a conciliación de comisiones (D2/D3) | Media |

> ⚠️ **Governança:** el roadmap de **RAG semántico fue cancelado por orden del Comandante (09/09)** — mantener la capa determinística (tutor) y NO reabrir sin nueva decisión.

---

## ETAPA 6 — OPERACIÓN AUTÓNOMA 24/7 & MEJORA CONTINUA  🟡

### Ya implantado
| Pilar | Estado |
|---|---|
| Broker WhatsApp 24/7 (PM2, Supabase PROD) | ✅ |
| Worker SDR 24/7 | ✅ |
| Auditoría diária automática | ✅ |
| Observabilidad de deploy (parity MD5 2 docroots) | ✅ |
| Proceso pós-entrega con scorecard (gap analysis 80pts→nuevo agente) | ✅ |
| Skills auto-actualizadas de los agentes | ✅ |

### Próximos pasos
| Pilar | Mejora |
|---|---|
| Monitorización 24/7 | Dashboard/alertas de salud: broker, worker, Supabase, costos |
| Aprendizaje evolutivo formal | Loop tarea→skill→reuso |
| Optimización autónoma | Escalar gap-analysis automático |
| Resiliencia | CI/CD + rollback + canary en teste |

---

## 📌 CUMPLIMIENTO DE OBLIGACIONES A 90 DIAS (Anexo III) × LO IMPLANTADO

| Entregable Anexo III (Sem) | Estado en el sistema | Acción |
|---|---|---|
| S1 · Matriz de Funciones + DRE/Fluxo | ✅ RH/RACI + Livro Geral | — |
| S2 · Funil + Centralización de leads | ✅ Atendimento funil + leads centralizados | — |
| S3 · Matriz RACI de Liderazgo | ✅ RH RACI | — |
| S4 · POP 01+02 (Financeiro+Imigração) | 🟡 Livro Geral operativo; POP documental a redactar | 🔧 Documentar POPs |
| S5 · Script + POP Qualificação | 🟡 Script implícito en los flujos; formalizar | 🔧 POP Vendas |
| S6 · Dashboard de Métricas | ✅ Ranking/KPIs | — |
| S7 · Neuropsicología (equipo) | 📅 Sesiones humanas | — |
| S8 · Relatório de Adhesión | 🔧 Pendiente auditoría de conformidad | Crear |
| S9 · Ritos de Gestión | 📅 Calendario Daily/Reuniones | — |
| S10 · Relatório de Fechamento + Plano 9 Meses | 📅 Pendiente | Crear |
| **Día 90 · QUBITS™ operacional** | ✅ Operativo y usado | Consolidar |

---

## 💡 CONCLUSIÓN OPERATIVA

El sistema **ya cubre la práctica total del Anexo III** en su parte tecnológica (QUBITS™ está operativo, la equipe lo usa, automações básicas activas, KPIs visibles). Las obligaciones pendientes son mayoritariamente **trabajo empresarial/consultoría** (POPs documentales, sesiones neuro, ritos, relatório de fechamento) — no desarrollo técnico nuevo.

**Prioridad de ejecución:</strong> S1 (D1/D4) → S2 (conciliar junho) → S3 (probar SDR) → S4 (reporte periódico).

---
*Elaborado por Jarvis — Squad Tech Ahut (Hermes) · 21/09/2026*