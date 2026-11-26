import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import type { ContextoRequisicao } from '../contexto-requisicao.js';
import type { EntradaMensagem } from '../mensagens/entrada-mensagem.js';
import { Mensagens } from '../mensagens/mensagens.js';
import { MensagensTecnicas } from '../mensagens/mensagens-tecnicas.js';
import { ErroDeNegocio } from './erro-de-negocio.js';
import { ErroDeValidacao } from './erro-de-validacao.js';
import type { RespostaErroDto } from './resposta-erro.dto.js';

const QUADRO_DE_PILHA = /^\s+at /;

function extrairStatus(excecao: unknown): number | undefined {
  if (excecao instanceof HttpException) {
    return excecao.getStatus();
  }
  if (typeof excecao === 'object' && excecao !== null) {
    const { expose, status, statusCode } = excecao as Record<string, unknown>;
    const candidato = typeof status === 'number' ? status : statusCode;
    if (
      expose === true &&
      typeof candidato === 'number' &&
      candidato >= 400 &&
      candidato < 600
    ) {
      return candidato;
    }
  }
  return undefined;
}

function mensagemPorStatus(status: number | undefined): EntradaMensagem {
  if (status === 401) return Mensagens.MSGE_48;
  if (status === 403) return Mensagens.MSGE_47;
  if (status === 404) return MensagensTecnicas.NAO_ENCONTRADO;
  if (status !== undefined && status >= 400 && status < 500) {
    return { ...MensagensTecnicas.REQUISICAO_INVALIDA, status };
  }
  if (status !== undefined && status >= 500) {
    return { ...MensagensTecnicas.ERRO_INTERNO, status };
  }
  return MensagensTecnicas.ERRO_INTERNO;
}

function descrever(excecao: unknown): { resumo: string; pilha?: string } {
  if (!(excecao instanceof Error)) {
    return { resumo: 'valor lançado que não é um Error' };
  }
  const codigo = (excecao as { code?: unknown }).code;
  const pilha = (excecao.stack ?? '')
    .split('\n')
    .filter((linha) => QUADRO_DE_PILHA.test(linha))
    .join('\n');
  return {
    resumo:
      typeof codigo === 'string' ? `${excecao.name} ${codigo}` : excecao.name,
    pilha,
  };
}

@Catch()
export class FiltroExcecoes implements ExceptionFilter {
  private readonly logger = new Logger(FiltroExcecoes.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly cls: ClsService<ContextoRequisicao>,
  ) {}

  catch(excecao: unknown, host: ArgumentsHost): void {
    const contexto = host.switchToHttp();
    const requisicao = contexto.getRequest<Request>();
    const requestId = this.cls.isActive() ? this.cls.getId() : undefined;
    const resposta = this.montarResposta(excecao, requestId);

    if (resposta.statusCode >= 500) {
      this.registrarFalha(excecao, requisicao, requestId);
    }

    const adaptador = this.httpAdapterHost.httpAdapter;
    const respostaHttp = contexto.getResponse();
    if (adaptador.isHeadersSent(respostaHttp)) {
      adaptador.end(respostaHttp);
      return;
    }
    adaptador.reply(respostaHttp, resposta, resposta.statusCode);
  }

  private montarResposta(
    excecao: unknown,
    requestId: string | undefined,
  ): RespostaErroDto {
    if (excecao instanceof ErroDeValidacao) {
      const [primeiro] = excecao.erros;
      return {
        statusCode: excecao.getStatus(),
        codigo:
          primeiro?.codigo ?? MensagensTecnicas.REQUISICAO_INVALIDA.codigo,
        message:
          primeiro?.message ?? MensagensTecnicas.REQUISICAO_INVALIDA.texto,
        requestId,
        erros: excecao.erros,
      };
    }

    const mensagem =
      excecao instanceof ErroDeNegocio
        ? excecao.mensagem
        : mensagemPorStatus(extrairStatus(excecao));

    return {
      statusCode: mensagem.status,
      codigo: mensagem.codigo,
      message: mensagem.texto,
      requestId,
    };
  }

  private registrarFalha(
    excecao: unknown,
    requisicao: Request,
    requestId: string | undefined,
  ): void {
    const caminho = requisicao.originalUrl.split('?')[0];
    const { resumo, pilha } = descrever(excecao);
    this.logger.error(
      `Falha em ${requisicao.method} ${caminho}: ${resumo}`,
      pilha,
      { requestId },
    );
  }
}
