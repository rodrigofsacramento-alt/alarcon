-- =========================================================================
-- MIGRACAO PARA O NOVO MODELO DO BROKER (INDAVENT -> PADRAO IMOBILIARIA)
-- Rode este script no Editor SQL do seu painel do Supabase da Nova Indavent
-- =========================================================================

-- 1. Atualizando a tabela 'conversations' com os campos exigidos
ALTER TABLE public.conversations 
  ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Criando a tabela 'messages' (Usada pelo front-end do CRM)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  content text,
  message_type text DEFAULT 'text',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. Criando a tabela 'group_participants' (Para evitar erros com grupos)
CREATE TABLE IF NOT EXISTS public.group_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  group_id text NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(group_id, profile_id)
);

-- 4. Opcional: Flexibilizando campos legados em 'whatsapp_messages'
-- Caso sua tabela antiga exija esses campos como NOT NULL, isso evita que quebre.
DO $$ 
BEGIN
  ALTER TABLE public.whatsapp_messages ALTER COLUMN phone DROP NOT NULL;
  ALTER TABLE public.whatsapp_messages ALTER COLUMN sender_name DROP NOT NULL;
  ALTER TABLE public.whatsapp_messages ALTER COLUMN type DROP NOT NULL;
  ALTER TABLE public.whatsapp_messages ALTER COLUMN "timestamp" DROP NOT NULL;
EXCEPTION
  WHEN undefined_column THEN 
    -- Se a coluna já não existir, ignora o erro
    NULL;
END $$;
