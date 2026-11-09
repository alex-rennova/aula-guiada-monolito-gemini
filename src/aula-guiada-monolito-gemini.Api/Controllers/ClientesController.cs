using Microsoft.AspNetCore.Mvc;
using aula_guiada_monolito_gemini.Api.Common;
using aula_guiada_monolito_gemini.Application.DTOs;
using aula_guiada_monolito_gemini.Application.UseCases;

namespace aula_guiada_monolito_gemini.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ClientesController : ControllerBase
{
    private readonly ICriarClienteUseCase _criarClienteUseCase;

    public ClientesController(ICriarClienteUseCase criarClienteUseCase)
    {
        _criarClienteUseCase = criarClienteUseCase;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ClienteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Criar([FromBody] CriarClienteRequest request, CancellationToken cancellationToken)
    {
        var result = await _criarClienteUseCase.ExecutarAsync(request, cancellationToken);
        return result.ToActionResult();
    }
}

