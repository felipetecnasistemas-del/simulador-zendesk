import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qngnbyueqdewjjzgbkun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados de fallback
const FALLBACK_DATA = [
    {'name': 'Marcas', 'values': [1, 1, 2, 2, 3, 5]},
    {'name': 'Canais de entrada', 'values': [2, 4, 5, 8, 10, 10]},
    {'name': 'Instruções IA essencial', 'values': [3, 4, 6, 10, 20, 20]},
    {'name': 'Grupos', 'values': [2, 4, 8, 10, 12, 15]},
    {'name': 'Gatilhos', 'values': [5, 7, 10, 12, 14, 18]},
    {'name': 'Automações', 'values': [2, 2, 4, 5, 7, 10]},
    {'name': 'Visualizações', 'values': [7, 8, 10, 12, 15, 20]},
    {'name': 'Encaminhamento omnichannel', 'values': ['Sim', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim']},
    {'name': 'Webhook', 'values': [0, 0, 1, 2, 3, 4]},
    {'name': 'Macros', 'values': [3, 4, 5, 6, 8, 10]},
    {'name': 'Orientação importação usuário/org', 'values': ['Não', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim']},
    {'name': 'Formulários', 'values': [1, 2, 2, 2, 3, 4]},
    {'name': 'Campos Ticket', 'values': [3, 5, 6, 6, 8, 10]},
    {'name': 'Campos de usuário', 'values': [2, 1, 5, 6, 8, 10]},
    {'name': 'Conteúdo dinâmico', 'values': [5, 10, 15, 20, 20, 20]},
    {'name': 'Objetos personalizados', 'values': [1, 1, 2, 2, 4, 4]}
];

// Configurações dos ranges de agentes
const AGENT_RANGES = [
    { name: '10', hours: 8 },
    { name: '20', hours: 16 },
    { name: '40', hours: 32 },
    { name: '70', hours: 56 },
    { name: '100', hours: 80 },
    { name: 'more', hours: 120 }
];

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
        const { method } = req;

        console.log(`[${method}] Método ${method} chamado`);

        switch (method) {
            case 'GET':
                return await handleGet(req, res);
            case 'POST':
                return await handlePost(req, res);
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
        console.log('[GET] Buscando configurações de projetos padrões');
        
        let defaultData = [];
        
        try {
            // Tentar buscar dados do Supabase
            const { data: scopeItems, error } = await supabase
                .from('scope_items')
                .select('name, hours, minutes, response_type, agents_10, agents_20, agents_40, agents_70, agents_100, agents_more')
                .eq('is_active', true)
                .order('name');
            
            if (error) {
                console.error('[GET] Erro do Supabase:', error);
                throw error;
            }
            
            if (scopeItems && scopeItems.length > 0) {
                console.log(`[GET] Encontrados ${scopeItems.length} itens no banco`);
                
                for (const item of scopeItems) {
                    let values = [];
                    const responseType = item.response_type || 'numeric';
                    
                    // Verificar se há valores pré-definidos nas colunas agents_*
                    const predefinedValues = [
                        item.agents_10,
                        item.agents_20,
                        item.agents_40,
                        item.agents_70,
                        item.agents_100,
                        item.agents_more
                    ];
                    
                    const hasPredefinedValues = predefinedValues.some(val => val !== null && val !== undefined);
                    
                    if (hasPredefinedValues) {
                        values = predefinedValues;
                    } else {
                        // Calcular valores baseados em horas/minutos
                        if (responseType === 'boolean') {
                            const totalHours = (item.hours || 0) + ((item.minutes || 0) / 60.0);
                            if (totalHours > 2) {
                                values = ['Não', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim'];
                            } else {
                                values = ['Sim', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim'];
                            }
                        } else {
                            const totalHours = (item.hours || 0) + ((item.minutes || 0) / 60.0);
                            values = [];
                            for (const rangeInfo of AGENT_RANGES) {
                                const scaleFactor = rangeInfo.hours / 32.0;
                                const scaledValue = Math.max(1, Math.round(totalHours * scaleFactor));
                                values.push(scaledValue);
                            }
                        }
                    }
                    
                    defaultData.push({
                        name: item.name,
                        values: values,
                        response_type: responseType
                    });
                }
            } else {
                console.log('[GET] Nenhum item encontrado no banco, usando dados de fallback');
                defaultData = FALLBACK_DATA;
            }
        } catch (supabaseError) {
            console.error('[GET] Erro ao conectar com Supabase, usando dados de fallback:', supabaseError);
            defaultData = FALLBACK_DATA;
        }
        
        console.log(`[GET] Retornando ${defaultData.length} configurações`);
        
        return res.status(200).json({
            success: true,
            data: defaultData
        });
    } catch (error) {
        console.error('[GET] Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handlePost(req, res) {
    try {
        const { data: itemsData } = req.body;
        
        console.log('[POST] Dados recebidos:', itemsData);
        
        if (!itemsData || !Array.isArray(itemsData)) {
            console.log('[POST] Erro: Nenhum dado fornecido');
            return res.status(400).json({ error: 'Nenhum dado fornecido' });
        }
        
        const updatedItems = [];
        
        for (const item of itemsData) {
            const itemName = item.name;
            const itemValues = item.values || [];
            
            if (!itemName || itemValues.length !== 6) {
                console.log(`[POST] Pulando item inválido: ${itemName}`);
                continue;
            }
            
            try {
                // Buscar o item existente pelo nome
                const { data: existingItems, error: searchError } = await supabase
                    .from('scope_items')
                    .select('*')
                    .eq('name', itemName);
                
                if (searchError) {
                    console.error(`[POST] Erro ao buscar item ${itemName}:`, searchError);
                    continue;
                }
                
                if (existingItems && existingItems.length > 0) {
                    // Atualizar os valores nas colunas agents_*
                    const updateData = {
                        agents_10: itemValues[0],
                        agents_20: itemValues[1],
                        agents_40: itemValues[2],
                        agents_70: itemValues[3],
                        agents_100: itemValues[4],
                        agents_more: itemValues[5]
                    };
                    
                    const { data: result, error: updateError } = await supabase
                        .from('scope_items')
                        .update(updateData)
                        .eq('name', itemName)
                        .select();
                    
                    if (updateError) {
                        console.error(`[POST] Erro ao atualizar item ${itemName}:`, updateError);
                        continue;
                    }
                    
                    if (result && result.length > 0) {
                        updatedItems.push(...result);
                        console.log(`[POST] Item ${itemName} atualizado com sucesso`);
                    }
                }
            } catch (itemError) {
                console.error(`[POST] Erro ao processar item ${itemName}:`, itemError);
                continue;
            }
        }
        
        console.log(`[POST] Atualizados ${updatedItems.length} itens de escopo`);
        
        return res.status(200).json({
            success: true,
            message: `Atualizados ${updatedItems.length} itens de escopo`,
            data: updatedItems
        });
    } catch (error) {
        console.error('[POST] Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}