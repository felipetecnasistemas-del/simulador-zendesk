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
        return await getProducts(req, res);
      case 'POST':
        return await createProduct(req, res);
      case 'PUT':
        return await updateProduct(req, res);
      case 'DELETE':
        return await deleteProduct(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getProducts(req, res) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

async function createProduct(req, res) {
  const { name, icon, description, base_hours, hourly_rate } = req.body;

  if (!name || !icon) {
    return res.status(400).json({ error: 'Nome e ícone são obrigatórios' });
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name,
      icon,
      description: description || null,
      questionnaire: {},
      base_hours: base_hours || 40,
      hourly_rate: hourly_rate || 150.00
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json(data);
}

async function updateProduct(req, res) {
  const { id } = req.query;
  const { name, icon, description, base_hours, hourly_rate } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID do produto é obrigatório' });
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (icon) updateData.icon = icon;
  if (description !== undefined) updateData.description = description;
  if (base_hours !== undefined) updateData.base_hours = base_hours;
  if (hourly_rate !== undefined) updateData.hourly_rate = hourly_rate;

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

async function deleteProduct(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID do produto é obrigatório' });
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Produto excluído com sucesso' });
}