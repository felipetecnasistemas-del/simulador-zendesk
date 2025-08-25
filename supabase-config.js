// Configuração do Supabase para o frontend
// Substitua pelas suas credenciais do Supabase

const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima-aqui';

// Inicializar cliente Supabase
let supabaseClient = null;

// Função para inicializar o Supabase (será chamada quando as credenciais estiverem disponíveis)
function initSupabase(url, key) {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(url || SUPABASE_URL, key || SUPABASE_ANON_KEY);
        console.log('Supabase inicializado com sucesso');
        return supabaseClient;
    } else {
        console.error('Biblioteca Supabase não carregada');
        return null;
    }
}

// Funções de API usando Supabase
const SupabaseAPI = {
    // Projetos
    async getProjects() {
        if (!supabaseClient) {
            console.error('Supabase não inicializado');
            return { data: [], error: 'Cliente não inicializado' };
        }
        
        const { data, error } = await supabaseClient
            .from('projects')
            .select(`
                *,
                project_products (
                    product_id,
                    status,
                    hours,
                    value,
                    products (name, icon)
                )
            `)
            .order('created_at', { ascending: false });
        
        return { data, error };
    },

    async createProject(projectData) {
        if (!supabaseClient) {
            return { data: null, error: 'Cliente não inicializado' };
        }

        const { data: project, error: projectError } = await supabaseClient
            .from('projects')
            .insert({
                name: projectData.name,
                description: projectData.description,
                status: 'draft',
                total_hours: 0,
                total_value: 0
            })
            .select()
            .single();

        if (projectError) {
            return { data: null, error: projectError };
        }

        // Associar produtos ao projeto
        const projectProducts = projectData.products.map(productId => ({
            project_id: project.id,
            product_id: productId,
            status: 'pending',
            hours: 0,
            value: 0
        }));

        const { error: productsError } = await supabaseClient
            .from('project_products')
            .insert(projectProducts);

        if (productsError) {
            return { data: null, error: productsError };
        }

        return { data: project, error: null };
    },

    // Produtos
    async getProducts() {
        if (!supabaseClient) {
            return { data: [], error: 'Cliente não inicializado' };
        }
        
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('name');
        
        return { data, error };
    },

    // Questionários
    async getQuestionnaire(projectId, productId) {
        if (!supabaseClient) {
            return { data: null, error: 'Cliente não inicializado' };
        }

        // Buscar questionário do produto
        const { data: product, error: productError } = await supabaseClient
            .from('products')
            .select('questionnaire')
            .eq('id', productId)
            .single();

        if (productError) {
            return { data: null, error: productError };
        }

        // Buscar respostas salvas
        const { data: answers, error: answersError } = await supabaseClient
            .from('questionnaire_answers')
            .select('*')
            .eq('project_id', projectId)
            .eq('product_id', productId);

        if (answersError) {
            return { data: null, error: answersError };
        }

        // Converter respostas para formato de objeto
        const answersMap = {};
        answers.forEach(answer => {
            answersMap[answer.question_key] = answer.answer_value;
        });

        return {
            data: {
                questionnaire: product.questionnaire,
                answers: answersMap
            },
            error: null
        };
    },

    async saveAnswers(projectId, productId, answers) {
        if (!supabaseClient) {
            return { data: null, error: 'Cliente não inicializado' };
        }

        // Deletar respostas existentes
        await supabaseClient
            .from('questionnaire_answers')
            .delete()
            .eq('project_id', projectId)
            .eq('product_id', productId);

        // Inserir novas respostas
        const answersToInsert = Object.entries(answers).map(([key, value]) => ({
            project_id: projectId,
            product_id: productId,
            question_key: key,
            answer_value: value
        }));

        const { error } = await supabaseClient
            .from('questionnaire_answers')
            .insert(answersToInsert);

        if (error) {
            return { data: null, error };
        }

        // Calcular horas e valor
        const calculatedData = this.calculateProjectData(answers);

        // Atualizar projeto com novos valores
        const { error: updateError } = await supabaseClient
            .from('project_products')
            .update({
                hours: calculatedData.hours,
                value: calculatedData.value,
                status: 'configured'
            })
            .eq('project_id', projectId)
            .eq('product_id', productId);

        if (updateError) {
            return { data: null, error: updateError };
        }

        return { data: calculatedData, error: null };
    },

    calculateProjectData(answers) {
        let baseHours = 40;
        let hourlyRate = 150;
        
        Object.entries(answers).forEach(([key, value]) => {
            if (typeof value === 'string' && value.toLowerCase().includes('sim')) {
                baseHours += 10;
            }
            if (typeof value === 'number' && value > 100) {
                baseHours += value * 0.1;
            }
        });
        
        return {
            hours: Math.round(baseHours),
            value: Math.round(baseHours * hourlyRate)
        };
    }
};

// Exportar para uso global
window.SupabaseAPI = SupabaseAPI;
window.initSupabase = initSupabase;