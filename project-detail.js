// Variáveis globais
let currentProject = null;
let projectId = null;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Obter ID do projeto da URL
    const urlParams = new URLSearchParams(window.location.search);
    projectId = urlParams.get('id');
    
    if (!projectId) {
        showError('ID do projeto não fornecido');
        return;
    }
    
    loadProject();
});

// Carregar projeto da API
async function loadProject() {
    try {
        showLoading();
        
        console.log('🔍 Buscando projeto ID:', projectId);
        const response = await fetch('/api/projects');
        const result = await response.json();
        
        console.log('📥 Resposta da API completa:', result);
        
        if (result.success) {
            console.log('📊 Total de projetos encontrados:', result.data.length);
            const project = result.data.find(p => p.id == projectId);
            
            if (project) {
                console.log('✅ Projeto encontrado:', project);
                console.log('⏰ Total de horas no banco:', project.total_scope_hours);
                console.log('💰 Valor estimado no banco:', project.estimated_value);
                currentProject = project;
                displayProject(project);
            } else {
                console.log('❌ Projeto não encontrado na lista');
                showError('Projeto não encontrado');
            }
        } else {
            console.error('Erro ao carregar projeto:', result.error);
            showError('Erro ao carregar projeto');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        showError('Erro de conexão ao carregar projeto');
    }
}

// Exibir projeto na tela
function displayProject(project) {
    hideLoading();
    
    console.log('🖥️ Exibindo projeto na tela:', project.name);
    console.log('📋 Dados completos do projeto:', project);
    
    // Cabeçalho
    document.getElementById('projectTitle').textContent = project.name || 'Projeto sem nome';
    
    const createdDate = new Date(project.created_at).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('projectDate').textContent = `📅 Criado em ${createdDate}`;
    // Mapear billing_model para nomes amigáveis
    const billingModelNames = {
        'escopo_fechado': 'Escopo Fechado',
        'time_materials': 'Projeto Customizado'
    };
    const modelName = billingModelNames[project.billing_model] || 'Modelo não definido';
    document.getElementById('projectModel').textContent = `💼 ${modelName}`;
    
    // Adicionar nome do responsável
    const responsibleName = project.users ? project.users.name : 'Responsável não definido';
    document.getElementById('projectResponsible').textContent = `👤 ${responsibleName}`;
    
    // Descrição
    if (project.description) {
        document.getElementById('projectDescriptionSection').style.display = 'block';
        document.getElementById('projectDescription').textContent = project.description;
    }
    
    // Estatísticas - usar valores salvos no banco
    const totalItems = project.scope_items ? project.scope_items.length : 0;
    const totalHours = project.total_scope_hours || 0;
    const totalMinutes = 0; // Para projetos padrões, não usamos minutos
    
    console.log('📊 ESTATÍSTICAS DO PROJETO:');
    console.log('   📦 Total de itens:', totalItems);
    console.log('   ⏰ Horas do banco (total_scope_hours):', project.total_scope_hours);
    console.log('   ⏰ Horas usadas para exibição:', totalHours);
    console.log('   ⏰ Minutos:', totalMinutes);
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalTime').textContent = formatTime(totalHours, totalMinutes);
    
    console.log('   🖥️ Tempo formatado exibido:', formatTime(totalHours, totalMinutes));
    
    // Calcular preço estimado (R$ 280/hora)
    const hourlyRate = 280;
    const totalTimeInHours = totalHours + (totalMinutes / 60);
    const estimatedPrice = totalTimeInHours * hourlyRate;
    
    console.log('   💰 Cálculo do preço:');
    console.log('      - Taxa por hora: R$', hourlyRate);
    console.log('      - Horas totais para cálculo:', totalTimeInHours);
    console.log('      - Preço estimado calculado: R$', estimatedPrice);
    
    document.getElementById('estimatedPrice').textContent = `R$ ${estimatedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    
    // Itens de escopo
    displayScopeItems(project.scope_items);
    
    document.getElementById('projectContent').style.display = 'block';
}

// Exibir itens de escopo
function displayScopeItems(scopeItems) {
    const container = document.getElementById('scopeItemsContent');
    
    if (!scopeItems || scopeItems.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; text-align: center; padding: 20px;">Nenhum item de escopo encontrado.</p>';
        return;
    }
    
    const tableHtml = `
        <table class="scope-items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Quantidade</th>
                    <th style="text-align: center;">Tempo Unitário</th>
                    <th style="text-align: center;">Tempo Total</th>
                </tr>
            </thead>
            <tbody>
                ${scopeItems.map(item => createScopeItemRow(item)).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHtml;
}

// Criar linha da tabela de item de escopo
function createScopeItemRow(item) {
    const scopeItem = item.scope_items;
    const itemName = scopeItem ? scopeItem.name : 'Item desconhecido';
    const itemDescription = scopeItem ? scopeItem.description : '';
    const quantity = item.quantity || 1;
    
    // Tempo unitário (custom ou padrão)
    const unitHours = item.custom_hours || (scopeItem ? scopeItem.hours : 0) || 0;
    const unitMinutes = item.custom_minutes || (scopeItem ? scopeItem.minutes : 0) || 0;
    
    // Tempo total (unitário * quantidade)
    const totalHours = unitHours * quantity;
    const totalMinutes = unitMinutes * quantity;
    
    return `
        <tr>
            <td>
                <div class="item-name">${escapeHtml(itemName)}</div>
                ${itemDescription ? `<div class="item-description">${escapeHtml(itemDescription)}</div>` : ''}
            </td>
            <td style="text-align: center;">
                <span class="quantity-badge">${quantity}x</span>
            </td>
            <td class="time-cell">
                ${formatTime(unitHours, unitMinutes)}
            </td>
            <td class="time-cell">
                <strong>${formatTime(totalHours, totalMinutes)}</strong>
            </td>
        </tr>
    `;
}

// Mostrar estado de carregamento
function showLoading() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('projectContent').style.display = 'none';
}

// Esconder estado de carregamento
function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}

