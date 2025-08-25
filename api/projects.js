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
      project_products (
        product_id,
        products (name, icon)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}

async function createProject(req, res) {
  const { name, description, products } = req.body;

  if (!name || !products || products.length === 0) {
    return res.status(400).json({ error: 'Nome e produtos são obrigatórios' });
  }

  // Criar projeto
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      status: 'draft',
      total_hours: 0,
      total_value: 0
    })
    .select()
    .single();

  if (projectError) {
    return res.status(400).json({ error: projectError.message });
  }

  // Associar produtos ao projeto
  const projectProducts = products.map(productId => ({
    project_id: project.id,
    product_id: productId
  }));

  const { error: productsError } = await supabase
    .from('project_products')
    .insert(projectProducts);

  if (productsError) {
    return res.status(400).json({ error: productsError.message });
  }

  return res.status(201).json(project);
}

async function updateProject(req, res) {
  const { id } = req.query;
  const updates = req.body;

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
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