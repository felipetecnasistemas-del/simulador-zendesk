// Estado do wizard
let currentStep = 1;
let projectData = {
    type: null, // 'standard' ou 'custom'
    clientName: '',
    description: '',
    clientType: '',
    userId: '',
    selectedProducts: [],
    agentsCount: null,
    scope: []
};

// Dados de projetos padrões carregados da API
let defaultProjectsData = [];

// Produtos fixos no código
const PRODUCTS = [
    {
        id: 1,
        name: 'Zendesk Suite',
        description: 'Implantação completa da plataforma Zendesk Suite',
        icon: '🎯',
        requiresAgents: true
    }
];

// Escopo padrão baseado no número de agentes para Zendesk Suite
const STANDARD_SCOPE = {
    '1-10': [
        { item: 'Marcas', quantity: 1 },
        { item: 'Canais de entrada', quantity: 2 },
        { item: 'Instruções IA essencial', quantity: 3 },
        { item: 'Grupos', quantity: 2 },
        { item: 'Gatilhos', quantity: 5 },
        { item: 'Automações', quantity: 2 },
        { item: 'Visualizações', quantity: 1 },
        { item: 'Encaminhamento omnichannel', quantity: 'Sim' },
        { item: 'Webhooks', quantity: 0 },
        { item: 'Macros', quantity: 3 },
        { item: 'Orientação importação usuário/organ', quantity: 'Não' },
        { item: 'Formulários', quantity: 1 },
        { item: 'Campos Ticket', quantity: 3 },
        { item: 'Campos de usuário', quantity: 2 },
        { item: 'Conteúdo dinâmico', quantity: 1 },
        { item: 'Objetos personalizados', quantity: 1 },
        { item: 'SLA', quantity: 2 },
        { item: 'Horário de programação e feriado', quantity: 1 },
        { item: 'Treinamento Relatórios', quantity: 1 }
    ],
    '11-20': [
        { item: 'Marcas', quantity: 1 },
        { item: 'Canais de entrada', quantity: 4 },
        { item: 'Instruções IA essencial', quantity: 4 },
        { item: 'Grupos', quantity: 4 },
        { item: 'Gatilhos', quantity: 7 },
        { item: 'Automações', quantity: 2 },
        { item: 'Visualizações', quantity: 3 },
        { item: 'Encaminhamento omnichannel', quantity: 'Sim' },
        { item: 'Webhooks', quantity: 0 },
        { item: 'Macros', quantity: 4 },
        { item: 'Orientação importação usuário/organ', quantity: 'Sim' },
        { item: 'Formulários', quantity: 2 },
        { item: 'Campos Ticket', quantity: 5 },
        { item: 'Campos de usuário', quantity: 5 },
        { item: 'Conteúdo dinâmico', quantity: 10 },
        { item: 'Objetos personalizados', quantity: 1 },
        { item: 'SLA', quantity: 3 },
        { item: 'Horário de programação e feriado', quantity: 1 },
        { item: 'Treinamento Relatórios', quantity: 1 }
    ],
    '21-40': [
        { item: 'Marcas', quantity: 2 },
        { item: 'Canais de entrada', quantity: 5 },
        { item: 'Instruções IA essencial', quantity: 6 },
        { item: 'Grupos', quantity: 8 },
        { item: 'Gatilhos', quantity: 10 },
        { item: 'Automações', quantity: 4 },
        { item: 'Visualizações', quantity: 4 },
        { item: 'Encaminhamento omnichannel', quantity: 'Sim' },
        { item: 'Webhooks', quantity: 1 },
        { item: 'Macros', quantity: 5 },
        { item: 'Orientação importação usuário/organ', quantity: 'Sim' },
        { item: 'Formulários', quantity: 2 },
        { item: 'Campos Ticket', quantity: 6 },
        { item: 'Campos de usuário', quantity: 5 },
        { item: 'Conteúdo dinâmico', quantity: 15 },
        { item: 'Objetos personalizados', quantity: 2 },
        { item: 'SLA', quantity: 4 },
        { item: 'Horário de programação e feriado', quantity: 1 },
        { item: 'Treinamento Relatórios', quantity: 1 }
    ],
    '41-70': [
        { item: 'Marcas', quantity: 2 },
        { item: 'Canais de entrada', quantity: 6 },
        { item: 'Instruções IA essencial', quantity: 10 },
        { item: 'Grupos', quantity: 10 },
        { item: 'Gatilhos', quantity: 12 },
        { item: 'Automações', quantity: 5 },
        { item: 'Visualizações', quantity: 12 },
        { item: 'Encaminhamento omnichannel', quantity: 'Sim' },
        { item: 'Webhooks', quantity: 2 },
        { item: 'Macros', quantity: 6 },
        { item: 'Orientação importação usuário/organ', quantity: 'Sim' },
        { item: 'Formulários', quantity: 2 },
        { item: 'Campos Ticket', quantity: 6 },
        { item: 'Campos de usuário', quantity: 6 },
        { item: 'Conteúdo dinâmico', quantity: 20 },
        { item: 'Objetos personalizados', quantity: 2 },
        { item: 'SLA', quantity: 5 },
        { item: 'Horário de programação e feriado', quantity: 2 },
        { item: 'Treinamento Relatórios', quantity: 1 }
    ],
    '71-100': [
        { item: 'Marcas', quantity: 3 },
        { item: 'Canais de entrada', quantity: 10 },
        { item: 'Instruções IA essencial', quantity: 20 },
        { item: 'Grupos', quantity: 12 },
        { item: 'Gatilhos', quantity: 24 },
        { item: 'Automações', quantity: 5 },
        { item: 'Visualizações', quantity: 15 },
        { item: 'Encaminhamento omnichannel', quantity: 'Sim' },
        { item: 'Webhooks', quantity: 3 },
        { item: 'Macros', quantity: 8 },
        { item: 'Orientação importação usuário/organ', quantity: 'Sim' },
        { item: 'Formulários', quantity: 3 },
        { item: 'Campos Ticket', quantity: 8 },
        { item: 'Campos de usuário', quantity: 8 },
        { item: 'Conteúdo dinâmico', quantity: 20 },
        { item: 'Objetos personalizados', quantity: 4 },
        { item: 'SLA', quantity: 6 },
        { item: 'Horário de programação e feriado', quantity: 2 },
        { item: 'Treinamento Relatórios', quantity: 1 }
    ],
    '100+': [
        { item: 'Marcas', quantity: 5 },
        { item: 'Canais de entrada', quantity: 15 },
        { item: 'Instruções IA essencial', quantity: 20 },
        { item: 'Grupos', quantity: 15 },
        { item: 'Gatilhos', quantity: 30 },
        { item: 'Automações', quantity: 10 },
        { item: 'Visualizações', quantity: 20 },
        { item: 'Encaminhamento omnichannel', quantity: 'Sim' },
        { item: 'Webhooks', quantity: 4 },
        { item: 'Macros', quantity: 10 },
        { item: 'Orientação importação usuário/organ', quantity: 'Sim' },
        { item: 'Formulários', quantity: 4 },
        { item: 'Campos Ticket', quantity: 10 },
        { item: 'Campos de usuário', quantity: 10 },
        { item: 'Conteúdo dinâmico', quantity: 20 },
        { item: 'Objetos personalizados', quantity: 4 },
        { item: 'SLA', quantity: 6 },
        { item: 'Horário de programação e feriado', quantity: 2 },
        { item: 'Treinamento Relatórios', quantity: 1 }
    ]
};

