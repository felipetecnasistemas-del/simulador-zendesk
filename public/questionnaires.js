// Questionários específicos para cada produto Zendesk
const productQuestionnaires = {
    'suite-zendesk': {
        title: 'Configuração Suite Zendesk',
        questions: [
            {
                id: 'zendesk-version',
                type: 'select',
                label: 'Versão do Zendesk',
                required: true,
                options: [
                    { value: '', label: 'Selecione a versão' },
                    { value: 'suite-team', label: 'Suite Team' },
                    { value: 'suite-growth', label: 'Suite Growth' },
                    { value: 'suite-professional', label: 'Suite Professional' },
                    { value: 'suite-enterprise', label: 'Suite Enterprise' },
                    { value: 'suite-enterprise-plus', label: 'Suite Enterprise Plus' }
                ]
            },
            {
                id: 'brands',
                type: 'number',
                label: 'Quantas marcas serão configuradas?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'agents',
                type: 'number',
                label: 'Quantos agentes serão configurados?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'groups',
                type: 'number',
                label: 'Quantos grupos serão criados?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'forms',
                type: 'number',
                label: 'Quantos formulários personalizados?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'views',
                type: 'number',
                label: 'Quantas visualizações personalizadas?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'triggers',
                type: 'number',
                label: 'Quantos gatilhos serão configurados?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'automations',
                type: 'number',
                label: 'Quantas automações serão criadas?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'slas',
                type: 'number',
                label: 'Quantos SLAs serão configurados?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'marketplace-theme',
                type: 'select',
                label: 'Será usado tema da Marketplace?',
                options: [
                    { value: 'no', label: 'Não' },
                    { value: 'yes', label: 'Sim' }
                ]
            },
            {
                id: 'categories',
                type: 'number',
                label: 'Quantas categorias no Guide?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'sections',
                type: 'number',
                label: 'Quantas seções no Guide?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'articles',
                type: 'number',
                label: 'Quantos artigos serão criados?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'admin-training',
                type: 'select',
                label: 'Será necessário treinamento para admin?',
                options: [
                    { value: 'yes', label: 'Sim' },
                    { value: 'no', label: 'Não' }
                ]
            },
            {
                id: 'custom-reports',
                type: 'number',
                label: 'Quantos relatórios customizados?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'dashboards',
                type: 'number',
                label: 'Quantos painéis personalizados?',
                min: 0,
                placeholder: '0'
            }
        ]
    },
    'copilot': {
        title: 'Configuração Copilot',
        questions: [
            {
                id: 'copilot-language',
                type: 'select',
                label: 'Idioma principal do Copilot',
                required: true,
                options: [
                    { value: '', label: 'Selecione o idioma' },
                    { value: 'pt-br', label: 'Português (Brasil)' },
                    { value: 'en', label: 'Inglês' },
                    { value: 'es', label: 'Espanhol' }
                ]
            },
            {
                id: 'knowledge-base-size',
                type: 'select',
                label: 'Tamanho da base de conhecimento',
                options: [
                    { value: 'small', label: 'Pequena (até 50 artigos)' },
                    { value: 'medium', label: 'Média (51-200 artigos)' },
                    { value: 'large', label: 'Grande (201-500 artigos)' },
                    { value: 'xlarge', label: 'Muito Grande (500+ artigos)' }
                ]
            },
            {
                id: 'custom-intents',
                type: 'number',
                label: 'Quantas intenções customizadas?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'agent-workflows',
                type: 'number',
                label: 'Quantos fluxos de trabalho para agentes?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'integration-channels',
                type: 'number',
                label: 'Quantos canais de integração?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'copilot-training',
                type: 'select',
                label: 'Será necessário treinamento específico?',
                options: [
                    { value: 'yes', label: 'Sim' },
                    { value: 'no', label: 'Não' }
                ]
            }
        ]
    },
    'zendesk-qa': {
        title: 'Configuração Zendesk QA',
        questions: [
            {
                id: 'qa-scorecard-templates',
                type: 'number',
                label: 'Quantos templates de scorecard?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'qa-categories',
                type: 'number',
                label: 'Quantas categorias de avaliação?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'qa-reviewers',
                type: 'number',
                label: 'Quantos revisores serão configurados?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'qa-automation-rules',
                type: 'number',
                label: 'Quantas regras de automação?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'qa-reporting',
                type: 'select',
                label: 'Configurar relatórios personalizados?',
                options: [
                    { value: 'basic', label: 'Básico' },
                    { value: 'advanced', label: 'Avançado' },
                    { value: 'custom', label: 'Personalizado' }
                ]
            },
            {
                id: 'qa-training',
                type: 'select',
                label: 'Treinamento para revisores?',
                options: [
                    { value: 'yes', label: 'Sim' },
                    { value: 'no', label: 'Não' }
                ]
            }
        ]
    },
    'zendesk-wfm': {
        title: 'Configuração Zendesk WFM',
        questions: [
            {
                id: 'wfm-agents-count',
                type: 'number',
                label: 'Quantos agentes serão gerenciados?',
                min: 1,
                placeholder: '0'
            },
            {
                id: 'wfm-teams',
                type: 'number',
                label: 'Quantas equipes serão configuradas?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'wfm-skills',
                type: 'number',
                label: 'Quantas habilidades serão mapeadas?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'wfm-schedules',
                type: 'select',
                label: 'Complexidade dos horários',
                options: [
                    { value: 'simple', label: 'Simples (horário fixo)' },
                    { value: 'medium', label: 'Médio (múltiplos turnos)' },
                    { value: 'complex', label: 'Complexo (24/7, múltiplas zonas)' }
                ]
            },
            {
                id: 'wfm-forecasting',
                type: 'select',
                label: 'Configurar previsão de demanda?',
                options: [
                    { value: 'basic', label: 'Básica' },
                    { value: 'advanced', label: 'Avançada' },
                    { value: 'ai-powered', label: 'Com IA' }
                ]
            },
            {
                id: 'wfm-integrations',
                type: 'number',
                label: 'Quantas integrações externas?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'wfm-training',
                type: 'select',
                label: 'Treinamento para supervisores?',
                options: [
                    { value: 'yes', label: 'Sim' },
                    { value: 'no', label: 'Não' }
                ]
            }
        ]
    },
    'advanced-ai': {
        title: 'Configuração Agente de IA Avançado',
        questions: [
            {
                id: 'ai-use-cases',
                type: 'number',
                label: 'Quantos casos de uso serão configurados?',
                min: 1,
                placeholder: '0'
            },
            {
                id: 'ai-knowledge-sources',
                type: 'number',
                label: 'Quantas fontes de conhecimento?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'ai-conversation-flows',
                type: 'number',
                label: 'Quantos fluxos conversacionais?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'ai-escalation-rules',
                type: 'number',
                label: 'Quantas regras de escalação?',
                min: 0,
                placeholder: '0'
            },
            {
                id: 'ai-languages',
                type: 'select',
                label: 'Quantos idiomas suportados?',
                options: [
                    { value: '1', label: '1 idioma' },
                    { value: '2-3', label: '2-3 idiomas' },
                    { value: '4-5', label: '4-5 idiomas' },
                    { value: '6+', label: '6+ idiomas' }
                ]
            },
            {
                id: 'ai-channels',
                type: 'number',
                label: 'Quantos canais de atendimento?',
                min: 1,
                placeholder: '0'
            },
            {
                id: 'ai-analytics',
                type: 'select',
                label: 'Configurar analytics avançado?',
                options: [
                    { value: 'basic', label: 'Básico' },
                    { value: 'advanced', label: 'Avançado' },
                    { value: 'custom', label: 'Personalizado' }
                ]
            },
            {
                id: 'ai-training',
                type: 'select',
                label: 'Treinamento especializado necessário?',
                options: [
                    { value: 'yes', label: 'Sim' },
                    { value: 'no', label: 'Não' }
                ]
            }
        ]
    }
};

