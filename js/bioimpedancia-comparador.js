const BUSCAR_BIOIMPEDANCIAS_URL = `/api/n8n-proxy?url=${encodeURIComponent('https://gmottam.app.n8n.cloud/webhook/buscar-bioimpedancias')}`;

let clerk;
let currentUser = null;
let avaliacoes = [];

window.addEventListener('load', async () => {
    clerk = window.Clerk;

    if (!clerk) {
        console.error('❌ Clerk não carregou');
        return;
    }

    try {
        await clerk.load();

        if (clerk.user) {
            console.log('✅ Usuário logado:', clerk.user.id);
            currentUser = clerk.user;
            carregarAvaliacoes();
        } else {
            console.log('ℹ️ Nenhum usuário logado');
            alert('Faça login primeiro!');
            window.location.href = '/';
        }

    } catch (error) {
        console.error('❌ Erro:', error);
        showError('Erro ao inicializar autenticação');
    }
});

async function carregarAvaliacoes() {
    showLoading(true);

    try {
        console.log('📥 Buscando bioimpedâncias para user_id:', currentUser.id);

        const response = await fetch(`${BUSCAR_BIOIMPEDANCIAS_URL}?user_id=${currentUser.id}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar avaliações');
        }

        const data = await response.json();
        console.log('✅ Avaliações recebidas:', data);

        // Se for um array, usa direto; se for um objeto com registros, extrai
        avaliacoes = Array.isArray(data) ? data : (data.registros || []);

        if (avaliacoes.length < 2) {
            showError('❌ Você precisa ter pelo menos 2 avaliações para comparar');
            showLoading(false);
            return;
        }

        // Ordenar por data decrescente (mais recente primeiro)
        avaliacoes.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));

        preencherSelects();

    } catch (error) {
        console.error('❌ Erro:', error);
        showError('Erro ao carregar suas avaliações. Tente novamente.');
    } finally {
        showLoading(false);
    }
}

function preencherSelects() {
    const select1 = document.getElementById('avaliacao1');
    const select2 = document.getElementById('avaliacao2');

    select1.innerHTML = '<option value="">Selecione...</option>';
    select2.innerHTML = '<option value="">Selecione...</option>';

    avaliacoes.forEach((avaliacao, index) => {
        const data = new Date(avaliacao.data_criacao).toLocaleDateString('pt-BR');
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${avaliacao.nome} - ${data} (${avaliacao.percentual_gordura}% gordura)`;
        select1.appendChild(option);

        const option2 = option.cloneNode(true);
        select2.appendChild(option2);
    });

    // Definir padrões: anterior e atual
    if (avaliacoes.length >= 2) {
        select1.value = avaliacoes.length - 1; // Mais antiga
        select2.value = 0; // Mais recente
    }
}

function compararAvaliacoes() {
    const index1 = parseInt(document.getElementById('avaliacao1').value);
    const index2 = parseInt(document.getElementById('avaliacao2').value);

    if (isNaN(index1) || isNaN(index2)) {
        alert('❌ Selecione duas avaliações');
        return;
    }

    if (index1 === index2) {
        alert('❌ Selecione avaliações diferentes');
        return;
    }

    const anterior = avaliacoes[index1];
    const atual = avaliacoes[index2];

    // Garantir que anterior é realmente antes de atual
    const data1 = new Date(anterior.data_criacao);
    const data2 = new Date(atual.data_criacao);

    const ava1 = data1 < data2 ? anterior : atual;
    const ava2 = data1 < data2 ? atual : anterior;

    exibirComparacao(ava1, ava2);
}

function exibirComparacao(anterior, atual) {
    console.log('📊 Comparando:', anterior.nome, 'vs', atual.nome);

    // Formatar dados
    const ant = formatarBioimpedancia(anterior);
    const atu = formatarBioimpedancia(atual);

    // Comparar
    const comparacao = compararBioimpedancias(ant, atu);

    // Gerar HTML
    const html = `
        <div class="card">
            ${gerarResumoProgresso(comparacao)}
            ${gerarHTMLComparacao(comparacao)}
        </div>
    `;

    document.getElementById('resultadoComparacao').innerHTML = html;
    document.getElementById('seletorCard').style.display = 'none';
    document.getElementById('actions').style.display = 'flex';
}

function novaComparacao() {
    document.getElementById('resultadoComparacao').innerHTML = '';
    document.getElementById('seletorCard').style.display = 'block';
    document.getElementById('actions').style.display = 'none';
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
    errorEl.textContent = message;
    errorEl.classList.add('active');
}

// ============ FUNÇÕES DE FORMATAÇÃO (importadas) ============

