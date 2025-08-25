-- Schema do banco de dados para o Simulador Zendesk
-- Execute este script no SQL Editor do Supabase
-- Este script limpa e recria todas as tabelas

-- Remover tabelas existentes (se existirem)
DROP TABLE IF EXISTS questionnaire_answers CASCADE;
DROP TABLE IF EXISTS project_products CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Remover função se existir
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Tabela de produtos Zendesk
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  description TEXT,
  questionnaire JSONB NOT NULL,
  base_hours INTEGER DEFAULT 40,
  hourly_rate DECIMAL(10,2) DEFAULT 150.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  total_hours INTEGER DEFAULT 0,
  total_value DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento projeto-produto
CREATE TABLE project_products (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  hours INTEGER DEFAULT 0,
  value DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, product_id)
);

-- Tabela de respostas dos questionários
CREATE TABLE questionnaire_answers (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  question_key VARCHAR(100) NOT NULL,
  answer_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, product_id, question_key)
);

-- Inserir produtos Zendesk com questionários
INSERT INTO products (name, icon, description, questionnaire) VALUES
('Support', '🎧', 'Zendesk Support - Sistema de atendimento ao cliente', '{
  "sections": [
    {
      "title": "Configuração Básica",
      "questions": [
        {
          "key": "agents_count",
          "label": "Quantos agentes de suporte?",
          "type": "number",
          "required": true,
          "min": 1,
          "max": 1000
        },
        {
          "key": "channels",
          "label": "Canais de atendimento",
          "type": "checkbox",
          "options": ["Email", "Chat", "Telefone", "WhatsApp", "Redes Sociais"]
        },
        {
          "key": "business_hours",
          "label": "Horário de funcionamento",
          "type": "select",
          "options": ["8x5 (comercial)", "12x5 (estendido)", "24x7 (integral)"]
        }
      ]
    },
    {
      "title": "Integrações",
      "questions": [
        {
          "key": "crm_integration",
          "label": "Integração com CRM?",
          "type": "radio",
          "options": ["Sim", "Não"]
        },
        {
          "key": "api_integrations",
          "label": "Integrações via API",
          "type": "number",
          "min": 0,
          "max": 50
        }
      ]
    }
  ]
}'),

('Guide', '📚', 'Zendesk Guide - Base de conhecimento', '{
  "sections": [
    {
      "title": "Estrutura do Conteúdo",
      "questions": [
        {
          "key": "articles_count",
          "label": "Número estimado de artigos",
          "type": "number",
          "required": true,
          "min": 1,
          "max": 10000
        },
        {
          "key": "categories",
          "label": "Número de categorias",
          "type": "number",
          "min": 1,
          "max": 100
        },
        {
          "key": "languages",
          "label": "Idiomas suportados",
          "type": "checkbox",
          "options": ["Português", "Inglês", "Espanhol", "Francês", "Alemão"]
        }
      ]
    },
    {
      "title": "Funcionalidades",
      "questions": [
        {
          "key": "search_advanced",
          "label": "Busca avançada necessária?",
          "type": "radio",
          "options": ["Sim", "Não"]
        },
        {
          "key": "user_feedback",
          "label": "Sistema de feedback dos usuários?",
          "type": "radio",
          "options": ["Sim", "Não"]
        }
      ]
    }
  ]
}'),

('Chat', '💬', 'Zendesk Chat - Chat ao vivo', '{
  "sections": [
    {
      "title": "Configuração do Chat",
      "questions": [
        {
          "key": "concurrent_chats",
          "label": "Chats simultâneos por agente",
          "type": "number",
          "required": true,
          "min": 1,
          "max": 20
        },
        {
          "key": "chat_routing",
          "label": "Tipo de roteamento",
          "type": "select",
          "options": ["Round Robin", "Por habilidade", "Manual"]
        },
        {
          "key": "proactive_chat",
          "label": "Chat proativo?",
          "type": "radio",
          "options": ["Sim", "Não"]
        }
      ]
    },
    {
      "title": "Personalização",
      "questions": [
        {
          "key": "custom_widget",
          "label": "Widget personalizado?",
          "type": "radio",
          "options": ["Sim", "Não"]
        },
        {
          "key": "chatbot",
          "label": "Integração com chatbot?",
          "type": "radio",
          "options": ["Sim", "Não"]
        }
      ]
    }
  ]
}'),

