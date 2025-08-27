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
          return await getUserById(req, res);
        }
        return await getUsers(req, res);
      case 'POST':
        return await createUser(req, res);
      case 'PUT':
        return await updateUser(req, res);
      case 'DELETE':
        return await deleteUser(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Função para validar dados do usuário
function validateUserData(userData) {
    const errors = [];
    
    if (!userData.name || userData.name.trim().length === 0) {
        errors.push('Nome é obrigatório');
    }
    
    if (!userData.email || userData.email.trim().length === 0) {
        errors.push('E-mail é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push('E-mail deve ter um formato válido');
    }
    
    return errors;
}

// GET /api/users - Listar todos os usuários
async function getUsers(req, res) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ data });
}

// GET /api/users?id=:id - Buscar usuário por ID
async function getUserById(req, res) {
  const userId = parseInt(req.query.id);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'ID do usuário deve ser um número válido' });
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ data });
}

// POST /api/users - Criar novo usuário
async function createUser(req, res) {
  const userData = req.body;
  
  // Validar dados
  const validationErrors = validateUserData(userData);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: validationErrors
    });
  }
  
  // Verificar se e-mail já existe
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', userData.email.trim().toLowerCase())
    .single();
    
  if (existingUser) {
    return res.status(409).json({ error: 'E-mail já está em uso' });
  }
  
  // Criar novo usuário
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase()
    })
    .select()
    .single();
    
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  return res.status(201).json({ data });
}

// PUT /api/users - Atualizar usuário (ID no body)
async function updateUser(req, res) {
  const { id: userId, ...userData } = req.body;
  
  if (!userId || isNaN(parseInt(userId))) {
    return res.status(400).json({ error: 'ID do usuário deve ser um número válido' });
  }
  
  // Validar dados
  const validationErrors = validateUserData(userData);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: validationErrors
    });
  }
  
  // Verificar se e-mail já existe (exceto para o próprio usuário)
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', userData.email.trim().toLowerCase())
    .neq('id', userId)
    .single();
    
  if (existingUser) {
    return res.status(409).json({ error: 'E-mail já está em uso por outro usuário' });
  }
  
  // Atualizar usuário
  const { data, error } = await supabase
    .from('users')
    .update({
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase()
    })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  return res.status(200).json({ data });
}

// DELETE /api/users - Excluir usuário (ID no body)
async function deleteUser(req, res) {
  const { id: userId } = req.body;
  
  if (!userId || isNaN(parseInt(userId))) {
    return res.status(400).json({ error: 'ID do usuário deve ser um número válido' });
  }
  
  // Excluir usuário
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  return res.status(200).json({ data });
}