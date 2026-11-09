// Aulas e Módulos do Curso - Guia Arquitetural Prático & Profundo
const lessons = {
    overview: {
        tag: "Arquitetura de Referência",
        title: "Banco Digital: Do Monólito Modular aos Microsserviços",
        desc: "Aprenda por que o padrão 'Monolith First' com limites estritos de DDD é a estratégia mais bem-sucedida em fintechs e grandes bancos, permitindo transações ACID hoje e decomposição cirúrgica amanhã.",
        content: `
            <div class="section">
                <h3 class="section-title"><span>🚨</span> O Cenário Real: A Armadilha dos 'Microsserviços Day 1'</h3>
                
                <div class="real-world-analogy">
                    <div class="real-world-analogy-header">
                        <span style="font-size: 1.4rem;">🏢</span>
                        <h4>Analogia do Mundo Real: A Construtora e as Paredes Drywall</h4>
                    </div>
                    <p>Imagine que você vai abrir um banco. Em vez de construir um edifício com salas divididas por <strong>paredes modulares de Drywall</strong> (que você pode mover ou derrubar com facilidade), você decide construir 6 prédios separados por avenidas movimentadas logo no primeiro dia. Agora, para um cliente abrir uma conta e pegar um cartão, ele precisa pegar um Uber de um prédio para o outro na chuva. Se houver trânsito na avenida, a operação trava.<br><br>
                    <strong>O Monólito Modular é o edifício único com divisórias de Drywall:</strong> tudo opera no mesmo prédio, com velocidade de elevador interno (memória) e um cofre centralizado (PostgreSQL ACID). Quando a agência de PIX crescer tanto que não couber mais no prédio, você apenas remove o Drywall e transfere essa vertical para seu próprio edifício autônomo sem quebrar o resto do banco.</p>
                </div>

                <div class="card-grid">
                    <div class="info-card" style="border-left: 4px solid #ef4444;">
                        <div class="info-card-header">
                            <div class="info-card-icon" style="background:#fee2e2; color:#b91c1c;">❌</div>
                            <h4>O Erro Clássico da Indústria</h4>
                        </div>
                        <p>Dividir prematuramente em 10 microsserviços gera: latência de rede em cada chamada interna, risco de falhas parciais (ex: salvou o cliente, mas o serviço de conta caiu no meio), transações distribuídas (Sagas) e custos exorbitantes de infraestrutura e observabilidade.</p>
                    </div>

                    <div class="info-card" style="border-left: 4px solid #10b981;">
                        <div class="info-card-header">
                            <div class="info-card-icon" style="background:#ecfdf5; color:#047857;">✅</div>
                            <h4>A Abordagem Sênior Aplicada</h4>
                        </div>
                        <p>Construir um <strong>Monólito Modular no .NET 10</strong>. Todos os módulos compartilham o mesmo banco PostgreSQL, mas <strong>nenhum módulo cruza Foreign Keys nem referencia tabelas alheias</strong>. As referências são puramente lógicas (ex: <code>ContaOrigemId: Guid</code>), permitindo separar o banco no futuro com esforço zero.</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><span>📐</span> Mapa de Arquitetura dos 6 Bounded Contexts</h3>
                <div class="diagram-canvas">
                    <div class="diagram-nodes">
                        <!-- Canais -->
                        <div class="diagram-node" style="border-color: #60a5fa;">
                            <div class="diagram-node-info">
                                <h5>Canais Unificados de Entrada (Clientes & Parceiros)</h5>
                                <span>Mobile Banking App • Internet Banking Web • Gateway PIX • Open Finance API</span>
                            </div>
                            <span class="status-pill" style="border-color: #3b82f6; color: #93c5fd; background: rgba(59,130,246,0.1)">Entrada</span>
                        </div>
                        <div class="diagram-arrow">↓ HTTPS / JSON (Porta de Entrada Única)</div>

                        <!-- Monólito Central -->
                        <div class="diagram-node active-focus">
                            <div class="diagram-node-info">
                                <h5>Core Bancário Monolítico (.NET 10 Web API)</h5>
                                <span>Deploy conjunto, injeção de dependências limpa e módulos isolados</span>
                            </div>
                            <span class="status-pill" style="border-color: #6366f1; color: #a5b4fc; background: rgba(99,102,241,0.1)">Monólito</span>
                        </div>
                        <div class="diagram-arrow">↓ 6 Bounded Contexts Isolados por Domínio</div>

                        <!-- 6 Áreas de Negócio -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; width: 100%;">
                            <div class="diagram-node" style="padding: 12px;">
                                <div class="diagram-node-info">
                                    <h5>👤 Clientes</h5>
                                    <span>Identificação civil & Cpf</span>
                                </div>
                            </div>
                            <div class="diagram-node" style="padding: 12px;">
                                <div class="diagram-node-info">
                                    <h5>💳 Contas</h5>
                                    <span>Titularidade & agência</span>
                                </div>
                            </div>
                            <div class="diagram-node" style="padding: 12px;">
                                <div class="diagram-node-info">
                                    <h5>📊 Movimentação</h5>
                                    <span>Lançamentos & extrato</span>
                                </div>
                            </div>
                            <div class="diagram-node" style="padding: 12px; border-color: #8b5cf6;">
                                <div class="diagram-node-info">
                                    <h5>⚡ Pagamentos (PIX)</h5>
                                    <span>Extraído p/ Microsserviço</span>
                                </div>
                            </div>
                            <div class="diagram-node" style="padding: 12px;">
                                <div class="diagram-node-info">
                                    <h5>🛡️ Seguros</h5>
                                    <span>Apólices & capitais</span>
                                </div>
                            </div>
                            <div class="diagram-node" style="padding: 12px;">
                                <div class="diagram-node-info">
                                    <h5>📈 Investimentos</h5>
                                    <span>Custódia CDB & resgate</span>
                                </div>
                            </div>
                        </div>

                        <div class="diagram-arrow">↓ Tabelas Independentes (Sem Foreign Keys Inter-Módulos)</div>

                        <!-- PostgreSQL -->
                        <div class="diagram-node" style="border-color: #34d399;">
                            <div class="diagram-node-info">
                                <h5>PostgreSQL Database</h5>
                                <span>Tabelas isoladas: clientes, contas, lancamentos_financeiros, operacoes_pagamento, propostas_seguro, posicoes_investimento</span>
                            </div>
                            <span class="status-pill" style="border-color: #10b981; color: #6ee7b7; background: rgba(16,185,129,0.1)">Persistência</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    },

    aula01: {
        tag: "Fundamentos • Concluída",
        title: "Clean Dependency Injection & Desacoplamento do Program.cs",
        desc: "Como eliminar o 'God File' Program.cs usando Information Hiding e Microsoft.Extensions.DependencyInjection.Abstractions.",
        content: `
            <div class="section">
                <h3 class="section-title"><span>🚨</span> O Problema Real: O Gargalo do Program.cs</h3>
                
                <div class="real-world-analogy">
                    <div class="real-world-analogy-header">
                        <span style="font-size: 1.4rem;">🔌</span>
                        <h4>Analogia do Mundo Real: O Plugue da Tomada vs. a Usina Hidrelétrica</h4>
                    </div>
                    <p>Quando você compra uma cafeteira, ela vem com um plugue de 3 pinos feito sob uma norma padronizada (uma <em>Abstração</em>). A cafeteira não precisa saber se a eletricidade veio de uma hidrelétrica em Itaipu, de um painel solar no telhado ou de um gerador a diesel (a <em>Implementação Concreta</em>).<br><br>
                    Se a cafeteira precisasse ser soldada diretamente nos cabos da usina de energia, para trocar de casa você precisaria de um engenheiro eletricista! <strong>O Program.cs inflado faz exatamente isso:</strong> ele amarra a porta de entrada da sua aplicação aos mínimos detalhes do banco de dados e dos repositórios. Com o <em>Clean DI</em>, o Program.cs só enxerga o plugue.</p>
                </div>

                <div class="comparison-container">
                    <div class="code-box">
                        <div class="code-header">
                            <span>❌ Como NÃO Fazer: Program.cs Acoplado e Inflado</span>
                            <span class="code-badge-bad">Anti-Pattern</span>
                        </div>
                        <pre><code>// Program.cs conhecendo TODAS as classes concretas do sistema:
using aula_guiada_monolito_gemini.Infrastructure.Repositories;
using aula_guiada_monolito_gemini.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// O Program.cs vira um funil de conflito no Git:
builder.Services.AddDbContext&lt;AppDbContext&gt;(opt =&gt; opt.UseNpgsql(...));
builder.Services.AddScoped&lt;IClienteRepository, ClienteRepository&gt;();
builder.Services.AddScoped&lt;IContaRepository, ContaRepository&gt;();
builder.Services.AddScoped&lt;IPagamentoRepository, PagamentoRepository&gt;();
builder.Services.AddScoped&lt;IInvestimentoRepository, InvestimentoRepository&gt;();
builder.Services.AddScoped&lt;CriarClienteUseCase&gt;();
// 100 linhas depois... qualquer alteração quebra o merge de outros devs!</code></pre>
                    </div>

                    <div class="code-box">
                        <div class="code-header">
                            <span>✅ Como DEVE Ser Feito: Information Hiding no Program.cs</span>
                            <span class="code-badge-good">Clean Architecture</span>
                        </div>
                        <pre><code>// Program.cs real do nosso projeto: Apenas 2 linhas de orquestração!
using aula_guiada_monolito_gemini.Application;
using aula_guiada_monolito_gemini.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

// O Program.cs sequer sabe quais repositórios ou casos de uso existem.
// Cada camada é soberana sobre suas próprias dependências internas!</code></pre>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><span>📦</span> O Que Foi Feito no Projeto (.NET 10) & Onde Fica Cada Código</h3>

                <!-- Deep Dive 1: Abstractions -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>1. Camada Application Depende Apenas de Abstrações</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.Application/aula-guiada-monolito-gemini.Application.csproj</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> Se a camada de aplicação referenciar o runtime completo do ASP.NET Core ou bibliotecas pesadas de injeção, ela perde sua portabilidade (não poderia rodar num console, fila ou AWS Lambda sem carregar excessos). Usamos apenas o pacote de interfaces:</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>Application.csproj</span><span class="code-badge-good">Abstractions Only</span></div>
                        <pre><code>&lt;ItemGroup&gt;
  &lt;PackageReference Include="Microsoft.Extensions.DependencyInjection.Abstractions" Version="10.0.3" /&gt;
&lt;/ItemGroup&gt;</code></pre>
                    </div>

                    <div class="step-by-step">
                        <div class="step-item">
                            <span class="step-number">1</span>
                            <div><strong>Como fazer via CLI:</strong> Execute no terminal <code>dotnet add src/aula-guiada-monolito-gemini.Application package Microsoft.Extensions.DependencyInjection.Abstractions</code></div>
                        </div>
                    </div>
                </div>

                <!-- Deep Dive 2: Application DependencyInjection.cs -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>2. Método de Extensão da Camada Application</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.Application/DependencyInjection.cs</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> Quem conhece os Casos de Uso e os Validadores é a própria camada Application. Logo, ela mesma oferece o método de extensão <code>AddApplication()</code> que registra tudo o que pertence a ela:</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>DependencyInjection.cs (Application)</span><span class="code-badge-good">C# 13 / .NET 10</span></div>
                        <pre><code>public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // FluentValidation: registra validadores automaticamente por Assembly Scanning
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        // Casos de Uso isolados
        services.AddScoped&lt;ICriarClienteUseCase, CriarClienteUseCase&gt;();
        services.AddScoped&lt;IAbrirContaUseCase, AbrirContaUseCase&gt;();
        services.AddScoped&lt;IAgendarPagamentoPixUseCase, AgendarPagamentoPixUseCase&gt;();
        services.AddScoped&lt;IResgatarInvestimentoUseCase, ResgatarInvestimentoUseCase&gt;();

        return services;
    }
}</code></pre>
                    </div>
                </div>

                <!-- Deep Dive 3: Infrastructure DependencyInjection.cs -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>3. Método de Extensão da Camada Infrastructure</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.Infrastructure/DependencyInjection.cs</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> Toda a infraestrutura (PostgreSQL via Npgsql, Repositórios concretos e Unit of Work) é registrada exclusivamente no <code>AddInfrastructure()</code>, recebendo a <code>IConfiguration</code> para extrair a connection string:</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>DependencyInjection.cs (Infrastructure)</span><span class="code-badge-good">EF Core 10 + Npgsql</span></div>
                        <pre><code>public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext&lt;AppDbContext&gt;(options =&gt;
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped&lt;IUnitOfWork, UnitOfWork&gt;();
        services.AddScoped&lt;IClienteRepository, ClienteRepository&gt;();
        services.AddScoped&lt;IContaRepository, ContaRepository&gt;();
        services.AddScoped&lt;IPagamentoRepository, PagamentoRepository&gt;();
        services.AddScoped&lt;IInvestimentoRepository, InvestimentoRepository&gt;();

        return services;
    }
}</code></pre>
                    </div>
                </div>
            </div>
        `
    },

    aula02: {
        tag: "Domínio Bancário • Concluída",
        title: "Modelagem Rica do Banco Digital & Result Pattern",
        desc: "Como eliminar o terrível 'Exception-driven Flow' em regras financeiras e blindar o modelo com Value Objects imutáveis.",
        content: `
            <div class="section">
                <h3 class="section-title"><span>🚨</span> O Problema Real: Exceções para Controle de Fluxo</h3>

                <div class="real-world-analogy">
                    <div class="real-world-analogy-header">
                        <span style="font-size: 1.4rem;">🚨</span>
                        <h4>Analogia do Mundo Real: O Alarme de Incêndio do Caixa Eletrônico</h4>
                    </div>
                    <p>Imagine que você vai ao caixa eletrônico sacar R$ 100, mas sua conta só tem R$ 20 de saldo. Em vez de a tela mostrar educadamente <em>'Saldo insuficiente para saque'</em>, a máquina dispara a sirene de alarme de incêndio do banco, fecha as portas blindadas e chama o corpo de bombeiros!<br><br>
                    <strong>Lançar uma Exception para saldo insuficiente é disparar o alarme de incêndio:</strong> uma exceção no .NET para o fluxo da thread, coleta o stack trace completo da memória da máquina e gera custo de CPU violento. Uma regra de negócio previsível (saldo insuficiente, CPF inválido) deve retornar um <strong>Resultado Negativo Tipado (Result Pattern)</strong>, e não uma catástrofe no sistema.</p>
                </div>

                <div class="comparison-container">
                    <div class="code-box">
                        <div class="code-header">
                            <span>❌ Como NÃO Fazer: Exception-Driven Flow</span>
                            <span class="code-badge-bad">Anti-Pattern (Lento & Imprevisível)</span>
                        </div>
                        <pre><code>public void Resgatar(decimal valor)
{
    if (valor &gt; Saldo)
        throw new Exception("Saldo insuficiente!"); // Geração de StackTrace desnecessária!
    
    Saldo -= valor;
}

