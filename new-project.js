// Estado do wizard
let currentStep = 1;
const totalSteps = 4;

let projectData = {
    type: null, // 'standard' ou 'custom'
    clientName: '',
    description: '',
    clientType: '',
    userId: '',
    selectedProducts: [],
    agentsCount: null,
    scope: [],
    totalScopeHours: 0,
    selectedScopeItems: [],
    extraItems: [], // Itens extras adicionados pelo usuário
    complexityLevel: null,
    metadata: {}
};

// Cache para itens de escopo disponíveis
let availableScopeItems = [];
let modalSelectedItems = {};

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

// Carrega itens de escopo disponíveis da API
async function loadAvailableScopeItems() {
    try {
        const response = await fetch('/api/scope-items');
        const result = await response.json();
        
        if (result.success && result.data) {
            availableScopeItems = result.data.filter(item => item.is_active);
            console.log('Itens de escopo disponíveis carregados:', availableScopeItems);
        } else {
            console.warn('Não foi possível carregar itens de escopo da API');
        }
    } catch (error) {
        console.error('Erro ao carregar itens de escopo:', error);
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
    loadAvailableScopeItems();
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
    
    // Adicionar seção de itens extras se não existir
    if (!document.getElementById('extra-items-section')) {
        addExtraItemsSection();
    }
    
    // Calcular e exibir totais
    calculateAndDisplayTotals(scope);
    
    scopePreview.style.display = 'block';
}

// Adiciona seção de itens extras
function addExtraItemsSection() {
    const scopePreview = document.getElementById('scope-preview');
    
    const extraItemsSection = document.createElement('div');
    extraItemsSection.id = 'extra-items-section';
    extraItemsSection.className = 'extra-items-section';
    extraItemsSection.innerHTML = `
        <div class="extra-items-header">
            <h4>Itens Extras (Opcionais)</h4>
            <button class="add-item-btn" onclick="openExtraItemsModal()">+ Adicionar Itens</button>
        </div>
        <div class="extra-items-list" id="extra-items-list">
            <div style="padding: 20px; text-align: center; color: #666; font-style: italic;">
                Nenhum item extra adicionado. Use o botão "Adicionar Itens" para incluir itens adicionais ao escopo.
            </div>
        </div>
    `;
    
    scopePreview.appendChild(extraItemsSection);
}

// Funções do Modal de Itens Extras
function openExtraItemsModal() {
    const modal = document.getElementById('extraItemsModal');
    modal.classList.add('show');
    loadModalItems();
    updateModalSummary();
}

function closeExtraItemsModal() {
    const modal = document.getElementById('extraItemsModal');
    modal.classList.remove('show');
    modalSelectedItems = {};
}

function loadModalItems() {
    const grid = document.getElementById('modalItemsGrid');
    

    
    if (!availableScopeItems || availableScopeItems.length === 0) {
        console.log('Nenhum item disponível');
        grid.innerHTML = '<div class="text-center text-muted">Nenhum item disponível</div>';
        return;
    }
    
    // Filtrar apenas itens ativos e que não foram já adicionados como extras
    const extraItemIds = projectData.extraItems.map(item => item.id);
    
    const availableItems = availableScopeItems.filter(item => {
        return item.is_active && !extraItemIds.includes(item.id);
    });
    
    if (availableItems.length === 0) {
        grid.innerHTML = '<div class="text-center text-muted">Nenhum item disponível</div>';
        return;
    }
    
    grid.innerHTML = availableItems.map(item => {
        const timeText = item.hours > 0 || item.minutes > 0 
            ? `${item.hours}h ${item.minutes}min` 
            : 'Tempo variável';
            
        return `
            <div class="modal-item" data-item-id="${item.id}">
                <div class="modal-item-header">
                    <div class="modal-item-name">${item.name}</div>
                    <div class="modal-item-time">${timeText}</div>
                </div>
                <div class="modal-item-controls">
                    <div class="modal-quantity-control">
                        <button class="modal-quantity-btn" onclick="changeModalQuantity(${item.id}, -1)">-</button>
                        <input type="number" class="modal-quantity-input" id="qty-${item.id}" value="0" min="0" max="99" onchange="updateModalQuantity(${item.id}, this.value)">
                        <button class="modal-quantity-btn" onclick="changeModalQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function changeModalQuantity(itemId, change) {
    const input = document.getElementById(`qty-${itemId}`);
    const currentValue = parseInt(input.value) || 0;
    const newValue = Math.max(0, Math.min(99, currentValue + change));
    
    input.value = newValue;
    updateModalQuantity(itemId, newValue);
}

function updateModalQuantity(itemId, quantity) {
    const qty = parseInt(quantity) || 0;
    
    if (qty > 0) {
        modalSelectedItems[itemId] = qty;
    } else {
        delete modalSelectedItems[itemId];
    }
    
    updateModalSummary();
}

function updateModalSummary() {
    const totalItems = Object.values(modalSelectedItems).reduce((sum, qty) => sum + qty, 0);
    const summary = document.getElementById('modalSummary');
    summary.textContent = `${totalItems} ${totalItems === 1 ? 'item selecionado' : 'itens selecionados'}`;
}

function confirmExtraItems() {
    // Adicionar itens selecionados aos itens extras
    Object.entries(modalSelectedItems).forEach(([itemId, quantity]) => {
        const item = availableScopeItems.find(i => i.id == itemId);
        if (item) {
            addExtraItemWithQuantity(item, quantity);
        }
    });
    
    closeExtraItemsModal();
    updateExtraItemsList();
    calculateAndDisplayTotals(projectData.scope);
}

function addExtraItemWithQuantity(item, quantity) {
    // Verificar se o item já existe nos itens extras
    const existingIndex = projectData.extraItems.findIndex(extra => extra.id === item.id);
    
    if (existingIndex >= 0) {
        // Se já existe, somar a quantidade
        projectData.extraItems[existingIndex].quantity += quantity;
    } else {
        // Se não existe, adicionar novo
        const agentsCount = projectData.agentsCount || 10;
        let minQuantity = 1;
        
        // Para itens com response_type 'numeric', usar o valor baseado no número de agentes
        if (item.response_type === 'numeric') {
            if (agentsCount <= 10) minQuantity = parseInt(item.agents_10) || 1;
            else if (agentsCount <= 20) minQuantity = parseInt(item.agents_20) || 1;
            else if (agentsCount <= 40) minQuantity = parseInt(item.agents_40) || 1;
            else if (agentsCount <= 70) minQuantity = parseInt(item.agents_70) || 1;
            else if (agentsCount <= 100) minQuantity = parseInt(item.agents_100) || 1;
            else minQuantity = parseInt(item.agents_more) || 1;
        }
        
        projectData.extraItems.push({
            id: item.id,
            name: item.name,
            description: item.description,
            hours: item.hours || 0,
            minutes: item.minutes || 0,
            response_type: item.response_type,
            quantity: quantity,
            minQuantity: minQuantity
        });
    }
}

// Adiciona item extra
function addExtraItem(item) {
    // Verificar se o item já foi adicionado
    if (projectData.extraItems.find(extraItem => extraItem.id === item.id)) {
        return;
    }
    
    // Determinar quantidade mínima baseada no número de agentes
    const agentsCount = projectData.agentsCount || 10;
    let minQuantity = 1;
    
    // Para itens com response_type 'numeric', usar o valor baseado no número de agentes
    if (item.response_type === 'numeric') {
        if (agentsCount <= 10) minQuantity = parseInt(item.agents_10) || 1;
        else if (agentsCount <= 20) minQuantity = parseInt(item.agents_20) || 1;
        else if (agentsCount <= 40) minQuantity = parseInt(item.agents_40) || 1;
        else if (agentsCount <= 70) minQuantity = parseInt(item.agents_70) || 1;
        else if (agentsCount <= 100) minQuantity = parseInt(item.agents_100) || 1;
        else minQuantity = parseInt(item.agents_more) || 1;
    }
    
    const extraItem = {
        id: item.id,
        name: item.name,
        description: item.description,
        hours: item.hours || 0,
        minutes: item.minutes || 0,
        response_type: item.response_type,
        quantity: minQuantity,
        minQuantity: minQuantity
    };
    
    projectData.extraItems.push(extraItem);
    
    // Fechar dropdown
    document.getElementById('available-items-dropdown').classList.remove('show');
    
    // Atualizar interface
    updateExtraItemsList();
    loadAvailableItemsDropdown();
    
    // Recalcular totais
    calculateAndDisplayTotals(projectData.scope);
}

// Atualiza lista de itens extras
function updateExtraItemsList() {
    const extraItemsList = document.getElementById('extra-items-list');
    
    if (projectData.extraItems.length === 0) {
        extraItemsList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666; font-style: italic;">
                Nenhum item extra adicionado. Use o botão "Adicionar Itens" para incluir itens adicionais ao escopo.
            </div>
        `;
        return;
    }
    
    extraItemsList.innerHTML = '';
    
    projectData.extraItems.forEach((item, index) => {
        const extraItemDiv = document.createElement('div');
        extraItemDiv.className = 'extra-item';
        
        const timeText = item.hours > 0 || item.minutes > 0 
            ? `${item.hours}h ${item.minutes}min por unidade` 
            : 'Tempo variável';
            
        extraItemDiv.innerHTML = `
            <div class="extra-item-info">
                <div class="extra-item-name">${item.name}</div>
                <div class="extra-item-time">${timeText}</div>
            </div>
            <div class="extra-item-controls">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="changeExtraItemQuantity(${index}, -1)" 
                            ${item.quantity <= item.minQuantity ? 'disabled' : ''}>
                        −
                    </button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           min="${item.minQuantity}" 
                           onchange="setExtraItemQuantity(${index}, this.value)">
                    <button class="quantity-btn" onclick="changeExtraItemQuantity(${index}, 1)">+</button>
                </div>
                <button class="quantity-btn" onclick="removeExtraItem(${index})" 
                        style="background: #dc3545; color: white; border-color: #dc3545;"
                        title="Remover item">
                    ×
                </button>
            </div>
        `;
        
        extraItemsList.appendChild(extraItemDiv);
    });
}

// Altera quantidade de item extra
function changeExtraItemQuantity(index, change) {
    const item = projectData.extraItems[index];
    const newQuantity = item.quantity + change;
    
    if (newQuantity >= item.minQuantity) {
        item.quantity = newQuantity;
        updateExtraItemsList();
        calculateAndDisplayTotals(projectData.scope);
    }
}

// Define quantidade específica de item extra
function setExtraItemQuantity(index, value) {
    const item = projectData.extraItems[index];
    const quantity = parseInt(value) || item.minQuantity;
    
    if (quantity >= item.minQuantity) {
        item.quantity = quantity;
        updateExtraItemsList();
        calculateAndDisplayTotals(projectData.scope);
    }
}

// Remove item extra
function removeExtraItem(index) {
    projectData.extraItems.splice(index, 1);
    updateExtraItemsList();
    loadAvailableItemsDropdown();
    calculateAndDisplayTotals(projectData.scope);
}

// Função para obter horas padrões baseado no número de usuários
function getStandardProjectHours(userCount) {
    if (userCount <= 10) return 32;      // Até 10 usuários: 32h
    if (userCount <= 20) return 76;      // 11-20 usuários: 76h
    if (userCount <= 40) return 96;      // 21-40 usuários: 96h
    if (userCount <= 70) return 126;     // 41-70 usuários: 126h
    if (userCount <= 100) return 156;    // 71-100 usuários: 156h
    return 186;                          // Mais de 100 usuários: 186h
}

// Função para calcular e exibir totais de horas e valor
async function calculateAndDisplayTotals(scope) {
    try {
        console.log('🚀 Iniciando calculateAndDisplayTotals');
        console.log('📊 projectData.extraItems no início:', projectData.extraItems);
        console.log('📊 projectData.type:', projectData.type);
        
        let totalHours = 0;
        let totalMinutes = 0;
        let selectedScopeItems = [];
        const itemCounts = {};
        
        // Para projetos padrões, usar horas fixas baseadas no número de usuários
        if (projectData.type === 'standard') {
            const userCount = projectData.agentsCount || 10;
            totalHours = getStandardProjectHours(userCount);
            
            // Ainda coletar os itens de escopo para referência, mas não somar as horas
            const response = await fetch('/api/scope-items');
            const result = await response.json();
            
            if (result.success && result.data) {
                const scopeItemsData = result.data;
                
                scope.forEach(scopeItem => {
                    const itemData = scopeItemsData.find(item => item.name === scopeItem.item);
                    if (itemData) {
                        const quantity = parseInt(scopeItem.quantity) || 0;
                        
                        // Contar itens por nome
                        if (itemCounts[scopeItem.item]) {
                            itemCounts[scopeItem.item] += quantity;
                        } else {
                            itemCounts[scopeItem.item] = quantity;
                        }
                        
                        // Coletar dados do item para salvar na tabela de relacionamento
                        selectedScopeItems.push({
                            scope_item_id: itemData.id,
                            quantity: quantity,
                            custom_hours: null,
                            custom_minutes: null
                        });
                    }
                });
            }
        } else {
            // Para projetos customizados, calcular baseado nos itens selecionados
            const response = await fetch('/api/scope-items');
            const result = await response.json();
            
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
                        
                        // Contar itens por nome
                        if (itemCounts[scopeItem.item]) {
                            itemCounts[scopeItem.item] += quantity;
                        } else {
                            itemCounts[scopeItem.item] = quantity;
                        }
                        
                        // Coletar dados do item para salvar na tabela de relacionamento
                        selectedScopeItems.push({
                            scope_item_id: itemData.id,
                            quantity: quantity,
                            custom_hours: null,
                            custom_minutes: null
                        });
                    }
                });
            } else {
                // Fallback: usar estimativa baseada no número de agentes
                const agentsCount = projectData.agentsCount || 10;
                const rangeIndex = getScopeRangeIndex(agentsCount);
                const estimatedHours = [8, 16, 32, 56, 80, 120][rangeIndex] || 32;
                totalHours = estimatedHours;
            }
        }
        
        // Calcular horas dos itens extras e somar às quantidades existentes
        let extraHours = 0;
        let extraMinutes = 0;
        
        console.log('🔍 Frontend - Calculando horas extras');
        console.log('📋 Itens extras:', projectData.extraItems);
        console.log('⏰ Horas padrão antes dos extras:', totalHours);
        
        projectData.extraItems.forEach(extraItem => {
            const itemTotalHours = (extraItem.hours || 0) * extraItem.quantity;
            const itemTotalMinutes = (extraItem.minutes || 0) * extraItem.quantity;
            
            console.log(`📦 Item extra: ${extraItem.name}, horas=${extraItem.hours}, minutos=${extraItem.minutes}, quantidade=${extraItem.quantity}`);
            console.log(`➕ Horas do item: ${itemTotalHours}, Minutos do item: ${itemTotalMinutes}`);
            
            extraHours += itemTotalHours;
            extraMinutes += itemTotalMinutes;
            
            // Somar às quantidades existentes dos itens do escopo padrão
            if (itemCounts[extraItem.name]) {
                itemCounts[extraItem.name] += extraItem.quantity;
            } else {
                itemCounts[extraItem.name] = extraItem.quantity;
            }
        });
        
        console.log('🧮 Total horas extras:', extraHours);
        console.log('🧮 Total minutos extras:', extraMinutes);
        
        // Converter minutos extras para horas
        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;
        
        extraHours += Math.floor(extraMinutes / 60);
        extraMinutes = extraMinutes % 60;
        
        // Somar horas padrão + horas extras
        const finalTotalHours = totalHours + extraHours;
        const finalTotalMinutes = totalMinutes + extraMinutes;
        
        console.log('🔢 Cálculo final:');
        console.log(`   Horas padrão: ${totalHours}`);
        console.log(`   Horas extras: ${extraHours}`);
        console.log(`   Total final: ${finalTotalHours}`);
        console.log(`   Minutos finais: ${finalTotalMinutes}`);
        
        // Calcular valor total (R$ 280 por hora)
        const hourlyRate = 280;
        const totalValue = (finalTotalHours + (finalTotalMinutes / 60)) * hourlyRate;
        
        // Armazenar no projectData para uso posterior (sempre arredondando para cima)
        const totalHoursWithMinutes = finalTotalHours + (finalTotalMinutes / 60);
        projectData.totalScopeHours = Math.ceil(totalHoursWithMinutes);
        console.log('💾 Horas calculadas (com minutos):', totalHoursWithMinutes);
        console.log('💾 Valor final arredondado para cima:', projectData.totalScopeHours);
        projectData.selectedScopeItems = selectedScopeItems;
        projectData.itemCounts = itemCounts;
        
        // Exibir os totais
        displayProjectTotals(finalTotalHours, finalTotalMinutes, totalValue, totalHours, extraHours);
        
    } catch (error) {
        console.error('Erro ao calcular totais:', error);
        // Fallback em caso de erro
        let estimatedHours;
        
        if (projectData.type === 'standard') {
            // Para projetos padrões, usar horas fixas baseadas no número de usuários
            const userCount = projectData.agentsCount || 10;
            estimatedHours = getStandardProjectHours(userCount);
        } else {
            // Para projetos customizados, usar estimativa antiga
            const agentsCount = projectData.agentsCount || 10;
            const rangeIndex = getScopeRangeIndex(agentsCount);
            estimatedHours = [8, 16, 32, 56, 80, 120][rangeIndex] || 32;
        }
        
        // Calcular horas dos itens extras mesmo no fallback
            let extraHours = 0;
            let extraMinutes = 0;
            
            projectData.extraItems.forEach(extraItem => {
                const itemTotalHours = (extraItem.hours || 0) * extraItem.quantity;
                const itemTotalMinutes = (extraItem.minutes || 0) * extraItem.quantity;
                
                extraHours += itemTotalHours;
                extraMinutes += itemTotalMinutes;
            });
            
            extraHours += Math.floor(extraMinutes / 60);
            extraMinutes = extraMinutes % 60;
            
            const finalTotalHours = estimatedHours + extraHours;
            const totalValue = (finalTotalHours + (extraMinutes / 60)) * 280;
            
            // Arredondar para cima também no fallback
            const totalHoursWithMinutes = finalTotalHours + (extraMinutes / 60);
            projectData.totalScopeHours = Math.ceil(totalHoursWithMinutes);
            console.log('💾 FALLBACK - Horas calculadas (com minutos):', totalHoursWithMinutes);
            console.log('💾 FALLBACK - Valor final arredondado para cima:', projectData.totalScopeHours);
             displayProjectTotals(finalTotalHours, extraMinutes, totalValue, estimatedHours, extraHours);
    }
}

