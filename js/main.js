const WEBHOOK_URL = 'https://gmottam.app.n8n.cloud/webhook/webhook-test/gerar-treino';
const HISTORICO_URL = 'https://gmottam.app.n8n.cloud/webhook/meus-treinos';
const BIOIMPEDANCIA_URL = 'https://gmottam.app.n8n.cloud/webhook-test/gerar-bioimpedancia';

let clerk;
let currentUser = null;
let clerkInitialized = false;
const restricoes = [];

window.addEventListener('load', async () => {
    clerk = window.Clerk;
    
    if (!clerk) {
        console.error('❌ Clerk não carregou. Verifique a Publishable Key.');
        showAuthError('❌ Erro ao carregar autenticação', 'Verifique a configuração do Clerk e recarregue a página.');
        return;
    }
    
    try {
        await clerk.load();
        clerkInitialized = true;
        
        if (clerk.user) {
            console.log('✅ Usuário logado:', clerk.user.id);
            currentUser = clerk.user;
            mostrarConteudoAutenticado();
        } else {
            console.log('ℹ️ Nenhum usuário logado');
            document.getElementById('authRequired').style.display = 'block';
        }
        
        setupEventListeners();
        
    } catch (error) {
        console.error('❌ Erro:', error);
        showAuthError('❌ Erro ao inicializar', error.message);
    }
});

function setupEventListeners() {
    document.getElementById('signInBtn')?.addEventListener('click', () => {
        console.log('🔐 Abrindo login...');
        clerk.openSignIn();
    });
    
    clerk.addListener(({ user }) => {
        if (!clerkInitialized) return;
        
        if (user && user.id !== currentUser?.id) {
            console.log('✅ Novo usuário logado:', user.id);
            currentUser = user;
            mostrarConteudoAutenticado();
        } else if (!user && currentUser) {
            currentUser = null;
            document.getElementById('authRequired').style.display = 'block';
            document.getElementById('authenticatedContent').style.display = 'none';
        }
    });
    
    document.getElementById('treinoForm')?.addEventListener('submit', handleFormSubmit);
    document.getElementById('bioimpedanciaForm')?.addEventListener('submit', handleBioimpedanciaSubmit);
    setupChipsInput();
}

function mostrarConteudoAutenticado() {
    document.getElementById('authRequired').style.display = 'none';
    document.getElementById('authenticatedContent').style.display = 'block';

    if (currentUser.firstName) {
        document.getElementById('nome').value = `${currentUser.firstName} ${currentUser.lastName || ''}`.trim();
    }

    const userMenu = document.getElementById('userMenu');
    userMenu.innerHTML = `
        <div class="user-info">
            👤 ${currentUser.firstName || currentUser.emailAddresses[0].emailAddress.split('@')[0]}
        </div>
        <button class="btn-user" onclick="fazerLogout()">Sair</button>
    `;

    carregarHistorico();
}

function fazerLogout() {
    if (confirm('Deseja realmente sair?')) {
        clerk.signOut().then(() => {
            window.location.href = '/';
        });
    }
}

function showAuthError(title, message) {
    document.getElementById('authRequired').innerHTML = `
        <h2 style="color: #f44336;">${title}</h2>
        <p>${message}</p>
    `;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');

    if (tabName === 'historico') {
        carregarHistorico();
    } else if (tabName === 'bioimpedancia') {
        setupBioimpedanciaForm();
    } else if (tabName === 'bioimpedancia') {
        setupBioimpedanciaForm();
    }
}

window.switchTab = switchTab;
window.fazerLogout = fazerLogout;
window.compartilharTreino = compartilharTreino;
window.novoTreino = novoTreino;
window.compartilharTreinoHistorico = compartilharTreinoHistorico;
window.adicionarChip = adicionarChip;
window.removerChip = removerChip;
window.gerarPDFBioimpedancia = gerarPDFBioimpedancia;

function setupChipsInput() {
    const restricoesInput = document.getElementById('restricoesInput');
    const restricoesContainer = document.getElementById('restricoesContainer');

    restricoesInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const valor = restricoesInput.value.trim();
            if (valor) {
                restricoes.push(valor);
                adicionarChip(valor);
                restricoesInput.value = '';
            }
        }
    });
}