// No Controller: obrigado a fazer try/catch caótico
try {
    investimento.Resgatar(req.Valor);
} catch (Exception ex) {
    return StatusCode(500, ex.Message); // O cliente recebe 500 por uma falha de saldo!
}</code></pre>
                    </div>

                    <div class="code-box">
                        <div class="code-header">
                            <span>✅ Como DEVE Ser Feito: Result Pattern & Error Tipado</span>
                            <span class="code-badge-good">Padrão Sênior (Zero Exceptions)</span>
                        </div>
                        <pre><code>// No Domínio: Retorno explícito e previsível
public Result Resgatar(decimal valorResgate)
{
    if (valorResgate &lt;= 0)
        return Result.Failure(Error.Validation("Investimento.ValorInvalido", "Valor &gt; 0"));

    if (valorResgate &gt; SaldoAtual.Amount)
        return Result.Failure(Error.Validation("Investimento.SaldoInsuficiente", "Saldo insuficiente"));

    SaldoAtual = Money.Create(SaldoAtual.Amount - valorResgate).Value;
    return Result.Success();
}</code></pre>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><span>📦</span> O Que Foi Feito no Projeto (.NET 10) & Onde Fica Cada Código</h3>

                <!-- Deep Dive 1: Result Pattern -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>1. Padrão Result&lt;T&gt; e Error</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.Domain/Common/Result.cs & Error.cs</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> Criamos uma estrutura sem nenhuma dependência de terceiros. O <code>Result</code> carrega a flag booleana <code>IsSuccess</code>, o valor tipado <code>Value</code> e o objeto <code>Error</code> com código semântico e categoria (<code>Validation</code>, <code>NotFound</code>, <code>Conflict</code>):</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>Error.cs (Domain/Common)</span><span class="code-badge-good">Domain Primitives</span></div>
                        <pre><code>public enum ErrorType { Failure, Validation, NotFound, Conflict }

