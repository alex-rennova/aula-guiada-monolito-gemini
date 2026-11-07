namespace aula_guiada_monolito_gemini.Domain.ValueObjects;

public sealed record Money
{
    public decimal Value { get; }

    public Money(decimal value)
    {
        if (value < 0)
            throw new ArgumentException("Money cannot be negative.");

        Value = value;
    }

    public static implicit operator decimal(Money money) => money.Value;
}
