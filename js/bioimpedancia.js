const API_URL = 'https://gmottam.app.n8n.cloud/webhook-test/consultar-bioimpedancia';

let dadosBioimpedancia = null;

window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idAvaliacao = urlParams.get('id');
    
    if (!idAvaliacao) {
        showError('ID da avaliação não encontrado na URL');
        return;
    }
    
    await carregarBioimpedancia(idAvaliacao);
});

async function carregarBioimpedancia(idAvaliacao) {
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}?id=${idAvaliacao}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar dados');
        }
        
        const data = await response.json();
        dadosBioimpedancia = data;
        exibirBioimpedancia(data);
        
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro ao carregar relatório. Verifique o ID e tente novamente.');
    } finally {
        hideLoading();
    }
}

function showLoading() {
    document.getElementById('loading').classList.add('active');
    document.getElementById('error').classList.remove('active');
    document.getElementById('content').classList.remove('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
}

function showError(message) {
    document.getElementById('error').querySelector('p').textContent = message;
    document.getElementById('error').classList.add('active');
    document.getElementById('content').classList.remove('active');
}

function exibirBioimpedancia(data) {
    // Header
    document.getElementById('pacienteNome').textContent = data.paciente.nome;
    document.getElementById('dataAvaliacao').textContent = new Date(data.paciente.data_avaliacao).toLocaleDateString('pt-BR');
    
    // Resumo
    document.getElementById('resumoTexto').textContent = data.analise_detalhada.resumo_executivo;
    
    // Métricas principais
    document.getElementById('imc').textContent = data.paciente.imc;
    document.getElementById('imcStatus').textContent = data.comparacao_referencias.imc.status;
    
    document.getElementById('gordura').textContent = `${data.metricas.bioimpedancia.percentual_gordura}%`;
    document.getElementById('gorduraStatus').textContent = data.comparacao_referencias.gordura.status;
    
    document.getElementById('massaMuscular').textContent = `${data.metricas.bioimpedancia.massa_muscular}kg`;
    
    document.getElementById('rcq').textContent = data.paciente.rcq;
    document.getElementById('rcqStatus').textContent = data.comparacao_referencias.rcq.risco;
    
    document.getElementById('gorduraVisceral').textContent = data.metricas.bioimpedancia.gordura_visceral;
    document.getElementById('visceralStatus').textContent = data.comparacao_referencias.gordura_visceral.risco;
    
    document.getElementById('idadeMetabolica').textContent = `${data.metricas.bioimpedancia.idade_metabolica} anos`;
    
    // Análise detalhada
    document.getElementById('analiseIMC').textContent = data.analise_detalhada.composicao_corporal.classificacao_imc;
    document.getElementById('analiseGordura').textContent = data.analise_detalhada.composicao_corporal.classificacao_gordura;
    document.getElementById('analiseMassa').textContent = data.analise_detalhada.composicao_corporal.status_massa_muscular;
    document.getElementById('analiseHidratacao').textContent = data.analise_detalhada.composicao_corporal.status_hidratacao;
    
    // Objetivos
    const objetivos = data.analise_detalhada.objetivos;
    
    document.getElementById('pesoCP').textContent = objetivos.curto_prazo.peso_alvo;
    document.getElementById('gorduraCP').textContent = objetivos.curto_prazo.gordura_alvo;
    preencherMetas('metasCP', objetivos.curto_prazo.metas_especificas);
    
    document.getElementById('pesoMP').textContent = objetivos.medio_prazo.peso_alvo;
    document.getElementById('gorduraMP').textContent = objetivos.medio_prazo.gordura_alvo;
    preencherMetas('metasMP', objetivos.medio_prazo.metas_especificas);
    
    document.getElementById('pesoLP').textContent = objetivos.longo_prazo.peso_alvo;
    document.getElementById('gorduraLP').textContent = objetivos.longo_prazo.gordura_alvo;
    preencherMetas('metasLP', objetivos.longo_prazo.metas_especificas);
    
    // Plano nutricional
    const nutricao = data.analise_detalhada.plano_nutricional;
    document.getElementById('tmb').textContent = nutricao.metabolismo_basal;
    document.getElementById('manutencao').textContent = nutricao.calorias_manutencao;
    document.getElementById('caloriaObjetivo').textContent = nutricao.calorias_objetivo;
    
    document.getElementById('proteinas').textContent = nutricao.macronutrientes.proteinas_g;
    document.getElementById('carboidratos').textContent = nutricao.macronutrientes.carboidratos_g;
    document.getElementById('gorduras').textContent = nutricao.macronutrientes.gorduras_g;
    
    preencherMetas('suplementos', nutricao.suplementacao);
    
    // Riscos
    if (data.analise_detalhada.riscos_saude && data.analise_detalhada.riscos_saude.length > 0) {
        let riscosHtml = '';
        data.analise_detalhada.riscos_saude.forEach(risco => {
            riscosHtml += `
                <div class="risco-item">
                    <div class="risco-nivel">Nível: ${risco.nivel}</div>
                    <div class="risco-categoria">${risco.categoria}</div>
                    <p><strong>Descrição:</strong> ${risco.descricao}</p>
                    <p><strong>Recomendação:</strong> ${risco.recomendacao}</p>
                </div>
            `;
        });
        document.getElementById('riscosContent').innerHTML = riscosHtml;
    } else {
        document.getElementById('riscosCard').style.display = 'none';
    }
    
    document.getElementById('content').classList.add('active');
}

function preencherMetas(elementId, metas) {
    const ul = document.getElementById(elementId);
    ul.innerHTML = '';
    metas.forEach(meta => {
        const li = document.createElement('li');
        li.textContent = meta;
        ul.appendChild(li);
    });
}

function gerarPDF() {
    if (!dadosBioimpedancia) {
        alert('❌ Dados não carregados!');
        return;
    }
    
    alert('🚧 Funcionalidade em desenvolvimento!\n\nEm breve você poderá gerar e baixar o PDF do relatório.');
}

function compartilhar() {
    if (!dadosBioimpedancia) {
        alert('❌ Dados não carregados!');
        return;
    }
    
    const link = window.location.href;
    const texto = `Confira meu relatório de bioimpedância! 📊`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Relatório de Bioimpedância',
            text: texto,
            url: link
        }).catch(() => {
            copiarLink(link, texto);
        });
    } else {
        copiarLink(link, texto);
    }
}

function copiarLink(link, texto) {
    navigator.clipboard.writeText(link).then(() => {
        if (confirm('✅ Link copiado!\n\nCompartilhar no WhatsApp?')) {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(texto + '\n\n' + link)}`;
            window.open(whatsappUrl, '_blank');
        }
    });
}