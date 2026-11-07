// Aulas e Módulos do Curso
const lessons = {
    overview: {
        tag: "Arquitetura de Referência",
        title: "Banco Digital: Do Monólito Modular aos Microsserviços",
        desc: "Uma simulação real de uma instituição financeira completa (Clientes, Contas, Pagamentos, Seguros e Investimentos) operando em um monólito coeso no PostgreSQL, mas projetado para ser decomposto sem dor.",
        content: `
            <div class="section">
                <h3 class="section-title"><span>🏦</span> O Desafio: Construir Hoje para Evoluir Amanhã</h3>
                <div class="card-grid">
                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-blue">🌐</div>
                            <h4>Canais de Entrada Unificados</h4>
                        </div>
                        <p>O Banco atende canais diversos: <strong>Mobile Banking</strong>, <strong>Internet Banking</strong>, <strong>PIX Gateway</strong> e <strong>Open Finance API</strong>. Todos batem no mesmo ponto de entrada sem a sobrecarga inicial de 10 gateways diferentes.</p>
                    </div>
                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-green">🏛️</div>
                            <h4>Monólito Hoje: Deploy Único</h4>
                        </div>
                        <p>Clientes, contas, movimentações, pagamentos, seguros e investimentos são publicados juntos. Transações ACID garantidas, sem lock distribuído, sem orquestração de sagas complexas prematuras.</p>
                    </div>
                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-purple">✂️</div>
                            <h4>Microsserviços Amanhã: Limites Rígidos</h4>
                        </div>
                        <p>Cada contexto possui suas próprias entidades, tabelas no PostgreSQL e regras. Se a área de <em>Pagamentos (PIX)</em> precisar de escala independente no futuro, a separação para seu próprio serviço é imediata.</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><span>📐</span> Visão Arquitetural: Canais, Domínios & PostgreSQL</h3>
                <div class="diagram-canvas">
                    <div class="diagram-nodes">
                        <!-- Canais -->
                        <div class="diagram-node" style="border-color: #60a5fa;">
                            <div class="diagram-node-info">
                                <h5>Canais do Banco (Clientes & Parceiros)</h5>
                                <span>Mobile App • Internet Banking Web • Gateway PIX • Open Finance API</span>
                            </div>
                            <span class="status-pill" style="border-color: #3b82f6; color: #93c5fd; background: rgba(59,130,246,0.1)">Entrada</span>
                        </div>
                        <div class="diagram-arrow">↓ HTTPS / JSON</div>

                        <!-- Monólito Central -->
                        <div class="diagram-node active-focus">
                            <div class="diagram-node-info">
                                <h5>Core Bancário Monolítico (.NET 10 Web API)</h5>
                                <span>Publicação conjunta com isolamento lógico de Bounded Contexts</span>
                            </div>
                            <span class="status-pill" style="border-color: #6366f1; color: #a5b4fc; background: rgba(99,102,241,0.1)">Monólito</span>
                        </div>
                        <div class="diagram-arrow">↓ 6 Áreas de Negócio Independentes</div>

                        <!-- 6 Áreas de Negócio -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; width: 100%;">
                            <div class="diagram-node" style="padding: 12px;">
                                <div class="diagram-node-info">
                                    <h5>👤 Clientes</h5>
                                    <span>Situação cadastral & CPF</span>
                                </div>
                            </div>
                            <div class="diagram-node" style="padding: 12px;">
                                <div class="diagram-node-info">
                                    <h5>💳 Contas</h5>
                                    <span>Titulares & ciclo de vida</span>
                                </div>
                            </div>
                            <div class="diagram-node" style="padding: 12px;">
                                <div class="diagram-node-info">
                                    <h5>📊 Movimentação</h5>
                                    <span>Lançamentos & extrato</span>
                                </div>
                            </div>
                            <div class="diagram-node" style="padding: 12px;">
                                <div class="diagram-node-info">
                                    <h5>⚡ Pagamentos</h5>
                                    <span>PIX, boletos & estados</span>
                                </div>
                            </div>
                            <div class="diagram-node" style="padding: 12px;">
                                <div class="diagram-node-info">
                                    <h5>🛡️ Seguros</h5>
                                    <span>Propostas & apólices</span>
                                </div>
                            </div>
                            <div class="diagram-node" style="padding: 12px;">
                                <div class="diagram-node-info">
                                    <h5>📈 Investimentos</h5>
                                    <span>CDB, Tesouro & resgates</span>
                                </div>
                            </div>
                        </div>

                        <div class="diagram-arrow">↓ Persistência Unificada</div>

                        <!-- PostgreSQL -->
                        <div class="diagram-node" style="border-color: #34d399;">
                            <div class="diagram-node-info">
                                <h5>PostgreSQL Database</h5>
                                <span>Tabelas isoladas: clientes, contas, lancamentos_financeiros, operacoes_pagamento, propostas_seguro, posicoes_investimento</span>
                            </div>
                            <span class="status-pill">Persistência</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><span>📋</span> Matriz dos 6 Bounded Contexts Bancários</h3>
                <div class="card-grid">
                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-blue">👤</div>
                            <h4>1. Clientes</h4>
                        </div>
                        <p><strong>Responsabilidade:</strong> Identificação, validação de CPF e situação cadastral (EmAnálise, Ativo, Bloqueado, Encerrado).<br><strong>Entidade:</strong> <code>Cliente</code>, VO <code>Cpf</code>.</p>
                    </div>

                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-green">💳</div>
                            <h4>2. Contas</h4>
                        </div>
                        <p><strong>Responsabilidade:</strong> Agências, titulares e ciclo de vida da conta corrente/digital.<br><strong>Entidade:</strong> <code>Conta</code>, Enum <code>StatusConta</code>.</p>
                    </div>

                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-amber">📊</div>
                            <h4>3. Movimentação Financeira</h4>
                        </div>
                        <p><strong>Responsabilidade:</strong> Lançamentos a débito e crédito, reservas de saldo e extratos contábeis.<br><strong>Entidade:</strong> <code>LancamentoFinanceiro</code>, Enum <code>TipoLancamento</code>.</p>
                    </div>

                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-purple">⚡</div>
                            <h4>4. Pagamentos</h4>
                        </div>
                        <p><strong>Responsabilidade:</strong> Liquidação de PIX e boletos, agendamentos e máquinas de estado.<br><strong>Entidade:</strong> <code>OperacaoPagamento</code>, Enum <code>StatusOperacao</code>.</p>
                    </div>

                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-blue">🛡️</div>
                            <h4>5. Seguros</h4>
                        </div>
                        <p><strong>Responsabilidade:</strong> Propostas comerciais, prêmio mensal, capital segurado e apólices.<br><strong>Entidade:</strong> <code>PropostaSeguro</code>, Enum <code>StatusApolice</code>.</p>
                    </div>

                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-green">📈</div>
                            <h4>6. Investimentos</h4>
                        </div>
                        <p><strong>Responsabilidade:</strong> Aplicações em Renda Fixa (CDB/Tesouro), custódia de posições e resgates parciais.<br><strong>Entidade:</strong> <code>PosicaoInvestimento</code>, Enum <code>TipoPosicao</code>.</p>
                    </div>
                </div>
            </div>
        `
    },
    aula01: {
        tag: "Fundamentos • Concluída",
        title: "Clean Dependency Injection & Desacoplamento do Program.cs",
        desc: "Como eliminar o Composition Root inflado e garantir que cada camada da aplicação seja a única responsável por registrar suas dependências internas.",
        content: `
            <div class="section">
                <h3 class="section-title"><span>💡</span> O que Aprendemos e Por Que Foi Feito?</h3>
                <div class="card-grid">
                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-blue">📦</div>
                            <h4>Ocultação de Informação (Information Hiding)</h4>
                        </div>
                        <p>O arquivo <code>Program.cs</code> não deve conhecer classes concretas de serviços. Ele só precisa saber que a camada de aplicação existe e deve ser registrada.</p>
                    </div>
                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-green">⚡</div>
                            <h4>Microsoft.Extensions.DependencyInjection.Abstractions</h4>
                        </div>
                        <p>Utilizamos apenas o pacote de <strong>Abstractions</strong> na camada <code>Application</code>. Isso evita puxar todo o runtime de DI para dentro do núcleo da aplicação, mantendo-a limpa e leve.</p>
                    </div>
                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-purple">🧩</div>
                            <h4>Modularidade Escalável</h4>
                        </div>
                        <p>Conforme novos módulos forem criados, basta encadear <code>.AddApplication()</code>, <code>.AddInfrastructure()</code>, sem criar arquivos gigantescos.</p>
                    </div>
                </div>
            </div>
        `
    },
    aula02: {
        tag: "Domínio Bancário • Concluída",
        title: "Modelagem Rica do Banco Digital & Result Pattern",
        desc: "Modelagem das 6 áreas de negócio do banco sem exceções de fluxo, com Value Objects (Cpf, Money) e persistência mapeada no PostgreSQL.",
        content: `
            <div class="section">
                <h3 class="section-title"><span>💡</span> As 6 Entidades do Banco Digital</h3>
                <div class="file-inspector">
                    <div class="file-row">
                        <div class="file-path">
                            <span>👤</span>
                            <span>src/aula-guiada-monolito-gemini.Domain/Entities/Cliente.cs</span>
                        </div>
                        <span class="file-role">Cliente, CPF validado, Situação Cadastral (Ativo/Bloqueado)</span>
                    </div>
                    <div class="file-row">
                        <div class="file-path">
                            <span>💳</span>
                            <span>src/aula-guiada-monolito-gemini.Domain/Entities/Conta.cs</span>
                        </div>
                        <span class="file-role">Conta bancária, agência, titular e ciclo de vida</span>
                    </div>
                    <div class="file-row">
                        <div class="file-path">
                            <span>📊</span>
                            <span>src/aula-guiada-monolito-gemini.Domain/Entities/LancamentoFinanceiro.cs</span>
                        </div>
                        <span class="file-role">Lançamentos de débito, crédito, reservas e extrato</span>
                    </div>
                    <div class="file-row">
                        <div class="file-path">
                            <span>⚡</span>
                            <span>src/aula-guiada-monolito-gemini.Domain/Entities/OperacaoPagamento.cs</span>
                        </div>
                        <span class="file-role">Agendamento, liquidação e estados de operações PIX/Boleto</span>
                    </div>
                    <div class="file-row">
                        <div class="file-path">
                            <span>🛡️</span>
                            <span>src/aula-guiada-monolito-gemini.Domain/Entities/PropostaSeguro.cs</span>
                        </div>
                        <span class="file-role">Proposta de seguro, prêmio mensal, apólice emitida</span>
                    </div>
                    <div class="file-row">
                        <div class="file-path">
                            <span>📈</span>
                            <span>src/aula-guiada-monolito-gemini.Domain/Entities/PosicaoInvestimento.cs</span>
                        </div>
                        <span class="file-role">Aplicações, custódia de CDB/Tesouro e regras de resgate</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><span>🗄️</span> Mapeamento no EF Core (AppDbContext.cs)</h3>
                <div class="code-box">
                    <div class="code-header">
                        <span>AppDbContext.cs (Tabelas Isoladas para Facilidade de Migração Futura)</span>
                        <span class="code-badge-good">PostgreSQL Ready</span>
                    </div>
                    <pre><code>// Cada contexto possui sua tabela e conversão transparente:
modelBuilder.Entity&lt;Cliente&gt;(e => {
    e.ToTable("clientes");
    e.Property(x => x.Cpf).HasConversion(c => c.Value, val => Cpf.Create(val).Value);
});

modelBuilder.Entity&lt;Conta&gt;(e => e.ToTable("contas"));
modelBuilder.Entity&lt;LancamentoFinanceiro&gt;(e => e.ToTable("lancamentos_financeiros"));
modelBuilder.Entity&lt;OperacaoPagamento&gt;(e => e.ToTable("operacoes_pagamento"));
modelBuilder.Entity&lt;PropostaSeguro&gt;(e => e.ToTable("propostas_seguro"));
modelBuilder.Entity&lt;PosicaoInvestimento&gt;(e => e.ToTable("posicoes_investimento"));</code></pre>
                </div>
            </div>
        `
    },
    aula03: {
        tag: "Aula 03 • Próximo Passo",
        title: "Casos de Uso Bancários & FluentValidation",
        desc: "Construção dos fluxos completos de aplicação: abertura de conta, transferência/PIX e validações declarativas.",
        content: `
            <div class="section">
                <div class="info-card" style="border-left: 4px solid var(--accent);">
                    <div class="info-card-header">
                        <div class="info-card-icon icon-blue">🎯</div>
                        <h4>Próxima Aula: Casos de Uso do Banco</h4>
                    </div>
                    <p>Na Aula 03 criaremos os serviços de aplicação e validadores para operações bancárias reais: abertura de conta com validação de CPF, agendamento de pagamento PIX e simulação de resgate de investimento.</p>
                </div>
            </div>
        `
    }
};