public readonly record struct Error(string Code, string Description, ErrorType Type = ErrorType.Failure)
{
    public static Error Validation(string code, string desc) =&gt; new(code, desc, ErrorType.Validation);
    public static Error NotFound(string code, string desc) =&gt; new(code, desc, ErrorType.NotFound);
    public static Error Conflict(string code, string desc) =&gt; new(code, desc, ErrorType.Conflict);
}</code></pre>
                    </div>
                </div>

                <!-- Deep Dive 2: Value Object Cpf -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>2. Value Object Cpf: Imutabilidade e Blindagem</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.Domain/ValueObjects/Cpf.cs</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> Se um CPF fosse apenas uma <code>string</code>, qualquer método do sistema poderia receber acidentalmente <code>"123"</code> ou <code>""</code>. Com o Value Object, é <strong>matematicamente impossível</strong> instanciar um CPF inválido na memória da aplicação:</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>Cpf.cs (Value Object com Algoritmo Verificador)</span><span class="code-badge-good">DDD</span></div>
                        <pre><code>public sealed record Cpf
{
    public string Value { get; }

    private Cpf(string value) =&gt; Value = value;

    public static Result&lt;Cpf&gt; Create(string raw)
    {
        var digitos = new string(raw.Where(char.IsDigit).ToArray());
        if (digitos.Length != 11 || digitos.Distinct().Count() == 1)
            return Result.Failure&lt;Cpf&gt;(Error.Validation("Cpf.Invalido", "CPF deve ter 11 dígitos válidos."));

        // Validação algorítmica dos 2 dígitos verificadores (BACEN / Receita Federal)
        if (!ValidarDigitosVerificadores(digitos))
            return Result.Failure&lt;Cpf&gt;(Error.Validation("Cpf.DigitoInvalido", "Dígito verificador do CPF inválido."));

        return Result.Success(new Cpf(digitos));
    }
}</code></pre>
                    </div>
                </div>

                <!-- Deep Dive 3: EF Core Mapping -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>3. Mapeamento Transparente no EF Core (HasConversion)</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.Infrastructure/Data/AppDbContext.cs</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> No banco PostgreSQL, o CPF deve ser salvo como <code>VARCHAR(11)</code> puro, mas no C# queremos o tipo rico <code>Cpf</code>. O EF Core faz a conversão automática na ida e na volta sem sujar o domínio:</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>AppDbContext.cs (Mapeamento Relacional)</span><span class="code-badge-good">Value Conversion</span></div>
                        <pre><code>modelBuilder.Entity&lt;Cliente&gt;(entity =&gt;
{
    entity.ToTable("clientes");
    entity.HasKey(x =&gt; x.Id);
    entity.Property(x =&gt; x.Cpf)
        .HasConversion(cpf =&gt; cpf.Value, val =&gt; Cpf.Create(val).Value)
        .HasMaxLength(11)
        .IsRequired();
    entity.HasIndex(x =&gt; x.Cpf).IsUnique();
});</code></pre>
                    </div>
                </div>
            </div>
        `
    },

    aula03: {
        tag: "Casos de Uso • Concluída",
        title: "Casos de Uso Bancários & FluentValidation Declarativo",
        desc: "Construção da camada Application com Use Cases atômicos, regras de validação desacopladas e persistência via Unit of Work.",
        content: `
            <div class="section">
                <h3 class="section-title"><span>🚨</span> O Problema Real: Onde Colocar as Validações?</h3>

                <div class="real-world-analogy">
                    <div class="real-world-analogy-header">
                        <span style="font-size: 1.4rem;">🛂</span>
                        <h4>Analogia do Mundo Real: A Imigração no Aeroporto vs. O Médico Cirurgião</h4>
                    </div>
                    <p>Quando você viaja para o exterior, a <strong>Polícia Federal / Imigração</strong> (o <em>FluentValidation</em>) confere se o seu passaporte está preenchido, se tem foto e se a data de validade não expirou. Eles validam o <strong>formato do documento na borda</strong>.<br><br>
                    Eles não abrem seu peito para ver se o seu coração está batendo direito. Quem faz isso é o <strong>Médico Cirurgião</strong> (a <em>Entidade de Domínio</em>), que valida regras vitais complexas.<br><br>
                    <strong>Misturar tudo é o erro clássico:</strong> se a Entidade tiver que conferir se uma string tem arroba ou se um campo veio em branco no JSON, ela fica cheia de código lixo de infraestrutura. Cada guarda cuida da sua fronteira!</p>
                </div>

                <div class="comparison-container">
                    <div class="code-box">
                        <div class="code-header">
                            <span>❌ Como NÃO Fazer: Validação Manual Dentro do Controller</span>
                            <span class="code-badge-bad">Código Duplicado & Frágil</span>
                        </div>
                        <pre><code>[HttpPost]
