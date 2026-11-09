using Microsoft.AspNetCore.Mvc;
using aula_guiada_monolito_gemini.Application.Events;
using aula_guiada_monolito_gemini.PixService.Workers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Hosted Service do Microsserviço para processamento contínuo em background
builder.Services.AddHostedService<PixWorkerConsumer>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => Results.Ok(new
{
    Servico = "PixService • Microsserviço Autônomo de Liquidação",
    Status = "Online",
    Protocolo = "SPI / Banco Central do Brasil",
    Versao = "1.0.0-net10"
}));

app.MapPost("/pix/liquidar", ([FromBody] PagamentoPixAgendadoEvent evento) =>
{
    // Simula a validação e liquidação instantânea no SPI (BACEN)
    var liquidado = new PagamentoPixLiquidadoEvent(
        Guid.NewGuid(),
        evento.OperacaoId,
        evento.ContaOrigemId,
        evento.Valor,
        evento.ChavePix,
        DateTime.UtcNow,
        DateTime.UtcNow
    );

    return Results.Ok(new
    {
        Mensagem = "PIX liquidado no Sistema de Pagamentos Instantâneos (SPI) com sucesso!",
        Evento = liquidado
    });
});

app.Run();

public partial class Program { }
