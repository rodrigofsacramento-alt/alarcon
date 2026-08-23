-- schema.sql
-- Run this in the Supabase SQL Editor

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
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

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'INITIATED',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_status ON assessments(status);

CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    question_text TEXT,
    tool_name VARCHAR(50) NOT NULL,
    answer_option VARCHAR(10),
    answer_value INTEGER,
    response_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_responses_assessment_id ON responses(assessment_id);
CREATE INDEX idx_responses_tool_name ON responses(tool_name);

CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL UNIQUE REFERENCES assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    disc_d DECIMAL(5,2),
    disc_i DECIMAL(5,2),
    disc_s DECIMAL(5,2),
    disc_c DECIMAL(5,2),
    disc_primary VARCHAR(10),
    disc_secondary VARCHAR(10),
    mbti_type VARCHAR(4),
    mbti_e_i DECIMAL(5,2),
    mbti_s_n DECIMAL(5,2),
    mbti_t_f DECIMAL(5,2),
    mbti_j_p DECIMAL(5,2),
    big_five_openness DECIMAL(5,2),
    big_five_conscientiousness DECIMAL(5,2),
    big_five_extraversion DECIMAL(5,2),
    big_five_agreeableness DECIMAL(5,2),
    big_five_neuroticism DECIMAL(5,2),
    ancoras_tecnica DECIMAL(5,2),
    ancoras_gerencial DECIMAL(5,2),
    ancoras_autonomia DECIMAL(5,2),
    ancoras_seguranca DECIMAL(5,2),
    ancoras_criatividade DECIMAL(5,2),
    ancoras_servico DECIMAL(5,2),
    ancoras_desafio DECIMAL(5,2),
    ancoras_equilibrio DECIMAL(5,2),
    opq_scores JSONB,
    valores_autotranscendencia DECIMAL(5,2),
    valores_autopromoacao DECIMAL(5,2),
    valores_conservacao DECIMAL(5,2),
    valores_abertura DECIMAL(5,2),
    swot JSONB,
    confidence_score DECIMAL(5,2),
    validation_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_results_user_id ON results(user_id);
CREATE INDEX idx_results_assessment_id ON results(assessment_id);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    pdf_url VARCHAR(500),
    html_url VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_assessment_id ON reports(assessment_id);
