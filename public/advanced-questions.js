// Variáveis globais
let products = [];
let scopeItems = [];
let currentQuestion = null;
let optionCounter = 0;
let ruleCounter = 0;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadScopeItems();
    setupFormHandlers();
});

// Configurar handlers do formulário
function setupFormHandlers() {
    const form = document.getElementById('advanced-question-form');
    form.addEventListener('submit', handleFormSubmit);
}

// Carregar produtos
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        products = data;
        
        const productSelect = document.getElementById('product-select');
        productSelect.innerHTML = '<option value="">Selecione um produto</option>';
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showAlert('Erro ao carregar produtos', 'error');
    }
}

// Carregar itens de escopo
async function loadScopeItems() {
    try {
        const response = await fetch('/api/scope-items');
        const data = await response.json();
        scopeItems = data;
        
        renderScopeItems();
    } catch (error) {
        console.error('Erro ao carregar itens de escopo:', error);
        showAlert('Erro ao carregar itens de escopo', 'error');
    }
}

// Renderizar itens de escopo
function renderScopeItems() {
    const container = document.getElementById('scope-items-grid');
    container.innerHTML = '';
    
    // Agrupar por categoria
    const categories = {};
    scopeItems.forEach(item => {
        const categoryName = item.scope_categories?.name || 'Sem Categoria';
        if (!categories[categoryName]) {
            categories[categoryName] = [];
        }
        categories[categoryName].push(item);
    });
    
    // Renderizar por categoria
    Object.keys(categories).forEach(categoryName => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'scope-category';
        categoryDiv.innerHTML = `
            <h4 style="margin: 0 0 15px 0; color: #667eea; font-size: 1.1rem;">${categoryName}</h4>
        `;
        
        categories[categoryName].forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'scope-item-card';
            itemCard.innerHTML = `
                <div class="scope-item-header">
                    <input type="checkbox" id="scope-item-${item.id}" onchange="toggleScopeItem(${item.id})">
                    <label for="scope-item-${item.id}" style="margin: 0; font-weight: 600;">${item.name}</label>
                </div>
                <p style="margin: 5px 0; color: #718096; font-size: 0.9rem;">${item.description || ''}</p>
                <div style="display: flex; gap: 15px; font-size: 0.85rem; color: #4a5568;">
                    <span>📊 ${item.points} pts</span>
                    <span>⏰ ${item.hours}h ${item.minutes}min</span>
                </div>
                <div id="quantity-config-${item.id}" class="quantity-config" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    ${(item.response_type || 'numeric') === 'boolean' ? `
                        <label style="display: block; margin-bottom: 5px; font-size: 0.9rem; font-weight: 500;">Incluir este item:</label>
                        <select id="quantity-${item.id}" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                            <option value="0">Não</option>
                            <option value="1" selected>Sim</option>
                        </select>
                    ` : `
                        <label style="display: block; margin-bottom: 5px; font-size: 0.9rem; font-weight: 500;">Quantidade por unidade:</label>
                        <input type="number" id="quantity-${item.id}" step="0.1" min="0" value="1" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                    `}
                    <div id="option-specific-${item.id}" style="display: none; margin-top: 10px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 0.9rem; font-weight: 500;">Vincular à opção específica:</label>
                        <select id="option-select-${item.id}" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                            <option value="">Todas as opções</option>
                        </select>
                    </div>
                </div>
            `;
            
            categoryDiv.appendChild(itemCard);
        });
        
        container.appendChild(categoryDiv);
    });
}

// Alternar seleção de item de escopo
function toggleScopeItem(itemId) {
    const checkbox = document.getElementById(`scope-item-${itemId}`);
    const quantityConfig = document.getElementById(`quantity-config-${itemId}`);
    const card = checkbox.closest('.scope-item-card');
    
    if (checkbox.checked) {
        card.classList.add('selected');
        quantityConfig.style.display = 'block';
        
        // Se for dropdown, mostrar seleção de opção
        const answerType = document.getElementById('answer-type').value;
        if (answerType === 'dropdown') {
            const optionSpecific = document.getElementById(`option-specific-${itemId}`);
            optionSpecific.style.display = 'block';
            updateOptionSelects();
        }
    } else {
        card.classList.remove('selected');
        quantityConfig.style.display = 'none';
    }
}

// Alternar opções do tipo de resposta
function toggleAnswerTypeOptions() {
    const answerType = document.getElementById('answer-type').value;
    const dropdownSection = document.getElementById('dropdown-options-section');
    
    if (answerType === 'dropdown') {
        dropdownSection.classList.add('active');
        // Adicionar primeira opção se não houver nenhuma
        if (document.getElementById('options-list').children.length === 0) {
            addDropdownOption();
        }
    } else {
        dropdownSection.classList.remove('active');
    }
    
    // Atualizar configuração de itens de escopo
    updateScopeItemsForAnswerType(answerType);
}

