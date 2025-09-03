// Exemplo de como as APIs devem ser atualizadas para a nova arquitetura
// Este arquivo mostra os padrões que devem ser seguidos

// ============================================================================
// 1. API para buscar templates (default-projects) - MANTÉM ATUAL
// ============================================================================

// GET /api/default-projects
// Busca templates de scope_items para popular o frontend
async function getDefaultProjects() {
  try {
    const { data, error } = await supabase
      .from('scope_items')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    // Converte para formato esperado pelo frontend
    const convertedData = data.map(item => {
      let values;
      
      if (item.response_type === 'boolean') {
        values = [1, 1, 1, 1, 1, 1]; // Sempre 1 para boolean
      } else {
        values = [
          item.agents_10 || Math.ceil((item.hours * 60 + item.minutes) / 60),
          item.agents_20 || Math.ceil((item.hours * 60 + item.minutes) / 50),
          item.agents_40 || Math.ceil((item.hours * 60 + item.minutes) / 40),
          item.agents_70 || Math.ceil((item.hours * 60 + item.minutes) / 35),
          item.agents_100 || Math.ceil((item.hours * 60 + item.minutes) / 30),
          item.agents_more || Math.ceil((item.hours * 60 + item.minutes) / 25)
        ];
      }

      return {
        name: item.name,
        values: values
      };
    });

    return { success: true, data: convertedData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 2. API para criar projeto - NOVA LÓGICA
// ============================================================================

// POST /api/projects
// Cria projeto e salva itens selecionados com valores calculados
async function createProject(projectData) {
  try {
    const { selected_scope_items, agents_count, ...basicProjectData } = projectData;
    
    // 1. Criar o projeto básico
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        ...basicProjectData,
        agents_count: agents_count || 0
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // 2. Se há itens selecionados, processar e salvar
    if (selected_scope_items && selected_scope_items.length > 0) {
      
      // Buscar dados completos dos templates selecionados
      const scopeItemIds = selected_scope_items.map(item => item.scope_item_id);
      const { data: templates, error: templatesError } = await supabase
        .from('scope_items')
        .select('*')
        .in('id', scopeItemIds);

      if (templatesError) throw templatesError;

      // Calcular valores para cada item baseado no número de agentes
      const calculatedItems = selected_scope_items.map(selectedItem => {
        const template = templates.find(t => t.id === selectedItem.scope_item_id);
        if (!template) return null;

        const { calculatedHours, calculatedMinutes, agentsRange } = calculateItemValues(
          template, 
          agents_count, 
          selectedItem.quantity || 1
        );

        return {
          project_id: project.id,
          scope_item_id: template.id,
          calculated_hours: calculatedHours,
          calculated_minutes: calculatedMinutes,
          calculated_value: (calculatedHours + calculatedMinutes / 60) * 150, // R$ 150/hora
          quantity: selectedItem.quantity || 1,
          agents_range: agentsRange,
          calculation_base: `Template: ${template.name}, Agentes: ${agents_count}, Faixa: ${agentsRange}`
        };
      }).filter(Boolean);

      // Salvar itens calculados
      const { error: itemsError } = await supabase
        .from('project_scope_items')
        .insert(calculatedItems);

      if (itemsError) throw itemsError;

      // Atualizar totais do projeto
      const totalHours = calculatedItems.reduce((sum, item) => sum + item.calculated_hours, 0);
      const totalMinutes = calculatedItems.reduce((sum, item) => sum + item.calculated_minutes, 0);
      const totalValue = calculatedItems.reduce((sum, item) => sum + item.calculated_value, 0);

      await supabase
        .from('projects')
        .update({
          total_hours: totalHours + Math.floor(totalMinutes / 60),
          total_value: totalValue
        })
        .eq('id', project.id);
    }

    return { success: true, data: project };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 3. Função auxiliar para calcular valores baseado no número de agentes
// ============================================================================

function calculateItemValues(template, agentsCount, quantity = 1) {
  let baseValue;
  let agentsRange;

  // Determinar faixa de agentes e valor base
  if (agentsCount <= 10) {
    baseValue = template.agents_10;
    agentsRange = '10';
  } else if (agentsCount <= 20) {
    baseValue = template.agents_20;
    agentsRange = '20';
  } else if (agentsCount <= 40) {
    baseValue = template.agents_40;
    agentsRange = '40';
  } else if (agentsCount <= 70) {
    baseValue = template.agents_70;
    agentsRange = '70';
  } else if (agentsCount <= 100) {
    baseValue = template.agents_100;
    agentsRange = '100';
  } else {
    baseValue = template.agents_more;
    agentsRange = 'more';
  }

  // Se não há valor específico para a faixa, usar cálculo baseado em horas/minutos
  if (!baseValue) {
    const totalMinutes = template.hours * 60 + template.minutes;
    const factor = agentsCount <= 10 ? 1 : 
                  agentsCount <= 20 ? 0.8 : 
                  agentsCount <= 40 ? 0.6 : 
                  agentsCount <= 70 ? 0.5 : 
                  agentsCount <= 100 ? 0.4 : 0.3;
    
    baseValue = Math.ceil(totalMinutes * factor / 60);
  }

  // Para boolean, sempre retorna 1 hora se selecionado
  if (template.response_type === 'boolean') {
    return {
      calculatedHours: quantity > 0 ? 1 : 0,
      calculatedMinutes: 0,
      agentsRange
    };
  }

  // Para numeric, multiplica pela quantidade
  const totalHours = baseValue * quantity;
  
  return {
    calculatedHours: Math.floor(totalHours),
    calculatedMinutes: Math.round((totalHours % 1) * 60),
    agentsRange
  };
}

// ============================================================================
// 4. API para buscar projeto com itens - NOVA
// ============================================================================

// GET /api/projects/:id
// Busca projeto completo com itens selecionados
async function getProjectWithItems(projectId) {
  try {
    // Buscar projeto básico
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // Buscar itens do projeto com dados dos templates
    const { data: projectItems, error: itemsError } = await supabase
      .from('project_scope_items')
      .select(`
        *,
        scope_items (
          id,
          name,
          description,
          category_id,
          scope_categories (name, color)
        )
      `)
      .eq('project_id', projectId);

    if (itemsError) throw itemsError;

    return {
      success: true,
      data: {
        ...project,
        scope_items: projectItems
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 5. Exemplo de uso no frontend
// ============================================================================

/*
// No new-project.js, ao criar projeto:
const projectData = {
  name: 'Projeto Teste',
  description: 'Descrição do projeto',
  agents_count: 25, // Número de agentes
  selected_scope_items: [
    { scope_item_id: 1, quantity: 1 }, // Automação
    { scope_item_id: 2, quantity: 3 }, // Campos de usuário
    { scope_item_id: 3, quantity: 1 }  // Integração
  ]
};

// A API calculará automaticamente:
// - Para 25 agentes, usará a faixa 'agents_40'
// - Automação: agents_40 = 8 horas * 1 = 8 horas
// - Campos: agents_40 = 1 hora * 3 = 3 horas (boolean)
// - Integração: agents_40 = 12 horas * 1 = 12 horas
// Total: 23 horas
*/

module.exports = {
  getDefaultProjects,
  createProject,
  getProjectWithItems,
  calculateItemValues
};