function adicionarChip(texto) {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `
        ${texto}
        <button type="button" onclick="removerChip(this, '${texto.replace(/'/g, "\\\\'")}')">×</button>
    `;
    document.getElementById('restricoesContainer').insertBefore(chip, document.getElementById('restricoesInput'));
}

function removerChip(button, texto) {
    const index = restricoes.indexOf(texto);
    if (index > -1) {
        restricoes.splice(index, 1);
    }
    button.parentElement.remove();
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!currentUser) {
        alert('Você precisa estar logado!');
        return;
    }

    const formData = {
        user_id: currentUser.id,
        user_email: currentUser.emailAddresses[0].emailAddress,
        nome: document.getElementById('nome').value,
        idade: parseInt(document.getElementById('idade').value),
        peso: parseFloat(document.getElementById('peso').value),
        altura: parseInt(document.getElementById('altura').value),
        sexo: document.querySelector('input[name="sexo"]:checked').value,
        objetivo: document.getElementById('objetivo').value,
        nivel: document.getElementById('nivel').value,
        frequencia_semanal: parseInt(document.getElementById('frequencia').value),
        restricoes: restricoes,
        equipamentos: [document.getElementById('equipamentos').value]
    };

    showLoading();

    try {
        console.log('json final', formData);

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Erro ao gerar treino');
        }

        const data = await response.json();
        exibirTreino(data);

    } catch (error) {
        showError('❌ Erro ao gerar treino. Tente novamente.');
        document.getElementById('formCard').style.display = 'block';
    } finally {
        hideLoading();
    }
}


function showLoading() {
    document.getElementById('formCard').style.display = 'none';
    document.getElementById('loading').classList.add('active');
    document.getElementById('error').classList.remove('active');
    document.getElementById('result').classList.remove('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
}

function showError(message) {
    document.getElementById('error').textContent = message;
    document.getElementById('error').classList.add('active');
}

function exibirTreino(data) {
    console.log('data', data);
    const resultDiv = document.getElementById('result');
    
    let html = `
        <div class="success-message">
            <span style="font-size: 2rem;">✅</span>
            <div>
                <strong>${data.mensagem || 'Treino gerado com sucesso!'}</strong>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;">
                    ID: ${data.id_treino}
                </div>
            </div>
        </div>

        <div class="treino-overview">
            <div class="overview-card">
                <div class="label">IMC</div>
                <div class="value">${data.aluno.imc}</div>
            </div>
            <div class="overview-card">
                <div class="label">Objetivo</div>
                <div class="value">${data.aluno.objetivo}</div>
            </div>
            <div class="overview-card">
                <div class="label">Nível</div>
                <div class="value">${data.aluno.nivel}</div>
            </div>
            <div class="overview-card">
                <div class="label">Dias/Semana</div>
                <div class="value">${data.treino.length}</div>
            </div>
        </div>

        <div class="observacoes">
            <h3>📋 Observações Importantes</h3>
            <div class="observacao-item">
                <strong>🔥 Aquecimento:</strong>
                ${data.observacoes_gerais.aquecimento}
            </div>
            <div class="observacao-item">
                <strong>🍎 Nutrição:</strong>
                ${data.observacoes_gerais.nutricao}
            </div>
            <div class="observacao-item">
                <strong>📈 Progressão:</strong>
                ${data.observacoes_gerais.progressao}
            </div>
            ${data.observacoes_gerais.cuidados_especiais !== 'Boa forma' ? `
                <div class="observacao-item">
                    <strong>⚠️ Cuidados Especiais:</strong>
                    ${data.observacoes_gerais.cuidados_especiais}
                </div>
            ` : ''}
        </div>
    `;

    data.treino.forEach(dia => {
        html += `
            <div class="treino-dia">
                <h3>${dia.dia}</h3>
                <div class="foco">${dia.foco} • ${dia.duracao_estimada}</div>
        `;

        dia.exercicios.forEach(ex => {
            html += `
                <div class="exercicio">
                    <div class="exercicio-nome">${ex.ordem}. ${ex.nome}</div>
                    <div class="exercicio-detalhes">
                        <span class="detalhe">📊 ${ex.series} séries</span>
                        <span class="detalhe">🔄 ${ex.repeticoes} reps</span>
                        <span class="detalhe">⏱️ ${ex.descanso} descanso</span>
                    </div>
                    <div class="exercicio-dica">
                        💡 ${ex.dica_execucao}
                    </div>
                    <div class="musculos">
                        ${ex.musculos_trabalhados.map(m => 
                            `<span class="musculo-tag">${m}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    });

    html += `
        <div class="actions">
            <button class="btn" onclick="compartilharTreino()">
                🔗 Compartilhar Link do Treino
            </button>
            <button class="btn btn-secondary" onclick="novoTreino()">
                🔄 Gerar Novo Treino
            </button>
        </div>
    `;

    resultDiv.innerHTML = html;
    resultDiv.classList.add('active');
    
    window.treinoAtual = data;
    
    setTimeout(() => carregarHistorico(), 1000);
}

function compartilharTreino() {
    if (!window.treinoAtual?.id_treino) {
        alert('❌ Gere um treino primeiro!');
        return;
    }
    
    const idTreino = window.treinoAtual.id_treino;
    const linkTreino = `${window.location.origin}/treino.html?id=${idTreino}`;
    const texto = `Confira meu treino personalizado gerado por IA! 💪`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Treino Personalizado com IA',
            text: texto,
            url: linkTreino
        }).catch(() => {
            copiarLinkCompartilhavel(linkTreino);
        });
    } else {
        copiarLinkCompartilhavel(linkTreino);
    }
}

