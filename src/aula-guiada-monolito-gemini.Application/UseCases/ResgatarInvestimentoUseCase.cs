using FluentValidation;
using aula_guiada_monolito_gemini.Application.DTOs;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Domain.Common;

namespace aula_guiada_monolito_gemini.Application.UseCases;

public interface IResgatarInvestimentoUseCase
{
    Task<Result<PosicaoInvestimentoDto>> ExecutarAsync(ResgatarInvestimentoRequest request, CancellationToken cancellationToken = default);
}

public sealed class ResgatarInvestimentoUseCase : IResgatarInvestimentoUseCase
{
    private readonly IInvestimentoRepository _investimentoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<ResgatarInvestimentoRequest> _validator;

    public ResgatarInvestimentoUseCase(
        IInvestimentoRepository investimentoRepository,
        IUnitOfWork unitOfWork,
        IValidator<ResgatarInvestimentoRequest> validator)
    {
        _investimentoRepository = investimentoRepository;
        _unitOfWork = unitOfWork;
        _validator = validator;
    }

    public async Task<Result<PosicaoInvestimentoDto>> ExecutarAsync(ResgatarInvestimentoRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var erro = validationResult.Errors[0];
            return Result.Failure<PosicaoInvestimentoDto>(Error.Validation(erro.ErrorCode, erro.ErrorMessage));
        }

        var posicao = await _investimentoRepository.ObterPorIdAsync(request.PosicaoInvestimentoId, cancellationToken);
        if (posicao is null)
        {
            return Result.Failure<PosicaoInvestimentoDto>(Error.NotFound("Investimento.NaoEncontrado", "Posição de investimento não encontrada."));
        }

        var resgateResult = posicao.Resgatar(request.ValorResgate);
        if (resgateResult.IsFailure)
        {
            return Result.Failure<PosicaoInvestimentoDto>(resgateResult.Error);
        }

        await _investimentoRepository.AtualizarAsync(posicao, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);

        return Result.Success(new PosicaoInvestimentoDto(
            posicao.Id,
            posicao.ContaId,
            posicao.Ativo,
            posicao.Tipo,
            posicao.ValorAplicado.Amount,
            posicao.SaldoAtual.Amount,
            posicao.DataAplicacao
        ));
    }
}

