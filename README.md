# Simulador de Projetos Zendesk - SaaS

Plataforma SaaS para estimativa de horas e custos de implementação de projetos Zendesk.

## 🚀 Tecnologias

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Vercel Functions (Serverless)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com)
- Node.js 18+ (para desenvolvimento local)

## ⚙️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Clique em "New Project"
5. Preencha:
   - **Name**: `simulador-zendesk`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a mais próxima (ex: South America)
6. Clique em "Create new project"

### 2. Configurar o Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em "Run"
5. Aguarde a execução (deve criar todas as tabelas e dados)

### 3. Obter Credenciais

1. Vá para **Settings** > **API**
2. Copie:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public** key (chave longa)

### 4. Configurar Frontend

1. Abra o arquivo `supabase-config.js`
2. Substitua:
   ```javascript
   const SUPABASE_URL = 'https://qngnbyueqdewjjzgbkun.supabase.co';
   const SUPABASE_ANON_KEY = 'sua-chave-anonima-aqui';
   ```
   Pelos valores copiados do Supabase.

## 🚀 Deploy no Vercel

### 1. Preparar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

### 2. Conectar com GitHub (Recomendado)

1. Crie um repositório no GitHub
2. Faça push do código:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/simulador-zendesk.git
   git push -u origin main
   ```

### 3. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte com GitHub e selecione o repositório
4. Configure as variáveis de ambiente:
   - `SUPABASE_URL`: URL do seu projeto Supabase
   - `SUPABASE_ANON_KEY`: Chave anônima do Supabase
5. Clique em "Deploy"

### 4. Configurar Variáveis de Ambiente

1. No painel do Vercel, vá para **Settings** > **Environment Variables**
2. Adicione:
   - **Name**: `SUPABASE_URL`, **Value**: `https://qngnbyueqdewjjzgbkun.supabase.co`
   - **Name**: `SUPABASE_ANON_KEY`, **Value**: `sua-chave-anonima`
3. Clique em "Save"
4. Vá para **Deployments** e clique em "Redeploy"

## 🧪 Teste Local

1. Instale o Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Configure as variáveis locais:
   ```bash
   vercel env pull .env.local
   ```

3. Execute localmente:
   ```bash
   vercel dev
   ```

4. Acesse: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
├── api/                    # Funções serverless
│   ├── projects.js        # API de projetos
│   ├── products.js        # API de produtos
│ 
├── home.html              # Página inicial
├── index.html             # Simulador principal
├── home.js                # Scripts da página inicial
├── script.js              # Scripts principais

├── styles.css             # Estilos
├── supabase-config.js     # Configuração do Supabase
├── supabase-schema.sql    # Schema do banco
├── package.json           # Dependências
├── vercel.json            # Configuração do Vercel
└── README.md              # Este arquivo
```

## 🔧 Funcionalidades

- ✅ Criação de projetos
- ✅ Seleção de produtos Zendesk
- ✅ Questionários específicos por produto
- ✅ Cálculo automático de horas e custos
- ✅ Persistência no banco de dados
- ✅ Interface responsiva
- ✅ Deploy automático

## 🎯 Próximos Passos

1. **Autenticação**: Implementar login de usuários
2. **Relatórios**: Gerar PDFs dos projetos
3. **Dashboard**: Painel administrativo
4. **API Externa**: Integração com Zendesk
5. **Multi-tenancy**: Suporte a múltiplas empresas

## 🆘 Solução de Problemas

### Erro de CORS
- Verifique se as APIs estão configuradas corretamente
- Confirme se o Supabase permite requisições do seu domínio

### Erro de Conexão com Banco
- Verifique as credenciais do Supabase
- Confirme se o schema foi executado corretamente
- Teste a conexão no SQL Editor do Supabase

### Deploy Falha
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se o `package.json` está correto
- Veja os logs de build no Vercel

## 📞 Suporte

Para dúvidas ou problemas:
- Email: suporte@tecnasistemas.com.br
- Documentação: [Supabase Docs](https://supabase.com/docs)
- Documentação: [Vercel Docs](https://vercel.com/docs)

---

**TECNA Sistemas** - Soluções em Tecnologia