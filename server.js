const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const PORT = 3000;

// Configuração do Supabase
const supabaseUrl = 'https://qngnbyueqdewjjzgbkun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware para parsing JSON
app.use(express.json());

// Middleware para CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Redirecionar raiz para index.html
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Servir arquivos estáticos
app.use(express.static('.'));

// API de usuários
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.json([]);
  }
});

// API para atualizar usuário
app.put('/api/users', async (req, res) => {
  try {
    const { id, ...userData } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ data: data[0], error: null });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: error.message });
  }
});

// API para ações em usuários (delete)
app.post('/api/users', async (req, res) => {
  try {
    const { id, action } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }
    
    if (action === 'delete') {
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Erro ao deletar usuário:', error);
        return res.status(500).json({ error: error.message });
      }
      
      res.json({ data: data[0] || { id }, error: null });
    } else {
      res.status(400).json({ error: 'Ação não suportada' });
    }
  } catch (error) {
    console.error('Erro ao processar ação do usuário:', error);
    res.status(500).json({ error: error.message });
  }
});

// API para buscar projetos padrão baseado nos itens de escopo
  app.get('/api/default-projects', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('scope_items')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar projetos padrão:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
      
      // Converter dados dos itens de escopo para o formato esperado pelo frontend
      const agent_ranges = [
        { min: 0, max: 10, hours: 32 },
        { min: 11, max: 20, hours: 76 },
        { min: 21, max: 40, hours: 96 },
        { min: 41, max: 70, hours: 126 },
        { min: 71, max: 100, hours: 156 },
        { min: 101, max: 999999, hours: 186 }
      ];
      
      const default_data = [];
      
      for (const item of (data || [])) {
        const response_type = item.response_type || 'numeric';
        
        // Verificar se temos valores salvos nas colunas agents_*
        const saved_values = [
          item.agents_10,
          item.agents_20,
          item.agents_40,
          item.agents_70,
          item.agents_100,
          item.agents_more
        ];
        
        let values;
        
        // Se todos os valores salvos existem, usar eles
        if (saved_values.every(v => v !== null && v !== undefined)) {
          if (response_type === 'boolean') {
            values = saved_values; // Manter como strings para boolean
          } else {
            // Converter para números para valores numéricos
            values = saved_values.map(v => {
              try {
                return /^\d+$/.test(String(v)) ? parseInt(v) : v;
              } catch {
                return v;
              }
            });
          }
        } else {
          // Fallback: calcular valores baseados em horas/minutos
          if (response_type === 'boolean') {
            const total_hours = item.hours + (item.minutes / 60.0);
            if (total_hours > 2) {
              values = ['Não', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim'];
            } else {
              values = ['Sim', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim'];
            }
          } else {
            const total_hours = item.hours + (item.minutes / 60.0);
            values = agent_ranges.map(range_info => {
              const scale_factor = range_info.hours / 32.0;
              return Math.max(1, Math.round(total_hours * scale_factor));
            });
          }
        }
        
        default_data.push({
          name: item.name,
          values: values
        });
      }
      
      res.json({ success: true, data: default_data });
    } catch (error) {
      console.error('Erro ao buscar projetos padrão:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

// API de itens de escopo
app.get('/api/scope-items', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scope_items')
      .select(`
        *,
        scope_categories (name)
      `)
      .eq('is_active', true)
      .order('category_id')
      .order('name');
    
    if (error) throw error;
    res.json({success: true, data: data || []});
  } catch (error) {
    console.error('Erro ao buscar itens de escopo:', error);
    res.json({
      success: true,
      data: [
        {id: 1, name: 'Item 1', category: 'Categoria 1', points: 5, hours: 2, minutes: 30},
        {id: 2, name: 'Item 2', category: 'Categoria 2', points: 3, hours: 1, minutes: 15}
      ]
    });
  }
});

// API de itens de escopo - POST (criar ou ações especiais)
app.post('/api/scope-items', async (req, res) => {
  try {
    const data = req.body;
    
    console.log('[POST] Dados recebidos:', data);
    
    // Verificar se é uma ação de delete
    if (data && data.action === 'delete') {
      console.log('[POST] Processando delete via POST com action=delete');
      const itemId = data.id;
      
      if (!itemId) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }
      
      // Realizar soft delete
      const { data: result, error } = await supabase
        .from('scope_items')
        .update({ is_active: false })
        .eq('id', itemId)
        .eq('is_active', true)
        .select();
      
      if (error) {
        console.log('[DELETE] Erro Supabase:', error);
        return res.status(500).json({ error: 'Erro ao deletar item', details: error.message });
      }
      
      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Item não encontrado ou já foi deletado' });
      }
      
      console.log('[DELETE] Item deletado com sucesso:', result[0]);
      return res.status(200).json({ 
        success: true, 
        message: 'Item deletado com sucesso',
        data: result[0]
      });
    }
    
    // Verificar se é uma ação de update
    if (data && data.action === 'update') {
      console.log('[POST] Processando update via POST com action=update');
      const itemId = data.id;
      const updateData = { ...data };
      delete updateData.id;
      delete updateData.action;
      
      const { data: result, error } = await supabase
        .from('scope_items')
        .update(updateData)
        .eq('id', itemId)
        .select()
        .single();
      
      if (error) {
        console.error('[UPDATE] Erro do Supabase:', error);
        return res.status(500).json({ error: error.message });
      }
      
      if (!result) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }
      
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Item atualizado com sucesso'
      });
    }
    
    // Caso contrário, criar novo item
    const { data: result, error } = await supabase
      .from('scope_items')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error('[POST] Erro do Supabase:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('[POST] Item criado com sucesso:', result);
    
    return res.status(201).json({
      success: true,
      data: result,
      message: 'Item criado com sucesso'
    });
  } catch (error) {
    console.error('[POST] Erro:', error);
    return res.status(500).json({ error: error.message });
  }
});



