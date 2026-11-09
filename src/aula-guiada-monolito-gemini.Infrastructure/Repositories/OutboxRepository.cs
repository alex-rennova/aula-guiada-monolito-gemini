using Microsoft.EntityFrameworkCore;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Infrastructure.Data;

namespace aula_guiada_monolito_gemini.Infrastructure.Repositories;

public sealed class OutboxRepository : IOutboxRepository
{
    private readonly AppDbContext _context;

    public OutboxRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AdicionarAsync(OutboxMessage message, CancellationToken cancellationToken = default)
    {
        await _context.OutboxMessages.AddAsync(message, cancellationToken);
    }

    public async Task<List<OutboxMessage>> ObterMensagensPendentesAsync(int limite = 20, CancellationToken cancellationToken = default)
    {
        return await _context.OutboxMessages
            .Where(m => m.ProcessadoEm == null)
            .OrderBy(m => m.CriadoEm)
            .Take(limite)
            .ToListAsync(cancellationToken);
    }
}
