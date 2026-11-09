using FluentValidation;
using aula_guiada_monolito_gemini.Application.DTOs;

namespace aula_guiada_monolito_gemini.Application.Validators;

public sealed class AbrirContaRequestValidator : AbstractValidator<AbrirContaRequest>
{
    public AbrirContaRequestValidator()
    {
        RuleFor(x => x.ClienteId)
            .NotEmpty().WithMessage("Identificador do cliente é obrigatório.");

        RuleFor(x => x.Numero)
            .NotEmpty().WithMessage("Número da conta é obrigatório.")
            .MaximumLength(20).WithMessage("Número da conta não pode exceder 20 caracteres.");

        RuleFor(x => x.Agencia)
            .NotEmpty().WithMessage("Agência é obrigatória.")
            .MaximumLength(10).WithMessage("Agência não pode exceder 10 caracteres.");
    }
}

