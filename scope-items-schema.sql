-- Schema para Itens de Escopo
-- Execute este script no SQL Editor do Supabase

-- Tabela de categorias de escopo
CREATE TABLE scope_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1', -- Cor hexadecimal para identificação visual
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de escopo
CREATE TABLE scope_items (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES scope_categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 0, -- Peso em pontos de complexidade
  hours INTEGER NOT NULL DEFAULT 0, -- Horas necessárias
  minutes INTEGER NOT NULL DEFAULT 0, -- Minutos adicionais
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_minutes CHECK (minutes >= 0 AND minutes < 60),
  CONSTRAINT valid_points CHECK (points >= 0),
  CONSTRAINT valid_hours CHECK (hours >= 0)
);

-- Índices para melhor performance
CREATE INDEX idx_scope_items_product_id ON scope_items(product_id);
CREATE INDEX idx_scope_items_category_id ON scope_items(category_id);
CREATE INDEX idx_scope_items_active ON scope_items(is_active);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scope_categories_updated_at BEFORE UPDATE ON scope_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scope_items_updated_at BEFORE UPDATE ON scope_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir categorias iniciais para Suite Zendesk
INSERT INTO scope_categories (name, description, color) VALUES
('Conta', 'Configurações relacionadas à conta e autenticação', '#ef4444'),
('Pessoas', 'Gestão de usuários, agentes e organizações', '#f97316'),
('Canais', 'Canais de comunicação e atendimento', '#eab308'),
('IA (Essential)', 'Funcionalidades de inteligência artificial', '#22c55e'),
('Espaço de trabalho', 'Configurações do ambiente de trabalho', '#3b82f6'),
('Objetos e Regras', 'Formulários, campos, gatilhos e automações', '#8b5cf6'),
('Aplicativos e integrações', 'Integrações com sistemas externos', '#ec4899');

-- Inserir itens de escopo iniciais para Suite Zendesk
-- Categoria: Conta
INSERT INTO scope_items (product_id, category_id, name, points, hours, minutes) VALUES
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Conta'), 'SSO para agentes', 5, 2, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Conta'), 'SSO para usuário finais', 5, 2, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Conta'), 'Criação de Marcas', 3, 1, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Conta'), 'Criação de Sandbox', 2, 1, 0);

-- Categoria: Pessoas
INSERT INTO scope_items (product_id, category_id, name, points, hours, minutes) VALUES
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Pessoas'), 'Adição de agentes', 2, 0, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Pessoas'), 'Funções', 3, 1, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Pessoas'), 'Grupos', 3, 1, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Pessoas'), 'Campos de usuários', 4, 1, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Pessoas'), 'Campos de organizações', 4, 1, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Pessoas'), 'Importação de usuários', 6, 2, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Pessoas'), 'Importação de organizações', 6, 2, 30);

-- Categoria: Canais
INSERT INTO scope_items (product_id, category_id, name, points, hours, minutes) VALUES
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Canais'), 'WhatsApp', 8, 3, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Canais'), 'Instagram', 6, 2, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Canais'), 'Facebook Messenger', 6, 2, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Canais'), 'Páginas do Facebook', 5, 2, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Canais'), 'Android', 7, 3, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Canais'), 'IOS', 7, 3, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Canais'), 'Slack', 4, 1, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Canais'), 'Webwidget', 5, 2, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Canais'), 'X Corp', 5, 2, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Canais'), 'Mensagens proativas', 6, 2, 30);

-- Categoria: IA (Essential)
INSERT INTO scope_items (product_id, category_id, name, points, hours, minutes) VALUES
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'IA (Essential)'), 'Bots Essentials', 10, 4, 0);

-- Categoria: Espaço de trabalho
INSERT INTO scope_items (product_id, category_id, name, points, hours, minutes) VALUES
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Espaço de trabalho'), 'Visualizações', 4, 1, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Espaço de trabalho'), 'Macros', 3, 1, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Espaço de trabalho'), 'Conteúdo Dinâmico', 5, 2, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Espaço de trabalho'), 'Disposições', 4, 1, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Espaço de trabalho'), 'Espaço de trabalho contextuais', 6, 2, 30);

-- Categoria: Objetos e Regras
INSERT INTO scope_items (product_id, category_id, name, points, hours, minutes) VALUES
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'Formulários', 4, 1, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'Campos de Tickets', 3, 1, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'Status do Ticket', 3, 1, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'Objetos', 5, 2, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'Filas', 4, 1, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'Status dos Agentes', 2, 0, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'Gatilhos', 2, 0, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'Gatilhos de mensagens', 3, 1, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'Automações', 4, 1, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'Habilidades', 3, 1, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'SLAs', 5, 2, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Objetos e Regras'), 'Programação', 4, 1, 30);

-- Categoria: Aplicativos e integrações
INSERT INTO scope_items (product_id, category_id, name, points, hours, minutes) VALUES
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Aplicativos e integrações'), 'Sweet Hawk', 6, 2, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Aplicativos e integrações'), 'SnapCall', 5, 2, 0),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Aplicativos e integrações'), 'Teams', 4, 1, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Aplicativos e integrações'), 'Salesforce', 8, 3, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Aplicativos e integrações'), 'Shopify', 6, 2, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Aplicativos e integrações'), 'Slack', 4, 1, 30),
((SELECT id FROM products WHERE name = 'Support' LIMIT 1), (SELECT id FROM scope_categories WHERE name = 'Aplicativos e integrações'), 'Workday', 7, 3, 0);

-- Comentários para documentação
COMMENT ON TABLE scope_categories IS 'Categorias para organização dos itens de escopo';
COMMENT ON TABLE scope_items IS 'Itens de escopo vinculados a produtos com pontos e tempo estimado';
COMMENT ON COLUMN scope_items.points IS 'Peso em pontos de complexidade do item';
COMMENT ON COLUMN scope_items.hours IS 'Horas necessárias para configurar o item';
COMMENT ON COLUMN scope_items.minutes IS 'Minutos adicionais necessários (0-59)';