// Função para abrir modal de questionário
function openQuestionnaireModal(productId) {
    const questionnaire = productQuestionnaires[productId];
    if (!questionnaire) {
        console.error('Questionário não encontrado para o produto:', productId);
        return;
    }

    // Criar modal se não existir
    let modal = document.getElementById('questionnaireModal');
    if (!modal) {
        modal = createQuestionnaireModal();
        document.body.appendChild(modal);
    }

    // Preencher conteúdo do modal
    const modalTitle = modal.querySelector('.questionnaire-title');
    const modalContent = modal.querySelector('.questionnaire-content');
    const modalFooter = modal.querySelector('.questionnaire-footer');

    modalTitle.textContent = questionnaire.title;
    modalContent.innerHTML = generateQuestionnaireHTML(questionnaire.questions, productId);
    
    // Configurar botões do footer
    modalFooter.innerHTML = `
        <button type="button" class="btn-secondary" onclick="closeQuestionnaireModal()">Cancelar</button>
        <button type="button" class="btn-primary" onclick="saveQuestionnaire('${productId}')">Salvar Configuração</button>
    `;

    // Carregar respostas salvas se existirem
    loadSavedAnswers(productId);

    // Mostrar modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Função para criar o modal de questionário
function createQuestionnaireModal() {
    const modal = document.createElement('div');
    modal.id = 'questionnaireModal';
    modal.className = 'questionnaire-modal';
    modal.innerHTML = `
        <div class="questionnaire-modal-content">
            <div class="questionnaire-header">
                <h2 class="questionnaire-title"></h2>
                <button class="questionnaire-close" onclick="closeQuestionnaireModal()">&times;</button>
            </div>
            <div class="questionnaire-body">
                <div class="questionnaire-content"></div>
            </div>
            <div class="questionnaire-footer"></div>
        </div>
    `;
    return modal;
}

// Função para gerar HTML do questionário
function generateQuestionnaireHTML(questions, productId) {
    let html = '<form id="questionnaireForm" class="questionnaire-form">';
    
    questions.forEach(question => {
        html += '<div class="question-group">';
        html += `<label for="${question.id}" class="question-label">`;
        html += question.label;
        if (question.required) {
            html += ' <span class="required">*</span>';
        }
        html += '</label>';
        
        if (question.type === 'select') {
            html += `<select id="${question.id}" name="${question.id}" class="question-input"`;
            if (question.required) html += ' required';
            html += '>';
            
            question.options.forEach(option => {
                html += `<option value="${option.value}">${option.label}</option>`;
            });
            
            html += '</select>';
        } else if (question.type === 'number') {
            html += `<input type="number" id="${question.id}" name="${question.id}" class="question-input"`;
            if (question.min !== undefined) html += ` min="${question.min}"`;
            if (question.placeholder) html += ` placeholder="${question.placeholder}"`;
            if (question.required) html += ' required';
            html += '>';
        } else if (question.type === 'text') {
            html += `<input type="text" id="${question.id}" name="${question.id}" class="question-input"`;
            if (question.placeholder) html += ` placeholder="${question.placeholder}"`;
            if (question.required) html += ' required';
            html += '>';
        }
        
        html += '</div>';
    });
    
    html += '</form>';
    return html;
}

// Função para carregar respostas salvas
function loadSavedAnswers(productId) {
    const savedConfig = productConfigurations[productId];
    if (savedConfig && savedConfig.answers) {
        Object.entries(savedConfig.answers).forEach(([questionId, answer]) => {
            const input = document.getElementById(questionId);
            if (input) {
                input.value = answer;
            }
        });
    }
}

// Função para salvar questionário
function saveQuestionnaire(productId) {
    const form = document.getElementById('questionnaireForm');
    const formData = new FormData(form);
    const answers = {};
    
    // Validar campos obrigatórios
    const questionnaire = productQuestionnaires[productId];
    let isValid = true;
    
    questionnaire.questions.forEach(question => {
        if (question.required) {
            const value = formData.get(question.id);
            if (!value || value.trim() === '') {
                isValid = false;
                const input = document.getElementById(question.id);
                if (input) {
                    input.style.borderColor = '#dc3545';
                    setTimeout(() => {
                        input.style.borderColor = '';
                    }, 3000);
                }
            }
        }
    });
    
    if (!isValid) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Coletar respostas
    for (let [key, value] of formData.entries()) {
        answers[key] = value;
    }
    
    // Salvar configuração
    productConfigurations[productId] = {
        configured: true,
        answers: answers,
        configuredAt: new Date().toISOString()
    };
    
    // Atualizar interface
    const card = document.querySelector(`[data-product="${productId}"]`);
    const badge = card.querySelector('.status-badge');
    
    card.classList.add('configured');
    badge.textContent = 'Configurado';
    
    // Salvar no localStorage
    saveSelectedProducts();
    
    // Fechar modal
    closeQuestionnaireModal();
    
    // Atualizar exibição de produtos selecionados
    if (typeof updateSelectedProductsDisplay === 'function') {
        updateSelectedProductsDisplay();
    }
    
    // Mostrar mensagem de sucesso
    showSuccessMessage(`${availableProducts[productId].name} configurado com sucesso!`);
}

// Função para fechar modal de questionário
function closeQuestionnaireModal() {
    const modal = document.getElementById('questionnaireModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Função para mostrar mensagem de sucesso
function showSuccessMessage(message) {
    // Remover mensagens existentes
    const existingMessages = document.querySelectorAll('.success-toast');
    existingMessages.forEach(msg => msg.remove());
    
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Mostrar toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remover toast após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Fechar modal ao clicar fora dele
window.addEventListener('click', function(event) {
    const modal = document.getElementById('questionnaireModal');
    if (event.target === modal) {
        closeQuestionnaireModal();
    }
});

// Fechar modal com ESC
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeQuestionnaireModal();
    }
});