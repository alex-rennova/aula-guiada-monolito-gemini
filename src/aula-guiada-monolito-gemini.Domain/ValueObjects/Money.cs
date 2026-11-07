using aula_guiada_monolito_gemini.Domain.Common;

namespace aula_guiada_monolito_gemini.Domain.ValueObjects;

public sealed record Money
{
    public decimal Amount { get; }

    private Money(decimal amount)
    {
        Amount = amount;
    }

    public static Result<Money> Create(decimal amount)
    {
        if (amount < 0)
            return Result.Failure<Money>(Error.Validation("Money.Negative", "Money amount cannot be negative."));

        return Result.Success(new Money(amount));
    }

    public static implicit operator decimal(Money money) => money.Amount;

    public override string ToString() => Amount.ToString("C");
}
