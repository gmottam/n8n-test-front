const BUSCAR_BIOIMPEDANCIAS_URL = 'https://gmottam.app.n8n.cloud/webhook/buscar-bioimpedancias';

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
            circunferencias: circunfer