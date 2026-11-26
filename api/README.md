# API BarberMais

API do sistema de agendamento e gestão de agenda da BarberMais (uma única barbearia). NestJS 12 em Node.js 24 LTS, TypeScript estrito, módulos ESM.

## Como rodar

```bash
cp .env.example .env     # ajuste os valores; o .env não vai para o git
npm install
npm run start:dev        # API em modo desenvolvimento, com recarga
```

## Docker (RNF-14)

Sobe o PostgreSQL 18, aplica as migrations e sobe a API com um único comando, a partir de `api/`, mesmo com o banco vazio:

```bash
cp .env.example .env
docker compose up -d --build
```

- O Compose se chama `barbermais` e tem três serviços: `postgres` (imagem `postgres:18`), `migrate` e `api`. Os dois últimos usam a mesma imagem, construída pelo `Dockerfile` e executada como o usuário `node`.
- O `migrate` roda `prisma migrate deploy` e termina. A `api` só inicia depois que o banco fica saudável (`pg_isready` por TCP, porque durante a inicialização o servidor temporário do PostgreSQL só escuta no socket local) **e** o `migrate` termina com sucesso. Se uma migration falhar, a API não sobe: veja `docker compose logs migrate`.
- Em um reinício com os dados já existentes, o `migrate` não reaplica nada ("No pending migrations to apply").
- A imagem traz o `openssl` e o motor de migrations do Prisma, baixado no build (o npm bloqueia o `postinstall` do `@prisma/engines`, então o `Dockerfile` roda esse script de propósito). Sem isso o `migrate` teria que baixar o motor a cada subida. O `prisma` (a CLI) está em `dependencies` de propósito: a imagem de produção roda `prisma migrate deploy` e o `npm prune --omit=dev` removeria a CLI se ela ficasse só em `devDependencies`.
- O banco fica em `127.0.0.1:5432`, acessível só da própria máquina. A API fica na porta `PORT`.
- Os dados ficam no volume `postgres_data`, montado em `/var/lib/postgresql`: a partir do PostgreSQL 18 a imagem guarda os dados em `/var/lib/postgresql/18/docker`, e montar em `/var/lib/postgresql/data` não persistiria.
- `docker compose down` mantém os dados; `docker compose down -v` apaga o volume.
- Sem `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` ou `PORT` no `.env`, o Compose se recusa a subir e diz qual falta.
- Conferir o banco: `docker compose exec postgres psql -U <POSTGRES_USER> -d <POSTGRES_DB> -c "SELECT version(), uuidv7();"`.

## Variáveis de ambiente (RNF-14)

A API valida as variáveis ao subir (`src/config/env.validation.ts`). Todas as que ela lê são obrigatórias e não têm valor padrão: se faltar alguma ou for inválida, a API não inicia e lista quais são. O arquivo `.env` não vai para o git; o modelo é o `.env.example`. Cada tarefa que precisar de uma variável nova a declara em `env.validation.ts` e no `.env.example` e a documenta nesta tabela.

| Variável | Valores | Uso |
|---|---|---|
| `NODE_ENV` | `development`, `production` ou `test` | Ambiente de execução |
| `PORT` | inteiro de 1 a 65535 | Porta HTTP da API |
| `POSTGRES_USER` | texto | Usuário do PostgreSQL (lido só pelo Docker Compose, por enquanto) |
| `POSTGRES_PASSWORD` | texto, não vazio | Senha do PostgreSQL (lido só pelo Docker Compose, por enquanto) |
| `POSTGRES_DB` | texto | Banco criado na primeira subida (lido só pelo Docker Compose, por enquanto) |
| `DATABASE_URL` | `postgresql://usuario:senha@host:porta/banco` | Conexão da API e do Prisma com o banco |

