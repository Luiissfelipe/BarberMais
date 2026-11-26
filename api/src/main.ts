import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { criarLogger } from './common/logger.js';
import type { VariaveisAmbiente } from './config/env.validation.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: criarLogger(process.env.NODE_ENV),
  });
  app.enableShutdownHooks();
  const config = app.get<ConfigService<VariaveisAmbiente, true>>(ConfigService);
  const porta = config.get('PORT', { infer: true });
  await app.listen(porta);
  new Logger('Bootstrap').log(`API pronta na porta ${porta}`, { porta });
}
await bootstrap();