// Função para carregar dados de projetos padrões da API
async function loadDefaultProjectsData() {
    try {
        const response = await fetch('/api/default-projects');
        const result = await response.json();
        
        if (result.success && result.data) {
            defaultProjectsData = result.data;
            console.log('Dados de projetos padrões carregados:', defaultProjectsData.length, 'itens');
        } else {
            console.error('Erro ao carregar dados de projetos padrões:', result.message);
        }
    } catch (error) {
        console.error('Erro ao carregar dados de projetos padrões:', error);
    }
}

// Função para obter escopo baseado nos dados da API
function getDynamicScope(agentsCount) {
    if (!defaultProjectsData || defaultProjectsData.length === 0) {
        console.warn('Dados de projetos padrões não carregados, usando escopo fixo');
        return null;
    }
    
    const rangeIndex = getScopeRangeIndex(agentsCount);
    
    return defaultProjectsData.map(item => ({
        item: item.name,
        quantity: item.values[rangeIndex]
    }));
}

// Função para determinar o índice do range baseado no número de agentes
function getScopeRangeIndex(agentsCount) {
    if (agentsCount <= 10) return 0;      // 1-10
    if (agentsCount <= 20) return 1;      // 11-20
    if (agentsCount <= 40) return 2;      // 21-40
    if (agentsCount <= 70) return 3;      // 41-70
    if (agentsCount <= 100) return 4;     // 71-100
    return 5;                             // 100+
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    loadDefaultProjectsData();
    updateStepIndicators();
    updateNavigationButtons();
});

