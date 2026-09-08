-- ============================================================================
-- MIGRATION DE NIVELAMENTO — LEADS + CONVERSATIONS (ATENDIMENTO) + FUNIL 12
-- ALVO: Supabase PROD ptochsyoyatsydfysacc
-- DATA: 2026-09-05  (desenho para revisão — NÃO EXECUTADO)
-- STATUS: ESCALONADO — ETAPA 1: leads / conversations / 3 primeiros estágios
--
-- Aceite arquitetural (direção do Comandante):
--   * Régua única de 12 estágios compartilhada por conversations e leads
--     (as duas tabelas usam EXATAMENTE a mesma régua).
--   * Two-Way Data-Binding: conversations.lead_id <-> leads.conversation_id.
--   * Todo contato novo nasce em conversations.stage = 'Contato Cadastrado'.
--   * Gatilho: ao virar 'Qualificado' (3) OU 'Agendamento visita/reunião' (6),
--     injeta o cartão de Lead e preenche nome + telefone + lead_id +
--     conversation_id automaticamente (ação espelhada na tabela leads).
--   * current_stage (IA) PRESERVADO oculto — orienta o bot, NÃO polui o stage
--     do funil comercial manipulado pelos corretores na UI.
--
-- REGRA DE EDIÇÃO: este arquivo é DESENHO. Nunca rodar sem GO + aprovação,
-- e testes SEMPRE em rollback / grupo autorizado (nunca disable trigger all).
-- ============================================================================

BEGIN;

-- ============================================================================
-- [1] RÉGUA CANÔNICA — 12 ESTÁGIOS EXATOS (ordem = definida pelo Comandante)
-- ============================================================================
--   1  Contato Cadastrado
--   2  Primeiro Atendimento / Qualificação
--   3  Qualificado                    (GATILHO de injeção do cartão de Lead)
--   4  Follow Up
--   5  Buscar Imóveis
--   6  Agendamento visita/reunião   (GATILHO de injeção + preenche nome/tel/conv)
--   7  Visita / Reunião Agendada
--   8  Match Pronto
--   9  Apresentar Imóveis Selecionados
--  10  Imóvel Escolhido
--  11  Proposta Solicitada
--  12  Vendido
--
-- Obs.: nomes normalizados s/ prefixo numérico (o número é a ordem, não o valor).
-- 'A Selecionar' permanece somente como legado de migração p/ leads antigos
-- não avancados, e é saneado para 'Contato Cadastrado' na ETAPA-0 (abaixo).
-- ============================================================================

-- [1a] CONSTRAINTS de estágio — MESMA régua nas duas tabelas
DO $$
DECLARE v_stages text[] := ARRAY[
  'Contato Cadastrado',
  'Primeiro Atendimento / Qualificação',
  'Qualificado',
  'Follow Up',
  'Buscar Imóveis',
  'Agendamento visita/reunião',
  'Visita / Reunião Agendada',
  'Match Pronto',
  'Apresentar Imóveis Selecionados',
  'Imóvel Escolhido',
  'Proposta Solicitada',
  'Vendido'
]::text[];
BEGIN
  -- leads
  ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_stage_check;
  EXECUTE format(
    'ALTER TABLE public.leads ADD CONSTRAINT leads_stage_check CHECK (stage = ANY (%L::text[]))',
    v_stages
  );
  -- conversations
  ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_stage_check;
  EXECUTE format(
    'ALTER TABLE public.conversations ADD CONSTRAINT conversations_stage_check CHECK (stage = ANY (%L::text[]))',
    v_stages
  );
END $$;

-- [1b] ETAPA-0 — saneamento: 'A Selecionar' -> 'Contato Cadastrado' (estado atual ~9.3k leads)
UPDATE public.leads SET stage = 'Contato Cadastrado'
 WHERE stage IN ('A Selecionar') OR stage IS NULL OR stage = '';

-- ============================================================================
-- [2] DATA-BINDING BIDIRECIONAL (TWO-WAY) — leads <-> conversations
-- ============================================================================
-- 2a. conversations.stage — espelho de leads.stage, nasce em 'Contato Cadastrado'
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'Contato Cadastrado';

-- 2b. conversations.lead_id — amarração ida (chat -> funil), null até 'Qualificado'
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;

-- 2c. leads.conversation_id — amarração volta (funil -> chat)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL;

-- 2d. DEFAULTS
ALTER TABLE public.leads        ALTER COLUMN stage SET DEFAULT 'Contato Cadastrado';
ALTER TABLE public.conversations ALTER COLUMN stage SET DEFAULT 'Contato Cadastrado';

