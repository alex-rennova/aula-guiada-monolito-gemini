using aula_guiada_monolito_gemini.Domain.Common;
using aula_guiada_monolito_gemini.Domain.Enums;
using aula_guiada_monolito_gemini.Domain.ValueObjects;

namespace aula_guiada_monolito_gemini.Domain.Entities;

public class PropostaSeguro
{
    public Guid Id { get; private set; }
    public Guid ClienteId { get; private set; }
    public string TipoSeguro { get; private set; } = string.Empty; // Vida, Auto, Residencial
    public Money PremioMensal { get; private set; } = null!;
    public Money CapitalSegurado { get; private set; } = null!;
    public StatusApolice Status { get; private set; }
    public DateTime SolicitadaEm { get; private set; }

    private PropostaSeguro() { }

    private PropostaSeguro(Guid id, Guid clienteId, string tipoSeguro, Money premioMensal, Money capitalSegurado, StatusApolice status, DateTime solicitadaEm)
    {
        Id = id;
        ClienteId = clienteId;
        TipoSeguro = tipoSeguro;
        PremioMensal = premioMensal;
        CapitalSegurado = capitalSegurado;
        Status = status;
        SolicitadaEm = solicitadaEm;
    }

    public static Result<PropostaSeguro> Criar(Guid clienteId, string tipoSeguro, decimal premioMensalAmount, decimal capitalSeguradoAmount)
    {
        if (clienteId == Guid.Empty)
            return Result.Failure<PropostaSeguro>(Error.Validation("Seguro.ClienteInvalido", "Cliente é obrigatório."));

        if (string.IsNullOrWhiteSpace(tipoSeguro))
            return Result.Failure<PropostaSeguro>(Error.Validation("Seguro.TipoObrigatorio", "Tipo de seguro é obrigatório."));

        var premioResult = Money.Create(premioMensalAmount);
        if (premioResult.IsFailure) return Result.Failure<PropostaSeguro>(premioResult.Error);

        var capitalResult = Money.Create(capitalSeguradoAmount);
        if (capitalResult.IsFailure) return Result.Failure<PropostaSeguro>(capitalResult.Error);

        return Result.Success(new PropostaSeguro(
            Guid.NewGuid(),
            clienteId,
            tipoSeguro.Trim(),
            premioResult.Value,
            capitalResult.Value,
            StatusApolice.Proposta,
            DateTime.UtcNow));
    }

    public void EmitirApolice() => Status = StatusApolice.Emitida;
    public void Cancelar() => Status = StatusApolice.Cancelada;
}
