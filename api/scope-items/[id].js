import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qngnbyueqdewjjzgbkun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    console.log(`[${req.method}] Requisição para scope-items/[id] - URL: ${req.url}`);
    console.log(`[${req.method}] Query params:`, req.query);

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('[OPTIONS] Preflight request para [id]');
        return res.status(200).end();
    }

    const { id } = req.query;
    console.log(`[${req.method}] ID extraído: ${id}`);

    if (req.method === 'DELETE') {
        console.log('[DELETE] Processando DELETE em [id].js');
        return await handleDelete(req, res, id);
    }

    if (req.method === 'PUT') {
        console.log('[PUT] Processando PUT em [id].js');
        return await handlePut(req, res, id);
    }

    if (req.method === 'GET') {
        console.log('[GET] Processando GET em [id].js');
        return await handleGet(req, res, id);
    }

    return res.status(405).json({ error: `Método ${req.method} não permitido em [id]` });
}

async function handleDelete(req, res, id) {
    console.log('[DELETE] Iniciando handleDelete em [id].js');
    
    try {
        if (!id) {
            console.log('[DELETE] ID não fornecido');
            return res.status(400).json({ error: 'ID é obrigatório' });
        }
        
        console.log(`[DELETE] Tentando excluir item ID: ${id}`);
        
        // Verificar se o item existe
        const { data: existingItem, error: selectError } = await supabase
            .from('scope_items')
            .select('id, name, is_active')
            .eq('id', id)
            .single();
            
        if (selectError) {
            console.error('[DELETE] Erro ao verificar item:', selectError);
            return res.status(500).json({ error: 'Erro ao verificar item: ' + selectError.message });
        }
        
        if (!existingItem) {
            console.log(`[DELETE] Item não encontrado: ${id}`);
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        
        console.log('[DELETE] Item encontrado:', existingItem);
        
        // Exclusão lógica - marcar como inativo
        const { data: result, error } = await supabase
            .from('scope_items')
            .update({ is_active: false })
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('[DELETE] Erro do Supabase no update:', error);
            return res.status(500).json({ error: 'Erro no update: ' + error.message });
        }
        
        console.log(`[DELETE] Update executado com sucesso:`, result);
        
        return res.status(200).json({
            success: true,
            message: 'Item excluído com sucesso',
            data: result
        });
    } catch (error) {
        console.error('[DELETE] Erro geral:', error);
        return res.status(500).json({ error: 'Erro interno: ' + error.message });
    }
}

async function handlePut(req, res, id) {
    // Implementação do PUT (pode ser copiada da API original se necessário)
    return res.status(200).json({ message: 'PUT funcionando em [id].js', id });
}

async function handleGet(req, res, id) {
    // Implementação do GET (pode ser copiada da API original se necessário)
    return res.status(200).json({ message: 'GET funcionando em [id].js', id });
}