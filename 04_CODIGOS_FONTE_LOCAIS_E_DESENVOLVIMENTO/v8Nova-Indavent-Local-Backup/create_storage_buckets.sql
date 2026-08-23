-- =========================================================================
-- SCRIPT PARA CRIAR E CONFIGURAR OS BUCKETS DE STORAGE NO SUPABASE
-- =========================================================================

-- 1. Criar os buckets 'chat-attachments' e 'avatars' como públicos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('chat-attachments', 'chat-attachments', true, 52428800, NULL), -- 50MB
  ('avatars', 'avatars', true, 5242880, NULL) -- 5MB
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar leitura pública para 'chat-attachments'
CREATE POLICY "Permitir leitura publica de anexos" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'chat-attachments');

-- 3. Habilitar inserção/upload de anexos para o Broker (bypassa com service_role, mas garantimos para segurança)
CREATE POLICY "Permitir upload de anexos para autenticados" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat-attachments');

-- 4. Habilitar leitura pública para 'avatars'
CREATE POLICY "Permitir leitura publica de avatares" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'avatars');

-- 5. Habilitar inserção/upload de avatares
CREATE POLICY "Permitir upload de avatares para autenticados" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