public async Task&lt;IActionResult&gt; Criar([FromBody] CriarClienteRequest req)
{
    if (string.IsNullOrWhiteSpace(req.Nome))
        return BadRequest("Nome obrigatório");
    if (req.Cpf.Length != 11)
        return BadRequest("CPF deve ter 11 dígitos");
    if (!req.Email.Contains("@"))
        return BadRequest("Email inválido");

    // E se outro canal (Worker, gRPC) precisar criar cliente?
    // Você terá que copiar e colar esses 15 ifs em todo lugar!
}</code></pre>
                    </div>

                    <div class="code-box">
                        <div class="code-header">
                            <span>✅ Como DEVE Ser Feito: Validação Declarativa com FluentValidation</span>
                            <span class="code-badge-good">Reutilizável em Qualquer Canal</span>
                        </div>
                        <pre><code>public sealed class CriarClienteRequestValidator : AbstractValidator&lt;CriarClienteRequest&gt;
{
    public CriarClienteRequestValidator()
    {
        RuleFor(x =&gt; x.Nome).NotEmpty().MinimumLength(3).MaximumLength(150);
        RuleFor(x =&gt; x.Email).NotEmpty().EmailAddress();
        RuleFor(x =&gt; x.Cpf).NotEmpty().Matches(@"^\\d{11}$");
    }
}
// Pode ser executado em APIs, WebSockets, filas do RabbitMQ ou gRPC!</code></pre>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><span>📦</span> O Que Foi Feito no Projeto (.NET 10) & Onde Fica Cada Código</h3>

                <!-- Deep Dive 1: FluentValidation Setup -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>1. Configuração do Pacote FluentValidation no .NET 10</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.Application/aula-guiada-monolito-gemini.Application.csproj</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> Instalamos o pacote oficial <code>FluentValidation.DependencyInjectionExtensions</code> versão 12. Ele provê injeção de dependência e escaneamento automático de todos os validadores da camada Application:</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>Application.csproj</span><span class="code-badge-good">NuGet 12.2</span></div>
                        <pre><code>&lt;ItemGroup&gt;
  &lt;PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="12.2.0" /&gt;
