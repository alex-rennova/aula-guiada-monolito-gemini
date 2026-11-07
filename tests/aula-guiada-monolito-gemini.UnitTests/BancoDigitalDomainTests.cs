using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Domain.Enums;

namespace aula_guiada_monolito_gemini.UnitTests;

public class BancoDigitalDomainTests
{
    [Fact]
    public void Cliente_Criar_ComDadosValidos_DeveRetornarSucesso()
    {
        var result = Cliente.Criar("Maria da Silva", "maria@banco.com", "12345678901");

        Assert.True(result.IsSuccess);
        Assert.Equal("Maria da Silva", result.Value.Nome);
        Assert.Equal("12345678901", result.Value.Cpf.Value);
        Assert.Equal(SituacaoCadastral.Ativo, result.Value.Situacao);
    }

    [Fact]
    public void Conta_Abrir_ComTitularValido_DeveRetornarContaAtiva()
    {
        var clienteId = Guid.NewGuid();
        var result = Conta.Abrir(clienteId, "100234-5");

        Assert.True(result.IsSuccess);
        Assert.Equal(StatusConta.Ativa, result.Value.Status);
        Assert.Equal("0001", result.Value.Agencia);
    }

    [Fact]
    public void Pagamento_Criar_DeveIniciarComStatusAgendado()
    {
        var contaId = Guid.NewGuid();
        var result = OperacaoPagamento.Criar(contaId, 150.50m, "chave-pix-teste@banco.com");

        Assert.True(result.IsSuccess);
        Assert.Equal(StatusOperacao.Agendado, result.Value.Status);
        Assert.Equal(150.50m, result.Value.Valor.Amount);
    }

    [Fact]
    public void Investimento_Resgatar_ComSaldoSuficiente_DeveAtualizarSaldo()
    {
        var contaId = Guid.NewGuid();
        var posicao = PosicaoInvestimento.Aplicar(contaId, "CDB 110% CDI", TipoPosicao.CDB, 1000m).Value;

        var resgateResult = posicao.Resgatar(300m);

        Assert.True(resgateResult.IsSuccess);
        Assert.Equal(700m, posicao.SaldoAtual.Amount);
    }

    [Fact]
    public void Investimento_Resgatar_ComSaldoInsuficiente_DeveFalhar()
    {
        var contaId = Guid.NewGuid();
        var posicao = PosicaoInvestimento.Aplicar(contaId, "Tesouro Selic", TipoPosicao.TesouroDireto, 500m).Value;

        var resgateResult = posicao.Resgatar(600m);

        Assert.True(resgateResult.IsFailure);
        Assert.Equal("Investimento.SaldoInsuficiente", resgateResult.Error.Code);
    }
}

