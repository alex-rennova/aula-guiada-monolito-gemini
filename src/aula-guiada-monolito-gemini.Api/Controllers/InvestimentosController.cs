using Microsoft.AspNetCore.Mvc;
using aula_guiada_monolito_gemini.Api.Common;
using aula_guiada_monolito_gemini.Application.DTOs;
using aula_guiada_monolito_gemini.Application.UseCases;

namespace aula_guiada_monolito_gemini.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class InvestimentosController : ControllerBase
{
    private readonly IResgatarInvestimentoUseCase _resgatarInvestimentoUseCase;

    public InvestimentosController(IResgatarInvestimentoUseCase resgatarInvestimentoUseCase)
    {
        _resgatarInvestimentoUseCase = resgatarInvestimentoUseCase;
    }

    [HttpPost("resgatar")]
    [ProducesResponseType(typeof(PosicaoInvestimentoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Resgatar([FromBody] ResgatarInvestimentoRequest request, CancellationToken cancellationToken)
    {
        var result = await _resgatarInvestimentoUseCase.ExecutarAsync(request, cancellationToken);
        return result.ToActionResult();
    }
}

