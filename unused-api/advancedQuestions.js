const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Buscar perguntas avançadas com todas as vinculações
async function getAdvancedQuestions(req, res) {
  const { product_id, billing_model } = req.query;
  
  let query = supabase
    .from('questions')
    .select(`
      *,
      products (id, name, icon),
      question_options (
        id,
        label,
        value,
        numeric_value,
        cost_per_hour,
        hours_impact,
        complexity_weight
      ),
      question_scope_items (
        id,
        quantity_per_unit,
        option_id,
        scope_items (
          id,
          name,
          description,
          points,
          hours,
          minutes,
          scope_categories (id, name, color)
        )
      ),
      question_agent_rules (
        id,
        min_agents,
        max_agents,
        rule_order,
        ignore_question,
        agent_rule_scope_items (
          id,
          quantity,
          scope_items (
            id,
            name,
            description,
            points,
            hours,
            minutes,
            scope_categories (id, name, color)
          )
        )
      )
    `)
    .order('order_index', { ascending: true });

  // Aplicar filtros
  if (product_id) {
    query = query.eq('product_id', product_id);
  }
  
  if (billing_model) {
    query = query.eq('billing_model', billing_model);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Buscar pergunta avançada por ID
async function getAdvancedQuestionById(req, res) {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      products (id, name, icon),
      question_options (
        id,
        label,
        value,
        numeric_value,
        cost_per_hour,
        hours_impact,
        complexity_weight
      ),
      question_scope_items (
        id,
        quantity_per_unit,
        option_id,
        scope_items (
          id,
          name,
          description,
          points,
          hours,
          minutes,
          scope_categories (id, name, color)
        )
      ),
      question_agent_rules (
        id,
        min_agents,
        max_agents,
        rule_order,
        ignore_question,
        agent_rule_scope_items (
          id,
          quantity,
          scope_items (
            id,
            name,
            description,
            points,
            hours,
            minutes,
            scope_categories (id, name, color)
          )
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Criar pergunta avançada
async function createAdvancedQuestion(req, res) {
  const questionData = req.body;
  
  // Validar dados obrigatórios
  const validation = validateAdvancedQuestionData(questionData);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors });
  }

  try {
    // Iniciar transação criando a pergunta
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        product_id: questionData.product_id,
        billing_model: questionData.billing_model,
        text: questionData.text,
        type: questionData.type,
        answer_type: questionData.answer_type,
        is_required: questionData.is_required || false,
        has_agent_rules: questionData.has_agent_rules || false,
        ignore_if_not_answered: questionData.ignore_if_not_answered || false,
        project_level: questionData.project_level,
        is_complexity_question: questionData.is_complexity_question || false,
        order_index: questionData.order_index || 0
      })
      .select()
      .single();

    if (questionError) {
      return res.status(400).json({ error: questionError.message });
    }

    // Se for pergunta do tipo dropdown, inserir opções
    if (questionData.answer_type === 'dropdown' && questionData.options && questionData.options.length > 0) {
      const optionsToInsert = questionData.options.map(option => ({
        question_id: question.id,
        label: option.label,
        value: option.value,
        numeric_value: option.numeric_value,
        cost_per_hour: option.cost_per_hour || 0,
        hours_impact: option.hours_impact || 0,
        complexity_weight: option.complexity_weight || 0
      }));

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(optionsToInsert);

      if (optionsError) {
        // Rollback: deletar pergunta criada
        await supabase.from('questions').delete().eq('id', question.id);
        return res.status(400).json({ error: optionsError.message });
      }
    }

    // Inserir vinculações com itens de escopo
    if (questionData.scope_items && questionData.scope_items.length > 0) {
      const scopeItemsToInsert = questionData.scope_items.map(item => ({
        question_id: question.id,
        scope_item_id: item.scope_item_id,
        quantity_per_unit: item.quantity_per_unit || 1.0,
        option_id: item.option_id || null
      }));

      const { error: scopeItemsError } = await supabase
        .from('question_scope_items')
        .insert(scopeItemsToInsert);

      if (scopeItemsError) {
        // Rollback: deletar pergunta e opções criadas
        await supabase.from('questions').delete().eq('id', question.id);
        return res.status(400).json({ error: scopeItemsError.message });
      }
    }

    // Inserir regras de agentes se especificado
    if (questionData.has_agent_rules && questionData.agent_rules && questionData.agent_rules.length > 0) {
      for (const rule of questionData.agent_rules) {
        const { data: agentRule, error: ruleError } = await supabase
          .from('question_agent_rules')
          .insert({
            question_id: question.id,
            min_agents: rule.min_agents,
            max_agents: rule.max_agents,
            rule_order: rule.rule_order || 0,
            ignore_question: rule.ignore_question || false
          })
          .select()
          .single();

        if (ruleError) {
          // Rollback: deletar pergunta criada
          await supabase.from('questions').delete().eq('id', question.id);
          return res.status(400).json({ error: ruleError.message });
        }

        // Inserir itens de escopo para esta regra
        if (rule.scope_items && rule.scope_items.length > 0) {
          const ruleScopeItems = rule.scope_items.map(item => ({
            agent_rule_id: agentRule.id,
            scope_item_id: item.scope_item_id,
            quantity: item.quantity || 1.0
          }));

          const { error: ruleScopeError } = await supabase
            .from('agent_rule_scope_items')
            .insert(ruleScopeItems);

          if (ruleScopeError) {
            // Rollback: deletar pergunta criada
            await supabase.from('questions').delete().eq('id', question.id);
            return res.status(400).json({ error: ruleScopeError.message });
          }
        }
      }
    }

    // Buscar pergunta criada com todas as vinculações
    const { data: createdQuestion } = await supabase
      .from('questions')
      .select(`
        *,
        question_options (*),
        question_scope_items (
          *,
          scope_items (*)
        ),
        question_agent_rules (
          *,
          agent_rule_scope_items (
            *,
            scope_items (*)
          )
        )
      `)
      .eq('id', question.id)
      .single();

    return res.status(201).json(createdQuestion);

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
}

// Atualizar pergunta avançada
async function updateAdvancedQuestion(req, res) {
  const { id } = req.params;
  const questionData = req.body;
  
  // Validar dados
  const validation = validateAdvancedQuestionData(questionData);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors });
  }

  try {
    // Atualizar pergunta principal
    const { error: questionError } = await supabase
      .from('questions')
      .update({
        text: questionData.text,
        type: questionData.type,
        answer_type: questionData.answer_type,
        is_required: questionData.is_required,
        has_agent_rules: questionData.has_agent_rules,
        ignore_if_not_answered: questionData.ignore_if_not_answered,
        project_level: questionData.project_level,
        is_complexity_question: questionData.is_complexity_question,
        order_index: questionData.order_index
      })
      .eq('id', id);

    if (questionError) {
      return res.status(400).json({ error: questionError.message });
    }

    // Atualizar opções (deletar existentes e recriar)
    await supabase.from('question_options').delete().eq('question_id', id);
    
    if (questionData.answer_type === 'dropdown' && questionData.options && questionData.options.length > 0) {
      const optionsToInsert = questionData.options.map(option => ({
        question_id: id,
        label: option.label,
        value: option.value,
        numeric_value: option.numeric_value,
        cost_per_hour: option.cost_per_hour || 0,
        hours_impact: option.hours_impact || 0,
        complexity_weight: option.complexity_weight || 0
      }));

      await supabase.from('question_options').insert(optionsToInsert);
    }

    // Atualizar vinculações com itens de escopo
    await supabase.from('question_scope_items').delete().eq('question_id', id);
    
    if (questionData.scope_items && questionData.scope_items.length > 0) {
      const scopeItemsToInsert = questionData.scope_items.map(item => ({
        question_id: id,
        scope_item_id: item.scope_item_id,
        quantity_per_unit: item.quantity_per_unit || 1.0,
        option_id: item.option_id || null
      }));

      await supabase.from('question_scope_items').insert(scopeItemsToInsert);
    }

    // Atualizar regras de agentes
    await supabase.from('question_agent_rules').delete().eq('question_id', id);
    
    if (questionData.has_agent_rules && questionData.agent_rules && questionData.agent_rules.length > 0) {
      for (const rule of questionData.agent_rules) {
        const { data: agentRule } = await supabase
          .from('question_agent_rules')
          .insert({
            question_id: id,
            min_agents: rule.min_agents,
            max_agents: rule.max_agents,
            rule_order: rule.rule_order || 0,
            ignore_question: rule.ignore_question || false
          })
          .select()
          .single();

        if (rule.scope_items && rule.scope_items.length > 0) {
          const ruleScopeItems = rule.scope_items.map(item => ({
            agent_rule_id: agentRule.id,
            scope_item_id: item.scope_item_id,
            quantity: item.quantity || 1.0
          }));

          await supabase.from('agent_rule_scope_items').insert(ruleScopeItems);
        }
      }
    }

    // Buscar pergunta atualizada
    const { data: updatedQuestion } = await supabase
      .from('questions')
      .select(`
        *,
        question_options (*),
        question_scope_items (
          *,
          scope_items (*)
        ),
        question_agent_rules (
          *,
          agent_rule_scope_items (
            *,
            scope_items (*)
          )
        )
      `)
      .eq('id', id)
      .single();

    return res.status(200).json(updatedQuestion);

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
}