function copiarLinkCompartilhavel(link) {
    navigator.clipboard.writeText(link).then(() => {
        if (confirm('✅ Link do treino copiado!\\n\\nQuer compartilhar no WhatsApp?')) {
            const texto = 'Confira meu treino personalizado gerado por IA! 💪';
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(texto + '\\n\\n' + link)}`;
            window.open(whatsappUrl, '_blank');
        }
    });
}

function novoTreino() {
    document.getElementById('formCard').style.display = 'block';
    document.getElementById('result').classList.remove('active');
    document.getElementById('treinoForm').reset();
    restricoes.length = 0;
    document.querySelectorAll('.chip').forEach(chip => chip.remove());
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function carregarHistorico() {
    if (!currentUser?.id) return;

    const historicoDiv = document.getElementById('historicoList');
    historicoDiv.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="spinner"></div><p style="margin-top: 15px; color: #666;">Carregando seus treinos...</p></div>';

    try {
        const response = await fetch(`${HISTORICO_URL}?user_id=${currentUser.id}`);
        
        if (!response.ok) throw new Error('Erro ao carregar');
        
        const data = await response.json();
        
        if (data.treinos && data.treinos.length === 0) {
            historicoDiv.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <h3 style="color: #999;">📝 Nenhum treino ainda</h3>
                    <p style="color: #666; margin-top: 15px;">
                        Gere seu primeiro treino na aba "Gerar Treino"
                    </p>
                </div>
            `;
            return;
        }
        
        let html = '';
        data.treinos.forEach(treino => {
            html += `
                <div class="treino-card">
                    <div class="treino-card-header">
                        <div>
                            <h3 class="treino-card-title">${treino.nome}</h3>
                            <p class="treino-card-info">
                                ${treino.objetivo} • ${treino.nivel}
                            </p>
                        </div>
                        <span class="treino-card-date">
                            ${new Date(treino.data_criacao).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    <div class="treino-card-actions">
                        <a href="/treino.html?id=${treino.id_treino}" target="_blank" class="btn-secondary" style="text-decoration: none; display: inline-block; text-align: center;">
                            👁️ Ver Treino
                        </a>
                        <button onclick="compartilharTreinoHistorico('${treino.id_treino}')" class="btn-secondary">
                            🔗 Compartilhar
                        </button>
                    </div>
                </div>
            `;
        });
        
        historicoDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        historicoDiv.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <h3 style="color: #999; margin-bottom: 15px;">🚧 Histórico em Desenvolvimento</h3>
                <p style="color: #666;">
                    A funcionalidade será implementada em breve!
                </p>
            </div>
        `;
    }
}

function compartilharTreinoHistorico(idTreino) {
    const link = `${window.location.origin}/treino.html?id=${idTreino}`;
    const texto = 'Confira meu treino personalizado! 💪';
    
    navigator.clipboard.writeText(link).then(() => {
        if (confirm('✅ Link copiado!\\n\\nCompartilhar no WhatsApp?')) {
            window.open(`https://wa.me/?text=${encodeURIComponent(texto + '\\n\\n' + link)}`, '_blank');
        }
    });
}

