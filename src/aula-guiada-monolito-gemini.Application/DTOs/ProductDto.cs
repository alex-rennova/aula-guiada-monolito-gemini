namespace aula_guiada_monolito_gemini.Application.DTOs;

public sealed record ProductDto(
    Guid Id,
    string Name,
    decimal Price
);
