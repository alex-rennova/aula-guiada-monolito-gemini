using aula_guiada_monolito_gemini.Domain.Common;
using aula_guiada_monolito_gemini.Domain.Enums;
using aula_guiada_monolito_gemini.Domain.ValueObjects;

namespace aula_guiada_monolito_gemini.Domain.Entities;

public class LancamentoFinanceiro
{
    public Guid Id { get; private set; }
    public Guid ContaId { get; private set; }
    public Money Valor { get; private set; } = null!;
    public TipoLancamento Tipo { get; private set; }
    public string Descricao { get; private set; } = string.Empty;
    public DateTime RealizadoEm { get; private set; }

    private LancamentoFinanceiro() { }

    private LancamentoFinanceiro(Guid id, Guid contaId, Money valor, TipoLancamento tipo, string descricao, DateTime realizadoEm)
    {
        Id = id;
        ContaId = contaId;
        Valor = valor;
        Tipo = tipo;
        Descricao = descricao;
        RealizadoEm = realizadoEm;
    }

    public static Result<LancamentoFinanceiro> Criar(Guid contaId, decimal valorAmount, TipoLancamento tipo, string descricao)
    {
        if (contaId == Guid.Empty)
            return Result.Failure<LancamentoFinanceiro>(Error.Validation("Lancamento.ContaInvalida", "Conta é obrigatória."));

        var valorResult = Money.Create(valorAmount);
        if (valorResult.IsFailure)
            return Result.Failure<LancamentoFinanceiro>(valorResult.Error);

        return Result.Success(new LancamentoFinanceiro(
            Guid.NewGuid(),
            contaId,
            valorResult.Value,
            tipo,
            descricao.Trim(),
            DateTime.UtcNow));
    }
}