function renderLesson(key) {
    const lesson = lessons[key];
    if (!lesson) return;

    // Atualiza links ativos
    document.querySelectorAll(".nav-item").forEach(item => {
        if (item.getAttribute("data-lesson") === key) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Atualiza o conteúdo da página
    document.getElementById("breadcrumb-current").innerText = lesson.title;
    document.getElementById("hero-tag").innerText = lesson.tag;
    document.getElementById("hero-title").innerText = lesson.title;
    document.getElementById("hero-desc").innerText = lesson.desc;
    document.getElementById("lesson-body").innerHTML = lesson.content;

    // Rola o container para o topo suavemente
    document.querySelector(".main-wrapper").scrollTop = 0;

    // Fecha a sidebar no mobile ao clicar em um item
    closeSidebar();
}

// Funções de controle do Drawer Mobile
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");

function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
}

function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
}

// Inicialização e listeners de clique
document.addEventListener("DOMContentLoaded", () => {
    // Menu mobile toggle
    const toggleBtn = document.getElementById("menu-toggle-btn");
    const closeBtn = document.getElementById("close-sidebar-btn");

    if (toggleBtn) toggleBtn.addEventListener("click", openSidebar);
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
    if (overlay) overlay.addEventListener("click", closeSidebar);

    // Navegação entre aulas
    document.querySelectorAll(".nav-item").forEach(button => {
        button.addEventListener("click", () => {
            const key = button.getAttribute("data-lesson");
            renderLesson(key);
        });
    });

    // Renderiza a visão geral do banco por padrão
    renderLesson("overview");
});
