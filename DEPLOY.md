# Deploy do Simulador de Projeto e Horas - Zendesk

## Configuração do Supabase

Para que o sistema funcione completamente, você precisa configurar o Supabase:

### 1. Criar conta no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto

### 2. Configurar o banco de dados
Execute os seguintes comandos SQL no editor SQL do Supabase:

```sql
-- Criar tabela de produtos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir produtos Zendesk
INSERT INTO products (name, icon, description) VALUES
('Suite Zendesk', '🎯', 'Plataforma principal de atendimento ao cliente'),
('Copilot', '🤖', 'Assistente de IA para agentes'),
('Zendesk QA', '✅', 'Ferramenta de qualidade para monitoramento'),
('Zendesk WFM', '📊', 'Gestão de força de trabalho'),
('Agente de IA Avançado', '🧠', 'Agente virtual inteligente para atendimento');

-- Criar tabela de projetos
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de produtos do projeto
CREATE TABLE project_products (
    id SERIAL PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    status VARCHAR(50) DEFAULT 'pending',
    hours INTEGER DEFAULT 0,
    value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de questionários
CREATE TABLE questionnaires (
    id SERIAL PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    answers JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Configurar as credenciais
1. No painel do Supabase, vá em Settings > API
2. Copie a URL do projeto e a chave anônima
3. Edite o arquivo `supabase-config.js`:

```javascript
const SUPABASE_URL = 'https://seu-projeto-real.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima-real';
```

## Opções de Deploy

### 1. GitHub Pages (Gratuito)
1. Faça upload dos arquivos para um repositório GitHub
2. Vá em Settings > Pages
3. Selecione a branch main como source
4. Seu site estará disponível em `https://seu-usuario.github.io/nome-do-repo`

### 2. Netlify (Gratuito)
1. Acesse [netlify.com](https://netlify.com)
2. Faça drag & drop da pasta do projeto
3. Seu site estará disponível instantaneamente

### 3. Vercel (Gratuito)
1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Deploy automático a cada commit

### 4. Servidor próprio
1. Faça upload dos arquivos para seu servidor web
2. Configure o servidor para servir arquivos estáticos
3. Certifique-se de que o HTTPS está habilitado

## Funcionalidades Implementadas

✅ **Seção de Projetos Salvos na Tela Inicial**
- Exibe os 5 projetos mais recentes
- Status visual (rascunho, em progresso, concluído)
- Data de criação formatada
- Funcionalidade para carregar projeto salvo

✅ **Sistema de Salvamento de Dados**
- Salvamento automático de respostas do questionário
- Persistência de dados da simulação
- Integração completa com Supabase
- Fallback com projetos de exemplo para demonstração

✅ **Interface Responsiva**
- Design moderno e intuitivo
- Compatível com dispositivos móveis
- Animações e transições suaves

## Estrutura do Projeto

```
Simulador/
├── index.html              # Página inicial
├── produtos.html           # Seleção de produtos
├── escopo.html            # Questionário de escopo
├── resultado.html         # Resultados da simulação
├── styles.css             # Estilos principais
├── home.js               # Lógica da página inicial
├── produtos.js           # Lógica de seleção de produtos
├── escopo.js             # Lógica do questionário
├── resultado.js          # Lógica dos resultados
├── supabase-config.js    # Configuração do Supabase
└── DEPLOY.md             # Este arquivo
```

## Suporte

Para dúvidas ou problemas:
1. Verifique se as credenciais do Supabase estão corretas
2. Confirme se as tabelas foram criadas no banco de dados
3. Verifique o console do navegador para erros JavaScript

---

**Nota**: O sistema funciona com projetos de exemplo mesmo sem o Supabase configurado, permitindo testar todas as funcionalidades da interface.