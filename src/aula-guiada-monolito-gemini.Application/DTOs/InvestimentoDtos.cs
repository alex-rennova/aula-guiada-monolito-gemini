using aula_guiada_monolito_gemini.Domain.Enums;

namespace aula_guiada_monolito_gemini.Application.DTOs;

public sealed record AplicarInvestimentoRequest(
    Guid ContaId,
    string Ativo,
    TipoPosicao Tipo,
    decimal Valor
);

public sealed record ResgatarInvestimentoRequest(
    Guid PosicaoInvestimentoId,
    decimal ValorResgate
);

public sealed record PosicaoInvestimentoDto(
    Guid Id,
    Guid ContaId,
    string Ativo,
    TipoPosicao Tipo,
    decimal ValorAplicado,
    decimal SaldoAtual,
    DateTime DataAplicacao
);

