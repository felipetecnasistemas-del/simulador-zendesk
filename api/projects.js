const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://qngnbyueqdewjjzgbkun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query, body, url } = req;
    const { action, id } = query;
    
    // Extrair ID da URL para requisições DELETE/PUT
    let projectId = id;
    if (!projectId && url) {
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && !isNaN(lastPart)) {
        projectId = lastPart;
      }
    }

    if (method === 'GET') {
      if (projectId) {
        // Buscar projeto específico
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (error) throw error;
        return res.json({ success: true, data });
      } else if (action === 'answers' && query.id) {
        // Buscar respostas do projeto
        const { data, error } = await supabase
          .from('project_product_answers')
          .select('*')
          .eq('project_id', query.id);
        
        if (error) throw error;
        return res.json({ success: true, data: data || [] });
      } else {
        // Buscar todos os projetos
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return res.json({ success: true, data: data || [] });
      }
    }

    if (method === 'POST') {
      if (action === 'save-answers') {
        // Salvar respostas do projeto
        const { project_id, answers } = body;
        
        // Primeiro, deletar respostas existentes
        await supabase
          .from('project_product_answers')
          .delete()
          .eq('project_id', project_id);
        
        // Inserir novas respostas
        if (answers && answers.length > 0) {
          const { error } = await supabase
            .from('project_product_answers')
            .insert(answers);
          
          if (error) throw error;
        }
        
        return res.json({ success: true, message: 'Respostas salvas com sucesso' });
      } else {
        // Criar novo projeto
        console.log('🔢 Projeto padrão - valor original do frontend:', body.totalScopeHours);
        
        let projectData = { ...body };
        
        // Para projetos customizados, arredondar as horas
        if (body.isCustom && body.totalScopeHours) {
          projectData.totalScopeHours = Math.ceil(body.totalScopeHours);
          console.log('🔄 Projeto customizado - arredondando horas:', projectData.totalScopeHours);
        } else {
          console.log('🔍 Projeto padrão - usando horas calculadas no frontend');
          console.log('⏰ Horas totais do frontend:', body.totalScopeHours);
        }
        
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();
        
        if (error) throw error;
        
        return res.json({ success: true, data, message: 'Projeto criado com sucesso' });
      }
    }

    if (method === 'PUT') {
      // Atualizar projeto
      const updateProjectId = projectId || body.id;
      if (!updateProjectId) {
        return res.status(400).json({ success: false, error: 'ID do projeto é obrigatório' });
      }
      
      const { data, error } = await supabase
        .from('projects')
        .update(body)
        .eq('id', updateProjectId)
        .select()
        .single();
      
      if (error) throw error;
      
      return res.json({ success: true, data, message: 'Projeto atualizado com sucesso' });
    }

    if (method === 'DELETE') {
      // Excluir projeto
      if (!projectId) {
        return res.status(400).json({ success: false, error: 'ID do projeto é obrigatório' });
      }
      
      // Primeiro, excluir os itens de escopo do projeto
      await supabase
        .from('project_scope_items')
        .delete()
        .eq('project_id', projectId);
      
      // Depois, excluir o projeto
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      
      return res.json({ success: true, message: 'Projeto excluído com sucesso' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de projetos:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};