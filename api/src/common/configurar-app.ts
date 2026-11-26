import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { ClsMiddleware, ClsService } from 'nestjs-cls';
import type { ContextoRequisicao } from './contexto-requisicao.js';
import { registrarRequisicao } from './log-requisicao.js';
import { criarPipeValidacao } from './validacao.js';

export function configurarApp(app: INestApplication): void {
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
