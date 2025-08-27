// Lógica para a página inicial do simulador Zendesk

// Elementos do DOM
const clientTypeSelect = document.getElementById('clientType');
const baseClientQuestions = document.getElementById('baseClientQuestions');
const projectForm = document.getElementById('projectForm');
const createProjectBtn = document.getElementById('createProjectBtn');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando aplicação...');
    
    // Limpar qualquer cache antigo do Supabase
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    
    // Forçar limpeza de qualquer configuração antiga
    if (window.supabaseClient) {
        window.supabaseClient = null;
    }
    
    // Limpar qualquer configuração antiga do Supabase
    console.log('Limpando configurações antigas...');
    
    // Inicializar Supabase
    if (typeof initSupabase === 'function') {
        const client = initSupabase();
        console.log('Supabase inicializado:', client ? 'Sucesso' : 'Falha');
        
        // Verificar se a URL está correta
        if (client && client.supabaseUrl) {
            console.log('URL do cliente Supabase:', client.supabaseUrl);
        }
    } else {
        console.error('Função initSupabase não encontrada');
    }
    
    setupEventListeners();
    loadSavedData();
    loadExistingProjects();
    loadUsersForSelect();
});

// Configurar event listeners
function setupEventListeners() {
    // Mostrar/ocultar perguntas condicionais baseadas no tipo de cliente
    clientTypeSelect.addEventListener('change', function() {
        const clientType = this.value;
        
        if (clientType === 'base') {
            baseClientQuestions.style.display = 'block';
            // Tornar os campos obrigatórios
            const radioInputs = baseClientQuestions.querySelectorAll('input[type="radio"]');
            radioInputs.forEach(input => {
                input.setAttribute('required', 'required');
            });
        } else {
            baseClientQuestions.style.display = 'none';
            // Remover obrigatoriedade e limpar seleções
            const radioInputs = baseClientQuestions.querySelectorAll('input[type="radio"]');
            radioInputs.forEach(input => {
                input.removeAttribute('required');
                input.checked = false;
            });
        }
        
        saveFormData();
    });

    // Salvar dados do formulário automaticamente
    projectForm.addEventListener('input', saveFormData);
    projectForm.addEventListener('change', saveFormData);

    // Submissão do formulário
    projectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            const projectData = collectFormData();
            saveProjectData(projectData);
            navigateToSimulator();
        }
    });
}

// Validar formulário
function validateForm() {
    const clientName = document.getElementById('clientName').value.trim();
    const clientType = document.getElementById('clientType').value;
    
    if (!clientName) {
        showMessage('Por favor, informe o nome do cliente.', 'error');
        return false;
    }
    
    if (!clientType) {
        showMessage('Por favor, selecione o tipo de cliente.', 'error');
        return false;
    }
    
    // Validar perguntas condicionais para cliente Base
    if (clientType === 'base') {
        const isTecnaClient = document.querySelector('input[name="isTecnaClient"]:checked');
        const hasZendeskAdmin = document.querySelector('input[name="hasZendeskAdmin"]:checked');
        
        if (!isTecnaClient) {
            showMessage('Por favor, informe se já é cliente TECNA.', 'error');
            return false;
        }
        
        if (!hasZendeskAdmin) {
            showMessage('Por favor, informe se tem administrador Zendesk.', 'error');
            return false;
        }
    }
    
    return true;
}

// Coletar dados do formulário
function collectFormData() {
    const clientName = document.getElementById('clientName').value.trim();
    const clientType = document.getElementById('clientType').value;
    const projectUser = document.getElementById('projectUser').value;
    
    const projectData = {
        clientName,
        clientType,
        projectUser,
        timestamp: new Date().toISOString()
    };
    
    // Adicionar dados condicionais para cliente Base
    if (clientType === 'base') {
        const isTecnaClient = document.querySelector('input[name="isTecnaClient"]:checked')?.value;
        const hasZendeskAdmin = document.querySelector('input[name="hasZendeskAdmin"]:checked')?.value;
        
        projectData.isTecnaClient = isTecnaClient === 'sim';
        projectData.hasZendeskAdmin = hasZendeskAdmin === 'sim';
    }
    
    return projectData;
}

