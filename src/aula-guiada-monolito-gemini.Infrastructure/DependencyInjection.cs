using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Infrastructure.Data;
using aula_guiada_monolito_gemini.Infrastructure.Messaging;
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

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Repositórios de Bounded Contexts
        services.AddScoped<IClienteRepository, ClienteRepository>();
        services.AddScoped<IContaRepository, ContaRepository>();
        services.AddScoped<IPagamentoRepository, PagamentoRepository>();
        services.AddScoped<IInvestimentoRepository, InvestimentoRepository>();

        // Barramento de Eventos Desacoplado
        services.AddSingleton<IEventBus, InMemoryEventBus>();

        return services;
    }
}
