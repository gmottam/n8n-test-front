
        // ⚙️ CONFIGURE A URL DO SEU ENDPOINT GET AQUI
        const API_URL = 'https://gmottam.app.n8n.cloud/webhook-test/consultar-treino';

        // Pega o ID da URL
        const urlParams = new URLSearchParams(window.location.search);
        const idTreino = urlParams.get('id');

        if (!idTreino) {
            mostrarErro('❌ ID do treino não informado na URL');
        } else {
            buscarTreino(idTreino);
        }

        async function buscarTreino(id) {
            try {
                const response = await fetch(`${API_URL}?id_treino=${id}`);
                
                if (!response.ok) {
                    throw new Error('Treino não encontrado');
                }

                const data = await response.json();
                
                if (data.erro) {
                    throw new Error(data.erro);
                }

                exibirTreino(data);
                
            } catch (error) {
                mostrarErro(`❌ ${error.message}`);
            } finally {
                document.getElementById('loading').style.display = 'none';
            }
        }

        function exibirTreino(data) {
            const resultDiv = document.getElementById('result');
            
            let html = `
                <div class="card">
                    <div class="success-banner">
                        <h2>Treino de ${data.aluno.nome}</h2>
                        <p>Gerado em ${new Date(data.metadata.gerado_em).toLocaleDateString('pt-BR')}</p>
                    </div>

                    <div class="overview-grid">
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
                                <strong>⚠️ Cuidados:</strong>
                                ${data.observacoes_gerais.cuidados_especiais}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            data.treino.forEach(dia => {
                html += `
                    <div class="card">
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

                html += `
                        </div>
                    </div>
                `;
            });

            resultDiv.innerHTML = html;
            document.getElementById('actions').style.display = 'block';
            
            // Salvar dados para compartilhar
            window.treinoAtual = data;
        }

        function mostrarErro(mensagem) {
            const errorDiv = document.getElementById('error');
            errorDiv.innerHTML = `
                <h2>${mensagem}</h2>
                <p style="margin-top: 15px;">Verifique se o link está correto ou <a href="/">gere um novo treino</a>.</p>
            `;
            errorDiv.style.display = 'block';
        }

        function compartilhar() {
            const url = window.location.href;
            const texto = `Confira meu treino personalizado gerado por IA! 💪`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Treino Personalizado',
                    text: texto,
                    url: url
                }).catch(() => {});
            } else {
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(texto + '\n\n' + url)}`;
                window.open(whatsappUrl, '_blank');
            }
        }

        function copiarLink() {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert('✅ Link copiado! Cole onde quiser compartilhar.');
            });
        }