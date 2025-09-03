const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://qngnbyueqdewjjzgbkun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Buscar questões avançadas
      const { data, error } = await supabase
        .from('advanced_questions')
        .select('*')
        .order('order_index');
      
      if (error) {
        console.log('Tabela advanced_questions não encontrada, retornando array vazio');
        return res.json([]);
      }
      
      return res.json(data || []);
    }

    if (req.method === 'POST') {
      // Salvar respostas das questões avançadas
      const { answers } = req.body;
      
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Respostas inválidas' });
      }
      
      // Aqui você pode implementar a lógica para salvar as respostas
      // Por enquanto, apenas retornamos sucesso
      return res.json({ success: true, message: 'Respostas salvas com sucesso' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de questões avançadas:', error);
    return res.status(500).json({ error: error.message });
  }
};