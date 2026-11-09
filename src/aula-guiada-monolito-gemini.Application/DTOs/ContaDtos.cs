using aula_guiada_monolito_gemini.Domain.Enums;

namespace aula_guiada_monolito_gemini.Application.DTOs;

public sealed record AbrirContaRequest(
    Guid ClienteId,
    string Numero,
    string Agencia = "0001"
);

public sealed record ContaDto(
    Guid Id,
    Guid ClienteId,
    string Numero,
    string Agencia,
    StatusConta Status,
    DateTime AbertaEm
);

