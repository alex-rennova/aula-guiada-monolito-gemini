using aula_guiada_monolito_gemini.Domain.Entities;

namespace aula_guiada_monolito_gemini.Application.Interfaces;

public interface IOutboxRepository
{
    Task AdicionarAsync(OutboxMessage message, CancellationToken cancellationToken = default);
    Task<List<OutboxMessage>> ObterMensagensPendentesAsync(int limite = 20, CancellationToken cancellationToken = default);
}
