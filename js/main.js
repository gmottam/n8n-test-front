// Substituir esta parte do handleBioimpedanciaSubmit:

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

        // ✅ CORRIGIDO: Redirecionar para relatorio-bioimpedancia.html
        const link = `/relatorio-bioimpedancia.html?id=${data.id_avaliacao}`;
        window.location.href = link;

    } catch (error) {
        console.error('Erro:', error);
        showBioError('❌ Erro ao processar análise. Tente novamente.');
        document.getElementById('bioimpedanciaCard').style.display = 'block';
    } finally {
        hideBioLoading();
    }
}