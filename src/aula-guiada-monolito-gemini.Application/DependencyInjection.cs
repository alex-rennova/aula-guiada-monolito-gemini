using Microsoft.Extensions.DependencyInjection;

namespace aula_guiada_monolito_gemini.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Registro dos casos de uso e orquestrações bancárias
        return services;
    }
}