function formatarBioimpedancia(registro) {
    const circunferencias = typeof registro.circunferencias === 'string'
        ? JSON.parse(registro.circunferencias)
        : registro.circunferencias;

    const dobrasCutaneas = typeof registro.dobras_cutaneas === 'string'
        ? JSON.parse(registro.dobras_cutaneas)
        : registro.dobras_cutaneas;

    return {
        id_avaliacao: registro.id_avaliacao,
        user_id: registro.user_id,
        paciente: {
            nome: registro.nome,
            sexo: registro.sexo,
            idade: registro.idade,
            peso: registro.peso,
            altura: registro.altura,
            imc: (registro.peso / Math.pow(registro.altura / 100, 2)).toFixed(1),
            rcq: (circunferencias.cintura / circunferencias.quadril).toFixed(2)
        },
        metricas: {
            bioimpedancia: {
                percentual_gordura: registro.percentual_gordura,
                massa_magra: registro.massa_magra,
                massa_gorda: registro.massa_gorda,
                agua_corporal: registro.agua_corporal,
                massa_muscular: registro.massa_muscular,
                massa_ossea: registro.massa_ossea,
                metabolismo_basal: registro.metabolismo_basal,
                gordura_visceral: registro.gordura_visceral,
                idade_metabolica: registro.idade_metabolica,
                proteina: registro.proteina
            },
            circunferencias: circunferencias,
            dobras_cutaneas: dobrasCutaneas
        },
        data_criacao: registro.data_criacao
    };
}

function compararBioimpedancias(anterior, atual) {
    const comparacao = {
        anterior: anterior,
        atual: atual,
        diferencas: {}
    };

    // Comparar bioimpedância
    const bioAnt = anterior.metricas.bioimpedancia;
    const bioAtu = atual.metricas.bioimpedancia;

    Object.keys(bioAnt).forEach(key => {
        const valorAnt = parseFloat(bioAnt[key]);
        const valorAtu = parseFloat(bioAtu[key]);
        const diferenca = valorAtu - valorAnt;
        
        comparacao.diferencas[key] = {
            anterior: valorAnt,
            atual: valorAtu,
            diferenca: diferenca,
            percentual: valorAnt !== 0 ? ((diferenca / valorAnt) * 100) : 0
        };
    });

    return comparacao;
}

function gerarResumoProgresso(comparacao) {
    const melhorias = [];
    const pioras = [];
    
    // Analisar principais métricas
    const gordura = comparacao.diferencas.percentual_gordura;
    const musculo = comparacao.diferencas.massa_muscular;
    const visceral = comparacao.diferencas.gordura_visceral;
    
    if (gordura.diferenca < 0) melhorias.push('Redução de gordura');
    else if (gordura.diferenca > 0) pioras.push('Aumento de gordura');
    
    if (musculo.diferenca > 0) melhorias.push('Ganho muscular');
    else if (musculo.diferenca < 0) pioras.push('Perda muscular');
    
    if (visceral.diferenca < 0) melhorias.push('Redução visceral');
    else if (visceral.diferenca > 0) pioras.push('Aumento visceral');

    return `
        <div class="comparacao-header">
            <h2>📊 Comparação de Bioimpedância</h2>
            <p>Evolução entre ${new Date(comparacao.anterior.data_criacao).toLocaleDateString('pt-BR')} e ${new Date(comparacao.atual.data_criacao).toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div class="progresso-resumo">
            <div class="resumo-item ${melhorias.length > pioras.length ? 'bom' : 'neutro'}">
                <div class="resumo-numero">${melhorias.length}</div>
                <div class="resumo-label">Melhorias</div>
            </div>
            <div class="resumo-item info">
                <div class="resumo-numero">${Math.abs(gordura.diferenca).toFixed(1)}%</div>
                <div class="resumo-label">Δ Gordura</div>
            </div>
            <div class="resumo-item ${musculo.diferenca > 0 ? 'bom' : 'neutro'}">
                <div class="resumo-numero">${musculo.diferenca > 0 ? '+' : ''}${musculo.diferenca.toFixed(1)}kg</div>
                <div class="resumo-label">Δ Músculo</div>
            </div>
        </div>
    `;
}

function gerarHTMLComparacao(comparacao) {
    const metricas = [
        { key: 'percentual_gordura', label: '% Gordura', unidade: '%' },
        { key: 'massa_muscular', label: 'Massa Muscular', unidade: 'kg' },
        { key: 'massa_magra', label: 'Massa Magra', unidade: 'kg' },
        { key: 'agua_corporal', label: '% Água', unidade: '%' },
        { key: 'gordura_visceral', label: 'Gordura Visceral', unidade: '' },
        { key: 'metabolismo_basal', label: 'TMB', unidade: 'kcal' }
    ];

    let html = '<div class="comparacao-grid">';

    metricas.forEach(metrica => {
        const dados = comparacao.diferencas[metrica.key];
        const sinal = dados.diferenca > 0 ? '+' : '';
        const cor = dados.diferenca > 0 ? (metrica.key === 'percentual_gordura' || metrica.key === 'gordura_visceral' ? 'red' : 'green') : 
                   (metrica.key === 'percentual_gordura' || metrica.key === 'gordura_visceral' ? 'green' : 'red');

        html += `
            <div class="comparacao-card">
                <div class="card-label">${metrica.label}</div>
                <div class="card-valores">
                    <div class="valor">
                        <span class="label-pequeno">Anterior</span>
                        <span class="numero">${dados.anterior}${metrica.unidade}</span>
                    </div>
                    <div class="arrow">→</div>
                    <div class="valor">
                        <span class="label-pequeno">Atual</span>
                        <span class="numero">${dados.atual}${metrica.unidade}</span>
                    </div>
                </div>
                <div class="card-resultado" style="color: ${cor}">
                    ${sinal}${dados.diferenca.toFixed(1)}${metrica.unidade} (${sinal}${dados.percentual.toFixed(1)}%)
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

window.compararAvaliacoes = compararAvaliacoes;
window.novaComparacao = novaComparacao;