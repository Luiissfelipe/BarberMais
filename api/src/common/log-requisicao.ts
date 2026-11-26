import { Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ClsService } from 'nestjs-cls';
import type { ContextoRequisicao } from './contexto-requisicao.js';

const logger = new Logger('HTTP');

export function registrarRequisicao(
  cls: ClsService<ContextoRequisicao>,
  req: Request,
  res: Response,
): void {
  const inicio = process.hrtime.bigint();
  const contexto = cls.get();
  const requestId = cls.getId();
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const duracaoMs =
      Math.round(Number(process.hrtime.bigint() - inicio) / 1e4) / 100;
    const status = res.statusCode;
    const caminho = req.originalUrl.split('?')[0];
    const dados = {
      requestId,
      metodo: req.method,
      caminho,
      status,
      duracaoMs,
      ...(contexto.usuarioId && { usuarioId: contexto.usuarioId }),
    };
    const mensagem = `${req.method} ${caminho} ${status} ${duracaoMs}ms`;

    if (status >= 500) {
      logger.error(mensagem, dados);
    } else if (status >= 400) {
      logger.warn(mensagem, dados);
    } else {
      logger.log(mensagem, dados);
    }
  });
}
