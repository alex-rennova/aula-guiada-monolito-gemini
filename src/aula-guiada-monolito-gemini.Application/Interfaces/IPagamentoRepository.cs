using aula_guiada_monolito_gemini.Domain.Entities;

namespace aula_guiada_monolito_gemini.Application.Interfaces;

public interface IPagamentoRepository
{
    Task<OperacaoPagamento?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AdicionarAsync(OperacaoPagamento operacao, CancellationToken cancellationToken = default);
}

