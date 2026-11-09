using aula_guiada_monolito_gemini.Application.DTOs;
using aula_guiada_monolito_gemini.Application.Events;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Application.UseCases;
using aula_guiada_monolito_gemini.Application.Validators;
using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Domain.Enums;

namespace aula_guiada_monolito_gemini.UnitTests;

public sealed class FakeUnitOfWork : IUnitOfWork
{
    public int CommitsCount { get; private set; }
    public Task<int> CommitAsync(CancellationToken cancellationToken = default)
    {
        CommitsCount++;
        return Task.FromResult(1);
    }
}

public sealed class FakeClienteRepository : IClienteRepository
{
    public readonly List<Cliente> Clientes = [];

    public Task<Cliente?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => Task.FromResult(Clientes.FirstOrDefault(c => c.Id == id));

    public Task<Cliente?> ObterPorCpfAsync(string cpf, CancellationToken cancellationToken = default)
        => Task.FromResult(Clientes.FirstOrDefault(c => c.Cpf.Value == cpf));

    public Task<bool> ExisteCpfAsync(string cpf, CancellationToken cancellationToken = default)
        => Task.FromResult(Clientes.Any(c => c.Cpf.Value == cpf));

    public Task AdicionarAsync(Cliente cliente, CancellationToken cancellationToken = default)
    {
        Clientes.Add(cliente);
        return Task.CompletedTask;
    }
}

public sealed class FakeContaRepository : IContaRepository
{
    public readonly List<Conta> Contas = [];

    public Task<Conta?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => Task.FromResult(Contas.FirstOrDefault(c => c.Id == id));

    public Task<bool> ExisteNumeroAsync(string agencia, string numero, CancellationToken cancellationToken = default)
        => Task.FromResult(Contas.Any(c => c.Agencia == agencia && c.Numero == numero));

    public Task AdicionarAsync(Conta conta, CancellationToken cancellationToken = default)
    {
        Contas.Add(conta);
        return Task.CompletedTask;
    }
}

public sealed class FakePagamentoRepository : IPagamentoRepository
{
    public readonly List<OperacaoPagamento> Pagamentos = [];

    public Task<OperacaoPagamento?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => Task.FromResult(Pagamentos.FirstOrDefault(p => p.Id == id));

    public Task AdicionarAsync(OperacaoPagamento operacao, CancellationToken cancellationToken = default)
    {
        Pagamentos.Add(operacao);
        return Task.CompletedTask;
    }
}

public sealed class FakeOutboxRepository : IOutboxRepository
{
    public readonly List<OutboxMessage> Messages = [];

    public Task AdicionarAsync(OutboxMessage message, CancellationToken cancellationToken = default)
    {
        Messages.Add(message);
        return Task.CompletedTask;
    }

    public Task<List<OutboxMessage>> ObterMensagensPendentesAsync(int limite = 20, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Messages.Where(m => m.ProcessadoEm == null).Take(limite).ToList());
    }
}

public sealed class FakeInvestimentoRepository : IInvestimentoRepository
{
    public readonly List<PosicaoInvestimento> Investimentos = [];

    public Task<PosicaoInvestimento?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => Task.FromResult(Investimentos.FirstOrDefault(i => i.Id == id));

    public Task AdicionarAsync(PosicaoInvestimento posicao, CancellationToken cancellationToken = default)
    {
        Investimentos.Add(posicao);
        return Task.CompletedTask;
    }

    public Task AtualizarAsync(PosicaoInvestimento posicao, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}

public class BancoDigitalApplicationTests
{
    [Fact]
    public async Task CriarCliente_ComDadosValidos_DeveCadastrarComSucesso()
    {
        var repo = new FakeClienteRepository();
        var uow = new FakeUnitOfWork();
        var validator = new CriarClienteRequestValidator();
        var useCase = new CriarClienteUseCase(repo, uow, validator);

        var request = new CriarClienteRequest("João da Silva", "joao@email.com", "12345678901");
        var result = await useCase.ExecutarAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal("João da Silva", result.Value.Nome);
        Assert.Equal("12345678901", result.Value.Cpf);
        Assert.Equal(1, uow.CommitsCount);
        Assert.Single(repo.Clientes);
    }

    [Fact]
    public async Task CriarCliente_ComCpfInvalido_DeveFalharNaValidacao()
    {
        var repo = new FakeClienteRepository();
        var uow = new FakeUnitOfWork();
        var validator = new CriarClienteRequestValidator();
        var useCase = new CriarClienteUseCase(repo, uow, validator);

        var request = new CriarClienteRequest("João da Silva", "joao@email.com", "123");
        var result = await useCase.ExecutarAsync(request);

        Assert.True(result.IsFailure);
        Assert.Equal(0, uow.CommitsCount);
    }

    [Fact]
    public async Task AbrirConta_ComClienteExistente_DeveRetornarContaAtiva()
    {
        var clienteRepo = new FakeClienteRepository();
        var contaRepo = new FakeContaRepository();
        var uow = new FakeUnitOfWork();

        var cliente = Cliente.Criar("Ana Pereira", "ana@banco.com", "98765432100").Value;
        await clienteRepo.AdicionarAsync(cliente);

        var validator = new AbrirContaRequestValidator();
        var useCase = new AbrirContaUseCase(contaRepo, clienteRepo, uow, validator);

        var request = new AbrirContaRequest(cliente.Id, "0012345-6", "0001");
        var result = await useCase.ExecutarAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal("0012345-6", result.Value.Numero);
        Assert.Equal(StatusConta.Ativa, result.Value.Status);
        Assert.Equal(1, uow.CommitsCount);
    }

