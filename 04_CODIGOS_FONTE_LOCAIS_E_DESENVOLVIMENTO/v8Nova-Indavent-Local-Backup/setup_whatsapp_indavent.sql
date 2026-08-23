-- 1. Criação das tabelas base (Fantasma) para compatibilidade do Broker
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  full_name text,
  phone text
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  client_id uuid REFERENCES public.profiles(id),
  last_message_at timestamptz
);

-- Funções dummy de RLS para evitar erro no SQL
CREATE OR REPLACE FUNCTION public.get_my_tenant_id() RETURNS uuid AS $$
BEGIN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.auto_set_tenant_id() RETURNS trigger AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Criação das Tabelas do WhatsApp Broker
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_name text NOT NULL DEFAULT 'default',
  phone_number text,
  status text NOT NULL DEFAULT 'disconnected',
  qr_code text,
  qr_expires_at timestamptz,
  auth_info jsonb DEFAULT '{}',
  last_connected_at timestamptz,
  last_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, session_name)
);

CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  remote_jid text,
  remote_jid_alt text,
  phone_number text NOT NULL,
  name text,
  profile_pic_url text,
  profile_pic_status text NOT NULL DEFAULT 'pending',
  profile_pic_last_attempt_at timestamptz,
  profile_pic_last_success_at timestamptz,
  profile_pic_error text,
  profile_pic_attempts integer NOT NULL DEFAULT 0,
  is_group boolean DEFAULT false,
  is_business boolean DEFAULT false,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, phone_number)
);

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  whatsapp_session_id uuid REFERENCES public.whatsapp_sessions(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  remote_jid text NOT NULL,
  from_me boolean DEFAULT false,
  message_type text NOT NULL DEFAULT 'text',
  content text,
  media_url text,
  media_mime_type text,
  media_file_name text,
  media_size integer,
  whatsapp_message_id text,
  canonical_remote_jid text,
  source_event_type text,
  processing_status text NOT NULL DEFAULT 'processed',
  processing_error text,
  media_status text NOT NULL DEFAULT 'none',
  retry_count integer NOT NULL DEFAULT 0,
  status text DEFAULT 'sent',
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(whatsapp_session_id, whatsapp_message_id)
);

CREATE TABLE IF NOT EXISTS public.whatsapp_message_processing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  whatsapp_session_id uuid REFERENCES public.whatsapp_sessions(id) ON DELETE CASCADE,
  whatsapp_message_id text NOT NULL,
  remote_jid text NOT NULL,
  canonical_remote_jid text,
  direction text NOT NULL,
  event_type text,
  message_type text NOT NULL DEFAULT 'text',
  status text NOT NULL DEFAULT 'processing',
  media_status text NOT NULL DEFAULT 'none',
  attempts integer NOT NULL DEFAULT 1,
  error text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  UNIQUE(whatsapp_session_id, whatsapp_message_id)
);

CREATE TABLE IF NOT EXISTS public.whatsapp_broker_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  whatsapp_session_id uuid REFERENCES public.whatsapp_sessions(id) ON DELETE CASCADE,
  session_name text NOT NULL DEFAULT 'default',
  status text NOT NULL DEFAULT 'unknown',
  broker_pid integer,
  last_event_at timestamptz,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (whatsapp_session_id)
);

-- INSERIR UM TENANT PADRAO PARA O BROKER DA INDAVENT USAR
INSERT INTO public.tenants (name) VALUES ('Nova Indavent') ON CONFLICT DO NOTHING;
