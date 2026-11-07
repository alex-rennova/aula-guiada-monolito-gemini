using aula_guiada_monolito_gemini.Domain.Common;
using aula_guiada_monolito_gemini.Domain.Enums;
using aula_guiada_monolito_gemini.Domain.ValueObjects;

namespace aula_guiada_monolito_gemini.Domain.Entities;

public class PosicaoInvestimento
{
    public Guid Id { get; private set; }
    public Guid ContaId { get; private set; }
    public string Ativo { get; private set; } = string.Empty; // ex: CDB Prefixado 12% a.a., Tesouro Selic 2029
    public TipoPosicao Tipo { get; private set; }
    public Money ValorAplicado { get; private set; } = null!;
    public Money SaldoAtual { get; private set; } = null!;
    public DateTime DataAplicacao { get; private set; }

    private PosicaoInvestimento() { }

    private PosicaoInvestimento(Guid id, Guid contaId, string ativo, TipoPosicao tipo, Money valorAplicado, Money saldoAtual, DateTime dataAplicacao)
    {
        Id = id;
        ContaId = contaId;
        Ativo = ativo;
        Tipo = tipo;
        ValorAplicado = valorAplicado;
        SaldoAtual = saldoAtual;
        DataAplicacao = dataAplicacao;
    }

    public static Result<PosicaoInvestimento> Aplicar(Guid contaId, string ativo, TipoPosicao tipo, decimal valorAmount)
    {
        if (contaId == Guid.Empty)
            return Result.Failure<PosicaoInvestimento>(Error.Validation("Investimento.ContaInvalida", "Conta é obrigatória."));

        if (string.IsNullOrWhiteSpace(ativo))
            return Result.Failure<PosicaoInvestimento>(Error.Validation("Investimento.AtivoObrigatorio", "Nome do ativo é obrigatório."));

        var valorResult = Money.Create(valorAmount);
        if (valorResult.IsFailure)
            return Result.Failure<PosicaoInvestimento>(valorResult.Error);

        return Result.Success(new PosicaoInvestimento(
            Guid.NewGuid(),
            contaId,
            ativo.Trim(),
            tipo,
            valorResult.Value,
            valorResult.Value, // inicializa saldo com o valor aplicado
            DateTime.UtcNow));
    }

    public Result Resgatar(decimal valorResgate)
    {
        if (valorResgate <= 0)
            return Result.Failure(Error.Validation("Investimento.ValorInvalido", "Valor de resgate deve ser maior que zero."));

        if (valorResgate > SaldoAtual.Amount)
            return Result.Failure(Error.Validation("Investimento.SaldoInsuficiente", "Saldo insuficiente para o resgate do investimento."));

        var novoSaldo = Money.Create(SaldoAtual.Amount - valorResgate);
        SaldoAtual = novoSaldo.Value;
        return Result.Success();
    }
}
