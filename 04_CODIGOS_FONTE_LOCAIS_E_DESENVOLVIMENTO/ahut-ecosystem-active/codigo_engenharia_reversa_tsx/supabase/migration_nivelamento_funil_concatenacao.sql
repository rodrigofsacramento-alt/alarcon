-- ============================================================================
-- MIGRATION DE NIVELAMENTO — CONCATENAÇÃO DO FUNIL DE 12 ESTÁGIOS (PROD)
-- ============================================================================
-- Objetivo: deixar a estrutura do PROD nivelada ao desenho da diretriz QUBITS
--           (fonte única = leads.stage, rajada de 12 estágios; espelho ativo
--            em conversations.stage; demais módulos concatenam via FK).
--
-- ALVO: Supabase PROD ptochsyoyatsydfysacc
-- ESTADO: DESENHO PARA REVISÃO — NÃO EXECUTADO. Re v isar antes de rodar.
--
-- Alinhamento com o desenho já existente (migration_funil_data_binding.sql):
--   - triggers trg_lead_qualificado + trg_sync_conv_stage (já desenhados)
--   - constraint leads_stage_check (já desenhada) + índices
-- Este arquivo apenas COMPLETA o nivelamento: saneamento de dados + cols.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1) REGUA = FONTE ÚNICA. Define os 12 estágios canônicos (espelha ESTAGIOS_FUNIL do frontend)
-- ============================================================================
-- Os 12 nomes EXATOS (do frontend, ordem 1..12):
--   1 'Contato Cadastrado'
--   2 'Primeiro Atendimento / Qualificação'
--   3 'Qualificado'  (GATILHO: cria Lead / inicia o funil)
--   4 'Follow Up'
--   5 'Buscar Imóveis'
--   6 'Agendamento Visita/Reunião'
--   7 'Visita/Reunião Agendada'
--   8 'Match Pronto'
--   9 'Apresentar Imóveis'
--  10 'Imóvel Escolhido'
--  11 'Proposta Solicitada'
--  12 'Vendido'
-- O 'A Selecionar' é legado de migração nao nivelado -> normaliza para 'Contato Cadastrado'.

-- 1.1 Saneamento: 'A Selecionar' -> 'Contato Cadastrado' (estado atual = 9.313 leads)
UPDATE public.leads SET stage = 'Contato Cadastrado' WHERE stage = 'A Selecionar';

-- 1.2 Se a constraint antiga (11 valores) existir, recria com os 12 canônicos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_stage_check') THEN
    ALTER TABLE public.leads DROP CONSTRAINT leads_stage_check;
  END IF;
END $$;

ALTER TABLE public.leads ADD CONSTRAINT leads_stage_check CHECK (stage IN (
  'Contato Cadastrado',
  'Primeiro Atendimento / Qualificação',
  'Qualificado',
  'Follow Up',
  'Buscar Imóveis',
  'Agendamento Visita/Reunião',
  'Visita/Reunião Agendada',
  'Match Pronto',
  'Apresentar Imóveis',
  'Imóvel Escolhido',
  'Proposta Solicitada',
  'Vendido'
));

-- ============================================================================
-- 2) ELIMINAR REDUNDÂNCIAS de estágio dentro de LEADS (concatenar = 1 fonte só)
--    Hoje leads tem 3 campos de estagio: stage, current_stage, conversation_stage.
--    Manter apenas 'stage' (fonte única). current_stage/conversation_stage são
--    redundantes e NAO sao os 12 da régua.
-- ============================================================================
UPDATE public.leads SET stage = 'Contato Cadastrado' WHERE stage IS NULL OR stage = '';

-- 2.1 convergir dados antigos de current_stage p/ stage (valores mapeáveis)
UPDATE public.leads SET stage = 'Primeiro Atendimento / Qualificação'
 WHERE current_stage = 'Primeiro Atendimento' AND stage = 'Contato Cadastrado';

-- 2.2 remover as colunas redundantes (só depois do saneamento, numa fase separada)
-- ATENÇÃO: remoção de coluna é DESTRUTIVA. Manter comentado p/ decisão do usuário.
-- ALTER TABLE public.leads DROP COLUMN IF EXISTS current_stage;
-- ALTER TABLE public.leads DROP COLUMN IF EXISTS conversation_stage;

-- ============================================================================
-- 3) PROPOSTAS: nivelar o estágio à régua (hoje é int 0/3 -> texto da régua)
--    proposals.current_stage atualmente é integer (0,3). Falta coluna 'stage'
--    com os nomes da régua, espelhando o lead.
-- ============================================================================
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS stage TEXT;

UPDATE public.proposals p SET stage = L.stage
  FROM public.leads L WHERE L.id = p.lead_id;

-- 3.1 gatilho: quando lead avança p/ 'Proposta Solicitada', propaga p/ proposta
-- (desenho — revisar nome/necessidade antes de habilitar)
-- CREATE OR REPLACE FUNCTION public.sync_proposal_stage_from_lead() RETURNS TRIGGER LANGUAGE plpgsql AS $$
-- BEGIN
--   UPDATE public.proposals SET stage = NEW.stage
--    WHERE lead_id = NEW.id AND NEW.stage = 'Proposta Solicitada';
--   RETURN NEW;
-- END $$;
-- DROP TRIGGER IF EXISTS trg_sync_prop_stage ON public.leads;
-- CREATE TRIGGER trg_sync_prop_stage AFTER INSERT OR UPDATE OF stage ON public.leads
--   FOR EACH ROW WHEN (NEW.stage = 'Proposta Solicitada')
--   EXECUTE FUNCTION public.sync_proposal_stage_from_lead();

-- ============================================================================
-- 4) VENDAS (sales_records): derivar estágio via FK proposal_id/lead_id (sem coluna nova)
--    sales_records.proposal_id -> proposals.lead_id -> leads.stage
--    'Vendido' é alcançado quando existe sales_record, nao por coluna.
-- ============================================================================
-- (sem DDL — derivação é a nivelacao correta p/ vendas)

-- ============================================================================
-- 5) AGENDA/VISITS: decidir escopo (pendente). Hoje visits tem 'status'
--    (confirmed/scheduled/completed) próprio. Adicionar 'stage' espelho é OPCIONAL.
--    Deixar SEM mudança por padrao (evitar ambiguidade com status operacional).
-- ============================================================================

-- ============================================================================
-- ÍNDICES para a concatenação (reforço do data-binding já existente)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_stage          ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_conversations_stage  ON public.conversations(stage);
CREATE INDEX IF NOT EXISTS idx_proposals_lead_id    ON public.proposals(lead_id);
CREATE INDEX IF NOT EXISTS idx_proposals_stage      ON public.proposals(stage);
CREATE INDEX IF NOT EXISTS idx_sales_records_proposal_id ON public.sales_records(proposal_id);

COMMIT;

-- ============================================================================
-- NOTAS (nao executar agora):
--  * 1.1 sobrescreve 'A Selecionar' -> 'Contato Cadastrado' p/ os 9.313 leads.
--  * 2.2 (DROP COLUMN current_stage/conversation_stage) fica comentado: destrutivo.
--  * 3.1 gatilho de proposta comentado: revisar sem relatório se necessário.
--  * Section 5 (visits) sem mudanca: aguardar decisão do escopo.
-- ============================================================================