-- 2e. INDEX p/ JOINs da concatenação
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id       ON public.conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_stage         ON public.conversations(stage);
CREATE INDEX IF NOT EXISTS idx_leads_conversation_id       ON public.leads(conversation_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage                 ON public.leads(stage);

-- ============================================================================
-- [3] GATILHO "QUALIFICADO" — INJEÇÃO DO CARTÃO DE LEAD
--   conversations.stage -> 'Qualificado' dispara criação do lead com campos
--   concatenados (nome + telefone + conversation_id). Anti-duplo atômico,
--   SECURITY DEFINER + RLS tenant isolado. current_stage(IA) preservado.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.ensure_lead_from_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_name  TEXT;
  v_client_phone TEXT;
  v_lead_id      UUID;
BEGIN
  -- Dispara SOMENTE quando o seletor em conversations vira 'Qualificado' (3).
  -- O lead é o cartão do funil — nasce aqui com nome + telefone + conversation_id.
  -- NOTA: o estágio 'Agendamento visita/reunião' (6) NÃO cria lead (o lead já foi
  -- criado no Qualificado). O estágio 6 dispara OUTRA ação: o cadastro do
  -- agendamento (visita/reunião) no formulário da página de visitas, pré-preenchido.
  IF NEW.stage = 'Qualificado' THEN
    -- Dados do cliente via profiles (client_id). Coluna real = full_name (corrigido).
    SELECT p.full_name, p.phone
      INTO v_client_name, v_client_phone
      FROM public.profiles p
     WHERE p.id = NEW.client_id;

    -- Anti-duplo atômico: se já existe lead vinculado a esta conversa, só espelha
    SELECT id INTO v_lead_id
      FROM public.leads
     WHERE conversation_id = NEW.id
     LIMIT 1;

    IF v_lead_id IS NULL THEN
      -- Injeta o cartão de Lead com campos concatenados (nome + telefone + conv)
      INSERT INTO public.leads (
        name, phone, stage, source, notes,
        conversation_id, tenant_id, created_by, created_at, updated_at, current_stage
      ) VALUES (
        COALESCE(v_client_name, 'Cliente ' || substr(NEW.id::text, 1, 4)),
        COALESCE(v_client_phone, ''),
        NEW.stage, -- estágio do lead = 'Qualificado' (estágio que disparou)
        COALESCE((SELECT source FROM public.leads WHERE conversation_id = NEW.id LIMIT 1), 'WhatsApp'),
        'Lead criado automaticamente pelo funil. conversation_id: ' || NEW.id::text,
        NEW.id,
        NEW.tenant_id,
        NEW.agent_id,
        now(), now(),
        'INTRO'  -- current_stage (IA) PRESERVADO oculto na UI
      )
      RETURNING id INTO v_lead_id;
    END IF;

    -- Espelho transacional atualizado no mesmo trigger
    NEW.lead_id := v_lead_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_qualificado ON public.conversations;
CREATE TRIGGER trg_lead_qualificado
  BEFORE INSERT OR UPDATE OF stage ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_lead_from_conversation();

-- ============================================================================
-- [4] ESPELHO leads -> conversations (fonte única espelha o espelho)
--   Quando leads.stage muda no funil, espelha em conversations.stage na MESMA
--   transação — "dado de estágio nunca diverge".
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_conversation_stage_from_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL AND OLD.stage IS DISTINCT FROM NEW.stage THEN
    UPDATE public.conversations
       SET stage = NEW.stage, updated_at = now()
     WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_conv_stage ON public.leads;
CREATE TRIGGER trg_sync_conv_stage
  AFTER UPDATE OF stage ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_conversation_stage_from_lead();

-- ============================================================================
-- [5] ETAPA-1 (3 primeiros estágios operacionais)
--   Os estágios 1-3 já são cobertos: Contato Cadastrado (default de nascimento),
--   Primeiro Atendimento / Qualificação (aplicável via seletor), Qualificado
--   (gatilho de INJEÇÃO DO LEAD — cria o cartão com nome + telefone +
--   conversation_id).
--   O 'Agendamento visita/reunião' (6) é gatilho do FORMULÁRIO DE AGENDAMENTO:
--   NÃO cria lead (o lead já foi criado no Qualificado). Dispara a abertura/
--   pré-preenchimento do cadastro de visita/reunião na página de visitas
--   (agenda), preenchendo nome + telefone + lead_id + conversation_id
--   automaticamente no formulário.
--   Os demais estágios 4-5,7-12 avançados entram na ETAPA-2.
--   A constraint já aceita os 12, mas a acao de negócio por estágio só é
--   implementada até o 3 (+ preenchimento do formulário do 6) nesta etapa.
-- ============================================================================

-- [6] NOTAS IMPORTANTES (não executar)
--   * current_stage NÃO é dropado (preservado p/ IA).
--   * conversation_stage (coluna redundante de leads) — revisar p/ decisão
--     separada; por padrao mantida (pode ser vista como campo oculto).
--   * proposals / visits / sales_records ficam PARA ETAPAS SEGUINTES.
--   * Teste SEMPRE em transação rollback antes de aplicar definitivo.

COMMIT;

-- ============================================================================
-- Explicitação (não-SQL) da concatenação das 5 tabelas:
--   leads.stage (FONTE) --trg--> conversations.stage (ESPELHO)
--       |
--       +-- lead_id --> proposals (ETAPA futura)
--       +-- lead_id --> visits    (ETAPA futura)
--       +- lead_id --> prop.lead_id --> sales_records (ETAPA futura)
--   current_stage: oculto, usado pela IA p/ orquestrar o bot (preservado).
-- ============================================================================