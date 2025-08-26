-- Script para adicionar colunas faltantes na tabela projects
-- Execute este script no SQL Editor do Supabase se você já tem dados na tabela

-- Adicionar colunas faltantes na tabela projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS client_type VARCHAR(20) DEFAULT 'base',
ADD COLUMN IF NOT EXISTS is_tecna_client BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_zendesk_admin BOOLEAN DEFAULT false;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY ordinal_position;