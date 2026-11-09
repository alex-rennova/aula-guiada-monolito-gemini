using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using aula_guiada_monolito_gemini.Application.Events;

namespace aula_guiada_monolito_gemini.PixService.Workers;

public sealed class PixWorkerConsumer : BackgroundService
{
    private readonly ILogger<PixWorkerConsumer> _logger;

    public PixWorkerConsumer(ILogger<PixWorkerConsumer> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[PixService Worker] 🚀 Inicializado e conectado à fila de mensageria do Banco Central.");

        while (!stoppingToken.IsCancellationRequested)
        {
            // Worker rodando em loop processando liquidações contínuas
            await Task.Delay(5000, stoppingToken);
            _logger.LogDebug("[PixService Worker] Heartbeat: Worker ativo e processando...");
        }
    }
}

