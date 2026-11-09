using FluentValidation;
using aula_guiada_monolito_gemini.Application.DTOs;

namespace aula_guiada_monolito_gemini.Application.Validators;

public sealed class AgendarPagamentoPixRequestValidator : AbstractValidator<AgendarPagamentoPixRequest>
{
    public AgendarPagamentoPixRequestValidator()
    {
        RuleFor(x => x.ContaOrigemId)
            .NotEmpty().WithMessage("Conta de origem é obrigatória.");

        RuleFor(x => x.Valor)
            .GreaterThan(0).WithMessage("Valor do pagamento deve ser superior a zero.");

        RuleFor(x => x.ChavePix)
            .NotEmpty().WithMessage("Chave PIX ou identificador é obrigatório.")
            .MaximumLength(150).WithMessage("Chave PIX não pode exceder 150 caracteres.");
    }
}