// Mostrar erro
function showError(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('projectContent').style.display = 'none';
    
    const errorState = document.getElementById('errorState');
    errorState.style.display = 'block';
    errorState.querySelector('p').textContent = message;
}

// Formatar tempo (horas e minutos)
function formatTime(hours, minutes) {
    if (hours === 0 && minutes === 0) {
        return '0h';
    }
    
    let result = '';
    if (hours > 0) {
        result += `${hours}h`;
    }
    if (minutes > 0) {
        result += ` ${minutes}min`;
    }
    
    return result.trim();
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Editar projeto
function editProject() {
    if (!currentProject) return;
    
    // Redirecionar para o simulador com o projeto carregado
    // Por enquanto, apenas redirecionar para o simulador
    window.location.href = '/simulador';
}

// Excluir projeto
function deleteProject() {
    if (!currentProject) return;
    
    const confirmDelete = confirm(`Tem certeza que deseja excluir o projeto "${currentProject.name}"?\n\nEsta ação não pode ser desfeita.`);
    
    if (confirmDelete) {
        performDeleteProject();
    }
}

// Executar exclusão do projeto
async function performDeleteProject() {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Projeto excluído com sucesso!');
            window.location.href = '/';
        } else {
            alert('Erro ao excluir projeto: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        alert('Erro de conexão ao excluir projeto');
    }
}

// Exportar projeto (função futura)
function exportProject() {
    if (!currentProject) return;
    
    // Implementar exportação em PDF ou Excel
    alert('Funcionalidade de exportação será implementada em breve!');
}

// Duplicar projeto (função futura)
function duplicateProject() {
    if (!currentProject) return;
    
    // Implementar duplicação do projeto
    alert('Funcionalidade de duplicação será implementada em breve!');
}