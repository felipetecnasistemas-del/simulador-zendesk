import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          return await getQuestionById(req, res);
        }
        return await getQuestions(req, res);
      case 'POST':
        return await createQuestion(req, res);
      case 'PUT':
        return await updateQuestion(req, res);
      case 'DELETE':
        return await deleteQuestion(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Buscar perguntas com filtros
async function getQuestions(req, res) {
  const { product_id, billing_model, is_complexity_question } = req.query;
  
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
  
  if (is_complexity_question !== undefined) {
    query = query.eq('is_complexity_question', is_complexity_question === 'true');
  }

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Buscar pergunta por ID
async function getQuestionById(req, res) {
  const { id } = req.query;
  
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
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Criar nova pergunta
async function createQuestion(req, res) {
  const questionData = req.body;
  
  // Validar dados obrigatórios
  const validation = validateQuestionData(questionData);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors });
  }

  // Iniciar transação
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .insert({
      product_id: questionData.product_id,
      billing_model: questionData.billing_model,
      text: questionData.text,
      type: questionData.type,
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
  if (questionData.type === 'dropdown' && questionData.options && questionData.options.length > 0) {
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
      // Rollback: deletar a pergunta criada
      await supabase.from('questions').delete().eq('id', question.id);
      return res.status(400).json({ error: 'Erro ao criar opções: ' + optionsError.message });
    }
  }

  // Buscar pergunta completa com opções
  const { data: completeQuestion, error: fetchError } = await supabase
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
      )
    `)
    .eq('id', question.id)
    .single();

  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  return res.status(201).json(completeQuestion);
}

// Atualizar pergunta
async function updateQuestion(req, res) {
  const { id } = req.query;
  const questionData = req.body;
  
  // Validar dados
  const validation = validateQuestionData(questionData);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors });
  }

  // Atualizar pergunta
  const { error: questionError } = await supabase
    .from('questions')
    .update({
      product_id: questionData.product_id,
      billing_model: questionData.billing_model,
      text: questionData.text,
      type: questionData.type,
      project_level: questionData.project_level,
      is_complexity_question: questionData.is_complexity_question || false,
      order_index: questionData.order_index || 0
    })
    .eq('id', id);

  if (questionError) {
    return res.status(400).json({ error: questionError.message });
  }

  // Se for pergunta do tipo dropdown, atualizar opções
  if (questionData.type === 'dropdown' && questionData.options) {
    // Deletar opções existentes
    await supabase.from('question_options').delete().eq('question_id', id);
    
    // Inserir novas opções
    if (questionData.options.length > 0) {
      const optionsToInsert = questionData.options.map(option => ({
        question_id: id,
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
        return res.status(400).json({ error: 'Erro ao atualizar opções: ' + optionsError.message });
      }
    }
  }

  // Buscar pergunta atualizada
  const { data: updatedQuestion, error: fetchError } = await supabase
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
      )
    `)
    .eq('id', id)
    .single();

  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  return res.status(200).json(updatedQuestion);
}

// Deletar pergunta
async function deleteQuestion(req, res) {
  const { id } = req.query;
  
  // Verificar se pergunta existe
  const { data: existingQuestion, error: checkError } = await supabase
    .from('questions')
    .select('id')
    .eq('id', id)
    .single();

  if (checkError || !existingQuestion) {
    return res.status(404).json({ error: 'Pergunta não encontrada' });
  }

  // Deletar pergunta (opções serão deletadas automaticamente por CASCADE)
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Pergunta deletada com sucesso' });
}

// Função de validação
function validateQuestionData(questionData) {
  const errors = [];
  
  if (!questionData.product_id) {
    errors.push('product_id é obrigatório');
  }
  
  if (!questionData.billing_model) {
    errors.push('billing_model é obrigatório');
  } else if (!['time_materials', 'escopo_fechado'].includes(questionData.billing_model)) {
    errors.push('billing_model deve ser "time_materials" ou "escopo_fechado"');
  }
  
  if (!questionData.text || questionData.text.trim().length === 0) {
    errors.push('text é obrigatório');
  }
  
  if (!questionData.type) {
    errors.push('type é obrigatório');
  } else if (!['dropdown', 'numeric', 'text'].includes(questionData.type)) {
    errors.push('type deve ser "dropdown", "numeric" ou "text"');
  }
  
  if (questionData.project_level && !['baixo', 'medio', 'complexo'].includes(questionData.project_level)) {
    errors.push('project_level deve ser "baixo", "medio" ou "complexo"');
  }
  
  // Validar opções para perguntas dropdown
  if (questionData.type === 'dropdown') {
    if (!questionData.options || questionData.options.length === 0) {
      errors.push('Perguntas do tipo dropdown devem ter pelo menos uma opção');
    } else {
      questionData.options.forEach((option, index) => {
        if (!option.label || option.label.trim().length === 0) {
          errors.push(`Opção ${index + 1}: label é obrigatório`);
        }
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}