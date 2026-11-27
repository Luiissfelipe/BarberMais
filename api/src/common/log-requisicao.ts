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

  const medirDuracaoMs = () =>
    Math.round(Number(process.hrtime.bigint() - inicio) / 1e4) / 100;
  const identificar = () => ({
    requestId,
    metodo: req.method,
    caminho: req.originalUrl.split('?')[0],
    ...(contexto.usuarioId && { usuarioId: contexto.usuarioId }),
  });

  res.on('finish', () => {
    const duracaoMs = medirDuracaoMs();
    const status = res.statusCode;
    const dados = { ...identificar(), status, duracaoMs };
    const mensagem = `${req.method} ${dados.caminho} ${status} ${duracaoMs}ms`;

    if (status >= 500) {
      logger.error(mensagem, dados);
    } else if (status >= 400) {
      logger.warn(mensagem, dados);
    } else {
      logger.log(mensagem, dados);
    }
  });

  res.on('close', () => {
    if (res.writableFinished) {
      return;
    }
    const duracaoMs = medirDuracaoMs();
    const dados = { ...identificar(), abortada: true, duracaoMs };
    logger.warn(
      `${req.method} ${dados.caminho} conexão encerrada antes da resposta ${duracaoMs}ms`,
      dados,
    );
  });
}
