CREATE OR REPLACE FUNCTION public.ros_assign(p_tenant uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ret      uuid;
    v_inicio   timestamptz := now() - interval '7 days';
BEGIN
    WITH agg AS (
        SELECT m.agent_id,
            (coalesce(m.interacciones,0) + 20*coalesce(m.vendas,0) + 10*coalesce(m.propuestas,0))::double precision AS pl,
            coalesce(m.sla_segundos,0)::double precision AS sla,
            (SELECT count(*) FROM public.leads l
              WHERE l.responsible_id = m.agent_id AND coalesce(l.is_active,true))::bigint AS abertos
        FROM public.dashboard_ranking_metricas(p_tenant, v_inicio, now()) m
        WHERE m.agent_id IS NOT NULL
          AND EXISTS (SELECT 1 FROM public.profiles pf
                      WHERE pf.id = m.agent_id AND pf.tenant_id = p_tenant
                        AND pf.role = 'agent' AND coalesce(pf.is_active,true))
    ), nrm AS (
        SELECT a.*,
               (SELECT max(pl) FROM agg) mpl, (SELECT max(sla) FROM agg) msla,
               (SELECT min(abertos) FROM agg) min_ab, (SELECT max(abertos) FROM agg) max_ab
        FROM agg a
    ), scored AS (
        SELECT agent_id,
            0.40*coalesce(nullif(pl,0)/nullif(mpl,0),0)
          + 0.30*(1 - coalesce(nullif(sla,0)/nullif(msla,0),0))
          + 0.30*(1.0/(abertos+1)) AS score
        FROM nrm
        ORDER BY score DESC
    ), best AS (SELECT agent_id FROM scored LIMIT 1)
    SELECT COALESCE(b.agent_id, (SELECT id FROM public.profiles
                  WHERE tenant_id=p_tenant AND role='admin' AND coalesce(is_active,true)
                    AND (email ILIKE '%igor%' OR full_name ILIKE '%igor%') LIMIT 1))
    INTO v_ret FROM best b;
    RETURN v_ret;
END;
$function$

