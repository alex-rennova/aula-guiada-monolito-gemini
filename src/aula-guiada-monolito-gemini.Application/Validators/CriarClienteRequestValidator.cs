using FluentValidation;
using aula_guiada_monolito_gemini.Application.DTOs;

namespace aula_guiada_monolito_gemini.Application.Validators;

public sealed class CriarClienteRequestValidator : AbstractValidator<CriarClienteRequest>
{
    public CriarClienteRequestValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome do cliente é obrigatório.")
            .MinimumLength(3).WithMessage("Nome deve conter no mínimo 3 caracteres.")
            .MaximumLength(150).WithMessage("Nome não pode exceder 150 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email é obrigatório.")
            .EmailAddress().WithMessage("Formato de email inválido.")
            .MaximumLength(120).WithMessage("Email não pode exceder 120 caracteres.");

        RuleFor(x => x.Cpf)
            .NotEmpty().WithMessage("CPF é obrigatório.")
            .Matches(@"^\d{11}$").WithMessage("CPF deve conter exatamente 11 dígitos numéricos.");
    }
}

