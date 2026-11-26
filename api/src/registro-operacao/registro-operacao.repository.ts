import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '../database/prisma.service.js';
import type { Prisma, RegistroOperacao } from '../generated/prisma/client.js';

@Injectable()
export class RegistroOperacaoRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  criar(
    dados: Prisma.RegistroOperacaoUncheckedCreateInput,
  ): Promise<RegistroOperacao> {
    return this.txHost.tx.registroOperacao.create({ data: dados });
  }

  listarPorItem(idItem: string): Promise<RegistroOperacao[]> {
    return this.txHost.tx.registroOperacao.findMany({
      where: { idItem },
      orderBy: { dataHora: 'asc' },
    });
  }
}
