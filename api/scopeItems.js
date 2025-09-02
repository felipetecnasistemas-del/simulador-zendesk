// API para gerenciar itens de escopo
import { supabase } from '../supabase-config.js';

// Configurações padrão
const DEFAULT_CATEGORY = {
    name: '',
    description: '',
    color: '#6366f1'
};

const DEFAULT_SCOPE_ITEM = {
    product_id: null,
    category_id: null,
    name: '',
    description: '',
    points: 0,
    hours: 0,
    minutes: 0,
    is_active: true,
    response_type: 'numeric'
};

// ========== CATEGORIAS ==========

/**
 * Busca todas as categorias de escopo
 */
export async function getScopeCategories() {
    try {
        const { data, error } = await supabase
            .from('scope_categories')
            .select('*')
            .order('name');

        if (error) {
            console.error('Erro ao buscar categorias:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Erro na função getScopeCategories:', error);
        throw error;
    }
}

/**
 * Cria uma nova categoria de escopo
 */
export async function createScopeCategory(categoryData) {
    try {
        // Validação dos dados
        if (!categoryData.name || categoryData.name.trim() === '') {
            throw new Error('Nome da categoria é obrigatório');
        }

        const category = {
            ...DEFAULT_CATEGORY,
            ...categoryData,
            name: categoryData.name.trim()
        };

        const { data, error } = await supabase
            .from('scope_categories')
            .insert([category])
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar categoria:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Erro na função createScopeCategory:', error);
        throw error;
    }
}

/**
 * Atualiza uma categoria existente
 */
export async function updateScopeCategory(id, categoryData) {
    try {
        if (!id) {
            throw new Error('ID da categoria é obrigatório');
        }

        if (!categoryData.name || categoryData.name.trim() === '') {
            throw new Error('Nome da categoria é obrigatório');
        }

        const updates = {
            ...categoryData,
            name: categoryData.name.trim(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('scope_categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar categoria:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Erro na função updateScopeCategory:', error);
        throw error;
    }
}

/**
 * Exclui uma categoria (apenas se não tiver itens vinculados)
 */
export async function deleteScopeCategory(id) {
    try {
        if (!id) {
            throw new Error('ID da categoria é obrigatório');
        }

        // Verificar se há itens vinculados à categoria
        const { data: items, error: itemsError } = await supabase
            .from('scope_items')
            .select('id')
            .eq('category_id', id)
            .limit(1);

        if (itemsError) {
            console.error('Erro ao verificar itens da categoria:', itemsError);
            throw itemsError;
        }

        if (items && items.length > 0) {
            throw new Error('Não é possível excluir categoria que possui itens vinculados');
        }

        const { error } = await supabase
            .from('scope_categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir categoria:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Erro na função deleteScopeCategory:', error);
        throw error;
    }
}

// ========== ITENS DE ESCOPO ==========

/**
 * Busca todos os itens de escopo com informações de produto e categoria
 */
export async function getScopeItems(filters = {}) {
    try {
        let query = supabase
            .from('scope_items')
            .select(`
                *,
                products:product_id(id, name, icon),
                scope_categories:category_id(id, name, color)
            `)
            .order('name');

        // Aplicar filtros
        if (filters.product_id) {
            query = query.eq('product_id', filters.product_id);
        }

        if (filters.category_id) {
            query = query.eq('category_id', filters.category_id);
        }

        if (filters.is_active !== undefined) {
            query = query.eq('is_active', filters.is_active);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar itens de escopo:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Erro na função getScopeItems:', error);
        throw error;
    }
}

/**
 * Busca um item de escopo específico
 */
export async function getScopeItem(id) {
    try {
        if (!id) {
            throw new Error('ID do item é obrigatório');
        }

        const { data, error } = await supabase
            .from('scope_items')
            .select(`
                *,
                products:product_id(id, name, icon),
                scope_categories:category_id(id, name, color)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Erro ao buscar item de escopo:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Erro na função getScopeItem:', error);
        throw error;
    }
}

/**
 * Cria um novo item de escopo
 */
export async function createScopeItem(itemData) {
    try {
        // Validação dos dados
        if (!itemData.product_id) {
            throw new Error('Produto é obrigatório');
        }

        if (!itemData.name || itemData.name.trim() === '') {
            throw new Error('Nome do item é obrigatório');
        }

        if (itemData.points < 0) {
            throw new Error('Pontos não podem ser negativos');
        }

        if (itemData.hours < 0) {
            throw new Error('Horas não podem ser negativas');
        }

        if (itemData.minutes < 0 || itemData.minutes >= 60) {
            throw new Error('Minutos devem estar entre 0 e 59');
        }

        const item = {
            ...DEFAULT_SCOPE_ITEM,
            ...itemData,
            name: itemData.name.trim(),
            points: parseInt(itemData.points) || 0,
            hours: parseInt(itemData.hours) || 0,
            minutes: parseInt(itemData.minutes) || 0
        };

        const { data, error } = await supabase
            .from('scope_items')
            .insert([item])
            .select(`
                *,
                products:product_id(id, name, icon),
                scope_categories:category_id(id, name, color)
            `)
            .single();

        if (error) {
            console.error('Erro ao criar item de escopo:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Erro na função createScopeItem:', error);
        throw error;
    }
}

/**
 * Atualiza um item de escopo existente
 */
export async function updateScopeItem(id, itemData) {
    try {
        if (!id) {
            throw new Error('ID do item é obrigatório');
        }

        // Validação dos dados
        if (itemData.name && itemData.name.trim() === '') {
            throw new Error('Nome do item não pode estar vazio');
        }

        if (itemData.points !== undefined && itemData.points < 0) {
            throw new Error('Pontos não podem ser negativos');
        }

        if (itemData.hours !== undefined && itemData.hours < 0) {
            throw new Error('Horas não podem ser negativas');
        }

        if (itemData.minutes !== undefined && (itemData.minutes < 0 || itemData.minutes >= 60)) {
            throw new Error('Minutos devem estar entre 0 e 59');
        }

        const updates = {
            ...itemData,
            updated_at: new Date().toISOString()
        };

        if (updates.name) {
            updates.name = updates.name.trim();
        }

        if (updates.points !== undefined) {
            updates.points = parseInt(updates.points) || 0;
        }

        if (updates.hours !== undefined) {
            updates.hours = parseInt(updates.hours) || 0;
        }

        if (updates.minutes !== undefined) {
            updates.minutes = parseInt(updates.minutes) || 0;
        }

        const { data, error } = await supabase
            .from('scope_items')
            .update(updates)
            .eq('id', id)
            .select(`
                *,
                products:product_id(id, name, icon),
                scope_categories:category_id(id, name, color)
            `)
            .single();

        if (error) {
            console.error('Erro ao atualizar item de escopo:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Erro na função updateScopeItem:', error);
        throw error;
    }
}

/**
 * Exclui um item de escopo
 */
export async function deleteScopeItem(id) {
    try {
        if (!id) {
            throw new Error('ID do item é obrigatório');
        }

        const { error } = await supabase
            .from('scope_items')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir item de escopo:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Erro na função deleteScopeItem:', error);
        throw error;
    }
}

/**
 * Ativa/desativa um item de escopo
 */
export async function toggleScopeItemStatus(id, isActive) {
    try {
        if (!id) {
            throw new Error('ID do item é obrigatório');
        }

        const { data, error } = await supabase
            .from('scope_items')
            .update({ 
                is_active: isActive,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select(`
                *,
                products:product_id(id, name, icon),
                scope_categories:category_id(id, name, color)
            `)
            .single();

        if (error) {
            console.error('Erro ao alterar status do item:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Erro na função toggleScopeItemStatus:', error);
        throw error;
    }
}

/**
 * Busca itens de escopo por produto
 */
export async function getScopeItemsByProduct(productId) {
    try {
        if (!productId) {
            throw new Error('ID do produto é obrigatório');
        }

        return await getScopeItems({ product_id: productId, is_active: true });
    } catch (error) {
        console.error('Erro na função getScopeItemsByProduct:', error);
        throw error;
    }
}

/**
 * Calcula totais de pontos e tempo para uma lista de itens
 */
export function calculateScopeItemsTotals(items) {
    if (!Array.isArray(items)) {
        return { totalPoints: 0, totalHours: 0, totalMinutes: 0, formattedTime: '0h 0m' };
    }

    const totals = items.reduce((acc, item) => {
        acc.totalPoints += item.points || 0;
        acc.totalHours += item.hours || 0;
        acc.totalMinutes += item.minutes || 0;
        return acc;
    }, { totalPoints: 0, totalHours: 0, totalMinutes: 0 });

    // Converter minutos extras em horas
    if (totals.totalMinutes >= 60) {
        totals.totalHours += Math.floor(totals.totalMinutes / 60);
        totals.totalMinutes = totals.totalMinutes % 60;
    }

    totals.formattedTime = `${totals.totalHours}h ${totals.totalMinutes}m`;

    return totals;
}