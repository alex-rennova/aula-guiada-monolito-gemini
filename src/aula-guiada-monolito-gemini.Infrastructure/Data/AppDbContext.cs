using Microsoft.EntityFrameworkCore;
using aula_guiada_monolito_gemini.Domain.Entities;
using aula_guiada_monolito_gemini.Domain.ValueObjects;

namespace aula_guiada_monolito_gemini.Infrastructure.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // Contexto: Clientes
    public DbSet<Cliente> Clientes => Set<Cliente>();

    // Contexto: Contas
    public DbSet<Conta> Contas => Set<Conta>();

    // Contexto: Movimentação Financeira
    public DbSet<LancamentoFinanceiro> Lancamentos => Set<LancamentoFinanceiro>();

    // Contexto: Pagamentos
    public DbSet<OperacaoPagamento> Pagamentos => Set<OperacaoPagamento>();

    // Contexto: Seguros
    public DbSet<PropostaSeguro> Seguros => Set<PropostaSeguro>();

    // Contexto: Investimentos
    public DbSet<PosicaoInvestimento> Investimentos => Set<PosicaoInvestimento>();

    // Padrão Transactional Outbox
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 1. Clientes (Schema/Tabela: clientes)
        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.ToTable("clientes");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Nome).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Cpf)
                .HasConversion(cpf => cpf.Value, val => Cpf.Create(val).Value)
                .HasMaxLength(11)
                .IsRequired();
            entity.HasIndex(x => x.Cpf).IsUnique();
        });

        // 2. Contas (Schema/Tabela: contas)
        modelBuilder.Entity<Conta>(entity =>
        {
            entity.ToTable("contas");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Numero).HasMaxLength(20).IsRequired();
            entity.Property(x => x.Agencia).HasMaxLength(10).IsRequired();
            entity.HasIndex(x => new { x.Agencia, x.Numero }).IsUnique();
        });

        // 3. Movimentações Financeiras (Schema/Tabela: lancamentos_financeiros)
        modelBuilder.Entity<LancamentoFinanceiro>(entity =>
        {
            entity.ToTable("lancamentos_financeiros");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Descricao).HasMaxLength(255).IsRequired();
            entity.Property(x => x.Valor)
                .HasConversion(m => m.Amount, val => Money.Create(val).Value)
                .HasPrecision(18, 2)
                .IsRequired();
        });

        // 4. Pagamentos (Schema/Tabela: operacoes_pagamento)
        modelBuilder.Entity<OperacaoPagamento>(entity =>
        {
            entity.ToTable("operacoes_pagamento");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.CodigoBarrasOuPix).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Valor)
                .HasConversion(m => m.Amount, val => Money.Create(val).Value)
                .HasPrecision(18, 2)
                .IsRequired();
        });

        // 5. Seguros (Schema/Tabela: propostas_seguro)
        modelBuilder.Entity<PropostaSeguro>(entity =>
        {
            entity.ToTable("propostas_seguro");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.TipoSeguro).HasMaxLength(50).IsRequired();
            entity.Property(x => x.PremioMensal)
                .HasConversion(m => m.Amount, val => Money.Create(val).Value)
                .HasPrecision(18, 2)
                .IsRequired();
            entity.Property(x => x.CapitalSegurado)
                .HasConversion(m => m.Amount, val => Money.Create(val).Value)
                .HasPrecision(18, 2)
                .IsRequired();
        });

        // 6. Investimentos (Schema/Tabela: posicoes_investimento)
        modelBuilder.Entity<PosicaoInvestimento>(entity =>
        {
            entity.ToTable("posicoes_investimento");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Ativo).HasMaxLength(100).IsRequired();
            entity.Property(x => x.ValorAplicado)
                .HasConversion(m => m.Amount, val => Money.Create(val).Value)
                .HasPrecision(18, 2)
                .IsRequired();
            entity.Property(x => x.SaldoAtual)
                .HasConversion(m => m.Amount, val => Money.Create(val).Value)
                .HasPrecision(18, 2)
                .IsRequired();
        });

        // 7. Padrão Transactional Outbox (Schema/Tabela: outbox_messages)
        modelBuilder.Entity<OutboxMessage>(entity =>
        {
            entity.ToTable("outbox_messages");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Tipo).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Payload).IsRequired(); // JSON do evento
            entity.Property(x => x.CriadoEm).IsRequired();
            entity.Property(x => x.ProcessadoEm);
            entity.Property(x => x.Erro).HasMaxLength(1000);

            // Índice para busca rápida de mensagens pendentes pelo Background Worker
            entity.HasIndex(x => x.ProcessadoEm);
        });
    }
}
