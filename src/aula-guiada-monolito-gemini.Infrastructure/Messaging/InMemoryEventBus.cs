using System.Threading.Channels;
using Microsoft.Extensions.Logging;
using aula_guiada_monolito_gemini.Application.Events;
using aula_guiada_monolito_gemini.Application.Interfaces;

namespace aula_guiada_monolito_gemini.Infrastructure.Messaging;

public sealed class InMemoryEventBus : IEventBus
{
    private readonly Channel<IIntegrationEvent> _channel;
    private readonly ILogger<InMemoryEventBus> _logger;

    public InMemoryEventBus(ILogger<InMemoryEventBus> logger)
    {
        _logger = logger;
        // Canal assíncrono unbounded para bufferizar eventos desacoplados
        _channel = Channel.CreateUnbounded<IIntegrationEvent>(new UnboundedChannelOptions
        {
            SingleReader = false,
            SingleWriter = false
        });
    }

    public ChannelReader<IIntegrationEvent> Reader => _channel.Reader;

    public async Task PublicarAsync<TEvent>(TEvent evento, CancellationToken cancellationToken = default) 
        where TEvent : class, IIntegrationEvent
    {
        _logger.LogInformation(
            "[EventBus] Evento publicado: {TipoEvento} | ID: {EventoId}",
            typeof(TEvent).Name,
            evento.Id);

        await _channel.Writer.WriteAsync(evento, cancellationToken);
    }
}

