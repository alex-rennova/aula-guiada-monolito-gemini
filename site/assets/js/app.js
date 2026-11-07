// Aulas e Módulos do Curso
const lessons = {
    overview: {
        tag: "Visão Geral",
        title: "Por que Monólitos Modernos e não Microsserviços Prematuros?",
        desc: "Uma análise profunda de engenharia sobre a complexidade acidental, distribuição pragmática e como o .NET 10 permite construir arquiteturas altamente desacopladas dentro de um único deploy.",
        content: `
            <div class="section">
                <h3 class="section-title"><span>🎯</span> O Dilema: Monólito vs Microsserviços</h3>
                <div class="card-grid">
                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-amber">⚠️</div>
                            <h4>A Armadilha do Microsserviço Prematuro</h4>
                        </div>
                        <p>Microsserviços trazem problemas distribuídos imediatos: falhas parciais de rede, consistência eventual, custos de infraestrutura e complexidade de observabilidade que a maioria dos projetos não precisa.</p>
                    </div>
                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-green">🛡️</div>
                            <h4>Monólito Modular Pragmático</h4>
                        </div>
                        <p>Permite desenvolvimento ágil, refatoração segura garantida pelo compilador, transações ACID locais e comunicação em memória sem latência de rede — mantendo os Bounded Contexts rigorosamente isolados.</p>
                    </div>
                    <div class="info-card">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-purple">🚀</div>
                            <h4>Pronto para Distribuir se Necessário</h4>
                        </div>
                        <p>Se um módulo isolado realmente exigir escala independente no futuro, a separação se torna natural e trivial porque as fronteiras de dados e contratos já foram respeitadas desde o início.</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><span>📐</span> Arquitetura Atual da Solução</h3>
                <div class="diagram-canvas">
                    <div class="diagram-nodes">
                        <div class="diagram-node">
                            <div class="diagram-node-info">
                                <h5>Api (Presentation Layer)</h5>
                                <span>Controllers HTTP, Swagger/OpenAPI, Composition Root limpo</span>
                            </div>
                            <span class="status-pill">Ponto de Entrada</span>
                        </div>
                        <div class="diagram-arrow">↓ consome</div>
                        <div class="diagram-node active-focus">
                            <div class="diagram-node-info">
                                <h5>Application Layer</h5>
                                <span>DTOs, Interfaces de Serviço, Casos de Uso, Injeção Autônoma</span>
                            </div>
                            <span class="status-pill" style="border-color: #6366f1; color: #a5b4fc; background: rgba(99,102,241,0.1)">Orquestrador</span>
                        </div>
                        <div class="diagram-arrow">↓ orquestra e persiste</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="diagram-node">
                                <div class="diagram-node-info">
                                    <h5>Domain Layer</h5>
                                    <span>Entidades (Product), Value Objects (Money), Interfaces de Repositório</span>
                                </div>
                            </div>
                            <div class="diagram-node">
                                <div class="diagram-node-info">
                                    <h5>Infrastructure Layer</h5>
                                    <span>EF Core, AppDbContext (PostgreSQL / Npgsql), Implementações de Repositório</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    aula01: {
        tag: "Aula 01 • Concluída",
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
                        <p>O arquivo <code>Program.cs</code> não deve conhecer classes concretas de serviços (como <code>ProductService</code>). Ele só precisa saber que a camada de aplicação existe e deve ser registrada.</p>
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
                        <p>Conforme novos módulos (ex.: <code>Orders</code>, <code>Inventory</code>) forem criados, basta encadear <code>.AddOrders()</code> e <code>.AddInventory()</code>, sem criar arquivos gigantescos.</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><span>⚖️</span> Comparativo: Antes vs Depois</h3>
                <div class="comparison-container">
                    <div class="code-box">
                        <div class="code-header">
                            <span>Program.cs (Antes)</span>
                            <span class="code-badge-bad">Acoplado & Poluído</span>
                        </div>
                        <pre><code>// A API precisava conhecer a classe concreta!
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Application.Services;
using aula_guiada_monolito_gemini.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Repetido para dezenas de serviços:
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped&lt;IProductService, ProductService&gt;();

var app = builder.Build();</code></pre>
                    </div>

                    <div class="code-box">
                        <div class="code-header">
                            <span>Program.cs (Depois)</span>
                            <span class="code-badge-good">Clean Composition Root</span>
                        </div>
                        <pre><code>// A API só conhece os pontos de extensão de alto nível!
using aula_guiada_monolito_gemini.Application;
using aula_guiada_monolito_gemini.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Registro declarativo e elegante:
builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

var app = builder.Build();</code></pre>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><span>📂</span> Onde Está o Código no Projeto?</h3>
                <div class="file-inspector">
                    <div class="file-row">
                        <div class="file-path">
                            <span>📄</span>
                            <span>src/aula-guiada-monolito-gemini.Application/DependencyInjection.cs</span>
                        </div>
                        <span class="file-role">Extensão AddApplication() que registra os serviços internos</span>
                    </div>
                    <div class="file-row">
                        <div class="file-path">
                            <span>📄</span>
                            <span>src/aula-guiada-monolito-gemini.Application/aula-guiada-monolito-gemini.Application.csproj</span>
                        </div>
                        <span class="file-role">Inclusão de Microsoft.Extensions.DependencyInjection.Abstractions</span>
                    </div>
                    <div class="file-row">
                        <div class="file-path">
                            <span>📄</span>
                            <span>src/aula-guiada-monolito-gemini.Api/Program.cs</span>
                        </div>
                        <span class="file-role">Ponto de composição limpo chamando .AddApplication()</span>
                    </div>
                </div>
            </div>
        `
    },
    aula02: {
        tag: "Aula 02 • Próximo Passo",
        title: "Modelagem de Domínio & Result Pattern",
        desc: "Como eliminar o uso nocivo de exceções para regras de negócio e conectar Value Objects reais aos modelos.",
        content: `
            <div class="section">
                <div class="info-card" style="border-left: 4px solid var(--accent);">
                    <div class="info-card-header">
                        <div class="info-card-icon icon-blue">🎯</div>
                        <h4>Próxima Aula: O Fim das Exceções de Fluxo</h4>
                    </div>
                    <p>Nas próximas etapas conectaremos o Value Object <code>Money</code> na entidade <code>Product</code> e implementaremos o <strong>Result Pattern</strong>, garantindo que retornos de validação e sucesso sejam previsíveis, rápidos e fáceis de documentar na API.</p>
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
}

// Inicialização e listeners de clique
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-item").forEach(button => {
        button.addEventListener("click", (e) => {
            const key = button.getAttribute("data-lesson");
            renderLesson(key);
        });
    });

    // Renderiza a visão geral por padrão
    renderLesson("overview");
});

