const CONSULTAR_BIOIMPEDANCIA_URL = 'https://gmottam.app.n8n.cloud/webhook-test/consultar-bioimpedancia';

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
    showLoading(true);

    try {
        console.log('📥 Consultando bioimpedância:', idAvaliacao);

        const response = await fetch(`${CONSULTAR_BIOIMPEDANCIA_URL}?id=${idAvaliacao}`);

        if (!response.ok) {
            throw new Error('Erro ao carregar dados');
        }

        const data = await response.json();
        console.log('✅ Dados recebidos:', data);

        // Se for um array, pega o primeiro item
        dadosBioimpedancia = Array.isArray(data) ? data[0] : data;

        exibirBioimpedancia(dadosBioimpedancia);

    } catch (error) {
        console.error('❌ Erro:', error);
        showError('Erro ao carregar relatório. Verifique o ID e tente novamente.');
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    const loadingEl = document.getElementById('loading');
    if (show) {
        loadingEl.classList.add('active');
    } else {
        loadingEl.classList.remove('active');
    }
}

function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.querySelector('p').textContent = message;
    errorEl.classList.add('active');
}

function exibirBioimpedancia(data) {
    console.log('📊 Estrutura de dados:', data);

    // Acessar dados de paciente, metricas corretamente
    const paciente = data.paciente || {};
    const metricas = data.metricas || {};
    const bioimpedancia = metricas.bioimpedancia || {};
    let circunferencias = metricas.circunferencias || {};
    let dobrasCutaneas = metricas.dobras_cutaneas || {};

    // Parse de strings JSON se necessário
    if (typeof circunferencias === 'string') {
        circunferencias = JSON.parse(circunferencias);
    }
    if (typeof dobrasCutaneas === 'string') {
        dobrasCutaneas = JSON.parse(dobrasCutaneas);
    }

    // Calcular IMC e RCQ se não virem prontos
    const imc = paciente.imc || (data.peso / Math.pow(data.altura / 100, 2)).toFixed(1);
    const rcq = paciente.rcq || (circunferencias.cintura / circunferencias.quadril).toFixed(2);

    // Header
    document.getElementById('pacienteNome').textContent = paciente.nome || data.nome || 'N/A';
    document.getElementById('dataAvaliacao').textContent = new Date(data.data_criacao).toLocaleDateString('pt-BR');

    // Resumo
    document.getElementById('resumoTexto').textContent =
        `Análise de bioimpedância realizada para ${paciente.nome || data.nome}, ${paciente.idade} anos, ` +
        `sexo ${paciente.sexo}. IMC: ${imc} (${getClassificacaoIMC(imc)}). ` +
        `Percentual de gordura: ${bioimpedancia.percentual_gordura}%. ` +
        `Massa muscular: ${bioimpedancia.massa_muscular}kg.`;

    // Métricas principais
    document.getElementById('imc').textContent = imc;
    document.getElementById('imcStatus').textContent = getClassificacaoIMC(imc);

    document.getElementById('gordura').textContent = `${bioimpedancia.percentual_gordura}%`;
    document.getElementById('gorduraStatus').textContent = getStatusGordura(bioimpedancia.percentual_gordura, paciente.sexo);

    document.getElementById('massaMuscular').textContent = `${bioimpedancia.massa_muscular}kg`;

    document.getElementById('rcq').textContent = rcq;
    document.getElementById('rcqStatus').textContent = getRcqStatus(rcq);

    document.getElementById('gorduraVisceral').textContent = bioimpedancia.gordura_visceral;
    document.getElementById('visceralStatus').textContent = getStatusVisceral(bioimpedancia.gordura_visceral);

    document.getElementById('idadeMetabolica').textContent = `${bioimpedancia.idade_metabolica}a`;

    // Dados Pessoais
    document.getElementById('nome').textContent = paciente.nome || data.nome || 'N/A';
    document.getElementById('sexo').textContent = (paciente.sexo || '').charAt(0).toUpperCase() + (paciente.sexo || '').slice(1);
    document.getElementById('idade').textContent = `${paciente.idade} anos`;
    document.getElementById('peso').textContent = `${paciente.peso} kg`;
    document.getElementById('altura').textContent = `${paciente.altura} cm`;

    // Composição Corporal
    document.getElementById('compGordura').textContent = `${bioimpedancia.percentual_gordura}%`;
    document.getElementById('compMassaMagra').textContent = `${bioimpedancia.massa_magra} kg`;
    document.getElementById('compMassaGorda').textContent = `${bioimpedancia.massa_gorda} kg`;
    document.getElementById('compMassaMuscular').textContent = `${bioimpedancia.massa_muscular} kg`;
    document.getElementById('compMassaOssea').textContent = `${bioimpedancia.massa_ossea} kg`;
    document.getElementById('compAgua').textContent = `${bioimpedancia.agua_corporal}%`;
    document.getElementById('compGorduraVisceral').textContent = bioimpedancia.gordura_visceral;
    document.getElementById('compProteina').textContent = `${bioimpedancia.proteina}%`;
    document.getElementById('compTMB').textContent = `${bioimpedancia.metabolismo_basal} kcal`;

    // Circunferências
    document.getElementById('circPescoco').textContent = circunferencias.pescoco || 'N/A';
    document.getElementById('circOmbros').textContent = circunferencias.ombros || 'N/A';
    document.getElementById('circTorax').textContent = circunferencias.torax || 'N/A';
    document.getElementById('circCintura').textContent = circunferencias.cintura || 'N/A';
    document.getElementById('circAbdomen').textContent = circunferencias.abdomen || 'N/A';
    document.getElementById('circQuadril').textContent = circunferencias.quadril || 'N/A';
    document.getElementById('circBicepsD').textContent = circunferencias.biceps_direito || 'N/A';
    document.getElementById('circBicepsE').textContent = circunferencias.biceps_esquerdo || 'N/A';
    document.getElementById('circAntebD').textContent = circunferencias.antebraco_direito || 'N/A';
    document.getElementById('circAntebE').textContent = circunferencias.antebraco_esquerdo || 'N/A';
    document.getElementById('circCoxaD').textContent = circunferencias.coxa_direita || 'N/A';
    document.getElementById('circCoxaE').textContent = circunferencias.coxa_esquerda || 'N/A';

    // Dobras Cutâneas
    document.getElementById('dobraTriceps').textContent = dobrasCutaneas.triceps || 'N/A';
    document.getElementById('dobraSubescapular').textContent = dobrasCutaneas.subescapular || 'N/A';
    document.getElementById('dobraPeitoral').textContent = dobrasCutaneas.peitoral || 'N/A';
    document.getElementById('dobraAxilar').textContent = dobrasCutaneas.axilar_media || 'N/A';
    document.getElementById('dobraSupraIliaca').textContent = dobrasCutaneas.supra_iliaca || 'N/A';
    document.getElementById('dobraAbdominal').textContent = dobrasCutaneas.abdominal || 'N/A';
    document.getElementById('dobraCoxa').textContent = dobrasCutaneas.coxa || 'N/A';

    // Mostrar conteúdo
    document.getElementById('content').classList.add('active');
}

function getClassificacaoIMC(imc) {
    imc = parseFloat(imc);
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

function getRcqStatus(rcq) {
    rcq = parseFloat(rcq);
    if (rcq < 0.90) return 'Baixo risco';
    if (rcq < 0.95) return 'Risco moderado';
    return 'Risco alto';
}

function getStatusVisceral(visceral) {
    if (visceral <= 9) return 'Normal';
    if (visceral <= 14) return 'Atenção';
    return 'Alto';
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