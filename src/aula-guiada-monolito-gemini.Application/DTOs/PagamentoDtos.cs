using aula_guiada_monolito_gemini.Domain.Enums;

namespace aula_guiada_monolito_gemini.Application.DTOs;

public sealed record AgendarPagamentoPixRequest(
    Guid ContaOrigemId,
    decimal Valor,
    string ChavePix,
    DateTime? AgendadoPara = null
);

public sealed record OperacaoPagamentoDto(
    Guid Id,
    Guid ContaOrigemId,
    decimal Valor,
    string CodigoBarrasOuPix,
    StatusOperacao Status,
    DateTime AgendadoPara,
    DateTime SolicitadoEm
);

