using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Infrastructure.Data;

namespace aula_guiada_monolito_gemini.Infrastructure.Messaging;

public sealed class OutboxMessageDispatcher : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OutboxMessageDispatcher> _logger;

    public OutboxMessageDispatcher(
        IServiceScopeFactory scopeFactory,
        ILogger<OutboxMessageDispatcher> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[OutboxDispatcher] 📬 Iniciado. Monitorando tabela outbox_messages...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessarMensagensPendentesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[OutboxDispatcher] ⚠️ Erro transitório ao verificar mensagens na Outbox.");
            }

            // Intervalo de polling entre as varreduras
            await Task.Delay(TimeSpan.FromSeconds(3), stoppingToken);
        }
    }

    private async Task ProcessarMensagensPendentesAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var outboxRepo = scope.ServiceProvider.GetRequiredService<IOutboxRepository>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var eventBus = scope.ServiceProvider.GetRequiredService<IEventBus>();

        var mensagens = await outboxRepo.ObterMensagensPendentesAsync(20, cancellationToken);
        if (mensagens.Count == 0) return;

        _logger.LogInformation("[OutboxDispatcher] Encontradas {Count} mensagens pendentes para despacho.", mensagens.Count);

        foreach (var msg in mensagens)
        {
            try
            {
                _logger.LogInformation("[OutboxDispatcher] Despachando mensagem {Id} do tipo {Tipo}...", msg.Id, msg.Tipo);

                // Marca como processada e persiste a confirmação
                msg.MarcarComoProcessada();
                await unitOfWork.CommitAsync(cancellationToken);

                _logger.LogInformation("[OutboxDispatcher] ✅ Mensagem {Id} processada com sucesso!", msg.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[OutboxDispatcher] ❌ Falha ao despachar mensagem {Id}.", msg.Id);
                msg.RegistrarFalha(ex.Message);
                await unitOfWork.CommitAsync(cancellationToken);
            }
        }
    }
}
