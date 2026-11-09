using System.Text.Json;
using aula_guiada_monolito_gemini.Application.DTOs;
using aula_guiada_monolito_gemini.Application.Events;
using aula_guiada_monolito_gemini.Application.UseCases;
using aula_guiada_monolito_gemini.Application.Validators;
using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Infrastructure.Data;
using aula_guiada_monolito_gemini.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace aula_guiada_monolito_gemini.IntegrationTests;

public sealed class PostgresFactAttribute : FactAttribute
{
    public const string VariavelConexao = "BANCO_TEST_POSTGRES";

    public PostgresFactAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(VariavelConexao)))
            Skip = $"Configure {VariavelConexao} com a conexão de um banco de testes.";
    }
}

public sealed class LaboratorioOutboxTests
{
    [PostgresFact]
    public Task DualWrite_BancoPrimeiro_DeixaPagamentoSemEvento() => ComBancoAsync(async options =>
    {
        var fila = new FilaSimulada { Indisponivel = true };
        await using var escrita = new AppDbContext(options);
        var pagamento = await PrepararPagamentoAsync(escrita);

        await escrita.SaveChangesAsync();
        await Assert.ThrowsAsync<TimeoutException>(() => fila.PublicarAsync(pagamento.Id));

        await using var leitura = new AppDbContext(options);
        Assert.True(await leitura.Pagamentos.AnyAsync(p => p.Id == pagamento.Id));
        Assert.Empty(fila.OperacoesRecebidas);
        Assert.False(await leitura.OutboxMessages.AnyAsync());
    });

    [PostgresFact]
    public Task DualWrite_FilaPrimeiro_GeraEventoSemPagamento() => ComBancoAsync(async options =>
    {
        var fila = new FilaSimulada();
        await using var escrita = new AppDbContext(options);
        await escrita.Database.ExecuteSqlRawAsync(
            "ALTER TABLE operacoes_pagamento ADD CHECK (false)");
        var pagamento = await PrepararPagamentoAsync(escrita);

        await fila.PublicarAsync(pagamento.Id);
        await Assert.ThrowsAsync<DbUpdateException>(() => escrita.SaveChangesAsync());

        await using var leitura = new AppDbContext(options);
        Assert.Equal(pagamento.Id, Assert.Single(fila.OperacoesRecebidas));
        Assert.False(await leitura.Pagamentos.AnyAsync(p => p.Id == pagamento.Id));
    });

    [PostgresFact]
    public Task Outbox_CommitBemSucedido_PersistePagamentoEMensagemPendente() => ComBancoAsync(async options =>
    {
        await using var escrita = new AppDbContext(options);
        var conta = await CriarContaAsync(escrita);
        var resultado = await CriarCasoDeUso(escrita).ExecutarAsync(Requisicao(conta.Id));

        Assert.True(resultado.IsSuccess);
        await using var leitura = new AppDbContext(options);
        Assert.True(await leitura.Pagamentos.AnyAsync(p => p.Id == resultado.Value.Id));
        var mensagem = await leitura.OutboxMessages.SingleAsync();
        var evento = JsonSerializer.Deserialize<PagamentoPixAgendadoEvent>(mensagem.Payload);
        Assert.NotNull(evento);
        Assert.Equal(resultado.Value.Id, evento.OperacaoId);
        Assert.Equal(mensagem.Id, evento.EventId);
        Assert.Null(mensagem.ProcessadoEm);
    });

    [PostgresFact]
    public Task Outbox_GravacaoDaMensagemFalha_RevertePagamento() => ComBancoAsync(async options =>
    {
        await using var escrita = new AppDbContext(options);
        var conta = await CriarContaAsync(escrita);
        await escrita.Database.ExecuteSqlRawAsync("ALTER TABLE outbox_messages ADD CHECK (false)");

        await Assert.ThrowsAsync<DbUpdateException>(() =>
            CriarCasoDeUso(escrita).ExecutarAsync(Requisicao(conta.Id)));

        await using var leitura = new AppDbContext(options);
        Assert.False(await leitura.Pagamentos.AnyAsync());
        Assert.False(await leitura.OutboxMessages.AnyAsync());
    });

    private static AgendarPagamentoPixUseCase CriarCasoDeUso(AppDbContext db) =>
        new(new PagamentoRepository(db), new ContaRepository(db), new OutboxRepository(db),
            new UnitOfWork(db), new AgendarPagamentoPixRequestValidator());

    private static AgendarPagamentoPixRequest Requisicao(Guid contaId) =>
        new(contaId, 150m, "confeitaria@example.test");

    private static async Task<Conta> CriarContaAsync(AppDbContext db)
    {
        var conta = Conta.Abrir(Guid.NewGuid(), "12345-6").Value;
        db.Contas.Add(conta);
        await db.SaveChangesAsync();
        return conta;
    }

    private static async Task<OperacaoPagamento> PrepararPagamentoAsync(AppDbContext db)
    {
        var conta = await CriarContaAsync(db);
        var request = Requisicao(conta.Id);
        var pagamento = OperacaoPagamento.Criar(conta.Id, request.Valor, request.ChavePix).Value;
        db.Pagamentos.Add(pagamento);
        return pagamento;
    }

    private static async Task ComBancoAsync(Func<DbContextOptions<AppDbContext>, Task> teste)
    {
        var conexao = Environment.GetEnvironmentVariable(PostgresFactAttribute.VariavelConexao);
        var schema = $"outbox_teste_{Guid.NewGuid():N}";
        await using var admin = new NpgsqlConnection(conexao);
        await admin.OpenAsync();
        await using var criar = new NpgsqlCommand($"CREATE SCHEMA {schema}", admin);
        await criar.ExecuteNonQueryAsync();

        try
        {
            var isolada = new NpgsqlConnectionStringBuilder(conexao) { SearchPath = schema, Pooling = false };
            var options = new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(isolada.ConnectionString).Options;
            await using var db = new AppDbContext(options);
            await db.Database.ExecuteSqlRawAsync(db.Database.GenerateCreateScript());
            await teste(options);
        }
        finally
        {
            await using var remover = new NpgsqlCommand($"DROP SCHEMA {schema} CASCADE", admin);
            await remover.ExecuteNonQueryAsync();
        }
    }

    private sealed class FilaSimulada
    {
        public bool Indisponivel { get; init; }
        public List<Guid> OperacoesRecebidas { get; } = [];

        public Task PublicarAsync(Guid operacaoId)
        {
            if (Indisponivel)
                return Task.FromException(new TimeoutException("A fila simulada está indisponível."));

            OperacoesRecebidas.Add(operacaoId);
            return Task.CompletedTask;
        }
    }
}
