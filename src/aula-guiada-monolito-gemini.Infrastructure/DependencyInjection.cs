using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using aula_guiada_monolito_gemini.Domain.Interfaces;
using aula_guiada_monolito_gemini.Infrastructure.Data;
using aula_guiada_monolito_gemini.Infrastructure.Repositories;

namespace aula_guiada_monolito_gemini.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"));
        });

        services.AddScoped<IProductRepository, ProductRepository>();

        return services;
    }
}
