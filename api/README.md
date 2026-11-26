# API BarberMais

API do sistema de agendamento e gestão de agenda da BarberMais (uma única barbearia). NestJS 12 em Node.js 24 LTS, TypeScript estrito, módulos ESM.

## Como rodar

```bash
cp .env.example .env     # ajuste os valores; o .env não vai para o git
npm install
npm run start:dev        # API em modo desenvolvimento, com recarga
```

## Variáveis de ambiente (RNF-14)

A API valida as variáveis ao subir (`src/config/env.validation.ts`). Todas são obrigatórias e não têm valor padrão: se faltar alguma ou for inválida, a API não inicia e lista quais são. O arquivo `.env` não vai para o git; o modelo é o `.env.example`. Cada tarefa que precisar de uma variável nova a declara em `env.validation.ts` e no `.env.example` e a documenta nesta tabela.

| Variável | Valores | Uso |
|---|---|---|
| `NODE_ENV` | `development`, `production` ou `test` | Ambiente de execução |
| `PORT` | inteiro de 1 a 65535 | Porta HTTP da API |

## Comandos

| Comando | O que faz |
|---|---|
| `npm run build` | Compila para `dist/` |
| `npm run lint` | Verifica o código com o oxlint |
| `npm run format` | Formata com o Prettier |
| `npm run start:dev` | Sobe em modo desenvolvimento |
| `npm run start:prod` | Sobe o build de `dist/` |

Docker, banco de dados e migrations entram nas próximas tarefas (T02 e T03) e serão documentados aqui.

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