// Atualizar itens de escopo baseado no tipo de resposta
function updateScopeItemsForAnswerType(answerType) {
    const optionSpecificDivs = document.querySelectorAll('[id^="option-specific-"]');
    
    optionSpecificDivs.forEach(div => {
        if (answerType === 'dropdown') {
            div.style.display = 'block';
        } else {
            div.style.display = 'none';
        }
    });
    
    if (answerType === 'dropdown') {
        updateOptionSelects();
    }
}

// Adicionar opção de dropdown
function addDropdownOption() {
    optionCounter++;
    const optionsList = document.getElementById('options-list');
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-item';
    optionDiv.id = `option-${optionCounter}`;
    optionDiv.innerHTML = `
        <input type="text" placeholder="Rótulo da opção" id="option-label-${optionCounter}" style="flex: 1;" onchange="updateOptionSelects()">
        <input type="text" placeholder="Valor (opcional)" id="option-value-${optionCounter}" style="flex: 1;">
        <input type="number" placeholder="Peso" id="option-weight-${optionCounter}" step="0.1" min="0" style="width: 100px;">
        <button type="button" class="remove-btn" onclick="removeDropdownOption(${optionCounter})">❌</button>
    `;
    
    optionsList.appendChild(optionDiv);
    updateOptionSelects();
}

// Remover opção de dropdown
function removeDropdownOption(optionId) {
    const optionDiv = document.getElementById(`option-${optionId}`);
    optionDiv.remove();
    updateOptionSelects();
}

// Atualizar selects de opções nos itens de escopo
function updateOptionSelects() {
    const optionSelects = document.querySelectorAll('[id^="option-select-"]');
    const options = document.querySelectorAll('[id^="option-label-"]');
    
    optionSelects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Todas as opções</option>';
        
        options.forEach(optionInput => {
            if (optionInput.value.trim()) {
                const optionElement = document.createElement('option');
                optionElement.value = optionInput.id.replace('option-label-', '');
                optionElement.textContent = optionInput.value;
                if (optionElement.value === currentValue) {
                    optionElement.selected = true;
                }
                select.appendChild(optionElement);
            }
        });
    });
}

// Alternar regras de agentes
function toggleAgentRules() {
    const hasRules = document.getElementById('has-agent-rules').checked;
    const rulesSection = document.getElementById('agent-rules-section');
    
    if (hasRules) {
        rulesSection.classList.add('active');
        // Adicionar primeira regra se não houver nenhuma
        if (document.getElementById('agent-rules-list').children.length === 0) {
            addAgentRule();
        }
    } else {
        rulesSection.classList.remove('active');
    }
}

// Adicionar regra de agentes
function addAgentRule() {
    ruleCounter++;
    const rulesList = document.getElementById('agent-rules-list');
    
    const ruleDiv = document.createElement('div');
    ruleDiv.className = 'agent-rule-item';
    ruleDiv.id = `agent-rule-${ruleCounter}`;
    ruleDiv.innerHTML = `
        <div class="agent-rule-header">
            <h5>Regra ${ruleCounter}</h5>
            <button type="button" class="btn btn-danger" onclick="removeAgentRule(${ruleCounter})" style="padding: 5px 10px; font-size: 0.8rem;">🗑️ Remover</button>
        </div>
        
        <div class="range-inputs">
            <div class="form-group">
                <label>Mínimo de Agentes:</label>
                <input type="number" id="rule-min-${ruleCounter}" min="0" required>
            </div>
            <div class="form-group">
                <label>Máximo de Agentes:</label>
                <input type="number" id="rule-max-${ruleCounter}" min="0" required>
            </div>
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="rule-ignore-${ruleCounter}" onchange="toggleRuleIgnore(${ruleCounter})">
                    <label for="rule-ignore-${ruleCounter}">Ignorar pergunta</label>
                </div>
            </div>
        </div>
        
        <div id="rule-scope-items-${ruleCounter}" class="rule-scope-items">
            <h6 style="margin: 15px 0 10px 0; color: #4a5568;">Configuração de Itens de Escopo para esta Regra:</h6>
            <div id="rule-scope-grid-${ruleCounter}" class="scope-items-grid"></div>
        </div>
    `;
    
    rulesList.appendChild(ruleDiv);
    renderRuleScopeItems(ruleCounter);
}

// Remover regra de agentes
function removeAgentRule(ruleId) {
    const ruleDiv = document.getElementById(`agent-rule-${ruleId}`);
    ruleDiv.remove();
}

