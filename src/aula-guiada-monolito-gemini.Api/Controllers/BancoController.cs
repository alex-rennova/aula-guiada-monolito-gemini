using Microsoft.AspNetCore.Mvc;
using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Infrastructure.Data;

namespace aula_guiada_monolito_gemini.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class BancoController : ControllerBase
{
    private readonly AppDbContext _context;

    public BancoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("visao-geral")]
    public ActionResult GetVisaoGeral()
    {
        return Ok(new
        {
            Banco = "Banco Digital Monólito",
            Canais = new[] { "Mobile Banking", "Internet Banking", "Open Finance API", "PIX Gateway" },
            AreasNegocio = new[]
            {
                new { Modulo = "Clientes", Papel = "Identificação e situação cadastral do cliente" },
                new { Modulo = "Contas", Papel = "Titulares, agências e ciclo de vida da conta" },
                new { Modulo = "MovimentacaoFinanceira", Papel = "Lançamentos, reservas, saldos e extratos" },
                new { Modulo = "Pagamentos", Papel = "Agendamento, liquidação e estados de operações PIX/Boletos" },
                new { Modulo = "Seguros", Papel = "Contratação de propostas e emissão de apólices" },
                new { Modulo = "Investimentos", Papel = "Aplicações financeiras (CDB/Tesouro), posições e resgates" }
            },
            BancoDeDados = "PostgreSQL (Schema unificado com limites de contextos preparados para microsserviços)"
        });
    }
}

