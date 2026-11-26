import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { Ambiente } from '../config/env.validation.js';

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
  'nome',
  'telefone',
  'cookie',
  'set-cookie',
  'secret',
  'apiKey',
  'serviceKey',
  'secretKey',
];

export function criarLogger(ambiente: string | undefined): ConsoleLogger {
  return new ConsoleLogger({
    json: ambiente === Ambiente.Production,
    logLevels:
      ambiente === Ambiente.Development
        ? NIVEIS_DESENVOLVIMENTO
        : NIVEIS_PRODUCAO,
    redact: CAMPOS_SENSIVEIS,
  });
}
