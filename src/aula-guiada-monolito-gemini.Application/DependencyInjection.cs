using Microsoft.Extensions.DependencyInjection;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Application.Services;

namespace aula_guiada_monolito_gemini.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();

        return services;
    }
}

