-- Script para inserir projetos padrões (templates)
-- Execute este script no SQL Editor do Supabase após executar add-is-template-column.sql

-- Inserir projetos padrões para diferentes cenários
INSERT INTO projects (name, description, client_type, is_tecna_client, has_zendesk_admin, is_template, status, total_hours, total_value) VALUES
('Template - Cliente Enterprise', 'Projeto padrão para clientes Enterprise com implementação completa', 'enterprise', false, true, true, 'template', 120, 18000.00),
('Template - Cliente Base', 'Projeto padrão para clientes Base com configuração básica', 'base', true, false, true, 'template', 80, 12000.00),
('Template - New Logo Completo', 'Projeto padrão para novos clientes com todos os produtos', 'new_logo', false, false, true, 'template', 160, 24000.00),
('Template - Migração Simples', 'Projeto padrão para migrações simples de plataforma', 'base', true, true, true, 'template', 60, 9000.00),
('Template - Implementação Avançada', 'Projeto padrão para implementações com customizações avançadas', 'enterprise', false, true, true, 'template', 200, 30000.00);

-- Verificar se os projetos foram inseridos
SELECT id, name, client_type, is_template, total_hours, total_value 
FROM projects 
WHERE is_template = true 
ORDER BY name;