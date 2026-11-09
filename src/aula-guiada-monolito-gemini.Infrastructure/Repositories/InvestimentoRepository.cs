using Microsoft.EntityFrameworkCore;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Infrastructure.Data;

namespace aula_guiada_monolito_gemini.Infrastructure.Repositories;

public sealed class InvestimentoRepository : IInvestimentoRepository
{
    private readonly AppDbContext _context;

    public InvestimentoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PosicaoInvestimento?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Investimentos.FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task AdicionarAsync(PosicaoInvestimento posicao, CancellationToken cancellationToken = default)
    {
        await _context.Investimentos.AddAsync(posicao, cancellationToken);
    }

    public Task AtualizarAsync(PosicaoInvestimento posicao, CancellationToken cancellationToken = default)
    {
        _context.Investimentos.Update(posicao);
        return Task.CompletedTask;
    }
}