// Alternar ignorar regra
function toggleRuleIgnore(ruleId) {
    const ignoreCheckbox = document.getElementById(`rule-ignore-${ruleId}`);
    const scopeItemsDiv = document.getElementById(`rule-scope-items-${ruleId}`);
    
    if (ignoreCheckbox.checked) {
        scopeItemsDiv.style.display = 'none';
    } else {
        scopeItemsDiv.style.display = 'block';
    }
}

// Renderizar itens de escopo para regra específica
function renderRuleScopeItems(ruleId) {
    const container = document.getElementById(`rule-scope-grid-${ruleId}`);
    container.innerHTML = '';
    
    // Agrupar por categoria
    const categories = {};
    scopeItems.forEach(item => {
        const categoryName = item.scope_categories?.name || 'Sem Categoria';
        if (!categories[categoryName]) {
            categories[categoryName] = [];
        }
        categories[categoryName].push(item);
    });
    
    // Renderizar por categoria
    Object.keys(categories).forEach(categoryName => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'scope-category';
        categoryDiv.innerHTML = `
            <h6 style="margin: 0 0 10px 0; color: #667eea; font-size: 1rem;">${categoryName}</h6>
        `;
        
        categories[categoryName].forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'scope-item-card';
            itemCard.innerHTML = `
                <div class="scope-item-header">
                    <input type="checkbox" id="rule-${ruleId}-item-${item.id}" onchange="toggleRuleScopeItem(${ruleId}, ${item.id})">
                    <label for="rule-${ruleId}-item-${item.id}" style="margin: 0; font-weight: 600;">${item.name}</label>
                </div>
                <p style="margin: 5px 0; color: #718096; font-size: 0.9rem;">${item.description || ''}</p>
                <div style="display: flex; gap: 15px; font-size: 0.85rem; color: #4a5568;">
                    <span>📊 ${item.points} pts</span>
                    <span>⏰ ${item.hours}h ${item.minutes}min</span>
                </div>
                <div id="rule-${ruleId}-quantity-${item.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    ${(item.response_type || 'numeric') === 'boolean' ? `
                        <label style="display: block; margin-bottom: 5px; font-size: 0.9rem; font-weight: 500;">Incluir este item:</label>
                        <select id="rule-${ruleId}-qty-${item.id}" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                            <option value="0">Não</option>
                            <option value="1" selected>Sim</option>
                        </select>
                    ` : `
                        <label style="display: block; margin-bottom: 5px; font-size: 0.9rem; font-weight: 500;">Quantidade:</label>
                        <input type="number" id="rule-${ruleId}-qty-${item.id}" step="0.1" min="0" value="1" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                    `}
                </div>
            `;
            
            categoryDiv.appendChild(itemCard);
        });
        
        container.appendChild(categoryDiv);
    });
}

// Alternar item de escopo da regra
function toggleRuleScopeItem(ruleId, itemId) {
    const checkbox = document.getElementById(`rule-${ruleId}-item-${itemId}`);
    const quantityConfig = document.getElementById(`rule-${ruleId}-quantity-${itemId}`);
    const card = checkbox.closest('.scope-item-card');
    
    if (checkbox.checked) {
        card.classList.add('selected');
        quantityConfig.style.display = 'block';
    } else {
        card.classList.remove('selected');
        quantityConfig.style.display = 'none';
    }
}

// Manipular envio do formulário
async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        const formData = collectFormData();
        
        if (!validateFormData(formData)) {
            return;
        }
        
        const response = await fetch('/api/advanced-questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('Pergunta criada com sucesso!', 'success');
            clearForm();
        } else {
            showAlert(result.error || 'Erro ao criar pergunta', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar pergunta:', error);
        showAlert('Erro ao salvar pergunta', 'error');
    }
}

