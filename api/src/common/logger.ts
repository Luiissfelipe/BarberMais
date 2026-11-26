import { ConsoleLogger, LogLevel } from '@nestjs/common';

const NIVEIS_PRODUCAO: LogLevel[] = ['log', 'warn', 'error', 'fatal'];
const NIVEIS_DESENVOLVIMENTO: LogLevel[] = [
  ...NIVEIS_PRODUCAO,
  'debug',
  'verbose',
];

const CAMPOS_SENSIVEIS = [
  'password',
  'senha',
  'senhaAtual',
  'novaSenha',
  'confirmacaoSenha',
  'authorization',
  'token',
  'accessToken',
  'refreshToken',
  'email',
];

export function criarLogger(ambiente: string | undefined): ConsoleLogger {
  const producao = ambiente === 'production';
  return new ConsoleLogger({
    json: producao,
    logLevels: producao ? NIVEIS_PRODUCAO : NIVEIS_DESENVOLVIMENTO,
    redact: CAMPOS_SENSIVEIS,
  });
}
