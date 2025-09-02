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
        return await getQuestionnaires(req, res);
      case 'POST':
        return await saveAnswers(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getQuestionnaires(req, res) {
  const { project_id, product_id } = req.query;

  if (!project_id || !product_id) {
    return res.status(400).json({ error: 'project_id e product_id são obrigatórios' });
  }

  // Buscar questionário do produto
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('questionnaire')
    .eq('id', product_id)
    .single();

  if (productError) {
    return res.status(400).json({ error: productError.message });
  }

  // Buscar respostas salvas
  const { data: answers, error: answersError } = await supabase
    .from('questionnaire_answers')
    .select('*')
    .eq('project_id', project_id)
    .eq('product_id', product_id);

  if (answersError) {
    return res.status(400).json({ error: answersError.message });
  }

  // Converter respostas para formato de objeto
  const answersMap = {};
  answers.forEach(answer => {
    answersMap[answer.question_key] = answer.answer_value;
  });

  return res.status(200).json({
    questionnaire: product.questionnaire,
    answers: answersMap
  });
}

async function saveAnswers(req, res) {
  const { project_id, product_id, answers } = req.body;

  if (!project_id || !product_id || !answers) {
    return res.status(400).json({ error: 'project_id, product_id e answers são obrigatórios' });
  }

  // Deletar respostas existentes
  await supabase
    .from('questionnaire_answers')
    .delete()
    .eq('project_id', project_id)
    .eq('product_id', product_id);

  // Inserir novas respostas
  const answersToInsert = Object.entries(answers).map(([key, value]) => ({
    project_id,
    product_id,
    question_key: key,
    answer_value: value
  }));

  const { error } = await supabase
    .from('questionnaire_answers')
    .insert(answersToInsert);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Calcular horas e valor baseado nas respostas
  const calculatedData = calculateProjectData(answers, product_id);

  // Atualizar projeto com novos valores
  const { error: updateError } = await supabase
    .from('project_products')
    .update({
      hours: calculatedData.hours,
      value: calculatedData.value,
      status: 'configured'
    })
    .eq('project_id', project_id)
    .eq('product_id', product_id);

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  return res.status(200).json({ 
    message: 'Respostas salvas com sucesso',
    calculatedData
  });
}

function calculateProjectData(answers, productId) {
  // Lógica de cálculo baseada no produto e respostas
  // Esta é uma versão simplificada - você pode expandir conforme necessário
  
  let baseHours = 40; // Horas base
  let hourlyRate = 150; // Taxa por hora
  
  // Ajustar baseado nas respostas
  Object.entries(answers).forEach(([key, value]) => {
    if (typeof value === 'string' && value.toLowerCase().includes('sim')) {
      baseHours += 10;
    }
    if (typeof value === 'number' && value > 100) {
      baseHours += value * 0.1;
    }
  });
  
  return {
    hours: Math.round(baseHours),
    value: Math.round(baseHours * hourlyRate)
  };
}