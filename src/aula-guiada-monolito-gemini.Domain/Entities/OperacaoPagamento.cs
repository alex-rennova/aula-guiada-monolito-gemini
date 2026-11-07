using aula_guiada_monolito_gemini.Domain.Common;
using aula_guiada_monolito_gemini.Domain.Enums;
using aula_guiada_monolito_gemini.Domain.ValueObjects;

namespace aula_guiada_monolito_gemini.Domain.Entities;

public class OperacaoPagamento
{
    public Guid Id { get; private set; }
    public Guid ContaOrigemId { get; private set; }
    public Money Valor { get; private set; } = null!;
    public string CodigoBarrasOuPix { get; private set; } = string.Empty;
    public StatusOperacao Status { get; private set; }
    public DateTime AgendadoPara { get; private set; }
    public DateTime SolicitadoEm { get; private set; }

    private OperacaoPagamento() { }

    private OperacaoPagamento(Guid id, Guid contaOrigemId, Money valor, string codigo, StatusOperacao status, DateTime agendadoPara, DateTime solicitadoEm)
    {
        Id = id;
        ContaOrigemId = contaOrigemId;
        Valor = valor;
        CodigoBarrasOuPix = codigo;
        Status = status;
        AgendadoPara = agendadoPara;
        SolicitadoEm = solicitadoEm;
    }

    public static Result<OperacaoPagamento> Criar(Guid contaOrigemId, decimal valorAmount, string codigo, DateTime? agendadoPara = null)
    {
        if (contaOrigemId == Guid.Empty)
            return Result.Failure<OperacaoPagamento>(Error.Validation("Pagamento.ContaInvalida", "Conta de origem é obrigatória."));

        if (string.IsNullOrWhiteSpace(codigo))
            return Result.Failure<OperacaoPagamento>(Error.Validation("Pagamento.DestinoInvalido", "Chave Pix ou Código de Barras é obrigatório."));

        var valorResult = Money.Create(valorAmount);
        if (valorResult.IsFailure)
            return Result.Failure<OperacaoPagamento>(valorResult.Error);

        var dataAgendamento = agendadoPara ?? DateTime.UtcNow;

        return Result.Success(new OperacaoPagamento(
            Guid.NewGuid(),
            contaOrigemId,
            valorResult.Value,
            codigo.Trim(),
            StatusOperacao.Agendado,
            dataAgendamento,
            DateTime.UtcNow));
    }

    public void Liquidar() => Status = StatusOperacao.Liquidado;
    public void Falhar() => Status = StatusOperacao.Falha;
    public void Cancelar() => Status = StatusOperacao.Cancelado;
}

