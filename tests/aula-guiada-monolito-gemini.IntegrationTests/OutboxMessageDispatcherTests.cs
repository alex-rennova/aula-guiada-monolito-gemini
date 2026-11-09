using System.Text.Json;
using aula_guiada_monolito_gemini.Application.Events;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Infrastructure.Messaging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace aula_guiada_monolito_gemini.IntegrationTests;

public sealed class OutboxMessageDispatcherTests
{
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Despacho_SoConfirmaMensagemSePublicacaoForAceita(bool falharPublicacao)
    {
        var agora = DateTime.UtcNow;
        var evento = new PagamentoPixAgendadoEvent(
            Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 150m, "confeitaria@example.test", agora, agora);
        var mensagem = new OutboxMessage(
            evento.EventId, nameof(PagamentoPixAgendadoEvent), JsonSerializer.Serialize(evento), agora);
        var lote = new Lote(mensagem, falharPublicacao);
        using var services = new ServiceCollection()
            .AddSingleton<IOutboxRepository>(lote)
            .AddSingleton<IUnitOfWork>(lote)
            .AddSingleton<IEventBus>(lote)
            .BuildServiceProvider();
        using var dispatcher = new OutboxMessageDispatcher(
            services.GetRequiredService<IServiceScopeFactory>(), NullLogger<OutboxMessageDispatcher>.Instance);

        await dispatcher.StartAsync(CancellationToken.None);
        try
        {
            await lote.Commit.Task.WaitAsync(TimeSpan.FromSeconds(5));
        }
        finally
        {
            await dispatcher.StopAsync(CancellationToken.None);
        }

        Assert.Equal(evento, lote.Tentativa);
        if (falharPublicacao)
        {
            Assert.Null(mensagem.ProcessadoEm);
            Assert.NotNull(mensagem.Erro);
        }
        else
        {
            Assert.NotNull(mensagem.ProcessadoEm);
            Assert.Null(mensagem.Erro);
        }
    }

    private sealed class Lote(OutboxMessage mensagem, bool falharPublicacao)
        : IOutboxRepository, IUnitOfWork, IEventBus
    {
        public IIntegrationEvent? Tentativa { get; private set; }
        public TaskCompletionSource Commit { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);

        public Task<List<OutboxMessage>> ObterMensagensPendentesAsync(
            int limite = 20, CancellationToken cancellationToken = default) =>
            Task.FromResult<List<OutboxMessage>>(Commit.Task.IsCompleted ? [] : [mensagem]);

        public Task AdicionarAsync(OutboxMessage message, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task PublicarAsync<TEvent>(TEvent evento, CancellationToken cancellationToken = default)
            where TEvent : class, IIntegrationEvent
        {
            Assert.Null(mensagem.ProcessadoEm);
            Tentativa = evento;
            return falharPublicacao
                ? Task.FromException(new TimeoutException("Publicação simulada indisponível."))
                : Task.CompletedTask;
        }

        public Task<int> CommitAsync(CancellationToken cancellationToken = default)
        {
            Commit.SetResult();
            return Task.FromResult(1);
        }
    }
}
