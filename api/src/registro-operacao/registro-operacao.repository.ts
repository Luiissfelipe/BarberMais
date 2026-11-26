import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '../database/prisma.service.js';
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
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
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
