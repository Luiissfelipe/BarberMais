import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configurarApp } from './common/configurar-app.js';
import { configurarDocumentacao } from './common/documentacao.js';
import { criarLogger } from './common/logger.js';
import { Ambiente } from './config/env.validation.js';
import type { VariaveisAmbiente } from './config/env.validation.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: criarLogger(process.env.NODE_ENV),
  });
  configurarApp(app);
  const config = app.get<ConfigService<VariaveisAmbiente, true>>(ConfigService);
  if (config.get('NODE_ENV', { infer: true }) === Ambiente.Development) {
    configurarDocumentacao(app);
  }
  const porta = config.get('PORT', { infer: true });
  await app.listen(porta);
  new Logger('Bootstrap').log(`API pronta na porta ${porta}`, { porta });
}

function registrarFalhaDeSubida(erro: unknown): void {
  const nome =
    erro instanceof Error ? erro.name : 'valor lançado que não é um Error';
  const codigo = (erro as { code?: unknown } | null)?.code;
  new Logger('Bootstrap').fatal(
    `Falha ao iniciar a API: ${typeof codigo === 'string' ? `${nome} ${codigo}` : nome}`,
  );
}

try {
  await bootstrap();
} catch (erro) {
  registrarFalhaDeSubida(erro);
  process.stderr.write('', () =>
    process.stdout.write('', () => process.exit(1)),
  );
}
