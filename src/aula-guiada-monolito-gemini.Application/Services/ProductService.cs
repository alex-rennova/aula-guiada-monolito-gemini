
using aula_guiada_monolito_gemini.Application.DTOs;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Domain.Interfaces;

namespace aula_guiada_monolito_gemini.Application.Services;

public sealed class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<ProductDto> CreateAsync(
        string name,
        decimal price,
        CancellationToken cancellationToken = default)
    {
        var product = new Product(name, price);

        await _repository.AddAsync(product, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return Map(product);
    }

    public async Task<ProductDto?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var product = await _repository.GetByIdAsync(
            id,
            cancellationToken);

        return product is null ? null : Map(product);
    }

    public async Task<IReadOnlyList<ProductDto>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var products = await _repository.GetAllAsync(cancellationToken);

        return products.Select(Map).ToList();
    }

    private static ProductDto Map(Product product) =>
        new(product.Id, product.Name, product.Price);
}
