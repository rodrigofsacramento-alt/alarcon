-- ============================================================
-- Migração: Integração WhatsApp (Evolution/Baileys Broker)
-- Preserva os dados existentes de whatsapp_messages
-- ============================================================

-- 1. TABELA whatsapp_sessions
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name text NOT NULL DEFAULT 'default',
  phone_number text,
  status text NOT NULL DEFAULT 'disconnected', -- 'disconnected', 'connecting', 'qr_ready', 'connected', 'error'
  qr_code text,
  qr_expires_at timestamptz,
  auth_info jsonb DEFAULT '{}',
  last_connected_at timestamptz,
  last_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_name)
);

-- RLS (simplificado sem tenant_id, todo autenticado tem acesso total provisório para facilitar)
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public sessions access" ON public.whatsapp_sessions;
CREATE POLICY "Public sessions access" ON public.whatsapp_sessions FOR ALL USING (auth.role() = 'authenticated');


-- 2. TABELA whatsapp_contacts
CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  remote_jid text,
  phone_number text NOT NULL,
  name text,
  profile_pic_url text,
  is_group boolean DEFAULT false,
  is_business boolean DEFAULT false,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(phone_number)
);

ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public contacts access" ON public.whatsapp_contacts;
CREATE POLICY "Public contacts access" ON public.whatsapp_contacts FOR ALL USING (auth.role() = 'authenticated');


-- 3. ALTERAR whatsapp_messages (Preservando dados)
-- Adiciona colunas que faltam
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS whatsapp_session_id uuid REFERENCES public.whatsapp_sessions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS remote_jid text,
  ADD COLUMN IF NOT EXISTS from_me boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS media_url text,
  ADD COLUMN IF NOT EXISTS media_mime_type text,
  ADD COLUMN IF NOT EXISTS media_file_name text,
  ADD COLUMN IF NOT EXISTS media_size integer,
  ADD COLUMN IF NOT EXISTS whatsapp_message_id text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent', -- 'pending', 'sent', 'delivered', 'read', 'failed'
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Garantir indexes úteis
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status, from_me, timestamp);
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_messages_wid_unique ON public.whatsapp_messages(whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL;

-- 4. HABILITAR REALTIME
-- Habilitar replicação lógica para tabelas específicas
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_sessions;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
COMMIT;
