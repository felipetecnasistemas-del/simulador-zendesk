// Lógica para a página inicial do simulador Zendesk

// Elementos do DOM
const clientTypeSelect = document.getElementById('clientType');
const baseClientQuestions = document.getElementById('baseClientQuestions');
const projectForm = document.getElementById('projectForm');
const createProjectBtn = document.getElementById('createProjectBtn');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Supabase
    initSupabase();
    loadSavedData();
    setupEventListeners();
    loadExistingProjects();
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
    
    const projectData = {
        clientName,
        clientType,
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
        createProjectBtn.disabled = true;
        createProjectBtn.textContent = 'Criando projeto...';
        
        // Criar projeto no Supabase
        const { data, error } = await SupabaseAPI.createProject({
            name: projectData.clientName,
            description: `Projeto para cliente ${projectData.clientName} - Tipo: ${projectData.clientType}`,
            client_type: projectData.clientType,
            is_tecna_client: projectData.isTecnaClient || false,
            has_zendesk_admin: projectData.hasZendeskAdmin || false
        });
        
        if (error) {
            throw new Error(error.message || 'Erro ao criar projeto');
        }
        
        // Salvar dados do projeto no localStorage para uso na próxima tela
        localStorage.setItem('zendeskProjectData', JSON.stringify({
            ...projectData,
            id: data.id
        }));
        
        showMessage('Projeto criado com sucesso!', 'success');
        setTimeout(() => {
            navigateToSimulator();
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
function navigateToSimulator() {
    // Adicionar animação de loading no botão
    createProjectBtn.innerHTML = '<span class="btn-icon">⏳</span> Criando projeto...';
    createProjectBtn.disabled = true;
    
    // Simular delay para melhor UX
    setTimeout(() => {
        window.location.href = '/simulador';
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
        const { data: projects, error } = await SupabaseAPI.getProjects();
        
        if (error) {
            console.error('Erro ao carregar projetos:', error);
            return;
        }
        
        if (projects && projects.length > 0) {
            displayExistingProjects(projects);
        }
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
    }
}

// Exibir projetos existentes
function displayExistingProjects(projects) {
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

window.clearSavedData = clearSavedData;
window.loadProject = loadProject;