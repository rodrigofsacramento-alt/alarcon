-- =========================================================================
-- MIGRACAO COMPLEMENTAR - PREVENCAO DE ERROS DO BROKER
-- =========================================================================

-- 1. Evitar crash de 'unread_count' na criacao de novas conversas
ALTER TABLE public.conversations 
  ADD COLUMN IF NOT EXISTS unread_count integer DEFAULT 0;

-- 2. Evitar crash de sincronizacao de foto de perfil e metadados
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
