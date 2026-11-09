using FluentValidation;
using aula_guiada_monolito_gemini.Application.DTOs;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Domain.Common;
using aula_guiada_monolito_gemini.Domain.Entities;

namespace aula_guiada_monolito_gemini.Application.UseCases;

public interface ICriarClienteUseCase
{
    Task<Result<ClienteDto>> ExecutarAsync(CriarClienteRequest request, CancellationToken cancellationToken = default);
}

public sealed class CriarClienteUseCase : ICriarClienteUseCase
{
    private readonly IClienteRepository _clienteRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<CriarClienteRequest> _validator;

    public CriarClienteUseCase(
        IClienteRepository clienteRepository,
        IUnitOfWork unitOfWork,
        IValidator<CriarClienteRequest> validator)
    {
        _clienteRepository = clienteRepository;
        _unitOfWork = unitOfWork;
        _validator = validator;
    }

    public async Task<Result<ClienteDto>> ExecutarAsync(CriarClienteRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var primeiroErro = validationResult.Errors[0];
            return Result.Failure<ClienteDto>(Error.Validation(primeiroErro.ErrorCode, primeiroErro.ErrorMessage));
        }

        if (await _clienteRepository.ExisteCpfAsync(request.Cpf, cancellationToken))
        {
            return Result.Failure<ClienteDto>(Error.Conflict("Cliente.CpfExistente", "CPF já cadastrado no banco."));
        }

        var clienteResult = Cliente.Criar(request.Nome, request.Email, request.Cpf);
        if (clienteResult.IsFailure)
        {
            return Result.Failure<ClienteDto>(clienteResult.Error);
        }

        var cliente = clienteResult.Value;
        await _clienteRepository.AdicionarAsync(cliente, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);

        return Result.Success(new ClienteDto(
            cliente.Id,
            cliente.Nome,
            cliente.Email,
            cliente.Cpf.Value,
            cliente.Situacao,
            cliente.CriadoEm
        ));
    }
}

