// Dados do projeto carregados da página inicial
let projectData = {};

// Produtos selecionados e suas configurações
let selectedProducts = new Set();
let productConfigurations = {};

// Definição dos produtos disponíveis
const availableProducts = {
    'suite-zendesk': {
        name: 'Suite Zendesk',
        icon: '🎯',
        description: 'Plataforma principal de atendimento ao cliente com Support, Guide e Explore',
        phases: {
            'project-management': { name: 'Gestão de Projetos', baseHours: 22 },
            'discovery-design': { name: 'Discovery & Design', baseHours: 16 },
            'configuration': { name: 'Configuração', baseHours: 54 },
            'testing-adjustments': { name: 'Testes e Ajustes', baseHours: 11 },
            'go-live': { name: 'Go live', baseHours: 20 }
        }
    },
    'copilot': {
        name: 'Copilot',
        icon: '🤖',
        description: 'Assistente de IA para agentes com sugestões inteligentes e automação',
        phases: {
            'project-management': { name: 'Gestão de Projetos', baseHours: 8 },
            'discovery-design': { name: 'Discovery & Design', baseHours: 12 },
            'configuration': { name: 'Configuração', baseHours: 24 },
            'testing-adjustments': { name: 'Testes e Ajustes', baseHours: 8 },
            'go-live': { name: 'Go live', baseHours: 8 }
        }
    },
    'zendesk-qa': {
        name: 'Zendesk QA',
        icon: '✅',
        description: 'Ferramenta de qualidade para monitoramento e avaliação de atendimentos',
        phases: {
            'project-management': { name: 'Gestão de Projetos', baseHours: 6 },
            'discovery-design': { name: 'Discovery & Design', baseHours: 8 },
            'configuration': { name: 'Configuração', baseHours: 16 },
            'testing-adjustments': { name: 'Testes e Ajustes', baseHours: 6 },
            'go-live': { name: 'Go live', baseHours: 4 }
        }
    },
    'zendesk-wfm': {
        name: 'Zendesk WFM',
        icon: '📊',
        description: 'Gestão de força de trabalho com previsão, agendamento e análise',
        phases: {
            'project-management': { name: 'Gestão de Projetos', baseHours: 10 },
            'discovery-design': { name: 'Discovery & Design', baseHours: 16 },
            'configuration': { name: 'Configuração', baseHours: 32 },
            'testing-adjustments': { name: 'Testes e Ajustes', baseHours: 12 },
            'go-live': { name: 'Go live', baseHours: 10 }
        }
    },
    'advanced-ai': {
        name: 'Agente de IA Avançado',
        icon: '🧠',
        description: 'Agente virtual inteligente para atendimento automatizado avançado',
        phases: {
            'project-management': { name: 'Gestão de Projetos', baseHours: 12 },
            'discovery-design': { name: 'Discovery & Design', baseHours: 20 },
            'configuration': { name: 'Configuração', baseHours: 40 },
            'testing-adjustments': { name: 'Testes e Ajustes', baseHours: 16 },
            'go-live': { name: 'Go live', baseHours: 12 }
        }
    }
};

// Dados de configuração por tipo de cliente
const clientTypeConfigs = {
    'base': {
        multipliers: {
            'tecna-client': 0.9,
            'has-admin': 0.85
        }
    },
    'new-logo': {
        multipliers: {
            'new-client': 1.2
        }
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Função para aguardar o carregamento completo
    function waitForSupabase(attempts = 0) {
        if (typeof supabase !== 'undefined' && typeof initSupabase === 'function' && typeof SupabaseAPI !== 'undefined') {
            initSupabase();
            
            // Aguardar um pouco após a inicialização e verificar se getProject está disponível
            setTimeout(() => {
                if (typeof SupabaseAPI !== 'undefined' && typeof SupabaseAPI.getProject === 'function') {
                    loadProjectData();
                } else {
                    // Fallback para localStorage
                    const savedData = localStorage.getItem('zendeskProjectData');
                    if (savedData) {
                        projectData = JSON.parse(savedData);
                    }
                }
                
                displayProjectInfo();
                loadSelectedProducts();
                updateSelectedProductsDisplay();
            }, 100);
        } else if (attempts < 10) {
            // Tentar novamente após 200ms
            setTimeout(() => waitForSupabase(attempts + 1), 200);
        } else {
            // Fallback sem Supabase
            loadProjectData();
            displayProjectInfo();
            loadSelectedProducts();
            updateSelectedProductsDisplay();
        }
    }
    
    // Iniciar o processo de carregamento
    waitForSupabase();
});

