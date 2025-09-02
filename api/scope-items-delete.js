import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qngnbyueqdewjjzgbkun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Lidar com preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    try {
        const { query } = req;
        const { id } = query;

        console.log(`[DELETE] Tentando deletar item com ID: ${id}`);

        if (!id) {
            console.log('[DELETE] ID não fornecido');
            return res.status(400).json({ error: 'ID é obrigatório' });
        }

        // Verificar se o item existe
        console.log('[DELETE] Verificando se o item existe...');
        const { data: existingItem, error: checkError } = await supabase
            .from('scope_items')
            .select('*')
            .eq('id', id)
            .single();

        if (checkError) {
            console.log('[DELETE] Erro ao verificar item:', checkError);
            return res.status(404).json({ error: 'Item não encontrado' });
        }

        console.log('[DELETE] Item encontrado:', existingItem);

        // Realizar soft delete
        console.log('[DELETE] Realizando soft delete...');
        const { data, error } = await supabase
            .from('scope_items')
            .update({ is_active: false })
            .eq('id', id)
            .select();

        if (error) {
            console.log('[DELETE] Erro no soft delete:', error);
            return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
        }

        console.log('[DELETE] Soft delete realizado com sucesso:', data);
        return res.status(200).json({ 
            success: true, 
            message: 'Item deletado com sucesso',
            data: data[0]
        });

    } catch (error) {
        console.log('[DELETE] Erro geral:', error);
        return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
}