// Deletar pergunta avançada
async function deleteAdvancedQuestion(req, res) {
  const { id } = req.params;
  
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Pergunta deletada com sucesso' });
}

// Calcular escopo baseado em resposta de pergunta
async function calculateQuestionScope(req, res) {
  const { question_id, answer_value, agents_count } = req.body;
  
  try {
    // Buscar pergunta com vinculações
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select(`
        *,
        question_scope_items (
          *,
          scope_items (*)
        ),
        question_agent_rules (
          *,
          agent_rule_scope_items (
            *,
            scope_items (*)
          )
        )
      `)
      .eq('id', question_id)
      .single();

    if (questionError) {
      return res.status(400).json({ error: questionError.message });
    }

    let scopeItems = [];

    // Se a pergunta foi respondida
    if (answer_value !== null && answer_value !== undefined && answer_value !== '') {
      // Para perguntas numéricas
      if (question.answer_type === 'numeric') {
        const numericValue = parseFloat(answer_value);
        question.question_scope_items.forEach(item => {
          if (!item.option_id) { // Itens não vinculados a opções específicas
            scopeItems.push({
              scope_item: item.scope_items,
              quantity: numericValue * item.quantity_per_unit
            });
          }
        });
      }
      // Para perguntas dropdown
      else if (question.answer_type === 'dropdown') {
        question.question_scope_items.forEach(item => {
          if (item.option_id === answer_value) {
            scopeItems.push({
              scope_item: item.scope_items,
              quantity: item.quantity_per_unit
            });
          }
        });
      }
    }
    // Se a pergunta não foi respondida, usar regras de agentes
    else if (agents_count && question.has_agent_rules) {
      const applicableRule = question.question_agent_rules.find(rule => 
        agents_count >= rule.min_agents && agents_count <= rule.max_agents
      );

      if (applicableRule && !applicableRule.ignore_question) {
        applicableRule.agent_rule_scope_items.forEach(item => {
          scopeItems.push({
            scope_item: item.scope_items,
            quantity: item.quantity
          });
        });
      }
    }

    return res.status(200).json({
      question,
      scope_items: scopeItems,
      total_points: scopeItems.reduce((sum, item) => sum + (item.scope_item.points * item.quantity), 0),
      total_hours: scopeItems.reduce((sum, item) => sum + (item.scope_item.hours * item.quantity), 0),
      total_minutes: scopeItems.reduce((sum, item) => sum + (item.scope_item.minutes * item.quantity), 0)
    });

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
}

// Função de validação
function validateAdvancedQuestionData(data) {
  const errors = [];
  
  if (!data.product_id) {
    errors.push('product_id é obrigatório');
  }
  
  if (!data.billing_model) {
    errors.push('billing_model é obrigatório');
  }
  
  if (!data.text || data.text.trim() === '') {
    errors.push('text é obrigatório');
  }
  
  if (!data.answer_type || !['numeric', 'dropdown'].includes(data.answer_type)) {
    errors.push('answer_type deve ser "numeric" ou "dropdown"');
  }
  
  if (data.answer_type === 'dropdown' && (!data.options || data.options.length === 0)) {
    errors.push('Perguntas do tipo dropdown devem ter pelo menos uma opção');
  }
  
  if (data.has_agent_rules && data.agent_rules) {
    data.agent_rules.forEach((rule, index) => {
      if (rule.min_agents < 0) {
        errors.push(`Regra ${index + 1}: min_agents deve ser >= 0`);
      }
      if (rule.max_agents < rule.min_agents) {
        errors.push(`Regra ${index + 1}: max_agents deve ser >= min_agents`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

module.exports = {
  getAdvancedQuestions,
  getAdvancedQuestionById,
  createAdvancedQuestion,
  updateAdvancedQuestion,
  deleteAdvancedQuestion,
  calculateQuestionScope
};