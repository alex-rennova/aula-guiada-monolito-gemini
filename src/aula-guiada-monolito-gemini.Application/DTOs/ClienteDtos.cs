using aula_guiada_monolito_gemini.Domain.Enums;

namespace aula_guiada_monolito_gemini.Application.DTOs;

public sealed record ClienteDto(
    Guid Id,
    string Nome,
    string Email,
    string Cpf,
    SituacaoCadastral Situacao,
    DateTime CriadoEm
);

public sealed record CriarClienteRequest(
    string Nome,
    string Email,
    string Cpf
);

