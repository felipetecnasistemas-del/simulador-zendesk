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

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('[OPTIONS] Método OPTIONS chamado');
        return res.status(200).end();
    }

    try {
        const { method, query, body } = req;
        const { id } = query;

        console.log(`[${method}] Método ${method} chamado para ID: ${id}`);

        switch (method) {
            case 'GET':
                return await handleGet(req, res);
            case 'POST':
                return await handlePost(req, res);
            case 'PUT':
                return await handlePut(req, res);
            case 'DELETE':
                return await handleDelete(req, res);
            default:
                console.log(`[ERROR] Método ${method} não permitido`);
                return res.status(405).json({ error: `Método ${method} não permitido` });
        }
    } catch (error) {
        console.error('[ERROR] Erro geral:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handleGet(req, res) {
    try {
        const { id } = req.query;
        
        console.log(`[GET] Buscando usuário${id ? ` ID: ${id}` : 's (todos)'}`);
        
        let query = supabase.from('users').select('*');
        
        if (id) {
            query = query.eq('id', id).single();
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('[GET] Erro do Supabase:', error);
            throw error;
        }
        
        console.log(`[GET] Retornando ${Array.isArray(data) ? data.length : 1} usuário(s)`);
        
        return res.status(200).json({
            success: true,
            data: data || [],
            count: Array.isArray(data) ? data.length : (data ? 1 : 0)
        });
    } catch (error) {
        console.error('[GET] Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handlePost(req, res) {
    try {
        const data = req.body;
        
        console.log('[POST] Dados recebidos:', data);
        
        // Verificar se é uma ação de delete
        if (data.action === 'delete') {
            return await handleDelete(req, res);
        }
        
        const { data: result, error } = await supabase
            .from('users')
            .insert(data)
            .select()
            .single();
        
        if (error) {
            console.error('[POST] Erro do Supabase:', error);
            throw error;
        }
        
        console.log('[POST] Usuário criado com sucesso:', result);
        
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Usuário criado com sucesso'
        });
    } catch (error) {
        console.error('[POST] Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handlePut(req, res) {
    try {
        const { id } = req.query;
        const data = req.body;
        
        if (!id) {
            console.log('[PUT] Erro: ID não fornecido');
            return res.status(400).json({ error: 'ID não fornecido' });
        }
        
        console.log(`[PUT] Atualizando usuário ID: ${id}`);
        console.log('[PUT] Dados para atualização:', data);
        
        const { data: result, error } = await supabase
            .from('users')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('[PUT] Erro do Supabase:', error);
            throw error;
        }
        
        if (!result) {
            console.log(`[PUT] Usuário não encontrado: ${id}`);
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        console.log('[PUT] Usuário atualizado com sucesso:', result);
        
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Usuário atualizado com sucesso'
        });
    } catch (error) {
        console.error('[PUT] Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handleDelete(req, res) {
    try {
        // Aceitar ID tanto do query quanto do body (para POST com action=delete)
        const userId = req.query.id || req.body.id;
        
        if (!userId) {
            console.log('[DELETE] Erro: ID não fornecido');
            return res.status(400).json({ error: 'ID não fornecido' });
        }
        
        console.log(`[DELETE] Excluindo usuário ID: ${userId}`);
        
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);
        
        if (error) {
            console.error('[DELETE] Erro do Supabase:', error);
            throw error;
        }
        
        console.log(`[DELETE] Usuário excluído com sucesso: ${userId}`);
        
        return res.status(200).json({
            success: true,
            message: 'Usuário excluído com sucesso'
        });
    } catch (error) {
        console.error('[DELETE] Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}