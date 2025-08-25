# Guia de Deploy - Simulador de Projetos Zendesk

## 📋 Pré-requisitos
- Conta no GitHub
- Conta no Vercel (pode usar login do GitHub)
- Conta no Supabase (gratuita)

## 🗄️ Passo 1: Configurar Supabase

### 1.1 Criar conta e projeto
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project" e faça login com GitHub
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha:
   - **Name**: `simulador-zendesk`
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: `South America (São Paulo)`
6. Clique em "Create new project"

### 1.2 Executar Schema do Banco
1. No painel do Supabase, vá em **SQL Editor** (ícone de código)
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em "Run"
5. Verifique se as tabelas foram criadas em **Table Editor**

### 1.3 Obter Credenciais
1. Vá em **Settings** > **API**
2. Anote os seguintes valores:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🚀 Passo 2: Deploy no Vercel

### 2.1 Preparar Repositório GitHub
1. Crie um novo repositório no GitHub:
   - Nome: `simulador-zendesk`
   - Público ou Privado (sua escolha)
2. No terminal, execute:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/simulador-zendesk.git
git push -u origin main
```

### 2.2 Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione o repositório `simulador-zendesk`
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (deixe vazio)
   - **Output Directory**: (deixe vazio)
6. Clique em "Deploy"

### 2.3 Configurar Variáveis de Ambiente
1. No painel do Vercel, vá em **Settings** > **Environment Variables**
2. Adicione as seguintes variáveis:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | Sua Project URL do Supabase |
| `SUPABASE_ANON_KEY` | Sua anon public key do Supabase |

3. Clique em "Save" para cada variável
4. Vá em **Deployments** e clique em "Redeploy" no último deploy

## ✅ Passo 3: Testar Aplicação

### 3.1 Acessar Aplicação
1. No Vercel, copie a URL do seu projeto (ex: `https://simulador-zendesk.vercel.app`)
2. Acesse a URL no navegador

### 3.2 Testar Funcionalidades
1. **Página Inicial**: Deve carregar sem erros
2. **Criar Projeto**: 
   - Preencha nome e descrição
   - Clique em "Criar Projeto"
   - Deve redirecionar para o simulador
3. **Simulador**:
   - Selecione produtos
   - Configure opções
   - Gere escopo
   - Verifique se salva no Supabase
4. **Projetos Existentes**:
   - Volte à página inicial
   - Deve mostrar projetos criados
   - Teste carregar um projeto existente

## 🔧 Solução de Problemas

### Erro de CORS
Se aparecer erro de CORS:
1. No Supabase, vá em **Authentication** > **Settings**
2. Em **Site URL**, adicione sua URL do Vercel
3. Em **Additional URLs**, adicione também

### Erro 500 nas APIs
1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se o schema foi executado corretamente
3. Verifique os logs no Vercel (**Functions** > **View Function Logs**)

### Projeto não carrega
1. Abra o Console do navegador (F12)
2. Verifique erros JavaScript
3. Confirme se as APIs estão respondendo

## 📊 Monitoramento

- **Vercel Analytics**: Monitore performance e erros
- **Supabase Dashboard**: Acompanhe uso do banco
- **Logs**: Sempre verifique logs em caso de problemas

## 💰 Custos

- **Vercel**: Gratuito (até 100GB bandwidth/mês)
- **Supabase**: Gratuito (até 500MB storage, 2GB bandwidth/mês)
- **Total**: R$ 0,00/mês para uso normal

---

**✨ Parabéns! Sua aplicação está online e funcionando!**

URL da aplicação: `https://SEU_PROJETO.vercel.app`

Para suporte, verifique os logs do Vercel e Supabase em caso de problemas.