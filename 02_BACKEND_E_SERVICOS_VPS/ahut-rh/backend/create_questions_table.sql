-- Run this in the Supabase SQL Editor to add the questions table

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name VARCHAR(50) NOT NULL,
    question_number INTEGER NOT NULL,
    text TEXT NOT NULL,
    options JSONB,
    construct VARCHAR(50),
    is_inverse BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_tool_name ON questions(tool_name);
