-- Script para implementar a nova arquitetura
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar colunas de agentes na tabela scope_items (se não existirem)
ALTER TABLE scope_items 
ADD COLUMN IF NOT EXISTS agents_10 INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agents_20 INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agents_40 INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agents_70 INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agents_100 INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS agents_more INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS response_type VARCHAR(20) DEFAULT 'numeric';

-- 2. Adicionar coluna agents_count na tabela projects (se não existir)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS agents_count INTEGER DEFAULT 0;

-- 3. Criar a tabela project_scope_items (que estava faltando)
CREATE TABLE IF NOT EXISTS project_scope_items (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  scope_item_id INTEGER REFERENCES scope_items(id) ON DELETE CASCADE,
  -- Valores específicos calculados para este projeto
  calculated_hours INTEGER NOT NULL DEFAULT 0,
  calculated_minutes INTEGER NOT NULL DEFAULT 0,
  calculated_value DECIMAL(10,2) DEFAULT 0.00,
  quantity INTEGER DEFAULT 1, -- Quantidade deste item no projeto
  -- Metadados do cálculo
  agents_range VARCHAR(20), -- Ex: '10', '20', '40', '70', '100', 'more'
  calculation_base TEXT, -- Como foi calculado (para auditoria)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_project_scope_item UNIQUE(project_id, scope_item_id),
  CONSTRAINT valid_calculated_minutes CHECK (calculated_minutes >= 0 AND calculated_minutes < 60),
  CONSTRAINT valid_calculated_hours CHECK (calculated_hours >= 0),
  CONSTRAINT valid_quantity CHECK (quantity > 0)
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_project_scope_items_project_id ON project_scope_items(project_id);
CREATE INDEX IF NOT EXISTS idx_project_scope_items_scope_item_id ON project_scope_items(scope_item_id);
CREATE INDEX IF NOT EXISTS idx_scope_items_response_type ON scope_items(response_type);
CREATE INDEX IF NOT EXISTS idx_projects_agents_count ON projects(agents_count);

-- 5. Adicionar comentários para documentação
COMMENT ON TABLE project_scope_items IS 'Itens de escopo selecionados para cada projeto com valores calculados específicos';
COMMENT ON COLUMN project_scope_items.calculated_hours IS 'Horas calculadas para este item neste projeto específico';
COMMENT ON COLUMN project_scope_items.calculated_minutes IS 'Minutos calculados para este item neste projeto específico';
COMMENT ON COLUMN project_scope_items.calculated_value IS 'Valor monetário calculado para este item neste projeto';
COMMENT ON COLUMN project_scope_items.quantity IS 'Quantidade deste item selecionada no projeto';
COMMENT ON COLUMN project_scope_items.agents_range IS 'Faixa de agentes usada no cálculo (10, 20, 40, 70, 100, more)';
COMMENT ON COLUMN project_scope_items.calculation_base IS 'Descrição de como o valor foi calculado para auditoria';

COMMENT ON COLUMN scope_items.agents_10 IS 'Valor para projetos com até 10 agentes';
COMMENT ON COLUMN scope_items.agents_20 IS 'Valor para projetos com até 20 agentes';
COMMENT ON COLUMN scope_items.agents_40 IS 'Valor para projetos com até 40 agentes';
COMMENT ON COLUMN scope_items.agents_70 IS 'Valor para projetos com até 70 agentes';
COMMENT ON COLUMN scope_items.agents_100 IS 'Valor para projetos com até 100 agentes';
COMMENT ON COLUMN scope_items.agents_more IS 'Valor para projetos com mais de 100 agentes';
COMMENT ON COLUMN scope_items.response_type IS 'Tipo de resposta: numeric (valores numéricos) ou boolean (sim/não)';

COMMENT ON COLUMN projects.agents_count IS 'Número de agentes que utilizarão o sistema neste projeto';

-- 6. Criar trigger para atualizar updated_at na nova tabela
CREATE TRIGGER update_project_scope_items_updated_at 
    BEFORE UPDATE ON project_scope_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Inserir alguns dados de exemplo para teste (opcional)
-- Você pode descomentar estas linhas para ter dados de teste

/*
-- Exemplo de dados para scope_items com valores por faixa de agentes
UPDATE scope_items SET 
    agents_10 = 2,
    agents_20 = 4, 
    agents_40 = 8,
    agents_70 = 12,
    agents_100 = 16,
    agents_more = 20,
    response_type = 'numeric'
WHERE name = 'Automação';

UPDATE scope_items SET 
    agents_10 = 1,
    agents_20 = 1, 
    agents_40 = 1,
    agents_70 = 1,
    agents_100 = 1,
    agents_more = 1,
    response_type = 'boolean'
WHERE name = 'Campos de usuário';
*/

SELECT 'Nova arquitetura implementada com sucesso!' as status;