-- Adicionar coluna is_template à tabela projects
-- Execute este script no SQL Editor do Supabase

ALTER TABLE projects 
ADD COLUMN is_template BOOLEAN DEFAULT false;

-- Criar índice para melhor performance nas consultas de projetos template
CREATE INDEX idx_projects_is_template ON projects(is_template);

-- Comentário da coluna
COMMENT ON COLUMN projects.is_template IS 'Indica se o projeto é um template/padrão para ser usado como base';