// Função para obter horas padrões baseado no número de usuários
function getStandardProjectHours(userCount) {
  if (userCount <= 10) return 32;      // Até 10 usuários: 32h
  if (userCount <= 20) return 76;      // 11-20 usuários: 76h
  if (userCount <= 40) return 96;      // 21-40 usuários: 96h
  if (userCount <= 70) return 126;     // 41-70 usuários: 126h
  if (userCount <= 100) return 156;    // 71-100 usuários: 156h
  return 186;                          // Mais de 100 usuários: 186h
}

// API de projetos - POST
app.post('/api/projects', async (req, res) => {
  try {
    // Dados recebidos para criação do projeto
    const { selected_scope_items, ...projectData } = req.body;
    
    // Mapear project_type para billing_model
    const billingModel = projectData.project_type === 'standard' ? 'escopo_fechado' : 'time_materials';
    
    // Adicionar billing_model aos dados do projeto
    projectData.billing_model = billingModel;
    
    // Para projetos customizados, arredondar para cima
    if (projectData.project_type === 'custom' && projectData.total_scope_hours && typeof projectData.total_scope_hours === 'number') {
      // Converter total_scope_hours para inteiro arredondando para cima (para projetos customizados)
      console.log('🔢 Valor original recebido do frontend:', projectData.total_scope_hours);
      projectData.total_scope_hours = Math.ceil(projectData.total_scope_hours);
      console.log('🔢 Valor arredondado para cima:', projectData.total_scope_hours);
    }
    
    // Para projetos padrão, usar o valor calculado pelo frontend (que já inclui horas extras)
    if (projectData.project_type === 'standard') {
      console.log('🔢 Projeto padrão - valor original do frontend:', projectData.total_scope_hours);
      // O frontend já calculou corretamente: horas padrão + horas extras
      // Não sobrescrever o valor aqui
    }
    
    // Os itens já vêm processados do frontend (escopo padrão + extras combinados)
    let finalScopeItems = [...(selected_scope_items || [])];
    
    // Para projetos padrão, usar apenas o total_scope_hours calculado no frontend
    // O frontend já calcula corretamente as horas padrão + horas extras
    if (projectData.project_type === 'standard') {
      console.log('🔍 Projeto padrão - usando horas calculadas no frontend');
      console.log('⏰ Horas totais do frontend:', projectData.total_scope_hours);
      
      // Não fazer cálculos adicionais no backend para projetos padrão
      // O frontend já enviou o valor correto
    }
    
    // Inserir projeto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();
    
    if (projectError) throw projectError;
    
    // Inserir todos os itens de escopo (padrão + extras combinados)
    if (finalScopeItems && finalScopeItems.length > 0) {
      const scopeItemsToInsert = finalScopeItems.map(item => ({
        project_id: project.id,
        scope_item_id: item.scope_item_id,
        quantity: item.quantity || 1,
        custom_hours: item.custom_hours,
        custom_minutes: item.custom_minutes
      }));
      
      const { error: scopeError } = await supabase
        .from('project_scope_items')
        .insert(scopeItemsToInsert);
      
      if (scopeError) {
        console.error('Erro ao inserir itens de escopo:', scopeError);
        throw scopeError;
      }
    }
    
    res.json({success: true, id: project.id, message: 'Projeto criado com sucesso'});
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({success: false, error: error.message});
  }
});

