const BIOIMPEDANCIA_URL = 'https://gmottam.app.n8n.cloud/webhook-test/gerar-bioimpedancia';

let clerk;
let currentUser = null;

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
        } else {
            console.log('ℹ️ Nenhum usuário logado');
            alert('Faça login primeiro!');
            window.location.href = '/';
        }

        setupEventListeners();

    } catch (error) {
        console.error('❌ Erro:', error);
    }
});

function setupEventListeners() {
    document.getElementById('bioimpedanciaForm')?.addEventListener('submit', handleBioimpedanciaSubmit);
}

async function handleBioimpedanciaSubmit(e) {
    e.preventDefault();

    if (!currentUser) {
        alert('Você precisa estar logado!');
        return;
    }

    // Dados Pessoais
    const dadosPessoais = {
        nome: document.getElementById('bio-nome').value,
        idade: parseInt(document.getElementById('bio-idade').value),
        peso: parseFloat(document.getElementById('bio-peso').value),
        altura: parseInt(document.getElementById('bio-altura').value),
        sexo: document.querySelector('input[name="bio-sexo"]:checked').value
    };

    // Bioimpedância
    const bioimpedancia = {
        percentual_gordura: parseFloat(document.getElementById('bio-gordura').value),
        massa_magra: parseFloat(document.getElementById('bio-massa-magra').value),
        massa_gorda: parseFloat(document.getElementById('bio-massa-gorda').value),
        agua_corporal: parseFloat(document.getElementById('bio-agua-corporal').value),
        massa_muscular: parseFloat(document.getElementById('bio-massa-muscular').value),
        massa_ossea: parseFloat(document.getElementById('bio-massa-ossea').value),
        metabolismo_basal: parseInt(document.getElementById('bio-metabolismo-basal').value),
        gordura_visceral: parseInt(document.getElementById('bio-gordura-visceral').value),
        idade_metabolica: parseInt(document.getElementById('bio-idade-metabolica').value),
        proteina: parseFloat(document.getElementById('bio-proteina').value)
    };

    // Circunferências
    const circunferencias = {
        pescoco: parseFloat(document.getElementById('circ-pescoco').value),
        ombros: parseFloat(document.getElementById('circ-ombros').value),
        torax: parseFloat(document.getElementById('circ-torax').value),
        cintura: parseFloat(document.getElementById('circ-cintura').value),
        abdomen: parseFloat(document.getElementById('circ-abdomen').value),
        quadril: parseFloat(document.getElementById('circ-quadril').value),
        biceps_direito: parseFloat(document.getElementById('circ-biceps-direito').value),
        biceps_esquerdo: parseFloat(document.getElementById('circ-biceps-esquerdo').value),
        antebraco_direito: parseFloat(document.getElementById('circ-antebraco-direito').value),
        antebraco_esquerdo: parseFloat(document.getElementById('circ-antebraco-esquerdo').value),
        coxa_direita: parseFloat(document.getElementById('circ-coxa-direita').value),
        coxa_esquerda: parseFloat(document.getElementById('circ-coxa-esquerda').value),
        panturrilha_direita: parseFloat(document.getElementById('circ-panturrilha-direita').value),
        panturrilha_esquerda: parseFloat(document.getElementById('circ-panturrilha-esquerda').value)
    };

    // Dobras Cutâneas
    const dobrasCutaneas = {
        triceps: parseFloat(document.getElementById('dobra-triceps').value),
        subescapular: parseFloat(document.getElementById('dobra-subescapular').value),
        peitoral: parseFloat(document.getElementById('dobra-peitoral').value),
        axilar_media: parseFloat(document.getElementById('dobra-axilar-media').value),
        supra_iliaca: parseFloat(document.getElementById('dobra-supra-iliaca').value),
        abdominal: parseFloat(document.getElementById('dobra-abdominal').value),
        coxa: parseFloat(document.getElementById('dobra-coxa').value)
    };

    // Montar o payload final exatamente como você envia
    const formData = {
        user_id: currentUser.id,
        user_email: currentUser.emailAddresses[0].emailAddress,
        dados_pessoais: dadosPessoais,
        bioimpedancia: bioimpedancia,
        circunferencias: circunferencias,
        dobras_cutaneas: dobrasCutaneas
    };

    showBioLoading();

    try {
        console.log('📤 Enviando análise de bioimpedância:', JSON.stringify(formData, null, 2));

        const response = await fetch(BIOIMPEDANCIA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Resposta recebida:', data);

        // Aguardar um pouco para garantir que o dados foi salvo
        setTimeout(() => {
            const linkRelatorio = `relatorio-bioimpedancia.html?id=${data.id_avaliacao}`;
            window.location.href = linkRelatorio;
        }, 1500);

    } catch (error) {
        console.error('❌ Erro:', error);
        showBioError(`❌ Erro ao processar análise: ${error.message}`);
        document.getElementById('formCard').style.display = 'block';
    } finally {
        hideBioLoading();
    }
}

function showBioLoading() {
    document.getElementById('formCard').style.display = 'none';
    document.getElementById('bioLoading').classList.add('active');
    document.getElementById('bioError').classList.remove('active');
}

function hideBioLoading() {
    document.getElementById('bioLoading').classList.remove('active');
}

function showBioError(message) {
    document.getElementById('bioError').textContent = message;
    document.getElementById('bioError').classList.add('active');
}