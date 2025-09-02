import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Buscar respostas de um projeto específico
async function getProjectProductAnswers(req, res) {
  const { projectId, productId } = req.query;
  
  let query = supabase
    .from('project_product_answers')
    .select(`
      *,
      questions (
        id,
        text,
        type,
        billing_model,
        is_complexity_question,
        products (name, icon)
      ),
      question_options (
        id,
        label,
        cost_per_hour,
        hours_impact,
        complexity_weight
      )
    `);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  
  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Salvar ou atualizar resposta
async function saveProjectProductAnswer(req, res) {
  const { project_id, product_id, question_id, answer, numeric_value, option_id } = req.body;

  if (!project_id || !product_id || !question_id) {
    return res.status(400).json({ 
      error: 'project_id, product_id e question_id são obrigatórios' 
    });
  }

  // Verificar se já existe uma resposta para esta combinação
  const { data: existing } = await supabase
    .from('project_product_answers')
    .select('id')
    .eq('project_id', project_id)
    .eq('product_id', product_id)
    .eq('question_id', question_id)
    .single();

  let result;
  
  if (existing) {
    // Atualizar resposta existente
    result = await supabase
      .from('project_product_answers')
      .update({
        answer,
        numeric_value,
        option_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    // Criar nova resposta
    result = await supabase
      .from('project_product_answers')
      .insert({
        project_id,
        product_id,
        question_id,
        answer,
        numeric_value,
        option_id
      })
      .select()
      .single();
  }

  if (result.error) {
    return res.status(400).json({ error: result.error.message });
  }

  return res.status(200).json(result.data);
}

// Salvar múltiplas respostas de uma vez
async function saveMultipleAnswers(req, res) {
  const { project_id, product_id, answers } = req.body;

  if (!project_id || !product_id || !Array.isArray(answers)) {
    return res.status(400).json({ 
      error: 'project_id, product_id e answers (array) são obrigatórios' 
    });
  }

  const results = [];
  const errors = [];

  for (const answerData of answers) {
    const { question_id, answer, numeric_value, option_id } = answerData;

    if (!question_id) {
      errors.push({ error: 'question_id é obrigatório', data: answerData });
      continue;
    }

    // Verificar se já existe uma resposta
    const { data: existing } = await supabase
      .from('project_product_answers')
      .select('id')
      .eq('project_id', project_id)
      .eq('product_id', product_id)
      .eq('question_id', question_id)
      .single();

    let result;
    
    if (existing) {
      // Atualizar resposta existente
      result = await supabase
        .from('project_product_answers')
        .update({
          answer,
          numeric_value,
          option_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Criar nova resposta
      result = await supabase
        .from('project_product_answers')
        .insert({
          project_id,
          product_id,
          question_id,
          answer,
          numeric_value,
          option_id
        })
        .select()
        .single();
    }

    if (result.error) {
      errors.push({ error: result.error.message, data: answerData });
    } else {
      results.push(result.data);
    }
  }

  return res.status(200).json({ 
    success: results.length,
    errors: errors.length,
    results,
    errors
  });
}

// Deletar resposta específica
async function deleteProjectProductAnswer(req, res) {
  const { id } = req.params;

  const { error } = await supabase
    .from('project_product_answers')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Resposta deletada com sucesso' });
}

// Deletar todas as respostas de um produto em um projeto
async function deleteProductAnswers(req, res) {
  const { projectId, productId } = req.params;

  const { error } = await supabase
    .from('project_product_answers')
    .delete()
    .eq('project_id', projectId)
    .eq('product_id', productId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Respostas do produto deletadas com sucesso' });
}

// Calcular complexidade baseada nas respostas
async function calculateComplexity(req, res) {
  const { projectId, productId } = req.query;

  const { data: answers, error } = await supabase
    .from('project_product_answers')
    .select(`
      *,
      questions (is_complexity_question),
      question_options (complexity_weight)
    `)
    .eq('project_id', projectId)
    .eq('product_id', productId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  let totalWeight = 0;
  let complexityAnswers = 0;

  answers.forEach(answer => {
    if (answer.questions?.is_complexity_question) {
      complexityAnswers++;
      if (answer.question_options?.complexity_weight) {
        totalWeight += answer.question_options.complexity_weight;
      } else if (answer.numeric_value) {
        // Para perguntas numéricas, usar lógica simples
        if (answer.numeric_value <= 5) totalWeight += 1;
        else if (answer.numeric_value <= 15) totalWeight += 2;
        else totalWeight += 3;
      }
    }
  });

  let complexityLevel = 'baixo';
  if (complexityAnswers > 0) {
    const averageWeight = totalWeight / complexityAnswers;
    if (averageWeight >= 2.5) complexityLevel = 'complexo';
    else if (averageWeight >= 1.5) complexityLevel = 'medio';
  }

  return res.status(200).json({ 
    complexity_level: complexityLevel,
    total_weight: totalWeight,
    complexity_answers: complexityAnswers,
    average_weight: complexityAnswers > 0 ? totalWeight / complexityAnswers : 0
  });
}

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      if (req.query.calculate === 'complexity') {
        return calculateComplexity(req, res);
      }
      return getProjectProductAnswers(req, res);
    
    case 'POST':
      if (req.body.answers && Array.isArray(req.body.answers)) {
        return saveMultipleAnswers(req, res);
      }
      return saveProjectProductAnswer(req, res);
    
    case 'DELETE':
      if (req.query.projectId && req.query.productId) {
        return deleteProductAnswers(req, res);
      }
      return deleteProjectProductAnswer(req, res);
    
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}