// API de projetos - GET (buscar todos os projetos com itens de escopo)
app.get('/api/projects', async (req, res) => {
  try {
    // Buscar todos os projetos
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (projectsError) throw projectsError;
    
    // Buscar todos os usuários
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email');
    
    if (usersError) throw usersError;
    
    // Para cada projeto, buscar seus itens de escopo e adicionar dados do usuário
    const projectsWithItems = await Promise.all(
      projects.map(async (project) => {
        // Encontrar o usuário correspondente
        const user = users.find(u => u.id === project.user_id);
        const { data: scopeItems, error: scopeError } = await supabase
          .from('project_scope_items')
          .select(`
            *,
            scope_items (
              id,
              name,
              description,
              hours,
              minutes
            )
          `)
          .eq('project_id', project.id);
        
        if (scopeError) {
          console.error('Erro ao buscar itens de escopo:', scopeError);
          return { ...project, scope_items: [] };
        }
        
        // Calcular totais
        let totalHours = 0;
        let totalMinutes = 0;
        
        scopeItems.forEach(item => {
          const itemHours = item.custom_hours || item.scope_items.hours || 0;
          const itemMinutes = item.custom_minutes || item.scope_items.minutes || 0;
          const quantity = item.quantity || 1;
          
          totalHours += itemHours * quantity;
          totalMinutes += itemMinutes * quantity;
        });
        
        // Converter minutos extras em horas
        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;
        
        return {
          ...project,
          users: user || null,
          scope_items: scopeItems,
          calculated_total_hours: totalHours,
          calculated_total_minutes: totalMinutes
        };
      })
    );
    
    res.json({ success: true, data: projectsWithItems });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API de projetos - PUT
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Atualizando projeto
    
    const { data, error } = await supabase
      .from('projects')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({success: true, data, message: 'Projeto atualizado com sucesso'});
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({success: false, error: error.message});
  }
});

// API de projetos - DELETE
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Primeiro, excluir os itens de escopo do projeto
    const { error: scopeError } = await supabase
      .from('project_scope_items')
      .delete()
      .eq('project_id', id);
    
    if (scopeError) {
      console.error('Erro ao excluir itens de escopo:', scopeError);
    }
    
    // Depois, excluir o projeto
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (projectError) throw projectError;
    
    res.json({ success: true, message: 'Projeto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para o simulador
app.get('/simulador', (req, res) => {
  res.sendFile(path.join(__dirname, 'simulador.html'));
});



// Rota para detalhes do projeto
app.get('/project-detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'project-detail.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Simulador disponível em http://localhost:${PORT}/simulador`);
  console.log(`New Project disponível em http://localhost:${PORT}/new-project.html`);
});