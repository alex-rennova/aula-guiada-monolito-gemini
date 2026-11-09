using Microsoft.EntityFrameworkCore;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Infrastructure.Data;

namespace aula_guiada_monolito_gemini.Infrastructure.Repositories;

public sealed class ContaRepository : IContaRepository
{
    private readonly AppDbContext _context;

    public ContaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Conta?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Contas.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<bool> ExisteNumeroAsync(string agencia, string numero, CancellationToken cancellationToken = default)
    {
        return await _context.Contas.AnyAsync(c => c.Agencia == agencia && c.Numero == numero, cancellationToken);
    }

    public async Task AdicionarAsync(Conta conta, CancellationToken cancellationToken = default)
    {
        await _context.Contas.AddAsync(conta, cancellationToken);
    }
}

