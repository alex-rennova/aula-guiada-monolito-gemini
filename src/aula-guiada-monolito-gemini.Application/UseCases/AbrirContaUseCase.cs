using FluentValidation;
using aula_guiada_monolito_gemini.Application.DTOs;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Domain.Common;
using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Domain.Enums;

namespace aula_guiada_monolito_gemini.Application.UseCases;

public interface IAbrirContaUseCase
{
    Task<Result<ContaDto>> ExecutarAsync(AbrirContaRequest request, CancellationToken cancellationToken = default);
}

public sealed class AbrirContaUseCase : IAbrirContaUseCase
{
    private readonly IContaRepository _contaRepository;
    private readonly IClienteRepository _clienteRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<AbrirContaRequest> _validator;

    public AbrirContaUseCase(
        IContaRepository contaRepository,
        IClienteRepository clienteRepository,
        IUnitOfWork unitOfWork,
        IValidator<AbrirContaRequest> validator)
    {
        _contaRepository = contaRepository;
        _clienteRepository = clienteRepository;
        _unitOfWork = unitOfWork;
        _validator = validator;
    }

    public async Task<Result<ContaDto>> ExecutarAsync(AbrirContaRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var erro = validationResult.Errors[0];
            return Result.Failure<ContaDto>(Error.Validation(erro.ErrorCode, erro.ErrorMessage));
        }

        var cliente = await _clienteRepository.ObterPorIdAsync(request.ClienteId, cancellationToken);
        if (cliente is null)
        {
            return Result.Failure<ContaDto>(Error.NotFound("Conta.ClienteNaoEncontrado", "Cliente titular não encontrado."));
        }

        if (cliente.Situacao != SituacaoCadastral.Ativo)
        {
            return Result.Failure<ContaDto>(Error.Validation("Conta.ClienteInativo", "Cliente com situação cadastral impeditiva para abertura de conta."));
        }

        if (await _contaRepository.ExisteNumeroAsync(request.Agencia, request.Numero, cancellationToken))
        {
            return Result.Failure<ContaDto>(Error.Conflict("Conta.NumeroExistente", "Conta já cadastrada para esta agência."));
        }

        var contaResult = Conta.Abrir(request.ClienteId, request.Numero, request.Agencia);
        if (contaResult.IsFailure)
        {
            return Result.Failure<ContaDto>(contaResult.Error);
        }

        var conta = contaResult.Value;
        await _contaRepository.AdicionarAsync(conta, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);

        return Result.Success(new ContaDto(
            conta.Id,
            conta.ClienteId,
            conta.Numero,
            conta.Agencia,
            conta.Status,
            conta.AbertaEm
        ));
    }
}

