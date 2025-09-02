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
    // Rotas especiais
    if (req.method === 'POST' && req.query.action === 'calculate') {
      return await calculateProject(req, res);
    }
    if (req.method === 'POST' && req.query.action === 'save-answers') {
      return await saveProjectAnswers(req, res);
    }
    if (req.method === 'GET' && req.query.action === 'answers') {
      return await getProjectAnswers(req, res);
    }
    
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          return await getProjectById(req, res);
        }
        return await getProjects(req, res);
      case 'POST':
        return await createProject(req, res);
      case 'PUT':
        return await updateProject(req, res);
      case 'DELETE':
        return await deleteProject(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getProjects(req, res) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      users (id, name, email),
      project_products (
        product_id,
        status,
        hours,
        value,
        products (name, icon)
      ),
      project_product_answers (
        id,
        product_id,
        question_id,
        answer,
        numeric_value,
        option_id,
        questions (text, type, billing_model, products(name, icon)),
        question_options (label, cost_per_hour, hours_impact, complexity_weight)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

async function createProject(req, res) {
  const { name, description, user_id, billing_model, complexity_level } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome do projeto é obrigatório' });
  }
  
  if (!billing_model) {
    return res.status(400).json({ error: 'Modelo de faturamento é obrigatório' });
  }
  
  if (!['time_materials', 'escopo_fechado'].includes(billing_model)) {
    return res.status(400).json({ error: 'Modelo de faturamento deve ser "time_materials" ou "escopo_fechado"' });
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      user_id,
      billing_model,
      complexity_level,
      status: 'draft'
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json(data);
}

async function updateProject(req, res) {
  const { id } = req.query;
  const { name, description, status, user_id, billing_model, complexity_level } = req.body;
  
  const updateData = {
    updated_at: new Date().toISOString()
  };
  
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (user_id !== undefined) updateData.user_id = user_id;
  if (billing_model !== undefined) {
    if (!['time_materials', 'escopo_fechado'].includes(billing_model)) {
      return res.status(400).json({ error: 'Modelo de faturamento deve ser "time_materials" ou "escopo_fechado"' });
    }
    updateData.billing_model = billing_model;
  }
  if (complexity_level !== undefined) {
    if (complexity_level && !['baixo', 'medio', 'complexo'].includes(complexity_level)) {
      return res.status(400).json({ error: 'Nível de complexidade deve ser "baixo", "medio" ou "complexo"' });
    }
    updateData.complexity_level = complexity_level;
  }
  
  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

async function deleteProject(req, res) {
  const { id } = req.query;

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Projeto deletado com sucesso' });
}

// Buscar projeto por ID
async function getProjectById(req, res) {
  const { id } = req.query;
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      users (id, name, email),
      project_products (
        product_id,
        status,
        hours,
        value,
        products (name, icon)
      ),
      project_answers (
        id,
        question_id,
        answer,
        numeric_value,
        option_id,
        questions (text, type, billing_model),
        question_options (label, cost_per_hour, hours_impact)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Salvar respostas do projeto por produto
async function saveProjectAnswers(req, res) {
  const { project_id, product_id, answers } = req.body;
  
  if (!project_id || !product_id || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'project_id, product_id e answers são obrigatórios' });
  }

  // Deletar respostas existentes para este produto no projeto
  await supabase
    .from('project_product_answers')
    .delete()
    .eq('project_id', project_id)
    .eq('product_id', product_id);

  // Inserir novas respostas
  const answersToInsert = answers.map(answer => ({
    project_id: project_id,
    product_id: product_id,
    question_id: answer.question_id,
    answer: answer.answer,
    numeric_value: answer.numeric_value,
    option_id: answer.option_id
  }));

  const { data, error } = await supabase
    .from('project_product_answers')
    .insert(answersToInsert)
    .select(`
      *,
      questions (text, type, billing_model, products(name, icon)),
      question_options (label, cost_per_hour, hours_impact, complexity_weight)
    `);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Buscar respostas do projeto por produto
async function getProjectAnswers(req, res) {
  const { id, product_id } = req.query; // project_id e product_id opcional
  
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
    `)
    .eq('project_id', id);

  if (product_id) {
    query = query.eq('product_id', product_id);
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Calcular projeto baseado no modelo de faturamento
async function calculateProject(req, res) {
  const { project_id, product_ids } = req.body;
  
  if (!project_id) {
    return res.status(400).json({ error: 'project_id é obrigatório' });
  }

  // Buscar projeto
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', project_id)
    .single();

  if (projectError || !project) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  let calculation = {
    project_id: project_id,
    billing_model: project.billing_model,
    complexity_level: project.complexity_level,
    products: [],
    total_hours: 0,
    total_value: 0
  };

  if (project.billing_model === 'time_materials') {
    // Time & Materials: calcular baseado nas respostas
    calculation = await calculateTimeAndMaterials(project_id, product_ids || []);
  } else if (project.billing_model === 'escopo_fechado') {
    // Escopo Fechado: calcular baseado na complexidade
    calculation = await calculateFixedScope(project, product_ids || []);
  }

  // Atualizar totais do projeto
  await supabase
    .from('projects')
    .update({
      total_hours: calculation.total_hours,
      total_value: calculation.total_value,
      updated_at: new Date().toISOString()
    })
    .eq('id', project_id);

  return res.status(200).json(calculation);
}

// Calcular Time & Materials
async function calculateTimeAndMaterials(project_id, product_ids) {
  const { data: answers, error } = await supabase
    .from('project_answers')
    .select(`
      *,
      questions (product_id, billing_model),
      question_options (cost_per_hour, hours_impact)
    `)
    .eq('project_id', project_id);

  if (error) {
    throw new Error('Erro ao buscar respostas: ' + error.message);
  }

  let totalHours = 0;
  let totalValue = 0;
  const productCalculations = {};

  // Processar respostas
  for (const answer of answers) {
    if (answer.questions?.billing_model === 'time_materials') {
      const productId = answer.questions.product_id;
      
      if (!productCalculations[productId]) {
        productCalculations[productId] = { hours: 0, value: 0 };
      }

      if (answer.question_options) {
        // Resposta com opção selecionada
        const hours = answer.question_options.hours_impact || 0;
        const costPerHour = answer.question_options.cost_per_hour || 150;
        
        productCalculations[productId].hours += hours;
        productCalculations[productId].value += hours * costPerHour;
      } else if (answer.numeric_value) {
        // Resposta numérica (assumir custo padrão)
        const hours = answer.numeric_value;
        const costPerHour = 150;
        
        productCalculations[productId].hours += hours;
        productCalculations[productId].value += hours * costPerHour;
      }
    }
  }

  // Somar totais
  for (const productId in productCalculations) {
    totalHours += productCalculations[productId].hours;
    totalValue += productCalculations[productId].value;
  }

  return {
    project_id,
    billing_model: 'time_materials',
    products: productCalculations,
    total_hours: totalHours,
    total_value: totalValue
  };
}

// Calcular Escopo Fechado
async function calculateFixedScope(project, product_ids) {
  let complexityLevel = project.complexity_level;
  
  // Se não tem complexidade definida, determinar pelas respostas
  if (!complexityLevel) {
    complexityLevel = await determineComplexityLevel(project.id);
    
    // Atualizar projeto com complexidade determinada
    await supabase
      .from('projects')
      .update({ complexity_level: complexityLevel })
      .eq('id', project.id);
  }

  // Buscar horas padrão para os produtos
  const { data: defaultHours, error } = await supabase
    .from('default_hours')
    .select(`
      *,
      products (id, name, icon)
    `)
    .in('product_id', product_ids)
    .eq('complexity_level', complexityLevel);

  if (error) {
    throw new Error('Erro ao buscar horas padrão: ' + error.message);
  }

  let totalHours = 0;
  let totalValue = 0;
  const productCalculations = {};

  // Agrupar por produto
  for (const hour of defaultHours) {
    const productId = hour.product_id;
    
    if (!productCalculations[productId]) {
      productCalculations[productId] = {
        product: hour.products,
        phases: [],
        total_hours: 0,
        total_value: 0
      };
    }

    const phaseValue = hour.hours * hour.hourly_rate;
    productCalculations[productId].phases.push({
      phase: hour.phase,
      hours: hour.hours,
      hourly_rate: hour.hourly_rate,
      value: phaseValue
    });
    
    productCalculations[productId].total_hours += hour.hours;
    productCalculations[productId].total_value += phaseValue;
    
    totalHours += hour.hours;
    totalValue += phaseValue;
  }

  return {
    project_id: project.id,
    billing_model: 'escopo_fechado',
    complexity_level: complexityLevel,
    products: productCalculations,
    total_hours: totalHours,
    total_value: totalValue
  };
}

// Determinar nível de complexidade baseado nas respostas por produto
async function determineComplexityLevel(project_id) {
  const { data: answers, error } = await supabase
    .from('project_product_answers')
    .select(`
      *,
      questions (is_complexity_question),
      question_options (complexity_weight)
    `)
    .eq('project_id', project_id);

  if (error || !answers.length) {
    return 'medio'; // Fallback
  }

  let complexityScore = 0;
  let complexityQuestions = 0;

  for (const answer of answers) {
    if (answer.questions?.is_complexity_question) {
      complexityQuestions++;
      
      if (answer.question_options?.complexity_weight) {
        complexityScore += answer.question_options.complexity_weight;
      } else if (answer.numeric_value) {
        // Lógica para perguntas numéricas (exemplo: agentes)
        if (answer.numeric_value <= 10) complexityScore += 1;
        else if (answer.numeric_value <= 50) complexityScore += 2;
        else complexityScore += 3;
      }
    }
  }

  if (complexityQuestions === 0) {
    return 'medio'; // Fallback
  }

  const averageScore = complexityScore / complexityQuestions;
  
  if (averageScore <= 1.5) return 'baixo';
  if (averageScore <= 2.5) return 'medio';
  return 'complexo';
}