import { randomUUID } from 'node:crypto';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ClsMiddleware, ClsService } from 'nestjs-cls';
import type { ContextoRequisicao } from './contexto-requisicao.js';
import { registrarRequisicao } from './log-requisicao.js';
import { criarPipeValidacao } from './validacao.js';

export function configurarApp(app: NestExpressApplication): void {
  app.disable('x-powered-by');
  app.use(
    new ClsMiddleware({
      generateId: true,
      idGenerator: () => randomUUID(),
      setup: (cls, req, res) =>
        registrarRequisicao(cls as ClsService<ContextoRequisicao>, req, res),
    }).use,
  );
  app.useGlobalPipes(criarPipeValidacao());
  app.enableShutdownHooks();
}