No `.env`, `DATABASE_URL` aponta para `localhost`, para a API e o Prisma rodando na sua máquina. No Docker, o Compose a substitui por uma URL montada com `POSTGRES_*` e o host `postgres`. Se a senha tiver caracteres especiais (`@`, `:`, `/`, `#`), ela precisa ser codificada na URL. Mantenha `DATABASE_URL` e `POSTGRES_*` com os mesmos valores.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run build` | Compila para `dist/` |
| `npm run lint` | Verifica o código com o oxlint |
| `npm run format` | Formata com o Prettier |
| `npm run start:dev` | Sobe em modo desenvolvimento |
| `npm run start:prod` | Sobe o build de `dist/` |
| `npx prisma migrate dev --name <nome>` | Cria e aplica uma migration a partir do `schema.prisma` (desenvolvimento) |
| `npx prisma migrate deploy` | Aplica as migrations pendentes (sem criar nenhuma) |
| `npx prisma generate` | Gera o client em `src/generated/prisma` |

## Banco de dados (Prisma 7)

- O modelo fica em `prisma/schema.prisma`, com os nomes iguais aos do diagrama de classes, em camelCase, também no banco (tabela `"Usuario"`, coluna `"trocaSenhaPendente"`). Em SQL escrito à mão, os identificadores levam aspas duplas.
- A URL do banco fica em `prisma.config.ts`, que lê o `.env`; o schema não tem URL.
- O client é gerado em `src/generated/prisma`, que não vai para o git. O `migrate dev` do Prisma 7 não gera o client: depois de mudar o schema, rode `npx prisma generate`. O Dockerfile já gera o client no build.
- O Prisma 7 exige driver adapter; a API usa `@prisma/adapter-pg`, criado em `src/database/prisma.service.ts`. Só os repositories injetam o `PrismaService`.
- No Docker as migrations são aplicadas pelo serviço `migrate`. Para rodar a API e o Prisma fora do Docker, suba só o banco e aplique pela sua máquina:

```bash
docker compose up -d postgres
npx prisma migrate deploy
```

## Transações e registro de operações (RNF-11)

- As transações usam `nestjs-cls` com o adaptador do Prisma. O service abre a transação com `@Transactional()` e os repositories usam `TransactionHost` (`txHost.tx`) em vez do `PrismaService`: assim tudo que o service grava, inclusive o registro da operação, entra na mesma transação. Se o método lançar um erro, tudo é desfeito. Nunca use `prisma.$transaction` direto.
- Para registrar uma operação sensível, o service de cada módulo chama `RegistroOperacaoService.registrar({ origem, operacao, entidade, idItem, valorAnterior? })` dentro de um método `@Transactional()`. Fora de uma transação ele se recusa a gravar.
- `operacao` e `entidade` são enums em `src/registro-operacao/operacao.ts`. Uma operação nova entra ali.
- O responsável é o usuário autenticado, lido de `ContextoRequisicao.usuarioId` (`src/common/contexto-requisicao.ts`), que o guard de autenticação preenche. Nunca vem do corpo da requisição. `origem` diz de quem é a operação: `Origem.Usuario` (toda ação feita por uma pessoa) exige o usuário no contexto e, sem ele, o `registrar` lança `ErroResponsavelAusente` (vira `500`, e o nome do erro aparece no log) em vez de gravar sem responsável; `Origem.Sistema` (tarefas automáticas, sem usuário) grava o responsável vazio, mesmo que haja usuário no contexto.
- `valorAnterior` nunca guarda dado pessoal. Na troca de e-mail de profissional ele fica vazio.
- A tabela `"RegistroOperacao"` é imutável: um trigger do banco rejeita `UPDATE`, `DELETE` e `TRUNCATE`, e o repository só insere e lê. Não existe rota de edição nem de exclusão.
- O trigger está numa migration escrita à mão. Para criar uma migration assim: `npx prisma migrate dev --create-only --name <nome>`, escrever o SQL no arquivo gerado e rodar `npx prisma migrate dev`. O Prisma não toca em triggers e funções que não estão no `schema.prisma`.
- Em desenvolvimento, linhas de `"RegistroOperacao"` só saem com `npx prisma migrate reset` ou apagando o volume do banco (`docker compose down -v`), nunca por `DELETE`.

## Logs técnicos

- Usam o `Logger` do Nest e saem na saída padrão (`docker compose logs api`). Em desenvolvimento (`NODE_ENV` diferente de `production`): texto colorido, níveis `log`, `warn`, `error`, `fatal`, `debug` e `verbose`. Em produção: uma linha JSON por evento, níveis `log`, `warn`, `error` e `fatal`; erros vão para a saída de erro. A configuração fica em `src/common/logger.ts`.
- **Cada requisição** gera uma linha ao terminar, inclusive as barradas antes de chegar ao controller (login recusado, 401, 403, rota inexistente): método, caminho **sem a query string**, status, duração em ms, `requestId` e, quando há usuário autenticado, `usuarioId`. O nível segue o status: até 399 `log`, 400 a 499 `warn`, 500 em diante `error`. O `requestId` é gerado pela API e devolvido no cabeçalho `x-request-id`, para o front ou um usuário informar qual requisição falhou. O código está em `src/common/log-requisicao.ts`.
- Erros não tratados (500) são registrados pelo Nest com a pilha, no contexto `ExceptionsHandler`, logo antes da linha da requisição.
- Na subida e no encerramento: `Bootstrap` (porta), `PrismaService` (conexão aberta e fechada). O encerramento por `SIGTERM` (por exemplo, `docker compose stop`) fecha a conexão com o banco.
- Convenção nos services: `private readonly logger = new Logger(NomeDoService.name)` e um log de nível `log` depois de cada operação de negócio concluída, com os identificadores envolvidos. Dentro de uma transação, uma linha escrita antes do fim do método pode descrever algo que depois será desfeito: use `debug` nesses casos, como em `RegistroOperacaoService`.
- **Nunca registrar**: corpo da requisição, cabeçalhos, query string, senhas, tokens, nome, telefone ou e-mail. Registrar só identificadores (`id`). O `redact` do logger (`password`, `senha`, `token`, `authorization`, `email` e similares) é uma rede de proteção para objetos passados ao logger, não uma licença para logar esses dados.
- Limites conhecidos: só a linha da requisição traz o `requestId`; as demais linhas (inclusive a pilha do erro 500) não o trazem e se ligam à requisição pelo horário. A retenção de 90 dias dos registros de erro depende de para onde a saída padrão for enviada, e a hospedagem ainda não foi decidida; o `docker compose` guarda os logs só enquanto o contêiner existir.

## Erros e validação

- **Formato único** de toda resposta de erro (`src/common/erros/`): `{ statusCode, codigo, message, requestId, erros? }`. `codigo` é o código `MSGE-nn` da documentação ou um código técnico; `message` é o texto exato da documentação; `requestId` é o mesmo do cabeçalho `x-request-id`; `erros` só aparece na validação, um item por campo: `{ campo, codigo, message }`. O `codigo` e a `message` do topo são os do primeiro item.
- **Quem produz o erro**: o service lança `new ErroDeNegocio(Mensagens.MSGE_05)`; o catálogo (`src/common/mensagens/mensagens.ts`) tem as 49 mensagens do Cap. 5, com código, status HTTP e texto exatos, e funções para as que têm variável (`Mensagens.MSGE_40(minutos)`, `Mensagens.MSGE_09(dia, abertura, fechamento)`). O catálogo foi gerado a partir da tabela do Cap. 5 e conferido nela (49 de 49); se o Cap. 5 mudar, gerar de novo e conferir.
- **Quem formata**: o filtro global `FiltroExcecoes` pega tudo (erros de negócio, do Nest, JSON malformado e falhas inesperadas) e responde no formato único. O texto da resposta vem sempre do catálogo, nunca da exceção original, então nenhum detalhe interno vaza. Falha inesperada vira `500` com `ERRO_INTERNO`; o filtro registra só os `5xx`, com o `requestId` (os `4xx` já saem na linha da requisição). O log de qualquer exceção leva só o nome, o `code` (quando é texto) e as linhas `at …` da pilha, nunca a mensagem, porque ela pode trazer valores dos dados, como e-mail ou token. O status só é aproveitado de `HttpException` ou de erro com `expose === true` (os do leitor de corpo, como `413`); qualquer outro objeto com `status` ou `statusCode`, como um erro de biblioteca, vira `500` `ERRO_INTERNO`, para um `401` de fora não se passar por sessão expirada.
- **Status por mensagem**: `400` campo inválido, `409` valor repetido, `422` regra de negócio recusada, `401` credenciais (MSGE-39) e sessão (MSGE-48), `403` sem permissão ou acesso inativo (MSGE-47, 49), `429` bloqueio por tentativas (MSGE-40). Nunca `401` para erro que não seja de sessão ou de login, porque o front pode tratar qualquer `401` como sessão perdida. Sem token, token inválido ou expirado: `401` com a MSGE-48.
- **Códigos técnicos** (a documentação não tem mensagem para esses casos; os textos são provisórios, até o Samuel documentar): `ERRO_INTERNO` (500), `NAO_ENCONTRADO` (404, rota ou recurso), `REQUISICAO_INVALIDA` (400, por exemplo JSON malformado), `CAMPO_INVALIDO` e `CAMPO_NAO_PERMITIDO` (validação).
- **Os repositories traduzem os erros do banco** (por exemplo, valor repetido) para `ErroDeNegocio`. Um erro do banco que chegue ao filtro sem tradução é tratado como `500`.
- **Validação de entrada**: `ValidationPipe` global (`src/common/validacao.ts`) com `whitelist` e `forbidNonWhitelisted` (propriedade desconhecida é erro), `transform` e `stopAtFirstError` (um erro por campo). O DTO aponta para o **código** da mensagem, e o pipe resolve o texto: `@IsNotEmpty({ message: 'MSGE-01' })`. Mensagens com variável não servem para DTO; saem do service, por `ErroDeNegocio`. Campos numéricos vindos da query string chegam como texto: use `@Type(() => Number)` no DTO. O corpo JSON é estrito (`"50"` não vira número). Nenhum DTO deixa a mensagem padrão do class-validator, que está em inglês: o pipe a troca por `CAMPO_INVALIDO`.
- **Configuração da aplicação** em um lugar só: `configurarApp` (`src/common/configurar-app.ts`), usada pelo `main.ts`. O middleware que abre o contexto da requisição (e gera o `requestId`) é montado ali, antes do leitor de corpo; montado pelo módulo, ele rodaria depois, e um JSON malformado sairia sem `requestId` e sem linha de log.

## Documentação da API (Swagger)

- Interface em `/docs` e contrato em JSON em `/docs/json`, **só fora de produção** (`NODE_ENV` diferente de `production`); em produção as duas respondem `404`. Código em `src/common/documentacao.ts`.
- **Todo controller novo** leva `@ApiTags('nome')`, `@ApiErros()` (descreve uma vez as respostas de erro no formato único) e `@ApiBearerAuth()` quando a rota é autenticada. Respostas de sucesso: `@ApiOkResponse({ type: X })` ou `@ApiCreatedResponse({ type: X })`.
- **Todo campo de DTO** leva `@ApiProperty()` (ou `@ApiPropertyOptional()`), com `minimum`, `maximum` e `type` quando houver regra de validação equivalente, e `type: () => OutroDto` em campo aninhado. É explícito de propósito: o plugin do Swagger para o CLI do Nest **não funciona** em pasta com acento no caminho (no Windows, como `...\Área de Trabalho\...`): ele gera um `import` corrompido (`Á` vira `/u00C1`) e a API compilada não sobe. Para usar o plugin, o repositório precisa estar em um caminho só com ASCII em todas as máquinas da equipe; nesse caso, ligar o plugin em `nest-cli.json` e tirar os `@ApiProperty` repetidos.

## Estrutura

```
src/
├─ main.ts, app.module.ts
├─ config/                 leitura e validação das variáveis de ambiente (RNF-14)
├─ database/               PrismaService e módulo global do banco
├─ generated/              client do Prisma (gerado, fora do git)
├─ common/                 contexto e log da requisição, erros, validação, mensagens e documentação; guards [a criar]
├─ registro-operacao/      registro de operações sensíveis (RNF-11)
└─ <modulo>/               um por área: auth, barbearia, servicos,
                           profissionais, clientes, planos-assinatura [a criar]
```

## Camadas (RNF-13)

Cada módulo de negócio tem `<modulo>.module.ts`, `<modulo>.controller.ts`, `<modulo>.service.ts`, `<modulo>.repository.ts` e a pasta `dto/`.

- **Controller**: recebe a requisição, valida a entrada (DTO com `class-validator`) e aplica o guard de perfil. Não tem regra de negócio.
- **Service**: concentra as regras de negócio (RN-xx), usa as mensagens da documentação e chama o registro de operações nas operações sensíveis.
- **Repository**: única camada que acessa o banco. Não há SQL nem acesso ao banco fora dos repositories.

## Convenções

- Domínio em português, sem acento nos identificadores (`Profissional`, `fimVigencia`, `/profissionais`); vocabulário técnico em inglês (`Controller`, `Service`, `Repository`, `Module`, `Guard`, `Dto`).
- Arquivos em kebab-case; imports relativos terminam em `.js` (projeto ESM).
- Comentário só para explicar, em poucas palavras, o que uma função ou variável faz; nunca cita requisitos, regras de negócio ou tarefas. Uma explicação maior vai para este README, não para o código.
- Nunca há valor sensível no código; a configuração sensível vem de variável de ambiente.
