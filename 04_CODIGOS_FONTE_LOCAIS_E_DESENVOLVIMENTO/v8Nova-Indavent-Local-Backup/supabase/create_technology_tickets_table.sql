-- Tabela para gerenciamento de chamados de tecnologia e atualizações do sistema
CREATE TABLE IF NOT EXISTS public.technology_tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    module TEXT DEFAULT 'Geral',
    priority TEXT NOT NULL CHECK (priority IN ('alta', 'media', 'baixa')),
    main_status TEXT NOT NULL CHECK (main_status IN ('a_executar', 'executando', 'executado')),
    subcategory TEXT NOT NULL CHECK (subcategory IN ('nao_especificado', 'em_planejamento', 'em_aplicacao', 'em_validacao', 'atualizado', 'backup_realizado')),
    delivery_forecast DATE,
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.technology_tickets ENABLE ROW LEVEL SECURITY;

-- Política de Leitura Pública / Autenticada
CREATE POLICY "Permitir leitura de chamados de tecnologia" ON public.technology_tickets
    FOR SELECT USING (true);

-- Política de Inserção / Atualização para Usuários Internos
CREATE POLICY "Permitir inserção e atualização de chamados" ON public.technology_tickets
    FOR ALL USING (true);
