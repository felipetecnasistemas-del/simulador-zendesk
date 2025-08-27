-- Migração para adicionar funcionalidade de usuários
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna user_id na tabela projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Inserir alguns usuários de exemplo (opcional)
INSERT INTO users (name, email) VALUES 
('Administrador', 'admin@tecnasistemas.com.br'),
('Felipe Tecna', 'felipe@tecnasistemas.com.br'),
('Suporte Tecna', 'suporte@tecnasistemas.com.br')
ON CONFLICT (email) DO NOTHING;

-- Comentários
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON COLUMN users.name IS 'Nome completo do usuário';
COMMENT ON COLUMN users.email IS 'Email único do usuário';
COMMENT ON COLUMN projects.user_id IS 'Referência ao usuário responsável pelo projeto';