const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Regras padrão do sistema
const DEFAULT_RULES = {
    hours: { baixo: 75, medio: 123, complexo: 188 },
    points: { baixo: 50, medio: 100 },
    hourlyRate: 150.00
};

// Buscar todas as regras do sistema
async function getSystemRules(req, res) {
    try {
        const { data, error } = await supabase
            .from('system_rules')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Erro ao buscar regras do sistema:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // Se não existem regras, retorna as regras padrão
        const rules = data || DEFAULT_RULES;
        
        res.json({ success: true, data: rules });
    } catch (error) {
        console.error('Erro ao buscar regras do sistema:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Salvar regra de horas
async function saveHoursRule(req, res) {
    try {
        const { baixo, medio, complexo } = req.body;
        
        if (!baixo || !medio || !complexo) {
            return res.status(400).json({ success: false, error: 'Todos os valores de horas são obrigatórios' });
        }
        
        if (baixo >= medio || medio >= complexo) {
            return res.status(400).json({ success: false, error: 'Os valores devem ser crescentes: Baixo < Médio < Complexo' });
        }

        // Buscar regras existentes
        const { data: existingRules } = await supabase
            .from('system_rules')
            .select('*')
            .single();

        const updatedRules = {
            ...DEFAULT_RULES,
            ...existingRules,
            hours: { baixo, medio, complexo }
        };

        // Upsert (insert ou update)
        const { data, error } = await supabase
            .from('system_rules')
            .upsert(updatedRules, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('Erro ao salvar regra de horas:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro ao salvar regra de horas:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Salvar regra de pontos
async function savePointsRule(req, res) {
    try {
        const { baixo, medio } = req.body;
        
        if (!baixo || !medio) {
            return res.status(400).json({ success: false, error: 'Todos os valores de pontos são obrigatórios' });
        }
        
        if (baixo >= medio) {
            return res.status(400).json({ success: false, error: 'O valor do nível médio deve ser maior que o nível baixo' });
        }

        // Buscar regras existentes
        const { data: existingRules } = await supabase
            .from('system_rules')
            .select('*')
            .single();

        const updatedRules = {
            ...DEFAULT_RULES,
            ...existingRules,
            points: { baixo, medio }
        };

        // Upsert (insert ou update)
        const { data, error } = await supabase
            .from('system_rules')
            .upsert(updatedRules, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('Erro ao salvar regra de pontos:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro ao salvar regra de pontos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Salvar valor por hora
async function saveRateRule(req, res) {
    try {
        const { rate } = req.body;
        
        if (!rate || rate <= 0) {
            return res.status(400).json({ success: false, error: 'Valor por hora deve ser maior que zero' });
        }

        // Buscar regras existentes
        const { data: existingRules } = await supabase
            .from('system_rules')
            .select('*')
            .single();

        const updatedRules = {
            ...DEFAULT_RULES,
            ...existingRules,
            hourlyRate: rate
        };

        // Upsert (insert ou update)
        const { data, error } = await supabase
            .from('system_rules')
            .upsert(updatedRules, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('Erro ao salvar valor por hora:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Erro ao salvar valor por hora:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Inicializar regras padrão
async function initializeDefaultRules() {
    try {
        const { data: existingRules } = await supabase
            .from('system_rules')
            .select('*')
            .single();

        if (!existingRules) {
            const { data, error } = await supabase
                .from('system_rules')
                .insert(DEFAULT_RULES)
                .select()
                .single();

            if (error) {
                console.error('Erro ao inicializar regras padrão:', error);
            } else {
                console.log('Regras padrão inicializadas com sucesso');
            }
        }
    } catch (error) {
        console.error('Erro ao verificar regras existentes:', error);
    }
}

module.exports = {
    getSystemRules,
    saveHoursRule,
    savePointsRule,
    saveRateRule,
    initializeDefaultRules
};