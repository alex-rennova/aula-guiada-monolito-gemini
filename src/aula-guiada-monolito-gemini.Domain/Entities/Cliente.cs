using aula_guiada_monolito_gemini.Domain.Common;
using aula_guiada_monolito_gemini.Domain.Enums;
using aula_guiada_monolito_gemini.Domain.ValueObjects;

namespace aula_guiada_monolito_gemini.Domain.Entities;

public class Cliente
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public Cpf Cpf { get; private set; } = null!;
    public SituacaoCadastral Situacao { get; private set; }
    public DateTime CriadoEm { get; private set; }

    private Cliente() { }

    private Cliente(Guid id, string nome, string email, Cpf cpf, SituacaoCadastral situacao, DateTime criadoEm)
    {
        Id = id;
        Nome = nome;
        Email = email;
        Cpf = cpf;
        Situacao = situacao;
        CriadoEm = criadoEm;
    }

    public static Result<Cliente> Criar(string nome, string email, string cpfRaw)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return Result.Failure<Cliente>(Error.Validation("Cliente.NomeVazio", "Nome do cliente é obrigatório."));

        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return Result.Failure<Cliente>(Error.Validation("Cliente.EmailInvalido", "Email corporativo/pessoal inválido."));

        var cpfResult = Cpf.Create(cpfRaw);
        if (cpfResult.IsFailure)
            return Result.Failure<Cliente>(cpfResult.Error);

        return Result.Success(new Cliente(
            Guid.NewGuid(),
            nome.Trim(),
            email.Trim().ToLowerInvariant(),
            cpfResult.Value,
            SituacaoCadastral.Ativo,
            DateTime.UtcNow));
    }

    public void Bloquear() => Situacao = SituacaoCadastral.Bloqueado;
    public void Ativar() => Situacao = SituacaoCadastral.Ativo;
}

