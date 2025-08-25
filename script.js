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
    loadProjectData();
    displayProjectInfo();
    loadSelectedProducts();
    updateSelectedProductsDisplay();
});

// Carregar dados do projeto da página inicial
async function loadProjectData() {
    try {
        // Verificar se há um projeto específico para carregar
        const currentProjectId = localStorage.getItem('currentProjectId');
        
        if (currentProjectId) {
            // Carregar projeto específico do Supabase
            const { data: project, error } = await SupabaseAPI.getProject(currentProjectId);
            
            if (error) {
                console.error('Erro ao carregar projeto:', error);
                // Fallback para localStorage
                const savedData = localStorage.getItem('zendeskProjectData');
                if (savedData) {
                    projectData = JSON.parse(savedData);
                }
                return;
            }
            
            if (project) {
                projectData = {
                    id: project.id,
                    clientName: project.name,
                    clientType: project.client_type || 'base',
                    isTecnaClient: project.is_tecna_client || false,
                    hasZendeskAdmin: project.has_zendesk_admin || false
                };
                
                // Carregar produtos associados ao projeto
                await loadProjectProducts(currentProjectId);
            }
        } else {
            // Carregar dados do localStorage (projeto novo)
            const savedData = localStorage.getItem('zendeskProjectData');
            if (savedData) {
                projectData = JSON.parse(savedData);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados do projeto:', error);
        // Fallback para localStorage
        const savedData = localStorage.getItem('zendeskProjectData');
        if (savedData) {
            projectData = JSON.parse(savedData);
        }
    }
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
    if (projectData.clientName) {
        projectInfo.innerHTML = `
            <strong>Cliente:</strong> ${projectData.clientName} | 
            <strong>Tipo:</strong> ${projectData.clientType === 'base' ? 'Base' : 'New Logo'}
        `;
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
    // Usar a função do questionnaires.js
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
    
    Object.entries(consolidatedPhases).forEach(([phase, hours]) => {
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
                        <td><strong>${totalHours}</strong></td>
                    </tr>
                    <tr class="value-row">
                        <td><strong>Valor total</strong></td>
                        <td><strong>R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="project-summary">
            <h3>Resumo do Projeto</h3>
            <p><strong>Cliente:</strong> ${projectData.clientName}</p>
            <p><strong>Tipo:</strong> ${projectData.clientType === 'base' ? 'Base' : 'New Logo'}</p>
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
            const scopeData = {
                project_id: projectData.id,
                phases: consolidatedPhases,
                total_hours: totalHours,
                total_value: totalValue,
                hourly_rate: hourlyRate,
                selected_products: Array.from(selectedProducts),
                product_configurations: productConfigurations,
                client_type: projectData.clientType,
                is_tecna_client: projectData.isTecnaClient,
                has_zendesk_admin: projectData.hasZendeskAdmin
            };
            
            await SupabaseAPI.saveQuestionnaireAnswers(scopeData);
            
            // Atualizar status do projeto
            await SupabaseAPI.updateProject(projectData.id, {
                status: 'completed',
                total_hours: totalHours,
                total_value: totalValue
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