function setupBioimpedanciaForm() {
    if (currentUser?.firstName) {
        document.getElementById('bio-nome').value = `${currentUser.firstName} ${currentUser.lastName || ''}`.trim();
    }
}

async function handleBioimpedanciaSubmit(e) {
    e.preventDefault();

    if (!currentUser) {
        alert('Você precisa estar logado!');
        return;
    }

    const formData = {
        user_id: currentUser.id,
        user_email: currentUser.emailAddresses[0].emailAddress,
        
        dados_pessoais: {
            nome: document.getElementById('bio-nome').value,
            idade: parseInt(document.getElementById('bio-idade').value),
            peso: parseFloat(document.getElementById('bio-peso').value),
            altura: parseInt(document.getElementById('bio-altura').value),
            sexo: document.querySelector('input[name="bio-sexo"]:checked').value
        },
        
        bioimpedancia: {
            percentual_gordura: parseFloat(document.getElementById('bio-percentual-gordura').value),
            massa_magra: parseFloat(document.getElementById('bio-massa-magra').value),
            massa_gorda: parseFloat(document.getElementById('bio-massa-gorda').value),
            agua_corporal: parseFloat(document.getElementById('bio-agua-corporal').value),
            massa_muscular: parseFloat(document.getElementById('bio-massa-muscular').value),
            massa_ossea: parseFloat(document.getElementById('bio-massa-ossea').value),
            metabolismo_basal: parseInt(document.getElementById('bio-metabolismo-basal').value),
            gordura_visceral: parseInt(document.getElementById('bio-gordura-visceral').value),
            idade_metabolica: parseInt(document.getElementById('bio-idade-metabolica').value),
            proteina: parseFloat(document.getElementById('bio-proteina').value)
        },
        
        circunferencias: {
            pescoco: parseFloat(document.getElementById('bio-pescoco').value),
            ombros: parseFloat(document.getElementById('bio-ombros').value),
            torax: parseFloat(document.getElementById('bio-torax').value),
            cintura: parseFloat(document.getElementById('bio-cintura').value),
            abdomen: parseFloat(document.getElementById('bio-abdomen').value),
            quadril: parseFloat(document.getElementById('bio-quadril').value),
            biceps_direito: parseFloat(document.getElementById('bio-biceps-direito').value),
            biceps_esquerdo: parseFloat(document.getElementById('bio-biceps-esquerdo').value),
            antebraco_direito: parseFloat(document.getElementById('bio-antebraco-direito').value),
            antebraco_esquerdo: parseFloat(document.getElementById('bio-antebraco-esquerdo').value),
            coxa_direita: parseFloat(document.getElementById('bio-coxa-direita').value),
            coxa_esquerda: parseFloat(document.getElementById('bio-coxa-esquerda').value),
            panturrilha_direita: parseFloat(document.getElementById('bio-panturrilha-direita').value),
            panturrilha_esquerda: parseFloat(document.getElementById('bio-panturrilha-esquerda').value)
        },
        
        dobras_cutaneas: {
            triceps: parseFloat(document.getElementById('bio-triceps').value),
            subescapular: parseFloat(document.getElementById('bio-subescapular').value),
            peitoral: parseFloat(document.getElementById('bio-peitoral').value),
            axilar_media: parseFloat(document.getElementById('bio-axilar-media').value),
            supra_iliaca: parseFloat(document.getElementById('bio-supra-iliaca').value),
            abdominal: parseFloat(document.getElementById('bio-abdominal').value),
            coxa: parseFloat(document.getElementById('bio-coxa-dobra').value)
        }
    };

    showBioLoading();

    try {
        console.log('Enviando dados de bioimpedância:', formData);

        const response = await fetch(BIOIMPEDANCIA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Erro ao processar bioimpedância');
        }

        const data = await response.json();
        
        // Redirecionar para a página de relatório
        const link = `/bioimpedancia.html?id=${data.id_avaliacao}`;
        window.open(link, '_blank');
        
        // Resetar formulário
        document.getElementById('bioimpedanciaCard').style.display = 'block';
        document.getElementById('bioResult').classList.remove('active');
        document.getElementById('bioimpedanciaForm').reset();

    } catch (error) {
        console.error('Erro:', error);
        showBioError('❌ Erro ao processar análise. Tente novamente.');
        document.getElementById('bioimpedanciaCard').style.display = 'block';
    } finally {
        hideBioLoading();
    }
}

