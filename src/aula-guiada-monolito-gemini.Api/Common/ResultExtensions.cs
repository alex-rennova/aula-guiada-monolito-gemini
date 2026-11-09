using Microsoft.AspNetCore.Mvc;
using aula_guiada_monolito_gemini.Domain.Common;

namespace aula_guiada_monolito_gemini.Api.Common;

public static class ResultExtensions
{
    public static ActionResult ToActionResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
            return new OkObjectResult(result.Value);

        return result.Error.Type switch
        {
            ErrorType.Validation => new BadRequestObjectResult(result.Error),
            ErrorType.NotFound => new NotFoundObjectResult(result.Error),
            ErrorType.Conflict => new ConflictObjectResult(result.Error),
            _ => new ObjectResult(result.Error) { StatusCode = StatusCodes.Status500InternalServerError }
        };
    }
}