// Função para exibir os totais calculados
function displayProjectTotals(hours, minutes, totalValue, standardHours = null, extraHours = null) {
    // Criar ou atualizar seção de totais
    let totalsSection = document.getElementById('project-totals');
    
    if (!totalsSection) {
        totalsSection = document.createElement('div');
        totalsSection.id = 'project-totals';
        totalsSection.className = 'project-totals';
        
        const scopePreview = document.getElementById('scope-preview');
        scopePreview.appendChild(totalsSection);
    }
    
    // Arredondar horas para cima (incluindo minutos)
    const totalHoursWithMinutes = hours + (minutes / 60);
    const roundedHours = Math.ceil(totalHoursWithMinutes);
    
    // Calcular valor baseado nas horas arredondadas
    const hourlyRate = 280;
    const roundedTotalValue = roundedHours * hourlyRate;
    
    const timeText = `${roundedHours}h`;
    const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(roundedTotalValue);
    
    console.log('🖥️ Exibindo no frontend - Horas originais:', hours + (minutes/60));
    console.log('🖥️ Exibindo no frontend - Horas arredondadas:', roundedHours);
    
    let detailsHtml = '';
    if (standardHours !== null && extraHours !== null && extraHours > 0) {
        detailsHtml = `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 0.9rem; opacity: 0.9;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Horas do escopo padrão:</span>
                    <span>${standardHours}h</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Horas dos itens extras:</span>
                    <span>+${extraHours}h</span>
                </div>
            </div>
        `;
    }
    
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
        ${detailsHtml}
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
        
        // Recalcular totais antes de criar o projeto
        calculateAndDisplayTotals(projectData.scope);
        
        console.log('🔥 APÓS calculateAndDisplayTotals - projectData.totalScopeHours:', projectData.totalScopeHours);
        console.log('🔥 VERIFICAÇÃO - projectData.extraItems:', projectData.extraItems);
        
        // Combinar itens do escopo padrão com itens extras
        let finalScopeItems = [...(projectData.selectedScopeItems || [])];
        
        // Processar itens extras se existirem
        if (projectData.extraItems && projectData.extraItems.length > 0) {
            for (const extraItem of projectData.extraItems) {
                // Verificar se o item já existe no escopo padrão
                const existingItemIndex = finalScopeItems.findIndex(item => 
                    item.scope_item_id === extraItem.id
                );
                
                if (existingItemIndex !== -1) {
                    // Se já existe, somar a quantidade
                    finalScopeItems[existingItemIndex].quantity = 
                        (finalScopeItems[existingItemIndex].quantity || 1) + (extraItem.quantity || 1);
                } else {
                    // Se não existe, adicionar como novo item
                    finalScopeItems.push({
                        scope_item_id: extraItem.id,
                        quantity: extraItem.quantity || 1,
                        custom_hours: null,
                        custom_minutes: null
                    });
                }
            }
        }
        
        const projectPayload = {
            name: projectData.clientName,
            description: projectData.description || null,
            client_type: projectData.clientType,
            user_id: parseInt(projectData.userId),
            project_type: projectData.type,
            selected_products: projectData.selectedProducts,
            agents_count: projectData.agentsCount || null,
            total_scope_hours: projectData.totalScopeHours || 0,
            complexity_level: projectData.complexityLevel || null,
            project_metadata: projectData.metadata || {},
            selected_scope_items: finalScopeItems,
            status: 'active'
        };
        
        console.log('📤 PAYLOAD ENVIADO PARA API:');
        console.log('   total_scope_hours:', projectPayload.total_scope_hours);
        console.log('   projectData.totalScopeHours:', projectData.totalScopeHours);
        
        console.log('🌐 FAZENDO REQUISIÇÃO PARA API:');
        console.log('   📍 URL:', '/api/projects');
        console.log('   📦 Payload completo:', JSON.stringify(projectPayload, null, 2));
        
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectPayload)
        });
        
        console.log('📡 RESPOSTA DA API:');
        console.log('   ✅ Status:', response.status);
        console.log('   ✅ Status Text:', response.statusText);
        
        if (response.ok) {
            const result = await response.json();
            console.log('🎉 PROJETO CRIADO COM SUCESSO!');
            console.log('   🆔 ID do projeto:', result.id);
            console.log('   📋 Resultado completo:', result);
            
            alert('Projeto criado com sucesso!');
            
            // Redireciona baseado no tipo de projeto
            if (projectData.type === 'custom') {
                window.location.href = `advanced-questions.html?project_id=${result.id}`;
            } else {
                window.location.href = 'index.html';
            }
        } else {
            const error = await response.json();
            console.log('❌ ERRO NA CRIAÇÃO:');
            console.log('   📋 Erro completo:', error);
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