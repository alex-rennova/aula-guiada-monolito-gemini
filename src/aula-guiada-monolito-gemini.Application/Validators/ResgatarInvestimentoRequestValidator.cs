using FluentValidation;
using aula_guiada_monolito_gemini.Application.DTOs;

namespace aula_guiada_monolito_gemini.Application.Validators;

public sealed class ResgatarInvestimentoRequestValidator : AbstractValidator<ResgatarInvestimentoRequest>
{
    public ResgatarInvestimentoRequestValidator()
    {
        RuleFor(x => x.PosicaoInvestimentoId)
            .NotEmpty().WithMessage("Posição de investimento é obrigatória.");

        RuleFor(x => x.ValorResgate)
            .GreaterThan(0).WithMessage("Valor do resgate deve ser superior a zero.");
    }
}

