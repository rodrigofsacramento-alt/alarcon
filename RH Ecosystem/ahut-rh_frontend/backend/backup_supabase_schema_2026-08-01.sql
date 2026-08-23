-- ============================================================
-- BACKUP DA ESTRUTURA DO SUPABASE
-- Data: 2026-08-01
-- Projeto: Antigravity Behavioral Platform
-- ============================================================
--
-- IMPORTANTE: Este arquivo documenta a estrutura ESPERADA pelo
-- código-fonte (schema.sql original) E o mapeamento real feito
-- pela camada RHTableWrapper em db_service.py.
--
-- O código Python usa nomes genéricos (ex: "users", "assessments")
-- mas o RHTableWrapper traduz para os nomes reais do Supabase:
--
--   Código             → Tabela Real no Supabase
--   ─────────────────────────────────────────────
--   "users"            → rh_users
--   "assessments"      → rh_behavioral_assessments
--   "responses"        → rh_behavioral_responses
--   "results"          → rh_behavioral_results
--   "questions"        → rh_behavioral_questions
--   "reports"          → rh_behavioral_reports
--
-- ============================================================

-- ============================================================
-- TABELA: rh_users (mapeada de "users")
-- ============================================================
-- Estrutura ESPERADA pelo schema.sql original:
CREATE TABLE IF NOT EXISTS rh_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,   -- ⚠️ PODE NÃO EXISTIR NO BANCO REAL
    full_name VARCHAR(255),                 -- ⚠️ PODE SER "name" NO BANCO REAL
    phone VARCHAR(20),
    company VARCHAR(255),
    department VARCHAR(255),
    role VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB
);

-- ============================================================
-- TABELA: rh_behavioral_assessments (mapeada de "assessments")
-- ============================================================
CREATE TABLE IF NOT EXISTS rh_behavioral_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rh_users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'INITIATED',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- ============================================================
-- TABELA: rh_behavioral_questions (mapeada de "questions")
-- ============================================================
-- Colunas confirmadas pelo seed_full_database.py (inserção funcional):
CREATE TABLE IF NOT EXISTS rh_behavioral_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name VARCHAR(50) NOT NULL,        -- DISC, MBTI, BIG_FIVE, ANCORAS, OPQ, VALORES
    question_number INTEGER,
    text TEXT NOT NULL,
    options JSONB,                          -- Array de {id, text, construct, value}
    construct VARCHAR(100),
    is_inverse BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- TABELA: rh_behavioral_responses (mapeada de "responses")
-- ============================================================
CREATE TABLE IF NOT EXISTS rh_behavioral_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES rh_behavioral_assessments(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    question_text TEXT,
    tool_name VARCHAR(50) NOT NULL,
    answer_option VARCHAR(10),
    answer_value INTEGER,
    response_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- ============================================================
-- TABELA: rh_behavioral_results (mapeada de "results")
-- ============================================================
CREATE TABLE IF NOT EXISTS rh_behavioral_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL UNIQUE REFERENCES rh_behavioral_assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES rh_users(id) ON DELETE CASCADE,
    -- DISC
    disc_d DECIMAL(5,2),
    disc_i DECIMAL(5,2),
    disc_s DECIMAL(5,2),
    disc_c DECIMAL(5,2),
    disc_primary VARCHAR(10),
    disc_secondary VARCHAR(10),
    -- MBTI
    mbti_type VARCHAR(4),
    mbti_e_i DECIMAL(5,2),
    mbti_s_n DECIMAL(5,2),
    mbti_t_f DECIMAL(5,2),
    mbti_j_p DECIMAL(5,2),
    -- Big Five
    big_five_openness DECIMAL(5,2),
    big_five_conscientiousness DECIMAL(5,2),
    big_five_extraversion DECIMAL(5,2),
    big_five_agreeableness DECIMAL(5,2),
    big_five_neuroticism DECIMAL(5,2),
    -- Âncoras de Carreira
    ancoras_tecnica DECIMAL(5,2),
    ancoras_gerencial DECIMAL(5,2),
    ancoras_autonomia DECIMAL(5,2),
    ancoras_seguranca DECIMAL(5,2),
    ancoras_criatividade DECIMAL(5,2),
    ancoras_servico DECIMAL(5,2),
    ancoras_desafio DECIMAL(5,2),
    ancoras_equilibrio DECIMAL(5,2),
    -- OPQ
    opq_scores JSONB,
    -- Valores (adicionadas via ALTER TABLE em 2026-08-01)
    valores_autotranscendencia DECIMAL(5,2),
    valores_autopromoacao DECIMAL(5,2),
    valores_conservacao DECIMAL(5,2),
    valores_abertura DECIMAL(5,2),
    -- SWOT (adicionada via ALTER TABLE em 2026-08-01)
    swot JSONB,
    -- Meta
    confidence_score DECIMAL(5,2),
    validation_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- ============================================================
-- TABELA: rh_behavioral_reports (mapeada de "reports")
-- ============================================================
CREATE TABLE IF NOT EXISTS rh_behavioral_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES rh_behavioral_assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES rh_users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content TEXT,                           -- JSON completo dos relatórios de IA
    pdf_url VARCHAR(500),
    html_url VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_rh_users_email ON rh_users(email);
CREATE INDEX IF NOT EXISTS idx_rh_assessments_user_id ON rh_behavioral_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_rh_assessments_status ON rh_behavioral_assessments(status);
CREATE INDEX IF NOT EXISTS idx_rh_responses_assessment_id ON rh_behavioral_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_rh_responses_tool_name ON rh_behavioral_responses(tool_name);
CREATE INDEX IF NOT EXISTS idx_rh_results_user_id ON rh_behavioral_results(user_id);
CREATE INDEX IF NOT EXISTS idx_rh_results_assessment_id ON rh_behavioral_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_rh_reports_user_id ON rh_behavioral_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_rh_reports_assessment_id ON rh_behavioral_reports(assessment_id);

-- ============================================================
-- QUERY DIAGNÓSTICA: Execute no Supabase SQL Editor para
-- revelar as colunas REAIS de cada tabela
-- ============================================================
/*
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN (
    'rh_users',
    'rh_behavioral_assessments',
    'rh_behavioral_questions',
    'rh_behavioral_responses',
    'rh_behavioral_results',
    'rh_behavioral_reports'
)
ORDER BY table_name, ordinal_position;
*/
