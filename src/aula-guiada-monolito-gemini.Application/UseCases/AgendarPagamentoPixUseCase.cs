using System.Text.Json;
using FluentValidation;
using aula_guiada_monolito_gemini.Application.DTOs;
using aula_guiada_monolito_gemini.Application.Events;
using aula_guiada_monolito_gemini.Application.Interfaces;
using aula_guiada_monolito_gemini.Domain.Common;
using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Domain.Enums;

namespace aula_guiada_monolito_gemini.Application.UseCases;

public interface IAgendarPagamentoPixUseCase
{
    Task<Result<OperacaoPagamentoDto>> ExecutarAsync(AgendarPagamentoPixRequest request, CancellationToken cancellationToken = default);
}

public sealed class AgendarPagamentoPixUseCase : IAgendarPagamentoPixUseCase
{
    private readonly IPagamentoRepository _pagamentoRepository;
    private readonly IContaRepository _contaRepository;
    private readonly IOutboxRepository _outboxRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<AgendarPagamentoPixRequest> _validator;

    public AgendarPagamentoPixUseCase(
        IPagamentoRepository pagamentoRepository,
        IContaRepository contaRepository,
        IOutboxRepository outboxRepository,
        IUnitOfWork unitOfWork,
        IValidator<AgendarPagamentoPixRequest> validator)
    {
        _pagamentoRepository = pagamentoRepository;
        _contaRepository = contaRepository;
        _outboxRepository = outboxRepository;
        _unitOfWork = unitOfWork;
        _validator = validator;
    }

    public async Task<Result<OperacaoPagamentoDto>> ExecutarAsync(AgendarPagamentoPixRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var erro = validationResult.Errors[0];
            return Result.Failure<OperacaoPagamentoDto>(Error.Validation(erro.ErrorCode, erro.ErrorMessage));
        }

        var conta = await _contaRepository.ObterPorIdAsync(request.ContaOrigemId, cancellationToken);
        if (conta is null)
        {
            return Result.Failure<OperacaoPagamentoDto>(Error.NotFound("Pagamento.ContaNaoEncontrada", "Conta de origem não encontrada."));
        }

        if (conta.Status != StatusConta.Ativa)
        {
            return Result.Failure<OperacaoPagamentoDto>(Error.Validation("Pagamento.ContaInativa", "A conta de origem precisa estar ativa para efetuar pagamentos."));
        }

        var operacaoResult = OperacaoPagamento.Criar(request.ContaOrigemId, request.Valor, request.ChavePix, request.AgendadoPara);
        if (operacaoResult.IsFailure)
        {
            return Result.Failure<OperacaoPagamentoDto>(operacaoResult.Error);
        }

        var operacao = operacaoResult.Value;

        // 1. Cria o evento de integração desacoplado
        var evento = new PagamentoPixAgendadoEvent(
            Guid.NewGuid(),
            operacao.Id,
            operacao.ContaOrigemId,
            operacao.Valor.Amount,
            operacao.CodigoBarrasOuPix,
            operacao.AgendadoPara,
            DateTime.UtcNow
        );

        // 2. Converte para OutboxMessage (Transactional Outbox Pattern)
        var outboxMessage = new OutboxMessage(
            evento.EventId,
            nameof(PagamentoPixAgendadoEvent),
            JsonSerializer.Serialize(evento),
            DateTime.UtcNow
        );

        // 3. PERSISTÊNCIA ATÔMICA ACID:
        // A OperacaoPagamento E a OutboxMessage são adicionadas no mesmo DbContext
        await _pagamentoRepository.AdicionarAsync(operacao, cancellationToken);
        await _outboxRepository.AdicionarAsync(outboxMessage, cancellationToken);

        // 4. Um único commit salva ambos!
        // Não há chamada de rede aqui: zero risco de Dual-Write!
        await _unitOfWork.CommitAsync(cancellationToken);

        return Result.Success(new OperacaoPagamentoDto(
            operacao.Id,
            operacao.ContaOrigemId,
            operacao.Valor.Amount,
            operacao.CodigoBarrasOuPix,
            operacao.Status,
            operacao.AgendadoPara,
            operacao.SolicitadoEm
        ));
    }
}
