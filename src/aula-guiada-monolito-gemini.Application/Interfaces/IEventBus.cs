using aula_guiada_monolito_gemini.Application.Events;

namespace aula_guiada_monolito_gemini.Application.Interfaces;

public interface IEventBus
{
    Task PublicarAsync<TEvent>(TEvent evento, CancellationToken cancellationToken = default) 
        where TEvent : class, IIntegrationEvent;
}

