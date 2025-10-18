const CONSULTAR_BIOIMPEDANCIA_URL = 'https://gmottam.app.n8n.cloud/webhook/consultar-bioimpedancia';

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

        const response = await fetch(`${CONSULTAR_BIOIMPEDANCIA_URL}?id_avaliacao=${idAvaliacao}`);
        
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
    // Parse de strings JSON se necessário
    let circunferencias = data.circunferencias;
    let dobrasCutaneas = data.dobras_cutaneas;

    if (typeof circunferencias === 'string') {
        circunferencias = JSON.parse(circunferencias);
    }
    if (typeof dobrasCutaneas === 'string') {
        dobrasCutaneas = JSON.parse(dobrasCutaneas);
    }

    // Calcular IMC e RCQ
    const imc = (data.peso / Math.pow(data.altura / 100, 2)).toFixed(1);
    const rcq = (circunferencias.cintura / circunferencias.quadril).toFixed(2);

    // Header
    document.getElementById('pacienteNome').textContent = data.nome;
    document.getElementById('dataAvaliacao').textContent = new Date(data.data_criacao).toLocaleDateString('pt-BR');

    // Resumo
    document.getElementById('resumoTexto').textContent =
        `Análise de bioimpedância realizada para ${data.nome}, ${data.idade} anos, ` +
        `sexo ${data.sexo}. IMC: ${imc} (${getClassificacaoIMC(imc)}). ` +
        `Percentual de gordura: ${data.percentual_gordura}%. ` +
        `Massa muscular: ${data.massa_muscular}kg.`;

    // Métricas principais
    document.getElementById('imc').textContent = imc;
    document.getElementById('imcStatus').textContent = getClassificacaoIMC(imc);

    document.getElementById('gordura').textContent = `${data.percentual_gordura}%`;
    document.getElementById('gorduraStatus').textContent = getStatusGordura(data.percentual_gordura, data.sexo);

    document.getElementById('massaMuscular').textContent = `${data.massa_muscular}kg`;

    document.getElementById('rcq').textContent = rcq;
    document.getElementById('rcqStatus').textContent = getRcqStatus(rcq);

    document.getElementById('gorduraVisceral').textContent = data.gordura_visceral;
    document.getElementById('visceralStatus').textContent = getStatusVisceral(data.gordura_visceral);

    document.getElementById('idadeMetabolica').textContent = `${data.idade_metabolica}a`;

    // Dados Pessoais
    document.getElementById('nome').textContent = data.nome;
    document.getElementById('sexo').textContent = data.sexo.charAt(0).toUpperCase() + data.sexo.slice(1);
    document.getElementById('idade').textContent = `${data.idade} anos`;
    document.getElementById('peso').textContent = `${data.peso} kg`;
    document.getElementById('altura').textContent = `${data.altura} cm`;

    // Composição Corporal
    document.getElementById('compGordura').textContent = `${data.percentual_gordura}%`;
    document.getElementById('compMassaMagra').textContent = `${data.massa_magra} kg`;
    document.getElementById('compMassaGorda').textContent = `${data.massa_gorda} kg`;
    document.getElementById('compMassaMuscular').textContent = `${data.massa_muscular} kg`;
    document.getElementById('compMassaOssea').textContent = `${data.massa_ossea} kg`;
    document.getElementById('compAgua').textContent = `${data.agua_corporal}%`;
    document.getElementById('compGorduraVisceral').textContent = data.gordura_visceral;
    document.getElementById('compProteina').textContent = `${data.proteina}%`;
    document.getElementById('compTMB').textContent = `${data.metabolismo_basal} kcal`;

    // Circunferências
    document.getElementById('circPescoco').textContent = circunferencias.pescoco;
    document.getElementById('circOmbros').textContent = circunferencias.ombros;
    document.getElementById('circTorax').textContent = circunferencias.torax;
    document.getElementById('circCintura').textContent = circunferencias.cintura;
    document.getElementById('circAbdomen').textContent = circunferencias.abdomen;
    document.getElementById('circQuadril').textContent = circunferencias.quadril;
    document.getElementById('circBicepsD').textContent = circunferencias.biceps_direito;
    document.getElementById('circBicepsE').textContent = circunferencias.biceps_esquerdo;
    document.getElementById('circAntebD').textContent = circunferencias.antebraco_direito;
    document.getElementById('circAntebE').textContent = circunferencias.antebraco_esquerdo;
    document.getElementById('circCoxaD').textContent = circunferencias.coxa_direita;
    document.getElementById('circCoxaE').textContent = circunferencias.coxa_esquerda;

    // Dobras Cutâneas
    document.getElementById('dobraTriceps').textContent = dobrasCutaneas.triceps;
    document.getElementById('dobraSubescapular').textContent = dobrasCutaneas.subescapular;
    document.getElementById('dobraPeitoral').textContent = dobrasCutaneas.peitoral;
    document.getElementById('dobraAxilar').textContent = dobrasCutaneas.axilar_media;
    document.getElementById('dobraSupraIliaca').textContent = dobrasCutaneas.supra_iliaca;
    document.getElementById('dobraAbdominal').textContent = dobrasCutaneas.abdominal;
    document.getElementById('dobraCoxa').textContent = dobrasCutaneas.coxa;

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