// Coletar dados do formulário
function collectFormData() {
    const formData = {
        product_id: document.getElementById('product-select').value,
        billing_model: document.getElementById('billing-model').value,
        text: document.getElementById('question-text').value,
        answer_type: document.getElementById('answer-type').value,
        order_index: parseInt(document.getElementById('order-index').value) || 0,
        is_required: document.getElementById('is-required').checked,
        is_complexity_question: document.getElementById('is-complexity').checked,
        has_agent_rules: document.getElementById('has-agent-rules').checked,
        ignore_if_not_answered: document.getElementById('ignore-if-not-answered').checked
    };
    
    // Coletar opções se for dropdown
    if (formData.answer_type === 'dropdown') {
        formData.options = [];
        const optionLabels = document.querySelectorAll('[id^="option-label-"]');
        
        optionLabels.forEach(labelInput => {
            const optionId = labelInput.id.replace('option-label-', '');
            const valueInput = document.getElementById(`option-value-${optionId}`);
            const weightInput = document.getElementById(`option-weight-${optionId}`);
            
            if (labelInput.value.trim()) {
                formData.options.push({
                    label: labelInput.value,
                    value: valueInput.value || labelInput.value,
                    complexity_weight: parseFloat(weightInput.value) || 0
                });
            }
        });
    }
    
    // Coletar itens de escopo
    formData.scope_items = [];
    const scopeCheckboxes = document.querySelectorAll('[id^="scope-item-"]');
    
    scopeCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const itemId = checkbox.id.replace('scope-item-', '');
            const quantityInput = document.getElementById(`quantity-${itemId}`);
            const optionSelect = document.getElementById(`option-select-${itemId}`);
            
            const scopeItem = {
                scope_item_id: parseInt(itemId),
                quantity_per_unit: parseFloat(quantityInput.value) || 1
            };
            
            if (formData.answer_type === 'dropdown' && optionSelect.value) {
                scopeItem.option_id = optionSelect.value;
            }
            
            formData.scope_items.push(scopeItem);
        }
    });
    
    // Coletar regras de agentes
    if (formData.has_agent_rules) {
        formData.agent_rules = [];
        const ruleItems = document.querySelectorAll('.agent-rule-item');
        
        ruleItems.forEach((ruleItem, index) => {
            const ruleId = ruleItem.id.replace('agent-rule-', '');
            const minInput = document.getElementById(`rule-min-${ruleId}`);
            const maxInput = document.getElementById(`rule-max-${ruleId}`);
            const ignoreCheckbox = document.getElementById(`rule-ignore-${ruleId}`);
            
            const rule = {
                min_agents: parseInt(minInput.value),
                max_agents: parseInt(maxInput.value),
                rule_order: index,
                ignore_question: ignoreCheckbox.checked,
                scope_items: []
            };
            
            // Coletar itens de escopo da regra
            if (!rule.ignore_question) {
                const ruleScopeCheckboxes = document.querySelectorAll(`[id^="rule-${ruleId}-item-"]`);
                
                ruleScopeCheckboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        const itemId = checkbox.id.replace(`rule-${ruleId}-item-`, '');
                        const qtyInput = document.getElementById(`rule-${ruleId}-qty-${itemId}`);
                        
                        rule.scope_items.push({
                            scope_item_id: parseInt(itemId),
                            quantity: parseFloat(qtyInput.value) || 1
                        });
                    }
                });
            }
            
            formData.agent_rules.push(rule);
        });
    }
    
    return formData;
}

// Validar dados do formulário
function validateFormData(formData) {
    if (!formData.product_id) {
        showAlert('Selecione um produto', 'error');
        return false;
    }
    
    if (!formData.text.trim()) {
        showAlert('Digite o texto da pergunta', 'error');
        return false;
    }
    
    if (!formData.answer_type) {
        showAlert('Selecione o tipo de resposta', 'error');
        return false;
    }
    
    if (formData.answer_type === 'dropdown' && (!formData.options || formData.options.length === 0)) {
        showAlert('Adicione pelo menos uma opção para lista suspensa', 'error');
        return false;
    }
    
    // Validar regras de agentes
    if (formData.has_agent_rules && formData.agent_rules) {
        for (let rule of formData.agent_rules) {
            if (rule.min_agents >= rule.max_agents) {
                showAlert('O mínimo de agentes deve ser menor que o máximo', 'error');
                return false;
            }
        }
        
        // Verificar sobreposição de ranges
        for (let i = 0; i < formData.agent_rules.length; i++) {
            for (let j = i + 1; j < formData.agent_rules.length; j++) {
                const rule1 = formData.agent_rules[i];
                const rule2 = formData.agent_rules[j];
                
                if ((rule1.min_agents <= rule2.max_agents && rule1.max_agents >= rule2.min_agents)) {
                    showAlert('Os ranges de agentes não podem se sobrepor', 'error');
                    return false;
                }
            }
        }
    }
    
    return true;
}

// Limpar formulário
function clearForm() {
    document.getElementById('advanced-question-form').reset();
    document.getElementById('options-list').innerHTML = '';
    document.getElementById('agent-rules-list').innerHTML = '';
    document.getElementById('dropdown-options-section').classList.remove('active');
    document.getElementById('agent-rules-section').classList.remove('active');
    
    // Desmarcar todos os checkboxes de itens de escopo
    const scopeCheckboxes = document.querySelectorAll('[id^="scope-item-"]');
    scopeCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        const card = checkbox.closest('.scope-item-card');
        card.classList.remove('selected');
        const quantityConfig = document.getElementById(checkbox.id.replace('scope-item-', 'quantity-config-'));
        if (quantityConfig) {
            quantityConfig.style.display = 'none';
        }
    });
    
    optionCounter = 0;
    ruleCounter = 0;
}

// Mostrar alerta
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    alertContainer.appendChild(alertDiv);
    
    // Remover alerta após 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}