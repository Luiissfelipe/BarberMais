import { Inject, Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import type { TransacaoHost } from '../database/transacao-host.js';
import type { RegistroOperacao } from '../generated/prisma/client.js';
import type { Entidade, Operacao } from './operacao.js';

export interface NovoRegistroOperacao {
  operacao: Operacao;
  entidade: Entidade;
  idItem: string;
  valorAnterior: string | null;
  responsavelId: string | null;
}

@Injectable()
export class RegistroOperacaoRepository {
  constructor(
    @Inject(TransactionHost) private readonly txHost: TransacaoHost,
  ) {}

  criar(dados: NovoRegistroOperacao): Promise<RegistroOperacao> {
    return this.txHost.tx.registroOperacao.create({
      data: {
        operacao: dados.operacao,
        entidade: dados.entidade,
        idItem: dados.idItem,
        valorAnterior: dados.valorAnterior,
        responsavelId: dados.responsavelId,
      },
    });
  }
}