// Seleção do tipo de projeto
function selectProjectType(type) {
    projectData.type = type;
    
    // Remove seleção anterior
    document.querySelectorAll('.type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Adiciona seleção atual
    document.getElementById(`type-${type}`).classList.add('selected');
    
    // Mostra/esconde alerta para proposta customizada
    const customAlert = document.getElementById('custom-alert');
    if (type === 'custom') {
        customAlert.style.display = 'block';
    } else {
        customAlert.style.display = 'none';
    }
    
    updateNavigationButtons();
}

// Carrega usuários do sistema
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const result = await response.json();
        
        const userSelect = document.getElementById('project-user');
        userSelect.innerHTML = '<option value="">Selecione um usuário</option>';
        
        // Verificar se a resposta tem o formato esperado
        const users = result.data || result;
        
        if (Array.isArray(users)) {
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                userSelect.appendChild(option);
            });
        } else {
            console.error('Formato de resposta inválido:', result);
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

// Carrega produtos na etapa 3
function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';
    
    PRODUCTS.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.id = `product-${product.id}`;
        productCard.onclick = () => toggleProduct(product.id);
        
        productCard.innerHTML = `
            <div class="product-icon">${product.icon}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Alterna seleção de produto
function toggleProduct(productId) {
    const productCard = document.getElementById(`product-${productId}`);
    const index = projectData.selectedProducts.indexOf(productId);
    
    if (index > -1) {
        // Remove produto
        projectData.selectedProducts.splice(index, 1);
        productCard.classList.remove('selected');
    } else {
        // Adiciona produto
        projectData.selectedProducts.push(productId);
        productCard.classList.add('selected');
    }
    
    updateNavigationButtons();
}

// Carrega configuração baseada nos produtos selecionados
function loadConfiguration() {
    const configContent = document.getElementById('configuration-content');
    configContent.innerHTML = '';
    
    const selectedProducts = PRODUCTS.filter(p => projectData.selectedProducts.includes(p.id));
    
    selectedProducts.forEach(product => {
        if (product.requiresAgents && product.name === 'Zendesk Suite') {
            // Seção para número de agentes
            const agentsSection = document.createElement('div');
            agentsSection.className = 'agents-input-section';
            agentsSection.innerHTML = `
                <h3>Configuração do ${product.name}</h3>
                <p>Informe o número de agentes que utilizarão o sistema:</p>
                <input type="number" class="agents-input" id="agents-count" 
                       placeholder="Ex: 25" min="1" max="1000" 
                       onchange="updateAgentsCount(this.value)">
                <div id="scope-preview" class="scope-preview" style="display: none;">
                    <h4>Escopo Padrão Previsto:</h4>
                    <table class="scope-table" id="scope-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantidade</th>
                            </tr>
                        </thead>
                        <tbody id="scope-table-body">
                        </tbody>
                    </table>
                </div>
            `;
            configContent.appendChild(agentsSection);
        } else {
            // Outros produtos (sem escopo ainda)
            const productSection = document.createElement('div');
            productSection.className = 'agents-input-section';
            productSection.innerHTML = `
                <h3>Configuração do ${product.name}</h3>
                <div class="alert alert-info">
                    <strong>Em desenvolvimento:</strong> A configuração de escopo para este produto será implementada em breve.
                </div>
            `;
            configContent.appendChild(productSection);
        }
    });
    
    if (selectedProducts.length === 0) {
        configContent.innerHTML = `
            <div class="alert alert-warning">
                <strong>Nenhum produto selecionado:</strong> Volte à etapa anterior e selecione pelo menos um produto.
            </div>
        `;
    }
}

// Atualiza número de agentes e escopo
function updateAgentsCount(count) {
    projectData.agentsCount = parseInt(count);
    
    if (count && count > 0) {
        // Tenta usar dados dinâmicos da API primeiro
        let scope = getDynamicScope(count);
        
        // Se não conseguir dados da API, usa escopo fixo como fallback
        if (!scope) {
            const scopeRange = getScopeRange(count);
            scope = STANDARD_SCOPE[scopeRange];
        }
        
        if (scope) {
            projectData.scope = scope;
            displayScopePreview(scope);
        }
    } else {
        document.getElementById('scope-preview').style.display = 'none';
        projectData.scope = [];
    }
    
    updateNavigationButtons();
}

// Determina o range de escopo baseado no número de agentes
function getScopeRange(agentsCount) {
    if (agentsCount <= 10) return '1-10';
    if (agentsCount <= 20) return '11-20';
    if (agentsCount <= 40) return '21-40';
    if (agentsCount <= 70) return '41-70';
    if (agentsCount <= 100) return '71-100';
    return '100+';
}

// Exibe preview do escopo
function displayScopePreview(scope) {
    const scopePreview = document.getElementById('scope-preview');
    const tableBody = document.getElementById('scope-table-body');
    
    tableBody.innerHTML = '';
    
    scope.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.item}</td>
            <td>${item.quantity}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Calcular e exibir totais
    calculateAndDisplayTotals(scope);
    
    scopePreview.style.display = 'block';
}

// Função para calcular e exibir totais de horas e valor
async function calculateAndDisplayTotals(scope) {
    try {
        // Buscar dados detalhados dos itens de escopo da API
        const response = await fetch('/api/scope-items');
        const result = await response.json();
        
        let totalHours = 0;
        let totalMinutes = 0;
        
        if (result.success && result.data) {
            const scopeItemsData = result.data;
            
            // Calcular total de horas baseado nos itens selecionados
            scope.forEach(scopeItem => {
                const itemData = scopeItemsData.find(item => item.name === scopeItem.item);
                if (itemData) {
                    const quantity = parseInt(scopeItem.quantity) || 0;
                    const itemHours = (itemData.hours || 0) * quantity;
                    const itemMinutes = (itemData.minutes || 0) * quantity;
                    
                    totalHours += itemHours;
                    totalMinutes += itemMinutes;
                }
            });
        } else {
            // Fallback: usar estimativa baseada no número de agentes
            const agentsCount = projectData.agentsCount || 10;
            const rangeIndex = getScopeRangeIndex(agentsCount);
            const estimatedHours = [8, 16, 32, 56, 80, 120][rangeIndex] || 32;
            totalHours = estimatedHours;
        }
        
        // Converter minutos extras para horas
        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;
        
        // Calcular valor total (R$ 280 por hora)
        const hourlyRate = 280;
        const totalValue = (totalHours + (totalMinutes / 60)) * hourlyRate;
        
        // Armazenar no projectData para uso posterior
        projectData.totalScopeHours = totalHours + (totalMinutes / 60);
        
        // Exibir os totais
        displayProjectTotals(totalHours, totalMinutes, totalValue);
        
    } catch (error) {
        console.error('Erro ao calcular totais:', error);
        // Fallback em caso de erro
        const agentsCount = projectData.agentsCount || 10;
        const rangeIndex = getScopeRangeIndex(agentsCount);
        const estimatedHours = [8, 16, 32, 56, 80, 120][rangeIndex] || 32;
        const totalValue = estimatedHours * 280;
        
        projectData.totalScopeHours = estimatedHours;
        displayProjectTotals(estimatedHours, 0, totalValue);
    }
}

// Função para exibir os totais calculados
function displayProjectTotals(hours, minutes, totalValue) {
    // Criar ou atualizar seção de totais
    let totalsSection = document.getElementById('project-totals');
    
    if (!totalsSection) {
        totalsSection = document.createElement('div');
        totalsSection.id = 'project-totals';
        totalsSection.className = 'project-totals';
        
        const scopePreview = document.getElementById('scope-preview');
        scopePreview.appendChild(totalsSection);
    }
    
    const timeText = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(totalValue);
    
    totalsSection.innerHTML = `
        <div class="totals-summary">
            <div class="total-item">
                <span class="total-label">Tempo Total Estimado:</span>
                <span class="total-value">${timeText}</span>
            </div>
            <div class="total-item">
                <span class="total-label">Valor Total Estimado:</span>
                <span class="total-value total-price">${formattedValue}</span>
            </div>
        </div>
    `;
}

// Navegação entre etapas
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 4) {
            currentStep++;
            showStep(currentStep);
            
            // Carrega conteúdo específico da etapa
            if (currentStep === 3) {
                loadProducts();
            } else if (currentStep === 4) {
                loadConfiguration();
            }
        } else {
            // Última etapa - criar projeto
            createProject();
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function showStep(step) {
    // Esconde todas as etapas
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Mostra etapa atual
    document.getElementById(`step-${step}`).classList.add('active');
    
    updateStepIndicators();
    updateNavigationButtons();
}

// Atualiza indicadores visuais das etapas
function updateStepIndicators() {
    for (let i = 1; i <= 4; i++) {
        const indicator = document.getElementById(`step-indicator-${i}`);
        indicator.classList.remove('active', 'completed');
        
        if (i < currentStep) {
            indicator.classList.add('completed');
        } else if (i === currentStep) {
            indicator.classList.add('active');
        }
    }
}

// Atualiza botões de navegação
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Botão anterior
    if (currentStep > 1) {
        prevBtn.style.display = 'block';
    } else {
        prevBtn.style.display = 'none';
    }
    
    // Botão próximo
    const isValid = validateCurrentStep();
    nextBtn.disabled = !isValid;
    
    if (currentStep === 4) {
        nextBtn.textContent = 'Criar Projeto';
    } else {
        nextBtn.textContent = 'Próximo →';
    }
}

// Valida etapa atual
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return projectData.type !== null;
        case 2:
            const clientName = document.getElementById('client-name').value.trim();
            const clientType = document.getElementById('client-type').value;
            const userId = document.getElementById('project-user').value;
            return clientName && clientType && userId;
        case 3:
            return projectData.selectedProducts.length > 0;
        case 4:
            // Se Zendesk Suite está selecionado, precisa ter número de agentes
            const hasZendeskSuite = projectData.selectedProducts.includes(1);
            if (hasZendeskSuite) {
                return projectData.agentsCount && projectData.agentsCount > 0;
            }
            return true;
        default:
            return false;
    }
}

// Coleta dados do formulário
function collectFormData() {
    projectData.clientName = document.getElementById('client-name').value.trim();
    projectData.description = document.getElementById('project-description').value.trim();
    projectData.clientType = document.getElementById('client-type').value;
    projectData.userId = document.getElementById('project-user').value;
}

// Cria o projeto
async function createProject() {
    try {
        collectFormData();
        
        const projectPayload = {
            client_name: projectData.clientName,
            description: projectData.description || null,
            client_type: projectData.clientType,
            user_id: parseInt(projectData.userId),
            project_type: projectData.type,
            selected_products: projectData.selectedProducts,
            agents_count: projectData.agentsCount || null,
            scope: projectData.scope,
            total_scope_hours: projectData.totalScopeHours || 0,
            complexity_level: projectData.complexityLevel || null,
            project_metadata: projectData.metadata || {},
            status: 'active'
        };
        
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectPayload)
        });
        
        if (response.ok) {
            const result = await response.json();
            alert('Projeto criado com sucesso!');
            
            // Redireciona baseado no tipo de projeto
            if (projectData.type === 'custom') {
                window.location.href = `advanced-questions.html?project_id=${result.id}`;
            } else {
                window.location.href = 'index.html';
            }
        } else {
            const error = await response.json();
            alert('Erro ao criar projeto: ' + (error.message || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro ao criar projeto:', error);
        alert('Erro ao criar projeto. Tente novamente.');
    }
}

// Event listeners para formulário
document.addEventListener('DOMContentLoaded', function() {
    // Monitora mudanças nos campos do formulário
    const formFields = ['client-name', 'client-type', 'project-user'];
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', updateNavigationButtons);
            field.addEventListener('input', updateNavigationButtons);
        }
    });
});