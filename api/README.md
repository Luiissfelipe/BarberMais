# API BarberMais

API do sistema de agendamento e gestão de agenda da BarberMais (uma única barbearia). NestJS 12 em Node.js 24 LTS, TypeScript estrito, módulos ESM.

## Como rodar

```bash
cp .env.example .env     # ajuste os valores; o .env não vai para o git
npm install
npm run start:dev        # API em modo desenvolvimento, com recarga
```

## Docker (RNF-14)

Sobe o PostgreSQL 18 e a API com um único comando, a partir de `api/`:

```bash
cp .env.example .env
docker compose up -d --build
```

- O Compose se chama `barbermais` e tem dois serviços: `postgres` (imagem `postgres:18`) e `api` (imagem construída pelo `Dockerfile`, em duas etapas, rodando como o usuário `node`).
- A API só inicia depois que o banco fica saudável (`pg_isready` por TCP, porque durante a inicialização o servidor temporário do PostgreSQL só escuta no socket local).
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

## Comandos

| Comando | O que faz |
|---|---|
| `npm run build` | Compila para `dist/` |
| `npm run lint` | Verifica o código com o oxlint |
| `npm run format` | Formata com o Prettier |
| `npm run start:dev` | Sobe em modo desenvolvimento |
| `npm run start:prod` | Sobe o build de `dist/` |

A conexão da API com o banco e as migrations entram na próxima etapa e serão documentadas aqui.

## Estrutura

```
src/
├─ main.ts, app.module.ts
├─ config/                 leitura e validação das variáveis de ambiente (RNF-14)
├─ database/               acesso ao banco (módulo global)            [a criar]
├─ common/                 guards, filtros de erro, mensagens          [a criar]
├─ registro-operacao/      registro de operações sensíveis (RNF-11)   [a criar]
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
