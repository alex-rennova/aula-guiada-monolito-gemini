using aula_guiada_monolito_gemini.Domain.Entities;

namespace aula_guiada_monolito_gemini.Application.Interfaces;

public interface IInvestimentoRepository
{
    Task<PosicaoInvestimento?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AdicionarAsync(PosicaoInvestimento posicao, CancellationToken cancellationToken = default);
    Task AtualizarAsync(PosicaoInvestimento posicao, CancellationToken cancellationToken = default);
}

