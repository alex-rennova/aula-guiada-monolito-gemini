const pixLessons = {
    aula04: {
        tag: "Laboratório Pix · 1 de 3",
        title: "Antes da Outbox: faça o Pix falhar",
        desc: "Agende um Pix de R$ 150, derrube uma das duas gravações e compare o que ficou no banco com o que chegou à fila.",
        content: `
            <section class="section lab-prose">
                <h3 class="section-title">A encomenda que ninguém foi buscar</h3>
                <p>Você encomendou um bolo de aniversário. A confeitaria anotou o pedido no livro, mas o telefone que avisa o entregador quebrou. A loja consegue provar que aceitou o pedido. O entregador sequer sabe que existe um bolo para buscar. Agora inverta a ordem. O entregador sai com a ficha antes de o caixa registrar a encomenda. Se o caixa rejeitar o pedido, alguém pode tentar entregar um bolo que nunca foi confirmado.</p>
                <figure class="lab-figure">
                    <img src="assets/images/outbox-confeitaria.png" width="1774" height="887" alt="Três quadros da confeitaria. Primeiro, o pedido é registrado enquanto o entregador sai e o telefone está quebrado. Depois, duas vias da ficha 42 ficam no livro e na bandeja. Por fim, duas fichas iguais resultam em uma única entrega.">
                    <figcaption>Comece pelo quadro 1. O livro representa o PostgreSQL e o aviso ao entregador representa a publicação. Os quadros 2 e 3 voltam nas próximas etapas.</figcaption>
                </figure>
                <p>No Banco Digital, o livro guarda a operação com status <code>Agendado</code>. O aviso é o evento de agendamento. O laboratório acompanha esses registros. O agendamento deste projeto ainda não realiza débito nem liquidação.</p>
                <p><strong>Dual-write</strong> ocorre aqui quando o mesmo pedido depende de uma gravação no PostgreSQL e de outra no broker, cada uma com sua própria confirmação. Mudar a ordem muda o rastro deixado pela falha.</p>
            </section>

            <section class="section lab-prose">
                <h3 class="section-title">1. Prepare o laboratório</h3>
                <ol>
                    <li>Abra um PowerShell na raiz do repositório. Use o SDK .NET 10 e um PostgreSQL de laboratório com permissão para criar schemas. Cada teste cria e remove um schema isolado.</li>
                    <li>Se já tem um banco de testes, aponte <code>BANCO_TEST_POSTGRES</code> para ele. A opção abaixo cria um banco descartável com Docker em uma porta local separada.</li>
                    <li>Espere o <code>pg_isready</code> indicar que o PostgreSQL aceita conexões. O broker, nesta etapa, é simulado no teste para que você controle com precisão onde ocorre a falha.</li>
                </ol>
                <pre class="lab-code"><code>docker run --rm -d --name banco-outbox-aula -p 127.0.0.1:55432:5432 -e POSTGRES_PASSWORD=aula-local -e POSTGRES_DB=outbox_aula postgres:18
docker exec banco-outbox-aula pg_isready -U postgres -d outbox_aula
$env:BANCO_TEST_POSTGRES = 'Host=127.0.0.1;Port=55432;Database=outbox_aula;Username=postgres;Password=aula-local'
$projeto = (Get-ChildItem tests/*IntegrationTests/*.csproj).FullName</code></pre>
                <p>Use a senha do exemplo apenas no contêiner local descartável. Se a variável de conexão estiver ausente, os testes de PostgreSQL aparecem como ignorados. Mantenha o banco ligado para a etapa seguinte.</p>
            </section>

            <section class="section lab-prose">
                <h3 class="section-title">2. Escreva o teste com o banco primeiro</h3>
                <p>Antes de executar, anote sua previsão. Depois de confirmar a transação do Pix e antes de publicar o evento, o broker fica indisponível. Quantos pagamentos, eventos e mensagens de outbox você espera encontrar?</p>
                <pre class="lab-code"><code>await escrita.SaveChangesAsync();
await Assert.ThrowsAsync&lt;TimeoutException&gt;(
    () =&gt; fila.PublicarAsync(pagamento.Id));

await using var leitura = new AppDbContext(options);
Assert.True(await leitura.Pagamentos.AnyAsync(p =&gt; p.Id == pagamento.Id));
Assert.Empty(fila.OperacoesRecebidas);
Assert.False(await leitura.OutboxMessages.AnyAsync());</code></pre>
                <p><code>SaveChangesAsync</code> confirma o pagamento antes da tentativa de publicação. A falha é injetada pelo teste, antes de a fila simulada aceitar o evento. O novo <code>DbContext</code> lê o que foi realmente persistido. Uma entidade acompanhada pelo contexto original pode existir só na memória.</p>
                <p>Em um sistema distribuído, um timeout também pode acontecer depois que o broker aceitou o evento, com perda da resposta. Aqui escolhemos deliberadamente o caso em que a publicação nem chegou à fila. A ambiguidade da confirmação reaparece na terceira etapa.</p>
            </section>

            <section class="section lab-prose">
                <h3 class="section-title">3. Escreva o teste na ordem inversa</h3>
                <p>Agora a fila aceita o evento primeiro. O teste adiciona uma restrição <code>CHECK (false)</code> à tabela vazia de pagamentos do schema descartável. O PostgreSQL rejeita a próxima inserção de forma determinística. O erro de persistência não consegue retirar o evento que já foi aceito pela fila.</p>
                <pre class="lab-code"><code>await fila.PublicarAsync(pagamento.Id);
await Assert.ThrowsAsync&lt;DbUpdateException&gt;(() =&gt; escrita.SaveChangesAsync());

await using var leitura = new AppDbContext(options);
Assert.Equal(pagamento.Id, Assert.Single(fila.OperacoesRecebidas));
Assert.False(await leitura.Pagamentos.AnyAsync(p =&gt; p.Id == pagamento.Id));</code></pre>
                <p>Encontre os dois testes em <code>tests/aula-guiada-monolito-gemini.IntegrationTests/LaboratorioOutboxTests.cs</code>. Rode apenas os cenários de dual-write.</p>
                <pre class="lab-code"><code>dotnet test $projeto --filter 'FullyQualifiedName~DualWrite_'</code></pre>
                <details class="lab-answer">
                    <summary>Confira o resultado esperado</summary>
                    <dl>
                        <dt>Banco primeiro</dt>
                        <dd>Um pagamento, zero eventos e zero mensagens pendentes. O registro ficou sem um caminho de entrega criado por essa execução.</dd>
                        <dt>Fila primeiro</dt>
                        <dd>Zero pagamentos e um evento. O consumidor pode receber uma referência para uma operação que o banco rejeitou.</dd>
                    </dl>
                    <p>Os dois testes devem passar. Um teste verde aqui confirma que você conseguiu reproduzir a inconsistência da abordagem experimental.</p>
                </details>
                <p><strong>Checkpoint.</strong> Explique por que colocar <code>try/catch</code> em volta das duas chamadas não faz uma transação do PostgreSQL desfazer uma publicação que a fila já aceitou.</p>
                <a class="lab-next" href="#aula05">Avançar para 2 · Implemente a Outbox →</a>
            </section>`
    },
    aula05: {
        tag: "Laboratório Pix · 2 de 3",
        title: "Transactional Outbox: corrija as duas falhas",
        desc: "Coloque o pagamento e a intenção de publicar na mesma transação. Depois teste separadamente o que acontece quando o despachante tenta publicar.",
        content: `
            <section class="section lab-prose">
                <h3 class="section-title">1. Use duas vias da mesma ficha</h3>
                <p>Volte ao quadro 2 da confeitaria. Uma via da ficha 42 fica no livro e a outra entra na bandeja de expedição. As duas fazem parte do mesmo fechamento do pedido. O telefone pode continuar quebrado. Quando a comunicação voltar, alguém consegue consultar a bandeja e descobrir o que ainda precisa ser entregue.</p>
                <p>No código, a operação vai para <code>operacoes_pagamento</code> e a intenção de publicar vai para <code>outbox_messages</code>. Ambas entram no mesmo <code>AppDbContext</code> e são gravadas pelo mesmo <code>SaveChangesAsync</code>. A mensagem contém um identificador estável, o tipo de evento, o JSON e a data de criação. Ela nasce com <code>ProcessadoEm = null</code>.</p>
                <pre class="lab-code"><code>var outboxMessage = new OutboxMessage(
    evento.EventId,
    nameof(PagamentoPixAgendadoEvent),
    JsonSerializer.Serialize(evento),
    DateTime.UtcNow);

await _pagamentoRepository.AdicionarAsync(operacao, cancellationToken);
await _outboxRepository.AdicionarAsync(outboxMessage, cancellationToken);
await _unitOfWork.CommitAsync(cancellationToken);</code></pre>
                <p>Abra <code>AgendarPagamentoPixUseCase.cs</code>. Siga as chamadas de <code>AdicionarAsync</code> nos dois repositórios e confirme que elas preparam inserções no contexto. Abra <code>UnitOfWork.cs</code> e localize o <code>SaveChangesAsync</code>. Se cada repositório confirmasse a própria transação, a garantia do exemplo desapareceria.</p>
                <p><strong>Estado esperado da API.</strong> Uma resposta de sucesso confirma o agendamento. A liquidação é uma etapa posterior. Se houver retry da requisição HTTP depois de a resposta se perder, um novo evento pode ser criado. Esse problema exige idempotência na entrada, com um identificador estável da solicitação do cliente.</p>
            </section>

            <section class="section lab-prose">
                <h3 class="section-title">2. Prove a gravação conjunta no PostgreSQL</h3>
                <p>Primeiro agende um Pix com os repositórios reais. Em outro contexto, busque a operação e a mensagem. Abra o JSON e compare o <code>OperacaoId</code> com o ID do pagamento e o <code>EventId</code> com o ID da outbox. Verifique também que o carimbo de processamento ainda está vazio.</p>
                <p>Depois force a falha na <strong>segunda tabela</strong> do agendamento. No teste de rollback, a restrição <code>CHECK (false)</code> está na outbox. Isso obriga o banco a rejeitar o commit. Abra um contexto novo e confirme que as duas tabelas continuam vazias. A conta criada para preparar o cenário foi gravada antes e continua existindo.</p>
                <pre class="lab-code"><code>dotnet test $projeto --filter 'FullyQualifiedName~LaboratorioOutboxTests.Outbox_'</code></pre>
                <p>O teste unitário do caso de uso conta chamadas ao commit com um dublê. O teste com PostgreSQL comprova o efeito da transação no banco. Os dois protegem partes diferentes do comportamento.</p>
            </section>

            <section class="section lab-prose">
                <h3 class="section-title">3. Ligue o despachante e simule uma falha</h3>
                <ol>
                    <li>O <code>OutboxMessageDispatcher</code> consulta as mensagens pendentes em lotes. Para um <code>PagamentoPixAgendadoEvent</code>, ele lê o JSON e recupera o mesmo identificador criado no agendamento.</li>
                    <li>Ele chama <code>IEventBus.PublicarAsync</code>. Se a publicação falhar, registra o erro e deixa o carimbo vazio para permitir nova tentativa.</li>
                    <li>Se o barramento aceitar a mensagem, ele marca a linha como processada e grava a alteração. Se esse commit falhar, uma próxima leitura do banco decide o que continua pendente.</li>
                </ol>
                <pre class="lab-code"><code>dotnet test $projeto --filter 'FullyQualifiedName~OutboxMessageDispatcherTests'</code></pre>
                <p>O teste verifica dois casos. Quando a publicação é aceita, o mesmo evento é enviado e recebe carimbo. Quando o barramento lança uma exceção, o erro aparece na linha e o carimbo continua vazio. Antes da correção, o teste expõe o carimbo de sucesso sem uma chamada de publicação.</p>
                <details class="lab-answer">
                    <summary>Checkpoint · O que o carimbo prova?</summary>
                    <p>Neste repositório o barramento é um canal em memória. O carimbo indica que esse canal aceitou o evento. Se o processo morrer, os itens do canal podem desaparecer. Um serviço em outro processo também precisa de um transporte que atravesse essa fronteira. A próxima aula propõe a confirmação de um broker durável e a deduplicação no consumidor.</p>
                </details>
                <a class="lab-next" href="#aula06">Avançar para 3 · Investigue a Reentrega →</a>
            </section>`
    },
    aula06: {
        tag: "Laboratório Pix · 3 de 3 · Desafio guiado",
        title: "Reentrega, Inbox e investigação de incidentes",
        desc: "Descubra por que uma mesma mensagem pode chegar duas vezes e desenhe um consumidor que aplique o efeito uma vez.",
        content: `
            <section class="section lab-prose">
                <h3 class="section-title">O ingresso 17 já entrou</h3>
                <figure class="lab-figure">
                    <img src="assets/images/inbox-cinema.png" width="1774" height="887" alt="Dois quadros de um cinema. O ingresso 17 é validado e registrado na primeira passagem. Uma segunda apresentação do mesmo ingresso encontra o registro e mantém a catraca fechada.">
                    <figcaption>O número do ingresso identifica uma entrada. Uma segunda cópia do mesmo ingresso não dá direito a uma segunda passagem.</figcaption>
                </figure>
                <p>No cinema, a atendente consulta o número do ingresso. No Pix, o consumidor consulta ou registra o <code>EventId</code>. Dois Pix legítimos de R$ 150, para a mesma chave e no mesmo minuto, continuam sendo dois pedidos. Por isso, valor, chave e minuto são uma má chave de deduplicação. Para reentregas, use o identificador estável do evento original.</p>
            </section>

            <section class="section lab-prose">
                <h3 class="section-title">1. Preveja a janela de falha</h3>
                <p>Imagine que um broker durável confirme a publicação e, logo depois, o monólito caia antes de gravar <code>ProcessadoEm</code>. Ao reiniciar, a outbox ainda parece pendente e o produtor pode publicar o mesmo evento de novo. Também há outro ponto de reentrega. O consumidor pode confirmar seu banco local e cair antes de enviar o ACK ao broker.</p>
                <p>A confirmação do produtor informa que o broker aceitou a publicação conforme a configuração do transporte. O ACK do consumidor informa que aquela entrega foi tratada. Teste as duas janelas separadamente, sempre repetindo o mesmo <code>EventId</code>.</p>
            </section>

            <section class="section lab-prose">
                <h3 class="section-title">2. Implemente o desafio com uma Inbox</h3>
                <p>Esta etapa é um exercício de implementação. A API atual publica em memória e o <code>PixService</code> tem uma rota de simulação. Para testar entre processos, use um broker como RabbitMQ, configure uma fila durável e implemente publicação com confirmação e consumo com ACK manual.</p>
                <ol>
                    <li><strong>Comece pelo teste.</strong> Entregue duas vezes o mesmo evento ao consumidor. Use uma barreira no teste para simular também dois consumidores recebendo o evento ao mesmo tempo.</li>
                    <li><strong>Defina a Inbox.</strong> Crie uma tabela local de mensagens tratadas com unicidade em <code>EventId</code>. Dentro da transação, tente inserir esse ID de forma atômica, por exemplo com <code>INSERT ... ON CONFLICT DO NOTHING</code>. Use o resultado da inserção para decidir se aplica a mudança de estado.</li>
                    <li><strong>Grave o efeito na mesma transação.</strong> Se a primeira tentativa falhar antes do commit, o ID e a mudança de estado devem voltar juntos. Se o commit concluir e o ACK se perder, a próxima tentativa detecta o ID e pode confirmar a entrega sem repetir o efeito.</li>
                    <li><strong>Mostre a evidência.</strong> Capture duas entregas nos logs, uma linha na Inbox e uma única transição local de estado. Em seguida envie um segundo Pix legítimo com outro ID e confirme que ele também é processado.</li>
                </ol>
                <p>Se a liquidação chamar um provedor externo, a transação local da Inbox só protege os efeitos no próprio banco. Investigue como o provedor recebe uma chave de idempotência ou permite consultar e reconciliar uma tentativa ambígua.</p>
                <details class="lab-answer">
                    <summary>Checkpoint · Em qual ordem eu confirmo?</summary>
                    <p>Receba o evento, abra a transação, registre o ID e aplique a mudança local, confirme o banco e só então envie o ACK. Para uma duplicata cujo ID já está confirmado, encerre a tentativa e envie o ACK. Para falha transitória, combine retentativas com espera crescente e limite. Para uma mensagem inválida, defina um destino de quarentena e uma forma explícita de revisar e reprocessar.</p>
                </details>
            </section>

            <section class="section lab-prose">
                <h3 class="section-title">3. Investigue um Pix que ficou parado</h3>
                <p>Você recebeu um chamado sobre um pagamento agendado há dez minutos. Comece pelo <code>OperacaoId</code>. Confira o estado da operação, o <code>EventId</code> correspondente, a idade da mensagem e o último erro. Se a linha tiver carimbo, procure confirmação de publicação e, depois, o registro da Inbox. Use os IDs nos logs e evite registrar a chave Pix e o JSON completo.</p>
                <p>Para acompanhar o sistema, proponha um alerta pela idade da mensagem pendente mais antiga, métricas de falhas de publicação e reentregas, e uma forma de correlacionar as etapas. Se uma dependência remota ficar instável, explique onde usar retry com jitter e onde um circuit breaker reduziria chamadas inúteis durante a falha.</p>
                <p><strong>Entrega do laboratório.</strong> Registre a previsão, o teste reproduzível, o estado observado em cada parada e uma decisão de arquitetura. Em que condições o Pix merece virar um processo separado? Que garantias e custos essa escolha muda?</p>
                <pre class="lab-code"><code># Encerre apenas o contêiner descartável criado na primeira etapa
docker stop banco-outbox-aula
Remove-Item Env:BANCO_TEST_POSTGRES</code></pre>
            </section>`
    }
};
