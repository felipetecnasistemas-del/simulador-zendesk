import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qngnbyueqdewjjzgbkun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Configurar CORS de forma mais robusta para Vercel
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    };
    
    // Aplicar headers CORS
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    console.log(`[${req.method}] Requisição recebida para: ${req.url}`);

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('[OPTIONS] Método OPTIONS chamado');
        return res.status(200).end();
    }

    try {
        const { method, query, body } = req;
        const { id, _method } = query;

        console.log(`[${method}] Método ${method} chamado para ID: ${id}`);
        console.log(`[${method}] _method parameter: ${_method}`);

        // Verificar se é uma operação de delete via POST
        if (method === 'POST' && body && body.action === 'delete') {
            console.log('[DELETE] Processando delete via POST com action=delete');
            return await handleDelete(req, res);
        }

        switch (method) {
            case 'GET':
                return await handleGet(req, res);
            case 'POST':
                return await handlePost(req, res);
            case 'PUT':
                return await handlePut(req, res);
            case 'DELETE':
                console.log('[DELETE] Processando DELETE direto');
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
        const { product_id } = req.query;
        
        console.log(`[GET] Buscando itens${product_id ? ` para produto: ${product_id}` : ' (todos)'}`);
        
        let query = supabase
            .from('scope_items')
            .select('*, scope_categories(name, color)')
            .eq('is_active', true);
        
        if (product_id) {
            query = query.eq('product_id', product_id);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('[GET] Erro do Supabase:', error);
            throw error;
        }
        
        console.log(`[GET] Retornando ${data?.length || 0} itens`);
        
        return res.status(200).json({
            success: true,
            data: data || [],
            count: data?.length || 0
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
        if (data && data.action === 'delete') {
            console.log('[POST] Redirecionando para handleDelete');
            return await handleDelete(req, res);
        }
        
        // Verificar se é uma ação de update
        if (data && data.action === 'update') {
            console.log('[POST] Redirecionando para handlePut');
            return await handlePut(req, res);
        }
        
        // Caso contrário, criar novo item
        const { data: result, error } = await supabase
            .from('scope_items')
            .insert(data)
            .select()
            .single();
        
        if (error) {
            console.error('[POST] Erro do Supabase:', error);
            throw error;
        }
        
        console.log('[POST] Item criado com sucesso:', result);
        
        return res.status(201).json({
            success: true,
            data: result,
            message: 'Item criado com sucesso'
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
        
        // Obter ID do query ou do body (para requisições via POST com action=update)
        const itemId = id || data.id;
        
        if (!itemId) {
            console.log('[PUT] Erro: ID não fornecido');
            return res.status(400).json({ error: 'ID não fornecido' });
        }
        
        // Remover o ID e action dos dados para atualização
        const updateData = { ...data };
        delete updateData.id;
        delete updateData.action;
        
        console.log(`[PUT] Atualizando item ID: ${itemId}`);
        console.log('[PUT] Dados para atualização:', updateData);
        
        const { data: result, error } = await supabase
            .from('scope_items')
            .update(updateData)
            .eq('id', itemId)
            .select()
            .single();
        
        if (error) {
            console.error('[PUT] Erro do Supabase:', error);
            throw error;
        }
        
        if (!result) {
            console.log(`[PUT] Item não encontrado: ${itemId}`);
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        
        console.log('[PUT] Item atualizado com sucesso:', result);
        
        return res.status(200).json({
            success: true,
            data: result,
            message: 'Item atualizado com sucesso'
        });
    } catch (error) {
        console.error('[PUT] Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handleDelete(req, res) {
    try {
        const { query, body } = req;
        let itemId;
        
        // Obter ID do query parameter ou do body
        if (query.id) {
            itemId = query.id;
        } else if (body && body.id) {
            itemId = body.id;
        }
        
        console.log('[DELETE] Tentando deletar item ID:', itemId);
        
        if (!itemId) {
            return res.status(400).json({ error: 'ID é obrigatório' });
        }
        
        // Realizar soft delete diretamente
        const { data, error } = await supabase
            .from('scope_items')
            .update({ is_active: false })
            .eq('id', itemId)
            .eq('is_active', true) // Só atualiza se ainda estiver ativo
            .select();
        
        if (error) {
            console.log('[DELETE] Erro Supabase:', error);
            return res.status(500).json({ error: 'Erro ao deletar item', details: error.message });
        }
        
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Item não encontrado ou já foi deletado' });
        }
        
        console.log('[DELETE] Item deletado com sucesso:', data[0]);
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