// Configuração do Supabase para o frontend
// Credenciais do Supabase
const SUPABASE_URL = 'https://qngnbyueqdewjjzgbkun.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY';

// Inicializar cliente Supabase
let supabaseClient = null;

// Função para inicializar o Supabase
function initSupabase() {
    console.log('=== INICIALIZANDO SUPABASE ==>');
    console.log('URL configurada:', SUPABASE_URL);
    console.log('Biblioteca disponível:', typeof window.supabase);
    
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Cliente criado:', supabaseClient);
        console.log('URL do cliente:', supabaseClient.supabaseUrl);
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
        
        try {
            const { data, error } = await supabaseClient
                .from('projects')
                .select(`
                    *,
                    users (id, name, email),
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
        } catch (err) {
            console.error('Erro na consulta:', err);
            return { data: [], error: err.message };
        }
    },

    async createProject(projectData) {
        if (!supabaseClient) {
            return { data: null, error: 'Cliente não inicializado' };
        }

        try {
            const { data: project, error: projectError } = await supabaseClient
                .from('projects')
                .insert({
                    name: projectData.name,
                    description: projectData.description,
                    client_type: projectData.client_type,
                    is_tecna_client: projectData.is_tecna_client || false,
                    has_zendesk_admin: projectData.has_zendesk_admin || false,
                    user_id: projectData.user_id,
                    status: 'draft',
                    total_hours: 0,
                    total_value: 0
                })
                .select()
                .single();

            return { data: project, error: projectError };
        } catch (error) {
            console.error('Erro ao criar projeto:', error);
            return { data: null, error: error.message };
        }
    },

    async getProject(projectId) {
        if (!supabaseClient) {
            return { data: null, error: 'Cliente não inicializado' };
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
            .eq('id', projectId)
            .single();

        return { data, error };
    },

    // Usuários (dados simulados para teste)
    async getUsers() {
        try {
            const response = await fetch('/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                return { data: [], error: result.error || 'Erro ao buscar usuários' };
            }
            
            return { data: result.data, error: null };
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return { data: [], error: error.message };
        }
    },

    async createUser(userData) {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                return { data: null, error: result.error || 'Erro ao criar usuário' };
            }
            
            return { data: result.data, error: null };
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return { data: null, error: error.message };
        }
    },

    async updateUser(userId, userData) {
        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: userId, ...userData })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                return { data: null, error: result.error || 'Erro ao atualizar usuário' };
            }
            
            return { data: result.data, error: null };
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return { data: null, error: error.message };
        }
    },

    async deleteUser(userId) {
        try {
            const response = await fetch('/api/users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: userId })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                return { data: null, error: result.error || 'Erro ao deletar usuário' };
            }
            
            return { data: result.data, error: null };
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            return { data: null, error: error.message };
        }
    }
};

// Exportar para uso global
window.SupabaseAPI = SupabaseAPI;
window.initSupabase = initSupabase;