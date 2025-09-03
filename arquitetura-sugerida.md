# Análise e Proposta de Arquitetura Melhorada

## 🔍 Problema Identificado

Você está correto! A estrutura atual tem uma confusão conceitual:

### Estrutura Atual (Problemática):
- **`scope_items`**: Sendo usada tanto para templates quanto para dados de projetos criados
- **`project_scope_items`**: Referenciada no código mas não existe no schema
- **Mistura de responsabilidades**: Templates e dados reais no mesmo lugar

## 🏗️ Arquitetura Sugerida

### 1. **Tabela de Templates (`scope_items`)**
```sql
-- Mantém a estrutura atual, mas APENAS para templates
CREATE TABLE scope_items (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES scope_categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  hours INTEGER NOT NULL DEFAULT 0,
  minutes INTEGER NOT NULL DEFAULT 0,
  -- Colunas para diferentes faixas de agentes (templates)
  agents_10 INTEGER DEFAULT NULL,
  agents_20 INTEGER DEFAULT NULL, 
  agents_40 INTEGER DEFAULT NULL,
  agents_70 INTEGER DEFAULT NULL,
  agents_100 INTEGER DEFAULT NULL,
  agents_more INTEGER DEFAULT NULL,
  response_type VARCHAR(20) DEFAULT 'numeric', -- 'numeric' ou 'boolean'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **Tabela de Projetos Criados (`projects`)**
```sql
-- Já existe, mas vamos garantir que está completa
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  client_type VARCHAR(20) DEFAULT 'base',
  is_tecna_client BOOLEAN DEFAULT false,
  has_zendesk_admin BOOLEAN DEFAULT false,
  agents_count INTEGER DEFAULT 0, -- Número de agentes do projeto
  status VARCHAR(20) DEFAULT 'draft',
  total_hours INTEGER DEFAULT 0,
  total_value DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. **Tabela de Itens Selecionados por Projeto (`project_scope_items`)**
```sql
-- NOVA TABELA - Para armazenar os itens selecionados em cada projeto
CREATE TABLE project_scope_items (
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
  UNIQUE(project_id, scope_item_id)
);
```

### 4. **Tabela de Produtos Selecionados por Projeto (`project_products`)**
```sql
-- Já existe, mas vamos garantir que está alinhada
CREATE TABLE project_products (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  hours INTEGER DEFAULT 0, -- Soma dos itens de escopo deste produto
  value DECIMAL(10,2) DEFAULT 0.00, -- Valor calculado para este produto
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, product_id)
);
```

## 🔄 Fluxo de Dados Proposto

### 1. **Templates (Dados Padrão)**
- **`scope_items`**: Contém todos os itens de template com valores para diferentes faixas de agentes
- **`products`**: Contém os produtos Zendesk com questionários
- **API `/api/default-projects`**: Retorna dados de `scope_items` onde `is_active = true`

### 2. **Criação de Projeto**
- **`projects`**: Armazena dados básicos do projeto (nome, descrição, número de agentes, etc.)
- **`project_products`**: Armazena quais produtos foram selecionados
- **`project_scope_items`**: Armazena quais itens de escopo foram selecionados e seus valores calculados
- **`questionnaire_answers`**: Armazena respostas dos questionários

### 3. **Cálculos**
- Baseado no número de agentes do projeto, seleciona a faixa apropriada dos templates
- Calcula valores específicos para cada item selecionado
- Armazena os resultados em `project_scope_items` com referência ao template original

## 📊 Vantagens desta Arquitetura

1. **Separação Clara**: Templates vs Dados Reais
2. **Rastreabilidade**: Cada item do projeto referencia seu template original
3. **Flexibilidade**: Permite modificações nos projetos sem afetar templates
4. **Auditoria**: Histórico de como cada valor foi calculado
5. **Performance**: Consultas mais eficientes com índices apropriados
6. **Escalabilidade**: Fácil adicionar novos campos sem quebrar a estrutura

## 🚀 Próximos Passos

1. **Criar a tabela `project_scope_items`** no schema
2. **Adicionar colunas `agents_*` na tabela `scope_items`** (se ainda não existem)
3. **Atualizar APIs** para usar a nova estrutura
4. **Migrar dados existentes** (se houver)
5. **Testar fluxo completo** de criação de projeto

## 💡 Considerações Adicionais

- **Versionamento**: Considerar versionar templates para manter histórico
- **Cache**: Implementar cache para consultas frequentes de templates
- **Validações**: Adicionar constraints para garantir integridade dos dados
- **Índices**: Criar índices apropriados para performance

Esta arquitetura resolve o problema conceitual e prepara o sistema para crescimento futuro!