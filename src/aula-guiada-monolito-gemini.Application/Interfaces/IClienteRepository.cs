using aula_guiada_monolito_gemini.Domain.Entities;

namespace aula_guiada_monolito_gemini.Application.Interfaces;

public interface IClienteRepository
{
    Task<Cliente?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Cliente?> ObterPorCpfAsync(string cpf, CancellationToken cancellationToken = default);
    Task<bool> ExisteCpfAsync(string cpf, CancellationToken cancellationToken = default);
    Task AdicionarAsync(Cliente cliente, CancellationToken cancellationToken = default);
}