('Talk', '📞', 'Zendesk Talk - Sistema de telefonia', '{
  "sections": [
    {
      "title": "Configuração Telefônica",
      "questions": [
        {
          "key": "phone_numbers",
          "label": "Quantidade de números telefônicos",
          "type": "number",
          "required": true,
          "min": 1,
          "max": 100
        },
        {
          "key": "call_recording",
          "label": "Gravação de chamadas?",
          "type": "radio",
          "options": ["Sim", "Não"]
        },
        {
          "key": "ivr_levels",
          "label": "Níveis de IVR (URA)",
          "type": "number",
          "min": 0,
          "max": 10
        }
      ]
    },
    {
      "title": "Integrações",
      "questions": [
        {
          "key": "pbx_integration",
          "label": "Integração com PBX existente?",
          "type": "radio",
          "options": ["Sim", "Não"]
        },
        {
          "key": "call_center_features",
          "label": "Recursos de call center avançados?",
          "type": "radio",
          "options": ["Sim", "Não"]
        }
      ]
    }
  ]
}'),

('Explore', '📊', 'Zendesk Explore - Analytics e relatórios', '{
  "sections": [
    {
      "title": "Relatórios",
      "questions": [
        {
          "key": "custom_dashboards",
          "label": "Número de dashboards personalizados",
          "type": "number",
          "required": true,
          "min": 1,
          "max": 50
        },
        {
          "key": "data_sources",
          "label": "Fontes de dados externas",
          "type": "number",
          "min": 0,
          "max": 20
        },
        {
          "key": "scheduled_reports",
          "label": "Relatórios agendados?",
          "type": "radio",
          "options": ["Sim", "Não"]
        }
      ]
    },
    {
      "title": "Análises Avançadas",
      "questions": [
        {
          "key": "predictive_analytics",
          "label": "Análises preditivas?",
          "type": "radio",
          "options": ["Sim", "Não"]
        },
        {
          "key": "real_time_monitoring",
          "label": "Monitoramento em tempo real?",
          "type": "radio",
          "options": ["Sim", "Não"]
        }
      ]
    }
  ]
}'),

('Sell', '💰', 'Zendesk Sell - CRM de vendas', '{
  "sections": [
    {
      "title": "Configuração de Vendas",
      "questions": [
        {
          "key": "sales_users",
          "label": "Número de usuários de vendas",
          "type": "number",
          "required": true,
          "min": 1,
          "max": 500
        },
        {
          "key": "pipeline_stages",
          "label": "Estágios do pipeline",
          "type": "number",
          "min": 3,
          "max": 20
        },
        {
          "key": "lead_sources",
          "label": "Fontes de leads",
          "type": "checkbox",
          "options": ["Website", "Email Marketing", "Redes Sociais", "Telefone", "Eventos"]
        }
      ]
    },
    {
      "title": "Automação",
      "questions": [
        {
          "key": "workflow_automation",
          "label": "Automação de workflows?",
          "type": "radio",
          "options": ["Sim", "Não"]
        },
        {
          "key": "email_integration",
          "label": "Integração com email?",
          "type": "radio",
          "options": ["Sim", "Não"]
        }
      ]
    }
  ]
}');

-- Criar índices para melhor performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_products_project_id ON project_products(project_id);
CREATE INDEX idx_project_products_product_id ON project_products(product_id);
CREATE INDEX idx_questionnaire_answers_project_product ON questionnaire_answers(project_id, product_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela projects
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE products IS 'Produtos Zendesk disponíveis';
COMMENT ON TABLE projects IS 'Projetos de implementação';
COMMENT ON TABLE project_products IS 'Relacionamento entre projetos e produtos';
COMMENT ON TABLE questionnaire_answers IS 'Respostas dos questionários por projeto/produto';