using aula_guiada_monolito_gemini.Domain.Entities;

namespace aula_guiada_monolito_gemini.Application.Interfaces;

public interface IContaRepository
{
    Task<Conta?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExisteNumeroAsync(string agencia, string numero, CancellationToken cancellationToken = default);
    Task AdicionarAsync(Conta conta, CancellationToken cancellationToken = default);
}