&lt;/ItemGroup&gt;</code></pre>
                    </div>

                    <div class="step-by-step">
                        <div class="step-item">
                            <span class="step-number">1</span>
                            <div><strong>Instalação via CLI:</strong> <code>dotnet add src/aula-guiada-monolito-gemini.Application package FluentValidation.DependencyInjectionExtensions</code></div>
                        </div>
                        <div class="step-item">
                            <span class="step-number">2</span>
                            <div><strong>Auto-registro no DependencyInjection.cs:</strong> <code>services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);</code></div>
                        </div>
                    </div>
                </div>

                <!-- Deep Dive 2: CriarClienteUseCase -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>2. Orquestração Atômica com Caso de Uso & Unit of Work</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.Application/UseCases/CriarClienteUseCase.cs</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> O Caso de Uso é a única autoridade que coordena: (1) Validação da entrada &rarr; (2) Checagem de regras relacionais no banco &rarr; (3) Criação da entidade &rarr; (4) Commit atômico &rarr; (5) Devolução do DTO imutável:</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>CriarClienteUseCase.cs</span><span class="code-badge-good">Application Layer</span></div>
                        <pre><code>public async Task&lt;Result&lt;ClienteDto&gt;&gt; ExecutarAsync(CriarClienteRequest request, CancellationToken ct)
{
    // Passo 1: Validar formato do payload com FluentValidation
    var validationResult = await _validator.ValidateAsync(request, ct);
    if (!validationResult.IsValid)
        return Result.Failure&lt;ClienteDto&gt;(Error.Validation(validationResult.Errors[0].ErrorCode, validationResult.Errors[0].ErrorMessage));

    // Passo 2: Validar regra de negócio no banco (CPF duplicado)
    if (await _clienteRepository.ExisteCpfAsync(request.Cpf, ct))
        return Result.Failure&lt;ClienteDto&gt;(Error.Conflict("Cliente.CpfExistente", "CPF já cadastrado no banco."));

    // Passo 3: Criar a Entidade de Domínio Rica
    var clienteResult = Cliente.Criar(request.Nome, request.Email, request.Cpf);
    if (clienteResult.IsFailure) return Result.Failure&lt;ClienteDto&gt;(clienteResult.Error);

    // Passo 4: Salvar e persistir via Unit of Work
    await _clienteRepository.AdicionarAsync(clienteResult.Value, ct);
    await _unitOfWork.CommitAsync(ct);

    // Passo 5: Retornar DTO blindado
    return Result.Success(new ClienteDto(
        clienteResult.Value.Id,
        clienteResult.Value.Nome,
        clienteResult.Value.Email,
        clienteResult.Value.Cpf.Value,
        clienteResult.Value.Situacao,
        clienteResult.Value.CriadoEm));
}</code></pre>
                    </div>
                </div>

                <!-- Deep Dive 3: ResultExtensions -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>3. Mapeamento Automático para HTTP (ResultExtensions)</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.Api/Common/ResultExtensions.cs</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> No Controller, você nunca precisará escrever <code>if (sucesso) return Ok() else if ...</code>. O método de extensão converte o tipo do erro do Result diretamente no status code correto do protocolo HTTP:</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>ResultExtensions.cs (Api Layer)</span><span class="code-badge-good">Zero Boilerplate</span></div>
                        <pre><code>public static ActionResult ToActionResult&lt;T&gt;(this Result&lt;T&gt; result)
{
    if (result.IsSuccess)
        return new OkObjectResult(result.Value);

    return result.Error.Type switch
    {
        ErrorType.Validation =&gt; new BadRequestObjectResult(result.Error), // 400
        ErrorType.NotFound   =&gt; new NotFoundObjectResult(result.Error),   // 404
        ErrorType.Conflict   =&gt; new ConflictObjectResult(result.Error),   // 409
        _                    =&gt; new ObjectResult(result.Error) { StatusCode = 500 }
    };
}</code></pre>
                    </div>
                </div>
            </div>
        `
    },

    aula04: {
        tag: "Microsserviços • Concluída",
        title: "Decomposição Estratégica: Extraindo o Módulo de Pagamentos (PIX)",
        desc: "Como desacoplar a vertical de Pagamentos para um microsserviço independente (PixService) com mensageria assíncrona, eventos de integração e background worker.",
        content: `
            <div class="section">
                <h3 class="section-title"><span>🚨</span> O Problema Real: Chamadas Síncronas Travando o Monólito</h3>

                <div class="real-world-analogy">
                    <div class="real-world-analogy-header">
                        <span style="font-size: 1.4rem;">📮</span>
                        <h4>Analogia do Mundo Real: O Garçom do Restaurante vs. O Correio</h4>
                    </div>
                    <p>Imagine que você vai a um restaurante movimentado e pede uma pizza. Se o garçom anotar seu pedido, for até a cozinha e <strong>ficar em pé na frente do forno esperando a pizza assar por 30 minutos</strong> antes de atender qualquer outra mesa, o restaurante entra em colapso imediatamente (as mesas ficam sem atendimento).<br><br>
                    <strong>Isso é o HTTP Síncrono:</strong> a thread do servidor web fica travada esperando o Banco Central responder.<br><br>
                    <strong>A Abordagem Assíncrona (Event-Driven):</strong> O garçom anota o pedido, coloca o bilhete no espeto da cozinha (<em>publica o evento na fila</em>), entrega a comanda na sua mesa em 5 segundos e vai atender outro cliente. Quando a pizza fica pronta, a cozinha entrega (<em>Worker processando em segundo plano</em>).</p>
                </div>

                <div class="comparison-container">
                    <div class="code-box">
                        <div class="code-header">
                            <span>❌ Como NÃO Fazer: Chamada HTTP Síncrona Bloqueante</span>
                            <span class="code-badge-bad">Perigo de Efeito Dominó</span>
                        </div>
                        <pre><code>[HttpPost("pix")]
