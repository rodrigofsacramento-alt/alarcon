# Meritocracia — Distribución de leads por ranking (7 días)

Estado vigente en producción para el tenant Ahut Encarnacion (`fa440b34`).

## Regla activa (confirmada en la BD live, 14/09/2026)

- **Fuente de métricas**: función `dashboard_ranking_metricas(tenant, inicio, fin)`
  (NO usar `v_dashboard_ranking` — devuelve valores distintos).
- **Período**: ranking actual dentro de los últimos **7 días**
  (`v_inicio = now() - interval '7 days'`).
- **Sin cap rígido**: no existe límite duro de 15 leads abiertos (removido y validado).
- **Score ponderado**:
  `0.40·PL + 0.30·(1−SLA_norm) + 0.30·(1/(abiertos+1))`
  - PL = interacciones + 20·vendas + 10·propuestas
  - SLA = segundos de respuesta (menor = mejor)
  - Carga = inverso de leads abiertos activos
- **Fallback**: admin con email/nombre `igor` si no hay agentes elegibles.

## Activación dinámica

La meritocracia opera automáticamente vía trigger en `conversations`:

```
conversations → BEFORE INSERT + BEFORE UPDATE (cuando agent_id IS NULL)
  → fn_auto_assign_wrapper() → ros_assign(NEW.tenant_id)
```

La cadena conduce al mejor corredor por score cada vez que entra una conversación
sin agente asignado. No requiere intervención manual.

## Decisiones del usuario (verbatim)

- *"certo vamo manter o anterior"* → gate 7% NO implementado; se mantiene ranking 7 días sin cap.
- *"qe e medianteo el ranking atual dentro del periodo de 7 dias"* → base del reparto = ranking 7 días.
- *"perfeito agora aplique ela de forma dinamica deixe ativa, faca commit e suba el deploy no teste"* → aplicación actual.

## Archivos

- `ros_assign.sql` — función de asignación (fuente autoritativa, extraída de la BD).
- `fn_auto_assign_wrapper.sql` — wrapper invocado por el trigger.
- Gate 7% / >70 contatos: documentado en `/opt/data/PLAN_MERITOCRACIA_7PCT_70CONTATOS.md` (NO aplicado).
- Backup pre-remoção del cap: `/opt/data/backups/ros_assign_BEFORE_remove_cap_20260914_041107.sql`.