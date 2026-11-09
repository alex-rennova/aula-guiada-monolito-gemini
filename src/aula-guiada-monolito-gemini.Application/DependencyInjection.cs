using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using aula_guiada_monolito_gemini.Application.UseCases;

namespace aula_guiada_monolito_gemini.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // FluentValidation: registra todos os validadores da camada Application
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        // Registro dos Casos de Uso Bancários (Bounded Contexts)
        services.AddScoped<ICriarClienteUseCase, CriarClienteUseCase>();
        services.AddScoped<IAbrirContaUseCase, AbrirContaUseCase>();
        services.AddScoped<IAgendarPagamentoPixUseCase, AgendarPagamentoPixUseCase>();
        services.AddScoped<IResgatarInvestimentoUseCase, ResgatarInvestimentoUseCase>();

        return services;
    }
}