public async Task&lt;IActionResult&gt; Pagar([FromBody] PixRequest req)
{
    // A Thread web fica travada esperando a rede externa!
    // Se o Banco Central levar 4 segundos, 100 usuários travam o servidor todo!
    var respostaBacen = await _httpClient.PostAsync("https://bacen/pix/liquidar", ...);
    
    if (!respostaBacen.IsSuccessStatusCode)
        return StatusCode(500, "BACEN indisponível");
}</code></pre>
                    </div>

                    <div class="code-box">
                        <div class="code-header">
                            <span>✅ Como DEVE Ser Feito: Event-Driven Assíncrono com EventBus</span>
                            <span class="code-badge-good">Alta Disponibilidade (Milissegundos)</span>
                        </div>
                        <pre><code>// 1. Salva a intenção no banco local e publica evento na fila:
await _pagamentoRepository.AdicionarAsync(operacao, ct);
await _unitOfWork.CommitAsync(ct);

// 2. Dispara evento assíncrono e libera o app do usuário em 10ms!
await _eventBus.PublicarAsync(new PagamentoPixAgendadoEvent(...), ct);
return Result.Success(operacaoDto);

// 3. O PixService consome a fila em background sem travar o monólito!</code></pre>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><span>📦</span> O Que Foi Feito no Projeto (.NET 10) & Onde Fica Cada Código</h3>

                <!-- Deep Dive 1: Eventos de Integração -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>1. Contratos de Eventos de Integração</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.Application/Events/PagamentoPixEvents.cs</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> Para dois sistemas conversarem sem acoplamento de código, eles precisam apenas de contratos de dados puros (records com id do evento e timestamp UTC):</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>PagamentoPixEvents.cs (Integration Events)</span><span class="code-badge-good">Immutable Record</span></div>
                        <pre><code>public interface IIntegrationEvent
{
    Guid Id { get; }
    DateTime OcorridoEm { get; }
}

