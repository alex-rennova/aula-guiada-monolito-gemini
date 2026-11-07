namespace aula_guiada_monolito_gemini.Domain.Entities;

public class Product
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public decimal Price { get; private set; }

    private Product() { }

    public Product(string name, decimal price)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Product name is required.");

        if (price < 0)
            throw new ArgumentException("Price cannot be negative.");

        Id = Guid.NewGuid();
        Name = name;
        Price = price;
    }
}
