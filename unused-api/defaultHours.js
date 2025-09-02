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
          return await getDefaultHourById(req, res);
        }
        return await getDefaultHours(req, res);
      case 'POST':
        return await createDefaultHour(req, res);
      case 'PUT':
        return await updateDefaultHour(req, res);
      case 'DELETE':
        return await deleteDefaultHour(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Buscar horas padrão com filtros
async function getDefaultHours(req, res) {
  const { product_id, complexity_level, phase } = req.query;
  
  let query = supabase
    .from('default_hours')
    .select(`
      *,
      products (id, name, icon)
    `)
    .order('product_id', { ascending: true })
    .order('complexity_level', { ascending: true })
    .order('phase', { ascending: true });

  // Aplicar filtros
  if (product_id) {
    query = query.eq('product_id', product_id);
  }
  
  if (complexity_level) {
    query = query.eq('complexity_level', complexity_level);
  }
  
  if (phase) {
    query = query.eq('phase', phase);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Buscar hora padrão por ID
async function getDefaultHourById(req, res) {
  const { id } = req.query;
  
  const { data, error } = await supabase
    .from('default_hours')
    .select(`
      *,
      products (id, name, icon)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Criar nova regra de horas padrão
async function createDefaultHour(req, res) {
  const hourData = req.body;
  
  // Validar dados obrigatórios
  const validation = validateDefaultHourData(hourData);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors });
  }

  // Verificar se já existe uma regra para o mesmo produto/complexidade/fase
  const { data: existing, error: checkError } = await supabase
    .from('default_hours')
    .select('id')
    .eq('product_id', hourData.product_id)
    .eq('complexity_level', hourData.complexity_level)
    .eq('phase', hourData.phase)
    .single();

  if (existing) {
    return res.status(400).json({ 
      error: 'Já existe uma regra para este produto, nível de complexidade e fase' 
    });
  }

  // Criar nova regra
  const { data, error } = await supabase
    .from('default_hours')
    .insert({
      product_id: hourData.product_id,
      complexity_level: hourData.complexity_level,
      phase: hourData.phase,
      hours: hourData.hours,
      hourly_rate: hourData.hourly_rate || 150.00
    })
    .select(`
      *,
      products (id, name, icon)
    `)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json(data);
}

// Atualizar regra de horas padrão
async function updateDefaultHour(req, res) {
  const { id } = req.query;
  const hourData = req.body;
  
  // Validar dados
  const validation = validateDefaultHourData(hourData);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors });
  }

  // Verificar se existe outra regra com os mesmos parâmetros (exceto a atual)
  const { data: existing, error: checkError } = await supabase
    .from('default_hours')
    .select('id')
    .eq('product_id', hourData.product_id)
    .eq('complexity_level', hourData.complexity_level)
    .eq('phase', hourData.phase)
    .neq('id', id)
    .single();

  if (existing) {
    return res.status(400).json({ 
      error: 'Já existe uma regra para este produto, nível de complexidade e fase' 
    });
  }

  // Atualizar regra
  const { data, error } = await supabase
    .from('default_hours')
    .update({
      product_id: hourData.product_id,
      complexity_level: hourData.complexity_level,
      phase: hourData.phase,
      hours: hourData.hours,
      hourly_rate: hourData.hourly_rate || 150.00
    })
    .eq('id', id)
    .select(`
      *,
      products (id, name, icon)
    `)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Deletar regra de horas padrão
async function deleteDefaultHour(req, res) {
  const { id } = req.query;
  
  // Verificar se regra existe
  const { data: existing, error: checkError } = await supabase
    .from('default_hours')
    .select('id')
    .eq('id', id)
    .single();

  if (checkError || !existing) {
    return res.status(404).json({ error: 'Regra de horas padrão não encontrada' });
  }

  // Deletar regra
  const { error } = await supabase
    .from('default_hours')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Regra de horas padrão deletada com sucesso' });
}

// Endpoint especial para buscar horas por produto e complexidade
export async function getHoursByProductAndComplexity(req, res) {
  const { product_id, complexity_level } = req.query;
  
  if (!product_id || !complexity_level) {
    return res.status(400).json({ 
      error: 'product_id e complexity_level são obrigatórios' 
    });
  }

  const { data, error } = await supabase
    .from('default_hours')
    .select(`
      *,
      products (id, name, icon)
    `)
    .eq('product_id', product_id)
    .eq('complexity_level', complexity_level)
    .order('phase', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Calcular totais
  const totalHours = data.reduce((sum, item) => sum + (item.hours || 0), 0);
  const totalValue = data.reduce((sum, item) => sum + ((item.hours || 0) * (item.hourly_rate || 0)), 0);

  return res.status(200).json({
    hours_by_phase: data,
    summary: {
      total_hours: totalHours,
      total_value: totalValue,
      average_hourly_rate: data.length > 0 ? data[0].hourly_rate : 150.00
    }
  });
}

// Endpoint para inicializar dados padrão para um produto
export async function initializeDefaultHoursForProduct(req, res) {
  const { product_id } = req.body;
  
  if (!product_id) {
    return res.status(400).json({ error: 'product_id é obrigatório' });
  }

  // Fases padrão
  const phases = [
    'project-management',
    'discovery-design', 
    'configuration',
    'testing-adjustments',
    'go-live'
  ];

  // Níveis de complexidade
  const complexityLevels = ['baixo', 'medio', 'complexo'];

  // Horas base por nível (multiplicadores)
  const baseHours = {
    'project-management': { baixo: 15, medio: 22, complexo: 35 },
    'discovery-design': { baixo: 10, medio: 16, complexo: 25 },
    'configuration': { baixo: 30, medio: 54, complexo: 80 },
    'testing-adjustments': { baixo: 8, medio: 11, complexo: 18 },
    'go-live': { baixo: 12, medio: 20, complexo: 30 }
  };

  const hoursToInsert = [];
  
  for (const phase of phases) {
    for (const level of complexityLevels) {
      hoursToInsert.push({
        product_id: product_id,
        complexity_level: level,
        phase: phase,
        hours: baseHours[phase][level],
        hourly_rate: 150.00
      });
    }
  }

  const { data, error } = await supabase
    .from('default_hours')
    .insert(hoursToInsert)
    .select(`
      *,
      products (id, name, icon)
    `);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({
    message: 'Horas padrão inicializadas com sucesso',
    data: data
  });
}

// Função de validação
function validateDefaultHourData(hourData) {
  const errors = [];
  
  if (!hourData.product_id) {
    errors.push('product_id é obrigatório');
  }
  
  if (!hourData.complexity_level) {
    errors.push('complexity_level é obrigatório');
  } else if (!['baixo', 'medio', 'complexo'].includes(hourData.complexity_level)) {
    errors.push('complexity_level deve ser "baixo", "medio" ou "complexo"');
  }
  
  if (!hourData.phase || hourData.phase.trim().length === 0) {
    errors.push('phase é obrigatório');
  }
  
  if (hourData.hours === undefined || hourData.hours === null) {
    errors.push('hours é obrigatório');
  } else if (isNaN(hourData.hours) || hourData.hours < 0) {
    errors.push('hours deve ser um número maior ou igual a 0');
  }
  
  if (hourData.hourly_rate !== undefined && hourData.hourly_rate !== null) {
    if (isNaN(hourData.hourly_rate) || hourData.hourly_rate < 0) {
      errors.push('hourly_rate deve ser um número maior ou igual a 0');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}