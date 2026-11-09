using Microsoft.AspNetCore.Mvc;
using aula_guiada_monolito_gemini.Api.Common;
using aula_guiada_monolito_gemini.Application.DTOs;
using aula_guiada_monolito_gemini.Application.UseCases;

namespace aula_guiada_monolito_gemini.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class PagamentosController : ControllerBase
{
    private readonly IAgendarPagamentoPixUseCase _agendarPagamentoPixUseCase;

    public PagamentosController(IAgendarPagamentoPixUseCase agendarPagamentoPixUseCase)
    {
        _agendarPagamentoPixUseCase = agendarPagamentoPixUseCase;
    }

    [HttpPost("pix")]
    [ProducesResponseType(typeof(OperacaoPagamentoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AgendarPix([FromBody] AgendarPagamentoPixRequest request, CancellationToken cancellationToken)
    {
        var result = await _agendarPagamentoPixUseCase.ExecutarAsync(request, cancellationToken);
        return result.ToActionResult();
    }
}