function showBioLoading() {
    document.getElementById('bioimpedanciaCard').style.display = 'none';
    document.getElementById('bioLoading').classList.add('active');
    document.getElementById('bioError').classList.remove('active');
    document.getElementById('bioResult').classList.remove('active');
}

function hideBioLoading() {
    document.getElementById('bioLoading').classList.remove('active');
}

function showBioError(message) {
    document.getElementById('bioError').textContent = message;
    document.getElementById('bioError').classList.add('active');
}

function getClassificacaoIMC(imc) {
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidade';
}

function getStatusGordura(gordura, sexo) {
    const limites = sexo === 'masculino' ? [6, 13, 17, 25] : [14, 20, 25, 32];
    if (gordura < limites[0]) return 'Muito baixo';
    if (gordura <= limites[1]) return 'Excelente';
    if (gordura <= limites[2]) return 'Bom';
    if (gordura <= limites[3]) return 'Normal';
    return 'Alto';
}

function getStatusAgua(agua, sexo) {
    const ideal = sexo === 'masculino' ? [55, 65] : [45, 60];
    if (agua < ideal[0]) return 'Baixo';
    if (agua <= ideal[1]) return 'Normal';
    return 'Alto';
}

function getStatusVisceral(visceral) {
    if (visceral <= 9) return 'Normal';
    if (visceral <= 14) return 'Atenção';
    return 'Alto';
}

function gerarRecomendacoes(dados) {
    const recomendacoes = [];
    
    if (dados.gordura_corporal > (dados.sexo === 'masculino' ? 20 : 28)) {
        recomendacoes.push('Considere aumentar atividades cardiovasculares para redução de gordura corporal');
    }
    
    if (dados.agua_corporal < (dados.sexo === 'masculino' ? 55 : 45)) {
        recomendacoes.push('Aumente a ingestão de água para melhorar a hidratação corporal');
    }
    
    if (dados.gordura_visceral > 10) {
        recomendacoes.push('Foque em exercícios aeróbicos e dieta balanceada para reduzir gordura visceral');
    }
    
    return recomendacoes;
}



function getStatusClass(status) {
    const statusMap = {
        'Excelente': 'excelente',
        'Bom': 'bom', 
        'Normal': 'normal',
        'Atenção': 'atencao',
        'Alto': 'critico',
        'Muito baixo': 'atencao',
        'Baixo': 'atencao'
    };
    return statusMap[status] || 'normal';
}

function gerarPDFBioimpedancia() {
    if (!window.bioimpedanciaAtual) {
        alert('❌ Faça uma análise primeiro!');
        return;
    }
    
    // Aqui você implementaria a geração do PDF
    // Por enquanto, vamos simular
    alert('🚧 Funcionalidade em desenvolvimento!\n\nEm breve você poderá gerar e baixar o PDF do seu relatório de bioimpedância.');
}

function novaBioimpedancia() {
    document.getElementById('bioimpedanciaCard').style.display = 'block';
    document.getElementById('bioResult').classList.remove('active');
    document.getElementById('bioimpedanciaForm').reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