public sealed record PagamentoPixAgendadoEvent(
    Guid EventId,
    Guid OperacaoId,
    Guid ContaOrigemId,
    decimal Valor,
    string ChavePix,
    DateTime AgendadoPara,
    DateTime OcorridoEm
) : IIntegrationEvent;</code></pre>
                    </div>
                </div>

                <!-- Deep Dive 2: InMemoryEventBus -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>2. Barramento de Mensageria em Memória de Alta Performance</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.Infrastructure/Messaging/InMemoryEventBus.cs</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> Em vez de forçar a instalação de um servidor RabbitMQ ou Kafka no Day 1 de desenvolvimento, criamos um <code>IEventBus</code> baseado em <code>System.Threading.Channels.Channel</code>. Ele opera com zero alocação de memória e permite trocar para RabbitMQ com uma única linha no <code>DependencyInjection.cs</code> no futuro:</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>InMemoryEventBus.cs (Channels API)</span><span class="code-badge-good">High Throughput</span></div>
                        <pre><code>public sealed class InMemoryEventBus : IEventBus
{
    private readonly Channel&lt;IIntegrationEvent&gt; _channel = Channel.CreateUnbounded&lt;IIntegrationEvent&gt;();

    public async Task PublicarAsync&lt;TEvent&gt;(TEvent evento, CancellationToken ct = default)
        where TEvent : class, IIntegrationEvent
    {
        await _channel.Writer.WriteAsync(evento, ct);
    }
}</code></pre>
                    </div>
                </div>

                <!-- Deep Dive 3: O Microsserviço PixService -->
                <div class="deep-dive-card">
                    <div class="deep-dive-title">
                        <h4>3. O Microsserviço Independente: PixService</h4>
                        <span class="file-tag">src/aula-guiada-monolito-gemini.PixService/Program.cs & Workers/PixWorkerConsumer.cs</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;"><strong>O Porquê:</strong> Criamos um projeto .NET 10 Web API / Worker totalmente autônomo. Ele possui seu próprio <code>Program.cs</code> e seu próprio <code>BackgroundService</code> que escuta a fila e realiza a liquidação oficial com o Sistema de Pagamentos Instantâneos (SPI) do Banco Central:</p>
                    
                    <div class="code-box">
                        <div class="code-header"><span>PixWorkerConsumer.cs (Background Worker do Microsserviço)</span><span class="code-badge-good">Hosted Service</span></div>
                        <pre><code>public sealed class PixWorkerConsumer : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[PixService] Worker ativo e conectado ao Barramento...");

        while (!stoppingToken.IsCancellationRequested)
        {
            // Consome eventos assíncronos da fila e envia para liquidação no SPI / BACEN
            await Task.Delay(5000, stoppingToken);
        }
    }
}</code></pre>
                    </div>
                </div>
            </div>
        `
    },

    aula05: {
        tag: "Resiliência • Próximo Passo",
        title: "Resiliência, Circuit Breaker & Distributed Tracing",
        desc: "Como proteger microsserviços contra efeito dominó usando Polly v8 (Circuit Breaker, Retry com Jitter) e instrumentação OpenTelemetry correlacionada.",
        content: `
            <div class="section">
                <h3 class="section-title"><span>🚨</span> O Cenário Real: Efeito Dominó em Sistemas Distribuídos</h3>

                <div class="real-world-analogy">
                    <div class="real-world-analogy-header">
                        <span style="font-size: 1.4rem;">⚡</span>
                        <h4>Analogia do Mundo Real: O Disjuntor da Caixa de Força</h4>
                    </div>
                    <p>Na sua casa, se houver um curto-circuito na fiação do chuveiro, o <strong>Disjuntor (Circuit Breaker)</strong> da caixa de força desarma imediatamente para proteger a fiação da casa de pegar fogo.<br><br>
                    <strong>Em microsserviços é a mesma coisa:</strong> se o Banco Central ou a adquirente de cartão começar a falhar em 50% dos pedidos, o <em>Circuit Breaker (Polly v8)</em> deve abrir na hora. Em vez de sua aplicação continuar enviando requisições que demoram 30 segundos e derrubam seus servidores, ela responde instantaneamente com fallback educado ao cliente.</p>
                </div>

                <div class="card-grid">
                    <div class="info-card" style="border-left: 4px solid #2563eb;">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-blue">🛡️</div>
                            <h4>Circuit Breaker & Retry com Jitter</h4>
                        </div>
                        <p>Polly v8 configurado para interromper chamadas a serviços instáveis, com retentativas calculadas com jitter (variação aleatória) para não sobrecarregar o serviço na volta.</p>
                    </div>
                    <div class="info-card" style="border-left: 4px solid #7c3aed;">
                        <div class="info-card-header">
                            <div class="info-card-icon icon-purple">🔍</div>
                            <h4>OpenTelemetry & W3C TraceContext</h4>
                        </div>
                        <p>Instrumentação distribuída: acompanhe um PIX saindo do Monólito e entrando no PixService através de um <code>TraceId</code> global nos logs, Jaeger e Prometheus.</p>
                    </div>
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
