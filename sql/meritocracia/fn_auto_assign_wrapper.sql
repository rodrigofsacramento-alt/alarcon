CREATE OR REPLACE FUNCTION public.fn_auto_assign_wrapper()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_agent uuid;
BEGIN
    IF NEW.agent_id IS NOT NULL THEN RETURN NEW; END IF;
    v_agent := public.ros_assign(NEW.tenant_id);
    IF v_agent IS NOT NULL THEN NEW.agent_id := v_agent; END IF;
    RETURN NEW;
END;
$function$