    [Fact]
    public async Task AgendarPagamentoPix_ComContaAtiva_DevePrepararOperacaoEOutboxParaUmCommit()
    {
        // ARRANGE: Configura repositórios com suporte a Transactional Outbox
        var contaRepo = new FakeContaRepository();
        var pagRepo = new FakePagamentoRepository();
        var outboxRepo = new FakeOutboxRepository();
        var uow = new FakeUnitOfWork();

        var conta = Conta.Abrir(Guid.NewGuid(), "12345-6").Value;
        await contaRepo.AdicionarAsync(conta);

        var validator = new AgendarPagamentoPixRequestValidator();
        var useCase = new AgendarPagamentoPixUseCase(pagRepo, contaRepo, outboxRepo, uow, validator);

        var request = new AgendarPagamentoPixRequest(conta.Id, 250m, "pix-chave@teste.com");

        // ACT
        var result = await useCase.ExecutarAsync(request);

        // ASSERT: Sucesso da requisição
        Assert.True(result.IsSuccess);
        Assert.Equal(StatusOperacao.Agendado, result.Value.Status);
        Assert.Equal(250m, result.Value.Valor);

        // 🛡️ COMPROVAÇÃO DO TRANSACTIONAL OUTBOX:
        // 1. Apenas 1 commit atômico foi realizado
        Assert.Equal(1, uow.CommitsCount);

        // 2. A operação de pagamento foi salva
        Assert.Single(pagRepo.Pagamentos);

        // 3. A OutboxMessage foi salva no MESMO commit
        Assert.Single(outboxRepo.Messages);
        var outboxMessage = outboxRepo.Messages[0];
        Assert.Equal(nameof(PagamentoPixAgendadoEvent), outboxMessage.Tipo);
        Assert.Contains("pix-chave@teste.com", outboxMessage.Payload);
        Assert.Contains("250", outboxMessage.Payload);
        Assert.Null(outboxMessage.ProcessadoEm); // Mensagem pendente para o Dispatcher
    }

    [Fact]
    public async Task ResgatarInvestimento_ComSaldoSuficiente_DeveAtualizarPosicao()
    {
        var investRepo = new FakeInvestimentoRepository();
        var uow = new FakeUnitOfWork();

        var contaId = Guid.NewGuid();
        var posicao = PosicaoInvestimento.Aplicar(contaId, "CDB Liquidez Diária", TipoPosicao.CDB, 2000m).Value;
        await investRepo.AdicionarAsync(posicao);

        var validator = new ResgatarInvestimentoRequestValidator();
        var useCase = new ResgatarInvestimentoUseCase(investRepo, uow, validator);

        var request = new ResgatarInvestimentoRequest(posicao.Id, 500m);
        var result = await useCase.ExecutarAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal(1500m, result.Value.SaldoAtual);
        Assert.Equal(1, uow.CommitsCount);
    }

    [Fact]
    public async Task CenariDeFalha_SimulandoDualWrite_QuandoBrokerCaiAposCommit_ProvocaInconsistenciaCritica()
    {
        // Simulação em memória: o pagamento é agendado antes da falha de publicação.
        var contaRepo = new FakeContaRepository();
        var pagRepo = new FakePagamentoRepository();
        var uow = new FakeUnitOfWork();

        var conta = Conta.Abrir(Guid.NewGuid(), "99999-9").Value;
        await contaRepo.AdicionarAsync(conta);

        var pagamento = OperacaoPagamento.Criar(conta.Id, 500m, "erro-broker@pix.com").Value;
        await pagRepo.AdicionarAsync(pagamento);
        await uow.CommitAsync();

        Func<Task> publicarDiretoNoBroker = () => throw new TimeoutException("Fila simulada indisponível.");
        await Assert.ThrowsAsync<TimeoutException>(publicarDiretoNoBroker);

        Assert.Equal(StatusOperacao.Agendado, Assert.Single(pagRepo.Pagamentos).Status);
        Assert.Equal(1, uow.CommitsCount);
    }

    [Fact]
    public async Task CenariDeFalha_QuandoBancoFalhaAposPublicarNoBroker_GeraMensagemFantasma()
    {
        // Simulação em memória: a fila aceita o aviso antes da falha no commit.
        var messagesFila = new List<string>();
        var uowQueFalha = new FakeUnitOfWorkComErro();

        messagesFila.Add("PAGAMENTO_SOLICITADO_1000_REAIS");

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => uowQueFalha.CommitAsync());

        Assert.Equal("PAGAMENTO_SOLICITADO_1000_REAIS", Assert.Single(messagesFila));
        Assert.Equal("Falha de IO no PostgreSQL!", ex.Message);
    }
}

public sealed class FakeUnitOfWorkComErro : IUnitOfWork
{
    public Task<int> CommitAsync(CancellationToken cancellationToken = default)
    {
        throw new InvalidOperationException("Falha de IO no PostgreSQL!");
    }
}