// Salvar dados do projeto no localStorage
async function saveProjectData(projectData) {
    try {
        console.log('Iniciando criação do projeto:', projectData);
        createProjectBtn.disabled = true;
        createProjectBtn.textContent = 'Criando projeto...';
        
        // Criar projeto no Supabase
        console.log('Chamando SupabaseAPI.createProject...');
        const { data, error } = await SupabaseAPI.createProject({
            name: projectData.clientName,
            description: `Projeto para cliente ${projectData.clientName} - Tipo: ${projectData.clientType}`,
            client_type: projectData.clientType,
            is_tecna_client: projectData.isTecnaClient || false,
            has_zendesk_admin: projectData.hasZendeskAdmin || false,
            user_id: projectData.projectUser || null
        });
        
        console.log('Resposta do createProject:', { data, error });
        
        if (error) {
            throw new Error(error.message || 'Erro ao criar projeto');
        }
        
        // DEBUG: Verificar detalhes do projeto criado
        console.log('=== DEBUG PROJETO CRIADO ===');
        console.log('Dados completos retornados:', data);
        console.log('ID do projeto:', data?.id);
        console.log('Tipo do ID:', typeof data?.id);
        console.log('================================');
        
        // Limpar currentProjectId antigo para evitar conflitos
        localStorage.removeItem('currentProjectId');
        
        // Salvar dados do projeto no localStorage para uso na próxima tela
        localStorage.setItem('zendeskProjectData', JSON.stringify({
            ...projectData,
            id: data.id
        }));
        
        // Definir o novo projeto como atual
        localStorage.setItem('currentProjectId', data.id);
        
        // DEBUG: Verificar localStorage
        console.log('Dados salvos no localStorage:', localStorage.getItem('zendeskProjectData'));
        console.log('currentProjectId definido como:', data.id);
        
        console.log('Projeto criado com sucesso, recarregando projetos...');
        
        // Recarregar a lista de projetos
        await loadExistingProjects();
        
        showMessage('Projeto criado com sucesso!', 'success');
        setTimeout(() => {
            console.log('=== DEBUG NAVEGAÇÃO ===');
            console.log('Navegando para projeto ID:', data.id);
            console.log('========================');
            navigateToSimulator(data.id);
        }, 1000);
        
    } catch (error) {
        console.error('Erro ao criar projeto:', error);
        showMessage('Erro ao criar projeto: ' + error.message, 'error');
    } finally {
        createProjectBtn.disabled = false;
        createProjectBtn.textContent = 'Criar Projeto';
    }
}

// Salvar dados do formulário automaticamente
function saveFormData() {
    const formData = {
        clientName: document.getElementById('clientName').value,
        clientType: document.getElementById('clientType').value
    };
    
    const clientType = formData.clientType;
    if (clientType === 'base') {
        const isTecnaClient = document.querySelector('input[name="isTecnaClient"]:checked')?.value;
        const hasZendeskAdmin = document.querySelector('input[name="hasZendeskAdmin"]:checked')?.value;
        
        if (isTecnaClient) formData.isTecnaClient = isTecnaClient;
        if (hasZendeskAdmin) formData.hasZendeskAdmin = hasZendeskAdmin;
    }
    
    try {
        localStorage.setItem('zendeskHomeFormData', JSON.stringify(formData));
    } catch (error) {
        console.error('Erro ao salvar dados do formulário:', error);
    }
}

