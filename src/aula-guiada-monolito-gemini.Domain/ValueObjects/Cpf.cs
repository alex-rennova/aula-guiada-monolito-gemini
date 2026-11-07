using aula_guiada_monolito_gemini.Domain.Common;

namespace aula_guiada_monolito_gemini.Domain.ValueObjects;

public sealed record Cpf
{
    public string Value { get; }

    private Cpf(string value) => Value = value;

    public static Result<Cpf> Create(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return Result.Failure<Cpf>(Error.Validation("Cpf.Empty", "CPF é obrigatório."));

        var digits = new string(raw.Where(char.IsDigit).ToArray());

        if (digits.Length != 11)
            return Result.Failure<Cpf>(Error.Validation("Cpf.InvalidLength", "CPF deve conter 11 dígitos."));

        return Result.Success(new Cpf(digits));
    }

    public static implicit operator string(Cpf cpf) => cpf.Value;
    public override string ToString() => Value;
}

