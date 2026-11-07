using aula_guiada_monolito_gemini.Domain.Common;
using aula_guiada_monolito_gemini.Domain.Enums;

namespace aula_guiada_monolito_gemini.Domain.Entities;

public class Conta
{
    public Guid Id { get; private set; }
    public Guid ClienteId { get; private set; }
    public string Numero { get; private set; } = string.Empty;
    public string Agencia { get; private set; } = string.Empty;
    public StatusConta Status { get; private set; }
    public DateTime AbertaEm { get; private set; }

    private Conta() { }

    private Conta(Guid id, Guid clienteId, string numero, string agencia, StatusConta status, DateTime abertaEm)
    {
        Id = id;
        ClienteId = clienteId;
        Numero = numero;
        Agencia = agencia;
        Status = status;
        AbertaEm = abertaEm;
    }

    public static Result<Conta> Abrir(Guid clienteId, string numero, string agencia = "0001")
    {
        if (clienteId == Guid.Empty)
            return Result.Failure<Conta>(Error.Validation("Conta.ClienteInvalido", "Cliente titular é obrigatório."));

        if (string.IsNullOrWhiteSpace(numero))
            return Result.Failure<Conta>(Error.Validation("Conta.NumeroObrigatorio", "Número da conta é obrigatório."));

        return Result.Success(new Conta(
            Guid.NewGuid(),
            clienteId,
            numero.Trim(),
            agencia.Trim(),
            StatusConta.Ativa,
            DateTime.UtcNow));
    }

    public void Bloquear() => Status = StatusConta.Bloqueada;
    public void Encerrar() => Status = StatusConta.Encerrada;
}