// Carregar dados salvos
function loadSavedData() {
    try {
        const savedData = localStorage.getItem('zendeskHomeFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            // Restaurar campos básicos
            if (formData.clientName) {
                document.getElementById('clientName').value = formData.clientName;
            }
            
            if (formData.clientType) {
                document.getElementById('clientType').value = formData.clientType;
                
                // Trigger change event para mostrar perguntas condicionais
                clientTypeSelect.dispatchEvent(new Event('change'));
                
                // Restaurar perguntas condicionais
                if (formData.clientType === 'base') {
                    if (formData.isTecnaClient) {
                        const isTecnaRadio = document.querySelector(`input[name="isTecnaClient"][value="${formData.isTecnaClient}"]`);
                        if (isTecnaRadio) isTecnaRadio.checked = true;
                    }
                    
                    if (formData.hasZendeskAdmin) {
                        const hasAdminRadio = document.querySelector(`input[name="hasZendeskAdmin"][value="${formData.hasZendeskAdmin}"]`);
                        if (hasAdminRadio) hasAdminRadio.checked = true;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
    }
}

// Navegar para o simulador
function navigateToSimulator(projectId = null) {
    console.log('=== DEBUG NAVIGATE TO SIMULATOR ===');
    console.log('projectId recebido:', projectId);
    console.log('Tipo do projectId:', typeof projectId);
    
    // Adicionar animação de loading no botão se existir
    if (createProjectBtn) {
        createProjectBtn.innerHTML = '<span class="btn-icon">⏳</span> Criando projeto...';
        createProjectBtn.disabled = true;
    }
    
    // Simular delay para melhor UX
    setTimeout(() => {
        // Se não foi passado projectId, tentar pegar do localStorage
        const currentProjectId = projectId || localStorage.getItem('currentProjectId');
        
        console.log('currentProjectId final:', currentProjectId);
        console.log('localStorage currentProjectId:', localStorage.getItem('currentProjectId'));
        
        if (currentProjectId) {
            const finalUrl = `/simulador.html?projectId=${currentProjectId}`;
            console.log('URL final de redirecionamento:', finalUrl);
            console.log('===================================');
            window.location.href = finalUrl;
        } else {
            console.log('Redirecionando sem projectId');
            console.log('===================================');
            window.location.href = '/simulador.html';
        }
    }, 1000);
}

// Mostrar mensagens para o usuário
function showMessage(message, type = 'info') {
    // Remover mensagem anterior se existir
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Criar nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Inserir mensagem no topo do formulário
    const formContainer = document.querySelector('.project-form-container');
    formContainer.insertBefore(messageDiv, formContainer.firstChild);
    
    // Remover mensagem após 5 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Função para limpar dados salvos (útil para desenvolvimento)
function clearSavedData() {
    localStorage.removeItem('zendeskHomeFormData');
    localStorage.removeItem('zendeskProjectData');
    location.reload();
}

// Expor função para console (desenvolvimento)
// Carregar projetos existentes
async function loadExistingProjects() {
    try {
        console.log('=== CARREGANDO TODOS OS PROJETOS DO BANCO ===');
        console.log('Cliente Supabase disponível:', !!window.SupabaseAPI);
        
        // Verificar se o Supabase está inicializado
        if (!window.SupabaseAPI) {
            console.error('SupabaseAPI não está disponível');
            showErrorMessage('Sistema não inicializado. Recarregue a página.');
            return;
        }
        
        const { data: projects, error } = await SupabaseAPI.getProjects();
        
        console.log('=== RESPOSTA COMPLETA DA API ===');
        console.log('Total de projetos encontrados:', projects ? projects.length : 0);
        console.log('Dados dos projetos:', projects);
        console.log('Erro (se houver):', error);
        
        if (error) {
            console.error('Erro ao carregar projetos:', error);
            showErrorMessage(`Erro ao conectar com o banco de dados: ${error}`);
            return;
        }
        
        if (projects && projects.length > 0) {
            console.log(`=== EXIBINDO ${projects.length} PROJETOS ===`);
            displayExistingProjectsInHome(projects);
        } else {
            console.log('=== NENHUM PROJETO ENCONTRADO NO BANCO ===');
            showEmptyProjectsMessage();
        }
    } catch (error) {
        console.error('=== ERRO CRÍTICO AO CARREGAR PROJETOS ===', error);
        showErrorMessage(`Erro crítico: ${error.message}`);
    }
}

// Exibir projetos existentes na home page
function displayExistingProjectsInHome(projects) {
    console.log('=== INICIANDO EXIBIÇÃO DOS PROJETOS ===');
    console.log('Projetos recebidos para exibição:', projects);
    
    const existingProjectsSection = document.querySelector('.existing-projects-section');
    const projectsList = document.querySelector('.projects-list');
    
    console.log('Elementos encontrados:', {
        existingProjectsSection: !!existingProjectsSection,
        projectsList: !!projectsList
    });
    
    if (!existingProjectsSection || !projectsList) {
        console.error('Elementos da seção de projetos não encontrados');
        return;
    }
    
    // Limpar lista existente
    projectsList.innerHTML = '';
    console.log('Lista de projetos limpa');
    
    // Exibir TODOS os projetos (removendo limitação de 5)
    console.log(`=== PROCESSANDO ${projects.length} PROJETOS ===`);
    
    projects.forEach((project, index) => {
        console.log(`Processando projeto ${index + 1}:`, project);
        
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.onclick = () => loadProject(project.id);
        
        const statusText = {
            'draft': 'Rascunho',
            'in_progress': 'Em Progresso',
            'completed': 'Concluído',
            'pending': 'Pendente'
        }[project.status] || project.status;
        
        // Obter nome do usuário responsável
        const responsibleUser = project.users ? project.users.name : 'Não atribuído';
        
        projectItem.innerHTML = `
            <div class="project-info">
                <h4>${project.name}</h4>
                <p>${project.description || 'Sem descrição'}</p>
                <div class="project-meta">
                    <span class="project-date">${new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
                    <span class="project-user">👤 ${responsibleUser}</span>
                </div>
            </div>
            <div class="project-status">
                <span class="status-badge ${project.status}">${statusText}</span>
            </div>
        `;
        
        projectsList.appendChild(projectItem);
        console.log(`Projeto ${project.name} adicionado à lista`);
    });
    
    // Mostrar a seção
    existingProjectsSection.style.display = 'block';
    console.log('=== EXIBIÇÃO CONCLUÍDA - SEÇÃO VISÍVEL ===');
}

// Manter função original para compatibilidade (se usada em outros lugares)
function displayExistingProjects(projects) {
    // Validar se projects é um array válido
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
        console.warn('Nenhum projeto encontrado ou dados inválidos');
        return;
    }
    
    const existingProjectsContainer = document.createElement('div');
    existingProjectsContainer.className = 'existing-projects';
    existingProjectsContainer.innerHTML = `
        <h3>Projetos Recentes</h3>
        <div class="projects-list">
            ${projects.slice(0, 5).map(project => `
                <div class="project-item" onclick="loadProject('${project.id}')">
                    <div class="project-info">
                        <h4>${project.name}</h4>
                        <p>${project.description || 'Sem descrição'}</p>
                        <span class="project-date">${new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div class="project-status">
                        <span class="status-badge ${project.status}">${project.status}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Inserir antes do formulário
    const formContainer = document.querySelector('.project-form-container');
    formContainer.parentNode.insertBefore(existingProjectsContainer, formContainer);
}

// Carregar projeto existente
function loadProject(projectId) {
    localStorage.setItem('currentProjectId', projectId);
    navigateToSimulator();
}

// Mostrar mensagem de erro
function showErrorMessage(message) {
    const existingProjectsSection = document.getElementById('existing-projects-section');
    if (existingProjectsSection) {
        existingProjectsSection.style.display = 'block';
        const projectsList = existingProjectsSection.querySelector('.projects-list');
        if (projectsList) {
            projectsList.innerHTML = '';
        }
        
        // Remover mensagens anteriores
        const existingMessages = existingProjectsSection.querySelectorAll('.error-message, .empty-message');
        existingMessages.forEach(msg => msg.remove());
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <p><strong>❌ ${message}</strong></p>
        `;
        existingProjectsSection.appendChild(errorDiv);
    }
}

// Mostrar mensagem quando não há projetos
function showEmptyProjectsMessage() {
    const existingProjectsSection = document.getElementById('existing-projects-section');
    if (existingProjectsSection) {
        existingProjectsSection.style.display = 'block';
        const projectsList = existingProjectsSection.querySelector('.projects-list');
        if (projectsList) {
            projectsList.innerHTML = '';
        }
        
        // Remover mensagens anteriores
        const existingMessages = existingProjectsSection.querySelectorAll('.error-message, .empty-message');
        existingMessages.forEach(msg => msg.remove());
        
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-message';
        emptyDiv.innerHTML = `
            <p><strong>📝 Nenhum projeto salvo ainda</strong></p>
            <p>Crie seu primeiro projeto para vê-lo aqui!</p>
        `;
        existingProjectsSection.appendChild(emptyDiv);
    }
}

// Funcionalidade do filtro por data
function setupDateFilter() {
    const dateFilter = document.getElementById('date-filter');
    const customDateRange = document.getElementById('custom-date-range');
    const applyFilterBtn = document.getElementById('apply-filter');
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            if (this.value === 'custom') {
                customDateRange.style.display = 'flex';
            } else {
                customDateRange.style.display = 'none';
                filterProjectsByDate(this.value);
            }
        });
    }
    
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            
            if (startDate && endDate) {
                filterProjectsByDate('custom', startDate, endDate);
            } else {
                alert('Por favor, selecione ambas as datas.');
            }
        });
    }
}

function filterProjectsByDate(period, startDate = null, endDate = null) {
    const projectItems = document.querySelectorAll('.project-item');
    const now = new Date();
    
    projectItems.forEach(item => {
        const projectDateText = item.querySelector('.project-date').textContent;
        const projectDate = parseProjectDate(projectDateText);
        
        let shouldShow = true;
        
        switch (period) {
            case 'today':
                shouldShow = isToday(projectDate, now);
                break;
            case 'week':
                shouldShow = isWithinDays(projectDate, now, 7);
                break;
            case 'month':
                shouldShow = isWithinDays(projectDate, now, 30);
                break;
            case 'custom':
                if (startDate && endDate) {
                    // Converter as datas de entrada para objetos Date evitando problemas de fuso horário
                    const start = new Date(startDate + 'T00:00:00');
                    const end = new Date(endDate + 'T23:59:59');
                    
                    // Normalizar todas as datas para comparação apenas por dia
                    const projectDateOnly = new Date(projectDate.getFullYear(), projectDate.getMonth(), projectDate.getDate());
                    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                    const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                    
                    // Comparar apenas as datas (sem horário)
                    shouldShow = projectDateOnly >= startDateOnly && projectDateOnly <= endDateOnly;
                }
                break;
            case 'all':
            default:
                shouldShow = true;
                break;
        }
        
        item.style.display = shouldShow ? 'flex' : 'none';
    });
}

function parseProjectDate(dateText) {
    // Assumindo formato "dd/mm/aaaa"
    const parts = dateText.split('/');
    if (parts.length === 3) {
        const date = new Date(parts[2], parts[1] - 1, parts[0]);
        date.setHours(0, 0, 0, 0); // Garantir que seja início do dia
        return date;
    }
    const fallbackDate = new Date();
    fallbackDate.setHours(0, 0, 0, 0);
    return fallbackDate;
}

function isToday(date, now) {
    return date.toDateString() === now.toDateString();
}

function isWithinDays(date, now, days) {
    const diffTime = now - date;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= days;
}

// Inicializar filtro quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setupDateFilter();
});

// Carregar usuários para o campo de seleção
async function loadUsersForSelect() {
    try {
        const { data: users, error } = await SupabaseAPI.getUsers();
        
        if (error) {
            console.error('Erro ao carregar usuários:', error);
            return;
        }
        
        const projectUserSelect = document.getElementById('projectUser');
        if (projectUserSelect) {
            // Limpar opções existentes (exceto a primeira)
            projectUserSelect.innerHTML = '<option value="">Selecione um usuário</option>';
            
            // Adicionar usuários como opções
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.email})`;
                projectUserSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

window.clearSavedData = clearSavedData;
window.loadProject = loadProject;
window.filterProjectsByDate = filterProjectsByDate;
window.loadUsersForSelect = loadUsersForSelect;