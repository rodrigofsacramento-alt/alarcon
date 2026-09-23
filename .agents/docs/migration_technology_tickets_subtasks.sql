-- Migration CC-08 (23/09/2026): coluna subtasks na technology_tickets
-- Estrutura de cada subtask (item do array JSONB):
--   {id, title, status: 'pendente'|'em_andamento'|'validada'|'recusada',
--    validated_by, validated_at, comment}
-- ORDEM DE APLICAÇÃO: DEV (xmsulduzvufdzkfktovk) PRIMEIRO → Comandante valida
-- → só depois PROD (ptochsyoyatsydfysacc). NÃO aplicar no PROD sem OK explícito.
-- Sem alteração de RLS: a policy ALL existente já cobre a coluna nova.

ALTER TABLE public.technology_tickets
    ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]';

COMMENT ON COLUMN public.technology_tickets.subtasks IS
    'Subtasks do TCK (CC-08/ATEM): [{id,title,status:pendente|em_andamento|validada|recusada,validated_by,validated_at,comment}]';