// Carregar dados do projeto da página inicial
async function loadProjectData() {
    try {
        // Verificar se há um ID de projeto na URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectIdFromUrl = urlParams.get('projectId');
        
        // Priorizar ID da URL, depois localStorage
        const currentProjectId = projectIdFromUrl || localStorage.getItem('currentProjectId');
        
        if (currentProjectId && typeof SupabaseAPI !== 'undefined' && typeof SupabaseAPI.getProject === 'function') {
            // Carregar projeto específico do Supabase
            const { data: project, error } = await SupabaseAPI.getProject(currentProjectId);
            
            if (error) {
                console.error('Erro ao carregar projeto:', error);
                // Criar projeto de exemplo se não encontrar
                createExampleProject(currentProjectId);
                return;
            }
            
            if (project) {
                projectData = {
                    id: project.id,
                    clientName: project.name,
                    clientType: project.client_type || 'enterprise',
                    isTecnaClient: project.is_tecna_client || false,
                    hasZendeskAdmin: project.has_zendesk_admin || false
                };
                
                // Salvar ID no localStorage para próximas sessões
                localStorage.setItem('currentProjectId', currentProjectId);
                
                // Carregar produtos associados ao projeto
                await loadProjectProducts(currentProjectId);
                
                // Exibir informações do projeto na tela
                displayProjectInfo();
            } else {
                // Projeto não encontrado, criar exemplo
                createExampleProject(currentProjectId);
            }
        } else {
            // Carregar dados do localStorage ou criar projeto exemplo
            const savedData = localStorage.getItem('zendeskProjectData');
            if (savedData) {
                projectData = JSON.parse(savedData);
                displayProjectInfo();
            } else if (currentProjectId) {
                // Criar projeto de exemplo com o ID fornecido
                createExampleProject(currentProjectId);
            } else {
                // Criar projeto padrão
                createExampleProject('exemplo-1');
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados do projeto:', error);
        // Criar projeto de exemplo em caso de erro
        createExampleProject('exemplo-erro');
    }
}

// Função para criar um projeto de exemplo quando não há dados
function createExampleProject(projectId) {
    projectData = {
        id: projectId,
        clientName: `Projeto Exemplo ${projectId}`,
        clientType: 'enterprise',
        isTecnaClient: true,
        hasZendeskAdmin: false
    };
    
    // Adicionar alguns produtos de exemplo
    selectedProducts.add('suite-zendesk');
    selectedProducts.add('copilot');
    
    // Salvar no localStorage
    localStorage.setItem('zendeskProjectData', JSON.stringify(projectData));
    localStorage.setItem('currentProjectId', projectId);
    
    // Exibir informações do projeto
    displayProjectInfo();
    updateSelectedProductsDisplay();
}

// Carregar produtos associados ao projeto
async function loadProjectProducts(projectId) {
    try {
        const { data: projectProducts, error } = await SupabaseAPI.getProjectProducts(projectId);
        
        if (error) {
            console.error('Erro ao carregar produtos do projeto:', error);
            return;
        }
        
        if (projectProducts && projectProducts.length > 0) {
            selectedProducts = new Set(projectProducts.map(pp => pp.product_id));
            
            // Carregar configurações dos produtos
            productConfigurations = {};
            projectProducts.forEach(pp => {
                if (pp.configuration) {
                    productConfigurations[pp.product_id] = pp.configuration;
                }
            });
            
            // Atualizar interface dos cards
            selectedProducts.forEach(productId => {
                const card = document.querySelector(`[data-product="${productId}"]`);
                if (card) {
                    card.classList.add('selected');
                    const toggle = card.querySelector('.product-toggle .toggle-text');
                    const badge = card.querySelector('.status-badge');
                    
                    if (toggle) toggle.textContent = 'Remover';
                    if (badge) {
                        badge.textContent = productConfigurations[productId] ? 'Configurado' : 'Selecionado';
                        if (productConfigurations[productId]) {
                            card.classList.add('configured');
                        }
                    }
                }
            });
            
            updateSelectedProductsDisplay();
        }
    } catch (error) {
        console.error('Erro ao carregar produtos do projeto:', error);
    }
}

// Função para carregar produtos selecionados (fallback)
function loadSelectedProducts() {
    const savedProducts = localStorage.getItem('selectedProducts');
    const savedConfigurations = localStorage.getItem('productConfigurations');
    
    if (savedProducts) {
        selectedProducts = new Set(JSON.parse(savedProducts));
    }
    
    if (savedConfigurations) {
        productConfigurations = JSON.parse(savedConfigurations);
    }
    
    // Atualizar interface dos cards
    selectedProducts.forEach(productId => {
        const card = document.querySelector(`[data-product="${productId}"]`);
        if (card) {
            card.classList.add('selected');
            const toggle = card.querySelector('.product-toggle .toggle-text');
            const badge = card.querySelector('.status-badge');
            
            if (toggle) toggle.textContent = 'Remover';
            if (badge) {
                badge.textContent = productConfigurations[productId] ? 'Configurado' : 'Selecionado';
                if (productConfigurations[productId]) {
                    card.classList.add('configured');
                }
            }
        }
    });
}

// Salvar produtos selecionados no Supabase
async function saveSelectedProducts() {
    try {
        // Salvar no localStorage como backup
        localStorage.setItem('selectedProducts', JSON.stringify({
            products: Array.from(selectedProducts),
            configurations: productConfigurations
        }));
        
        // Se há um projeto no Supabase, salvar os produtos
        if (projectData.id) {
            await SupabaseAPI.updateProjectProducts(projectData.id, {
                products: Array.from(selectedProducts),
                configurations: productConfigurations
            });
        }
    } catch (error) {
        console.error('Erro ao salvar produtos:', error);
        // Continuar com localStorage como fallback
    }
}

// Função para exibir informações do projeto no cabeçalho
function displayProjectInfo() {
    const projectInfo = document.getElementById('projectInfo');
    
    if (!projectInfo) {
        console.error('Elemento projectInfo não encontrado');
        return;
    }
    
    if (projectData.clientName) {
        // Atualizar nome do projeto
        const projectNameEl = document.getElementById('projectName');
        if (projectNameEl) {
            projectNameEl.textContent = projectData.clientName;
        }
        
        // Atualizar ID do projeto
        const projectIdEl = document.getElementById('projectId');
        if (projectIdEl && projectData.id) {
            projectIdEl.textContent = `#${projectData.id}`;
        }
        
        // Atualizar nome do cliente
        const clientNameEl = document.getElementById('clientName');
        if (clientNameEl) {
            clientNameEl.textContent = projectData.clientName;
        }
        
        // Atualizar tipo do cliente
        const clientTypeEl = document.getElementById('clientType');
        if (clientTypeEl) {
            clientTypeEl.textContent = projectData.clientType === 'base' ? 'Base' : 'New Logo';
        }
        
        // Atualizar se é cliente Tecna
        const isTecnaClientEl = document.getElementById('isTecnaClient');
        if (isTecnaClientEl) {
            isTecnaClientEl.textContent = projectData.isTecnaClient ? 'Sim' : 'Não';
            isTecnaClientEl.className = `detail-value ${projectData.isTecnaClient ? 'positive' : 'negative'}`;
        }
        
        // Atualizar se tem admin Zendesk
        const hasZendeskAdminEl = document.getElementById('hasZendeskAdmin');
        if (hasZendeskAdminEl) {
            hasZendeskAdminEl.textContent = projectData.hasZendeskAdmin ? 'Sim' : 'Não';
            hasZendeskAdminEl.className = `detail-value ${projectData.hasZendeskAdmin ? 'positive' : 'negative'}`;
        }
        
        // Mostrar o cabeçalho
        projectInfo.style.display = 'block';
    }
}

// Função para voltar à página inicial
function goToHome() {
    window.location.href = '/';
}

// Função para mostrar/ocultar abas
function showTab(tabName) {
    // Ocultar todas as abas
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover classe active de todos os botões
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Mostrar a aba selecionada
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Adicionar classe active ao botão correspondente
    const activeButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Função para alternar seleção de produto
function toggleProduct(productId) {
    const card = document.querySelector(`[data-product="${productId}"]`);
    const toggle = card.querySelector('.product-toggle .toggle-text');
    const badge = card.querySelector('.status-badge');
    
    if (selectedProducts.has(productId)) {
        // Remover produto
        selectedProducts.delete(productId);
        delete productConfigurations[productId];
        
        card.classList.remove('selected', 'configured');
        toggle.textContent = 'Adicionar';
        badge.textContent = 'Não configurado';
    } else {
        // Adicionar produto
        selectedProducts.add(productId);
        
        card.classList.add('selected');
        toggle.textContent = 'Remover';
        badge.textContent = 'Selecionado';
        
        // Abrir questionário do produto
        setTimeout(() => {
            openProductQuestionnaire(productId);
        }, 300);
    }
    
    saveSelectedProducts();
    updateSelectedProductsDisplay();
}

// Função para abrir questionário de produto específico
function openProductQuestionnaire(productId) {
    openQuestionnaireModal(productId);
}

// Função para atualizar exibição de produtos selecionados
function updateSelectedProductsDisplay() {
    const selectedProductsContainer = document.getElementById('selectedProducts');
    const selectedProductsList = document.getElementById('selectedProductsList');
    
    if (selectedProducts.size === 0) {
        selectedProductsContainer.style.display = 'none';
        return;
    }
    
    selectedProductsContainer.style.display = 'block';
    selectedProductsList.innerHTML = '';
    
    selectedProducts.forEach(productId => {
        const product = availableProducts[productId];
        const isConfigured = productConfigurations[productId] && productConfigurations[productId].configured;
        
        const item = document.createElement('div');
        item.className = 'selected-product-item';
        item.innerHTML = `
            <div class="product-info">
                <span class="product-icon">${product.icon}</span>
                <span class="product-name">${product.name}</span>
                <span class="product-status ${isConfigured ? 'configured' : 'pending'}">
                    ${isConfigured ? '✅ Configurado' : '⏳ Pendente'}
                </span>
            </div>
            <div class="product-actions">
                <button class="btn-edit" onclick="openProductQuestionnaire('${productId}')" title="${isConfigured ? 'Editar configuração' : 'Configurar produto'}">
                    ${isConfigured ? '✏️ Editar' : '⚙️ Configurar'}
                </button>
            </div>
        `;
        selectedProductsList.appendChild(item);
    });
}

// Função para abrir questionário do produto
function openProductQuestionnaire(productId) {
    
    openQuestionnaireModal(productId);
}

// Função para gerar escopo do projeto
async function generateScope() {
    const scopeResults = document.getElementById('scope-results');
    
    if (selectedProducts.size === 0) {
        scopeResults.innerHTML = '<p style="color: #dc3545;">Selecione pelo menos um produto para gerar o escopo.</p>';
        return;
    }
    
    if (!projectData.clientType) {
        scopeResults.innerHTML = '<p style="color: #dc3545;">Erro: Dados do projeto não encontrados. Volte à página inicial.</p>';
        return;
    }
    
    // Verificar se o modelo de faturamento foi selecionado
    if (!currentBillingModel) {
        scopeResults.innerHTML = '<p style="color: #dc3545;">Selecione um modelo de faturamento para gerar o escopo.</p>';
        return;
    }
    
    // Salvar respostas das perguntas antes de gerar o escopo
    try {
        await saveProjectAnswers();
    } catch (error) {
        console.error('Erro ao salvar respostas das perguntas:', error);
        scopeResults.innerHTML = '<p style="color: #dc3545;">Erro ao salvar respostas das perguntas. Tente novamente.</p>';
        return;
    }
    
    let scopeData;
    
    try {
        // Usar o novo sistema de cálculo baseado no modelo de faturamento
        if (currentBillingModel === 'fixed_scope') {
            // Para escopo fechado, usar a API que calcula baseado nas regras padrão
            scopeData = await SupabaseAPI.calculateFixedScope({
                project_id: projectData.id,
                products: Array.from(selectedProducts),
                answers: projectAnswers
            });
        } else {
            // Para Time & Materials, usar o cálculo tradicional
            const config = clientTypeConfigs[projectData.clientType];
            const hourlyRate = 280; // R$ 280 por hora
            
            // Consolidar fases de todos os produtos
            const consolidatedPhases = {
                'Gestão de Projetos': 0,
                'Discovery & Design': 0,
                'Configuração': 0,
                'Testes e Ajustes': 0,
                'Go live': 0
            };
            
            // Somar horas de cada produto selecionado
            selectedProducts.forEach(productId => {
                const product = availableProducts[productId];
                Object.entries(product.phases).forEach(([phaseKey, phaseData]) => {
                    consolidatedPhases[phaseData.name] += phaseData.baseHours;
                });
            });
            
            // Aplicar multiplicadores para clientes Base
            if (projectData.clientType === 'base') {
                if (projectData.isTecnaClient === 'yes') {
                    Object.keys(consolidatedPhases).forEach(phase => {
                        consolidatedPhases[phase] = Math.round(consolidatedPhases[phase] * config.multipliers['tecna-client']);
                    });
                }
                
                if (projectData.hasZendeskAdmin === 'yes') {
                    Object.keys(consolidatedPhases).forEach(phase => {
                        consolidatedPhases[phase] = Math.round(consolidatedPhases[phase] * config.multipliers['has-admin']);
                    });
                }
            }
            
            // Aplicar multiplicador para New Logo
            if (projectData.clientType === 'new-logo') {
                Object.keys(consolidatedPhases).forEach(phase => {
                    consolidatedPhases[phase] = Math.round(consolidatedPhases[phase] * config.multipliers['new-client']);
                });
            }
            
            // Calcular totais
            let totalHours = 0;
            Object.values(consolidatedPhases).forEach(hours => {
                totalHours += hours;
            });
            
            const totalValue = totalHours * hourlyRate;
            
            scopeData = {
                phases: consolidatedPhases,
                total_hours: totalHours,
                total_value: totalValue,
                hourly_rate: hourlyRate,
                complexity_level: 'medium' // Padrão para Time & Materials
            };
        }
    } catch (error) {
        console.error('Erro ao calcular escopo:', error);
        scopeResults.innerHTML = '<p style="color: #dc3545;">Erro ao calcular escopo. Tente novamente.</p>';
        return;
    }
    
    // Gerar HTML da tabela
    let tableHTML = `
        <div class="scope-table">
            <table>
                <thead>
                    <tr>
                        <th>Fase</th>
                        <th>Horas</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    Object.entries(scopeData.phases).forEach(([phase, hours]) => {
        tableHTML += `
            <tr>
                <td>${phase}</td>
                <td>${hours}</td>
            </tr>
        `;
    });
    
    tableHTML += `
                    <tr class="total-row">
                        <td><strong>Total</strong></td>
                        <td><strong>${scopeData.total_hours}</strong></td>
                    </tr>
                    <tr class="value-row">
                        <td><strong>Valor total</strong></td>
                        <td><strong>R$ ${scopeData.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="project-summary">
            <h3>Resumo do Projeto</h3>
            <p><strong>Cliente:</strong> ${projectData.clientName}</p>
            <p><strong>Tipo:</strong> ${projectData.clientType === 'base' ? 'Base' : 'New Logo'}</p>
            <p><strong>Modelo de Faturamento:</strong> ${currentBillingModel === 'time_materials' ? 'Time & Materials' : 'Escopo Fechado'}</p>
            ${scopeData.complexity_level ? `<p><strong>Nível de Complexidade:</strong> ${scopeData.complexity_level === 'low' ? 'Baixa' : scopeData.complexity_level === 'medium' ? 'Média' : 'Alta'}</p>` : ''}
            <p><strong>Produtos:</strong> ${[...selectedProducts].map(id => availableProducts[id].name).join(', ')}</p>
            ${projectData.clientType === 'base' ? `
                <p><strong>Cliente Tecna:</strong> ${projectData.isTecnaClient === 'yes' ? 'Sim' : 'Não'}</p>
                <p><strong>Tem Admin Zendesk:</strong> ${projectData.hasZendeskAdmin === 'yes' ? 'Sim' : 'Não'}</p>
            ` : ''}
        </div>
    `;
    
    scopeResults.innerHTML = tableHTML;
    
    // Salvar resultados no Supabase
    try {
        if (projectData.id) {
            const projectUpdateData = {
                project_id: projectData.id,
                phases: scopeData.phases,
                total_hours: scopeData.total_hours,
                total_value: scopeData.total_value,
                hourly_rate: scopeData.hourly_rate || 280,
                selected_products: Array.from(selectedProducts),
                product_configurations: productConfigurations,
                client_type: projectData.clientType,
                is_tecna_client: projectData.isTecnaClient,
                has_zendesk_admin: projectData.hasZendeskAdmin,
                billing_model: currentBillingModel,
                complexity_level: scopeData.complexity_level
            };
            
            await SupabaseAPI.saveQuestionnaireAnswers(projectUpdateData);
            
            // Atualizar status do projeto com os novos campos
            await SupabaseAPI.updateProject(projectData.id, {
                status: 'completed',
                total_hours: scopeData.total_hours,
                total_value: scopeData.total_value,
                billing_model: currentBillingModel,
                complexity_level: scopeData.complexity_level
            });
        }
    } catch (error) {
        console.error('Erro ao salvar resultados:', error);
        // Continuar mesmo com erro, pois o usuário já vê os resultados
    }
    
    // Mostrar a aba de escopo
    showTab('project-scope');
}

// Função para abrir modal de configurações
function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
}

// Função para fechar modal de configurações
function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('settingsModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Função para confirmar exclusão do projeto
function confirmDeleteProject() {
    const projectName = document.getElementById('projectName').textContent;
    const projectId = localStorage.getItem('currentProjectId');
    
    if (!projectId) {
        alert('Erro: ID do projeto não encontrado.');
        return;
    }
    
    const confirmMessage = `Tem certeza que deseja excluir o projeto "${projectName}"?\n\nEsta ação não pode ser desfeita e todos os dados do projeto serão perdidos permanentemente.`;
    
    if (confirm(confirmMessage)) {
        deleteProject(projectId);
    }
}

// Função para excluir o projeto
async function deleteProject(projectId) {
    try {
        console.log('🗑️ Iniciando exclusão do projeto ID:', projectId);
        
        // Mostrar indicador de carregamento
        const deleteBtn = document.querySelector('.btn-delete-project');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '⏳ Excluindo...';
        deleteBtn.disabled = true;
        
        // Chamar a API para excluir o projeto
        const { data, error } = await SupabaseAPI.deleteProject(projectId);
        
        if (error) {
            console.error('Erro ao excluir projeto:', error);
            alert(`Erro ao excluir projeto: ${error}`);
            
            // Restaurar botão
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
            return;
        }
        
        console.log('✅ Projeto excluído com sucesso');
        
        // Limpar dados locais
        localStorage.removeItem('currentProjectId');
        localStorage.removeItem('projectData');
        
        // Mostrar mensagem de sucesso
        alert('Projeto excluído com sucesso!');
        
        // Redirecionar para a página inicial
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Erro crítico ao excluir projeto:', error);
        alert(`Erro crítico: ${error.message}`);
        
        // Restaurar botão em caso de erro
        const deleteBtn = document.querySelector('.btn-delete-project');
        if (deleteBtn) {
            deleteBtn.innerHTML = '🗑️ Excluir';
            deleteBtn.disabled = false;
        }
    }
}

// Função para alternar o modal de configuração
function toggleConfigModal() {
    const modal = document.getElementById('config-modal');
    if (modal) {
        if (modal.style.display === 'none' || modal.style.display === '') {
            modal.style.display = 'flex';
            loadUsers(); // Carregar usuários ao abrir o modal
        } else {
            modal.style.display = 'none';
        }
    }
}

// Função para alternar entre abas de configuração
function openConfigTab(evt, tabName) {
    // Esconder todas as abas
    const tabContents = document.getElementsByClassName('config-tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remover classe active de todos os botões
    const tabButtons = document.getElementsByClassName('config-tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    // Mostrar aba selecionada e marcar botão como ativo
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
    
    // Carregar usuários se a aba de usuários foi selecionada
    if (tabName === 'users-tab') {
        loadUsers();
    }
}

// Variável global para armazenar usuários
let users = [];

// Função para carregar usuários do banco
async function loadUsers() {
    try {
        const { data, error } = await SupabaseAPI.getUsers();
        
        if (error) {
            console.error('Erro ao carregar usuários:', error);
            return;
        }
        
        users = data || [];
        displayUsers();
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

// Função para exibir lista de usuários
function displayUsers() {
    const usersList = document.getElementById('users-list');
    if (!usersList) return;
    
    if (users.length === 0) {
        usersList.innerHTML = '<div class="users-empty">Nenhum usuário cadastrado</div>';
        return;
    }
    
    usersList.innerHTML = users.map(user => `
        <div class="user-item" data-user-id="${user.id}">
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-email">${user.email}</div>
            </div>
            <div class="user-actions">
                <button class="btn-edit" onclick="editUser(${user.id})">Editar</button>
                <button class="btn-delete" onclick="deleteUser(${user.id})">Excluir</button>
            </div>
        </div>
    `).join('');
}

// Função para adicionar usuário
async function addUser(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const userData = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim().toLowerCase()
    };
    
    // Validações
    if (!userData.name || !userData.email) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Verificar se email já existe
    const emailExists = users.some(user => user.email === userData.email);
    if (emailExists) {
        alert('Este e-mail já está cadastrado.');
        return;
    }
    
    try {
        const { data, error } = await SupabaseAPI.createUser(userData);
        
        if (error) {
            console.error('Erro ao adicionar usuário:', error);
            alert('Erro ao adicionar usuário. Tente novamente.');
            return;
        }
        
        // Adicionar à lista local e atualizar display
        users.push(data);
        users.sort((a, b) => a.name.localeCompare(b.name));
        displayUsers();
        
        // Limpar formulário
        form.reset();
        
        alert('Usuário adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar usuário:', error);
        alert('Erro ao adicionar usuário. Tente novamente.');
    }
}

// Função para editar usuário
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newName = prompt('Nome:', user.name);
    if (newName === null) return; // Cancelou
    
    const newEmail = prompt('E-mail:', user.email);
    if (newEmail === null) return; // Cancelou
    
    // Validações
    if (!newName.trim() || !newEmail.trim()) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    const emailExists = users.some(u => u.id !== userId && u.email === newEmail.trim().toLowerCase());
    if (emailExists) {
        alert('Este e-mail já está cadastrado.');
        return;
    }
    
    updateUser(userId, {
        name: newName.trim(),
        email: newEmail.trim().toLowerCase()
    });
}

// Função para atualizar usuário no banco
async function updateUser(userId, userData) {
    try {
        const { data, error } = await SupabaseAPI.updateUser(userId, userData);
        
        if (error) {
            console.error('Erro ao atualizar usuário:', error);
            alert('Erro ao atualizar usuário. Tente novamente.');
            return;
        }
        
        // Atualizar na lista local
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex] = data;
            users.sort((a, b) => a.name.localeCompare(b.name));
            displayUsers();
        }
        
        alert('Usuário atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        alert('Erro ao atualizar usuário. Tente novamente.');
    }
}

// Função para excluir usuário
function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
        return;
    }
    
    removeUser(userId);
}

// Função para remover usuário do banco
async function removeUser(userId) {
    try {
        const { error } = await SupabaseAPI.deleteUser(userId);
        
        if (error) {
            console.error('Erro ao excluir usuário:', error);
            alert('Erro ao excluir usuário. Tente novamente.');
            return;
        }
        
        // Remover da lista local
        users = users.filter(u => u.id !== userId);
        displayUsers();
        
        alert('Usuário excluído com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário. Tente novamente.');
    }
}

// Função para limpar formulário de usuário
function clearUserForm() {
    const form = document.getElementById('user-form');
    if (form) {
        form.reset();
    }
}

// Adicionar event listener para o formulário de usuário quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', addUser);
    }
});