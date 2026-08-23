-- =========================================================================
-- CORREÇÃO DA TABELA ORCAMENTOS - ADIÇÃO DA COLUNA 'CODIGO'
-- Executar no SQL Editor do Supabase da Nova Indavent
-- =========================================================================

-- 1. Adicionar coluna 'codigo' na tabela 'orcamentos' se não existir
ALTER TABLE public.orcamentos 
  ADD COLUMN IF NOT EXISTS codigo text;

-- 2. Recarregar o cache de esquemas do PostgREST do Supabase para aplicar a mudança imediatamente
NOTIFY pgrst, 'reload schema';
