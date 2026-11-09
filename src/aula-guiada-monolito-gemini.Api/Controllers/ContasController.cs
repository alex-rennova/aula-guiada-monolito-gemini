using Microsoft.AspNetCore.Mvc;
using aula_guiada_monolito_gemini.Api.Common;
using aula_guiada_monolito_gemini.Application.DTOs;
using aula_guiada_monolito_gemini.Application.UseCases;

namespace aula_guiada_monolito_gemini.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ContasController : ControllerBase
{
    private readonly IAbrirContaUseCase _abrirContaUseCase;

    public ContasController(IAbrirContaUseCase abrirContaUseCase)
    {
        _abrirContaUseCase = abrirContaUseCase;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ContaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Abrir([FromBody] AbrirContaRequest request, CancellationToken cancellationToken)
    {
        var result = await _abrirContaUseCase.ExecutarAsync(request, cancellationToken);
        return result.ToActionResult();
    }
}

